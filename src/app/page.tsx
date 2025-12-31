"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { generateFlowchart } from "./_actions/flowchart";
import { saveToNotion } from "./_actions/save";
import { FlowchartData } from "../core/domain/flowchart.types";
import MermaidChart from "../components/MermaidChart";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");
  const [data, setData] = useState<FlowchartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();

  const handleGenerate = () => {
    if (!input.trim()) return;
    
    setError(null);
    startTransition(async () => {
      try {
        const result = await generateFlowchart(input);
        setData(result);
      } catch (err) {
        console.error(err);
        setError("生成に失敗しました。もう一度お試しください。");
      }
    });
  };

  const handleSaveToNotion = () => {
    if (!data) return;

    startSaveTransition(async () => {
      const formData = new FormData();
      if (url.trim()) {
        formData.append("url", url);
      }
      
      const result = await saveToNotion(data, formData);
      if (result.success) {
        toast.success("Notionに保存しました！", {
          description: "中学生向けニュースDBに追加されました。",
          duration: 3000,
        });
      } else {
        toast.error("保存に失敗しました", {
          description: "時間をおいて再度お試しください。",
        });
      }
    });
  };

  return (
    <main className="min-h-screen p-8 bg-neutral-50 dark:bg-neutral-900 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-2 mb-12 relative">
          <div className="absolute right-0 top-0">
             <Link href="/history">
               <Button variant="ghost" className="text-neutral-500 hover:text-neutral-900">
                  📂 履歴を見る
               </Button>
             </Link>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
            News2Flow
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            難しいニュースを、わかりやすい図解と解説で。
          </p>
        </header>

        <Card className="border shadow-lg">
          <CardHeader className="bg-neutral-100/50 dark:bg-neutral-800/50">
            <CardTitle>ニュース記事を入力</CardTitle>
            <CardDescription>
              新聞やネットニュースの文章をここに貼り付けてください。<br/>
              中学生にもわかるように翻訳・図解します。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="news-input" className="sr-only">本文</Label>
              <Textarea
                id="news-input"
                placeholder="例：今日、国会で新しい予算案が可決されました..."
                className="min-h-[200px] text-base leading-relaxed resize-y"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            
             <div className="space-y-2">
              <Label htmlFor="url-input" className="text-sm text-neutral-500 ml-1">
                元記事のURL（任意）
              </Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://news.example.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-sm bg-neutral-50"
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
                    先生が考え中...
                  </>
                ) : (
                  "解説を作成する ✨"
                )}
              </Button>
            </div>
            {error && <p className="text-red-500 text-center font-medium bg-red-50 p-3 rounded-md">{error}</p>}
          </CardContent>
        </Card>

        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
             <div className="flex justify-between items-center bg-white dark:bg-neutral-800 p-4 rounded-lg border shadow-sm sticky top-4 z-10">
               <h3 className="font-bold text-neutral-600 dark:text-neutral-300">解説が完成しました！</h3>
                <Button 
                  onClick={handleSaveToNotion} 
                  disabled={isSaving}
                  variant="outline"
                  className="gap-2 border-neutral-300 hover:bg-neutral-100"
                >
                  {isSaving ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                     <Save className="w-4 h-4" />
                  )}
                  Notionに保存
                </Button>
             </div>

            <Card className="border-l-8 border-l-blue-500 shadow-xl overflow-hidden">
              <div className="bg-blue-500 text-white p-1 text-xs text-center font-bold tracking-widest uppercase">Summary</div>
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl font-bold leading-tight">{data.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {data.summary}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-neutral-800 dark:text-neutral-200">
                  <span className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-300">📊</span> 
                  流れでわかるフローチャート
                </h2>
                <Card className="overflow-hidden shadow-md border-2 border-neutral-100 dark:border-neutral-800">
                    <CardContent className="p-6 bg-white flex justify-center min-h-[300px] items-center">
                        <MermaidChart code={data.mermaidCode} />
                    </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-neutral-800 dark:text-neutral-200">
                  <span className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg text-amber-600 dark:text-amber-300">💡</span>
                  キーワード解説
                </h2>
                <div className="space-y-4">
                  {data.annotations.map((item, i) => (
                    <Card key={i} className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                          {item.term}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-base text-amber-800 dark:text-amber-200 leading-relaxed">
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
