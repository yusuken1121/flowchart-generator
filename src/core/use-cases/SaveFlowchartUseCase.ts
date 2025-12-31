import { IFlowchartRepository } from "../ports/IFlowchartRepository";
import { FlowchartData } from "../domain/flowchart.types";

export class SaveFlowchartUseCase {
  constructor(private readonly repository: IFlowchartRepository) {}

  async execute(data: FlowchartData, url?: string): Promise<void> {
    return this.repository.save(data, url);
  }
}
