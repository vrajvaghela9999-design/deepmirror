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
        {/* Top bar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            fontSize: "13px",
          }}
        >
          <div style={{ opacity: 0.85 }}>
            DeepMirror{" "}
            <span style={{ opacity: 0.6 }}>
              — Educational support only
            </span>
          </div>

          <Link
            href="/login"
            style={{
              color: "#a5b4fc",
              textDecoration: "none",
              fontSize: "13px",
            }}
          >
            Sign in
          </Link>
        </header>

        {/* Hero card */}
        <section
          style={{
            borderRadius: "18px",
            padding: "24px 20px",
            background:
              "linear-gradient(135deg, rgba(30,64,175,0.5), rgba(15,23,42,0.9))",
            border: "1px solid rgba(148,163,184,0.3)",
            boxShadow: "0 24px 60px rgba(15,23,42,0.9)",
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              lineHeight: 1.2,
              marginBottom: "12px",
            }}
          >
            A calm space to sort through your thoughts.
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(226,232,240,0.85)",
              marginBottom: "16px",
              maxWidth: "540px",
            }}
          >
            DeepMirror helps you see your thoughts, feelings, and patterns more
            clearly — like talking to a thoughtful psychologist, but in a safe,
            educational way. It can ask questions, spot patterns, and suggest
            small next steps. It does not replace a real therapist or doctor.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              fontSize: "12px",
              marginBottom: "18px",
            }}
          >
            <span
              style={{
                padding: "6px 10px",
                borderRadius: "999px",
                background: "rgba(22,163,74,0.12)",
                border: "1px solid rgba(22,163,74,0.6)",
                color: "#bbf7d0",
              }}
            >
              ✅ Ask about anxiety, stress, habits, relationships
            </span>
            <span
              style={{
                padding: "6px 10px",
                borderRadius: "999px",
                background: "rgba(127,29,29,0.2)",
                border: "1px solid rgba(239,68,68,0.7)",
                color: "#fecaca",
              }}
            >
              ⚠️ Not for crises, emergencies, or medical advice
            </span>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <Link
              href="/chat"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 20px",
                borderRadius: "999px",
                background:
                  "linear-gradient(135deg, #6366f1, #22c55e)",
                color: "#020617",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Start DeepMirror
            </Link>

            <a
              href="#how-it-works"
              style={{
                fontSize: "13px",
                color: "#e5e7eb",
                textDecoration: "none",
                opacity: 0.85,
              }}
            >
              Learn how it works
            </a>
          </div>
        </section>

        {/* How to use */}
        <section
          id="how-it-works"
          style={{
            marginTop: "20px",
            padding: "18px 16px",
            borderRadius: "16px",
            border: "1px solid rgba(148,163,184,0.35)",
            background: "rgba(15,23,42,0.9)",
            fontSize: "13px",
            color: "rgba(226,232,240,0.9)",
          }}
        >
          <h2
            style={{
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            How to use DeepMirror
          </h2>
          <ul
            style={{
              paddingLeft: "18px",
              margin: 0,
              display: "grid",
              gap: "4px",
            }}
          >
            <li>Type your age and what you’re going through right now.</li>
            <li>
              Start with one situation (for example: sleep, relationships,
              confidence, overthinking).
            </li>
            <li>
              Answer the follow-up questions honestly — this helps DeepMirror
              see the full picture.
            </li>
            <li>
              Use any suggestions as ideas to test, not as strict rules or
              professional treatment.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
