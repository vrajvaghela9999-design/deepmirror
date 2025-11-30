"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Tag = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
};

type Conversation = {
  id: string;
  title: string | null;
  created_at: string;
  tags: Tag[];
};

// Icon components for tags
const TagIcons: { [key: string]: JSX.Element } = {
  'alert-circle': <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'briefcase': <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  'heart': <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  'users': <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  'activity': <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  'star': <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  'zap': <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  'moon': <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  'target': <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2} /><circle cx="12" cy="12" r="6" strokeWidth={2} /><circle cx="12" cy="12" r="2" strokeWidth={2} /></svg>,
  'sun': <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
};

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedFilterTag, setSelectedFilterTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const load = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setLoading(false);
        return;
      }
      setUserEmail(userData.user.email ?? null);

      // Load all tags
      const { data: tagsData } = await supabase
        .from("tags")
        .select("id, name, color, icon")
        .order("name");

      if (tagsData) {
        setAllTags(tagsData);
      }

      // Load conversations with their tags
      const { data: convData, error } = await supabase
        .from("conversations")
        .select(`
          id,
          title,
          created_at,
          conversation_tags (
            tag_id,
            tags (
              id,
              name,
              color,
              icon
            )
          )
        `)
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading conversations:", error);
        setLoading(false);
        return;
      }

      // Transform the data to include tags directly
      const formattedConversations: Conversation[] = (convData || []).map((conv: any) => ({
        id: conv.id,
        title: conv.title,
        created_at: conv.created_at,
        tags: conv.conversation_tags?.map((ct: any) => ct.tags).filter(Boolean) || [],
      }));

      setConversations(formattedConversations);
      setLoading(false);
    };

    load();
  }, []);

  // Filter conversations by selected tag
  const filteredConversations = selectedFilterTag
    ? conversations.filter((conv) =>
        conv.tags.some((tag) => tag.id === selectedFilterTag)
      )
    : conversations;

  // Count conversations per tag
  const tagCounts: { [key: string]: number } = {};
  conversations.forEach((conv) => {
    conv.tags.forEach((tag) => {
      tagCounts[tag.id] = (tagCounts[tag.id] || 0) + 1;
    });
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className={`dm-container py-8 relative z-10 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back to home</span>
          </Link>

          <Link href="/chat" className="dm-btn dm-btn-accent text-sm py-2 px-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </Link>
        </header>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <svg className="w-7 h-7 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Session History
          </h1>
          <p className="text-slate-400 text-sm">Your private reflection sessions, only visible to you.</p>
          
          {userEmail && (
            <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {userEmail}
            </div>
          )}
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="mb-6">
            <div className="text-xs text-slate-400 mb-3">Filter by topic:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilterTag(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedFilterTag === null
                    ? "bg-sky-500 text-slate-900"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                All ({conversations.length})
              </button>
              {allTags.filter((tag) => tagCounts[tag.id] > 0).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedFilterTag(selectedFilterTag === tag.id ? null : tag.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedFilterTag === tag.id
                      ? "ring-2 ring-offset-1 ring-offset-slate-950"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    ringColor: selectedFilterTag === tag.id ? tag.color : "transparent",
                  }}
                >
                  {tag.icon && TagIcons[tag.icon]}
                  {tag.name}
                  <span className="opacity-60">({tagCounts[tag.id]})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sessions List */}
        <section className="dm-card">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="dm-loading">
                <div className="dm-loading-dot" />
                <div className="dm-loading-dot" />
                <div className="dm-loading-dot" />
              </div>
              <span className="ml-3 text-slate-400 text-sm">Loading sessions...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {selectedFilterTag ? "No sessions with this tag" : "No sessions yet"}
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                {selectedFilterTag 
                  ? "Try selecting a different tag or view all sessions."
                  : "Start a conversation and it will appear here."}
              </p>
              {selectedFilterTag ? (
                <button
                  onClick={() => setSelectedFilterTag(null)}
                  className="dm-btn dm-btn-secondary"
                >
                  View All Sessions
                </button>
              ) : (
                <Link href="/chat" className="dm-btn dm-btn-primary">
                  Start Your First Session
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConversations.map((conversation, index) => (
                <div
                  key={conversation.id}
                  className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 hover:bg-slate-800/30 transition-all gap-3 ${mounted ? 'animate-fade-in-up' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-white truncate mb-1">
                        {conversation.title || "Untitled session"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs text-slate-500">
                          {formatDate(conversation.created_at)}
                        </p>
                        {conversation.tags.length > 0 && (
                          <>
                            <span className="text-slate-700">•</span>
                            <div className="flex flex-wrap gap-1">
                              {conversation.tags.map((tag) => (
                                <span
                                  key={tag.id}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
                                  style={{
                                    backgroundColor: `${tag.color}20`,
                                    color: tag.color,
                                  }}
                                >
                                  {tag.icon && TagIcons[tag.icon]}
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href={`/chat?conversationId=${conversation.id}`}
                    className="dm-btn dm-btn-secondary text-xs py-2 px-4 opacity-70 group-hover:opacity-100 transition-opacity self-end sm:self-center"
                  >
                    <span>Continue</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Security Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secured with row-level encryption · Only you can see your sessions
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-600">
          Built by Vraj Vaghela · DeepMirror
        </footer>
      </div>
    </main>
  );
}