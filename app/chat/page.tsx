"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type SessionUser = {
  id: string;
  email: string | null;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  // ---------- Auth / user ----------
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ---------- Conversation state ----------
  const [age, setAge] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m DeepMirror. I’m an AI for reflection and self-understanding, not a doctor or therapist.\n\n" +
        "You can tell me what’s going on, and I’ll help you untangle it with questions and gentle structure.\n\n" +
        "To start: how old are you, and what’s the main thing on your mind today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // ---------- New session button ----------
  function resetConversation() {
    setAge("");
    setInput("");
    setMessages([
      {
        role: "assistant",
        content:
          "Hi, I’m DeepMirror. I’m an AI for reflection and self-understanding, not a doctor or therapist.\n\n" +
          "You can tell me what’s going on, and I’ll help you untangle it with questions and gentle structure.\n\n" +
          "To start: how old are you, and what’s the main thing on your mind today?",
      },
    ]);
  }

  // ---------- Supabase: load current user ----------
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!error && data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? null,
        });
      } else {
        setUser(null);
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

  // ---------- Handle sending a message ----------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsSending(true);

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: input.trim() },
    ];

    // Show user message immediately
    setMessages(newMessages);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          age: age || null,
          userEmail: user?.email ?? null,
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const data = await res.json();
      const reply: string =
        data.reply ?? "Sorry, something went wrong while generating a reply.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong while generating a reply. You can try again in a moment.",
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
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "960px" }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            fontSize: "14px",
            opacity: 0.9,
          }}
        >
          <div>
            <div style={{ fontSize: "13px", letterSpacing: "0.12em" }}>
              DEEPMIRROR
            </div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>
              Experimental reflection AI — educational use only
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "12px", opacity: 0.7 }}>
              {loadingUser
                ? "Checking sign-in..."
                : user
                ? `Signed in as ${user.email ?? "account"}`
                : "Guest mode — sign in for saved sessions (coming soon)"}
            </span>
            <Link
              href={user ? "/login?logout=1" : "/login"}
              style={{
                fontSize: "12px",
                padding: "6px 10px",
                borderRadius: "999px",
                border: "1px solid rgba(148, 163, 184, 0.6)",
                textDecoration: "none",
                color: "white",
              }}
            >
              {user ? "Log out" : "Sign in"}
            </Link>
          </div>
        </header>

        {/* Top controls */}
        <section
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
            gap: "12px",
          }}
        >
          <label style={{ fontSize: "13px" }}>
            Age:
            <input
              type="number"
              placeholder="e.g. 18"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              style={{
                marginLeft: "8px",
                width: "80px",
                padding: "4px 8px",
                borderRadius: "999px",
                border: "1px solid rgba(148, 163, 184, 0.6)",
                background: "rgba(15,23,42,0.8)",
                color: "white",
                fontSize: "13px",
              }}
            />
            <span style={{ marginLeft: "6px", fontSize: "11px", opacity: 0.6 }}>
              DeepMirror only uses this to adjust tone.
            </span>
          </label>

          <button
            type="button"
            onClick={resetConversation}
            style={{
              fontSize: "12px",
              padding: "6px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(148, 163, 184, 0.6)",
              background:
                "radial-gradient(circle at top left, #22c55e 0, #16a34a 45%, #0f766e 100%)",
              color: "white",
              cursor: "pointer",
            }}
          >
            New session
          </button>
        </section>

        {/* Chat card */}
        <section
          style={{
            borderRadius: "24px",
            padding: "20px 20px 80px",
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.85))",
            boxShadow: "0 24px 80px rgba(15,23,42,0.9)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Messages */}
          <div
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
              paddingRight: "8px",
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: "12px",
                  display: "flex",
                  justifyContent:
                    m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius:
                      m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background:
                      m.role === "user"
                        ? "linear-gradient(135deg, #22c55e, #16a34a)"
                        : "rgba(15,23,42,0.9)",
                    color: m.role === "user" ? "#020617" : "white",
                    fontSize: "14px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: "12px 20px 18px",
              background:
                "linear-gradient(to top, rgba(15,23,42,1), rgba(15,23,42,0))",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="text"
                placeholder="Tell DeepMirror what’s on your mind..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isSending}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "999px",
                  border: "1px solid rgba(148, 163, 184, 0.7)",
                  background: "rgba(15,23,42,0.9)",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                style={{
                  padding: "10px 18px",
                  borderRadius: "999px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #22c55e, #16a34a, #0ea5e9)",
                  color: "#020617",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: isSending || !input.trim() ? "not-allowed" : "pointer",
                  opacity: isSending || !input.trim() ? 0.6 : 1,
                  transition: "transform 0.08s ease-out",
                }}
              >
                {isSending ? "Thinking..." : "Send"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
