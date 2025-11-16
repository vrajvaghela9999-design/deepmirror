import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 16px",
        background:
          "radial-gradient(circle at top, #1f2937 0, #020617 45%, #020617 100%)",
        color: "#f9fafb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "780px",
          margin: "0 auto",
        }}
      >
        {/* Top badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            fontSize: "11px",
            opacity: 0.8,
          }}
        >
          <span>DeepMirror · Demo — Educational support only</span>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.5)",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Built by Vraj Vaghela • Powered by OpenAI
          </span>
        </div>

        {/* Hero card */}
        <section
          style={{
            padding: "24px 20px",
            borderRadius: "18px",
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.75))",
            border: "1px solid rgba(148,163,184,0.3)",
            boxShadow: "0 22px 60px rgba(15,23,42,0.8)",
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
              marginBottom: "10px",
            }}
          >
            DeepMirror helps you see your thoughts, feelings, and patterns more
            clearly — like talking to a thoughtful psychologist, but in a safe,
            educational way. It can ask questions, spot patterns, and suggest
            small next steps.{" "}
            <strong>It does not replace a real therapist or doctor.</strong>
          </p>

          {/* Chips */}
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
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.4)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "999px",
                  background: "#22c55e",
                }}
              />
              Ask about anxiety, stress, habits, relationships
            </div>

            <div
              style={{
                padding: "6px 11px",
                borderRadius: "999px",
                background: "rgba(248,113,113,0.06)",
                border: "1px solid rgba(248,113,113,0.45)",
                fontSize: "11px",
              }}
            >
              🚨 Not for crises, emergencies, or medical advice
            </div>
          </div>

          {/* Call to action */}
          <div
            style={{
              marginTop: "22px",
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <Link href="/app">
              <button
                style={{
                  padding: "10px 20px",
                  borderRadius: "999px",
                  border: "none",
                  background:
                    "linear-gradient(to right, #60a5fa, #6366f1, #a855f7)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 15px 35px rgba(79,70,229,0.55)",
                }}
              >
                Start DeepMirror
              </button>
            </Link>

            <a
              href="#how-to-use"
              style={{
                fontSize: "12px",
                opacity: 0.85,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Learn how it works
            </a>
          </div>
        </section>

        {/* How to use section */}
        <section
          id="how-to-use"
          style={{
            marginTop: "10px",
            marginBottom: "20px",
            padding: "18px 18px",
            borderRadius: "16px",
            background: "#020617",
            border: "1px solid rgba(30,64,175,0.6)",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              marginBottom: "6px",
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
              Start with one situation (for example: sleep, relationships,
              confidence, overthinking).
            </li>
            <li>
              Answer the follow-up questions honestly — this helps DeepMirror see
              the full picture.
            </li>
            <li>
              Use any suggestions as ideas to test, not as strict rules or
              professional treatment.
            </li>
          </ol>
        </section>
      </div>
    </main>
  );
}
