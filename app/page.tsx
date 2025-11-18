'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '32px 16px',
        background:
          'radial-gradient(circle at top, #1e293b 0, #020617 55%, #000 100%)',
        color: 'white',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '960px' }}>
        {/* Top bar */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              opacity: 0.85,
            }}
          >
            DeepMirror
          </div>

          <nav
            style={{
              display: 'flex',
              gap: '16px',
              fontSize: '13px',
              opacity: 0.8,
            }}
          >
            <Link
              href="/chat"
              style={{ textDecoration: 'none', color: 'white' }}
            >
              Chat
            </Link>
            <Link
              href="/history"
              style={{ textDecoration: 'none', color: 'white' }}
            >
              History
            </Link>
            <Link
              href="/login"
              style={{ textDecoration: 'none', color: 'white' }}
            >
              Sign in
            </Link>
          </nav>
        </header>

        {/* Hero card */}
        <section
          style={{
            borderRadius: '22px',
            padding: '26px 24px',
            background:
              'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,64,175,0.75))',
            border: '1px solid rgba(148,163,184,0.45)',
            boxShadow:
              '0 22px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(15,23,42,1)',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <h1
              style={{
                fontSize: '30px',
                lineHeight: 1.15,
                margin: 0,
                marginBottom: '10px',
                fontWeight: 650,
              }}
            >
              A calm space to sort through your thoughts.
            </h1>

            <p
              style={{
                fontSize: '14px',
                lineHeight: 1.7,
                opacity: 0.88,
                marginBottom: '18px',
              }}
            >
              DeepMirror helps you explore your thoughts, feelings, and patterns
              more clearly — like talking to a thoughtful guide, but in a safe,
              educational way. It can ask questions, spot patterns, and suggest
              small next steps.
              <br />
              <strong>
                DeepMirror is not a doctor, therapist, or crisis service.
              </strong>
            </p>

            {/* Labels */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '18px',
                fontSize: '12px',
              }}
            >
              <span
                style={{
                  borderRadius: '999px',
                  padding: '6px 10px',
                  background: 'rgba(22, 163, 74, 0.22)',
                  border: '1px solid rgba(34,197,94,0.6)',
                }}
              >
                Ask about anxiety, stress, habits, relationships
              </span>
              <span
                style={{
                  borderRadius: '999px',
                  padding: '6px 10px',
                  background: 'rgba(127,29,29,0.2)',
                  border: '1px solid rgba(248,113,113,0.85)',
                }}
              >
                Not for crises, emergencies, or medical advice
              </span>
            </div>

            {/* Buttons */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '8px',
              }}
            >
              <Link
                href="/chat"
                style={{
                  padding: '10px 18px',
                  borderRadius: '999px',
                  background:
                    'linear-gradient(135deg, #22c55e, #4ade80, #22c55e)',
                  color: '#022c22',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 10px 30px rgba(22,163,74,0.45)',
                }}
              >
                Start DeepMirror
              </Link>

              <Link
                href="/history"
                style={{
                  padding: '9px 16px',
                  borderRadius: '999px',
                  border: '1px solid rgba(148,163,184,0.8)',
                  color: 'white',
                  fontSize: '13px',
                  textDecoration: 'none',
                  background: 'rgba(15,23,42,0.7)',
                }}
              >
                View your session history
              </Link>
            </div>

            <p style={{ fontSize: '11px', opacity: 0.7 }}>
              Built by Vraj Vaghela. Educational support only — not a
              substitute for professional care.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
