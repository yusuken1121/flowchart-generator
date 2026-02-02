import { ResearchNote } from "../domain/research-note.types";
import { IResearchRepository } from "../ports/IResearchRepository";

export class GetResearchNoteDetailsUseCase {
  constructor(private readonly researchRepository: IResearchRepository) {}

  async execute(id: string): Promise<ResearchNote | null> {
    return this.researchRepository.findById(id);
  }
}
