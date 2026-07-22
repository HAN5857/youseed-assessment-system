// Question banks for Standards 4–6 — extracted so they can be reused by:
//   • seed.ts                 (full dev/prod seed including S1–S3)
//   • seed-prod-s4-s6.ts      (non-destructive S4–S6 only prod seed)
// Pure data + JSON helpers — no Prisma client, no side effects on import.

export type QData = {
  type: string; dimension: string; level?: number; score?: number;
  prompt: string; mediaUrl?: string | null;
  content?: any; answer?: any; explanation?: string | null;
};

export const Q = (data: QData) => ({
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

export const SCOPE_TEMPLATE_UPPER = (year: string, units: string) => [
  `${year} English placement check — 9 parts:`,
  "  • Vocabulary & Phonics  (Q1–12, ~35%)",
  "  • Grammar & Comprehension  (Q13–24, ~35%)",
  "  • Writing  (Q25, 30%)",
  "",
  `Curriculum reference: ${units}`,
  "Take your time — there is no penalty for guessing. Read every question carefully.",
].join("\n");

// ──────────────────────────────────────────────────────────────────────────
// Standards 4 / 5 / 6 question banks — sourced from the placement test
// DOCXs in "Standard {N} Assessment Input". Each function returns 21 QData
// entries (max combined score 34 marks).
// ──────────────────────────────────────────────────────────────────────────

export function standard4Questions(): QData[] {
  return [
    // Q1 — Deepavali (picture choice, descriptive — no image needed)
    { type: "SINGLE", dimension: "VOCAB", score: 1,
      prompt: "Read the sentence and choose the correct word.\n\nPeople light oil lamps, draw rangoli patterns and wear colourful traditional clothes during this celebration. What is it?",
      content: { options: [
        { key: "A", text: "Christmas" }, { key: "B", text: "Deepavali" }, { key: "C", text: "Chinese New Year" },
      ], topicIcon: "🪔", topicLabel: "Festival"},
      answer: { key: "B" } },
    // Q2 — Cheetah (picture choice, image)
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
      content: { caseSensitive: false, topicIcon: "👨‍🍳", topicLabel: "People" },
      answer: { accepted: ["chef"] } },
    // Q7 — Homework (NEW — replaces the old "stormy" question)
    { type: "FILL", dimension: "VOCAB", score: 1,
      prompt: "Read the description below. Write the missing word — the first letter is given.\n\nWork that your teacher gives you to do at home.\n\nHint:  H _ _ _ _ _ _ _",
      content: { caseSensitive: false, topicIcon: "📚", topicLabel: "School" },
      answer: { accepted: ["homework"] } },
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
    // Q11 — Phonics fill: cheetah (audio + picture)
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
      ], topicLabel: "Transport" },
      answer: { key: "C" } },
    // Q13 — Grammar: possessive pronoun (NEW — pen pal Kenji intro)
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "Choose the correct answer.\n\nThis is my new friend. ________ name is Kenji.",
      content: { options: [
        { key: "A", text: "He" }, { key: "B", text: "Him" }, { key: "C", text: "His" },
      ], topicIcon: "🧒", topicLabel: "Friends" },
      answer: { key: "C" } },
    // Q14 — Grammar: be verb, 2nd person plural (NEW)
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "Choose the correct answer.\n\nWhere ________ you from?",
      content: { options: [
        { key: "A", text: "am" }, { key: "B", text: "are" }, { key: "C", text: "is" },
      ], topicIcon: "🌍", topicLabel: "Nationality" },
      answer: { key: "B" } },
    // Q15 — Grammar: auxiliary Do (NEW)
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "Choose the correct answer.\n\n________ you have a pen pal in another country?",
      content: { options: [
        { key: "A", text: "Is" }, { key: "B", text: "Does" }, { key: "C", text: "Do" },
      ], topicIcon: "✉️", topicLabel: "Pen pal" },
      answer: { key: "C" } },
    // Q16 — Grammar: past tense (image: travel)
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "Choose the correct answer.\n\nLast Saturday, Amir and his family ________ to Penang by bus.",
      mediaUrl: "/questions/standard-4/travel.jpg",
      content: { options: [
        { key: "A", text: "travel" }, { key: "B", text: "travels" }, { key: "C", text: "travelled" },
      ], topicLabel: "Travel" },
      answer: { key: "C" } },
    // Q17 — Grammar: future (image: visit grandparents)
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "Choose the correct answer.\n\nDuring the next school holidays, we ________ visit our grandparents in Ipoh.",
      mediaUrl: "/questions/standard-4/visit-grandparents.jpg",
      content: { options: [
        { key: "A", text: "were" }, { key: "B", text: "are going to" }, { key: "C", text: "did" },
      ], topicLabel: "Family" },
      answer: { key: "B" } },
    // Q18 — Grammar: superlative (image: cheetah running)
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "Choose the correct answer.\n\nThe cheetah is the ________ land animal in the world. It can run at 120 km/h!",
      mediaUrl: "/questions/standard-4/cheetah-15.jpg",
      content: { options: [
        { key: "A", text: "fast" }, { key: "B", text: "faster" }, { key: "C", text: "fastest" },
      ], topicLabel: "Animals" },
      answer: { key: "C" } },
    // Q19 — Reading: Melaka History Museum notice — which day closed?
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the text carefully and choose the correct answer.\n\nOn which day is the museum closed?",
      content: {
        passage:
          "MELAKA HISTORY MUSEUM\nOpen:    Tuesday – Sunday, 9.00 a.m. – 5.00 p.m.\nClosed:  Monday\nTickets: Adults RM5    Children RM2\nDo not touch the objects.\nPhotographs are not allowed inside.",
        options: [
          { key: "A", text: "Sunday" }, { key: "B", text: "Monday" }, { key: "C", text: "Tuesday" },
        ],
      },
      answer: { key: "B" } },
    // Q20 — Reading: Melaka History Museum notice — what is NOT allowed?
    { type: "SINGLE", dimension: "READING", score: 1,
      prompt: "Read the text carefully and choose the correct answer.\n\nWhat is NOT allowed inside the museum?",
      content: {
        passage:
          "MELAKA HISTORY MUSEUM\nOpen:    Tuesday – Sunday, 9.00 a.m. – 5.00 p.m.\nClosed:  Monday\nTickets: Adults RM5    Children RM2\nDo not touch the objects.\nPhotographs are not allowed inside.",
        options: [
          { key: "A", text: "Eating" }, { key: "B", text: "Taking photographs" }, { key: "C", text: "Talking" },
        ],
      },
      answer: { key: "B" } },
    // Q21 — Reading (short answer): who is the new pupil?
    { type: "FILL", dimension: "READING", score: 1,
      prompt: "Read the email below and answer the question.\n\nWho is the new pupil in Aiman's class?",
      content: {
        caseSensitive: false,
        passage:
          "My New Friend\n\nMy name is Aiman. I am ten years old and I live in Melaka, Malaysia. Last month, a new pupil came to my class. His name is Kenji.\n\nKenji is from Japan. He is ten years old too. At first, he was very quiet. He could not speak Malay, and his English was not very good. Nobody talked to him.\n\nOne day, I saw Kenji sitting alone under a tree. He was drawing a mountain with snow on top. \"What is that?\" I asked. \"Mount Fuji,\" he said. \"It is in my country.\"\n\nI sat down next to him. We talked about our countries. I told him about the beaches in Melaka. He told me about the snow in Japan.\n\nNow, Kenji is my best friend. He is teaching me Japanese, and I am teaching him Malay.",
      },
      answer: { accepted: ["kenji", "kenji.", "the new pupil is kenji", "his name is kenji"] } },
    // Q22 — Reading (short answer): what was Kenji drawing?
    { type: "FILL", dimension: "READING", score: 1,
      prompt: "Read the email below and answer the question.\n\nWhat was Kenji drawing?",
      content: {
        caseSensitive: false,
        passage:
          "My New Friend\n\nMy name is Aiman. I am ten years old and I live in Melaka, Malaysia. Last month, a new pupil came to my class. His name is Kenji.\n\nKenji is from Japan. He is ten years old too. At first, he was very quiet. He could not speak Malay, and his English was not very good. Nobody talked to him.\n\nOne day, I saw Kenji sitting alone under a tree. He was drawing a mountain with snow on top. \"What is that?\" I asked. \"Mount Fuji,\" he said. \"It is in my country.\"\n\nI sat down next to him. We talked about our countries. I told him about the beaches in Melaka. He told me about the snow in Japan.\n\nNow, Kenji is my best friend. He is teaching me Japanese, and I am teaching him Malay.",
      },
      answer: { accepted: [
        "mount fuji", "mountain", "a mountain", "a mountain with snow", "a mountain with snow on top",
        "he was drawing a mountain with snow on top", "he was drawing mount fuji",
        "kenji was drawing a mountain with snow on top", "kenji was drawing mount fuji",
      ] } },
    // Q23 — Reading (short answer): what is Kenji teaching Aiman?
    { type: "FILL", dimension: "READING", score: 1,
      prompt: "Read the email below and answer the question.\n\nWhat is Kenji teaching Aiman?",
      content: {
        caseSensitive: false,
        passage:
          "My New Friend\n\nMy name is Aiman. I am ten years old and I live in Melaka, Malaysia. Last month, a new pupil came to my class. His name is Kenji.\n\nKenji is from Japan. He is ten years old too. At first, he was very quiet. He could not speak Malay, and his English was not very good. Nobody talked to him.\n\nOne day, I saw Kenji sitting alone under a tree. He was drawing a mountain with snow on top. \"What is that?\" I asked. \"Mount Fuji,\" he said. \"It is in my country.\"\n\nI sat down next to him. We talked about our countries. I told him about the beaches in Melaka. He told me about the snow in Japan.\n\nNow, Kenji is my best friend. He is teaching me Japanese, and I am teaching him Malay.",
      },
      answer: { accepted: [
        "japanese", "kenji is teaching aiman japanese", "he is teaching aiman japanese",
        "he is teaching him japanese", "japanese.",
      ] } },
    // Q24 — Reading (open opinion + reason, 2 marks): is Aiman a good friend?
    { type: "SHORT", dimension: "READING", score: 2,
      prompt: "Read the email below and answer the question.\n\nDo you think Aiman is a good friend? Give ONE reason.",
      content: {
        minWords: 8,
        maxWords: 40,
        passage:
          "My New Friend\n\nMy name is Aiman. I am ten years old and I live in Melaka, Malaysia. Last month, a new pupil came to my class. His name is Kenji.\n\nKenji is from Japan. He is ten years old too. At first, he was very quiet. He could not speak Malay, and his English was not very good. Nobody talked to him.\n\nOne day, I saw Kenji sitting alone under a tree. He was drawing a mountain with snow on top. \"What is that?\" I asked. \"Mount Fuji,\" he said. \"It is in my country.\"\n\nI sat down next to him. We talked about our countries. I told him about the beaches in Melaka. He told me about the snow in Japan.\n\nNow, Kenji is my best friend. He is teaching me Japanese, and I am teaching him Malay.",
        template: "Yes / No — I think Aiman is a good friend because …",
      },
      answer: { rubric: "1 mark for the opinion (Yes / No) + 1 mark for ONE reason from the passage. Any reasonable answer accepted." } },
    // Q25 — Writing: International Day, 40–50 words, 15 marks
    { type: "SHORT", dimension: "WRITING", score: 15,
      prompt: "A school is holding an International Day. Pupils from different countries are wearing their traditional costumes. They are holding their national flags and sharing food from their countries. Some pupils are teaching their friends how to say \"hello\" in their own language.\n\nYour friend asks you to join the International Day at school. Do you want to join?\n\nGive TWO reasons. Write your answer in 40–50 words in a paragraph.",
      content: {
        minWords: 40,
        maxWords: 50,
        template: "Yes / No, I want / do not want to join the International Day.\n\nFirst, I …\n\nSecond, I …\n\nIt will be a …",
      },
      answer: { rubric: "Opinion (Yes/No) · TWO reasons · 40–50 words · coherent paragraph." } },
  ];
}

// ─────────────────────────── STANDARD 5 ─────────────────────────────────
// Source: Standard 5 Assessment Input/5年级_Placement_Test.docx
// English Plus 1 · Starter Unit – Unit 8. Same structure as S4.
export function standard5Questions(): QData[] {
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
export function standard6Questions(): QData[] {
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
