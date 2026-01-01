"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FlowchartListItem } from "@/core/domain/flowchart.types";
import { isSameDay, parseISO } from "date-fns";
import Link from "next/link";
import { ja } from "date-fns/locale";

type CalendarViewProps = {
  items: FlowchartListItem[];
};

export function CalendarView({ items }: CalendarViewProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Create a Set of dates that have items for efficient lookup
  const datesWithItems = React.useMemo(() => {
    return items.map((item) => parseISO(item.createdAt));
  }, [items]);

  const selectedDateItems = React.useMemo(() => {
    if (!date) return [];
    return items.filter((item) => isSameDay(parseISO(item.createdAt), date));
  }, [items, date]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-1 md:col-span-2 lg:col-span-3 border shadow-sm">
        <CardHeader>
          <CardTitle>カレンダー</CardTitle>
          <CardDescription>日付を選択して履歴を確認できます。</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border shadow-sm bg-card"
            modifiers={{
              hasData: datesWithItems,
            }}
            modifiersStyles={{
              hasData: {
                fontWeight: "bold",
                textDecoration: "underline",
                color: "var(--primary)",
              },
            }}
            locale={ja}
          />
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-4 border shadow-sm flex flex-col h-full">
        <CardHeader className="border-b bg-muted/40 pb-4">
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary">📅</span>
            {date
              ? date.toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "日付を選択"}
          </CardTitle>
          <CardDescription>
            {selectedDateItems.length} 件の作成履歴
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {selectedDateItems.length > 0 ? (
            <div className="divide-y">
              {selectedDateItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/history/${item.id}`}
                  className="flex flex-col gap-1 p-4 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {new Date(item.createdAt).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {item.category && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground border">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.summary}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center min-h-[300px]">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <span className="text-2xl">📭</span>
              </div>
              <p>この日の履歴はありません</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/">新しく作成する</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from "@/components/ui/button";
