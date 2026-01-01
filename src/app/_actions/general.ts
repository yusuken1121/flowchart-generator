"use server";

import { GeminiAdapter } from "../../infrastructure/gemini/GeminiAdapter";
import { GenerateFlowchartUseCase } from "../../core/use-cases/GenerateFlowchartUseCase";
import { FlowchartData } from "../../core/domain/flowchart.types";

export async function generateGeneralFlowchart(
  text: string
): Promise<FlowchartData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const adapter = new GeminiAdapter(apiKey);
  const useCase = new GenerateFlowchartUseCase(adapter);

  return useCase.execute(text, "general");
}
