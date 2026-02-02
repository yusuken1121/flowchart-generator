"use strict";
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface ResearchNote {
  id: string;
  title: string;
  category: string;
  sourceUrl?: string;
  content: string;
  timestamp: string;
}

export default function ResearchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [note, setNote] = useState<ResearchNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNote() {
      if (!id) return;

      try {
        const res = await fetch(`/api/research/notes/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Note not found");
          throw new Error("Failed to load note");
        }
        const data = await res.json();
        setNote(data.note);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchNote();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Error Loading Note</h2>
        <p className="text-muted-foreground mb-4">
          {error || "Note could not be found."}
        </p>
        <Button onClick={() => router.push("/research")}>Return to List</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Link
        href="/research"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Research
      </Link>

      <article className="prose dark:prose-invert max-w-none">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-foreground">
            {note.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <Badge
              variant="secondary"
              className="px-3 py-1 text-sm font-medium"
            >
              {note.category}
            </Badge>

            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(note.timestamp), "MMM d, yyyy")}</span>
            </div>

            {note.sourceUrl && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <a
                  href={note.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Source
                </a>
              </>
            )}
          </div>
        </div>

        <Card className="border-0 shadow-sm bg-card/50">
          <CardContent className="pt-6">
            <div className="whitespace-pre-wrap leading-relaxed">
              {note.content || (
                <span className="text-muted-foreground italic">
                  No content content available.
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </article>
    </div>
  );
}
