# 要件定義書：Research-to-Notion (R2N) Connector

## 1. プロジェクト概要

iPhoneでのリサーチ活動（Gemini/Perplexity等）の知見を、カテゴリー分けしてNotionデータベースへ高速に転記するためのバックエンドAPIおよび入力インターフェース。

- **開発スタック:** Next.js (App Router / API Routes)
- **アーキテクチャ:** Clean Architecture（関心の分離、テスト容易性、拡張性の確保）
- **ターゲット:** iPhone (iOSショートカット経由の利用)

---

## 2. 機能要件 (Functional Requirements)

### F-1: データ受信・バリデーション

- iOSショートカットまたはクリップボードから送出される「テキスト」および「ソースURL」を受信。
- 必須項目の有無を確認するバリデーション。

### F-2: 動的なカテゴリー取得

- Notion APIを使用して、特定のデータベースに設定されている「カテゴリー（Select/Multi-select）」の選択肢をリアルタイムで取得。

### F-3: Notion DBへの自動転記

- ユーザーが選択したカテゴリー、受信したテキスト、URL、タイムスタンプをNotionの新規ページとして保存。
- テキストがNotionのプロパティ上限を超える場合、または構造化が必要な場合は、ページ本文（blocks）として保存。

### F-4: 実行結果のリターン

- 成功/失敗のステータスと、エラー時には詳細なメッセージをiOS側へ返却。

---

## 3. 非機能要件 (Non-functional Requirements)

### N-1: パフォーマンス（最優先）

- ショートカット起動から保存完了までを**2秒以内**に完結させる。
- Vercel Edge Runtime 等を活用した低レイテンシなレスポンス。

### N-2: UX（モバイルファースト）

- iPhoneの画面を切り替えずに操作を完結させる。
- 最小限のタップ数（カテゴリー選択のみ）で投稿が完了するフロー。

### N-3: アーキテクチャ設計

- **Clean Architectureの採用:**
  - `Domain`: Entity, Repository Interface
  - `Use Case`: 転記ビジネスロジック
  - `Infrastructure`: Notion SDKの実装、外部通信
  - `Presentation`: API Route Handler
- 依存関係の方向を内側に限定し、Notion SDKの変更や他ツールへの切り替えに強い設計にする。

### N-4: 経済性

- Vercel Free Tier および Notion API 個人枠の範囲内で運用。

---

## 4. データ構造 (Data Schema)

| フィールド名   | 型            | Notionプロパティ | 備考                                           |
| :------------- | :------------ | :--------------- | :--------------------------------------------- |
| **Title**      | String        | title            | コンテンツの冒頭またはサマリー                 |
| **Category**   | String (Enum) | select           | Notion DBの定義と同期                          |
| **Source URL** | URL           | url              | 引用元URL                                      |
| **Content**    | Rich Text     | (Page Content)   | 本文。ページ内のParagraph/Code Blockとして配置 |

---

## 5. システムフロー

1. **Trigger**: iPhoneの共有シートから自作ショートカットを起動。
2. **Pre-process**: ショートカットがNext.js APIから最新の「カテゴリー一覧」をJSONで取得・表示。
3. **Input**: ユーザーがカテゴリーを選択。
4. **Post**: ショートカットが「テキスト + URL + カテゴリー」をAPIへPOST。
5. **Finalize**: APIがNotion DBへ書き込み、完了通知をiPhoneに返す。
