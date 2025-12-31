import { IFlowchartRepository } from "../ports/IFlowchartRepository";
import { FlowchartListItem, FlowchartFilterOptions } from "../domain/flowchart.types";

export class GetFlowchartHistoryUseCase {
  constructor(private repository: IFlowchartRepository) {}

  async execute(options?: FlowchartFilterOptions): Promise<FlowchartListItem[]> {
    return await this.repository.findAll(options);
  }
}
