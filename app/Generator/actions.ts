'use server'

import OpenAI from 'openai'
import { streamObject, jsonSchema } from 'ai'
import { z } from 'zod'
import { openai as openaiClient } from '@ai-sdk/openai';
import { streamText } from 'ai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const QAPairSchema = jsonSchema<QAPair>({
  type: 'object',
  properties: {
    question: { type: 'string' },
    answer: { type: 'string' },
  },
  required: ['question', 'answer'],
});

const ResponseSchema = jsonSchema<{ pairs: QAPair[] }>({
  type: 'object',
  properties: {
    pairs: {
      type: 'array',
      items: QAPairSchema,
    },
  },
  required: ['pairs'],
});

export type QAPair = {
  question: string;
  answer: string;
};

export async function* generateQAPairs(topic: string, numPairs: number): AsyncGenerator<QAPair | { debug: string }> {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-2024-08-06',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that generates question-answer pairs on given topics.' },
      { role: 'user', content: `Generate ${numPairs} question-answer pairs about ${topic}. Format each pair as JSON: {"question": "...", "answer": "..."}` }
    ],
    stream: true,
  });

  let currentPair = '';
  let debugChunks = [];
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    currentPair += content;
    debugChunks.push(content);
    
    // Yield debug information every 5 chunks
    if (debugChunks.length >= 5) {
      yield { debug: debugChunks.join('') };
      debugChunks = [];
    }

    if (currentPair.includes('}')) {
      const pairs = currentPair.match(/\{[^}]+\}/g) || [];
      for (const pair of pairs) {
        try {
          const parsedPair = JSON.parse(pair) as QAPair;
          yield parsedPair;
          currentPair = currentPair.replace(pair, '');
        } catch (error) {
          console.error('Failed to parse JSON:', error);
          yield { debug: `Failed to parse: ${pair}` };
        }
      }
    }
  }

  // Yield any remaining debug chunks
  if (debugChunks.length > 0) {
    yield { debug: debugChunks.join('') };
  }
}

export async function saveQAPairs(pairs: QAPair[]) {
  console.log('Saving Q&A pairs:', pairs);
  return true;
}

export async function createJSONLFile(pairs: QAPair[]) {
  const jsonlContent = pairs.map(pair => JSON.stringify({
    messages: [
      { role: "user", content: pair.question },
      { role: "assistant", content: pair.answer }
    ]
  })).join('\n');
  return jsonlContent;
}

export async function createJSONLFromSelected(pairs: QAPair[], selectedIndices: number[]) {
  const selectedPairs = pairs.filter((_, index) => selectedIndices.includes(index));
  const jsonlContent = selectedPairs.map(pair => JSON.stringify({
    messages: [
      { role: "user", content: pair.question },
      { role: "assistant", content: pair.answer }
    ]
  })).join('\n');
  return jsonlContent;
}

export async function getSelectedPairsPreview(pairs: QAPair[], selectedIndices: number[]) {
  const selectedPairs = pairs
    .filter((_, index) => selectedIndices.includes(index))
    .map(pair => ({ question: pair.question, answer: pair.answer }));

  if (selectedPairs.length < 10) {
    throw new Error("At least 10 Q&A pairs must be selected for training.");
  }

  return selectedPairs;
}

export async function uploadJSONLFile(jsonlContent: string) {
  try {
    const blob = new Blob([jsonlContent], { type: 'application/jsonl' });
    const file = new File([blob], 'training_data.jsonl', { type: 'application/jsonl' });

    const uploadedFile = await openai.files.create({
      file: file,
      purpose: 'fine-tune'
    });

    return uploadedFile.id;
  } catch (error) {
    console.error("Error uploading JSONL file:", error);
    throw error;
  }
}

export async function startFineTuning(fileId: string, modelName: string) {
  try {
    const fineTuningJob = await openai.fineTuning.jobs.create({
      training_file: fileId,
      model: modelName,
    });
    return fineTuningJob;
  } catch (error) {
    console.error("Error starting fine-tuning job:", error);
    throw error;
  }
}