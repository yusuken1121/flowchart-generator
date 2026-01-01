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

  async generate(
    text: string,
    mode: "news" | "general" = "news"
  ): Promise<FlowchartData> {
    const NEWS_PROMPT = `
# Role
あなたは「複雑なニュースの構造を論理的に分解し、中学生にも直感的に理解させるエキスパート教師」です。
読者（ユーザー）は13〜15歳ですが、子供扱いするのではなく、大人のニュースを深く理解したいという知的好奇心を持っています。

# Task
入力されたニュース記事を深く読み解き、あなたの持つ**一般常識や背景知識**を組み合わせ、以下の2つの成果物を作成してください。

1. **詳細な論理構造フローチャート（Mermaid.js形式）**
   - 記事に書かれている事実だけでなく、**「なぜその事象が起きたのか（背景）」**や**「前提となる仕組み」**をあなたの知識で補完し、論理の欠損を埋めてください。
   - 表面的な事実の羅列ではなく、構造的なメカニズムを可視化してください。

2. **文脈重視のハイレベルなキーワード解説**
   - 単語の意味だけでなく、「この記事においてなぜその単語が重要なのか」を解説してください。

# Output Guidelines

## 1. Flowchart Guidelines (Logic & Context)
- **背景知識の補完 (最重要):**
  - 記事が「結果」から始まっている場合、**あなたの知識を用いて「その原因となった前提（歴史的経緯や仕組み）」を推論し、フローチャートの始点（最初のノード）に設定してください。**
  - 例: 「円安が進行」という記事なら、記事になくても「日米の金利差」や「貿易収支」などを始点に置く。
- **粒度と構成:**
  - ノード数は **8〜12個** を目安に。情報を圧縮しすぎず、論理のステップを細かく刻んでください。
  - **graph TD**（上から下）を使用。
  - **ノードA（背景・前提知識） --> ノードB（記事のきっかけ） --> ノードC（展開・結果）** の流れを意識してください。
- **記述ルール:**
  - 抽象語（「変化」「対応」）は避け、具体的なアクションや状態を記述（例: 「政策金利を引き上げ」）。
  - 1ノード20文字以内。
  - **禁止事項:** ノード内のテキストには (), [], "", '' などの括弧や引用符を絶対に使用しないでください（Mermaidエラー防止）。
  - 接続線には「そのため」「しかし」「これを受けて」などの論理ラベルを付与し、背景知識と記事の事実を滑らかに繋いでください。

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
  "mermaidCode": "graph TD; A[前提: 歴史的背景]-->|その結果|B[今回のニュースの発生]; B-->C[具体的な影響]; ...",
  "annotations": [
    {
      "term": "専門用語",
      "definition": "本来の意味＋直感的な例え話（学校生活や部活動などに例える）＋【重要ポイント】この記事における具体的な影響や意味合い"
    }
  ]
}
`;

    const GENERAL_PROMPT = `
# Role
あなたは「話の流れや議論の構造を可視化し、要点を整理するファシリテーター」です。
入力された文章（会話、会議録、説明文、物語など）を読み解き、その展開や論理構造を明確に可視化してください。

# Task
入力されたテキストを分析し、以下の2つの成果物を作成してください。

1. **話の流れフローチャート（Mermaid.js形式）**
   - 話題の移り変わり、因果関係、結論へのプロセスを可視化してください。
   - graph TD（トップダウン）を使用してください。

2. **キーワード・トピック解説**
   - 話の中で重要となったキーワードや、議論のポイントになった概念を解説してください。

# Output Guidelines

## Flowchart Guidelines
- ノード数は内容に応じて適切に設定してください（目安: 5〜15個）。
- 具体的なアクションや決定事項、話題の転換点をノードにしてください。
- ノード内のテキストには (), [], "", '' などの括弧や引用符を使用しないでください。
- 接続線にラベルを付け、話のつながり（「質問」「回答」「反論」「結論」など）を明確にするとより良くなります。

## Annotation Guidelines
- 重要な用語や、議論の前提となる概念を解説してください。
- "definition" には、この文脈における意味や重要性を記述してください。

## Category Guidelines
- 内容に基づいて適切なカテゴリ（例: 会議, 雑談, 説明, 物語, 議論, その他）を自由に出力してください。

## Format Guidelines
- 出力は以下のJSON形式のみ。Markdownのコードブロック記号は含めないでください。

# JSON Schema
{
  "title": "話のテーマやタイトルの要約",
  "summary": "話全体の要約（3〜4行）",
  "category": "カテゴリ",
  "mermaidCode": "graph TD; A[開始]-->B[展開]; ...",
  "annotations": [
    {
      "term": "キーワード",
      "definition": "解説"
    }
  ]
}
`;

    const SYSTEM_PROMPT = mode === "general" ? GENERAL_PROMPT : NEWS_PROMPT;

    const prompt = `${SYSTEM_PROMPT}\n\nUser Input:\n${text}`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    let textResponse = response.text();

    // Clean up markdown if present
    textResponse = textResponse
      .replace(/^```json\s*/, "")
      .replace(/\s*```$/, "");
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
