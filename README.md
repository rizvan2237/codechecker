# CodeChecker

A modern, production-grade web dashboard and live checker designed for college placement training teams, students, and competitive programmers. Tracks, evaluates, and analyzes coding progress across **LeetCode** and **HackerRank**: topic coverage, difficulty progression, assignment completion, submission integrity, and automated algorithmic complexity.

Built with a **Liquid Glass (Glassmorphism)** theme in React 18, TypeScript, and Vite, backed by **Supabase (PostgreSQL)**, and integrated with **OpenAI API** for intelligent code review and plagiarism/anomaly explanations.

---

## Key Features

### 1. Dual Portal Experience
- **🎓 Candidate / Student Portal**:
  - Personal dashboard tracking solved counts across LeetCode & HackerRank.
  - Active streak counter, placement readiness score, and weekly goals.
  - Assigned practice problem sheets with direct solve links and progress indicators.
  - One-click **⚡ AI Code Review** on recent attempts.
- **🛡️ Admin / Staff Portal**:
  - Batch analytics across college departments, years of study, and sections.
  - Anomaly & plagiarism signal detector for flagged submissions.
  - Practice set manager to assign custom problem sets.
  - **Bug Rectification & Diagnostics Console**: Monitor crawler pipelines, test database connectivity, inspect system exceptions, and manage API keys.

### 2. Live Platform Checker
- Inspect any **LeetCode** or **HackerRank** username in real time.
- Breakdown of solved problems by difficulty (Easy, Medium, Hard).
- Global rank, acceptance rate, earned badges (e.g. Guardian, Knight, 5-Star Problem Solving).
- Recent submissions table with judge runtime, memory usage, and language.

### 3. AI Code Assistant & Integrity Engine (OpenAI API)
- **Big-O Complexity Analyzer**: Computes Time Complexity and Space Complexity with algorithmic justification.
- **Optimization Suggestions**: Actionable recommendations to improve memory locality and reduce time limits.
- **Anomaly Explainer**: Generates structured faculty advisory reports on flagged rapid submissions.
- Interactive API Key manager supporting live GPT-4o Mini or seamless local heuristic evaluation.

### 4. Liquid Glass UI
- Ultra-sleek glassmorphic surfaces with multi-layered backdrop blur.
- Radiant teal, violet, and amber liquid glow borders.
- Responsive design tailored for desktops, tablets, and presentation displays.

### 5. Enterprise Data Layer
- **Dual Mode**: Runs with rich synthetic data out of the box (zero configuration needed for demos).
- **Supabase PostgreSQL**: Full SQL migrations with Row Level Security (RLS) policies for placement staff.

---

## Quick Start (Demo Mode)

```bash
# 1. Clone repository and navigate to folder
cd codechecker

# 2. Install dependencies
npm install

# 3. Create local environment configuration
cp .env.example .env.local

# 4. Run development server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Production Build & Verification

```bash
# Type check TypeScript definitions
npm run typecheck

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Connecting Supabase (Live Database Mode)

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase **SQL Editor**, execute the migration files in order:
   - `supabase/migrations/001_core_schema.sql`
   - `supabase/migrations/002_row_level_security.sql`
3. In **Project Settings > API**, copy the **Project URL** and the **anon public** key.
4. Update `.env.local`:
   ```bash
   VITE_DATA_SOURCE=supabase
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Restart `npm run dev`.

---

## Configuring OpenAI API

You can supply your OpenAI API key in two ways:
1. **Via UI**: Click **AI Assistant** or **⚙️ Settings** in the app and enter your key. It is saved in browser storage.
2. **Via Environment**: Add `VITE_OPENAI_API_KEY=sk-...` to `.env.local`.

If no key is configured, the system uses an intelligent local heuristic analysis engine to provide Big-O insights.

---

## Deploying to Vercel

The project includes `vercel.json` pre-configured for Single Page Application (SPA) routing.

```bash
# Deploy to preview
vercel

# Deploy directly to production
vercel --prod
```

---

## Project Structure

```
codechecker/
├── src/
│   ├── analytics/          # Pure functions for score calculations and summaries
│   ├── components/         # Reusable Liquid Glass UI components
│   │   ├── ai/             # AI Assistant modal & complexity inspector
│   │   ├── layout/         # Sidebar, TopBar, and AppLayout frames
│   │   ├── students/       # Student tables, grids, and anomaly panels
│   │   └── ui/             # Glass cards, progress bars, and status badges
│   ├── config/             # Navigation items, constants, and environment parser
│   ├── context/            # DatasetContext and PortalContext state providers
│   ├── data/               # Repositories and synthetic demo generators
│   ├── features/           # Filter logic and report definitions
│   ├── lib/                # Formatting, CSV exports, math, and Supabase client
│   ├── pages/              # Portal views (Dashboard, Candidate, Checker, Admin, etc.)
│   ├── services/           # PlatformChecker and OpenAI AI services
│   ├── styles/             # global.css (Liquid Glass design tokens)
│   └── types/              # Domain TypeScript types
├── supabase/
│   └── migrations/         # Plain SQL schema and Row Level Security scripts
├── vercel.json             # Vercel deployment rewrites
└── package.json
```

---

## License

MIT License. Designed and engineered for academic evaluation and placement coding assessment.
