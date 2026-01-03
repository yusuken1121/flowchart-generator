import { GetFlowchartHistoryUseCase } from "@/core/use-cases/GetFlowchartHistoryUseCase";
import { NotionRepository } from "@/infrastructure/notion/NotionRepository";
import { CalendarView } from "./_components/CalendarView";
import { FlowchartListItem } from "@/core/domain/flowchart.types";
import PageTitle from "@/components/pageTitle";

// Revalidate every hour
export const revalidate = 3600;

export default async function CalendarPage() {
  const repository = new NotionRepository();
  const useCase = new GetFlowchartHistoryUseCase(repository);
  let items: FlowchartListItem[] = [];

  try {
    const response = await useCase.execute({ limit: 100 }); // Fetch more for calendar
    items = response.items;
  } catch (error) {
    console.error("Failed to fetch history for calendar:", error);
  }

  return (
    <div className="container mx-auto py-10">
      <PageTitle title="History Calendar" />
      <CalendarView items={items} />
    </div>
  );
}
