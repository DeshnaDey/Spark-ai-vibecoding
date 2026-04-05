# ⚡ SPARK.AI

> **Build once. Prompt everywhere.**

SPARK.AI is a **vibe coding platform** — a workspace where you define your project's context once, then talk to any AI model without ever re-explaining what you're building.

No more pasting your project description into every new chat window. No more context switching between tools. Write the vibe of your project once, and every AI conversation is pre-loaded with it automatically.

---

## What is vibe coding?

Vibe coding is building software through natural conversation with AI — no boilerplate, no setup friction, just describing what you want and iterating fast. The problem is that every AI tool makes you re-explain your project from scratch every single session.

SPARK.AI solves this. Your project description becomes the system prompt for every conversation automatically. Switch models mid-project. Compare outputs. Use whatever is fastest or cheapest for the task.

---

## The building metaphor

Your dashboard is a neon city skyline. Each project is a building. Click a building to enter it.

Inside a project, the workspace is structured as a building you navigate floor by floor:

- **Context floor** — your project description, which feeds every AI conversation as the system prompt
- **Chat floor** — talk to any AI model with full project context pre-loaded
- **Files floor** — attach and reference files *(coming soon)*
- **History floor** — log of every prompt sent in this project

Each project has its own building in the city. New projects = new buildings appearing on the skyline.

---

## Architecture

### How API calls work

All AI providers are unified under a single call pattern using the **OpenAI SDK**. The backend detects which provider to use based on the model ID:

```
Model ID              → Provider         → Endpoint
─────────────────────────────────────────────────────────────
llama3.2, mistral,    → Ollama (local)   → localhost:11434/v1
deepseek-r1, etc.

gpt-4o, gpt-4o-mini  → OpenAI           → api.openai.com/v1

gemini-2.0-flash      → Google           → generativelanguage.googleapis.com/v1beta/openai/

claude-sonnet-*       → Anthropic        → api.anthropic.com (Anthropic SDK)
```

Ollama, OpenAI, and Gemini all use the OpenAI SDK with different `baseURL` values. Claude uses the Anthropic SDK since their API format differs. The routing is automatic — you select a model in the UI and the backend handles everything.

### Ollama model resolution

When using a local Ollama model, the server first queries `/api/tags` to find the exact name Ollama has stored (e.g. `llama3.2:latest` vs `llama3.2`). This prevents model-not-found errors when Ollama stores models with tag suffixes.

### Persistence

Everything is stored in `localStorage` — no backend database, no accounts. Projects and chat history live in your browser.

---

## Supported models

| Model | ID | Provider | Requires |
|-------|-----|----------|----------|
| Llama 3.2 | `llama3.2` | Ollama (local) | Ollama running |
| Mistral | `mistral` | Ollama (local) | Ollama running |
| DeepSeek R1 | `deepseek-r1` | Ollama (local) | Ollama running |
| CodeLlama | `codellama` | Ollama (local) | Ollama running |
| Gemma 3 | `gemma3` | Ollama (local) | Ollama running |
| GPT-4o | `gpt-4o` | OpenAI | `OPENAI_API_KEY` |
| GPT-4o Mini | `gpt-4o-mini` | OpenAI | `OPENAI_API_KEY` |
| Claude Sonnet | `claude-sonnet-4-20250514` | Anthropic | `ANTHROPIC_API_KEY` |
| Gemini Flash | `gemini-2.0-flash` | Google | `GEMINI_API_KEY` |

You only need keys for the cloud models you use. Ollama runs fully locally — no key, no credits, no rate limits.

---

## Tech stack

- **Next.js 14+** with App Router and TypeScript
- **Tailwind CSS v4**
- **OpenAI SDK** — used for GPT, Gemini (via compatible endpoint), and Ollama
- **Anthropic SDK** — used for Claude models
- **localStorage** — zero-backend persistence

---

## Quick start

See [SETUP.md](./SETUP.md) for the full setup guide.

```bash
git clone https://github.com/deshna1605/spark-ai.git
cd spark-ai
npm install
cp .env.local.example .env.local
# add your API keys to .env.local (only the ones you need)
npm run dev
```

---

## Roadmap

- [ ] File uploads per project
- [ ] Prompt templates and saved snippets
- [ ] Export chat history as markdown
- [ ] Custom floor sections per project
- [ ] Vercel deployment
