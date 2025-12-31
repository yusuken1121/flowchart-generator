import { FlowchartData, FlowchartListItem } from "../domain/flowchart.types";

export interface IFlowchartRepository {
  // sourceUrl is optional (?)
  save(data: FlowchartData, sourceUrl?: string): Promise<void>;
  findAll(): Promise<FlowchartListItem[]>;
}
