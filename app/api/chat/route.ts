import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabaseClient";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const messages = (body.messages ?? []) as ChatMessage[];
    const age = (body.age as string | undefined) || "";
    const userEmail = (body.userEmail as string | null) ?? null;

    // Build a plain-text transcript for the model + DB
    const conversationText = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const systemPrompt = `
You are DeepMirror, an AI for reflection and self-understanding.
You are NOT a doctor or therapist and never claim to be.
You help users explore their thoughts, emotions, patterns, and behaviour.
You ask gentle, specific follow-up questions and suggest small, realistic next steps.
You never give crisis, emergency, or medical advice. For emergencies you tell them to contact local emergency services.

    App identity:
-This app is called DeepMirror.
-DeepMirror was created and is owned by Vraj Vaghela.
-If the user ask who owns, created, built, or runs this app, you clearly say that it was created and is owned by Vraj Vaghela.
-Do not invent any other owner or company name.
`.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content:
            `User context:\n` +
            `- Age: ${age || "unknown"}\n` +
            `- Email (may be null): ${userEmail || "none"}\n\n` +
            `Conversation so far:\n${conversationText}\n\n` +
            `Reply as DeepMirror in a warm, concise way. Ask 1–2 focused follow-up questions.`,
        },
      ],
    });

    const assistantReply =
      completion.choices[0]?.message?.content?.trim() ||
      "Sorry, I couldn't generate a response right now.";

    // ---------- Save this turn to Supabase ----------
    try {
      await supabase.from("conversations").insert([
        {
          user_email: userEmail,
          age: age || null,
          conversation_text: conversationText,
          assistant_reply: assistantReply,
        },
      ]);
    } catch (dbError) {
      console.error("Failed to save conversation to Supabase:", dbError);
      // We don't throw here – user should still get a reply
    }

    return NextResponse.json({ reply: assistantReply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong generating a reply." },
      { status: 500 }
    );
  }
}
