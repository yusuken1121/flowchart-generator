"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle from "@/components/pageTitle";

export default function SearchPage() {
  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <PageTitle title="Search Flowcharts" />

      <div className="flex w-full items-center space-x-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search keywords..."
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["Economy", "Science", "Politics", "Space"].map((tag) => (
                <div
                  key={tag}
                  className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-secondary/80"
                >
                  {tag}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-12 text-muted-foreground">
          Enter a keyword to start searching your flowchart history.
        </div>
      </div>
    </div>
  );
}
