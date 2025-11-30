// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// ---------- Supabase server client (service role, no cookies) ----------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const messages: ChatMessage[] = body.messages ?? [];
    const age: string = body.age ?? "";
    const userEmail: string | null = body.userEmail ?? null;
    let conversationId: string | null = body.conversationId ?? null;
    const userId: string | null = body.userId ?? null;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    if (!messages.length) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const latestUserMessage =
      messages.filter((m) => m.role === "user").slice(-1)[0];

    // ---------- Build prompt for DeepMirror ----------
    const systemPrompt = `You are DeepMirror, an AI for reflection and self-understanding. You are NOT a doctor or therapist and you do NOT give medical advice. You ask gentle questions, help the user notice patterns, and suggest small next steps. User age: ${age || "unknown"}. Be warm, empathetic, and thoughtful. Keep responses concise but meaningful.`;

    // ---------- Build full prompt with context ----------
    const userMessages = messages.filter((m) => m.role === "user");
    
    let fullPrompt = systemPrompt + "\n\n";
    
    if (userMessages.length > 1) {
      fullPrompt += "Previous context from this conversation:\n";
      userMessages.slice(0, -1).forEach((m) => {
        fullPrompt += `- User said: "${m.content}"\n`;
      });
      fullPrompt += "\n";
    }
    
    fullPrompt += `Now the user says: "${latestUserMessage?.content}"\n\nRespond as DeepMirror:`;

    // ---------- Call Gemini API directly via REST ----------
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fullPrompt }],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Gemini API error", details: errorData },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    const reply =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, something went wrong generating a reply.";

    // ---------- Save to Supabase (if configured) ----------
    if (supabase) {
      // 1) Create conversation row if this is a new chat
      if (!conversationId) {
        const title =
          latestUserMessage?.content.slice(0, 120) || "Untitled session";

        const { data, error } = await supabase
          .from("conversations")
          .insert({
            user_id: userId,
            title,
          })
          .select("id")
          .single();

        if (error) {
          console.error("Error creating conversation:", error);
        } else {
          conversationId = data.id;
        }
      }

      // 2) Insert messages for this turn
      if (conversationId) {
        const rows = [
          {
            conversation_id: conversationId,
            user_id: userId,
            role: "user",
            content: latestUserMessage?.content ?? "",
          },
          {
            conversation_id: conversationId,
            user_id: userId,
            role: "assistant",
            content: reply,
          },
        ];

        const { error: insertError } = await supabase
          .from("messages")
          .insert(rows);

        if (insertError) {
          console.error("Error inserting messages:", insertError);
        }
      }
    } else {
      console.warn("Supabase not configured on server — skipping save.");
    }

    // ---------- Send reply back to frontend ----------
    return NextResponse.json({
      reply,
      conversationId,
    });
  } catch (err: any) {
    console.error("Error in /api/chat:", err);
    return NextResponse.json(
      {
        error: "Server error in /api/chat",
        details: String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}