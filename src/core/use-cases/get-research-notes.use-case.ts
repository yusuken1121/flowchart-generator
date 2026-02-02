import { ResearchNote } from "../domain/research-note.types";
import { IResearchRepository } from "../ports/IResearchRepository";

export class GetResearchNotesUseCase {
  constructor(private readonly researchRepository: IResearchRepository) {}

  async execute(): Promise<ResearchNote[]> {
    return this.researchRepository.findAll();
  }
}
