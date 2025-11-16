"use client";

import { useState, FormEvent } from "react";

type Message = {
  from: "user" | "coach";
  text: string;
};

export default function ChatPage() {
  const [age, setAge] = useState<string>("18");
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

    const newUserMessage: Message = { from: "user", text: trimmed };

    // show user message immediately
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          messages: [...messages, newUserMessage],
        }),
      });

      if (!res.ok) {
        console.error("API error:", await res.text());
        setMessages((prev) => [
          ...prev,
          {
            from: "coach",
            text:
              "Something went wrong on my side. Let's take a breath and try again in a moment.",
          },
        ]);
      } else {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            from: "coach",
            text:
              data.reply ??
              "I’m here with you, but I’m not sure what to say yet. Let’s explore this step by step.",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          from: "coach",
          text:
            "I lost connection for a bit. Check your internet and try sending again.",
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
        background:
          "radial-gradient(circle at top, #1f2937 0, #020617 60%, #000 100%)",
        color: "white",
        padding: "32px 16px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          borderRadius: "24px",
          border: "1px solid rgba(148,163,184,0.4)",
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(15,23,42,0.92))",
          padding: "24px",
          boxShadow: "0 18px 40px rgba(15,23,42,0.9)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "16px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "14px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.7,
              }}
            >
              DeepMirror
            </div>
            <div style={{ fontSize: "12px", opacity: 0.6 }}>
              Educational support only
            </div>
          </div>
          <div style={{ fontSize: "12px", opacity: 0.6 }}>
            Built by Vraj Vaghela · Powered by OpenAI
          </div>
        </div>

        {/* Age input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            marginBottom: "12px",
          }}
        >
          <span style={{ opacity: 0.8 }}>Age:</span>
          <input
            type="number"
            min={13}
            max={100}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{
              width: "70px",
              background: "rgba(15,23,42,0.9)",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.5)",
              padding: "4px 10px",
              color: "white",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>

        {/* Message list */}
        <div
          style={{
            borderRadius: "18px",
            border: "1px solid rgba(30,64,175,0.7)",
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(15,23,42,0.96))",
            padding: "16px",
            height: "380px",
            overflowY: "auto",
            marginBottom: "12px",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent:
                  m.from === "user" ? "flex-end" : "flex-start",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "8px 12px",
                  borderRadius:
                    m.from === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  background:
                    m.from === "user"
                      ? "linear-gradient(135deg, #2563eb, #4f46e5)"
                      : "rgba(15,23,42,0.9)",
                  border:
                    m.from === "user"
                      ? "1px solid rgba(191,219,254,0.4)"
                      : "1px solid rgba(148,163,184,0.4)",
                  fontSize: "14px",
                  lineHeight: 1.4,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ opacity: 0.7, fontSize: "12px" }}>
              DeepMirror is thinking…
            </div>
          )}
        </div>

        {/* Input form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "8px", marginTop: "4px" }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell DeepMirror what’s on your mind..."
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.5)",
              background: "rgba(15,23,42,0.95)",
              color: "white",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "10px 18px",
              borderRadius: "999px",
              border: "none",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: isLoading ? "default" : "pointer",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "Thinking…" : "Send"}
          </button>
        </form>
      </div>
    </main>
  );
}
