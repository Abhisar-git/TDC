# TDC Matchmaker Dashboard MVP 💖

Welcome to the internal Matchmaker Dashboard MVP built for the team at **TDC (The Date Crew)**. This tool helps matchmakers organize clients, manage intake meeting notes, review suggested matches, and leverage the **Google Gemini API** for compatibility scoring and personalized introduction email drafts.

---

## 🚀 Tech Stack

*   **Frontend**: React (Next.js 16 App Router)
*   **Styling**: Tailwind CSS v4 (Warm Burgundy & Champagne Gold theme)
*   **Icons**: Lucide React
*   **Database**: Local JSON File Database (`src/data/db.json` with file read/write operations)
*   **AI Engine**: Google Gemini API (`gemini-1.5-flash`) via direct fetch integration (no external packages required)

---

## 🌟 Key Features

1.  **Matchmaker Secure Sign-in**:
    *   Protecting all internal routes.
    *   **Bypass Credentials**: `admin` / `admin` (features a one-click auto-fill bypass button for dev testing).
2.  **Interactive Pipelines Dashboard**:
    *   High-level status statistics (Total Clients, Active Pipeline, Matches Found, Onboarding).
    *   Full client grid with real-time text search, filter by gender/status, and sorting options (Name, Age, Income).
3.  **Detailed Biodata Profile**:
    *   Complete profile files grouped into Career & Education, Cultural Background, Habits & Lifestyle, and Match Preferences.
    *   Added customized fields: Diet Type, Smoking, Drinking, and Manglik Status.
4.  **Matchmaker Workdesk**:
    *   Interactive sidebar panel allowing matchmakers to dynamically toggle customer status (Onboarding, Active, Matched, Paused).
    *   Editable intake notes textarea that automatically saves and persists directly to the local JSON database file.
5.  **AI-Enhanced Matchmaking Engine**:
    *   **Coarse filtering**: Dynamically filters candidates of the opposite gender within a standard +/- 5 year age range.
    *   **Gemini Scoring**: Evaluate candidate compatibility on demand. Gemini rates matches (0-100%) and generates a warm 1-2 sentence explanation by checking overlap in design, income, diet, relocate preferences, habits, and wanting kids.
    *   **Simulated Fallback**: If no Gemini API Key is present in the environment, a smart local rule simulator generates realistic compatibilities so the MVP can be tested instantly.
6.  **AI Email Generator & Match Actions**:
    *   **Generate Intro**: Opens a simulated email client modal. Gemini drafts a warm, personalized email from the matchmaker to the customer, highlighting specific matching features.
    *   **Send Match**: Simulates a sending action with details of the candidate.

---

## 🛠️ Getting Started

### 1. Install Dependencies
In the root directory, run:
```bash
npm install
```

### 2. Configure Gemini API Key
Create a `.env.local` file in the root folder (or edit the created template):
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```
*Note: If `GEMINI_API_KEY` is left blank, the app will run in fallback simulation mode.*

### 3. Start Development Server
Run the local dev command:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is busy) in your web browser.

---

## 📂 Project Architecture

*   `src/app/`: Next.js pages, layouts, and API endpoints.
    *   `src/app/api/customers/route.ts`: Fetching and saving customer records.
    *   `src/app/api/ai/match-score/route.ts`: Interfacing with Gemini API to score matches.
    *   `src/app/api/ai/generate-email/route.ts`: Interfacing with Gemini API to write intro emails.
*   `src/components/`: Reusable React components.
    *   `AuthProvider.tsx`: Handles authentication sessions.
    *   `CustomerDashboard.tsx`: Displays the pipelines and customer grid.
    *   `CustomerDetailView.tsx`: Displays full customer biodata, notes workdesk, and suggestions list.
*   `src/lib/`: Database and matching engine logic.
    *   `db.ts`: Local JSON database helper (auto-seeds 100 profiles on first load).
    *   `matching.ts`: Custom opposite-gender & age filter engine.
*   `src/types/`: Shared TypeScript interface definitions.
*   `src/data/db.json`: Local database file (auto-generated).

---

## 🔒 Confidentiality & Security

This dashboard is for internal TDC matchmaking operations only. Do not commit `.env.local` to public repositories.
