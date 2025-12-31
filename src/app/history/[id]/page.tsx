import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { NotionRepository } from "../../../infrastructure/notion/NotionRepository";
import { GetFlowchartByIdUseCase } from "../../../core/use-cases/GetFlowchartByIdUseCase";
import MermaidChart from "../../../components/MermaidChart";

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/history"
            className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
          >
            ← 履歴一覧に戻る
          </Link>
        </div>

        <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 items-center">
              <span>
                作成日: {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                  locale: ja,
                })}
              </span>
              {item.sourceUrl && (
                <>
                  <span className="text-gray-300">|</span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                  >
                    元記事を開く ↗
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="p-8 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                要約
              </h2>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                {item.summary}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                フローチャート
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                 <MermaidChart code={item.mermaidCode} />
              </div>
            </section>

            {item.annotations && item.annotations.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                  用語解説
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {item.annotations.map((annotation, index) => (
                    <div key={index} className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                      <dt className="font-bold text-indigo-900 mb-1">{annotation.term}</dt>
                      <dd className="text-sm text-indigo-800 leading-relaxed">{annotation.definition}</dd>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
