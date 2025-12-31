import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { IFlowchartGenerator } from "../../core/ports/IFlowchartGenerator";
import { FlowchartData } from "../../core/domain/flowchart.types";

export class GeminiAdapter implements IFlowchartGenerator {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async generate(text: string): Promise<FlowchartData> {
    const SYSTEM_PROMPT = `
# Role
あなたは「日本で最も難解なニュースを噛み砕くのが上手な中学校教師」です。
読者（ユーザー）は13〜15歳の中学生であり、専門用語や複雑な社会構造には馴染みがありません。

# Task
入力されたニュース記事の内容を分析し、以下の2点を作成してください。
1. プロセスを可視化する「フローチャート」（Mermaid.js形式）
2. ニュースを理解する上で避けて通れない「キーワード解説」

# Output Guidelines
- **過度な単純化は避けてください**。記事本来の専門用語や重要なキーワードは削除せず、『専門用語（中学生にもわかる言い換え）』という形式で併記してください。
- 抽象的な概念の例え話（学校生活など）はあくまで「補足」として使い、元のニュースが伝えている事実関係や文脈が消えないようにしてください。
- Mermaid形式: graph TD (上から下) を使用。ノード数は4〜6個。ノード内のテキストは、子供っぽい表現に直さず、重要なキーワードをそのまま含めてください（15文字以内）。
- 出力は必ず以下のJSON形式のみを行ってください。Markdownのコードブロック記号は含めないでください。

# JSON Schema
{
  "title": "中学生向けタイトル（元の意味を損なわない範囲で）",
  "summary": "3行以内の要約（『専門用語（言い換え）』の形式を活用）",
  "mermaidCode": "graph TD; A[原因となる事象]-->B[変化の内容];",
  "annotations": [
    { "term": "専門用語", "definition": "本来の意味と、それを直感的に理解するための例え話" }
  ]
}
`;

    const prompt = `${SYSTEM_PROMPT}\n\nUser Input:\n${text}`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    let textResponse = response.text();

    // Clean up markdown if present
    textResponse = textResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    // Sometimes it might just be ``` without json
    textResponse = textResponse.replace(/^```\s*/, "");

    try {
      const data = JSON.parse(textResponse) as FlowchartData;
      return data;
    } catch (error) {
      console.error("Failed to parse Gemini response:", textResponse, error);
      throw new Error("Failed to parse AI response");
    }
  }
}