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
  created_at?: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content:
      "Hi, I’m DeepMirror. I’m an AI for reflection and self-understanding, not a doctor or therapist.\n\n" +
      "You can tell me what’s going on, and I’ll help you untangle it with questions and gentle structure.\n\n" +
      "To start: how old are you, and what’s the main thing on your mind today?",
  },
];

export default function ChatPage() {
  // ----- auth + user -----
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ----- chat state -----
  const [age, setAge] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // ----- conversation tracking -----
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [urlConversationId, setUrlConversationId] = useState<string | null>(
    null
  );

  // -------- Supabase: load current user --------
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

  // -------- Read conversationId from URL (client-side only) --------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const convId = params.get("conversationId");
    if (convId) {
      setUrlConversationId(convId);
    }
  }, []);

  // -------- Load existing conversation messages from Supabase --------
  useEffect(() => {
    const loadConversation = async () => {
      if (!urlConversationId || !user) return;

      setLoadingConversation(true);

      const { data, error } = await supabase
        .from("messages")
        .select("role, content, created_at")
        .eq("conversation_id", urlConversationId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.warn(
          "Could not load messages (falling back to default):",
          error
        );
        setMessages(INITIAL_MESSAGES);
        setLoadingConversation(false);
        return;
      }

      if (data && data.length > 0) {
        const formatted: Message[] = data.map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
          created_at: m.created_at,
        }));

        setMessages(formatted);
        setConversationId(urlConversationId);
      } else {
        // No messages yet for this conversation → show initial greeting
        setMessages(INITIAL_MESSAGES);
      }

      setLoadingConversation(false);
    };

    loadConversation();
  }, [urlConversationId, user]);

  // -------- Start a brand new session --------
  const handleNewSession = () => {
    setConversationId(null);
    setUrlConversationId(null);
    setMessages(INITIAL_MESSAGES);
    setInput("");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("conversationId");
      window.history.replaceState({}, "", url.toString());
    }
  };

  // -------- Handle sending a message --------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    const updatedMessages = [...messages, userMessage];

    // Optimistic update in UI
    setMessages(updatedMessages);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          age: age || "",
          userEmail: user?.email ?? null,
          conversationId,
          userId: user?.id ?? null,
        }),
      });

      if (!response.ok) {
        console.error("Error from /api/chat:", await response.text());
        return;
      }

      const data = await response.json();

      // Assistant reply
      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // New or existing conversation id from API
      if (data.conversationId) {
        setConversationId(data.conversationId);

        // If URL doesn't already have it, update URL
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("conversationId", data.conversationId);
          window.history.replaceState({}, "", url.toString());
        }

        if (!urlConversationId) {
          setUrlConversationId(data.conversationId);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  };

  // -------- Render --------
  const signedInEmail = user?.email ?? "Guest";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Glow background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-64 w-64 -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute left-[10%] top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute right-[5%] bottom-[10%] h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Top bar */}
      <header className="border-b border-slate-800/70 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm text-slate-300">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-slate-400 transition hover:text-slate-100"
          >
            <span className="text-lg leading-none">←</span>
            <span>Back to home</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-xs text-slate-400 sm:block">
              <span className="font-medium text-sky-300">
                DeepMirror · Experimental reflection AI
              </span>{" "}
              — educational use only
            </div>
            <div className="hidden h-6 w-px bg-slate-800 sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-400">
                <span className="hidden sm:inline">Signed in as </span>
                <span className="font-semibold text-slate-100">
                  {signedInEmail}
                </span>
              </div>
              <button
                type="button"
                onClick={handleNewSession}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-100 shadow-sm shadow-sky-500/20 transition hover:border-sky-500 hover:bg-slate-900/80"
              >
                New session
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat layout */}
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 pb-24 pt-6 md:flex-row">
        {/* Left: chat */}
        <div className="flex-1">
          {/* Age row */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Age</span>
              <input
                type="number"
                min={10}
                max={100}
                placeholder="e.g. 18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-20 rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-xs text-slate-100 outline-none ring-0 transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/60"
              />
              <span className="text-[11px] text-slate-500">
                Used only to adjust tone.
              </span>
            </div>
          </div>

          {/* Chat card */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-[0_0_70px_rgba(15,23,42,0.9)]">
            {/* subtle top gradient line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/60 to-transparent" />

            {/* Messages */}
            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-700/80">
              {loadingUser || loadingConversation ? (
                <div className="flex items-center justify-center py-12 text-sm text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 animate-ping rounded-full bg-sky-400" />
                    Loading your session…
                  </div>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isAssistant = m.role === "assistant";
                  return (
                    <div
                      key={idx}
                      className={`flex ${
                        isAssistant ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={
                          "group relative max-w-[90%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm transition " +
                          (isAssistant
                            ? "bg-slate-900/90 text-slate-100 border border-slate-700/70"
                            : "bg-gradient-to-br from-sky-500 to-cyan-400 text-slate-950 font-medium shadow-sky-500/40")
                        }
                      >
                        {isAssistant && (
                          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-sky-400/80">
                            DeepMirror
                          </div>
                        )}
                        {m.content.split("\n").map((line, i) => (
                          <p key={i} className="mb-1 last:mb-0">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Typing indicator */}
            {isSending && !loadingConversation && (
              <div className="mt-3 flex items-center gap-2 text-xs text-sky-300/80">
                <span className="flex h-6 items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-300 delay-150" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-200 delay-300" />
                </span>
                DeepMirror is thinking…
              </div>
            )}

            {/* Input form */}
            <form
              onSubmit={handleSubmit}
              className="mt-4 space-y-3 rounded-2xl border border-slate-800/90 bg-slate-950/90 p-3"
            >
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 rounded-2xl border border-slate-700/70" />
                <textarea
                  rows={3}
                  className="relative w-full resize-none rounded-2xl bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/60"
                  placeholder="Tell DeepMirror what’s on your mind…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isSending || loadingUser || loadingConversation}
                />
              </div>

              <div className="flex flex-col gap-2 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  DeepMirror is for reflection and learning — not emergency or
                  medical help.
                </span>

                <div className="flex items-center justify-end gap-2">
                  {conversationId && (
                    <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] text-slate-400">
                      Session saved
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={
                      isSending ||
                      loadingUser ||
                      loadingConversation ||
                      !input.trim()
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-sky-500/40 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300 disabled:shadow-none"
                  >
                    {isSending ? (
                      <>
                        <span className="h-2 w-2 animate-spin rounded-full border border-slate-900 border-t-transparent" />
                        Sending
                      </>
                    ) : (
                      <>
                        <span>Send</span>
                        <span className="text-base leading-none">↗</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>

        {/* Right: tiny “how to use” card (desktop) */}
        <aside className="hidden w-64 flex-shrink-0 md:block">
          <div className="sticky top-20 space-y-3 text-xs text-slate-300">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-lg shadow-black/40">
              <h2 className="mb-2 text-[13px] font-semibold text-slate-100">
                How to use DeepMirror
              </h2>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li>• Start with one specific situation or feeling.</li>
                <li>• Answer follow-up questions honestly.</li>
                <li>• Use suggestions as ideas to try, not strict rules.</li>
                <li>• You can always review past sessions in History.</li>
              </ul>
            </div>

            <Link
              href="/history"
              className="block rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-950 px-4 py-3 text-[11px] font-medium text-sky-300 shadow-lg shadow-black/30 transition hover:border-sky-500 hover:text-sky-200"
            >
              View your saved sessions →
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
