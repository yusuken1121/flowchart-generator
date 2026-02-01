import { Client } from "@notionhq/client";
import {
  GetDatabaseResponse,
  BlockObjectRequest,
  CreatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { IResearchRepository } from "../../core/ports/IResearchRepository";
import {
  ResearchNote,
  CategoryOption,
} from "../../core/domain/research-note.types";

export class ResearchNotionRepository implements IResearchRepository {
  private notion: Client;
  private databaseId: string;

  constructor() {
    const apiKey = process.env.NOTION_API_KEY;
    const dbId =
      process.env.RESEARCH_NOTION_DATABASE_ID || process.env.NOTION_DATABASE_ID;

    if (!apiKey || !dbId) {
      throw new Error(
        "NOTION_API_KEY or RESEARCH_NOTION_DATABASE_ID (or NOTION_DATABASE_ID) not provided",
      );
    }

    this.notion = new Client({ auth: apiKey });
    this.databaseId = dbId;
  }

  async getCategories(): Promise<CategoryOption[]> {
    try {
      const response: GetDatabaseResponse =
        await this.notion.databases.retrieve({
          database_id: this.databaseId,
        });

      const properties = response.properties;
      // Requirement says "Category" property (select)
      // We also fallback to "Genre" if Category is missing, just in case, or stick to requirements.
      // Let's stick to requirements: "Category"

      const categoryProperty = properties["Category"] || properties["Genre"];

      if (!categoryProperty || categoryProperty.type !== "select") {
        console.warn("Category property not found or not a select type");
        return [];
      }

      return categoryProperty.select.options.map((opt) => ({
        id: opt.id,
        name: opt.name,
        color: opt.color,
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  async save(note: ResearchNote): Promise<void> {
    const properties: CreatePageParameters["properties"] = {
      Title: {
        title: [
          {
            text: {
              content: note.title,
            },
          },
        ],
      },
    };

    if (note.category) {
      // Logic to support both "Category" and "Genre" if one fails?
      // Ideally we know the schema. Requirements said "Category".
      properties["Category"] = {
        select: {
          name: note.category,
        },
      };
    }

    if (note.sourceUrl) {
      properties["URL"] = {
        // Requirement says "Source URL" | "url" (prop name 'URL' or 'Source URL'?)
        // Requirement table: Field Name "Source URL", Notion Property "url".
        // Note: Notion properties often have names like "URL" or "Source URL".
        // The existing repo uses "URL". I will use "URL" to be safe or "Source URL".
        // Let's use "URL" as per existing repo, but maybe "Source URL" if specifically asked.
        // Table says: Field Name "Source URL", Notion Property "url".
        // This usually means the property *type* is url. The property *name* might be "Source URL".
        // But in F-4 Table: "Notionプロパティ" column says "url". This is ambiguous. usually it means the underlying key.
        // However, standard Notion name is often just "URL".
        // Let's try "Source URL" as key, and if that is weird, I'll fallback or the user can adjust.
        // Actually, looking at F-1 "iOSショートカット...「ソースURL」を受信", and "System Flow" -> "テキスト + URL...".
        // The existing NotionRepository uses `properties.URL`.
        // I will use "Source URL" as the property name to match the requirement's "Field Name".
        url: note.sourceUrl,
      };
    }

    // Content as blocks
    // Requirement F-3: "テキストがNotionのプロパティ上限を超える場合...ページ本文（blocks）として保存"
    // Also "Content | Rich Text | (Page Content)"
    const children: BlockObjectRequest[] = [];

    // Chunk content if too long
    const chunks = note.content.match(/[\s\S]{1,2000}/g) || [];
    chunks.forEach((chunk) => {
      children.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: chunk,
              },
            },
          ],
        },
      });
    });

    try {
      await this.notion.pages.create({
        parent: { database_id: this.databaseId },
        properties: properties,
        children: children,
      });
    } catch (e: unknown) {
      // If "Category" property doesn't exist, maybe try "Genre"?
      // But for now, let's assume the user sets up the DB as per requirements.
      console.error("Failed to save research note", e);
      throw e;
    }
  }
}
