import { existsSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import {
  bahasaMelayuStandard1Questions,
  bahasaMelayuStandard2Questions,
  bahasaMelayuStandard3Questions,
} from "../prisma/banks-bm";
import {
  bahasaMelayuStandard4Questions,
  bahasaMelayuStandard5Questions,
  bahasaMelayuStandard6Questions,
} from "../prisma/banks-bm-s4-6";
import type { QData } from "../prisma/banks-s4-s6";

type Bank = { standard: number; questions: QData[] };

const banks: Bank[] = [
  bahasaMelayuStandard1Questions,
  bahasaMelayuStandard2Questions,
  bahasaMelayuStandard3Questions,
  bahasaMelayuStandard4Questions,
  bahasaMelayuStandard5Questions,
  bahasaMelayuStandard6Questions,
].map((bank, index) => ({ standard: index + 1, questions: bank() }));

// These cards test abstract word relationships where a picture would either
// reveal the answer or introduce an unintended interpretation. Every other BM
// card is expected to have a contextual visual.
const intentionalTextOnly = new Set([
  "1:5",
  "2:5", "2:6", "2:7", "2:8", "2:9",
  "3:7", "3:17", "3:19",
  "4:7",
  "5:6",
  "6:9",
]);

const errors: string[] = [];
let visualCards = 0;

function localAsset(url: string, label: string) {
  if (!url.startsWith("/")) {
    errors.push(`${label}: visual URL must be local and root-relative (${url})`);
    return;
  }
  const path = join(process.cwd(), "public", ...url.split("/").filter(Boolean));
  if (!existsSync(path)) {
    errors.push(`${label}: missing asset ${url}`);
    return;
  }
  if (!statSync(path).isFile()) errors.push(`${label}: asset is not a file (${url})`);
  if (![".jpg", ".jpeg", ".png", ".webp", ".svg"].includes(extname(path).toLowerCase())) {
    errors.push(`${label}: unsupported image format (${url})`);
  }
}

for (const { standard, questions } of banks) {
  questions.forEach((question, index) => {
    const card = index + 1;
    const label = `S${standard} card ${card}`;
    const content = question.content ?? {};
    const imageUrl = content.imageUrl as string | undefined;
    const passageImage = content.passageImage as string | undefined;
    const imageAlt = content.imageAlt as string | undefined;
    const passageImageAlt = content.passageImageAlt as string | undefined;
    const hasVisual = Boolean(imageUrl || passageImage || question.mediaUrl?.match(/\.(?:jpe?g|png|webp|svg)$/i));

    if (!intentionalTextOnly.has(`${standard}:${card}`) && !hasVisual) {
      errors.push(`${label}: expected a supporting visual`);
    }
    if (intentionalTextOnly.has(`${standard}:${card}`) && hasVisual) {
      errors.push(`${label}: abstract card should remain text-only to avoid answer clues`);
    }
    if (hasVisual) visualCards += 1;

    if (imageUrl) {
      localAsset(imageUrl, label);
      if (!imageAlt?.trim()) errors.push(`${label}: imageUrl requires meaningful imageAlt`);
    }
    if (passageImage) {
      localAsset(passageImage, label);
      if (!passageImageAlt?.trim()) errors.push(`${label}: passageImage requires meaningful passageImageAlt`);
    }
    if (question.type === "LISTENING" && !imageUrl) {
      errors.push(`${label}: every listening card must include a contextual image`);
    }
    if (question.type === "READING" && !passageImage) {
      errors.push(`${label}: every reading passage must include a contextual passage image`);
    }
    if (question.type === "SHORT" && question.dimension === "WRITING" && !imageUrl) {
      errors.push(`${label}: every writing card must include a contextual image`);
    }
  });
}

const totalCards = banks.reduce((sum, bank) => sum + bank.questions.length, 0);
const expectedVisualCards = totalCards - intentionalTextOnly.size;

if (visualCards !== expectedVisualCards) {
  errors.push(`visual-card total mismatch: expected ${expectedVisualCards}, found ${visualCards}`);
}

if (errors.length) {
  console.error(`Bahasa Melayu visual audit failed (${errors.length} issue${errors.length === 1 ? "" : "s"}):`);
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

for (const bank of banks) {
  const visualCount = bank.questions.filter((question) => {
    const content = question.content ?? {};
    return Boolean(content.imageUrl || content.passageImage || question.mediaUrl?.match(/\.(?:jpe?g|png|webp|svg)$/i));
  }).length;
  console.log(`S${bank.standard}: ${visualCount}/${bank.questions.length} cards have relevant visuals`);
}
console.log(`\n✓ ${visualCards}/${totalCards} BM cards carry relevant visuals; ${intentionalTextOnly.size} abstract cards are intentionally text-only.`);
