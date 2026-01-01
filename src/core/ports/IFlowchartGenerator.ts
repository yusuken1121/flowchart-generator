import { FlowchartData } from "../domain/flowchart.types";

export interface IFlowchartGenerator {
  generate(text: string, mode?: "news" | "general"): Promise<FlowchartData>;
}
