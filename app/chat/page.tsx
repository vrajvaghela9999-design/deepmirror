"use client";

import React, { useState, useEffect, FormEvent, useRef } from "react";
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

type Tag = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
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

// Icon component helper
function TagIcon({ icon }: { icon: string | null }) {
  if (!icon) return null;
  
  const icons: { [key: string]: React.ReactNode } = {
    'alert-circle': <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'briefcase': <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    'heart': <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    'users': <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    'activity': <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    'star': <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    'zap': <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    'moon': <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
    'target': <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2} /><circle cx="12" cy="12" r="6" strokeWidth={2} /><circle cx="12" cy="12" r="2" strokeWidth={2} /></svg>,
    'sun': <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  };
  
  return <>{icons[icon] || null}</>;
}

export default function ChatPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [age, setAge] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [urlConversationId, setUrlConversationId] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadTags = async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("id, name, color, icon")
        .order("name");
      if (!error && data) {
        setAllTags(data);
      }
    };
    loadTags();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUser({ id: data.user.id, email: data.user.email ?? null });
      } else {
        setUser(null);
      }
      setLoadingUser(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? null });
      } else {
        setUser(null);
      }
    });
    return () => { subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const convId = params.get("conversationId");
    if (convId) setUrlConversationId(convId);
  }, []);

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
        setMessages(INITIAL_MESSAGES);
        setLoadingConversation(false);
        return;
      }

      if (data && data.length > 0) {
        const formatted: Message[] = data.map((m: { role: string; content: string; created_at: string }) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
          created_at: m.created_at,
        }));
        setMessages(formatted);
        setConversationId(urlConversationId);
      } else {
        setMessages(INITIAL_MESSAGES);
      }

      const { data: tagData } = await supabase
        .from("conversation_tags")
        .select("tag_id")
        .eq("conversation_id", urlConversationId);
      if (tagData) {
        setSelectedTags(tagData.map((t) => t.tag_id));
      }
      setLoadingConversation(false);
    };
    loadConversation();
  }, [urlConversationId, user]);

  const toggleTag = async (tagId: string) => {
    const isSelected = selectedTags.includes(tagId);
    if (isSelected) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
      if (conversationId) {
        await supabase.from("conversation_tags").delete().eq("conversation_id", conversationId).eq("tag_id", tagId);
      }
    } else {
      setSelectedTags([...selectedTags, tagId]);
      if (conversationId) {
        await supabase.from("conversation_tags").insert({ conversation_id: conversationId, tag_id: tagId });
      }
    }
  };

  const saveTagsForConversation = async (convId: string) => {
    if (selectedTags.length === 0) return;
    const tagRows = selectedTags.map((tagId) => ({ conversation_id: convId, tag_id: tagId }));
    await supabase.from("conversation_tags").insert(tagRows);
  };

  const handleNewSession = () => {
    setConversationId(null);
    setUrlConversationId(null);
    setMessages(INITIAL_MESSAGES);
    setInput("");
    setSelectedTags([]);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("conversationId");
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const assistantMessage: Message = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.conversationId) {
        if (!conversationId && selectedTags.length > 0) {
          await saveTagsForConversation(data.conversationId);
        }
        setConversationId(data.conversationId);
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("conversationId", data.conversationId);
          window.history.replaceState({}, "", url.toString());
        }
        if (!urlConversationId) setUrlConversationId(data.conversationId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const signedInEmail = user?.email ? user.email.split("@")[0] : "Guest";
  const selectedTagObjects = allTags.filter((t) => selectedTags.includes(t.id));

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

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
            <button onClick={handleNewSession} className="dm-btn dm-btn-secondary text-xs py-1.5 px-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="dm-container flex-1 py-6 flex flex-col">
          <div className="flex gap-6 flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
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
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowTagSelector(!showTagSelector)}
                    className="dm-btn dm-btn-secondary text-xs py-1.5 px-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>Tags</span>
                    {selectedTags.length > 0 && (
                      <span className="bg-sky-500 text-slate-900 text-xs px-1.5 py-0.5 rounded-full font-bold">
                        {selectedTags.length}
                      </span>
                    )}
                  </button>

                  {showTagSelector && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-30 p-3">
                      <div className="text-xs text-slate-400 mb-2">Select topics for this session:</div>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => {
                          const isSelected = selectedTags.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              onClick={() => toggleTag(tag.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all"
                              style={{
                                backgroundColor: `${tag.color}20`,
                                color: tag.color,
                                border: isSelected ? `2px solid ${tag.color}` : `1px solid transparent`,
                                opacity: isSelected ? 1 : 0.7,
                              }}
                            >
                              <TagIcon icon={tag.icon} />
                              {tag.name}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setShowTagSelector(false)}
                        className="mt-3 w-full text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>

                {selectedTagObjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTagObjects.map((tag) => (
                      <span
                        key={tag.id}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                      >
                        <TagIcon icon={tag.icon} />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="dm-card flex-1 overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
                
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
                      <div key={idx} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}>
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
                            <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                  
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
                      Add tags to organize your sessions
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 mt-0.5">•</span>
                      Answer follow-up questions honestly
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 mt-0.5">•</span>
                      Filter sessions by tag in History
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