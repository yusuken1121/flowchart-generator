import { IFlowchartRepository } from "../ports/IFlowchartRepository";
import { FlowchartListItem } from "../domain/flowchart.types";

export class GetFlowchartHistoryUseCase {
  constructor(private repository: IFlowchartRepository) {}

  async execute(): Promise<FlowchartListItem[]> {
    return await this.repository.findAll();
  }
}
