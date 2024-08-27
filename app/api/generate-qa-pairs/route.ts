import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const qaSchema = z.object({
  pairs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  }))
});

export const maxDuration = 60; // Allow streaming responses up to 60 seconds

export async function POST(req: Request) {
  const { topic, numPairs } = await req.json();

  const result = await streamObject({
    model: openai('gpt-4o-2024-08-06'),
    schema: qaSchema,
    prompt: `Generate ${numPairs} question-answer pairs about the following topic: ${topic}. Ensure the answers are concise and factual.`,
  });

  return result.toTextStreamResponse();
}