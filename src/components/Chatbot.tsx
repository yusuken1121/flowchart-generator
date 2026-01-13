"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { chatWithAI } from "@/app/_actions/flowchart";

interface ChatbotProps {
  context: string; // The article/flowchart context
  initialHistory?: string;
  onHistoryChange?: (history: string) => void;
}

interface Message {
  role: "user" | "model";
  content: string;
}

export default function Chatbot({
  context,
  initialHistory,
  onHistoryChange,
}: ChatbotProps) {
  // Parse initial history into messages
  const parseHistory = (history: string): Message[] => {
    if (!history) return [];
    return history
      .split(/\n\n(?=(?:User|AI): )/)
      .map((line) => {
        const match = line.match(/^(User|AI): ([\s\S]*)$/);
        if (match) {
          return {
            role: match[1] === "User" ? "user" : "model",
            content: match[2],
          };
        }
        return null;
      })
      .filter((m): m is Message => m !== null);
  };

  const [messages, setMessages] = useState<Message[]>(() =>
    parseHistory(initialHistory || "")
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (onHistoryChange) {
      const historyText = messages
        .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
        .join("\n\n");
      onHistoryChange(historyText);
    }
  }, [messages, onHistoryChange]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare history for Gemini (exclude current message)
      const historyForAi = messages.map((m) => ({
        role: m.role,
        parts: m.content,
      }));

      const response = await chatWithAI(
        context,
        historyForAi,
        userMessage.content
      );

      const updatedMessages = [
        ...newMessages,
        { role: "model" as const, content: response },
      ];
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[500px] shadow-md border-muted-foreground/20">
      <CardHeader className="border-b bg-muted/10 py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm mt-8">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Ask questions about this article!</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "model" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    ul: ({ ...props }) => (
                      <ul className="list-disc pl-4 my-2" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol className="list-decimal pl-4 my-2" {...props} />
                    ),
                    p: ({ ...props }) => (
                      <p className="my-1 leading-relaxed" {...props} />
                    ),
                    a: ({ ...props }) => (
                      <a
                        className="underline font-medium hover:opacity-80"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                    code: ({ className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || "");
                      return match ? (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      ) : (
                        <code
                          className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 font-mono text-xs"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted px-4 py-2 rounded-lg flex items-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
        <form
          onSubmit={handleSend}
          className="p-4 border-t bg-background flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
