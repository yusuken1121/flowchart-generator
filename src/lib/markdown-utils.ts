import { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";

/**
 * Converts a markdown string into Notion Block objects.
 * Supports: Headers (#), Bullet Lists (-/*), Numbered Lists (1.), Code Blocks (```), Blockquotes (>).
 * Note: This is a simplified parser. For complex needs, use a dedicated library.
 */
export function convertMarkdownToNotionBlocks(
  markdown: string,
): BlockObjectRequest[] {
  const blocks: BlockObjectRequest[] = [];
  const lines = markdown.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines (unless inside code block, handled separately)
    if (trimmed === "") {
      i++;
      continue;
    }

    // Code Blocks
    if (trimmed.startsWith("```")) {
      const language = trimmed.replace("```", "").trim(); // Extract language if present
      const codeLines: string[] = [];
      i++; // Move to next line
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      // i is now at the closing ``` or end of file
      blocks.push({
        object: "block",
        type: "code",
        code: {
          rich_text: [
            {
              type: "text",
              text: { content: codeLines.join("\n") },
            },
          ],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          language: (language || "plain text") as any,
        },
      });
      i++;
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      blocks.push({
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: [
            { type: "text", text: { content: trimmed.substring(2) } },
          ],
        },
      });
    } else if (trimmed.startsWith("## ")) {
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            { type: "text", text: { content: trimmed.substring(3) } },
          ],
        },
      });
    } else if (trimmed.startsWith("### ")) {
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [
            { type: "text", text: { content: trimmed.substring(4) } },
          ],
        },
      });
    }
    // Bulleted List
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [
            { type: "text", text: { content: trimmed.substring(2) } },
          ],
        },
      });
    }
    // Numbered List (Simple regex for number + dot)
    else if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s/, "");
      blocks.push({
        object: "block",
        type: "numbered_list_item",
        numbered_list_item: {
          rich_text: [{ type: "text", text: { content } }],
        },
      });
    }
    // Blockquote
    else if (trimmed.startsWith("> ")) {
      blocks.push({
        object: "block",
        type: "quote",
        quote: {
          rich_text: [
            { type: "text", text: { content: trimmed.substring(2) } },
          ],
        },
      });
    }
    // Paragraph (Default)
    else {
      // Chunking for Notion 2000 char limit is still good practice for long paragraphs
      const chunkedText = chunkString(line, 2000);
      chunkedText.forEach((chunk) => {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: chunk } }],
          },
        });
      });
    }

    i++;
  }

  return blocks;
}

function chunkString(str: string, length: number): string[] {
  return str.match(new RegExp(`.{1,${length}}`, "g")) || [];
}
