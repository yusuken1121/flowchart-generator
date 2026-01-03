import Link from "next/link";
import {
  formatDistanceToNow,
  startOfDay,
  startOfWeek,
  startOfMonth,
} from "date-fns";
import { ja } from "date-fns/locale";
import { NotionRepository } from "../../infrastructure/notion/NotionRepository";
import { GetFlowchartHistoryUseCase } from "../../core/use-cases/GetFlowchartHistoryUseCase";
import { HistoryFilter } from "./_components/HistoryFilter";
import { HistoryPagination } from "./_components/HistoryPagination";
import {
  FlowchartFilterOptions,
  FlowchartListResponse,
} from "../../core/domain/flowchart.types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import PageTitle from "@/components/pageTitle";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function HistoryPage({ searchParams }: Props) {
  const repository = new NotionRepository();
  const useCase = new GetFlowchartHistoryUseCase(repository);
  let response: FlowchartListResponse | null = null;
  let error;

  const category =
    typeof searchParams.category === "string"
      ? searchParams.category
      : undefined;
  const timeRange =
    typeof searchParams.timeRange === "string"
      ? searchParams.timeRange
      : undefined;
  const cursor =
    typeof searchParams.cursor === "string" ? searchParams.cursor : undefined;

  let startDate: Date | undefined;
  const now = new Date();

  if (timeRange === "today") {
    startDate = startOfDay(now);
  } else if (timeRange === "week") {
    startDate = startOfWeek(now, { weekStartsOn: 1 });
  } else if (timeRange === "month") {
    startDate = startOfMonth(now);
  }

  const filterOptions: FlowchartFilterOptions = {
    category,
    startDate,
    cursor,
    limit: 12, // Page size
  };

  try {
    response = await useCase.execute(filterOptions);
  } catch (e) {
    console.error("Failed to fetch history:", e);
    error = "Failed to fetch history. Please check Notion settings.";
  }

  const historyItems = response?.items || [];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <PageTitle title="History" />
          <Link
            href="/"
            className="text-primary hover:text-primary/80 font-medium"
          >
            ← Create New
          </Link>
        </div>

        <HistoryFilter />

        {error && (
          <div className="bg-destructive/10 border-l-4 border-destructive p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-destructive"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!error && historyItems.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg shadow border">
            <p className="text-muted-foreground">
              No history found matching the criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {historyItems.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow duration-200 overflow-hidden group p-0 gap-0"
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

            {response && (
              <HistoryPagination
                nextCursor={response.nextCursor}
                hasMore={response.hasMore}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
