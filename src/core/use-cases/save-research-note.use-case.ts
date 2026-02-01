import { ResearchNote } from "../domain/research-note.types";
import { IResearchRepository } from "../ports/IResearchRepository";

export interface SaveResearchNoteInput {
  title: string;
  category: string;
  sourceUrl?: string;
  content: string;
}

export class SaveResearchNoteUseCase {
  constructor(private readonly researchRepository: IResearchRepository) {}

  async execute(input: SaveResearchNoteInput): Promise<void> {
    const note: ResearchNote = {
      ...input,
      timestamp: new Date(),
    };
    await this.researchRepository.save(note);
  }
}
