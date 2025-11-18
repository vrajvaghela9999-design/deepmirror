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
  createdAt?: string;
};

// Small helper to format timestamps nicely
function formatTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

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
      createdAt: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // -------- Supabase: load current user --------
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!error && data?.user) {
        setUser({
          id: data.user.id,
          email: (data.user.email as string | null) ?? null,
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
          email: (session.user.email as string | null) ?? null,
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

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    // Optimistically add user message
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setIsThinking(true);

    try {
      const cleanMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: cleanMessages,
          age,
          userEmail: user?.email ?? null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      const assistantContent: string =
        data.reply ??
        "Something went wrong while generating a reply. You can try again in a moment.";

      const assistantMessage: Message = {
        role: "assistant",
        content: assistantContent,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I ran into an error while generating a reply. You can try again in a moment.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
      setIsThinking(false);
    }
  };

  // -------- New session (clear chat) --------
  const handleNewSession = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "New session started.\n\n" +
          "You can share what’s on your mind right now, and we’ll explore it together step by step.",
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  // -------- Log out --------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ------------- UI -------------
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1e293b 0, #020617 55%, #000 100%)",
        color: "white",
        fontFamily:
          "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Top bar */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                fontSize: "12px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.7,
              }}
            >
              DeepMirror
            </div>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>
              Experimental reflection AI
            </div>
            <div style={{ fontSize: "12px", opacity: 0.6 }}>
              Educational use only — not crisis or medical help.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
              fontSize: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ opacity: 0.6 }}>Age:</span>
              <input
                type="number"
                min={10}
                max={100}
                placeholder="e.g. 18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                style={{
                  width: "72px",
                  padding: "4px 6px",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.7)",
                  background: "rgba(15,23,42,0.9)",
                  color: "white",
                  fontSize: "12px",
                }}
              />
            </div>

            <div style={{ opacity: 0.7 }}>
              {loadingUser
                ? "Checking session..."
                : user
                ? `Signed in as ${user.email ?? "unknown"}`
                : "Guest mode — not signed in"}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={handleNewSession}
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.7)",
                  background: "rgba(15,23,42,0.9)",
                  color: "white",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                New session
              </button>

              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, #fb7185 0%, #ea580c 100%)",
                    color: "white",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Log out
                </button>
              ) : (
                <Link
                  href="/login"
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    color: "white",
                    fontSize: "12px",
                    textDecoration: "none",
                  }}
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Session title */}
        <div
          style={{
            fontSize: "13px",
            opacity: 0.7,
            marginTop: "4px",
          }}
        >
          Current session – DeepMirror helps you reflect; it does not replace a
          therapist or doctor.
        </div>

        {/* Chat area */}
        <section
          style={{
            flex: 1,
            minHeight: "420px",
            maxHeight: "60vh",
            overflowY: "auto",
            marginTop: "8px",
            padding: "18px 14px",
            borderRadius: "20px",
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(15,23,42,0.96))",
            boxShadow: "0 18px 45px rgba(0,0,0,0.55)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "10px 13px",
                    borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: isUser
                      ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                      : "rgba(15,23,42,0.95)",
                    color: "white",
                    fontSize: "14px",
                    lineHeight: 1.55,
                    boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
                  }}
                >
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                  {m.createdAt && (
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "11px",
                        opacity: 0.55,
                        textAlign: isUser ? "right" : "left",
                      }}
                    >
                      {formatTime(m.createdAt)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isThinking && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  maxWidth: "55%",
                  padding: "8px 11px",
                  borderRadius: "18px 18px 18px 4px",
                  background: "rgba(15,23,42,0.85)",
                  color: "white",
                  fontSize: "12px",
                  opacity: 0.8,
                }}
              >
                DeepMirror is thinking…
              </div>
            </div>
          )}
        </section>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: "14px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
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
              padding: "12px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.8)",
              background: "rgba(15,23,42,0.95)",
              color: "white",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            style={{
              padding: "10px 20px",
              borderRadius: "999px",
              border: "none",
              cursor: isSending || !input.trim() ? "default" : "pointer",
              opacity: isSending || !input.trim() ? 0.6 : 1,
              background:
                "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              boxShadow: "0 12px 30px rgba(59,130,246,0.5)",
              whiteSpace: "nowrap",
            }}
          >
            {isSending ? "Sending…" : "Send"}
          </button>
        </form>

        <div
          style={{
            marginTop: "6px",
            fontSize: "11px",
            opacity: 0.6,
            textAlign: "right",
          }}
        >
          DeepMirror is experimental and for reflection only. For crises or
          medical issues, contact local professionals or emergency services.
        </div>
      </div>
    </main>
  );
}
