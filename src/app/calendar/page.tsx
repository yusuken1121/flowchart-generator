import { GetFlowchartHistoryUseCase } from "@/core/use-cases/GetFlowchartHistoryUseCase";
import { NotionRepository } from "@/infrastructure/notion/NotionRepository";
import { CalendarView } from "./_components/CalendarView";
import { FlowchartListItem } from "@/core/domain/flowchart.types";

// Revalidate every hour
export const revalidate = 3600;

export default async function CalendarPage() {
  const repository = new NotionRepository();
  const useCase = new GetFlowchartHistoryUseCase(repository);
  let items: FlowchartListItem[] = [];

  try {
    items = await useCase.execute();
  } catch (error) {
    console.error("Failed to fetch history for calendar:", error);
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-8 text-foreground">
        履歴カレンダー
      </h1>
      <CalendarView items={items} />
    </div>
  );
}
