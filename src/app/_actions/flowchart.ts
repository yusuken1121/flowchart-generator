"use server";

import { GeminiAdapter } from "../../infrastructure/gemini/GeminiAdapter";
import { GenerateFlowchartUseCase } from "../../core/use-cases/GenerateFlowchartUseCase";
import { FlowchartData } from "../../core/domain/flowchart.types";

export async function generateFlowchart(text: string): Promise<FlowchartData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const adapter = new GeminiAdapter(apiKey);
  const useCase = new GenerateFlowchartUseCase(adapter);

  return useCase.execute(text);
}

import { NotionRepository } from "../../infrastructure/notion/NotionRepository";
import { GetFlowchartHistoryUseCase } from "../../core/use-cases/GetFlowchartHistoryUseCase";
import {
  FlowchartFilterOptions,
  FlowchartListResponse,
} from "../../core/domain/flowchart.types";

export async function searchFlowcharts(
  keyword: string
): Promise<FlowchartListResponse> {
  const repository = new NotionRepository();
  const useCase = new GetFlowchartHistoryUseCase(repository);
  const filter: FlowchartFilterOptions = {
    keyword,
    limit: 50,
  };
  return useCase.execute(filter);
}
