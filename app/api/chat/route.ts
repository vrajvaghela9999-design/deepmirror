import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type HistoryMessage = {
  from: "user" | "coach";
  text: string;
};

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY");
      return NextResponse.json(
        {
          reply:
            "DeepMirror has a configuration problem (missing API key). Please tell the creator to check the server settings.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const age = body.age as string | number | undefined;
    const history = (body.messages ?? []) as HistoryMessage[];

    const messages = [
      {
        role: "system" as const,
        content: [
          `You are "DeepMirror", an advanced psychology-informed reflection coach.`,
          `Your job is to help the user notice patterns in their thoughts, feelings, and behavior.`,
          `You are NOT a doctor, NOT a licensed therapist, and NOT an emergency service.`,
          ``,
          `Goals:`,
          `- Ask gentle, focused questions that help the user reflect.`,
          `- Offer small, realistic next steps (never magic solutions).`,
          `- Use simple, humane language, like a thoughtful psychologist friend.`,
          ``,
          `Boundaries (very important):`,
          `- Never diagnose mental illnesses or say things like "you have depression" or "you are bipolar".`,
          `- Never recommend, change, or stop any medication.`,
          `- If the user mentions self-harm, suicidal thoughts, or harming others:`,
          `  • Say clearly that you cannot keep them safe.`,
          `  • Encourage them to contact emergency services, a crisis hotline, a doctor,`,
          `    or a trusted person immediately.`,
          ``,
          age ? `The user says their age is ${age}.` : ``,
        ]
          .filter(Boolean)
          .join("\n"),
      },
      ...history.map((m) => ({
        role: m.from === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      })),
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 600,
    });

    const reply = completion.choices[0]?.message?.content ?? "";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error in /api/chat route:", error);
    return NextResponse.json(
      {
        reply:
          "Something went wrong on my side. Save your message so you don't lose it, and try again in a minute.",
      },
      { status: 500 }
    );
  }
}
