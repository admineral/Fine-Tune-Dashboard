'use server'

import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const QAPair = z.object({
  question: z.string(),
  answer: z.string(),
});

const QAPairs = z.object({
  pairs: z.array(QAPair),
});

export async function generateQAPairs(topic: string, numPairs: number) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: "You are a Data Preparation Assistant. Generate Q&A pairs for a dataset."
        },
        {
          role: "user",
          content: `Generate ${numPairs} Q&A pairs about the following topic: ${topic}. Ensure the answers are concise and factual. Respond with a JSON object containing an array called 'pairs', where each pair has 'question' and 'answer' fields.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (content) {
      const parsedContent = JSON.parse(content);
      return QAPairs.parse(parsedContent);
    } else {
      throw new Error("No content in the response");
    }
  } catch (error) {
    console.error("Error generating Q&A pairs:", error);
    throw error;
  }
}

export async function saveQAPairs(pairs: z.infer<typeof QAPair>[]) {
  // Implement your save logic here
  console.log('Saving Q&A pairs:', pairs);
  return true;
}

export async function createJSONLFile(pairs: z.infer<typeof QAPair>[]) {
  const jsonlContent = pairs.map(pair => JSON.stringify({
    messages: [
      { role: "user", content: pair.question },
      { role: "assistant", content: pair.answer }
    ]
  })).join('\n');
  return jsonlContent;
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