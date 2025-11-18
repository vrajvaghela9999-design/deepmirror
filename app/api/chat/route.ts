import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const messages = body.messages as Message[];
    const age = body.age as string | undefined;
    const userEmail = (body.userEmail as string | null) ?? null;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing messages array" },
        { status: 400 }
      );
    }

    const conversationText = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const systemPrompt = `
You are DeepMirror, an AI for reflection and self-understanding.
You are NOT a doctor or therapist and never claim to be.
You help users explore their thoughts, emotions, habits, patterns, and behaviour.
You ask gentle, specific follow-up questions and suggest small, realistic next steps.
You never give crisis, emergency, or medical advice. For emergencies you tell them to contact local emergency services.

User context:
- Age: ${age || "unknown"}
- Email (may be null): ${userEmail || "none"}

Guidelines:
- Write in clear, simple, conversational English.
- Stay warm, non-judgmental, and grounded (no fake positivity).
- Focus on helping the user notice patterns, needs, and options.
- Keep responses compact but meaningful: usually 2–5 short paragraphs or bullet points.
- When useful, structure your answer (for example: "1) What might be happening  2) What this tells you  3) One small next step").
- End most replies with **one focused question** that helps them go a bit deeper, not with generic platitudes.
`.trim();

    const response = await client.chat.completions.create({
      // MODEL CHOICE:
      // - "gpt-4.1-mini" = cheaper, still very good (recommended for now)
      // - "gpt-4.1"      = higher quality, more expensive
      model: "gpt-4.1-mini",
      temperature: 0.7,
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the conversation so far:\n\n${conversationText}`,
        },
      ],
    });

    const reply =
      response.choices[0]?.message?.content ??
      "I’m having trouble responding right now.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json(
      { error: "Something went wrong talking to DeepMirror." },
      { status: 500 }
    );
  }
}