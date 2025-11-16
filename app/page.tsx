"use client";

import Link from "next/link";

export default function HomePage() {
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
      <div style={{ width: "100%", maxWidth: "860px" }}>
        {/* Top label */}
        <div
          style={{
            fontSize: "13px",
            opacity: 0.8,
            marginBottom: "8px",
          }}
        >
          DeepMirror <span style={{ opacity: 0.6 }}>— Educational support only</span>
        </div>

        {/* Hero card */}
        <section
          style={{
            borderRadius: "18px",
            padding: "24px 20px",
            background: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(148,163,184,0.35)",
            boxShadow: "0 22px 45px rgba(15,23,42,0.9)",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              marginBottom: "10px",
              fontWeight: 700,
            }}
          >
            A calm space to sort through your thoughts.
          </h1>

          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.6,
              opacity: 0.9,
            }}
          >
            DeepMirror helps you see your thoughts, feelings, and patterns more clearly —
            like talking to a thoughtful psychologist, but in a safe, educational way.
            It can ask questions, spot patterns, and suggest small next steps.{" "}
            <strong>It does not replace a real therapist or doctor.</strong>
          </p>

          {/* Safety badges */}
          <div
            style={{
              marginTop: "14px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              fontSize: "12px",
            }}
          >
            <div
              style={{
                padding: "6px 11px",
                borderRadius: "999px",
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.4)",
              }}
            >
              ✅ Ask about anxiety, stress, habits, relationships
            </div>
            <div
              style={{
                padding: "6px 11px",
                borderRadius: "999px",
                background: "rgba(248,113,113,0.12)",
                border: "1px solid rgba(248,113,113,0.4)",
              }}
            >
              ⚠️ Not for crises, emergencies, or medical advice
            </div>
          </div>

          {/* Buttons */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {/* This goes to the chat page */}
            <Link href="/chat">
              <button
                style={{
                  padding: "10px 18px",
                  borderRadius: "999px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background:
                    "linear-gradient(135deg, rgba(59,130,246,1), rgba(147,51,234,1))",
                  color: "white",
                  boxShadow: "0 12px 30px rgba(59,130,246,0.45)",
                }}
              >
                Start DeepMirror
              </button>
            </Link>

            {/* Scroll to how-it-works section */}
            <button
              onClick={() => {
                const el = document.getElementById("how-it-works");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                padding: "10px 18px",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.6)",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                background: "transparent",
                color: "white",
              }}
            >
              Learn how it works
            </button>
          </div>
        </section>

        {/* How it works section */}
        <section
          id="how-it-works"
          style={{
            marginTop: "8px",
            marginBottom: "24px",
            padding: "18px 18px",
            borderRadius: "16px",
            background: "#020617",
            border: "1px solid rgba(30,64,175,0.7)",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              marginBottom: "8px",
              fontWeight: 600,
            }}
          >
            How to use DeepMirror
          </h2>
          <ol
            style={{
              fontSize: "13px",
              lineHeight: 1.6,
              paddingLeft: "18px",
            }}
          >
            <li>Type your age and what you&apos;re going through right now.</li>
            <li>
              Start with one situation (for example: sleep, relationships, confidence,
              overthinking).
            </li>
            <li>
              Answer the follow-up questions honestly — this helps DeepMirror see the full
              picture.
            </li>
            <li>
              Use any suggestions as ideas to test, not as strict rules or professional
              treatment.
            </li>
          </ol>
        </section>
      </div>
    </main>
  );
}
