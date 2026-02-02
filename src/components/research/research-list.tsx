"use strict";
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";

import { ExternalLink, Calendar, Tag, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ResearchNote {
  id?: string;
  title: string;
  category: string;
  sourceUrl?: string;
  content: string;
  timestamp?: string; // API returns strings for dates usually
}

export function ResearchList() {
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await fetch("/api/research/notes");
        if (!res.ok) throw new Error("Failed to fetch notes");
        const data = await res.json();
        setNotes(data.notes || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No research notes found. Start adding some!
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <Link
          href={`/research/${note.id}`}
          key={note.id || note.title}
          className="block h-full group"
        >
          <Card className="flex flex-col h-full hover:shadow-md transition-all duration-200 hover:border-primary/50 cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <Badge variant="secondary" className="mb-2">
                  {note.category}
                </Badge>
                {/* Prevent nested link clicks propagation if needed, but here simple click is fine. 
                    Actually, nested <a> tags are invalid HTML5 inside <Link>. 
                    We should probably stop propagation on the external link or remove it from here if it conflicts. 
                    Let's keep it but make it an object/button to avoid <a> inside <a> or prevent default.
                    Ideally, we use <object> trick or just separate actions.
                    For simplicity, let's keep the external link as a small button that stops propagation.
                */}
                {note.sourceUrl && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(note.sourceUrl, "_blank");
                    }}
                    className="text-muted-foreground hover:text-primary cursor-pointer z-10"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </div>
                )}
              </div>
              <CardTitle className="leading-tight text-lg line-clamp-2">
                {note.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-3">
              <div className="text-sm text-muted-foreground line-clamp-3">
                {note.content ? (
                  note.content
                ) : (
                  <span className="italic text-xs opacity-70">
                    Click to view details
                  </span>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {note.timestamp
                ? format(new Date(note.timestamp), "MMM d, yyyy")
                : "Unknown Date"}
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
