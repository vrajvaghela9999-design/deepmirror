"use client";
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type SessionUser = {
  id: string;
  email: string | null;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content:
      "Hi, I’m DeepMirror. I’m an AI for reflection and self-understanding, not a doctor or therapist.\n\n" +
      "You can tell me what’s going on, and I’ll help you untangle it with questions and gentle structure.\n\n" +
      "To start: how old are you, and what’s the main thing on your mind today?",
  },
];

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [age, setAge] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);

  // ---------- Supabase: load current user ----------
  useEffect(() => {
    const getUser = async () => {
      setLoadingUser(true);
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        setUser(null);
      } else {
        setUser({
          id: data.user.id,
          email: data.user.email ?? null,
        });
      }

      setLoadingUser(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? null,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ---------- Load existing conversation messages from Supabase ----------
  useEffect(() => {
    const loadConversation = async () => {
      const urlConversationId = searchParams.get("conversationId");

      if (!urlConversationId || !user) return;

      setLoadingConversation(true);

      const { data, error } = await supabase
        .from("messages")
        .select("role, content, created_at")
        .eq("conversation_id", urlConversationId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.warn(
          "Could not load messages (falling back to default):",
          error
        );
        setMessages(INITIAL_MESSAGES);
        setLoadingConversation(false);
        return;
      }

      if (data && data.length > 0) {
        const formatted: Message[] = data.map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        }));

        setMessages(formatted);
        setConversationId(urlConversationId);
      } else {
        // No messages yet for this conversation – show greeting
        setMessages(INITIAL_MESSAGES);
      }

      setLoadingConversation(false);
    };

    loadConversation();
  }, [user, searchParams]);

  // ---------- Start a new session ----------
  const handleNewSession = () => {
    setConversationId(null);
    setMessages(INITIAL_MESSAGES);
    router.push("/chat");
  };

  // ---------- Handle sending a message ----------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const trimmedInput = input.trim();

    const userMessage: Message = {
      role: "user",
      content: trimmedInput,
    };

    const optimisticMessages = [...messages, userMessage];

    setMessages(optimisticMessages);
    setInput("");
    setIsSending(true);

    try {
      // 1) Call our /api/chat route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: optimisticMessages,
          age,
          userEmail: user?.email ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API returned ${response.status}`);
      }

      const data = await response.json();
      const assistantText: string =
        (data.reply as string | undefined)?.trim() ||
        "Something went wrong while generating a reply. Please try again.";

      const assistantMessage: Message = {
        role: "assistant",
        content: assistantText,
      };

      const newMessages = [...optimisticMessages, assistantMessage];
      setMessages(newMessages);

      // 2) Save conversation + messages in Supabase if the user is logged in
      if (user) {
        try {
          let activeConversationId = conversationId;

          // Create a conversation row if we don't have one yet
          if (!activeConversationId) {
            const { data: newConv, error: convError } = await supabase
              .from("conversations")
              .insert({
                user_id: user.id,
                title: trimmedInput.slice(0, 80) || "DeepMirror session",
              })
              .select("id")
              .single();

            if (convError || !newConv) {
              console.warn("Error creating conversation:", convError);
            } else {
              activeConversationId = newConv.id;
              setConversationId(activeConversationId);
            }
          }

          // Insert user + assistant messages into the messages table
          if (activeConversationId) {
            const { error: insertError } = await supabase
              .from("messages")
              .insert([
                {
                  conversation_id: activeConversationId,
                  user_id: user.id,
                  role: "user",
                  content: trimmedInput,
                },
                {
                  conversation_id: activeConversationId,
                  user_id: user.id,
                  role: "assistant",
                  content: assistantText,
                },
              ]);

            if (insertError) {
              // Use warn so Next.js dev overlay doesn’t scream at us
              console.warn("Error saving messages:", insertError);
            }
          }
        } catch (err) {
          console.warn("Unexpected error while saving messages:", err);
        }
      }
    } catch (err) {
      console.error("Error talking to DeepMirror:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong on my side while generating a reply. You can try again in a moment.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // ---------- UI ----------
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 16px",
        background:
          "radial-gradient(circle at top, #1e293b 0, #020617 55%, #000 100%)",
        color: "white",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "860px" }}>
        {/* Top bar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "16px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <Link
              href="/"
              style={{
                fontSize: "13px",
                opacity: 0.7,
                textDecoration: "none",
                color: "#e5e7eb",
              }}
            >
              ← Back to home
            </Link>
          </div>

          <button
            onClick={handleNewSession}
            style={{
              fontSize: "13px",
              padding: "6px 12px",
              borderRadius: "999px",
              border: "1px solid rgba(148, 163, 184, 0.6)",
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            New session
          </button>
        </header>

        {/* Header + meta */}
        <section
          style={{
            borderRadius: "18px",
            padding: "24px 20px",
            border: "1px solid rgba(148, 163, 184, 0.35)",
            background:
              "radial-gradient(circle at top left, rgba(56,189,248,0.14), transparent 55%)",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              opacity: 0.7,
              marginBottom: "6px",
            }}
          >
            DEEPMIRROR
          </div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 600,
              marginBottom: "6px",
            }}
          >
            Experimental reflection AI — educational use only
          </div>
          <div
            style={{
              fontSize: "13px",
              opacity: 0.75,
            }}
          >
            Signed in as{" "}
            <span style={{ fontWeight: 500 }}>
              {loadingUser
                ? "loading..."
                : user?.email ?? "Guest (not signed in)"}
            </span>
          </div>

          {/* Age field */}
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
            }}
          >
            <span style={{ opacity: 0.8 }}>Age:</span>
            <input
              type="text"
              placeholder="e.g. 18"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              style={{
                width: "80px",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.7)",
                background: "rgba(15,23,42,0.8)",
                color: "white",
                fontSize: "13px",
                padding: "4px 10px",
                outline: "none",
              }}
            />
            <span style={{ opacity: 0.6, fontSize: "12px" }}>
              DeepMirror only uses this to adjust tone.
            </span>
          </div>
        </section>

        {/* Chat card */}
        <section
          style={{
            borderRadius: "18px",
            padding: "18px 20px 16px",
            border: "1px solid rgba(148, 163, 184, 0.4)",
            background:
              "radial-gradient(circle at top left, rgba(96,165,250,0.18), transparent 60%)",
            display: "flex",
            flexDirection: "column",
            height: "60vh",
            maxHeight: "560px",
          }}
        >
          {/* Messages area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "4px",
              marginBottom: "12px",
            }}
          >
            {loadingConversation ? (
              <div
                style={{
                  fontSize: "13px",
                  opacity: 0.7,
                  textAlign: "center",
                  marginTop: "16px",
                }}
              >
                Loading your conversation…
              </div>
            ) : (
              messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "82%",
                        padding: "10px 12px",
                        borderRadius: "14px",
                        fontSize: "14px",
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                        background: isUser
                          ? "linear-gradient(135deg,#22c55e,#4ade80)"
                          : "rgba(15,23,42,0.85)",
                        color: isUser ? "#052e16" : "#e5e7eb",
                        boxShadow: isUser
                          ? "0 0 0 1px rgba(34,197,94,0.4)"
                          : "0 0 0 1px rgba(148,163,184,0.35)",
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              marginTop: "4px",
            }}
          >
            <input
              type="text"
              placeholder="Tell DeepMirror what’s on your mind…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              style={{
                flex: 1,
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.7)",
                background: "rgba(15,23,42,0.9)",
                color: "white",
                fontSize: "14px",
                padding: "10px 14px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              style={{
                borderRadius: "999px",
                border: "none",
                padding: "9px 18px",
                fontSize: "14px",
                fontWeight: 500,
                background: isSending
                  ? "rgba(148,163,184,0.7)"
                  : "linear-gradient(135deg,#22c55e,#4ade80)",
                color: isSending ? "#111827" : "#052e16",
                cursor: isSending ? "default" : "pointer",
              }}
            >
              {isSending ? "Thinking…" : "Send"}
            </button>
          </form>
        </section>

        {/* Footer */}
        <footer
          style={{
            marginTop: "10px",
            fontSize: "11px",
            opacity: 0.55,
            textAlign: "center",
          }}
        >
          Built by Vraj Vaghela · DeepMirror (experimental) · Educational
          support only, not a substitute for a licensed professional.
        </footer>
      </div>
    </main>
  );
}
