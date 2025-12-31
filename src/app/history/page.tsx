import Link from "next/link";
import { formatDistanceToNow, startOfDay, startOfWeek, startOfMonth } from "date-fns";
import { ja } from "date-fns/locale";
import { NotionRepository } from "../../infrastructure/notion/NotionRepository";
import { GetFlowchartHistoryUseCase } from "../../core/use-cases/GetFlowchartHistoryUseCase";
import { HistoryFilter } from "./_components/HistoryFilter";
import { FlowchartFilterOptions } from "../../core/domain/flowchart.types";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function HistoryPage({ searchParams }: Props) {
  const repository = new NotionRepository();
  const useCase = new GetFlowchartHistoryUseCase(repository);
  let historyItems;
  let error;

  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const timeRange = typeof searchParams.timeRange === "string" ? searchParams.timeRange : undefined;

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
    category: category,
    startDate: startDate,
  };

  try {
    historyItems = await useCase.execute(filterOptions);
  } catch (e) {
    console.error("Failed to fetch history:", e);
    error = "履歴の取得に失敗しました。Notionの設定を確認してください。";
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">作成履歴</h1>
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← 新しく作成する
          </Link>
        </div>

        <HistoryFilter />

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
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
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!error && (!historyItems || historyItems.length === 0) ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">条件に一致する履歴はありません。</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {historyItems?.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 flex flex-col group"
              >
                <Link href={`/history/${item.id}`} className="block flex-1 p-6">
                  <div className="flex flex-col gap-2 mb-3">
                     {item.category && (
                        <span className="self-start inline-flex items-center rounded-sm bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {item.category}
                        </span>
                     )}
                     <h2 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                     </h2>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                    {item.summary}
                  </p>
                </Link>
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100">
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
                      className="text-indigo-600 hover:text-indigo-800 hover:underline truncate max-w-[150px]"
                    >
                      元記事を開く ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
