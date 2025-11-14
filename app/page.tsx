"use client";

import { useState, FormEvent } from "react";

type Message = {
  from: "user" | "coach";
  text: string;
};

export default function HomePage() {
  const [age, setAge] = useState("18");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "coach",
      text: "Welcome. Educational support only; not a substitute for a licensed professional.",
    },
  ]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We send age + text together to the backend
        body: JSON.stringify({
          text: `Age: ${age}\n\nUser: ${trimmed}`,
        }),
      });

      const data = await res.json();
      const reply =
        typeof data.text === "string"
          ? data.text
          : "Sorry, I had trouble answering. Please try again.";

      setMessages((prev) => [...prev, { from: "coach", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          from: "coach",
          text: "Network error. Please check your connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a", // dark blue
        color: "#e5e7eb", // light gray
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "24px 16px 40px",
        }}
      >
        {/* Top navigation / brand */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              MindCoach
            </div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>
              Demo — Educational support only
            </div>
          </div>

          <div
            style={{
              fontSize: "12px",
              borderRadius: "999px",
              padding: "4px 10px",
              background: "rgba(148, 163, 184, 0.2)",
              border: "1px solid rgba(148, 163, 184, 0.5)",
            }}
          >
            Built by Vraj · Powered by OpenAI
          </div>
        </header>

        {/* Hero + description */}
        <section
          style={{
            marginBottom: "24px",
            background: "linear-gradient(135deg, #1e293b, #020617)",
            borderRadius: "16px",
            padding: "20px 18px",
            border: "1px solid rgba(148,163,184,0.4)",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              marginBottom: "8px",
              fontWeight: 700,
            }}
          >
            A calm space to sort through your thoughts.
          </h1>
          <p style={{ fontSize: "14px", lineHeight: 1.6, opacity: 0.9 }}>
            MindCoach helps you reflect on your feelings, patterns, and
            decisions — like talking to a thoughtful psychologist, but in
            a safe, educational way. It can ask questions, spot patterns,
            and suggest small next steps. It{" "}
            <strong>does not replace a real therapist or doctor.</strong>
          </p>

          <div
            style={{
              marginTop: "12px",
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              fontSize: "12px",
            }}
          >
            <div
              style={{
                padding: "6px 10px",
                borderRadius: "999px",
                background: "rgba(34,197,94,0.15)",
                border: "1px solid rgba(34,197,94,0.4)",
              }}
            >
              ✅ Ask about anxiety, stress, habits, relationships
            </div>
            <div
              style={{
                padding: "6px 10px",
                borderRadius: "999px",
                background: "rgba(248,113,113,0.12)",
                border: "1px solid rgba(248,113,113,0.5)",
              }}
            >
              ⚠️ Not for crises, emergencies, or medical advice
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "#020617",
            border: "1px solid rgba(30,64,175,0.7)",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              marginBottom: "6px",
              fontWeight: 600,
            }}
          >
            How to use MindCoach
          </h2>
          <ol style={{ fontSize: "13px", lineHeight: 1.6, paddingLeft: "18px" }}>
            <li>Type your age and what you&apos;re going through right now.</li>
            <li>
              Start with one situation (for example: sleep, relationships,
              confidence, overthinking).
            </li>
            <li>
              Answer the follow-up questions honestly — this helps MindCoach see
              the full picture.
            </li>
            <li>
              Use any suggestions as ideas to test, not as strict rules or
              professional treatment.
            </li>
          </ol>
        </section>

        {/* Chat card */}
        <section
          style={{
            background: "#020617",
            borderRadius: "16px",
            padding: "16px",
            border: "1px solid rgba(148,163,184,0.4)",
          }}
        >
          {/* Age row */}
          <div
            style={{
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
            }}
          >
            <span>Age:</span>
            <input
              type="number"
              min={10}
              max={100}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              style={{
                width: "60px",
                padding: "4px 6px",
                borderRadius: "6px",
                border: "1px solid rgba(148,163,184,0.7)",
                background: "#020617",
                color: "#e5e7eb",
              }}
            />
          </div>

          {/* Messages box */}
          <div
            style={{
              height: "260px",
              overflowY: "auto",
              padding: "10px",
              marginBottom: "12px",
              borderRadius: "10px",
              background: "#020617",
              border: "1px solid rgba(51,65,85,0.9)",
              fontSize: "13px",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "8px",
                  textAlign: m.from === "user" ? "right" : "left",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "6px 9px",
                    borderRadius: "10px",
                    background:
                      m.from === "user"
                        ? "rgba(56,189,248,0.2)"
                        : "rgba(148,163,184,0.2)",
                    border:
                      m.from === "user"
                        ? "1px solid rgba(56,189,248,0.7)"
                        : "1px solid rgba(148,163,184,0.6)",
                  }}
                >
                  <strong style={{ fontSize: "11px" }}>
                    {m.from === "user" ? "You" : "Coach"}:{" "}
                  </strong>
                  <span>{m.text}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ fontSize: "12px", opacity: 0.7 }}>Coach is thinking…</div>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type what’s on your mind…"
              rows={2}
              style={{
                flex: 1,
                resize: "none",
                borderRadius: "10px",
                padding: "8px 10px",
                fontSize: "13px",
                border: "1px solid rgba(148,163,184,0.7)",
                background: "#020617",
                color: "#e5e7eb",
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "0 14px",
                borderRadius: "10px",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                background: isLoading ? "#64748b" : "#22c55e",
                color: "#020617",
                cursor: isLoading ? "default" : "pointer",
                minWidth: "70px",
              }}
            >
              {isLoading ? "Sending…" : "Send"}
            </button>
          </form>

          <p
            style={{
              marginTop: "8px",
              fontSize: "11px",
              opacity: 0.7,
              lineHeight: 1.4,
            }}
          >
            MindCoach is for reflection and education only. If you&apos;re in
            immediate danger or thinking about harming yourself, please contact
            local emergency services or a trusted person right away.
          </p>
        </section>
      </div>
    </main>
  );
}
