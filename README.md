# Next.js Clean Architecture Boilerplate (AI-Native)

This project is optimized for Vibe Coding with AI editors (like Cursor).
It implements a **Clean Architecture** pattern using Next.js App Router, Server Actions, and the Google Generative AI SDK, with Notion integration.

## 🗺 Context Map for AI

**CRITICAL**: Understanding this map is required for correct code generation. The architecture strictly separates concerns.

| Layer              | Path                 | Responsibility                                                | Dependencies               |
| :----------------- | :------------------- | :------------------------------------------------------------ | :------------------------- |
| **Domain**         | `src/core/domain`    | Enterprise business rules & Entities. Pure data structures.   | **None** (Pure TypeScript) |
| **Use Case**       | `src/core/use-cases` | Application specific business logic. Orchestrates flow.       | Domain, Ports              |
| **Ports**          | `src/core/ports`     | Interfaces (contracts) that abstract infrastructure.          | Domain                     |
| **Infrastructure** | `src/infrastructure` | Concrete implementations of Ports (Gemini, Notion).           | Ports, External SDKs       |
| **Controller**     | `src/app/_actions`   | Server Actions entry points. Adapts UI requests to Use Cases. | Use Cases, Infra (for DI)  |
| **UI**             | `src/app`            | React Components, Pages, Layouts.                             | Server Actions, UI Libs    |

## 📂 Project Structure

```text
src/
├── app/                        # [UI Layer] Next.js App Router
│   ├── (routes)/               # Pages (calendar, history, search, settings, etc.)
│   ├── _components/            # Feature-specific components
│   └── _actions/               # Server Actions (Controllers) & Composition Root
│
├── components/                 # Shared Components
│   ├── ui/                     # shadcn/ui components
│   └── ...                     # Other shared components (FlowchartDisplay, AppSidebar, etc.)
│
├── core/                       # [Domain & Application Layer] NO External Libs
│   ├── domain/                 # Entities (e.g., Message, Flowchart)
│   ├── use-cases/              # Business Logic (e.g., GenerateFlowchartUseCase)
│   └── ports/                  # Interfaces (e.g., IFlowchartGenerator, INotionRepository)
│
├── infrastructure/             # [Infrastructure Layer]
│   ├── gemini/                 # Google AI SDK Implementation
│   └── notion/                 # Notion API Implementation
│
├── hooks/                      # Custom React Hooks
└── lib/                        # Shared Utilities
```

🛠 Tech Stack

- Framework: Next.js 14+ (App Router)
- Language: TypeScript (Strict Mode)
- AI Integration: Google Generative AI SDK (Gemini)
- CMS/Database: Notion API
- UI System: shadcn/ui + Tailwind CSS
- Deployment: Vercel (Serverless / Edge)

🚀 Getting Started

1. Environment Setup Copy .env.example to .env.local:

```bash
GEMINI_API_KEY=your_api_key_here
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_database_id
```

2. Installation

```bash
npm install
```

3. Development

```bash
npm run dev
```

⚠️ Architectural Rules (Strict)

1. Dependency Rule: Source code dependencies must only point inward (towards Domain). `core` must never import from `infrastructure` or `app`.

2. Dependency Injection:

- Concrete implementations (like `GeminiAdapter`, `NotionRepository`) are injected into Use Cases inside `src/app/_actions` or a dedicated DI container.

- Use Cases must only depend on Interfaces (`ports`), never on concrete classes.

3. No SDKs in Core: The `core` folder must remain framework-agnostic. No `next/*`, `google-generative-ai`, or `notion-client` imports allowed here.
