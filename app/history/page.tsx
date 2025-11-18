"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Conversation = {
  id: string;
  title: string | null;
  created_at: string;
};

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setLoading(false);
        return;
      }
      setUserEmail(userData.user.email ?? null);

      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, created_at")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading conversations:", error);
        setLoading(false);
        return;
      }

      setConversations(data || []);
      setLoading(false);
    };

    load();
  }, []);

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
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 16,
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{ color: "#9ca3af", textDecoration: "none", fontSize: 14 }}
          >
            ← Back to home
          </Link>

          <Link
            href="/chat"
            style={{
              fontSize: 13,
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid #374151",
              background: "transparent",
              color: "#e5e7eb",
              textDecoration: "none",
            }}
          >
            Open chat
          </Link>
        </div>

        <h1 style={{ fontSize: 22, marginBottom: 4 }}>DeepMirror — Session history</h1>
        <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 12 }}>
          Private overview of your past conversations, only visible to you.
        </p>

        {userEmail && (
          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>
            Signed in as {userEmail}
          </p>
        )}

        <section
          style={{
            borderRadius: 18,
            padding: "20px 18px",
            background:
              "radial-gradient(circle at top left, #0f172a 0, #020617 45%, #000 100%)",
            border: "1px solid rgba(148,163,184,0.25)",
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "#9ca3af",
              marginBottom: 16,
            }}
          >
            These sessions are stored in Supabase with row-level security. Only you
            can see them.
          </p>

          {loading ? (
            <p style={{ fontSize: 13, color: "#9ca3af" }}>Loading…</p>
          ) : conversations.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9ca3af" }}>
              No sessions yet. Start a conversation in the chat and it will appear
              here.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {conversations.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: "rgba(15,23,42,0.9)",
                    border: "1px solid rgba(55,65,81,0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>
                      {c.title || "Untitled conversation"}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      {new Date(c.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Link
                    href={`/chat?conversationId=${c.id}`}
                    style={{
                      fontSize: 12,
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: "1px solid #4b5563",
                      color: "#e5e7eb",
                      textDecoration: "none",
                    }}
                  >
                    Open session
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <p
          style={{
            marginTop: 24,
            fontSize: 11,
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          Built by Vraj Vaghela · DeepMirror (experimental)
        </p>
      </div>
    </main>
  );
}
