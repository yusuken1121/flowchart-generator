"use server";

import { NotionRepository } from "../../infrastructure/notion/NotionRepository";
import { SaveFlowchartUseCase } from "../../core/use-cases/SaveFlowchartUseCase";
import { FlowchartData } from "../../core/domain/flowchart.types";

export async function saveToNotion(data: FlowchartData, formData: FormData) {
  try {
    const url = formData.get("url") as string;
    // Treat empty string as undefined
    const sourceUrl = url && url.trim() !== "" ? url : undefined;

    const repository = new NotionRepository();
    const useCase = new SaveFlowchartUseCase(repository);

    await useCase.execute(data, sourceUrl);
    return { success: true };
  } catch (error) {
    console.error("Failed to save to Notion:", error);
    return { success: false, error: "Failed to save to Notion" };
  }
}
