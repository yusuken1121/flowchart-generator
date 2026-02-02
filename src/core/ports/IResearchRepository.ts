import { ResearchNote, CategoryOption } from "../domain/research-note.types";

export interface IResearchRepository {
  save(note: ResearchNote): Promise<void>;
  getCategories(): Promise<CategoryOption[]>;
  findAll(): Promise<ResearchNote[]>;
  findById(id: string): Promise<ResearchNote | null>;
}
