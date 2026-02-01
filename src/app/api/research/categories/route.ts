import { NextResponse } from "next/server";
import { ResearchNotionRepository } from "@/infrastructure/notion/ResearchNotionRepository";
import { GetCategoriesUseCase } from "@/core/use-cases/get-categories.use-case";

export async function GET() {
  try {
    const repository = new ResearchNotionRepository();
    const useCase = new GetCategoriesUseCase(repository);
    const categories = await useCase.execute();

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/research/categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
