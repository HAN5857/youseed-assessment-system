import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

async function upsertTest(opts: {
  subject: string;          // "english"
  level: string;            // "standard-1"
  title: string;
  duration: number;
  passingScore: number;
  scope: string;
  active: boolean;
  questionsBuilder?: () => QData[]; // omit for placeholder Tests
}) {
  // Try to find existing test for this (subject, level) via unique index
  const existing = await prisma.test.findFirst({
    where: { subject: opts.subject, level: opts.level },
  });

  let test;
  if (existing) {
    test = await prisma.test.update({
      where: { id: existing.id },
      data: {
        title: opts.title,
        duration: opts.duration,
        passingScore: opts.passingScore,
        scope: opts.scope,
        active: opts.active,
      },
    });
    // Wipe existing questions for this test
    const oldLinks = await prisma.questionLink.findMany({ where: { testId: test.id }, select: { questionId: true } });
    await prisma.questionLink.deleteMany({ where: { testId: test.id } });
    if (oldLinks.length > 0) {
      await prisma.question.deleteMany({ where: { id: { in: oldLinks.map((l) => l.questionId) } } });
    }
  } else {
    test = await prisma.test.create({
      data: {
        subject: opts.subject,
        level: opts.level,
        title: opts.title,
        duration: opts.duration,
        passingScore: opts.passingScore,
        scope: opts.scope,
        active: opts.active,
      },
    });
  }

  // Build + link questions
  if (opts.active && opts.questionsBuilder) {
    const qs = opts.questionsBuilder();
    const created = await Promise.all(qs.map((d) => prisma.question.create({ data: Q(d) })));
    await Promise.all(
      created.map((q, i) =>
        prisma.questionLink.create({ data: { testId: test.id, questionId: q.id, order: i + 1 } })
      )
    );
  }
  return test;
}

async function main() {
  console.log("🌱 Seeding…");

  // ─── Users ────────────────────────────────────────────────────────────
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

  const SCOPE_TEMPLATE = (year: string, units: string) => [
    `${year} English placement check across three modules:`,
    "  • Module A — Vocabulary & Phonics (50%)",
    "  • Module B — Grammar (25%)",
    "  • Module C — Comprehension & Writing (25%)",
    "",
    `Curriculum reference: ${units}`,
    "20 items in total. Aim to answer every question — there is no penalty for guessing.",
  ].join("\n");

  const SCOPE_TEMPLATE_UPPER = (year: string, units: string) => [
    `${year} English placement check — 9 parts:`,
    "  • Vocabulary & Phonics  (Q1–12, ~35%)",
    "  • Grammar & Comprehension  (Q13–24, ~35%)",
    "  • Writing  (Q25, 30%)",
    "",
    `Curriculum reference: ${units}`,
    "Take your time — there is no penalty for guessing. Read every question carefully.",
  ].join("\n");

  // ─── ENGLISH STANDARD 1 ───────────────────────────────────────────────
  const s1 = await upsertTest({
    subject: "english",
    level: "standard-1",
    title: "English Standard 1 — Placement Check",
    duration: 20,
    passingScore: 60,
    scope: SCOPE_TEMPLATE("Year 1", "Supermind Year 1 · Unit 0–4"),
    active: true,
    questionsBuilder: () => standard1Questions(),
  });

  // ─── ENGLISH STANDARD 2 ───────────────────────────────────────────────
  const s2 = await upsertTest({
    subject: "english",
    level: "standard-2",
    title: "English Standard 2 — Placement Check",
    duration: 20,
    passingScore: 60,
    scope: SCOPE_TEMPLATE("Year 2", "Supermind Year 2 · Unit 5–9"),
    active: true,
    questionsBuilder: () => standard2Questions(),
  });

  // ─── ENGLISH STANDARD 3 ───────────────────────────────────────────────
  const s3 = await upsertTest({
    subject: "english",
    level: "standard-3",
    title: "English Standard 3 — Placement Check",
    duration: 20,
    passingScore: 60,
    scope: SCOPE_TEMPLATE("Year 3", "Year 3 · Vocabulary, grammar & comprehension"),
    active: true,
    questionsBuilder: () => standard3Questions(),
  });

  // ─── ENGLISH STANDARD 4 ───────────────────────────────────────────────
  const s4 = await upsertTest({
    subject: "english",
    level: "standard-4",
    title: "English Standard 4 — Placement Check",
    duration: 25,
    passingScore: 60,
    scope: SCOPE_TEMPLATE_UPPER("Year 4", "Get Smart Plus 4 · Module 1–10"),
    active: true,
    questionsBuilder: () => standard4Questions(),
  });

  // ─── ENGLISH STANDARD 5 ───────────────────────────────────────────────
  const s5 = await upsertTest({
    subject: "english",
    level: "standard-5",
    title: "English Standard 5 — Placement Check",
    duration: 25,
    passingScore: 60,
    scope: SCOPE_TEMPLATE_UPPER("Year 5", "English Plus 1 · Starter Unit – Unit 8"),
    active: true,
    questionsBuilder: () => standard5Questions(),
  });

  // ─── ENGLISH STANDARD 6 ───────────────────────────────────────────────
  const s6 = await upsertTest({
    subject: "english",
    level: "standard-6",
    title: "English Standard 6 — Placement Check",
    duration: 25,
    passingScore: 60,
    scope: SCOPE_TEMPLATE_UPPER("Year 6", "Academy Stars Year 6 · Welcome – Unit 10"),
    active: true,
    questionsBuilder: () => standard6Questions(),
  });

  // ─── Demo passkeys (one per active level) ─────────────────────────────
  const demoKeys: { code: string; testId: string; note: string }[] = [
    { code: "ENG-S1-DEMO", testId: s1.id, note: "Demo passkey — English Standard 1" },
    { code: "ENG-S2-DEMO", testId: s2.id, note: "Demo passkey — English Standard 2" },
    { code: "ENG-S3-DEMO", testId: s3.id, note: "Demo passkey — English Standard 3" },
    { code: "ENG-S4-DEMO", testId: s4.id, note: "Demo passkey — English Standard 4" },
    { code: "ENG-S5-DEMO", testId: s5.id, note: "Demo passkey — English Standard 5" },
    { code: "ENG-S6-DEMO", testId: s6.id, note: "Demo passkey — English Standard 6" },
    // Backward-compat: original passkey points to Standard 3 (current default)
    { code: "DEMO-2026-START", testId: s3.id, note: "Legacy demo passkey (S3)" },
  ];
  for (const pk of demoKeys) {
    await prisma.passkey.upsert({
      where: { code: pk.code },
      create: { code: pk.code, testId: pk.testId, tutorId: tutor.id, maxUses: 99, note: pk.note },
      update: { active: true, maxUses: 99, testId: pk.testId, tutorId: tutor.id },
    });
  }

  console.log("✅ Seed complete.");
  console.log("");
  console.log("   Admin login : admin@example.com / admin123");
  console.log("   Tutor login : tutor@example.com / tutor123");
  console.log("   Passkeys:");
  console.log("     ENG-S1-DEMO    → English Standard 1");
  console.log("     ENG-S2-DEMO    → English Standard 2");
  console.log("     ENG-S3-DEMO    → English Standard 3");
  console.log("     ENG-S4-DEMO    → English Standard 4");
  console.log("     ENG-S5-DEMO    → English Standard 5");
  console.log("     ENG-S6-DEMO    → English Standard 6");
  console.log("     DEMO-2026-START → English Standard 3 (legacy)");
  console.log("");
  console.log("   Users tested → admin: " + admin.email + ", tutor: " + tutor.email);
}

// ════════════════════════════════════════════════════════════════════════
// QUESTION BANKS
// ════════════════════════════════════════════════════════════════════════

// ─────────────────────────── STANDARD 1 ─────────────────────────────────
function standard1Questions(): QData[] {
  return [
    // Q1 — writing tool
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. A child is writing with this. What is it?",
      mediaUrl: "/questions/standard-1/writing.png",
      content: { options: [
        { key: "A", text: "ruler" }, { key: "B", text: "bag" },
        { key: "C", text: "pencil" }, { key: "D", text: "book" },
      ]},
      answer: { key: "C" } },
    // Q2 — cat
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. This animal says “meow” and has a long tail. What is it?",
      mediaUrl: "/questions/standard-1/cat.png",
      content: { options: [
        { key: "A", text: "dog" }, { key: "B", text: "cat" },
        { key: "C", text: "duck" }, { key: "D", text: "frog" },
      ]},
      answer: { key: "B" } },
    // Q3 — banana
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. This fruit is yellow and long. What is it?",
      mediaUrl: "/questions/standard-1/banana.png",
      content: { options: [
        { key: "A", text: "apple" }, { key: "B", text: "cake" },
        { key: "C", text: "carrot" }, { key: "D", text: "banana" },
      ]},
      answer: { key: "D" } },
    // Q4 — kite
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. A child is flying this in the sky using a string. What is this toy?",
      mediaUrl: "/questions/standard-1/kite.png",
      content: { options: [
        { key: "A", text: "ball" }, { key: "B", text: "bike" },
        { key: "C", text: "kite" }, { key: "D", text: "train" },
      ]},
      answer: { key: "C" } },
    // Q5 — phonics: starts with same letter as "dog"
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Which word starts with the same letter as “dog”?",
      content: { options: [
        { key: "A", text: "cat" }, { key: "B", text: "duck" },
        { key: "C", text: "frog" }, { key: "D", text: "rat" },
      ]},
      answer: { key: "B" } },
    // Q6 — phonics: rhymes with "cat"
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Which word rhymes with “cat”?",
      content: { options: [
        { key: "A", text: "dog" }, { key: "B", text: "frog" },
        { key: "C", text: "rat" }, { key: "D", text: "duck" },
      ]},
      answer: { key: "C" } },
    // Q7 — _pple (apple) — multiple choice
    { type: "LISTEN_FILL", dimension: "VOCAB", score: 4,
      prompt: "🎧 Click the button to listen. Then choose the missing letter:\n\n_ p p l e",
      content: { speakText: "apple", caseSensitive: false, maxPlays: 3, lang: "en-US" },
      answer: { accepted: ["a", "apple"] } },
    // Q8 — d_g (dog)
    { type: "LISTEN_FILL", dimension: "VOCAB", score: 4,
      prompt: "🎧 Click the button to listen. Then fill in the missing letter:\n\nd _ g",
      content: { speakText: "dog", caseSensitive: false, maxPlays: 3, lang: "en-US" },
      answer: { accepted: ["o", "dog"] } },
    // Q9 — b_g (bag)
    { type: "LISTEN_FILL", dimension: "VOCAB", score: 4,
      prompt: "🎧 Click the button to listen. Then fill in the missing letter:\n\nb _ g",
      content: { speakText: "bag", caseSensitive: false, maxPlays: 3, lang: "en-US" },
      answer: { accepted: ["a", "bag"] } },
    // Q10 — f__g (frog), pick two letters
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture of a frog. Two letters are missing. Choose the correct answer:\n\nf _ _ g",
      content: { options: [
        { key: "A", text: "ra" }, { key: "B", text: "ro" },
        { key: "C", text: "ru" }, { key: "D", text: "re" },
      ]},
      answer: { key: "B" } },

    // ── Module B — Grammar
    // Q11 — ___ name is Ali
    { type: "SINGLE", dimension: "GRAMMAR", score: 4,
      prompt: "________ name is Ali.",
      content: { options: [
        { key: "A", text: "I" }, { key: "B", text: "My" },
        { key: "C", text: "He" }, { key: "D", text: "Am" },
      ]},
      answer: { key: "B" } },
    // Q12 — I ___ pizza
    { type: "SINGLE", dimension: "GRAMMAR", score: 4,
      prompt: "I ________ pizza. It is delicious!",
      content: { options: [
        { key: "A", text: "don't" }, { key: "B", text: "am" },
        { key: "C", text: "like" }, { key: "D", text: "is" },
      ]},
      answer: { key: "C" } },
    // Q13 — Sam ___ got
    { type: "SINGLE", dimension: "GRAMMAR", score: 4,
      prompt: "Sam ________ got a red kite.",
      content: { options: [
        { key: "A", text: "have" }, { key: "B", text: "has" },
        { key: "C", text: "am" }, { key: "D", text: "is" },
      ]},
      answer: { key: "B" } },
    // Q14 — Match tense forms (icons = food topic; answer is verb tense, so safe)
    // S1 OPT-IN: drag-drop matching via Framer Motion Reorder
    { type: "MATCHING", dimension: "GRAMMAR", score: 6,
      prompt: "Match each sentence to the correct verb form.",
      content: {
        dragDrop: true,
        left: [
          { text: "I ____ rice every day.",         icon: "🍚" },
          { text: "She ____ a banana yesterday.",   icon: "🍌" },
          { text: "They ____ cake now.",            icon: "🎂" },
        ],
        right: ["ate", "are eating", "eat"],
      },
      // 0 (every day) → 2 (eat); 1 (yesterday) → 0 (ate); 2 (now) → 1 (are eating)
      answer: { pairs: { "0": 2, "1": 0, "2": 1 } } },
    // Q15 — Sentence completion (icons = topic, never the missing word)
    { type: "READING", dimension: "GRAMMAR", score: 9,
      prompt: "Choose the correct word to complete each sentence.",
      content: {
        passage: "1.  I _____ six years old.\n2.  I don't _____ carrots.\n3.  _____ have got a blue pencil.",
        subs: [
          { stem: "(1) I _____ six years old.",          icon: "🎂", options: [
            { key: "A", text: "am" }, { key: "B", text: "is" }, { key: "C", text: "are" },
          ]},
          { stem: "(2) I don't _____ carrots.",          icon: "🥕", options: [
            { key: "A", text: "likes" }, { key: "B", text: "like" }, { key: "C", text: "liking" },
          ]},
          { stem: "(3) _____ have got a blue pencil.",   icon: "✏️", options: [
            { key: "A", text: "He" }, { key: "B", text: "She" }, { key: "C", text: "I" },
          ]},
        ],
      },
      answer: { keys: ["A", "B", "C"] } },

    // ── Module C — Comprehension & Writing (Mia passage)
    { type: "SINGLE", dimension: "READING", score: 4,
      prompt: "What is the name of Mia’s pet cat?",
      content: {
        passage:
          "My name is Mia. I am seven years old. I have got a pet cat. Her name is Biscuit. She is white and small. At school, I use a pencil and a ruler. My favourite food is pizza. I don't like carrots. I think they are not yummy! After school, I play with my kite in the garden. I have got a blue kite. My best friend is Siti. She has got long black hair and big brown eyes. She likes to eat bananas and apples. We are good friends!",
        options: [
          { key: "A", text: "Mia" }, { key: "B", text: "Pizza" },
          { key: "C", text: "Biscuit" }, { key: "D", text: "Kite" },
        ],
      },
      answer: { key: "C" } },
    // Q17 — MULTI: which sentences about Mia are correct
    { type: "MULTI", dimension: "READING", score: 4,
      prompt: "Pick the correct sentence(s) about Mia.",
      content: {
        passage:
          "My name is Mia. I am seven years old. I have got a pet cat. Her name is Biscuit. She is white and small. At school, I use a pencil and a ruler. After school, I play with my kite in the garden. I have got a blue kite.",
        options: [
          { key: "A", text: "Mia likes carrots and pizza." },
          { key: "B", text: "Mia is seven years old and has a white cat." },
          { key: "C", text: "Mia uses a pencil at school and plays football after school." },
          { key: "D", text: "Mia has a big brown cat named Biscuit." },
        ],
        partialCredit: true,
      },
      answer: { keys: ["B"] } },
    // Q18 — TRUE based on passage
    { type: "SINGLE", dimension: "READING", score: 4,
      prompt: "Which answer is TRUE based on the passage?",
      content: {
        passage:
          "My name is Mia. I have got a pet cat called Biscuit. My favourite food is pizza. I don't like carrots — I think they are not yummy! After school, I play with my kite in the garden. My best friend is Siti.",
        options: [
          { key: "A", text: "Mia likes carrots because they are yummy." },
          { key: "B", text: "Siti has got short hair and small eyes." },
          { key: "C", text: "Mia plays with her kite at school." },
          { key: "D", text: "Mia does not like carrots and her best friend is Siti." },
        ],
      },
      answer: { key: "D" } },
    // Q19 — rearrange: I have got a pet dog
    // S1 OPT-IN: drag-drop word reorder via Framer Motion Reorder
    { type: "ORDERING", dimension: "WRITING", score: 6,
      prompt: "Rearrange ALL the words below to make one correct sentence.",
      content: { dragDrop: true, items: ["got", "a", "have", "I", "pet", "dog"] },
      // Correct order: I(3) have(2) got(0) a(1) pet(4) dog(5)
      answer: { order: [3, 2, 0, 1, 4, 5] },
      explanation: "I have got a pet dog." },
    // Q20 — rearrange: She has got long black hair
    // S1 OPT-IN: drag-drop word reorder
    { type: "ORDERING", dimension: "WRITING", score: 6,
      prompt: "Rearrange ALL the words below to make one correct sentence.",
      content: { dragDrop: true, items: ["long", "has", "black", "got", "She", "hair"] },
      // Correct order: She(4) has(1) got(3) long(0) black(2) hair(5)
      answer: { order: [4, 1, 3, 0, 2, 5] },
      explanation: "She has got long black hair." },
  ];
}

// ─────────────────────────── STANDARD 2 ─────────────────────────────────
function standard2Questions(): QData[] {
  return [
    // Q1 — jeans
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. A girl is wearing this on her legs. It is blue and has two long sections. What is it?",
      mediaUrl: "/questions/standard-2/jeans.png",
      content: { options: [
        { key: "A", text: "skirt" }, { key: "B", text: "jeans" },
        { key: "C", text: "shorts" }, { key: "D", text: "sweater" },
      ]},
      answer: { key: "B" } },
    // Q2 — dining room
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. A family is eating together at a table with food. Which room are they in?",
      mediaUrl: "/questions/standard-2/dining-room.png",
      content: { options: [
        { key: "A", text: "bedroom" }, { key: "B", text: "bathroom" },
        { key: "C", text: "dining room" }, { key: "D", text: "cellar" },
      ]},
      answer: { key: "C" } },
    // Q3 — dancing
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. A boy is moving his arms and legs and bending his body to music. What is he doing?",
      mediaUrl: "/questions/standard-2/dancing.png",
      content: { options: [
        { key: "A", text: "swimming" }, { key: "B", text: "dancing" },
        { key: "C", text: "skipping" }, { key: "D", text: "singing" },
      ]},
      answer: { key: "B" } },
    // Q4 — fishing
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. A girl is at the beach. She is holding a rod and pulling a fish out of the water. What is she doing?",
      mediaUrl: "/questions/standard-2/fishing.png",
      content: { options: [
        { key: "A", text: "drawing" }, { key: "B", text: "fishing" },
        { key: "C", text: "swimming" }, { key: "D", text: "taking a photo" },
      ]},
      answer: { key: "B" } },
    // Q5 — rhymes with coat
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Which word rhymes with “coat”?",
      content: { options: [
        { key: "A", text: "cat" }, { key: "B", text: "boat" },
        { key: "C", text: "kite" }, { key: "D", text: "sock" },
      ]},
      answer: { key: "B" } },
    // Q6 — same sound as shirt
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Which word starts with the same sound as “shirt”?",
      content: { options: [
        { key: "A", text: "skate" }, { key: "B", text: "swim" },
        { key: "C", text: "shoe" }, { key: "D", text: "snake" },
      ]},
      answer: { key: "C" } },
    // Q7 — b__ch (beach)
    { type: "LISTEN_FILL", dimension: "VOCAB", score: 4,
      prompt: "🎧 Click the button to listen. Then type the missing letters:\n\nb _ _ ch",
      content: { speakText: "beach", caseSensitive: false, maxPlays: 3, lang: "en-US" },
      answer: { accepted: ["ea", "beach"] } },
    // Q8 — s_ck (sock)
    { type: "LISTEN_FILL", dimension: "VOCAB", score: 4,
      prompt: "🎧 Click the button to listen. Then fill in the missing letter:\n\ns _ ck",
      content: { speakText: "sock", caseSensitive: false, maxPlays: 3, lang: "en-US" },
      answer: { accepted: ["o", "sock"] } },
    // Q9 — c_p (cap)
    { type: "LISTEN_FILL", dimension: "VOCAB", score: 4,
      prompt: "🎧 Click the button to listen. Then fill in the missing letter:\n\nc _ p",
      content: { speakText: "cap", caseSensitive: false, maxPlays: 3, lang: "en-US" },
      answer: { accepted: ["a", "cap"] } },
    // Q10 — sw__ter (sweater) — pick two letters
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture of a sweater. Two letters are missing. Choose the correct answer:\n\nsw _ _ ter",
      content: { options: [
        { key: "A", text: "ee" }, { key: "B", text: "ea" },
        { key: "C", text: "oo" }, { key: "D", text: "ie" },
      ]},
      answer: { key: "A" } },

    // ── Module B — Grammar
    // Q11 — I play football on ___
    { type: "SINGLE", dimension: "GRAMMAR", score: 4,
      prompt: "I play football on ________.",
      content: { options: [
        { key: "A", text: "Monday" }, { key: "B", text: "Mondays" },
        { key: "C", text: "the Monday" }, { key: "D", text: "a Monday" },
      ]},
      answer: { key: "B" } },
    // Q12 — Is/Are/Do/Have there
    { type: "SINGLE", dimension: "GRAMMAR", score: 4,
      prompt: "________ there a bathroom in the house?",
      content: { options: [
        { key: "A", text: "Are" }, { key: "B", text: "Is" },
        { key: "C", text: "Do" }, { key: "D", text: "Have" },
      ]},
      answer: { key: "B" } },
    // Q13 — She ___ wearing
    { type: "SINGLE", dimension: "GRAMMAR", score: 4,
      prompt: "She ________ wearing a red skirt and white shoes.",
      content: { options: [
        { key: "A", text: "am" }, { key: "B", text: "are" },
        { key: "C", text: "is" }, { key: "D", text: "be" },
      ]},
      answer: { key: "C" } },
    // Q14 — There is/are matching
    // Icons = ROOM theme, NOT the furniture nouns (sofa/beds/chairs are the answers)
    { type: "MATCHING", dimension: "GRAMMAR", score: 6,
      prompt: "Match each sentence to the correct phrase.",
      content: {
        left: [
          { text: "There is _____ in the living room.", icon: "📺" }, // TV → living-room theme; doesn't reveal "sofa"
          { text: "There are _____ in the bedroom.",    icon: "😴" }, // sleeping → bedroom theme; doesn't reveal "beds"
          { text: "Are there _____?",                   icon: "❓" }, // question form; doesn't reveal "chairs"
        ],
        right: ["two beds", "a sofa", "any chairs"],
      },
      // 0 (There IS singular) → 1 (a sofa); 1 (There ARE plural) → 0 (two beds); 2 → 2 (any chairs)
      answer: { pairs: { "0": 1, "1": 0, "2": 2 } } },
    // Q15 — Sentence completion (icons = topic verbs/nouns NOT in answer set)
    { type: "READING", dimension: "GRAMMAR", score: 9,
      prompt: "Choose the correct word to complete each sentence.",
      content: {
        passage: "1.  I _____ swim, but I can't do gymnastics.\n2.  _____ you like these jeans?\n3.  Let's _____ to the beach on Saturday!",
        subs: [
          { stem: "(1) I _____ swim, but I can't do gymnastics.", icon: "🏊", options: [
            { key: "A", text: "can" }, { key: "B", text: "am" }, { key: "C", text: "is" },
          ]},
          { stem: "(2) _____ you like these jeans?",              icon: "👖", options: [
            { key: "A", text: "Do" }, { key: "B", text: "Are" }, { key: "C", text: "Is" },
          ]},
          { stem: "(3) Let's _____ to the beach on Saturday!",    icon: "🏖", options: [
            { key: "A", text: "going" }, { key: "B", text: "goes" }, { key: "C", text: "go" },
          ]},
        ],
      },
      answer: { keys: ["A", "A", "C"] } },

    // ── Module C — Lily's week (passage)
    { type: "SINGLE", dimension: "READING", score: 4,
      prompt: "What does Lily do on Wednesdays?",
      content: {
        passage:
          "My name is Lily. I am eight years old. Every day after school, I do different activities. On Mondays, I go swimming. On Wednesdays, I play football with my friends at the park. On Fridays, I go dancing at a dance studio near my house.\n\nMy bedroom is my favourite room. There is a big window next to my bed. There are two shelves on the wall. I keep my books and toys on the shelves.\n\nLast weekend, I went to the beach with my family. We had so much fun! My brother went fishing. My sister took photos of the sea. I drew pictures of the sandcastles. It was a wonderful day!",
        options: [
          { key: "A", text: "She goes swimming." },
          { key: "B", text: "She plays football with her friends." },
          { key: "C", text: "She goes dancing." },
          { key: "D", text: "She goes fishing." },
        ],
      },
      answer: { key: "B" } },
    { type: "MULTI", dimension: "READING", score: 4,
      prompt: "Which TWO sentences about Lily’s bedroom are correct?",
      content: {
        passage: "My bedroom is my favourite room. There is a big window next to my bed. There are two shelves on the wall. I keep my books and toys on the shelves.",
        options: [
          { key: "A", text: "There is a big window next to her bed." },
          { key: "B", text: "There is a swimming pool in her bedroom." },
          { key: "C", text: "There are two shelves on the wall." },
          { key: "D", text: "There are books and a sofa in her room." },
        ],
        partialCredit: true,
      },
      answer: { keys: ["A", "C"] } },
    { type: "SINGLE", dimension: "READING", score: 4,
      prompt: "Which answer is TRUE based on the passage?",
      content: {
        passage: "Last weekend, I went to the beach with my family. My brother went fishing. My sister took photos of the sea. I drew pictures of the sandcastles. It was a wonderful day!",
        options: [
          { key: "A", text: "Lily drew pictures of the sea at the beach." },
          { key: "B", text: "Lily’s brother took photos and her sister went fishing." },
          { key: "C", text: "Lily drew pictures of the sandcastles and her brother went fishing." },
          { key: "D", text: "Lily went fishing with her brother at the beach." },
        ],
      },
      answer: { key: "C" } },
    // Q19 — rearrange: I go swimming on Tuesdays.
    { type: "ORDERING", dimension: "WRITING", score: 6,
      prompt: "Rearrange ALL the words below to make one correct sentence.",
      content: { items: ["on", "go", "I", "Tuesdays", "swimming"] },
      // I(2) go(1) swimming(4) on(0) Tuesdays(3)
      answer: { order: [2, 1, 4, 0, 3] },
      explanation: "I go swimming on Tuesdays." },
    // Q20 — rearrange: Is she wearing a blue jacket?
    { type: "ORDERING", dimension: "WRITING", score: 6,
      prompt: "Rearrange ALL the words below to make one correct sentence.",
      content: { items: ["wearing", "she", "Is", "a", "jacket", "blue"] },
      // Is(2) she(1) wearing(0) a(3) blue(5) jacket(4)
      answer: { order: [2, 1, 0, 3, 5, 4] },
      explanation: "Is she wearing a blue jacket?" },
  ];
}

// ─────────────────────────── STANDARD 3 ─────────────────────────────────
function standard3Questions(): QData[] {
  return [
    // Q1 — Dining room
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. Where is this place?",
      mediaUrl: "/questions/standard-3/dining-room.svg",
      content: { options: [
        { key: "A", text: "kitchen" }, { key: "B", text: "dining room" },
        { key: "C", text: "cellar" }, { key: "D", text: "living room" },
      ]},
      answer: { key: "B" } },
    // Q2 — Skipping
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. What is she doing?",
      mediaUrl: "/questions/standard-3/skipping.svg",
      content: { options: [
        { key: "A", text: "swimming" }, { key: "B", text: "running" },
        { key: "C", text: "skipping" }, { key: "D", text: "diving" },
      ]},
      answer: { key: "C" } },
    // Q3 — Sunny
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. What is the weather like?",
      mediaUrl: "/questions/standard-3/sunny.svg",
      content: { options: [
        { key: "A", text: "rainy" }, { key: "B", text: "snowy" },
        { key: "C", text: "cloudy" }, { key: "D", text: "sunny" },
      ]},
      answer: { key: "D" } },
    // Q4 — Clock 3:45
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture. What is the time now?",
      mediaUrl: "/questions/standard-3/clock-345.svg",
      content: { options: [
        { key: "A", text: "a quarter to three" }, { key: "B", text: "a quarter to four" },
        { key: "C", text: "half past three" }, { key: "D", text: "a quarter past three" },
      ]},
      answer: { key: "B" } },
    // Q5 — Phonics rhymes with run
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Which word rhymes with “run”?",
      content: { options: [
        { key: "A", text: "rain" }, { key: "B", text: "coat" },
        { key: "C", text: "jump" }, { key: "D", text: "sun" },
      ]},
      answer: { key: "D" } },
    // Q6 — Same sound as swim
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Which word starts with the same sound as “swim”?",
      content: { options: [
        { key: "A", text: "skip" }, { key: "B", text: "skate" },
        { key: "C", text: "sweet" }, { key: "D", text: "spin" },
      ]},
      answer: { key: "C" } },
    // Q7 — c__t coat
    { type: "SINGLE", dimension: "VOCAB", score: 4,
      prompt: "Look at the picture of a coat. Choose the missing letters to complete the word:\n\nc _ _ t",
      content: { options: [
        { key: "A", text: "uu" }, { key: "B", text: "oa" },
        { key: "C", text: "oo" }, { key: "D", text: "ou" },
      ]},
      answer: { key: "B" } },
    // Q8 — Listen & fill: hat
    { type: "LISTEN_FILL", dimension: "VOCAB", score: 4,
      prompt: "🎧 Click the button to listen. Then fill in the missing letter:\n\nh _ t",
      content: { speakText: "hat", caseSensitive: false, maxPlays: 3, lang: "en-US" },
      answer: { accepted: ["a", "hat"] } },
    // Q9 — Listen & fill: jog
    { type: "LISTEN_FILL", dimension: "VOCAB", score: 4,
      prompt: "🎧 Click the button to listen. Then fill in the missing letter:\n\nj _ g",
      content: { speakText: "jog", caseSensitive: false, maxPlays: 3, lang: "en-US" },
      answer: { accepted: ["o", "jog"] } },
    // Q10 — Listen & fill: museum
    { type: "LISTEN_FILL", dimension: "VOCAB", score: 4,
      prompt: "🎧 Click the button to listen. Then type the whole word:\n\nM _ s _ _ m",
      content: { speakText: "museum", caseSensitive: false, maxPlays: 3, lang: "en-US" },
      answer: { accepted: ["museum"] } },
    // Q11 — is playing
    { type: "SINGLE", dimension: "GRAMMAR", score: 4,
      prompt: "Ali ________ playing football now.",
      content: { options: [
        { key: "A", text: "am" }, { key: "B", text: "are" },
        { key: "C", text: "is" }, { key: "D", text: "be" },
      ]},
      answer: { key: "C" } },
    // Q12 — can/has/is/does
    { type: "SINGLE", dimension: "GRAMMAR", score: 4,
      prompt: "She ________ swim, but she cannot skate.",
      content: { options: [
        { key: "A", text: "is" }, { key: "B", text: "has" },
        { key: "C", text: "can" }, { key: "D", text: "does" },
      ]},
      answer: { key: "C" } },
    // Q13 — are not / are
    { type: "SINGLE", dimension: "GRAMMAR", score: 4,
      prompt: "The boys ________ not playing tennis. They ________ swimming.",
      content: { options: [
        { key: "A", text: "is / is" }, { key: "B", text: "are / are" },
        { key: "C", text: "is / are" }, { key: "D", text: "are / is" },
      ]},
      answer: { key: "B" } },
    // Q14 — Match tense forms (icon = tennis topic; answer is verb tense)
    // Same emoji on every row because the SUBJECT is identical; row colours give variety
    { type: "MATCHING", dimension: "GRAMMAR", score: 6,
      prompt: "Match each sentence to the correct form of the verb.",
      content: {
        left: [
          { text: "She ____ tennis every day.",   icon: "🎾" },
          { text: "She ____ tennis yesterday.",   icon: "🎾" },
          { text: "She ____ tennis now.",         icon: "🎾" },
        ],
        right: ["is playing", "played", "plays"],
      },
      answer: { pairs: { "0": 2, "1": 1, "2": 0 } } },
    // Q15 — Sister photos cloze (icons = the topic noun, not the missing verb/adjective)
    { type: "READING", dimension: "GRAMMAR", score: 9,
      prompt: "Choose the correct word to complete each sentence.",
      content: {
        passage: "I have a sister. She has got long and (1) _____ hair. She loves to (2) _____ photos during her free time. Sometimes, she stays at home and (3) _____ pictures.",
        subs: [
          { stem: "(1) Long and _____ hair",                  icon: "👧", options: [
            { key: "A", text: "curly" }, { key: "B", text: "cloudy" }, { key: "C", text: "funny" },
          ]},
          { stem: "(2) She loves to _____ photos",            icon: "📸", options: [
            { key: "A", text: "see" }, { key: "B", text: "play" }, { key: "C", text: "take" },
          ]},
          { stem: "(3) Stays at home and _____ pictures",     icon: "🖼", options: [
            { key: "A", text: "paints" }, { key: "B", text: "eats" }, { key: "C", text: "writes" },
          ]},
        ],
      },
      answer: { keys: ["A", "C", "A"] } },
    // Q16 — Sam's father
    { type: "SINGLE", dimension: "READING", score: 4,
      prompt: "What does Sam’s father do at work? Choose the best answer with TWO pieces of information.",
      content: {
        passage:
          "My name is Sam. I am eight years old and I live with my family in a big house. My father is a pilot. He flies airplanes to many countries around the world. He wears a smart uniform and a cap when he goes to work.\n\nMy mother is a nurse. She works at a hospital near our house. Every day, she helps sick people and makes sure they feel better. She always wears a white uniform to work.\n\nMy older sister loves sports. She can play tennis and she is very good at swimming. On weekends, she trains at the sports centre with her friends. I want to be a chef one day because I love to cook delicious food for my family.",
        options: [
          { key: "A", text: "He drives buses and wears a uniform." },
          { key: "B", text: "He flies airplanes and travels to many countries." },
          { key: "C", text: "He helps sick people and works at a hospital." },
          { key: "D", text: "He plays tennis and trains at the sports centre." },
        ],
      },
      answer: { key: "B" } },
    // Q17 — Sam's mother MULTI
    { type: "MULTI", dimension: "READING", score: 4,
      prompt: "Which TWO sentences about Sam’s mother are correct?",
      content: {
        passage: "My mother is a nurse. She works at a hospital near our house. Every day, she helps sick people and makes sure they feel better. She always wears a white uniform to work.",
        options: [
          { key: "A", text: "She works at a hospital and helps sick people." },
          { key: "B", text: "She works at a school and teaches children." },
          { key: "C", text: "She wears a white uniform and goes to the sports centre." },
          { key: "D", text: "She wears a white uniform and works near Sam’s house." },
        ],
        partialCredit: true,
      },
      answer: { keys: ["A", "D"] } },
    // Q18 — Sam's sister
    { type: "SINGLE", dimension: "READING", score: 4,
      prompt: "Which sentence is TRUE based on the passage?",
      content: {
        passage: "My older sister loves sports. She can play tennis and she is very good at swimming. On weekends, she trains at the sports centre with her friends.",
        options: [
          { key: "A", text: "Sam’s sister cannot swim, but she can play tennis." },
          { key: "B", text: "Sam’s sister trains on weekdays and wants to be a chef." },
          { key: "C", text: "Sam’s sister is good at swimming and trains at the sports centre on weekends." },
          { key: "D", text: "Sam’s sister works at a hospital and wears a white uniform." },
        ],
      },
      answer: { key: "C" } },
    // Q19 — rearrange: vegetable soup
    { type: "ORDERING", dimension: "WRITING", score: 6,
      prompt: "Rearrange ALL the words below to make one correct sentence.",
      content: { items: ["vegetable", "The", "was", "really", "soup", "delicious"] },
      answer: { order: [1, 0, 4, 2, 3, 5] },
      explanation: "The vegetable soup was really delicious." },
    // Q20 — rearrange: big window
    { type: "ORDERING", dimension: "WRITING", score: 6,
      prompt: "Rearrange ALL the words below to make one correct sentence.",
      content: { items: ["There’s", "big window", "next to", "bed", "my", "a"] },
      answer: { order: [0, 5, 1, 2, 4, 3] },
      explanation: "There’s a big window next to my bed." },
  ];
}

// ─────────────────────────── STANDARD 4 ─────────────────────────────────
// Source: Standard 4 Assessment Input/4年级_Placement_Test.docx
// Get Smart Plus 4 · Module 1–10. 21 question cards · 34 marks total.
//   Q1-2 Picture choice (2)  ·  Q3 Matching x3 (3)  ·  Q6-7 Spelling (2)
//   Q8-12 Phonics audio (5)  ·  Q13-15 Grammar (3)  ·  Q16-18 Cloze x3 (3)
//   Q19-21 Reading-1 (3)     ·  Q22-24 Reading-2 (3) ·  Q25 Writing (10)
function standard4Questions(): QData[] {
  return [
    // Q1 — Deepavali (descriptive — no image needed; the prompt describes everything)
    { type: "SINGLE", dimension: "VOCAB", score: 1,
      prompt: "Read the sentence and choose the correct word.\n\nPeople light oil lamps, draw rangoli patterns and wear colourful traditional clothes during this celebration. What is it?",
      content: { options: [
        { key: "A", text: "Christmas" }, { key: "B", text: "Deepavali" }, { key: "C", text: "Chinese New Year" },
      ], topicIcon: "🪔", topicLabel: "Festival"},
      answer: { key: "B" } },
    // Q2 — Cheetah (image-based picture choice)
    { type: "SINGLE", dimension: "VOCAB", score: 1,
      prompt: "Read the sentence and choose the correct word.\n\nThis animal is the fastest land animal in the world. It has black spots on golden fur and lives in Africa. What is it?",
      mediaUrl: "/questions/standard-4/cheetah.jpg",
      content: { options: [
        { key: "A", text: "lion" }, { key: "B", text: "tiger" }, { key: "C", text: "cheetah" },
      ], topicLabel: "Animals"},
      answer: { key: "C" } },
    // Q3-5 — Vocabulary matching (combined into one MATCHING card, 3 marks)
    { type: "MATCHING", dimension: "VOCAB", score: 3,
      prompt: "Match each word to its correct meaning.",
      content: {
        left: [
          { text: "Nocturnal", icon: "🌙" },
          { text: "Carnivore", icon: "🍖" },
          { text: "Diurnal",   icon: "☀️" },
        ],
        right: [
          "an animal that eats only meat",
          "active during the day, sleeping at night",
          "active at night, sleeping during the day",
        ],
      },
      answer: { pairs: { "0": 2, "1": 0, "2": 1 } } },
    // Q6 — Chef
    { type: "FILL", dimension: "VOCAB", score: 1,
      prompt: "Read the description below. Write the missing word — the first letter is given.\n\nA person who cooks food professionally in a restaurant or hotel.\n\nHint:  C _ _ _",
      content: { caseSensitive: false , topicIcon: "👨‍🍳", topicLabel: "People"},
      answer: { accepted: ["chef"] } },
    // Q7 — Stormy
    { type: "FILL", dimension: "VOCAB", score: 1,
      prompt: "Read the description below. Write the missing word — the first letter is given.\n\nA type of weather with dark skies, thunder, strong winds and heavy rain.\n\nHint:  S _ _ _ _ _",
      content: { caseSensitive: false , topicIcon: "⛈️", topicLabel: "Weather"},
      answer: { accepted: ["stormy"] } },
    // Q8 — Phonics: pyramid (audio + picture)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "Listen to the audio. Which of the following is the CORRECT spelling?",
      mediaUrl: "/audio/standard-4/pyramid.mp3",
      content: { maxPlays: 3, imageUrl: "/questions/standard-4/pyramid.jpg", options: [
        { key: "A", text: "piramid" }, { key: "B", text: "pyramid" }, { key: "C", text: "phyramid" },
      ]},
      answer: { key: "B" } },
    // Q9 — Phonics: celebration (audio + picture)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "Listen to the audio. Which of the following is the CORRECT spelling?\n(This word means: a special event that people celebrate.)",
      mediaUrl: "/audio/standard-4/celebration.mp3",
      content: { maxPlays: 3, imageUrl: "/questions/standard-4/celebration.jpg", options: [
        { key: "A", text: "selebration" }, { key: "B", text: "celebrasion" }, { key: "C", text: "celebration" },
      ]},
      answer: { key: "C" } },
    // Q10 — Phonics fill: healthy (audio + picture)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "Listen to the audio. The picture shows a person exercising and eating vegetables. Which letters complete the word?\n\nh _ _ l t h y",
      mediaUrl: "/audio/standard-4/healthy.mp3",
      content: { maxPlays: 3, imageUrl: "/questions/standard-4/healthy.jpg", options: [
        { key: "A", text: "ee" }, { key: "B", text: "ea" }, { key: "C", text: "ie" },
      ]},
      answer: { key: "B" } },
    // Q11 — Phonics fill: cheetah (audio + picture, shared image with Q2)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "Listen to the audio. The picture shows the fastest land animal. Which letters complete the word?\n\nc h _ _ t a h",
      mediaUrl: "/audio/standard-4/cheetah.mp3",
      content: { maxPlays: 3, imageUrl: "/questions/standard-4/cheetah.jpg", options: [
        { key: "A", text: "ee" }, { key: "B", text: "ea" }, { key: "C", text: "oo" },
      ]},
      answer: { key: "A" } },
    // Q12 — Bicycle (no audio, picture aids context)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "Which of the following is the CORRECT spelling?\n(This is a vehicle with two wheels and pedals — Module 6: Getting Around.)",
      mediaUrl: "/questions/standard-4/bicycle.jpg",
      content: { options: [
        { key: "A", text: "bicycal" }, { key: "B", text: "bisycle" }, { key: "C", text: "bicycle" },
      ], topicLabel: "Transport"},
      answer: { key: "C" } },
    // Q13 — Grammar past tense (image: travel)
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "Choose the correct answer.\n\nLast Saturday, Amir and his family ________ to Penang by bus.",
      mediaUrl: "/questions/standard-4/travel.jpg",
      content: { options: [
        { key: "A", text: "travel" }, { key: "B", text: "travels" }, { key: "C", text: "travelled" },
      ], topicLabel: "Travel"},
      answer: { key: "C" } },
    // Q14 — Grammar future (image: visit grandparents)
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "Choose the correct answer.\n\nDuring the next school holidays, we ________ visit our grandparents in Ipoh.",
      mediaUrl: "/questions/standard-4/visit-grandparents.jpg",
      content: { options: [
        { key: "A", text: "were" }, { key: "B", text: "are going to" }, { key: "C", text: "did" },
      ], topicLabel: "Family"},
      answer: { key: "B" } },
    // Q15 — Grammar superlative (image: cheetah running)
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "Choose the correct answer.\n\nThe cheetah is the ________ land animal in the world. It can run at 120 km/h!",
      mediaUrl: "/questions/standard-4/cheetah-15.jpg",
      content: { options: [
        { key: "A", text: "fast" }, { key: "B", text: "faster" }, { key: "C", text: "fastest" },
      ], topicLabel: "Animals"},
      answer: { key: "C" } },
    // Q16-18 — Grammar in context cloze (My Healthy Lifestyle)
    { type: "READING", dimension: "GRAMMAR", score: 3,
      prompt: "Read the passage. Choose the correct word for each blank.",
      content: {
        passage:
          "My Healthy Lifestyle\n\nMy name is Kavya. I always try to live a healthy lifestyle. Every morning, I (16) ______ for thirty minutes before going to school. At school, I (17) ______ drink sugary drinks. I prefer plain water or fresh fruit juice. My favourite sport is badminton. I play it (18) ______ a week — on Tuesday and Thursday.",
        subs: [
          { stem: "(16) Every morning, I ______ for thirty minutes.", options: [
            { key: "A", text: "jog" }, { key: "B", text: "jogging" }, { key: "C", text: "jogged" },
          ]},
          { stem: "(17) At school, I ______ drink sugary drinks.", options: [
            { key: "A", text: "always" }, { key: "B", text: "usually" }, { key: "C", text: "never" },
          ]},
          { stem: "(18) I play it ______ a week — on Tuesday and Thursday.", options: [
            { key: "A", text: "once" }, { key: "B", text: "twice" }, { key: "C", text: "three times" },
          ]},
        ],
      },
      answer: { keys: ["A", "C", "B"] } },
    // Q19 — Reading dialogue (Hana / Zack)
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the text carefully and choose the correct answer.\n\nAccording to the dialogue, which of the following is TRUE?",
      content: {
        passage:
          "Hana: How often do you have Science, Zack?\nZack: I have it three times a week — Monday, Wednesday and Friday.\nHana: I only have it twice a week. But I love Science! It is my favourite subject. I also have Maths on Monday and Thursday.",
        options: [
          { key: "A", text: "Zack has Science twice a week." },
          { key: "B", text: "Hana has Maths twice a week." },
          { key: "C", text: "Hana has Science three times a week." },
        ],
      },
      answer: { key: "B" } },
    // Q20 — Ben's chores (Tuesday)
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the text carefully and choose the correct answer.\n\nWhat does Ben have to do on Tuesday?",
      content: {
        passage:
          "Ben's Weekly Chores\nMonday    → Make his bed and water the plants\nTuesday   → Feed the dog and rake leaves\nWednesday → Do the washing-up after dinner\nThursday  → Take out the rubbish\nFriday    → Sweep and mop the floor",
        options: [
          { key: "A", text: "Sweep the floor and mop." },
          { key: "B", text: "Feed the dog and rake leaves." },
          { key: "C", text: "Take out the rubbish." },
        ],
      },
      answer: { key: "B" } },
    // Q21 — Aquaria KLCC (cheapest total for 1 child + 1 adult + 1 senior)
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the text carefully and choose the correct answer.\n\nAli (age 9) visits Aquaria KLCC with his mother and grandmother. What is the cheapest total price?",
      content: {
        passage:
          "AQUARIA KLCC — Entry Ticket\nAdult:                              RM 55\nChild (4–12):                       RM 45\nSenior Citizen:                     RM 35\nFamily Package (2 adults + 2 children):  RM 170",
        options: [
          { key: "A", text: "RM 135" }, { key: "B", text: "RM 155" }, { key: "C", text: "RM 170" },
        ],
      },
      answer: { key: "A" } },
    // Q22 — Email Sabah: diurnal meaning
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the email below and choose the best answer.\n\nWhat does the word \"diurnal\" mean in the email?",
      content: {
        passage:
          "To: shiven@gmail.com    Date: 5th August 2024\nSubject: My Trip to Sabah!\n\nHi Shi Ven,\nLast month, my family and I went on an amazing trip to Sabah! On the first day, we visited the Sepilok Orangutan Rehabilitation Centre. Our guide told us that orangutans are diurnal animals — they are active during the day and sleep at night in nests made of leaves high up in the trees.\nOn the second day, we went snorkelling at Pulau Gaya. The water was crystal clear and we saw many colourful fish around the coral reefs. In the evening, we ate freshly grilled seafood at a floating restaurant. It was the most delicious meal I had ever tasted!\nYour friend,  Amirul",
        options: [
          { key: "A", text: "Active at night and sleeping during the day." },
          { key: "B", text: "Active during the day and sleeping at night." },
          { key: "C", text: "Sleeping all day and all night." },
        ],
      },
      answer: { key: "B" } },
    // Q23 — Email Sabah: day 2
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the email below and choose the best answer.\n\nWhat did Amirul do on the second day?",
      content: {
        passage:
          "On the second day, we went snorkelling at Pulau Gaya. The water was crystal clear and we saw many colourful fish around the coral reefs. In the evening, we ate freshly grilled seafood at a floating restaurant.",
        options: [
          { key: "A", text: "He visited the Sepilok Orangutan Centre." },
          { key: "B", text: "He went snorkelling and ate grilled seafood." },
          { key: "C", text: "He took photos of fish in the market." },
        ],
      },
      answer: { key: "B" } },
    // Q24 — Email Sabah: TRUE
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the email below and choose the best answer.\n\nWhich of the following is TRUE about the email?",
      content: {
        passage:
          "Our guide told us that orangutans are diurnal animals — they are active during the day and sleep at night in nests made of leaves. We went snorkelling at Pulau Gaya — the water was crystal clear. In the evening, we ate freshly grilled seafood at a floating restaurant.",
        options: [
          { key: "A", text: "Orangutans sleep during the day." },
          { key: "B", text: "The water at Pulau Gaya was dirty and dark." },
          { key: "C", text: "Amirul ate grilled seafood at a floating restaurant." },
        ],
      },
      answer: { key: "C" } },
    // Q25 — Writing email pen-pal (30-50 words)
    { type: "SHORT", dimension: "WRITING", score: 10,
      prompt: "Write an email to introduce yourself to a new pen pal called Eaden Siew.\nInclude:\n  • yourself and your family\n  • your school and favourite subject\n  • your hobbies\nWrite about 30–50 words.",
      content: {
        minWords: 30,
        maxWords: 50,
        template: "Hi Eaden,\n\nMy name is _______. I am ____ years old. I live in _______ with my family. At school, my favourite subject is _______. In my free time, I love _______.\n\nYour friend,\n_______",
      },
      answer: { rubric: "Greeting · self/family · school + favourite subject · hobbies · closing" } },
  ];
}

// ─────────────────────────── STANDARD 5 ─────────────────────────────────
// Source: Standard 5 Assessment Input/5年级_Placement_Test.docx
// English Plus 1 · Starter Unit – Unit 8. Same structure as S4.
function standard5Questions(): QData[] {
  return [
    // Q1 — Skateboarding (picture in DOCX) — image replaces the floating topic icon
    { type: "SINGLE", dimension: "VOCAB", score: 1,
      prompt: "Read the sentence and choose the correct word.\n\nThis person moves on a board with four wheels. It is a popular hobby and street sport. What is it?",
      mediaUrl: "/questions/standard-5/skateboarding.jpg",
      content: { options: [
        { key: "A", text: "chatting online" }, { key: "B", text: "skateboarding" }, { key: "C", text: "photography" },
      ], topicLabel: "Hobbies"},
      answer: { key: "B" } },
    // Q2 — Monument (picture in DOCX)
    { type: "SINGLE", dimension: "VOCAB", score: 1,
      prompt: "Read the sentence and choose the correct word.\n\nThis is a special statue or building. It is built to help people to remember an important person or event from history. What is it?",
      mediaUrl: "/questions/standard-5/monument.jpg",
      content: { options: [
        { key: "A", text: "theatre" }, { key: "B", text: "library" }, { key: "C", text: "monument" },
      ], topicLabel: "Places"},
      answer: { key: "C" } },
    // Q3-5 — Matching
    { type: "MATCHING", dimension: "VOCAB", score: 3,
      prompt: "Match each word to its correct meaning.",
      content: {
        left: [
          { text: "Champion",   icon: "🏆" },
          { text: "Routine",    icon: "🕐" },
          { text: "Endangered", icon: "🐼" },
        ],
        right: [
          "things you do regularly in the mornings, evenings, etc.",
          "a person who wins a competition or is the best",
          "at risk of disappearing completely from the world",
        ],
      },
      answer: { pairs: { "0": 1, "1": 0, "2": 2 } } },
    // Q6 — History
    { type: "FILL", dimension: "VOCAB", score: 1,
      prompt: "Read the description below. Write the missing word — the first letter is given.\n\nA subject at school where you learn about events and people from the past. (Unit 4 — Learning world)\n\nHint:  H _ _ _ _ _ _",
      content: { caseSensitive: false , topicIcon: "📚", topicLabel: "School"},
      answer: { accepted: ["history"] } },
    // Q7 — Camel
    { type: "FILL", dimension: "VOCAB", score: 1,
      prompt: "Read the description below. Write the missing word — the first letter is given.\n\nA large animal that lives in the desert and has one or two humps on its back. (Unit 3 — Wild life)\n\nHint:  C _ _ _ _",
      content: { caseSensitive: false , topicIcon: "🐫", topicLabel: "Animals"},
      answer: { accepted: ["camel"] } },
    // Q8 — Phonics: interesting (audio)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "Listen to the audio. Which of the following is the CORRECT spelling?",
      mediaUrl: "/audio/standard-5/interesting.mp3",
      content: { maxPlays: 3, options: [
        { key: "A", text: "inresting" }, { key: "B", text: "inteting" }, { key: "C", text: "interesting" },
      ]},
      answer: { key: "C" } },
    // Q9 — Phonics: dangerous (audio)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "Listen to the audio. Which of the following is the CORRECT spelling?",
      mediaUrl: "/audio/standard-5/dangerous.mp3",
      content: { maxPlays: 3, options: [
        { key: "A", text: "dangrous" }, { key: "B", text: "dangerous" }, { key: "C", text: "dangereous" },
      ]},
      answer: { key: "B" } },
    // Q10 — Phonics fill: creature (audio + picture)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "Listen to the audio. The picture shows a small animal with six legs. Which letters complete the word?\n\nc r _ _ t _ r e",
      mediaUrl: "/audio/standard-5/creature.mp3",
      content: { maxPlays: 3, imageUrl: "/questions/standard-5/creature.jpg", options: [
        { key: "A", text: "ea / u" }, { key: "B", text: "ee / u" }, { key: "C", text: "ea / a" },
      ]},
      answer: { key: "A" } },
    // Q11 — Phonics fill: supermarket (audio + picture)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "Listen to the audio. The picture shows a large shop where you can buy food, drinks and household items. Which letters complete the word?\n\ns u p _ r m _ r k _ t",
      mediaUrl: "/audio/standard-5/supermarket.mp3",
      content: { maxPlays: 3, imageUrl: "/questions/standard-5/supermarket.jpg", options: [
        { key: "A", text: "e / a / e" }, { key: "B", text: "a / e / a" }, { key: "C", text: "e / e / a" },
      ]},
      answer: { key: "A" } },
    // Q12 — Restaurants (no audio, picture aids context)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "Which of the following is the CORRECT spelling?\n(This means the shop that you have your meal inside — Unit 1: Towns and cities.)",
      mediaUrl: "/questions/standard-5/restaurant.jpg",
      content: { options: [
        { key: "A", text: "restaurants" }, { key: "B", text: "restorant" }, { key: "C", text: "resteronts" },
      ], topicLabel: "Places"},
      answer: { key: "A" } },
    // Q13 — Grammar: There is/are
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "Choose the correct answer.\n\nThere ________ a big park and two museums in our town.",
      content: { options: [
        { key: "A", text: "is" }, { key: "B", text: "are" }, { key: "C", text: "am" },
      ], topicIcon: "🏞️", topicLabel: "Places"},
      answer: { key: "A" } },
    // Q14 — Grammar: superlative
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "Choose the correct answer.\n\nElephants are the ________ land animals in the world.",
      content: { options: [
        { key: "A", text: "more big" }, { key: "B", text: "bigger" }, { key: "C", text: "biggest" },
      ], topicIcon: "🐘", topicLabel: "Animals"},
      answer: { key: "C" } },
    // Q15 — Grammar: present simple 3rd person
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "Choose the correct answer.\n\nMy sister ________ her homework every evening before dinner.",
      content: { options: [
        { key: "A", text: "do" }, { key: "B", text: "does" }, { key: "C", text: "doing" },
      ], topicIcon: "📖", topicLabel: "Routine"},
      answer: { key: "B" } },
    // Q16-18 — Grammar in context cloze (My Summer Holiday Plan)
    { type: "READING", dimension: "GRAMMAR", score: 3,
      prompt: "Read the passage. Choose the correct word for each blank.",
      content: {
        passage:
          "My Summer Holiday Plan\n\nNext month, my family and I (16) ______ go to Langkawi for our school holidays. We are very excited! My dad (17) ______ the hotel last week, so everything is ready. On the first day, we are going to visit the cable car and take photos. My mum (18) ______ swimming every day because she loves the sea. I can't wait!",
        subs: [
          { stem: "(16) Next month, my family and I ______ go to Langkawi.", options: [
            { key: "A", text: "are going to" }, { key: "B", text: "was" }, { key: "C", text: "go" },
          ]},
          { stem: "(17) My dad ______ the hotel last week, so everything is ready.", options: [
            { key: "A", text: "book" }, { key: "B", text: "booked" }, { key: "C", text: "booking" },
          ]},
          { stem: "(18) My mum ______ swimming every day because she loves the sea.", options: [
            { key: "A", text: "go" }, { key: "B", text: "goes" }, { key: "C", text: "going" },
          ]},
        ],
      },
      answer: { keys: ["A", "B", "B"] } },
    // Q19 — Reading dialogue (Tom / Mia)
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the text carefully and choose the correct answer.\n\nAccording to the dialogue, which statement is TRUE?",
      content: {
        passage:
          "Tom: What time do you usually get up, Mia?\nMia: I always get up at six thirty. Then I have breakfast and walk to school.\nTom: Do you ever take the bus?\nMia: No, never. My school is only ten minutes on foot. What about you?\nTom: I usually take the bus, but I sometimes cycle if the weather is good.",
        options: [
          { key: "A", text: "Mia sometimes takes the bus to school." },
          { key: "B", text: "Tom always cycles to school." },
          { key: "C", text: "Mia walks to school every day." },
        ],
      },
      answer: { key: "C" } },
    // Q20 — Weekly classes (water sport in morning)
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the text carefully and choose the correct answer.\n\nOn which day can you do a water sport in the morning?",
      content: {
        passage:
          "City Sports Centre — Weekly Classes\nMonday    → Swimming        (9:00 a.m.)\nTuesday   → Football training (4:00 p.m.)\nWednesday → Basketball       (3:30 p.m.)\nThursday  → Gymnastics       (5:00 p.m.)\nFriday    → Cycling club     (8:00 a.m.)",
        options: [
          { key: "A", text: "Tuesday." }, { key: "B", text: "Monday." }, { key: "C", text: "Friday." },
        ],
      },
      answer: { key: "B" } },
    // Q21 — City Zoo total (2 students + 1 adult)
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the text carefully and choose the correct answer.\n\nTwo students with ID cards and one adult visit the zoo. What is the cheapest total price?",
      content: {
        passage:
          "City Zoo — Entry Tickets\nAdult:                  RM 40\nChild (under 12):       RM 25\nStudent (with ID):      RM 30\nFamily Package (2 adults + 2 children):  RM 110",
        options: [
          { key: "A", text: "RM 100" }, { key: "B", text: "RM 110" }, { key: "C", text: "RM 90" },
        ],
      },
      answer: { key: "A" } },
    // Q22 — Email: why does Amir like Science
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the email below and choose the best answer.\n\nWhy does Amir like Science?",
      content: {
        passage:
          "To: priya@gmail.com    Date: 10th March 2025\nSubject: My New School!\n\nHi Priya,\nHow are you? I want to tell you about my new school. I started here three weeks ago. The school is much bigger than my old school! There is a science lab, a music room and a large sports hall. We have got a really good football team — we won the district competition last month. I am in the team too!\nI am studying eight subjects this year: English, Maths, Science, History, Art, Geography, PE and Music. My favourite is Science because our teacher, Mr Lim, always does really interesting experiments. I am concentrating hard and taking notes in every lesson.\nNext month, we are going to visit a science museum in KL. I am so excited!\nWrite soon!  Amir",
        options: [
          { key: "A", text: "Because the science lab is very big." },
          { key: "B", text: "Because Mr Lim does interesting experiments." },
          { key: "C", text: "Because it is the easiest subject." },
        ],
      },
      answer: { key: "B" } },
    // Q23 — Email: concentrating meaning
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the email below and choose the best answer.\n\nWhat is the meaning of \"concentrating\" in the email?",
      content: {
        passage:
          "My favourite is Science because our teacher, Mr Lim, always does really interesting experiments. I am concentrating hard and taking notes in every lesson.",
        options: [
          { key: "A", text: "Talking a lot in class." },
          { key: "B", text: "Listening carefully and paying attention." },
          { key: "C", text: "Running around the classroom." },
        ],
      },
      answer: { key: "B" } },
    // Q24 — Email: TRUE
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the email below and choose the best answer.\n\nWhich of the following is TRUE about Amir's new school?",
      content: {
        passage:
          "The school is much bigger than my old school. We have got a really good football team — we won the district competition last month. I am in the team too! Next month, we are going to visit a science museum in KL.",
        options: [
          { key: "A", text: "The school is smaller than his old school." },
          { key: "B", text: "Amir's football team won a competition last month." },
          { key: "C", text: "Amir is going to visit a museum next week." },
        ],
      },
      answer: { key: "B" } },
    // Q25 — Writing email to Maya about favourite hobby (30-50 words)
    { type: "SHORT", dimension: "WRITING", score: 10,
      prompt: "Your pen pal, Maya, has asked you about your favourite hobby. Write an email to tell her about it.\nInclude:\n  • describe your favourite hobby — when/how often you do it\n  • explain why you like it\n  • your future plans for this hobby\nWrite about 30–50 words.",
      content: {
        minWords: 30,
        maxWords: 50,
        template: "Hi Maya,\n\nMy favourite hobby is _______. I do it _______ a week. I like it because _______.\n\nIn the future, I want to _______.\n\nWrite soon!\n_______",
      },
      answer: { rubric: "Greeting · hobby + frequency · reason · future plan · closing" } },
  ];
}

// ─────────────────────────── STANDARD 6 ─────────────────────────────────
// Source: Standard 6 Assessment Input/6年级_Placement_Test.docx
// Academy Stars Year 6 · Welcome – Unit 10. Same structure as S4/S5.
function standard6Questions(): QData[] {
  return [
    // Q1 — Kayaking (picture in DOCX) — image replaces the floating topic icon
    { type: "SINGLE", dimension: "VOCAB", score: 1,
      prompt: "Read the sentence and choose the correct word.\n\nA person sits in a small boat and uses a long flat tool to move through water on a river or lake. This is a popular outdoor adventure activity. What is it?",
      mediaUrl: "/questions/standard-6/kayaking.jpg",
      content: { options: [
        { key: "A", text: "skiing" }, { key: "B", text: "kayaking" }, { key: "C", text: "cycling" },
      ], topicLabel: "Adventure"},
      answer: { key: "B" } },
    // Q2 — Cotton (picture in DOCX)
    { type: "SINGLE", dimension: "VOCAB", score: 1,
      prompt: "Read the sentence and choose the correct word.\n\nFarmers collect this plant from fields after it grows. It is used to make a soft, light material for clothes. Most T-shirts in the world are made from this.",
      mediaUrl: "/questions/standard-6/cotton-plant-field.jpg",
      content: { options: [
        { key: "A", text: "denim" }, { key: "B", text: "wool" }, { key: "C", text: "cotton" },
      ], topicLabel: "Materials"},
      answer: { key: "C" } },
    // Q3-5 — Matching
    { type: "MATCHING", dimension: "VOCAB", score: 3,
      prompt: "Match each word to its correct meaning.",
      content: {
        left: [
          { text: "Rewarding",     icon: "🌟" },
          { text: "Scenery",       icon: "🏞" },
          { text: "Old-fashioned", icon: "📜" },
        ],
        right: [
          "something that gives you a feeling of satisfaction",
          "not modern; from a time long ago",
          "the natural features of the countryside; landscape",
        ],
      },
      answer: { pairs: { "0": 0, "1": 2, "2": 1 } } },
    // Q6 — Emergency
    { type: "FILL", dimension: "VOCAB", score: 1,
      prompt: "Read the description below. Write the missing word — the first letter is given.\n\nA sudden, serious, and dangerous situation that needs immediate action.\n\nHint:  e _ _ _ _ _ _ _ _",
      content: { caseSensitive: false , topicIcon: "🚨", topicLabel: "Vocabulary"},
      answer: { accepted: ["emergency"] } },
    // Q7 — Gardener
    { type: "FILL", dimension: "VOCAB", score: 1,
      prompt: "Read the description below. Write the missing word — the first letter is given.\n\nA person who looks after gardens and grows plants for a job.\n\nHint:  g _ _ _ _ _ _ _",
      content: { caseSensitive: false , topicIcon: "🌷", topicLabel: "People"},
      answer: { accepted: ["gardener"] } },
    // Q8 — Phonics: rehearse (audio + picture)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "Listen to the audio. Which of the following is the CORRECT spelling?",
      mediaUrl: "/audio/standard-6/rehearse.mp3",
      content: { maxPlays: 3, imageUrl: "/questions/standard-6/rehearse.jpg", options: [
        { key: "A", text: "reherse" }, { key: "B", text: "reheorse" }, { key: "C", text: "rehearse" },
      ]},
      answer: { key: "C" } },
    // Q9 — Phonics: ambulance (TTS fallback + picture)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "Listen to the audio. Which of the following is the CORRECT spelling?",
      content: { maxPlays: 3, speakText: "ambulance", lang: "en-US", imageUrl: "/questions/standard-6/ambulance.jpg", options: [
        { key: "A", text: "ambulence" }, { key: "B", text: "ambulance" }, { key: "C", text: "ambuelance" },
      ]},
      answer: { key: "B" } },
    // Q10 — Phonics fill: skyscraper (audio + picture)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "Listen to the audio. The picture shows a very tall building in a city. Which letters complete the word?\n\ns k _ s c r _ p _ r",
      mediaUrl: "/audio/standard-6/skyscraper.mp3",
      content: { maxPlays: 3, imageUrl: "/questions/standard-6/skyscraper.jpg", options: [
        { key: "A", text: "y / a / e" }, { key: "B", text: "i / a / e" }, { key: "C", text: "y / e / a" },
      ]},
      answer: { key: "A" } },
    // Q11 — Phonics fill: polluted (audio + picture)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "Listen to the audio. The picture shows a city with dirty, smoky air. Which letters complete the word?\n\np _ l l _ t _ d",
      mediaUrl: "/audio/standard-6/polluted.mp3",
      content: { maxPlays: 3, imageUrl: "/questions/standard-6/polluted.jpg", options: [
        { key: "A", text: "o / u / e" }, { key: "B", text: "o / o / e" }, { key: "C", text: "u / o / e" },
      ]},
      answer: { key: "A" } },
    // Q12 — Electricity (no audio, picture aids context)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "Which of the following is the CORRECT spelling?\n(This is the power that runs lights, cookers and other appliances — Unit 1.)",
      mediaUrl: "/questions/standard-6/electricity.jpg",
      content: { options: [
        { key: "A", text: "electricety" }, { key: "B", text: "electrisity" }, { key: "C", text: "electricity" },
      ], topicLabel: "Energy"},
      answer: { key: "C" } },
    // Q13 — Grammar: past continuous
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "Choose the correct answer.\n\nShe ________ for a concert when the electricity went off.",
      content: { options: [
        { key: "A", text: "was rehearsing" }, { key: "B", text: "rehearsed" }, { key: "C", text: "is rehearsing" },
      ], topicIcon: "🎵", topicLabel: "Music"},
      answer: { key: "A" } },
    // Q14 — Grammar: used to
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "Choose the correct answer.\n\nPeople ________ travel by horse and carriage before cars were invented.",
      content: { options: [
        { key: "A", text: "are using to" }, { key: "B", text: "use to" }, { key: "C", text: "used to" },
      ], topicIcon: "🐎", topicLabel: "History"},
      answer: { key: "C" } },
    // Q15 — Grammar: present perfect
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "Choose the correct answer.\n\nShe ________ a lion in the wild, but she has seen one at the zoo.",
      content: { options: [
        { key: "A", text: "has never seen" }, { key: "B", text: "never saw" }, { key: "C", text: "never seen" },
      ], topicIcon: "🦁", topicLabel: "Animals"},
      answer: { key: "A" } },
    // Q16-18 — Grammar in context cloze (How Jeans Are Made — passive voice)
    { type: "READING", dimension: "GRAMMAR", score: 3,
      prompt: "Read the passage. Choose the correct word for each blank.",
      content: {
        passage:
          "How Jeans Are Made\n\nJeans (16) ______ from a material called denim. First, cotton is harvested from farms and (17) ______ to a factory. There, it is spun into yarn and then dyed with indigo dye to give it a dark blue colour. After that, the material (18) ______ into jeans and packed into boxes to be sent to shops all around the world.",
        subs: [
          { stem: "(16) Jeans ______ from a material called denim.", options: [
            { key: "A", text: "make" }, { key: "B", text: "are made" }, { key: "C", text: "is making" },
          ]},
          { stem: "(17) Cotton is harvested from farms and ______ to a factory.", options: [
            { key: "A", text: "transport" }, { key: "B", text: "transporting" }, { key: "C", text: "transported" },
          ]},
          { stem: "(18) The material ______ into jeans and packed into boxes.", options: [
            { key: "A", text: "cut" }, { key: "B", text: "is cut" }, { key: "C", text: "are cutting" },
          ]},
        ],
      },
      answer: { keys: ["B", "C", "B"] } },
    // Q19 — Reading dialogue (Dr Chan / Dr Lim)
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the text carefully and choose the correct answer.\n\nWhen did Dr Lim start working at the clinic?",
      content: {
        passage:
          "Dr Chan: How long have you been a dentist, Dr Lim?\nDr Lim: I've been a dentist for twenty years. I graduated from university in 2004.\nDr Chan: Have you always worked here?\nDr Lim: No. I've been at this clinic since 2015. Before that, I worked at a hospital.",
        options: [
          { key: "A", text: "In 2004." }, { key: "B", text: "In 2015." }, { key: "C", text: "Twenty years ago." },
        ],
      },
      answer: { key: "B" } },
    // Q20 — Green Transport notice (TRUE)
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the text carefully and choose the correct answer.\n\nAccording to the notice, which statement is TRUE?",
      content: {
        passage:
          "SCHOOL GREEN TRANSPORT CHALLENGE\nWalk or cycle to school this week!\n  • Walking is just as good for you as cycling.\n  • Cycling is faster than walking.\n  • Both are better for the environment than travelling by car.\n  • The air near our school is not clean enough. Let's help!",
        options: [
          { key: "A", text: "Cycling is not as healthy as walking." },
          { key: "B", text: "Walking and cycling are equally good for your health." },
          { key: "C", text: "Travelling by car is better for the environment than cycling." },
        ],
      },
      answer: { key: "B" } },
    // Q21 — Museum total (2 students + special exhibit)
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the text carefully and choose the correct answer.\n\nTwo students with ID cards visit the museum and both enter the special exhibit. What is the total price?",
      content: {
        passage:
          "NATIONAL SCIENCE MUSEUM\nOpening hours: 9:00 a.m. – 5:00 p.m. (Tuesday – Sunday)\nEntry:\n  Adults — RM 25\n  Children (under 12) — RM 15\n  Students (with ID) — RM 18\nSpecial exhibit 'How Things Are Made': additional RM 5 per person",
        options: [
          { key: "A", text: "RM 36" }, { key: "B", text: "RM 46" }, { key: "C", text: "RM 50" },
        ],
      },
      answer: { key: "B" } },
    // Q22 — Email Fraser's Hill: breathtaking
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the email below and choose the best answer.\n\nWhat does the word \"breathtaking\" suggest about the scenery?",
      content: {
        passage:
          "To: emma@gmail.com    Date: 15th May 2025\nSubject: My Adventure Trip!\n\nHi Emma,\nI'm writing to tell you about the most amazing trip I've ever had! Last week, my family went to Fraser's Hill. I've never been there before. We went kayaking on the river on the first day. The scenery was breathtaking — the landscape was so beautiful and we saw lots of wildlife too. My mum has never tried kayaking, but she loved it! My dad said it was just as exciting as the hiking we did last year.\nOn the second day, we went on a sunrise walk. We were walking through the forest when it suddenly started to rain. We were completely wet by the time we got back! If we go again, I'll bring a waterproof jacket.\nI think you should visit Fraser's Hill someday — you might love it too!\nYour friend,  Amir",
        options: [
          { key: "A", text: "It was dangerous and scary." },
          { key: "B", text: "It was so beautiful it was almost impossible to describe." },
          { key: "C", text: "It was boring and not worth seeing." },
        ],
      },
      answer: { key: "B" } },
    // Q23 — Email Fraser's Hill: what happened during walk
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the email below and choose the best answer.\n\nWhat happened while Amir's family was walking through the forest?",
      content: {
        passage:
          "On the second day, we went on a sunrise walk. We were walking through the forest when it suddenly started to rain. We were completely wet by the time we got back!",
        options: [
          { key: "A", text: "They saw lots of wildlife." },
          { key: "B", text: "They got lost and couldn't find the way back." },
          { key: "C", text: "It suddenly started to rain." },
        ],
      },
      answer: { key: "C" } },
    // Q24 — Email Fraser's Hill: TRUE
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the email below and choose the best answer.\n\nWhich of the following is TRUE about Amir's trip?",
      content: {
        passage:
          "My mum has never tried kayaking, but she loved it! My dad said it was just as exciting as the hiking we did last year. If we go again, I'll bring a waterproof jacket.",
        options: [
          { key: "A", text: "His mum has been kayaking many times before." },
          { key: "B", text: "His dad thought kayaking was less exciting than hiking." },
          { key: "C", text: "Amir plans to bring a waterproof jacket if he visits again." },
        ],
      },
      answer: { key: "C" } },
    // Q25 — Writing: adventure email (uses 'If I…, I'll…')
    { type: "SHORT", dimension: "WRITING", score: 10,
      prompt: "Your pen pal, Sam, wants to know about an adventure activity you have done — or would like to do. Write an email to tell Sam about it.\nInclude:\n  • the activity and when/where you did it (or would like to do it)\n  • what happened, or what you think it would be like\n  • what you would do differently next time (use 'If I…, I'll…')\nWrite about 30–50 words.",
      content: {
        minWords: 30,
        maxWords: 50,
        template: "Hi Sam,\n\nLast year, I _______ at _______. It was _______ because _______.\n\nIf I go again, I'll _______.\n\nWrite soon!\n_______",
      },
      answer: { rubric: "Greeting · activity + when/where · what happened · 'If I…, I'll…' · closing" } },
  ];
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
