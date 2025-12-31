import { FlowchartData } from "../domain/flowchart.types";

export interface IFlowchartGenerator {
  generate(text: string): Promise<FlowchartData>;
}
