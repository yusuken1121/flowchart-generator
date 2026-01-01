"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ARTICLE_CATEGORIES } from "../../../core/domain/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function HistoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("category") || "all";
  const initialTimeRange = searchParams.get("timeRange") || "all";

  const [category, setCategory] = useState(initialCategory);
  const [timeRange, setTimeRange] = useState(initialTimeRange);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category && category !== "all") {
      params.set("category", category);
    }
    if (timeRange && timeRange !== "all") {
      params.set("timeRange", timeRange);
    }

    const query = params.toString();
    const url = query ? `/history?${query}` : "/history";

    router.push(url);
  }, [category, timeRange, router]);

  return (
    <div className=" p-4 rounded-lg shadow-sm border  mb-6 flex flex-wrap gap-4 items-center">
      <div className="flex flex-col gap-1.5 min-w-[150px]">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          カテゴリ
        </label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="すべてのカテゴリ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのカテゴリ</SelectItem>
            {ARTICLE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 min-w-[150px]">
        <label className="text-xs font-semibold  uppercase tracking-wider">
          期間
        </label>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="期間を指定なし" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全期間</SelectItem>
            <SelectItem value="today">今日</SelectItem>
            <SelectItem value="week">今週</SelectItem>
            <SelectItem value="month">今月</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(category !== "all" || timeRange !== "all") && (
        <div className="flex items-end h-full pt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCategory("all");
              setTimeRange("all");
            }}
            className=""
          >
            リセット
          </Button>
        </div>
      )}
    </div>
  );
}
