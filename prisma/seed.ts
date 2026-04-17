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

  // ─── A sample English test exercising all 9 built-in question types ──────
  await prisma.questionLink.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.test.deleteMany({});

  const test = await prisma.test.create({
    data: {
      title: "English Proficiency – Teen Placement",
      subject: "English",
      duration: 20, // minutes
      passingScore: 60,
      scope: [
        "This test screens your overall English proficiency across four areas:",
        "  • Vocabulary  • Grammar  • Reading  • Listening",
        "",
        "Total: ~12 questions. Most are quick choices; a few are short writing.",
        "Aim to answer every question — there is no penalty for guessing.",
      ].join("\n"),
    },
  });

  const Q = (data: any) => ({
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
    // 1. SINGLE — vocab synonym
    prisma.question.create({
      data: Q({
        type: "SINGLE", dimension: "VOCAB", level: 2, score: 4,
        prompt: "Which word means almost the same as ‘happy’?",
        content: { options: [
          { key: "A", text: "Sad" },
          { key: "B", text: "Joyful" },
          { key: "C", text: "Angry" },
          { key: "D", text: "Tired" },
        ]},
        answer: { key: "B" },
      }),
    }),
    // 2. MULTI — pick all verbs
    prisma.question.create({
      data: Q({
        type: "MULTI", dimension: "GRAMMAR", level: 2, score: 4,
        prompt: "Pick ALL the verbs from the list below.",
        content: {
          options: [
            { key: "A", text: "Quickly" },
            { key: "B", text: "Run" },
            { key: "C", text: "Beautiful" },
            { key: "D", text: "Eat" },
            { key: "E", text: "Garden" },
          ],
          partialCredit: true,
        },
        answer: { keys: ["B", "D"] },
      }),
    }),
    // 3. TRUE_FALSE — grammar judgement
    prisma.question.create({
      data: Q({
        type: "TRUE_FALSE", dimension: "GRAMMAR", level: 2, score: 3,
        prompt: "True or False: ‘She don’t like coffee’ is grammatically correct.",
        content: {},
        answer: { value: false },
      }),
    }),
    // 4. FILL — short answer
    prisma.question.create({
      data: Q({
        type: "FILL", dimension: "VOCAB", level: 2, score: 4,
        prompt: "Fill in the blank: ‘The capital of France is ____.’",
        content: { caseSensitive: false },
        answer: { accepted: ["Paris"] },
      }),
    }),
    // 5. CLOZE — passage with multiple blanks
    prisma.question.create({
      data: Q({
        type: "CLOZE", dimension: "GRAMMAR", level: 3, score: 6,
        prompt: "Complete the paragraph by filling each blank.",
        content: {
          passage: "Every morning, Tom ___ (go) to school by bus. The bus ___ (arrive) at 7:30. After school, he ___ (play) football with his friends.",
          blanks: 3,
          caseSensitive: false,
        },
        answer: { blanks: [["goes"], ["arrives"], ["plays"]] },
      }),
    }),
    // 6. MATCHING — words to definitions
    prisma.question.create({
      data: Q({
        type: "MATCHING", dimension: "VOCAB", level: 3, score: 6,
        prompt: "Match each word with its meaning.",
        content: {
          left: ["Library", "Hospital", "Bakery", "Stadium"],
          right: ["Place to watch sport", "Place to read books", "Place to buy bread", "Place for medical care"],
        },
        // left[0]=Library → right[1]; Hospital → 3; Bakery → 2; Stadium → 0
        answer: { pairs: { "0": 1, "1": 3, "2": 2, "3": 0 } },
      }),
    }),
    // 7. ORDERING — story sequencing
    prisma.question.create({
      data: Q({
        type: "ORDERING", dimension: "READING", level: 3, score: 5,
        prompt: "Arrange these sentences to form a logical story.",
        content: {
          items: [
            "She woke up early and got dressed.",
            "First, she brushed her teeth.",
            "Then she ate breakfast.",
            "Finally, she walked to school.",
          ],
        },
        // canonical order: 0, 1, 2, 3
        answer: { order: [0, 1, 2, 3] },
      }),
    }),
    // 8. LISTENING — audio + single (mediaUrl is empty here; replace with real audio)
    prisma.question.create({
      data: Q({
        type: "LISTENING", dimension: "LISTENING", level: 2, score: 4,
        prompt: "Listen to the audio and choose the speaker’s favourite hobby. (Demo question — audio file not yet provided.)",
        mediaUrl: "", // TODO: upload an MP3 to /public/audio/ and reference it here
        content: {
          options: [
            { key: "A", text: "Reading" },
            { key: "B", text: "Painting" },
            { key: "C", text: "Cooking" },
            { key: "D", text: "Cycling" },
          ],
          maxPlays: 2,
        },
        answer: { key: "B" },
      }),
    }),
    // 9. READING — passage with sub-questions
    prisma.question.create({
      data: Q({
        type: "READING", dimension: "READING", level: 3, score: 9,
        prompt: "Read the passage and answer the three questions.",
        content: {
          passage: [
            "Mei had always wanted a dog. For her tenth birthday, her parents finally agreed.",
            "On Saturday, the family drove to a small shelter just outside the city.",
            "There Mei met a quiet brown puppy with one white paw, and knew immediately that he would be hers.",
            "She named him Coco, after her favourite chocolate biscuit.",
          ].join(" "),
          subs: [
            {
              stem: "How old was Mei when she got the dog?",
              options: [
                { key: "A", text: "8" }, { key: "B", text: "9" },
                { key: "C", text: "10" }, { key: "D", text: "12" },
              ],
            },
            {
              stem: "Where did the family go to find the puppy?",
              options: [
                { key: "A", text: "A pet shop in the city" },
                { key: "B", text: "A small shelter outside the city" },
                { key: "C", text: "A friend’s farm" },
                { key: "D", text: "Online" },
              ],
            },
            {
              stem: "Why did Mei choose the name Coco?",
              options: [
                { key: "A", text: "It was the puppy’s breed" },
                { key: "B", text: "After her favourite biscuit" },
                { key: "C", text: "It was her grandmother’s name" },
                { key: "D", text: "It was the shelter’s suggestion" },
              ],
            },
          ],
        },
        answer: { keys: ["C", "B", "B"] },
      }),
    }),
  ]);

  // Link in order
  await Promise.all(
    questions.map((q, i) =>
      prisma.questionLink.create({ data: { testId: test.id, questionId: q.id, order: i + 1 } })
    )
  );

  // ─── A sample passkey for quick testing ──────────────────────────────────
  const sample = await prisma.passkey.upsert({
    where: { code: "DEMO-2026-START" },
    create: {
      code: "DEMO-2026-START",
      testId: test.id,
      tutorId: tutor.id,
      maxUses: 99,
      note: "Demo passkey created by seed",
    },
    update: { active: true, maxUses: 99 },
  });

  console.log("✅ Seed complete.");
  console.log("");
  console.log("   Admin login : admin@example.com / admin123");
  console.log("   Tutor login : tutor@example.com / tutor123");
  console.log("   Demo passkey: DEMO-2026-START");
  console.log("   → Open http://localhost:3000/test and paste the passkey.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
