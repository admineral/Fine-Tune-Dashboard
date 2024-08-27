'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { generateQAPairs, saveQAPairs, createJSONLFile, uploadJSONLFile, startFineTuning } from "./actions"
import { z } from 'zod'
import Link from 'next/link'
import { Home } from 'lucide-react'

const QAPair = z.object({
  question: z.string(),
  answer: z.string(),
});

function QAPairList({ pairs }: { pairs: z.infer<typeof QAPair>[] }) {
  const [selectedPairs, setSelectedPairs] = useState<Set<number>>(new Set());

  const togglePair = (index: number) => {
    setSelectedPairs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSaveSelected = async () => {
    const selectedData = pairs.filter((_, index) => selectedPairs.has(index));
    try {
      await saveQAPairs(selectedData);
      toast({
        title: "Success",
        description: "Selected Q&A pairs have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Q&A pairs.",
        variant: "destructive",
      });
    }
  };

  const handleCreateJSONL = async () => {
    const selectedData = pairs.filter((_, index) => selectedPairs.has(index));
    try {
      const jsonlContent = await createJSONLFile(selectedData);
      
      // Create a Blob with the JSONL content
      const blob = new Blob([jsonlContent], { type: 'application/jsonl' });
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qa_pairs.jsonl';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "JSONL file has been created and downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create JSONL file.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex justify-between items-center">
          Generated Q&A Pairs
          <div>
            <Button onClick={handleSaveSelected} disabled={selectedPairs.size === 0} className="mr-2">
              Save Selected ({selectedPairs.size})
            </Button>
            <Button onClick={handleCreateJSONL} disabled={selectedPairs.size === 0}>
              Create JSONL
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {pairs.map((pair, index) => (
            <li key={index} className="border p-4 rounded-lg bg-white shadow">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={`pair-${index}`}
                  checked={selectedPairs.has(index)}
                  onCheckedChange={() => togglePair(index)}
                />
                <div className="flex-grow">
                  <label htmlFor={`pair-${index}`} className="font-semibold text-lg text-gray-800 block mb-2 cursor-pointer">
                    {pair.question}
                  </label>
                  <p className="text-gray-600">{pair.answer}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function TrainModelSection({ pairs }: { pairs: z.infer<typeof QAPair>[] }) {
  const [modelName, setModelName] = useState('gpt-4o-2024-08-06');
  const [isUploading, setIsUploading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  const [trainingResult, setTrainingResult] = useState<any>(null);

  const handleUploadJSONL = async () => {
    setIsUploading(true);
    try {
      const jsonlContent = await createJSONLFile(pairs);
      const uploadedFileId = await uploadJSONLFile(jsonlContent);
      setFileId(uploadedFileId);
      toast({
        title: "Success",
        description: "JSONL file has been uploaded for training.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload JSONL file for training.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartTraining = async () => {
    if (!fileId) {
      toast({
        title: "Error",
        description: "Please upload a JSONL file first.",
        variant: "destructive",
      });
      return;
    }

    setIsTraining(true);
    try {
      const result = await startFineTuning(fileId, modelName);
      setTrainingResult(result);
      toast({
        title: "Success",
        description: "Fine-tuning job has been started.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start fine-tuning job.",
        variant: "destructive",
      });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Train Model</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="modelName">Model Name</Label>
            <Input
              id="modelName"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Enter model name"
              className="mt-1"
            />
          </div>
          <Button onClick={handleUploadJSONL} disabled={isUploading}>
            {isUploading ? 'Uploading JSONL...' : 'Upload JSONL'}
          </Button>
          <Button onClick={handleStartTraining} disabled={isTraining || !fileId}>
            {isTraining ? 'Starting Training...' : 'Start Training'}
          </Button>
          {trainingResult && (
            <div className="mt-4">
              <h3 className="font-semibold">Training Job Started:</h3>
              <pre className="bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                {JSON.stringify(trainingResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DataPreparationPage() {
  const [topic, setTopic] = useState('')
  const [numPairs, setNumPairs] = useState(10)
  const [generatedPairs, setGeneratedPairs] = useState<z.infer<typeof QAPair>[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setGeneratedPairs(null)

    try {
      const result = await generateQAPairs(topic, numPairs)
      setGeneratedPairs(result.pairs)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred')
    }
  }

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Data Preparation</h1>
        <Link href="/" passHref>
          <Button variant="outline" className="flex items-center">
            <Home className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>
      
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Generate Q&A Pairs</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="topic" className="block text-sm font-medium text-gray-700">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="numPairs" className="block text-sm font-medium text-gray-700">Number of Pairs</Label>
              <Input
                id="numPairs"
                type="number"
                value={numPairs}
                onChange={(e) => setNumPairs(parseInt(e.target.value))}
                min="10"
                max="50"
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full">Generate Q&A Pairs</Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {generatedPairs && (
        <>
          <QAPairList pairs={generatedPairs} />
          <TrainModelSection pairs={generatedPairs} />
        </>
      )}
    </div>
  )
}