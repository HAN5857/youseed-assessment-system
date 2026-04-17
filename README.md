# Language Proficiency Assessment

A lean, web-based mini-system that lets prospective students take a timed online language placement test using a passkey provided by a tutor — so the tutor and admin can immediately see results, qualify the lead, and follow up.

> Built as a marketing-conversion funnel, **not** an internal LMS. No parent portal, no class management — just a polished prospect experience that produces a warm lead.

---

## Quick start

```bash
# 1. Install (already done if scaffolded)
npm install

# 2. Apply the database schema (creates dev.db SQLite file)
npm run db:migrate

# 3. Seed sample admin/tutor users + one demo English test
npm run db:seed

# 4. Run
npm run dev
# → http://localhost:3000
```

### Default credentials (from seed)

| Role  | Email                | Password    |
|-------|----------------------|-------------|
| Admin | admin@example.com    | `admin123`  |
| Tutor | tutor@example.com    | `tutor123`  |

### Demo passkey
- Code: **`DEMO-2026-START`** (max uses 99) — paste at `/test`

---

## User flows

### Student (no login)
```
/                           → marketing landing
/test                       → enter passkey → fill profile form
/test/[id]/instructions     → scope, dimensions, time limit, rules
/test/[id]/exam             → timed exam, autosave every 20s, navigator
/test/[id]/result           → instant CEFR-style result + CTA to contact tutor
```

### Tutor / Admin
```
/admin/login               → email + password
/admin                     → leads list (status counts, CSV export)
/admin/leads/[id]          → full result view + CRM contact-status form
/admin/passkeys            → generate / deactivate passkeys
/admin/tests               → browse tests and questions
```

---

## Tech stack

- **Next.js 14** (App Router, RSC) — single app for frontend + API routes
- **SQLite** via **Prisma 6** — zero-config local dev (swap to Postgres by changing `datasource db` in `prisma/schema.prisma`)
- **Tailwind CSS** — utility-first, no UI library overhead
- **JWT cookies** for tutor/admin session and per-attempt student token
- **bcryptjs** for password hashing
- **zod** for request validation

---

## The extensible question-type plugin system

This is the architectural cornerstone — **adding a new question type is a 2-file change with no DB migration.**

### How it works

A `Question` row stores:
- `type` (string, e.g. `"SINGLE"`)
- `content` (JSON — type-specific data: options, blanks, pairs, …)
- `answer`  (JSON — type-specific correct answer)

Two parallel registries pick up the type string:

| Registry | Location | What it does |
|---|---|---|
| Server (scoring) | `src/lib/question-types/index.ts` | Pure functions that score an answer |
| Client (UI) | `src/components/question-renderers/index.tsx` | React components that render the question |

### Built-in types (9, easy to extend)

| Type | Renderer | Notes |
|---|---|---|
| `SINGLE` | `Single.tsx` | Radio, one correct |
| `MULTI` | `Multi.tsx` | Checkboxes, optional partial credit |
| `TRUE_FALSE` | `TrueFalse.tsx` | Two big buttons |
| `FILL` | `Fill.tsx` | Text input, accepts a list of answers |
| `CLOZE` | `Cloze.tsx` | Passage with `___` markers, multiple inline blanks |
| `MATCHING` | `Matching.tsx` | Match left column to right column |
| `ORDERING` | `Ordering.tsx` | Re-order items with up/down buttons |
| `LISTENING` | `Listening.tsx` | Audio player + single-choice |
| `READING` | `Reading.tsx` | Passage + N single-choice sub-questions |

### Adding a new type (3 steps)

1. Create `src/lib/question-types/plugins/your-type.ts`:
   ```ts
   import type { QuestionTypePlugin } from "../types";
   export const yourPlugin: QuestionTypePlugin = {
     type: "YOUR_TYPE",
     label: "Your type",
     description: "…",
     defaultContent: () => ({ /* default editor shape */ }),
     defaultAnswer:  () => ({ /* default answer shape */ }),
     score(answer, response, maxScore, content) {
       // return { score, correct, detail? }
     },
   };
   ```
2. Register it in `src/lib/question-types/index.ts` (one import + one array entry).
3. Create `src/components/question-renderers/YourType.tsx` and register it in `index.tsx`.

That's it. No DB migration. Existing tests keep working.

---

## Scoring

- Each question carries a `score` (max points).
- Per-question scoring is delegated to the type's plugin (deterministic, no LLM calls).
- Total = sum of points; percentage = total / maxScore × 100.
- Per-dimension scores (Vocab, Grammar, Reading, Listening) are aggregated automatically.
- Level mapping (CEFR-style) lives in `src/lib/level.ts` — easy to swap per market.

---

## Anti-cheat (lightweight, marketing-grade)

- Single attempt per passkey (server enforces `usedCount < maxUses`)
- Passkey can be set to expire and/or batch-allow N uses
- Tab-blur events counted and visible in the admin lead view
- Per-attempt JWT cookie scoped to the leadId — autosave/submit reject any other lead
- Server **strips the answer key** before sending questions to the client
- Submission is **idempotent** — a second submit returns the existing result

This is intentionally not high-stakes-exam-grade — the goal is conversion experience, not certification.

---

## Project layout

```
src/
├── app/
│   ├── page.tsx                       # marketing landing
│   ├── test/                          # student funnel (no auth)
│   │   ├── page.tsx                   # passkey + registration
│   │   └── [id]/
│   │       ├── instructions/page.tsx
│   │       ├── exam/page.tsx + ExamRunner.tsx
│   │       └── result/page.tsx
│   ├── admin/                         # tutor/admin (auth required)
│   │   ├── login/page.tsx
│   │   ├── page.tsx                   # leads list
│   │   ├── leads/[id]/                # lead detail + CRM
│   │   ├── passkeys/                  # generator + table
│   │   └── tests/                     # browse tests + questions
│   └── api/                           # JSON endpoints
├── components/
│   ├── ResultView.tsx                 # SHARED result card (student + admin)
│   └── question-renderers/            # CLIENT plugin registry
├── lib/
│   ├── db.ts                          # Prisma singleton
│   ├── auth.ts                        # JWT, cookies, bcrypt
│   ├── attempt-guard.ts               # per-attempt token check
│   ├── level.ts                       # CEFR band mapping
│   └── question-types/                # SERVER plugin registry
│       ├── types.ts
│       ├── index.ts
│       └── plugins/                   # one file per question type
└── prisma/
    ├── schema.prisma                  # Postgres-ready schema
    ├── seed.ts                        # sample data + demo passkey
    └── dev.db                         # SQLite dev database
```

---

## Common tasks

| Task | Command |
|---|---|
| Run dev server | `npm run dev` |
| Build for prod | `npm run build` |
| Apply schema changes | `npm run db:migrate` |
| Re-seed (drops tests/questions, recreates) | `npm run db:seed` |
| Browse DB | `npm run db:studio` |
| Reset entire DB | `npm run db:reset` (asks for confirmation) |

---

## Roadmap (post-MVP)

These were intentionally **left out** of v1 but the architecture supports them:

- 🎙 Speaking question type (record audio → speech-to-text → score) — just a new plugin
- 🤖 LLM-graded short essay — add a plugin whose `score()` calls an LLM
- 📧 Auto-email tutor on submit (Resend / Mailgun) — drop into `/api/lead/[id]/submit`
- 💬 WhatsApp Business notification — same hook
- 📊 Trend dashboards (cohort analysis) — query `Lead` over time
- 🏷 Multi-tenant (multiple tutoring brands on one install)
- 📝 Question authoring UI — the data shapes are already JSON, so a generic editor is feasible

---

## License

Internal / proprietary. Not for redistribution.
