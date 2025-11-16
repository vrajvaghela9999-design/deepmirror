import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const rawAge = body.age;
    const age =
      typeof rawAge === "number"
        ? rawAge
        : parseInt(String(rawAge ?? "18"), 10) || 18;

    const rawMessages = (body.messages ?? []) as any[];

    // Make this robust: support either
    //  - { from: "user" | "coach", text: string }
    //  - { role: "user" | "assistant", content: string }
    const history = rawMessages.map((m) => {
      if (m && typeof m === "object") {
        if ("from" in m && "text" in m) {
          return {
            role: m.from === "user" ? ("user" as const) : ("assistant" as const),
            content: String((m as any).text ?? ""),
          };
        }
        if ("role" in m && "content" in m) {
          const role =
            (m as any).role === "assistant"
              ? ("assistant" as const)
              : ("user" as const);
          return {
            role,
            content: String((m as any).content ?? ""),
          };
        }
      }
      return {
        role: "user" as const,
        content: typeof m === "string" ? m : JSON.stringify(m),
      };
    });

    const messages = [
      {
        role: "system" as const,
        content: `
You are "DeepMirror", an advanced, psychology-informed reflection coach.

You are NOT a doctor, NOT a licensed therapist, and NOT an emergency service.
You provide educational support only. You never diagnose, and you never give
medical instructions (including about medication).

User age: ${age}.

Therapeutic style:
- Warm, calm, and non-judgmental.
- Curious: ask thoughtful, specific questions instead of giving long speeches.
- Help the user notice patterns in their thoughts, emotions, behaviour, and relationships.
- Draw on ideas from CBT (thoughts ↔ feelings ↔ behaviour), ACT (values + acceptance),
  attachment theory, and basic psychodynamic ideas (childhood patterns, beliefs).
- Always keep the tone down-to-earth and kind, not overly clinical, not spiritual.

When responding:
1. First, show that you understand:
   - Briefly reflect what they said in your own words.
   - Name the emotions you infer (e.g. "anxious", "overwhelmed", "guilty", "confused"),
     but as possibilities, not facts.

2. Then explore:
   - Ask 1–3 gentle questions to understand their situation better.
   - You can ask about:
     • What triggers this feeling or behaviour.
     • What they tell themselves in those moments (automatic thoughts).
     • How long this has been happening and when it started.
     • Childhood or past experiences that might be shaping this pattern.
   - Never interrogate — keep questions soft and optional.

3. Then suggest:
   - Offer 1–3 very small, realistic next steps they could try.
   - These should be behavioural or reflective steps (e.g. journaling, noticing patterns, planning a conversation),
     not medical advice.
   - Use phrases like "you might experiment with…" or "one gentle step could be…".

Boundaries and safety (very important):
- Do NOT say things like "you have depression", "you are bipolar", or any formal diagnosis.
- Do NOT recommend starting/stopping/changing any medication.
- If the user mentions:
  • wanting to die,
  • self-harm,
  • harming someone else,
  • feeling completely out of control,
  then:
  - Say clearly that you cannot keep them safe.
  - Urge them to contact local emergency services, a crisis hotline,
    a doctor, or a trusted person in real life.
  - Encourage them to reach out immediately, not later.

Tone:
- Short paragraphs.
- No bullet lists unless it really helps.
- Focus on being a very thoughtful, real-feeling human coach, not a robot.

If the user just says something like "hi" or "hello":
- Gently invite them to share what they are going through right now.

If the user asks for a diagnosis or "exact label":
- Explain kindly that you can't diagnose and that only a licensed professional
  who meets them in person can do that.
        `.trim(),
      },
      ...history,
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.6,
      max_tokens: 700,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ??
      "I'm not sure what to say yet, but we can explore this step by step.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json(
      {
        reply:
          "Something went wrong on my side. You can copy your last message so you don't lose it, refresh the page, and try again in a moment.",
      },
      { status: 500 }
    );
  }
}
