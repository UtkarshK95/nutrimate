# 🥗 Nutrimate

**Your personal AI health companion.** Nutrimate is a local-first, RAG-powered health assistant that learns from your health profile, lab reports, fitness data, and medical research to give you deeply personalised insights — all running on your machine.

---

## ✨ Features

- **Health Profile** — Store your name, age, gender, medications, conditions, allergies, and health goals
- **Research Library** — Upload research papers (PubMed, NIH, etc.) and get AI-simplified summaries used as context
- **Lab Reports** — Upload blood reports and other diagnostic PDFs; AI extracts and tracks your biomarkers over time
- **Fitness Data** — Import exports from Fitbit, Apple Health, or any CSV-based tracker
- **AI Chat** — Ask health questions and get answers grounded in _your_ data, not generic advice
- **100% Local** — Your health data never leaves your machine
- **RAG Pipeline** — Retrieval-Augmented Generation ensures the AI uses your actual data, not hallucinations

---

## 🛠️ Tech Stack

| Layer           | Choice                      |
| --------------- | --------------------------- |
| Framework       | Next.js 15 + TypeScript     |
| UI              | Tailwind CSS v4 + shadcn/ui |
| AI (Chat)       | Gemini 2.0 Flash Lite       |
| AI (Embeddings) | Gemini text-embedding-004   |
| Storage         | Local filesystem (`/data`)  |
| Vector Search   | In-memory cosine similarity |
| PDF Parsing     | unpdf                       |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A free [Gemini API key](https://aistudio.google.com/app/apikey)

### Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/nutrimate.git
cd nutrimate

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in your GEMINI_API_KEY and SITE_PASSWORD

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Password Protection

All `/dashboard` routes are protected by a password set via the `SITE_PASSWORD` environment variable. The landing page is public.

- On first visit, click **Get Started** or **Open App** to open the password modal
- On success, an `httpOnly` cookie is set for 7 days — no re-entry needed
- To lock yourself out for testing, delete the `site-password` cookie in DevTools → Application → Cookies

**Never commit your real password.** Only `.env.example` (with a placeholder) is tracked by git.

---

## 📁 Project Structure

```text
nutrimate/
├── src/app/
│   ├── api/              # API routes (chat, ingest, profile)
│   ├── dashboard/        # Main app sections
│   │   ├── chat/
│   │   ├── profile/
│   │   ├── research/
│   │   ├── lab-reports/
│   │   └── fitness/
│   └── page.tsx          # Landing / disclaimer page
├── components/           # Shared UI components
├── lib/
│   ├── ai/               # Gemini chat + embedding
│   ├── rag/              # Chunking, embedding, retrieval
│   ├── parsers/          # PDF, CSV, XML parsers
│   └── store/            # Local JSON file storage
└── data/                 # Local data storage (gitignored)
    ├── profile.json
    ├── chunks.json
    └── documents/
```

---

## ⚠️ Disclaimer

Nutrimate is a **personal hobby project** and is not a medical device. The AI-generated insights are for informational purposes only and do not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical decisions.

---

## 📝 License

MIT — see [LICENSE](LICENSE)
