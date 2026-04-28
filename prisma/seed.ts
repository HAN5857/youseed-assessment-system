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

  // ─── ENGLISH STANDARD 4–6 (placeholders, inactive) ────────────────────
  for (const lvl of ["standard-4", "standard-5", "standard-6"]) {
    await upsertTest({
      subject: "english",
      level: lvl,
      title: `English ${lvl.replace("standard-", "Standard ")} — Coming soon`,
      duration: 20,
      passingScore: 60,
      scope: "This level is coming soon. Please check back later.",
      active: false,
    });
  }

  // ─── Demo passkeys (one per active level) ─────────────────────────────
  const demoKeys: { code: string; testId: string; note: string }[] = [
    { code: "ENG-S1-DEMO", testId: s1.id, note: "Demo passkey — English Standard 1" },
    { code: "ENG-S2-DEMO", testId: s2.id, note: "Demo passkey — English Standard 2" },
    { code: "ENG-S3-DEMO", testId: s3.id, note: "Demo passkey — English Standard 3" },
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
    { type: "MATCHING", dimension: "GRAMMAR", score: 6,
      prompt: "Match each sentence to the correct verb form.",
      content: {
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
    { type: "ORDERING", dimension: "WRITING", score: 6,
      prompt: "Rearrange ALL the words below to make one correct sentence.",
      content: { items: ["got", "a", "have", "I", "pet", "dog"] },
      // Correct order: I(3) have(2) got(0) a(1) pet(4) dog(5)
      answer: { order: [3, 2, 0, 1, 4, 5] },
      explanation: "I have got a pet dog." },
    // Q20 — rearrange: She has got long black hair
    { type: "ORDERING", dimension: "WRITING", score: 6,
      prompt: "Rearrange ALL the words below to make one correct sentence.",
      content: { items: ["long", "has", "black", "got", "She", "hair"] },
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

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
