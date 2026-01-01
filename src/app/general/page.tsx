"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { generateGeneralFlowchart } from "../_actions/general";
import { FlowchartData } from "../../core/domain/flowchart.types";
import FlowchartDisplay from "../../components/FlowchartDisplay";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function GeneralPage() {
  const [input, setInput] = useState("");
  const [data, setData] = useState<FlowchartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    if (!input.trim()) return;

    setError(null);
    startTransition(async () => {
      try {
        const result = await generateGeneralFlowchart(input);
        setData(result);
      } catch (err) {
        console.error(err);
        setError("生成に失敗しました。もう一度お試しください。");
      }
    });
  };

  return (
    <main className="min-h-screen p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-2 mb-12 relative">
          <div className="absolute right-0 top-0">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                🏠 ホームに戻る
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-glow-effect text-glow-general">
            Conversation Flow
          </h1>
          <p className="text-lg text-muted-foreground">
            あらゆる話の流れを、わかりやすい図解と解説で。
          </p>
        </header>

        <Card className="border shadow-lg">
          <CardHeader className="bg-muted/50">
            <CardTitle>テキストを入力</CardTitle>
            <CardDescription>
              会話、会議録、説明文などをここに貼り付けてください。
              <br />
              話の構造や論理の流れを可視化します。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="text-input" className="sr-only">
                本文
              </Label>
              <Textarea
                id="text-input"
                placeholder="例：Aさん: 今回のプロジェクトについてですが... Bさん: 私はこう思います..."
                className="min-h-[200px] text-base leading-relaxed resize-y bg-background"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleGenerate}
                disabled={isPending || !input.trim()}
                className="w-full md:w-auto px-8 py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                size="lg"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    解析中...
                  </>
                ) : (
                  "フローを作成する"
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

        {data && <FlowchartDisplay data={data} mode="general" />}
      </div>
    </main>
  );
}
