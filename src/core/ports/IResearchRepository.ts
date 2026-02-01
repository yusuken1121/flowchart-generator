import { ResearchNote, CategoryOption } from "../domain/research-note.types";

export interface IResearchRepository {
  save(note: ResearchNote): Promise<void>;
  getCategories(): Promise<CategoryOption[]>;
}
