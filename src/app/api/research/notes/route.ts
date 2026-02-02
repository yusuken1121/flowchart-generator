import { NextResponse } from "next/server";
import { ResearchNotionRepository } from "@/infrastructure/notion/ResearchNotionRepository";
import { GetResearchNotesUseCase } from "@/core/use-cases/get-research-notes.use-case";

export async function GET() {
  try {
    const repository = new ResearchNotionRepository();
    const useCase = new GetResearchNotesUseCase(repository);
    const notes = await useCase.execute();

    return NextResponse.json({ notes }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/research/notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch research notes" },
      { status: 500 },
    );
  }
}
