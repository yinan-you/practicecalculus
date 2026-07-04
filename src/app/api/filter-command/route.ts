import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildFilterCommandSystemPrompt } from "@/lib/ai/filter-command-prompt";
import { validateRequirement } from "@/lib/requirements";

const DEFAULT_MODEL = "gpt-4o-mini";

export async function POST(request: Request) {
  let utterance: unknown;
  try {
    ({ utterance } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof utterance !== "string" || utterance.trim().length === 0) {
    return NextResponse.json(
      { error: "A non-empty 'utterance' string is required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI is not configured (missing OPENAI_API_KEY)." },
      { status: 500 },
    );
  }

  const openai = new OpenAI({ apiKey });

  let content: string | null | undefined;
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? DEFAULT_MODEL,
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 512,
      messages: [
        { role: "system", content: buildFilterCommandSystemPrompt() },
        { role: "user", content: `Request: "${utterance.trim()}"` },
      ],
    });
    content = completion.choices[0]?.message?.content;
  } catch (err) {
    console.error("[filter-command] OpenAI error:", err);
    return NextResponse.json(
      { error: "Failed to reach the language model." },
      { status: 502 },
    );
  }

  if (!content) {
    return NextResponse.json(
      { error: "The language model returned an empty response." },
      { status: 422 },
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return NextResponse.json(
      { error: "The language model returned invalid JSON." },
      { status: 422 },
    );
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    "error" in parsed &&
    typeof (parsed as { error: unknown }).error === "string"
  ) {
    return NextResponse.json(
      { error: (parsed as { error: string }).error },
      { status: 422 },
    );
  }

  try {
    const requirement = validateRequirement(parsed);
    return NextResponse.json({ requirement });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? `Could not build a valid filter: ${err.message}`
            : "Could not build a valid filter.",
      },
      { status: 422 },
    );
  }
}
