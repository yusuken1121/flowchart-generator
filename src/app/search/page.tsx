"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import PageTitle from "@/components/pageTitle";
import { searchFlowcharts } from "@/app/_actions/flowchart";
import { FlowchartListItem } from "@/core/domain/flowchart.types";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export default function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<FlowchartListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent, term?: string) => {
    if (e) e.preventDefault();
    const searchTerm = term || keyword;
    if (!searchTerm.trim()) return;

    if (term) setKeyword(term);

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await searchFlowcharts(searchTerm);
      setResults(response.items);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <PageTitle title="Search Flowcharts" />

      <form
        onSubmit={handleSearch}
        className="flex w-full items-center space-x-2 mb-8"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search keywords..."
            className="pl-10 pr-10"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          {keyword && (
            <button
              type="button"
              onClick={() => {
                setKeyword("");
                setHasSearched(false);
                setResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Search
        </Button>
      </form>
      <div className="grid gap-4">
        {!hasSearched && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Searches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["トランプ", "ベネズエラ", "株", "高市"].map((tag) => (
                  <div
                    key={tag}
                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleSearch(undefined, tag)}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {hasSearched && results.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            No results found for {keyword}.
          </div>
        )}

        {results.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-md transition-shadow duration-200 overflow-hidden group p-0 gap-0 flex flex-col"
              >
                <Link href={`/history/${item.id}`} className="block flex-1">
                  <CardHeader className="p-6 pb-2 space-y-3">
                    {item.category && (
                      <span className="self-start inline-flex items-center rounded-sm bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {item.category}
                      </span>
                    )}
                    <CardTitle className="text-xl font-bold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <CardDescription className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {item.summary}
                    </CardDescription>
                  </CardContent>
                </Link>
                <CardFooter className="bg-muted/50 px-6 py-4 flex justify-between items-center text-xs text-muted-foreground border-t mt-auto">
                  <span>
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </span>
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate max-w-[150px]"
                    >
                      Open Source ↗
                    </a>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
