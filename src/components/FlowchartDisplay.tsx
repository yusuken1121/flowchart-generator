import { ReactNode } from "react";
import { FlowchartData } from "../core/domain/flowchart.types";
import MermaidChart from "./MermaidChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ThemeConfig = {
  primary: {
    border: string;
    bg: string;
    text: string;
    iconBg: string; // for Summary icon
    iconText: string;
  };
  chart: {
    iconBg: string;
    iconText: string;
  };
  annotations: {
    iconBg: string;
    iconText: string;
    cardBg: string;
    cardBorder: string;
    textTitle: string;
    textContent: string;
    dot: string;
  };
};

const THEMES: Record<"news" | "general", ThemeConfig> = {
  news: {
    primary: {
      border: "border-l-blue-500",
      bg: "bg-blue-500",
      text: "text-blue-700",
      iconBg: "bg-blue-50/50 dark:bg-blue-900/30",
      iconText: "text-blue-700 dark:text-blue-300",
    },
    chart: {
      iconBg: "bg-blue-100 dark:bg-blue-900",
      iconText: "text-blue-600 dark:text-blue-300",
    },
    annotations: {
      iconBg: "bg-amber-100 dark:bg-amber-900",
      iconText: "text-amber-600 dark:text-amber-300",
      cardBg: "bg-amber-50/50 dark:bg-amber-950/20",
      cardBorder: "border-amber-200 dark:border-amber-900/50",
      textTitle: "text-amber-900 dark:text-amber-100",
      textContent: "text-amber-800 dark:text-amber-200",
      dot: "bg-amber-500",
    },
  },
  general: {
    primary: {
      border: "border-l-purple-500",
      bg: "bg-purple-500",
      text: "text-purple-800", // Adjusted from original to match logic
      iconBg: "bg-purple-100", // Header badge
      iconText: "text-purple-800",
    },
    chart: {
      iconBg: "bg-purple-100 dark:bg-purple-900",
      iconText: "text-purple-600 dark:text-purple-300",
    },
    annotations: {
      iconBg: "bg-pink-100 dark:bg-pink-900",
      iconText: "text-pink-600 dark:text-pink-300",
      cardBg: "bg-pink-50/50 dark:bg-pink-950/20",
      cardBorder: "border-pink-200 dark:border-pink-900/50",
      textTitle: "text-pink-900 dark:text-pink-100",
      textContent: "text-pink-800 dark:text-pink-200",
      dot: "bg-pink-500",
    },
  },
};

type FlowchartDisplayProps = {
  data: FlowchartData;
  mode?: "news" | "general";
  headerContent?: ReactNode;
  categoryContent?: ReactNode; // Alternative to simple text category
};

export default function FlowchartDisplay({
  data,
  mode = "news",
  headerContent,
  categoryContent,
}: FlowchartDisplayProps) {
  const theme = THEMES[mode];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm sticky top-4 z-10 gap-4">
        <h3 className="font-bold text-card-foreground whitespace-nowrap">
          {mode === "news" ? "解説が完成しました！" : "解析完了"}
        </h3>

        <div className="flex items-center gap-2 flex-1 justify-end">
          {headerContent ? (
            headerContent
          ) : (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
                theme.primary.iconBg,
                theme.primary.iconText
              )}
            >
              {data.category ||
                (mode === "news" ? "カテゴリ未選択" : "General")}
            </span>
          )}
        </div>
      </div>

      <div
        className={cn(
          "glow-border",
          mode === "news" ? "glow-border-news" : "glow-border-general"
        )}
      >
        <Card
          className={cn(
            "border-l-8 shadow-xl overflow-hidden relative bg-card",
            theme.primary.border
          )}
        >
          <div
            className={cn(
              "text-white p-1 text-xs text-center font-bold tracking-widest uppercase",
              theme.primary.bg
            )}
          >
            Summary
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold leading-tight">
              {data.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              {categoryContent ? (
                categoryContent
              ) : (
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                    theme.primary.iconBg,
                    theme.primary.iconText
                  )}
                >
                  {data.category || "カテゴリ未選択"}
                </span>
              )}
            </div>
            <p className="text-xl text-card-foreground leading-relaxed">
              {data.summary}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
            <span
              className={cn(
                "p-2 rounded-lg",
                theme.chart.iconBg,
                theme.chart.iconText
              )}
            >
              📊
            </span>
            {mode === "news"
              ? "流れでわかるフローチャート"
              : "話の流れフローチャート"}
          </h2>
          <div
            className={cn(
              "glow-border",
              mode === "news" ? "glow-border-news" : "glow-border-general"
            )}
          >
            <Card className="overflow-hidden shadow-md border-2 border-muted relative bg-card">
              <CardContent className="p-6 bg-white dark:bg-black/20 flex justify-center min-h-[400px] items-center">
                <MermaidChart code={data.mermaidCode} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
            <span
              className={cn(
                "p-2 rounded-lg",
                theme.annotations.iconBg,
                theme.annotations.iconText
              )}
            >
              💡
            </span>
            {mode === "news" ? "キーワード解説" : "キーワード・トピック解説"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.annotations.map((item, i) => (
              <Card
                key={i}
                className={cn(
                  "shadow-sm hover:shadow-md transition-shadow h-full",
                  theme.annotations.cardBg,
                  theme.annotations.cardBorder
                )}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle
                    className={cn(
                      "text-lg font-bold flex items-center gap-2",
                      theme.annotations.textTitle
                    )}
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full inline-block flex-shrink-0",
                        theme.annotations.dot
                      )}
                    ></span>
                    {item.term}
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className={cn(
                    "p-4 pt-0 text-base leading-relaxed",
                    theme.annotations.textContent
                  )}
                >
                  {item.definition}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
