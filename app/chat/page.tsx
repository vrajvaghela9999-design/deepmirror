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
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

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

  // -------- Supabase: load current user --------
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!error && data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
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
          email: session.user.email,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // -------- Handle sending a message --------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!age.trim()) {
      alert("Please enter your age before chatting.");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsSending(true);

    try {
      // Adjust the body shape if your /api/chat expects something different
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          age,
          messages: newMessages,
          userId: user?.id ?? null,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();
      // Expecting { reply: string } from your API
      const assistantText: string = data.reply ?? data.content ?? "";

      const assistantMessage: Message = {
        role: "assistant",
        content:
          assistantText ||
          "I’m having trouble responding right now. Can you try again in a moment?",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong reaching my brain. Please check your connection or try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // -------- Simple reset / new session --------
  const handleNewSession = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "New session started.\n\nRemind me of your age and what you’d like to talk about today.",
      },
    ]);
    setInput("");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617",
        color: "#e5e7eb",
        padding: "16px",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* Top bar: brand + user status */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            marginBottom: "4px",
          }}
        >
          <div>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "#e5e7eb",
                fontWeight: 600,
              }}
            >
              DeepMirror
            </Link>{" "}
            <span style={{ opacity: 0.6 }}>· experimental reflection AI</span>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ opacity: 0.85 }}>
              {loadingUser && "Checking session…"}
              {!loadingUser && user && (
                <>
                  Signed in as{" "}
                  <span style={{ fontWeight: 600 }}>
                    {user.email ?? "unknown"}
                  </span>
                </>
              )}
              {!loadingUser && !user && (
                <>
                  Guest mode —{" "}
                  <Link
                    href="/login"
                    style={{ color: "#a5b4fc", textDecoration: "none" }}
                  >
                    sign in
                  </Link>
                </>
              )}
            </div>

            {user && (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setUser(null);
                }}
                style={{
                  borderRadius: 999,
                  padding: "4px 10px",
                  border: "1px solid rgba(148,163,184,0.6)",
                  background: "transparent",
                  color: "#e5e7eb",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                Log out
              </button>
            )}
          </div>
        </header>

        {/* Age + new session controls */}
        <section
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            fontSize: "13px",
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ opacity: 0.8 }}>Age:</span>
            <input
              type="number"
              min={10}
              max={99}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              style={{
                width: "64px",
                backgroundColor: "#020617",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.7)",
                color: "#e5e7eb",
                padding: "4px 8px",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </label>

          <button
            type="button"
            onClick={handleNewSession}
            style={{
              borderRadius: 999,
              padding: "4px 12px",
              border: "1px solid rgba(148,163,184,0.6)",
              background: "transparent",
              color: "#e5e7eb",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            New session
          </button>

          <span style={{ fontSize: "11px", opacity: 0.65 }}>
            DeepMirror is for reflection and learning, not crisis or emergency
            help.
          </span>
        </section>

        {/* Chat window */}
        <section
          style={{
            flex: 1,
            minHeight: "60vh",
            borderRadius: "16px",
            border: "1px solid rgba(51,65,85,1)",
            background:
              "radial-gradient(circle at top, rgba(15,23,42,1), rgba(2,6,23,1))",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "4px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  padding: "8px 12px",
                  borderRadius:
                    m.role === "user"
                      ? "14px 14px 2px 14px"
                      : "14px 14px 14px 2px",
                  backgroundColor:
                    m.role === "user" ? "#4f46e5" : "rgba(15,23,42,0.95)",
                  color: m.role === "user" ? "#e5e7eb" : "#e5e7eb",
                  fontSize: "13px",
                  whiteSpace: "pre-wrap",
                  border:
                    m.role === "user"
                      ? "1px solid rgba(129,140,248,0.9)"
                      : "1px solid rgba(51,65,85,1)",
                }}
              >
                {m.content}
              </div>
            ))}
            {isSending && (
              <div
                style={{
                  alignSelf: "flex-start",
                  fontSize: "12px",
                  opacity: 0.7,
                }}
              >
                DeepMirror is thinking…
              </div>
            )}
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "8px",
              alignItems: "center",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell DeepMirror what’s on your mind…"
              rows={2}
              style={{
                flex: 1,
                resize: "none",
                borderRadius: "12px",
                border: "1px solid rgba(71,85,105,1)",
                backgroundColor: "rgba(15,23,42,0.9)",
                color: "#e5e7eb",
                padding: "8px 10px",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              style={{
                borderRadius: 999,
                padding: "8px 16px",
                border: "none",
                background:
                  isSending || !input.trim()
                    ? "rgba(148,163,184,0.4)"
                    : "linear-gradient(135deg, #6366f1, #22c55e)",
                color: "#020617",
                fontSize: "13px",
                fontWeight: 600,
                cursor:
                  isSending || !input.trim() ? "not-allowed" : "pointer",
              }}
            >
              {isSending ? "Sending…" : "Send"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
