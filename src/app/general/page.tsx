"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { generateGeneralFlowchart } from "../_actions/general";
import { FlowchartData } from "../../core/domain/flowchart.types";
import MermaidChart from "../../components/MermaidChart";
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
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
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

        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            <div className="bg-card p-4 rounded-lg border shadow-sm flex items-center justify-between">
              <h3 className="font-bold text-card-foreground">解析完了</h3>
              <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                {data.category || "General"}
              </span>
            </div>

            <Card className="border-l-8 border-l-purple-500 shadow-xl overflow-hidden">
              <div className="bg-purple-500 text-white p-1 text-xs text-center font-bold tracking-widest uppercase">
                Summary
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl font-bold leading-tight">
                  {data.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-card-foreground leading-relaxed">
                  {data.summary}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                  <span className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg text-purple-600 dark:text-purple-300">
                    📊
                  </span>
                  話の流れフローチャート
                </h2>
                <Card className="overflow-hidden shadow-md border-2 border-muted">
                  <CardContent className="p-6 bg-white dark:bg-black/20 flex justify-center min-h-[300px] items-center">
                    <MermaidChart code={data.mermaidCode} />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                  <span className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg text-pink-600 dark:text-pink-300">
                    💡
                  </span>
                  キーワード・トピック解説
                </h2>
                <div className="space-y-4">
                  {data.annotations.map((item, i) => (
                    <Card
                      key={i}
                      className="bg-pink-50/50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-900/50 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg font-bold text-pink-900 dark:text-pink-100 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-pink-500 inline-block"></span>
                          {item.term}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-base text-pink-800 dark:text-pink-200 leading-relaxed">
                        {item.definition}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
