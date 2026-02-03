import { NextResponse } from "next/server";
import { ResearchNotionRepository } from "@/infrastructure/notion/ResearchNotionRepository";
import { AppendResearchNoteContentUseCase } from "@/core/use-cases/append-research-note-content.use-case";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const repository = new ResearchNotionRepository();
    const useCase = new AppendResearchNoteContentUseCase(repository);

    await useCase.execute(id, content);

    return NextResponse.json(
      { message: "Content appended successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Error in POST /api/research/notes/[id]/append:`, error);
    return NextResponse.json(
      { error: "Failed to append content" },
      { status: 500 },
    );
  }
}
