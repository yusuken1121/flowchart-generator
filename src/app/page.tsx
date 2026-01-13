"use client";

import { useState, useTransition } from "react";
import { generateFlowchart } from "./_actions/flowchart";
import { saveToNotion } from "./_actions/save";
import { FlowchartData } from "../core/domain/flowchart.types";
import { ARTICLE_CATEGORIES } from "../core/domain/categories";
import FlowchartDisplay from "../components/FlowchartDisplay";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

// ... imports

export default function Home() {
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<string>("");
  const [data, setData] = useState<FlowchartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();

  const handleGenerate = () => {
    if (!input.trim()) return;

    setError(null);
    setChatHistory(""); // Reset chat history on new generation
    startTransition(async () => {
      try {
        const result = await generateFlowchart(input);
        setData(result);
      } catch (err) {
        console.error(err);
        setError("Generation failed. Please try again.");
      }
    });
  };

  const handleSaveToNotion = () => {
    if (!data) return;

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    startSaveTransition(async () => {
      const formData = new FormData();
      if (url.trim()) {
        formData.append("url", url);
      }

      const sessionData: FlowchartData = { ...data, category, chatHistory };

      const result = await saveToNotion(sessionData, formData);
      if (result.success) {
        toast.success("Saved to Notion!", {
          description: "Added to DB.",
          duration: 3000,
        });
      } else {
        toast.error("Failed to save", {
          description: "Please try again later.",
        });
      }
    });
  };

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-2 mb-12 relative">
          <h1 className="text-4xl font-extrabold tracking-tight text-glow-effect text-glow-news">
            News2Flow
          </h1>
          <p className="text-lg text-muted-foreground">
            Understand complex news with clear diagrams and explanations.
          </p>
        </header>

        <Card className="border shadow-lg">
          <CardHeader className="bg-muted/50">
            <CardTitle>Input News Article</CardTitle>
            <CardDescription>
              Paste the text of a newspaper or online news article here.
              <br />
              Translated and illustrated for easy understanding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="news-input" className="sr-only">
                Body
              </Label>
              <Textarea
                id="news-input"
                placeholder="Ex: Today, a new budget bill was passed in current parliament..."
                className="min-h-[200px] text-base leading-relaxed resize-y bg-background"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="url-input"
                className="text-sm text-muted-foreground ml-1"
              >
                Source URL (Optional)
              </Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://news.example.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-sm bg-background"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleGenerate}
                disabled={isPending || !input.trim()}
                className="w-full md:w-auto px-8 py-6 text-lg"
                size="lg"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Explanation"
                )}
              </Button>
            </div>
            {error && (
              <p className="text-destructive text-center font-medium bg-destructive/10 p-3 rounded-md">
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        {data && (
          <FlowchartDisplay
            data={data}
            mode="news"
            headerContent={
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <div className="w-full sm:w-[180px]">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {ARTICLE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleSaveToNotion}
                  disabled={isSaving}
                  variant="outline"
                  className="w-full sm:w-auto gap-2 whitespace-nowrap"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save to Notion
                </Button>
              </div>
            }
            categoryContent={
              <span className="inline-flex items-center rounded-md bg-blue-50/50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-300/30">
                {category || "No Category Selected"}
              </span>
            }
            onChatHistoryChange={setChatHistory}
          />
        )}
      </div>
    </>
  );
}
