# Setting up SPARK.AI locally

This guide walks you through cloning the repo, configuring your API keys, and running the app on your machine. You don't need all the API keys — just the ones for the models you want to use. If you have Ollama installed, you can run the whole thing for free with no cloud credentials at all.

---

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **npm** (comes with Node) or **pnpm** / **yarn**
- **Git**
- At least one of: an API key from OpenAI / Anthropic / Google, or [Ollama](https://ollama.com) running locally

---

## 1. Clone the repo

```bash
git clone https://github.com/deshna1605/spark-ai.git
cd spark-ai
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure your API keys

Copy the example env file:

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and fill in the keys for the providers you want to use. You only need the ones you'll actually use — leave the others blank.

```env
# Anthropic (Claude) — https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (GPT) — https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...

# Google (Gemini) — https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIza...

# Ollama (local — no key needed, but you can override the host)
OLLAMA_HOST=http://localhost:11434
```

**Where to get each key:**

| Provider | Link |
|----------|------|
| Anthropic (Claude) | [console.anthropic.com](https://console.anthropic.com) → API Keys |
| OpenAI (GPT) | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Google (Gemini) | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| Ollama | No key — runs locally, see below |

---

## 4. How API calls work

All models are routed through a unified backend. The server detects which provider to use based on the model ID you select in the UI:

```
Model ID              → Provider         → Endpoint
─────────────────────────────────────────────────────────────
llama3.2, mistral,    → Ollama (local)   → localhost:11434/v1
deepseek-r1, etc.

gpt-4o, gpt-4o-mini  → OpenAI           → api.openai.com/v1

gemini-2.0-flash      → Google           → generativelanguage.googleapis.com/v1beta/openai/

claude-sonnet-*       → Anthropic        → api.anthropic.com (Anthropic SDK)
```

Ollama, OpenAI, and Gemini all use the **OpenAI SDK** pointed at different `baseURL` values. Claude uses the **Anthropic SDK** because their API format differs. You don't need to configure any of this — it's automatic based on the model you select.

---

## 5. (Optional) Set up Ollama for free local AI

Ollama lets you run open-source models like Llama 3, Mistral, and DeepSeek entirely on your own machine — no API key, no rate limits, no cost.

**Install Ollama:**

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows — download the installer from https://ollama.com/download
```

**Pull one or more models:**

```bash
ollama pull llama3.2      # Fast, great for general use (~2GB)
ollama pull mistral       # Strong at coding (~4GB)
ollama pull deepseek-r1   # Reasoning-focused (~4GB)
ollama pull codellama     # Optimised for code (~4GB)
ollama pull gemma3        # Google's open model (~3GB)
```

**Start the Ollama server:**

```bash
ollama serve
```

Leave this running in a terminal while you use SPARK.AI. The app will automatically query Ollama's `/api/tags` endpoint to discover which models you have installed and display them in the model picker.

> **Note on model names:** Ollama stores models with a tag suffix (e.g. `llama3.2:latest`). SPARK.AI resolves this automatically — you can select `llama3.2` in the UI and the backend will find the correct stored name before sending the request.

---

## 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Create your first project

1. On the landing page, type a description of what you're building
2. Select a model from the model picker — Ollama models appear under **Local**, cloud models under **Cloud**
3. Click **⚡ IGNITE PROJECT**
4. You'll land inside your project workspace, structured as a building with floors:
   - **Context floor** — your project description, which becomes the system prompt for all chats
   - **Chat floor** — talk to the AI with full project context pre-loaded
   - **Files floor** — coming soon
   - **History floor** — log of every prompt in this project

Your project description is automatically injected as the system prompt for every conversation. Switch models at any time — the context travels with you.

---

## Troubleshooting

**"OUT_OF_CREDITS" error in chat**
Your cloud API account has run out of credits. Add credits at the relevant billing page (Anthropic / OpenAI / Google), or switch to an Ollama model for free local inference.

**"INVALID_KEY" error**
Double-check that the key in `.env.local` is correct and hasn't been revoked. After editing `.env.local`, restart the dev server — Next.js doesn't hot-reload environment files.

**"RATE_LIMITED" error**
You've hit the provider's request rate limit. Wait a moment and try again, or switch to a different model temporarily.

**"Ollama is offline" error**
Make sure `ollama serve` is running in a terminal. If you installed Ollama but haven't started it yet, run that command first. You can verify it's up by visiting `http://localhost:11434` in your browser.

**"Model not found" error for an Ollama model**
The model shown in the UI hasn't been pulled to your machine yet. Pull it with:

```bash
ollama pull <model-name>
```

Run `ollama list` to see what you currently have installed. The UI will show uninstalled models with a ↓ indicator.

**Button doesn't do anything**
Make sure you've typed a project description before clicking Ignite. The button requires non-empty input.

**Changes to `.env.local` aren't taking effect**
Any time you edit `.env.local`, restart the dev server for the changes to load:

```bash
# Stop the server with Ctrl+C, then:
npm run dev
```

---

That's it. Happy vibe coding. 🏗⚡
