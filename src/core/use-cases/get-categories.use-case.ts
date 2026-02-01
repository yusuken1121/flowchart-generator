import { CategoryOption } from "../domain/research-note.types";
import { IResearchRepository } from "../ports/IResearchRepository";

export class GetCategoriesUseCase {
  constructor(private readonly researchRepository: IResearchRepository) {}

  async execute(): Promise<CategoryOption[]> {
    return this.researchRepository.getCategories();
  }
}
