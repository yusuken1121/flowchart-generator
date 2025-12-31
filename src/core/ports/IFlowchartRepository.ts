import { FlowchartData, FlowchartListItem, FlowchartDetail, FlowchartFilterOptions } from "../domain/flowchart.types";

export interface IFlowchartRepository {
  // sourceUrl is optional (?)
  save(data: FlowchartData, sourceUrl?: string): Promise<void>;
  findAll(options?: FlowchartFilterOptions): Promise<FlowchartListItem[]>;
  findById(id: string): Promise<FlowchartDetail | null>;
}
