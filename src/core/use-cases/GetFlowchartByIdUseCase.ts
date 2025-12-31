import { IFlowchartRepository } from "../ports/IFlowchartRepository";
import { FlowchartDetail } from "../domain/flowchart.types";

export class GetFlowchartByIdUseCase {
  constructor(private repository: IFlowchartRepository) {}

  async execute(id: string): Promise<FlowchartDetail | null> {
    return this.repository.findById(id);
  }
}
