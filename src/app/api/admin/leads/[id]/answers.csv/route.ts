// Per-lead answers download — CSV (default) or JSON via ?format=json.
// Includes question prompt, student response, correct answer, score per item.
// Same auth rules as the rest of /api/admin/leads/* — TUTOR sees only their own.

import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

type BreakdownItem = {
  questionId: string;
  type: string;
  dimension: string;
  response: any;
  score: number;
  max: number;
  correct: boolean;
};

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let session;
  try { session = await requireSession(); } catch {
    return new Response("Unauthorized", { status: 401 });
  }
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const format = (url.searchParams.get("format") ?? "csv").toLowerCase();

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      test: { select: { title: true, subject: true, level: true } },
      tutor: { select: { name: true, email: true } },
    },
  });
  if (!lead) return new Response("Not found", { status: 404 });
  if (session.role !== "ADMIN" && lead.tutorId !== session.uid) {
    return new Response("Forbidden", { status: 403 });
  }

  const breakdown: BreakdownItem[] = lead.answers ? safeJson(lead.answers) ?? [] : [];
  const qIds = breakdown.map((b) => b.questionId);
  const qRows = qIds.length
    ? await prisma.question.findMany({
        where: { id: { in: qIds } },
        select: { id: true, prompt: true, content: true, answer: true },
      })
    : [];
  const byId = Object.fromEntries(qRows.map((q) => [q.id, q]));

  const enriched = breakdown.map((b, idx) => {
    const q = byId[b.questionId];
    const content = q?.content ? safeJson(q.content) : null;
    const correct = q?.answer ? safeJson(q.answer) : null;
    return {
      index: idx + 1,
      questionId: b.questionId,
      type: b.type,
      dimension: b.dimension,
      prompt: q?.prompt ?? "(question deleted)",
      studentResponse: formatAnswer(b.type, b.response, content),
      correctAnswer: formatAnswer(b.type, correct, content, "correct"),
      score: b.score,
      max: b.max,
      isCorrect: b.correct,
    };
  });

  const slug = sanitizeFilename(`${lead.name}-${lead.test.title}`).slice(0, 80);

  if (format === "json") {
    const payload = {
      lead: {
        id: lead.id, name: lead.name, age: lead.age, email: lead.email, phone: lead.phone,
        location: lead.location, status: lead.status, level: lead.level,
        totalScore: lead.totalScore, maxScore: lead.maxScore, percentage: lead.percentage,
        startedAt: lead.startedAt.toISOString(),
        submittedAt: lead.submittedAt?.toISOString() ?? null,
      },
      test: { ...lead.test },
      tutor: lead.tutor,
      answers: enriched,
    };
    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}.json"`,
      },
    });
  }

  // CSV — one row per question, with lead context on every row for spreadsheet pivots.
  const header = [
    "leadId","studentName","studentEmail","testTitle","level","tutorName",
    "questionNo","dimension","type","prompt","studentResponse","correctAnswer",
    "score","max","isCorrect",
  ];
  const rows = enriched.map((e) => [
    lead.id, lead.name, lead.email, lead.test.title, lead.level ?? "", lead.tutor.name,
    e.index, e.dimension, e.type, e.prompt, e.studentResponse, e.correctAnswer,
    e.score, e.max, e.isCorrect ? "yes" : "no",
  ]);
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.csv"`,
    },
  });
}

// ── Formatting helpers (kept in sync with AnswerBreakdown.tsx) ──
function formatAnswer(type: string, value: any, content: any, mode: "student" | "correct" = "student"): string {
  if (value == null) return "(blank)";
  try {
    switch (type) {
      case "SINGLE": {
        const key = value.key ?? value;
        if (!key) return "(blank)";
        const opt = content?.options?.find((o: any) => o.key === key);
        return opt ? `${key}: ${opt.text}` : String(key);
      }
      case "MULTI": {
        const keys: string[] = value.keys ?? value ?? [];
        if (!keys.length) return "(blank)";
        const opts = content?.options ?? [];
        return keys
          .map((k) => {
            const o = opts.find((x: any) => x.key === k);
            return o ? `${k}: ${o.text}` : k;
          })
          .join(" | ");
      }
      case "FILL":
      case "SHORT":
      case "WRITING": {
        if (mode === "correct") {
          const accepted: string[] = value.accepted ?? [];
          if (accepted.length) return accepted.join(" / ");
          if (value.rubric) return value.rubric;
          return value.text ?? JSON.stringify(value);
        }
        return value.text ?? "(blank)";
      }
      case "TRUE_FALSE":
        return value.value === true ? "TRUE" : value.value === false ? "FALSE" : "(blank)";
      case "MATCHING": {
        const pairs: Record<string, number> = value.pairs ?? {};
        const left = content?.left ?? [];
        const right = content?.right ?? [];
        if (!Object.keys(pairs).length) return "(blank)";
        return Object.entries(pairs)
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([li, ri]) => {
            const lText = typeof left[Number(li)] === "string" ? left[Number(li)] : left[Number(li)]?.text;
            const rText = right[Number(ri)];
            return `${lText} -> ${rText}`;
          })
          .join(" | ");
      }
      case "ORDERING": {
        const order: number[] = value.order ?? [];
        const items: string[] = content?.items ?? [];
        if (!order.length) return "(blank)";
        return order.map((i) => items[i]).join(" ");
      }
      case "CLOZE":
      case "READING": {
        const keys: string[] = value.keys ?? [];
        if (!keys.length) return "(blank)";
        return keys.map((k, i) => `(${i + 1}) ${k}`).join(" ");
      }
      case "LISTEN_FILL":
      case "LISTENING":
        return value.text ?? JSON.stringify(value);
      default:
        return typeof value === "string" ? value : JSON.stringify(value);
    }
  } catch {
    return JSON.stringify(value);
  }
}

function csvCell(v: any) {
  const s = String(v ?? "").replace(/\r?\n/g, " ");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function sanitizeFilename(name: string) {
  return name.replace(/[^A-Za-z0-9 ._-]/g, "").replace(/\s+/g, "-");
}

function safeJson(s: string) { try { return JSON.parse(s); } catch { return null; } }
