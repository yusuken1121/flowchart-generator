import { NextResponse } from "next/server";
import { ResearchNotionRepository } from "@/infrastructure/notion/ResearchNotionRepository";
import {
  SaveResearchNoteUseCase,
  SaveResearchNoteInput,
} from "@/core/use-cases/save-research-note.use-case";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, sourceUrl, content } = body;

    // F-1 Validation
    if (!title || !category || !content) {
      return NextResponse.json(
        { error: "Missing required fields: title, category, or content" },
        { status: 400 },
      );
    }

    const input: SaveResearchNoteInput = {
      title,
      category,
      sourceUrl,
      content,
    };

    const repository = new ResearchNotionRepository();
    const useCase = new SaveResearchNoteUseCase(repository);

    await useCase.execute(input);

    // F-4 Return success
    return NextResponse.json(
      { message: "Research note saved successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in POST /api/research/save:", error);
    return NextResponse.json(
      {
        error: "Failed to save research note",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
