'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-sky-500/5 to-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className={`dm-container py-8 relative z-10 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">DeepMirror</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link href="/chat" className="text-sm text-slate-400 hover:text-white transition-colors">
              Chat
            </Link>
            <Link href="/history" className="text-sm text-slate-400 hover:text-white transition-colors">
              History
            </Link>
            <Link href="/login" className="dm-btn dm-btn-secondary text-sm py-2 px-4">
              Sign in
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <section className={`dm-card dm-card-glow mb-8 ${mounted ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: '0.1s' }}>
          {/* Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />
          
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 dm-text-gradient">
              A calm space to sort through your thoughts.
            </h1>
            
            <p className="text-base text-slate-400 mb-6 leading-relaxed">
              DeepMirror helps you explore your thoughts, feelings, and patterns more clearly — 
              like talking to a thoughtful guide, but in a safe, educational way. It can ask 
              questions, spot patterns, and suggest small next steps.
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="dm-tag dm-tag-success">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Anxiety, stress, habits, relationships
              </span>
              <span className="dm-tag dm-tag-danger">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Not for crises or medical advice
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href="/chat" className="dm-btn dm-btn-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Start Reflecting
              </Link>
              <Link href="/history" className="dm-btn dm-btn-secondary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View History
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className={`grid md:grid-cols-3 gap-4 mb-8 ${mounted ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div className="dm-card p-5">
            <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Gentle Questions</h3>
            <p className="text-sm text-slate-400">Thoughtful prompts that help you dig deeper without feeling overwhelmed.</p>
          </div>

          <div className="dm-card p-5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Pattern Recognition</h3>
            <p className="text-sm text-slate-400">Notice recurring themes and behaviors you might have missed.</p>
          </div>

          <div className="dm-card p-5">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Private & Secure</h3>
            <p className="text-sm text-slate-400">Your conversations are encrypted and only visible to you.</p>
          </div>
        </section>

        {/* Footer */}
        <footer className={`text-center text-sm text-slate-500 ${mounted ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: '0.3s' }}>
          <p>
            Built by <span className="text-slate-400">Vraj Vaghela</span> · 
            Educational support only — not a substitute for professional care.
          </p>
        </footer>
      </div>
    </main>
  );
}