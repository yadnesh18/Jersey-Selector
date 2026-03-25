# 🎽 Jersey Number Selection System (React + Vite)
## Complete Setup & Deployment Guide

---

## 📐 Architecture

```
src/
├── main.jsx              → Mounts React into #root
├── App.jsx               → All state + Supabase logic
├── index.css             → Tailwind + global styles
├── lib/
│   └── supabase.js       → Supabase client (import once, use everywhere)
└── components/
    ├── JerseyGrid.jsx    → 1–100 number grid
    ├── StudentForm.jsx   → Name + roll number form
    ├── SelectionsList.jsx→ Who picked what
    └── Toast.jsx         → Success/error notifications
```

No custom backend. React talks directly to Supabase via the anon key + Row Level Security (RLS).

---

## Step 1 — Create a Supabase Project

1. Go to https://supabase.com → sign in
2. Click **"New project"**
3. Fill in name, password, region → **Create new project**
4. Wait ~2 minutes for the project to be ready

---

## Step 2 — Create the Table

1. Left sidebar → **SQL Editor** → **New query**
2. Paste this SQL and click **Run**:

```sql
CREATE TABLE jersey_selections (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT        NOT NULL,
  roll_number   TEXT,
  jersey_number INTEGER     NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT jersey_selections_jersey_number_key UNIQUE (jersey_number)
);

ALTER TABLE jersey_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read"
  ON jersey_selections FOR SELECT USING (true);

CREATE POLICY "Allow public insert"
  ON jersey_selections FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete"
  ON jersey_selections FOR DELETE USING (true);
```

You should see: **Success. No rows returned.**

---

## Step 3 — Enable Real-Time

1. Left sidebar → **Database** → **Replication**
2. Find `jersey_selections` and toggle it ON

This lets the app update live when anyone picks a number.

---

## Step 4 — Get Your API Keys

1. Left sidebar → **Project Settings** (⚙ gear icon) → **API**
2. Copy:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon / public** key (long string starting with `eyJ…`)

---

## Step 5 — Set Up Locally

```bash
# 1. Extract the zip and enter the folder
cd jersey-react

# 2. Install dependencies
npm install

# 3. Create your env file
cp .env.example .env

# 4. Open .env and paste your Supabase credentials:
#    VITE_SUPABASE_URL=https://your-project.supabase.co
#    VITE_SUPABASE_ANON_KEY=eyJ...

# 5. Start the dev server
npm run dev
```

Open http://localhost:5173 — the app should load with a green grid.

> **Tip:** Open two browser tabs to test real-time updates!

---

## Step 6 — Deploy to Vercel

### Option A — Upload (easiest, no Git needed)

```bash
npm run build   # creates the dist/ folder
```

1. Go to https://vercel.com → **Add New Project** → **Upload**
2. Drag and drop the `dist/` folder
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy ✅

### Option B — GitHub (best for updates)

```bash
git init
git add .
git commit -m "initial commit"
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/jersey-react.git
git push -u origin main
```

Then on Vercel:
1. **Add New Project** → import your GitHub repo
2. Add the two environment variables
3. **Deploy**

Future `git push` → auto-redeploy.

### Option C — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel --prod
```

---

## 🔑 Admin Mode

Press **Ctrl + Shift + A** anywhere in the app to unlock admin mode.
A **"Reset All Selections"** button will appear at the bottom of the list.

---

## 🐛 Troubleshooting

| Problem | Fix |
|---|---|
| Blank page / env error | Check `.env` has `VITE_` prefix on both keys |
| "Could not load jersey data" | Verify Supabase URL is correct and table exists |
| Numbers don't update live | Enable Replication for `jersey_selections` in Supabase |
| Duplicate pick doesn't show error | Re-run the `CREATE CONSTRAINT` SQL |
| Vercel build fails | Make sure `dist/` is NOT in `.gitignore` when uploading manually |

---

## ✅ Feature Checklist

- [x] 1–100 grid with colour coding
- [x] Green = available, grey = taken, gold ⭐ = yours
- [x] Student name (required) + roll number (optional)
- [x] UNIQUE DB constraint — true duplicate prevention
- [x] Friendly error on duplicate attempt
- [x] Real-time sync via Supabase subscriptions
- [x] Admin reset (Ctrl+Shift+A)
- [x] Sorted student list with jersey numbers
- [x] Mobile responsive with tab switching
- [x] Toast notifications
- [x] Loading skeleton while data fetches
