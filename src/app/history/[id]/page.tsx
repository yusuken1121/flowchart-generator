import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { NotionRepository } from "../../../infrastructure/notion/NotionRepository";
import { GetFlowchartByIdUseCase } from "../../../core/use-cases/GetFlowchartByIdUseCase";
import MermaidChart from "../../../components/MermaidChart";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { Button } from "../../../components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function DetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const repository = new NotionRepository();
  const useCase = new GetFlowchartByIdUseCase(repository);
  let item;

  try {
    item = await useCase.execute(id);
  } catch (e) {
    console.error("Failed to fetch history item:", e);
    // You might want to show a specific error page or message
  }

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen  py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/history">
            <Button
              variant="ghost"
              className="pl-0 hover:bg-transparent hover:text-primary gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to History
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden shadow-md">
          <CardHeader className="p-8 border-b bg-muted/20">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground items-center">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {item.sourceUrl && (
                  <>
                    <span className="text-border">|</span>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-xs"
                    >
                      Open Source ↗
                    </a>
                  </>
                )}
              </div>
              <CardTitle className="text-3xl font-bold leading-tight">
                {item.title}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-10">
            {/* Summary Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                <span className="w-1 h-5 bg-primary rounded-full"></span>
                Summary
              </h2>
              <div className="text-base leading-7 text-muted-foreground bg-muted/30 p-6 rounded-xl border">
                {item.summary}
              </div>
            </section>

            <Separator />

            {/* Flowchart Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                <span className="w-1 h-5 bg-primary rounded-full"></span>
                Flowchart
              </h2>
              <div className="bg-background border rounded-xl overflow-hidden shadow-sm p-2">
                <MermaidChart code={item.mermaidCode} />
              </div>
            </section>

            {item.annotations && item.annotations.length > 0 && (
              <>
                <Separator />
                {/* Annotations Section */}
                <section>
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-foreground">
                    <span className="w-1 h-5 bg-primary rounded-full"></span>
                    Terminology
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {item.annotations.map((annotation, index) => (
                      <Card
                        key={index}
                        className="shadow-sm hover:shadow-md transition-shadow duration-200 border-muted-foreground/20"
                      >
                        <CardHeader className="p-4 bg-muted/10 border-b space-y-0">
                          <CardTitle className="font-bold text-sm text-foreground">
                            {annotation.term}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 text-sm text-muted-foreground leading-relaxed">
                          {annotation.definition}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
