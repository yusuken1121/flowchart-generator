import {
  FlowchartData,
  FlowchartDetail,
  FlowchartFilterOptions,
  FlowchartListResponse,
} from "../domain/flowchart.types";

export interface IFlowchartRepository {
  // sourceUrl is optional (?)
  save(data: FlowchartData, sourceUrl?: string): Promise<void>;
  findAll(options?: FlowchartFilterOptions): Promise<FlowchartListResponse>;
  findById(id: string): Promise<FlowchartDetail | null>;
}
