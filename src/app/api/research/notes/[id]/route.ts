import { NextResponse } from "next/server";
import { ResearchNotionRepository } from "@/infrastructure/notion/ResearchNotionRepository";
import { GetResearchNoteDetailsUseCase } from "@/core/use-cases/get-research-note-details.use-case";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const repository = new ResearchNotionRepository();
    const useCase = new GetResearchNoteDetailsUseCase(repository);
    const note = await useCase.execute(id);

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ note }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/research/notes/[id]:`, error);
    return NextResponse.json(
      { error: "Failed to fetch research note details" },
      { status: 500 },
    );
  }
}
