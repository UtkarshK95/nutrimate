<div align="center">

# 🥗 NutriMate

**Your local-first AI health companion.**

NutriMate reads your lab reports, learns your body, and delivers deeply personalised nutrition and wellness insights — while also simplifying complex research papers. All privately on your machine. No cloud. No data leaks. Only privacy.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-nutrimate--uk.vercel.app-blue?style=for-the-badge&logo=vercel)](https://nutrimate-uk.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-97%25-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

</div>

---

## ✨ Features

- **Health Profile** — Store your age, gender, medications, conditions, allergies, and health goals
- **Lab Reports** — Upload blood reports and diagnostic PDFs; AI extracts and tracks your biomarkers over time
- **Research Library** — Upload research papers (PubMed, NIH, etc.) and get AI-simplified summaries used as context
- **Fitness Data** — Import exports from Fitbit, Apple Health, or any CSV-based tracker
- **AI Chat** — Ask health questions and get answers grounded in *your* data, not generic advice
- **RAG Pipeline** — Retrieval-Augmented Generation ensures responses are based on your actual data, not hallucinations
- **100% Local** — Your health data never leaves your machine

---

## 🛠️ Tech Stack

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| Framework      | Next.js 15 + TypeScript                 |
| Styling        | Tailwind CSS v4 + shadcn/ui + Radix UI  |
| AI (Chat)      | Gemini 2.0 Flash Lite                   |
| AI (Embeddings)| Gemini text-embedding-004               |
| PDF Parsing    | unpdf                                   |
| Validation     | Zod                                     |
| Storage        | Local filesystem (`/data`)              |
| Vector Search  | In-memory cosine similarity             |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- A free [Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/UtkarshK95/nutrimate.git
cd nutrimate

# Install dependencies
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your credentials:

```env
GEMINI_API_KEY=your_gemini_api_key
SITE_PASSWORD=your_chosen_password
```

### Run

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## 🔒 Password Protection

All `/dashboard` routes are protected by the `SITE_PASSWORD` environment variable. The landing page is public.

- Visit the app and click **Get Started** or **Open App** to enter the password
- On success, an `httpOnly` cookie is set for 7 days — no re-entry needed
- To reset, delete the `site-password` cookie in DevTools → Application → Cookies

> Never commit your real password. Only `.env.example` (with a placeholder) is tracked by git.

---

## 📁 Project Structure

```
nutrimate/
├── src/app/
│   ├── api/                # API routes (chat, ingest, profile)
│   ├── dashboard/          # Main app sections
│   │   ├── chat/
│   │   ├── profile/
│   │   ├── research/
│   │   ├── lab-reports/
│   │   └── fitness/
│   └── page.tsx            # Landing / disclaimer page
├── components/             # Shared UI components
├── lib/
│   ├── ai/                 # Gemini chat + embeddings
│   ├── rag/                # Chunking, embedding, retrieval
│   ├── parsers/            # PDF, CSV, XML parsers
│   └── store/              # Local JSON file storage
└── data/                   # Local data storage (gitignored)
    ├── profile.json
    ├── chunks.json
    └── documents/
```

---

## ⚠️ Disclaimer

NutriMate is a **personal hobby project** and is not a medical device. AI-generated insights are for informational purposes only and do not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical decisions.

---

## ☕ Support the Project

- **GitHub:** [https://github.com/UtkarshK95/react-nano-skeleton](https://github.com/UtkarshK95/react-nano-skeleton)
- **Buy Me a Coffee:** [https://buymeacoffee.com/utkarshk95](https://buymeacoffee.com/utkarshk95)

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/UtkarshK95">Utkarsh Katiyar</a>
</div>
