"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type SessionUser = {
  id: string;
  email: string | null;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

function createGreetingMessage(): Message {
  return {
    id: "greeting-" + Date.now(),
    role: "assistant",
    content:
      "Hi, I’m DeepMirror. I’m an AI for reflection and self-understanding, not a doctor or therapist.\n\n" +
      "You can tell me what’s going on, and I’ll help you untangle it with questions and gentle structure.\n\n" +
      "To start: how old are you, and what’s the main thing on your mind today?",
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function ChatPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [age, setAge] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([createGreetingMessage()]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ---------- Start a new session ----------
  const handleNewSession = () => {
    setMessages([createGreetingMessage()]);
    setInput("");
  };

  // ---------- Handle sending a message ----------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: input.trim(),
      createdAt: now,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: age || null,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userEmail: user?.email ?? null,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();

      const assistantMessage: Message = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: "error-" + Date.now(),
        role: "assistant",
        content:
          "Something went wrong while generating a reply. You can try again in a moment.",
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // ---------- UI ----------
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 16px",
        background:
          "radial-gradient(circle at top, #1e2b93 0, #020617 55%, #000 100%)",
        color: "white",
        fontFamily:
          "-apple-system, system-ui, BlinkMacSystemFont, Segoe UI, sans-serif",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "980px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Link
              href="/"
              style={{
                fontSize: "14px",
                opacity: 0.7,
                textDecoration: "none",
                color: "#e5e7eb",
              }}
            >
              ← Back to home
            </Link>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>DEEPMIRROR</div>
            <div
              style={{
                fontSize: "12px",
                opacity: 0.7,
              }}
            >
              Experimental reflection AI — educational use only
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ opacity: 0.7 }}>Age:</span>
              <input
                type="number"
                min={10}
                max={99}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 18"
                style={{
                  width: "56px",
                  padding: "4px 6px",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.6)",
                  backgroundColor: "rgba(15,23,42,0.9)",
                  color: "white",
                  fontSize: "12px",
                  textAlign: "center",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {loadingUser ? (
                <span style={{ opacity: 0.7 }}>Checking session…</span>
              ) : user ? (
                <>
                  <span style={{ opacity: 0.7 }}>
                    Signed in as {user.email ?? "unknown"}
                  </span>
                  <button
                    onClick={handleLogout}
                    style={{
                      borderRadius: "999px",
                      border: "1px solid rgba(148,163,184,0.6)",
                      background: "transparent",
                      padding: "4px 10px",
                      fontSize: "12px",
                      color: "#e5e7eb",
                      cursor: "pointer",
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  style={{
                    borderRadius: "999px",
                    border: "1px solid rgba(148,163,184,0.6)",
                    padding: "4px 10px",
                    fontSize: "12px",
                    color: "#e5e7eb",
                    textDecoration: "none",
                  }}
                >
                  Sign in
                </Link>
              )}

              <button
                onClick={handleNewSession}
                style={{
                  borderRadius: "999px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #22c55e, #4ade80, #a3e635)",
                  padding: "4px 12px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#022c22",
                  cursor: "pointer",
                }}
              >
                New session
              </button>
            </div>
          </div>
        </header>

        {/* Chat card */}
        <section
          style={{
            flex: 1,
            borderRadius: "18px",
            padding: "16px 14px 12px 14px",
            background:
              "radial-gradient(circle at top left, rgba(15,23,42,0.95), rgba(15,23,42,0.98))",
            boxShadow: "0 24px 60px rgba(15,23,42,0.75)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            maxHeight: "72vh",
          }}
        >
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "4px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "78%",
                      borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      padding: "10px 12px",
                      fontSize: "14px",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                      backgroundColor: isUser
                        ? "rgba(34,197,94,0.18)"
                        : "rgba(15,23,42,0.95)",
                      border: isUser
                        ? "1px solid rgba(74,222,128,0.7)"
                        : "1px solid rgba(51,65,85,0.9)",
                      color: isUser ? "#e5ffe9" : "#e5e7eb",
                      boxShadow: isUser
                        ? "0 10px 30px rgba(22,163,74,0.35)"
                        : "0 10px 30px rgba(15,23,42,0.85)",
                    }}
                  >
                    <div style={{ marginBottom: "4px", opacity: 0.6, fontSize: "11px" }}>
                      {isUser ? "You" : "DeepMirror"}
                    </div>
                    <div>{m.content}</div>
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "10px",
                        opacity: 0.55,
                        textAlign: "right",
                      }}
                    >
                      {m.createdAt}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isSending && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    borderRadius: "16px 16px 16px 4px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    backgroundColor: "rgba(15,23,42,0.9)",
                    border: "1px solid rgba(51,65,85,0.9)",
                    color: "#e5e7eb",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>DeepMirror is thinking</span>
                  <span
                    style={{
                      display: "inline-flex",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "999px",
                        backgroundColor: "#e5e7eb",
                        opacity: 0.5,
                      }}
                    />
                    <span
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "999px",
                        backgroundColor: "#e5e7eb",
                        opacity: 0.75,
                      }}
                    />
                    <span
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "999px",
                        backgroundColor: "#e5e7eb",
                        opacity: 1,
                      }}
                    />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "6px",
              paddingTop: "8px",
              borderTop: "1px solid rgba(51,65,85,0.9)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell DeepMirror what’s on your mind…"
              style={{
                flex: 1,
                borderRadius: "999px",
                border: "1px solid rgba(71,85,105,0.9)",
                padding: "10px 14px",
                backgroundColor: "rgba(15,23,42,0.95)",
                color: "white",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              style={{
                borderRadius: "999px",
                border: "none",
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: isSending || !input.trim() ? "not-allowed" : "pointer",
                opacity: isSending || !input.trim() ? 0.5 : 1,
                background:
                  "linear-gradient(135deg, #22c55e, #4ade80, #a3e635)",
                color: "#052e16",
                whiteSpace: "nowrap",
              }}
            >
              {isSending ? "Thinking…" : "Send"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
