import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding…");

  // ─── Users ────────────────────────────────────────────────────────────────
  const adminPwd = await bcrypt.hash("admin123", 10);
  const tutorPwd = await bcrypt.hash("tutor123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    create: { email: "admin@example.com", passwordHash: adminPwd, name: "Admin", role: "ADMIN" },
    update: { passwordHash: adminPwd },
  });
  const tutor = await prisma.user.upsert({
    where: { email: "tutor@example.com" },
    create: { email: "tutor@example.com", passwordHash: tutorPwd, name: "Sarah Tutor", role: "TUTOR" },
    update: { passwordHash: tutorPwd },
  });

  // ─── Upsert the test (preserve row id so existing leads/passkeys keep their FK) ──
  const TEST_TITLE = "English Proficiency Online Assessment";
  const TEST_SCOPE = [
    "Grade 3 English screening across three modules:",
    "  • Module A — Vocabulary & Phonics",
    "  • Module B — Grammar",
    "  • Module C — Comprehension & Writing",
    "",
    "20 items in total. Aim to answer every question — there is no penalty for guessing.",
  ].join("\n");

  let test = await prisma.test.findFirst({ where: { subject: "English" } });
  if (test) {
    test = await prisma.test.update({
      where: { id: test.id },
      data: { title: TEST_TITLE, duration: 20, passingScore: 60, scope: TEST_SCOPE, active: true },
    });
  } else {
    test = await prisma.test.create({
      data: { title: TEST_TITLE, subject: "English", duration: 20, passingScore: 60, scope: TEST_SCOPE },
    });
  }

  // Wipe only this test's questions (cascade deletes its QuestionLinks).
  // Existing Leads/Passkeys on this test are preserved.
  const oldLinks = await prisma.questionLink.findMany({ where: { testId: test.id }, select: { questionId: true } });
  const oldQids = oldLinks.map((l) => l.questionId);
  await prisma.questionLink.deleteMany({ where: { testId: test.id } });
  if (oldQids.length > 0) {
    await prisma.question.deleteMany({ where: { id: { in: oldQids } } });
  }

  type QData = {
    type: string; dimension: string; level?: number; score?: number;
    prompt: string; mediaUrl?: string | null;
    content?: any; answer?: any; explanation?: string | null;
  };
  const Q = (data: QData) => ({
    type: data.type,
    dimension: data.dimension,
    level: data.level ?? 2,
    score: data.score ?? 4,
    prompt: data.prompt,
    mediaUrl: data.mediaUrl ?? null,
    content: JSON.stringify(data.content ?? {}),
    answer: JSON.stringify(data.answer ?? {}),
    explanation: data.explanation ?? null,
  });

  const questions = await Promise.all([
    // ── MODULE A — VOCABULARY & PHONICS ──────────────────────────────────

    // Q1 — Dining room (with illustration)
    prisma.question.create({ data: Q({
      type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. Where is this place?",
      mediaUrl: "/questions/dining-room.svg",
      content: { options: [
        { key: "A", text: "kitchen" },
        { key: "B", text: "dining room" },
        { key: "C", text: "cellar" },
        { key: "D", text: "living room" },
      ]},
      answer: { key: "B" },
    })}),

    // Q2 — Girl jumping rope (with illustration)
    prisma.question.create({ data: Q({
      type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. What is she doing?",
      mediaUrl: "/questions/skipping.svg",
      content: { options: [
        { key: "A", text: "swimming" },
        { key: "B", text: "running" },
        { key: "C", text: "skipping" },
        { key: "D", text: "diving" },
      ]},
      answer: { key: "C" },
    })}),

    // Q3 — Weather (sunny) (with illustration)
    prisma.question.create({ data: Q({
      type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. What is the weather like?",
      mediaUrl: "/questions/sunny.svg",
      content: { options: [
        { key: "A", text: "rainy" },
        { key: "B", text: "snowy" },
        { key: "C", text: "cloudy" },
        { key: "D", text: "sunny" },
      ]},
      answer: { key: "D" },
    })}),

    // Q4 — Clock 3:45 (with illustration)
    prisma.question.create({ data: Q({
      type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. What is the time now?",
      mediaUrl: "/questions/clock-345.svg",
      content: { options: [
        { key: "A", text: "a quarter to three" },
        { key: "B", text: "a quarter to four" },
        { key: "C", text: "half past three" },
        { key: "D", text: "a quarter past three" },
      ]},
      answer: { key: "B" },
    })}),

    // Q5 — Phonics: rhymes with "run"
    prisma.question.create({ data: Q({
      type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Which word rhymes with “run”?",
      content: { options: [
        { key: "A", text: "rain" },
        { key: "B", text: "coat" },
        { key: "C", text: "jump" },
        { key: "D", text: "sun" },
      ]},
      answer: { key: "D" },
    })}),

    // Q6 — Phonics: starts with same sound as "swim"
    prisma.question.create({ data: Q({
      type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Which word starts with the same sound as “swim”?",
      content: { options: [
        { key: "A", text: "skip" },
        { key: "B", text: "skate" },
        { key: "C", text: "sweet" },
        { key: "D", text: "spin" },
      ]},
      answer: { key: "C" },
    })}),

    // Q7 — Phonics: c _ _ t (coat)
    prisma.question.create({ data: Q({
      type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture of a coat. Choose the missing letters to complete the word:\n\nc _ _ t",
      content: { options: [
        { key: "A", text: "uu" },
        { key: "B", text: "oa" },
        { key: "C", text: "oo" },
        { key: "D", text: "ou" },
      ]},
      answer: { key: "B" },
    })}),

    // Q8 — Listen & fill: h _ t
    prisma.question.create({ data: Q({
      type: "LISTEN_FILL", dimension: "VOCAB", score: 4,
      prompt: "🎧 Click the button to listen. Then fill in the missing letter:\n\nh _ t",
      content: { speakText: "hat", caseSensitive: false, maxPlays: 3, lang: "en-US" },
      answer: { accepted: ["a", "hat"] },
    })}),

    // Q9 — Listen & fill: j _ g
    prisma.question.create({ data: Q({
      type: "LISTEN_FILL", dimension: "VOCAB", score: 4,
      prompt: "🎧 Click the button to listen. Then fill in the missing letter:\n\nj _ g",
      content: { speakText: "jog", caseSensitive: false, maxPlays: 3, lang: "en-US" },
      answer: { accepted: ["o", "jog"] },
    })}),

    // Q10 — Listen & fill: M _ s _ _ m
    prisma.question.create({ data: Q({
      type: "LISTEN_FILL", dimension: "VOCAB", score: 4,
      prompt: "🎧 Click the button to listen. Then type the whole word:\n\nM _ s _ _ m",
      content: { speakText: "museum", caseSensitive: false, maxPlays: 3, lang: "en-US" },
      answer: { accepted: ["museum"] },
    })}),

    // ── MODULE B — GRAMMAR ───────────────────────────────────────────────

    // Q11 — Ali ___ playing football now
    prisma.question.create({ data: Q({
      type: "SINGLE", dimension: "GRAMMAR", score: 4,
      prompt: "Ali ______ playing football now.",
      content: { options: [
        { key: "A", text: "am" },
        { key: "B", text: "are" },
        { key: "C", text: "is" },
        { key: "D", text: "be" },
      ]},
      answer: { key: "C" },
    })}),

    // Q12 — She ___ swim
    prisma.question.create({ data: Q({
      type: "SINGLE", dimension: "GRAMMAR", score: 4,
      prompt: "She ____ swim, but she cannot skate.",
      content: { options: [
        { key: "A", text: "is" },
        { key: "B", text: "has" },
        { key: "C", text: "can" },
        { key: "D", text: "does" },
      ]},
      answer: { key: "C" },
    })}),

    // Q13 — Boys ___ not playing, they ___ swimming
    prisma.question.create({ data: Q({
      type: "SINGLE", dimension: "GRAMMAR", score: 4,
      prompt: "The boys ____ not playing tennis. They ____ swimming.",
      content: { options: [
        { key: "A", text: "is / is" },
        { key: "B", text: "are / are" },
        { key: "C", text: "is / are" },
        { key: "D", text: "are / is" },
      ]},
      answer: { key: "B" },
    })}),

    // Q14 — Match tense forms (MATCHING)
    prisma.question.create({ data: Q({
      type: "MATCHING", dimension: "GRAMMAR", score: 6,
      prompt: "Match each sentence to the correct form of the verb.",
      content: {
        left: [
          "She ____ tennis every day.",
          "She ____ tennis yesterday.",
          "She ____ tennis now.",
        ],
        right: [
          "is playing",
          "played",
          "plays",
        ],
      },
      // Left index → Right index:
      //   0 (every day)  → 2 (plays)
      //   1 (yesterday)  → 1 (played)
      //   2 (now)        → 0 (is playing)
      answer: { pairs: { "0": 2, "1": 1, "2": 0 } },
    })}),

    // Q15 — Sister / photos / pictures cloze (READING with 3 sub-choices)
    prisma.question.create({ data: Q({
      type: "READING", dimension: "GRAMMAR", score: 9,
      prompt: "Choose the correct word to complete each sentence.",
      content: {
        passage: "I have a sister. She has got long and (1) _____ hair. She loves to (2) _____ photos during her free time. Sometimes, she stays at home and (3) _____ pictures.",
        subs: [
          { stem: "(1) Long and _____ hair", options: [
            { key: "A", text: "curly" },
            { key: "B", text: "cloudy" },
            { key: "C", text: "funny" },
          ]},
          { stem: "(2) She loves to _____ photos", options: [
            { key: "A", text: "see" },
            { key: "B", text: "play" },
            { key: "C", text: "take" },
          ]},
          { stem: "(3) Stays at home and _____ pictures", options: [
            { key: "A", text: "paints" },
            { key: "B", text: "eats" },
            { key: "C", text: "writes" },
          ]},
        ],
      },
      answer: { keys: ["A", "C", "A"] },
    })}),

    // ── MODULE C — COMPREHENSION & WRITING ──────────────────────────────

    // Q16 — Sam's father (SINGLE, passage in prompt)
    prisma.question.create({ data: Q({
      type: "SINGLE", dimension: "READING", score: 4,
      prompt:
        "Read the passage:\n\n" +
        "My name is Sam. I am eight years old and I live with my family in a big house. My father is a pilot. He flies airplanes to many countries around the world. He wears a smart uniform and a cap when he goes to work.\n\n" +
        "My mother is a nurse. She works at a hospital near our house. Every day, she helps sick people and makes sure they feel better. She always wears a white uniform to work.\n\n" +
        "My older sister loves sports. She can play tennis and she is very good at swimming. On weekends, she trains at the sports centre with her friends. I want to be a chef one day because I love to cook delicious food for my family.\n\n" +
        "Question: What does Sam’s father do at work? Choose the best answer with TWO pieces of information.",
      content: { options: [
        { key: "A", text: "He drives buses and wears a uniform." },
        { key: "B", text: "He flies airplanes and travels to many countries." },
        { key: "C", text: "He helps sick people and works at a hospital." },
        { key: "D", text: "He plays tennis and trains at the sports centre." },
      ]},
      answer: { key: "B" },
    })}),

    // Q17 — Sam's mother (MULTI, picks TWO correct)
    prisma.question.create({ data: Q({
      type: "MULTI", dimension: "READING", score: 4,
      prompt:
        "Based on the passage about Sam’s family:\n\n" +
        "My mother is a nurse. She works at a hospital near our house. Every day, she helps sick people and makes sure they feel better. She always wears a white uniform to work.\n\n" +
        "Question: Which TWO sentences about Sam’s mother are correct?",
      content: {
        options: [
          { key: "A", text: "She works at a hospital and helps sick people." },
          { key: "B", text: "She works at a school and teaches children." },
          { key: "C", text: "She wears a white uniform and goes to the sports centre." },
          { key: "D", text: "She wears a white uniform and works near Sam’s house." },
        ],
        partialCredit: true,
      },
      answer: { keys: ["A", "D"] },
    })}),

    // Q18 — Sam's sister (SINGLE)
    prisma.question.create({ data: Q({
      type: "SINGLE", dimension: "READING", score: 4,
      prompt:
        "Based on the passage about Sam’s family:\n\n" +
        "My older sister loves sports. She can play tennis and she is very good at swimming. On weekends, she trains at the sports centre with her friends.\n\n" +
        "Question: Which sentence is TRUE based on the passage?",
      content: { options: [
        { key: "A", text: "Sam’s sister cannot swim, but she can play tennis." },
        { key: "B", text: "Sam’s sister trains on weekdays and wants to be a chef." },
        { key: "C", text: "Sam’s sister is good at swimming and trains at the sports centre on weekends." },
        { key: "D", text: "Sam’s sister works at a hospital and wears a white uniform." },
      ]},
      answer: { key: "C" },
    })}),

    // Q19 — Rearrange words (ORDERING, WRITING)
    prisma.question.create({ data: Q({
      type: "ORDERING", dimension: "WRITING", score: 6,
      prompt: "Rearrange ALL the words below to make one correct sentence.",
      content: {
        // Source order: vegetable / The / was / really / soup / delicious
        items: ["vegetable", "The", "was", "really", "soup", "delicious"],
      },
      // Correct: "The vegetable soup was really delicious"
      // Indices in correct order:  1(The) 0(vegetable) 4(soup) 2(was) 3(really) 5(delicious)
      answer: { order: [1, 0, 4, 2, 3, 5] },
      explanation: "The vegetable soup was really delicious.",
    })}),

    // Q20 — Rearrange words (ORDERING, WRITING)
    prisma.question.create({ data: Q({
      type: "ORDERING", dimension: "WRITING", score: 6,
      prompt: "Rearrange ALL the words below to make one correct sentence.",
      content: {
        // Source chunks: There's / big window / next to / bed / my / a
        items: ["There’s", "big window", "next to", "bed", "my", "a"],
      },
      // Correct: "There's a big window next to my bed"
      // Indices:  0(There's) 5(a) 1(big window) 2(next to) 4(my) 3(bed)
      answer: { order: [0, 5, 1, 2, 4, 3] },
      explanation: "There’s a big window next to my bed.",
    })}),
  ]);

  // Link questions in order
  await Promise.all(
    questions.map((q, i) =>
      prisma.questionLink.create({ data: { testId: test.id, questionId: q.id, order: i + 1 } })
    )
  );

  // ─── Demo passkey ───────────────────────────────────────────────────────
  await prisma.passkey.upsert({
    where: { code: "DEMO-2026-START" },
    create: {
      code: "DEMO-2026-START",
      testId: test.id,
      tutorId: tutor.id,
      maxUses: 99,
      note: "Demo passkey created by seed",
    },
    update: { active: true, maxUses: 99, testId: test.id, tutorId: tutor.id },
  });

  console.log("✅ Seed complete.");
  console.log("");
  console.log("   Admin login : admin@example.com / admin123");
  console.log("   Tutor login : tutor@example.com / tutor123");
  console.log("   Demo passkey: DEMO-2026-START");
  console.log(`   Test        : ${test.title} (${questions.length} cards, 20 items)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
