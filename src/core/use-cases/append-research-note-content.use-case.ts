import { IResearchRepository } from "../ports/IResearchRepository";

export class AppendResearchNoteContentUseCase {
  constructor(private readonly researchRepository: IResearchRepository) {}

  async execute(id: string, content: string): Promise<void> {
    if (!content.trim()) {
      return;
    }
    await this.researchRepository.appendContent(id, content);
  }
}
