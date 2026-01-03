import { IFlowchartRepository } from "../ports/IFlowchartRepository";
import {
  FlowchartFilterOptions,
  FlowchartListResponse,
} from "../domain/flowchart.types";

export class GetFlowchartHistoryUseCase {
  constructor(private repository: IFlowchartRepository) {}

  async execute(
    options?: FlowchartFilterOptions
  ): Promise<FlowchartListResponse> {
    return await this.repository.findAll(options);
  }
}
