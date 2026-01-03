import { Client } from "@notionhq/client";
import { IFlowchartRepository } from "../../core/ports/IFlowchartRepository";
import {
  FlowchartData,
  FlowchartDetail,
  FlowchartFilterOptions,
  FlowchartListResponse,
} from "../../core/domain/flowchart.types";

export class NotionRepository implements IFlowchartRepository {
  private notion: Client;
  private databaseId: string;

  constructor() {
    const apiKey = process.env.NOTION_API_KEY;
    const dbId = process.env.NOTION_DATABASE_ID;

    if (!apiKey || !dbId) {
      throw new Error("NOTION_API_KEY or NOTION_DATABASE_ID provided");
    }

    this.notion = new Client({ auth: apiKey });
    // Sanitize databaseId to ensure no whitespace or quotes
    this.databaseId = dbId;
    console.log(
      "NotionRepository initialized with DB ID:",
      this.databaseId.substring(0, 4) + "..."
    );
  }

  async save(data: FlowchartData, sourceUrl?: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const properties: any = {
      Title: {
        title: [
          {
            text: {
              content: data.title,
            },
          },
        ],
      },
      Summary: {
        rich_text: [
          {
            text: {
              content: data.summary,
            },
          },
        ],
      },
    };

    if (data.category) {
      properties.Genre = {
        select: {
          name: data.category,
        },
      };
    }

    if (sourceUrl) {
      properties.URL = {
        url: sourceUrl,
      };
    }

    // Construct blocks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const children: any[] = [
      {
        object: "block",
        type: "code",
        code: {
          caption: [],
          rich_text: [
            {
              type: "text",
              text: {
                content: data.mermaidCode,
              },
            },
          ],
          language: "mermaid",
        },
      },
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            {
              type: "text",
              text: {
                content: "用語解説",
              },
            },
          ],
        },
      },
    ];

    // Add annotations as bulleted list items
    data.annotations.forEach((annotation) => {
      children.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [
            {
              type: "text",
              text: {
                content: `${annotation.term}: ${annotation.definition}`,
              },
              annotations: {
                bold: false,
              },
            },
          ],
        },
      });
    });

    await this.notion.pages.create({
      parent: { database_id: this.databaseId },
      properties: properties,
      children: children,
    });
  }

  async findAll(
    options?: FlowchartFilterOptions
  ): Promise<FlowchartListResponse> {
    console.log("Fetching history from Notion DB:", this.databaseId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { and: [] };

    if (options?.category) {
      filter.and.push({
        property: "Genre",
        select: {
          equals: options.category,
        },
      });
    }

    if (options?.startDate) {
      filter.and.push({
        timestamp: "created_time",
        created_time: {
          on_or_after: options.startDate.toISOString(),
        },
      });
    }

    if (options?.endDate) {
      filter.and.push({
        timestamp: "created_time",
        created_time: {
          on_or_before: options.endDate.toISOString(),
        },
      });
    }

    // Only apply filter if we have conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryParams: any = {
      database_id: this.databaseId,
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
      page_size: options?.limit || 12, // Default limit
    };

    if (options?.cursor) {
      queryParams.start_cursor = options.cursor;
    }

    if (filter.and.length > 0) {
      queryParams.filter = filter;
    }

    // This automatically handles the Database ID format (dashes/no-dashes)
    const response = await this.notion.databases.query(queryParams);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = response.results.map((page: any) => {
      const titleProperty = page.properties.Title;
      const title = titleProperty?.title?.[0]?.plain_text || "No Title";

      const summaryProperty = page.properties.Summary;
      const summary = summaryProperty?.rich_text?.[0]?.plain_text || "";

      const urlProperty = page.properties.URL;
      const sourceUrl = urlProperty?.url || undefined;

      const genreProperty = page.properties.Genre;
      const category = genreProperty?.select?.name || undefined;

      return {
        id: page.id,
        title,
        summary,
        sourceUrl,
        category,
        createdAt: page.created_time,
      };
    });

    return {
      items,
      nextCursor: response.next_cursor,
      hasMore: response.has_more,
    };
  }

  async findById(id: string): Promise<FlowchartDetail | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const page: any = await this.notion.pages.retrieve({ page_id: id });

      const titleProperty = page.properties.Title;
      const title = titleProperty?.title?.[0]?.plain_text || "No Title";

      const summaryProperty = page.properties.Summary;
      const summary = summaryProperty?.rich_text?.[0]?.plain_text || "";

      const urlProperty = page.properties.URL;
      const sourceUrl = urlProperty?.url || undefined;

      const genreProperty = page.properties.Genre;
      const category = genreProperty?.select?.name || undefined;

      // Fetch blocks to get mermaid code and annotations
      const blocks = await this.notion.blocks.children.list({ block_id: id });

      let mermaidCode = "";
      const annotations: { term: string; definition: string }[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      blocks.results.forEach((block: any) => {
        if (block.type === "code" && block.code.language === "mermaid") {
          mermaidCode = block.code.rich_text[0]?.plain_text || "";
        }

        if (block.type === "bulleted_list_item") {
          const text = block.bulleted_list_item.rich_text[0]?.plain_text || "";
          const parts = text.split(":").map((s: string) => s.trim());
          if (parts.length >= 2) {
            const term = parts[0];
            const definition = parts.slice(1).join(": ");
            annotations.push({ term, definition });
          }
        }
      });

      return {
        id: page.id,
        title,
        summary,
        sourceUrl,
        createdAt: page.created_time,
        mermaidCode,
        annotations,
        category,
      };
    } catch (error) {
      console.error("Error fetching page:", error);
      return null;
    }
  }
}
