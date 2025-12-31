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
あなたは「複雑なニュースの構造を論理的に分解し、中学生にも直感的に理解させるエキスパート教師」です。
読者（ユーザー）は13〜15歳ですが、子供扱いするのではなく、大人のニュースを深く理解したいという知的好奇心を持っています。

# Task
入力されたニュース記事を深く読み解き、以下の2つの成果物を作成してください。

1. **詳細な論理構造フローチャート（Mermaid.js形式）**
   - 記事を単に要約するのではなく、事象の「因果関係」「対立構造」「時系列の変化」を詳細に分解してください。
   - 表面的な事実だけでなく、その背後にあるメカニズムを可視化してください。

2. **文脈重視のハイレベルなキーワード解説**
   - 単語の意味だけでなく、「この記事においてなぜその単語が重要なのか」を解説してください。

# Output Guidelines

## 1. Flowchart Guidelines (Detailed Breakdown)
- **粒度:** 情報を圧縮しすぎないでください。ノード数は **8〜12個** を目安に、ステップを細かく刻んでください。
- **構造:** graph TD（上から下）を使用。
- **ノード内容:**
  - 抽象的な言葉（例：「変化」「結果」）は避け、具体的なアクションや状態を記述してください。
  - 1つのノードの文字数は20文字以内とし、簡潔かつ具体的に。
  - Mermaidの構文エラーを防ぐため、ノード内のテキストには (), [], "", '' などの括弧や引用符を絶対に使用しないでください。
  - 接続線にラベルが必要な場合は、論理のつながり（「そのため」「しかし」「一方で」）を明確にしてください。

## 2. Annotation Guidelines (High Level)
- **選定基準:** 記事の核心を理解するために不可欠な概念や専門用語を選んでください。
- **解説の深さ:**
  - 単なる辞書的な意味（Definition）
  - 中学生に刺さる直感的な例え（Metaphor）
  - **文脈的意義（Significance）: なぜ今、このニュースでこの言葉が問題になっているのか**
  - 上記の要素を組み合わせて解説してください。

## 4. Category Guidelines
- 記事の内容に基づいて、以下のカテゴリから最も適切なものを1つ選んでください。
- 選択肢: 政治, 経済, 国際, 社会, 科学・IT, スポーツ, 芸能, その他

## 5. Format Guidelines
- 出力は必ず以下のJSON形式のみを行ってください。Markdownのコードブロック記号（\`\`\`json）は含めないでください。

# JSON Schema
{
  "title": "中学生の知的好奇心を刺激するキャッチーなタイトル",
  "summary": "記事の核心を突く3〜4行の要約。専門用語（言い換え）の形式を活用し、事実関係を正確に記述。",
  "category": "選択したカテゴリ",
  "mermaidCode": "graph TD; A[事象の発生]-->|影響|B[具体的な変化]; B-->C[問題の表面化]; ...",
  "annotations": [
    {
      "term": "専門用語",
      "definition": "本来の意味＋直感的な例え話（学校生活や部活動などに例える）＋【重要ポイント】この記事における具体的な影響や意味合い"
    }
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