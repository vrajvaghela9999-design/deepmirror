import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("Missing OPENAI_API_KEY");
      return NextResponse.json(
        { text: "Server configuration error (no API key)." },
        { status: 500 }
      );
    }

    const payload = {
      model: "gpt-4.1-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are MindCoach, an advanced psychology-informed mental-health coach. You are NOT a doctor, NOT a licensed therapist, and NOT an emergency service. Focus on understanding the user, asking gentle clarifying questions, reflecting patterns you notice, and offering a few practical, realistic suggestions. Never diagnose, never name disorders, and never tell users to start, stop, or change medication. If the user mentions self-harm or harming others, encourage them to contact local emergency services, a crisis hotline, a doctor, or a trusted person immediately.",
        },
        {
          role: "user",
          content: String(text ?? ""),
        },
      ],
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      console.error("OpenAI API error:", await r.text());
      return NextResponse.json(
        { text: "There was an error talking to the coach. Please try again later." },
        { status: 500 }
      );
    }

    const data = await r.json();
    const answer =
      data.choices?.[0]?.message?.content ??
      "I’m here to offer educational support, but I’m not a substitute for a licensed professional.";

    return NextResponse.json({ text: answer });
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json(
      { text: "Server error while processing your message." },
      { status: 500 }
    );
  }
}
