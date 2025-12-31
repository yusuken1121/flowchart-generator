import { Client } from "@notionhq/client";
import { IFlowchartRepository } from "../../core/ports/IFlowchartRepository";
import { FlowchartData, FlowchartListItem } from "../../core/domain/flowchart.types";

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
    console.log("NotionRepository initialized with DB ID:", this.databaseId.substring(0, 4) + "...");
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
              }
            }
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

  async findAll(): Promise<FlowchartListItem[]> {
    console.log("Fetching history from Notion DB:", this.databaseId);
    
    // This automatically handles the Database ID format (dashes/no-dashes)
    const response = await this.notion.databases.query({
      database_id: this.databaseId,
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.results.map((page: any) => {
      const titleProperty = page.properties.Title;
      const title = titleProperty?.title?.[0]?.plain_text || "No Title";

      const summaryProperty = page.properties.Summary;
      const summary = summaryProperty?.rich_text?.[0]?.plain_text || "";

      const urlProperty = page.properties.URL;
      const sourceUrl = urlProperty?.url || undefined;

      return {
        id: page.id,
        title,
        summary,
        sourceUrl,
        createdAt: page.created_time,
      };
    });
  }
}