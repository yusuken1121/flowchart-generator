import { IFlowchartGenerator } from "../ports/IFlowchartGenerator";
import { FlowchartData } from "../domain/flowchart.types";

export class GenerateFlowchartUseCase {
  constructor(private readonly generator: IFlowchartGenerator) {}

  async execute(
    text: string,
    mode: "news" | "general" = "news"
  ): Promise<FlowchartData> {
    return this.generator.generate(text, mode);
  }
}
