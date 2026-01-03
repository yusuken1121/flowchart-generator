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
    <div className="bg-card p-4 rounded-lg shadow-sm border  mb-6 flex flex-wrap gap-4 items-center">
      <div className="flex flex-col gap-1.5 min-w-[150px]">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Category
        </label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
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
          Time Range
        </label>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
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
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
