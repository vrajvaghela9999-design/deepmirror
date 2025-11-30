"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
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
      "Hi, I'm DeepMirror — your personal reflection companion.\n\n" +
      "I'm here to help you explore your thoughts and feelings through gentle questions and structured reflection. " +
      "I'm not a therapist or doctor, but I can help you gain clarity.\n\n" +
      "What's on your mind today?",
  },
];

export default function ChatPage() {
  // Auth + user
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Chat state
  const [age, setAge] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Conversation tracking
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [urlConversationId, setUrlConversationId] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load current user
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

  // Read conversationId from URL
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const convId = params.get("conversationId");
    if (convId) {
      setUrlConversationId(convId);
    }
  }, []);

  // Load existing conversation messages
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
        console.warn("Could not load messages:", error);
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
        setMessages(INITIAL_MESSAGES);
      }

      setLoadingConversation(false);
    };

    loadConversation();
  }, [urlConversationId, user]);

  // Start new session
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

  // Handle sending message
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    const updatedMessages = [...messages, userMessage];

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

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.conversationId) {
        setConversationId(data.conversationId);

        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("conversationId", data.conversationId);
          window.history.replaceState({}, "", url.toString());
        }

        if (!urlConversationId) {
          setUrlConversationId(data.conversationId);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const signedInEmail = user?.email ? user.email.split("@")[0] : "Guest";

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="dm-container flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm hidden sm:inline">Back to home</span>
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-sky-400 font-medium">DeepMirror</span>
            <span className="text-slate-500 hidden sm:inline">· Educational use only</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 hidden sm:block">
              <span className="text-slate-300">{signedInEmail}</span>
            </div>
            <button
              onClick={handleNewSession}
              className="dm-btn dm-btn-secondary text-xs py-1.5 px-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="dm-container flex-1 py-6 flex flex-col">
          <div className="flex gap-6 flex-1 overflow-hidden">
            {/* Messages Column */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Age Input */}
              <div className="flex items-center gap-3 mb-4 text-sm">
                <label className="text-slate-400">Age</label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  placeholder="e.g. 25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="dm-input w-20 py-1.5 text-center text-sm"
                />
                <span className="text-xs text-slate-500">Used to adjust tone</span>
              </div>

              {/* Messages Container */}
              <div className="dm-card flex-1 overflow-hidden flex flex-col">
                {/* Glow Line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 py-2">
                  {loadingUser || loadingConversation ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="dm-loading">
                        <div className="dm-loading-dot" />
                        <div className="dm-loading-dot" />
                        <div className="dm-loading-dot" />
                      </div>
                      <span className="ml-3 text-slate-400 text-sm">Loading session...</span>
                    </div>
                  ) : (
                    messages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}
                      >
                        <div className={m.role === "assistant" ? "dm-bubble dm-bubble-assistant" : "dm-bubble dm-bubble-user"}>
                          {m.role === "assistant" && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-sky-400 font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              DeepMirror
                            </div>
                          )}
                          {m.content.split("\n").map((line, i) => (
                            <p key={i} className={`${i > 0 ? "mt-2" : ""}`}>
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                  
                  {/* Typing Indicator */}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="dm-bubble dm-bubble-assistant">
                        <div className="flex items-center gap-2">
                          <div className="dm-loading">
                            <div className="dm-loading-dot" />
                            <div className="dm-loading-dot" />
                            <div className="dm-loading-dot" />
                          </div>
                          <span className="text-sm text-slate-400">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-slate-800/50">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      rows={3}
                      className="dm-input pr-24 resize-none"
                      placeholder="What's on your mind? Press Enter to send..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isSending || loadingUser || loadingConversation}
                    />
                    <button
                      type="submit"
                      disabled={isSending || loadingUser || loadingConversation || !input.trim()}
                      className="absolute right-2 bottom-2 dm-btn dm-btn-accent py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <div className="dm-loading">
                          <div className="dm-loading-dot" style={{ width: 6, height: 6 }} />
                          <div className="dm-loading-dot" style={{ width: 6, height: 6 }} />
                          <div className="dm-loading-dot" style={{ width: 6, height: 6 }} />
                        </div>
                      ) : (
                        <>
                          <span>Send</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                    <span>DeepMirror is for reflection — not medical or emergency help.</span>
                    {conversationId && (
                      <span className="flex items-center gap-1 text-emerald-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Saved
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar - Desktop Only */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                <div className="dm-card p-4">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How to use
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 mt-0.5">•</span>
                      Start with one specific situation or feeling
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 mt-0.5">•</span>
                      Answer follow-up questions honestly
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 mt-0.5">•</span>
                      Use suggestions as ideas, not strict rules
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 mt-0.5">•</span>
                      Review past sessions in History
                    </li>
                  </ul>
                </div>

                <Link href="/history" className="dm-card p-4 flex items-center justify-between group hover:border-sky-500/50 transition-colors">
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">View History</span>
                  <svg className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}