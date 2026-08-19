"use client";

// ──────────────────────────────────────────────────────────────────────────
// Bahasa Melayu — dedicated pre-assessment briefing.
//
// Its OWN identity, not the shared English chrome: Sang Kancil (the clever
// mouse-deer of Malay folklore) as the guide, a songket-gold + bunga-raya-red
// + tropical-teal palette on a warm batik-cream ground, and fully Malay copy.
// No organisation logo/name is shown — the platform is multi-tenant.
// ──────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { sound } from "@/lib/sounds";
import { SoundToggle } from "@/components/kids/SoundToggle";
import { SangKancil, WauGlyph, BungaRaya } from "./MalayGlyphs";

type Props = {
  leadId: string;
  studentName: string;
  testTitle: string;
  testLevel: string;
  duration: number;
  passingScore: number;
  totalQuestions: number;
  dimensionCounts: [string, number][];
};

// Malay skill names + a friendly mark for the discovery map.
const SKILLS: Record<string, { mark: string; name: string; note: string }> = {
  VOCAB:     { mark: "Aa", name: "Kosa Kata",   note: "Kenali perkataan dan maksudnya" },
  GRAMMAR:   { mark: "„”", name: "Tatabahasa",  note: "Bina ayat yang betul dan kemas" },
  READING:   { mark: "¶",  name: "Pemahaman",   note: "Baca petikan, cari jawapannya" },
  LISTENING: { mark: "♪",  name: "Mendengar",   note: "Dengar audio, pilih yang betul" },
  PHONICS:   { mark: "Bb", name: "Ejaan",       note: "Kenali bunyi dan ejaan perkataan" },
  WRITING:   { mark: "✎",  name: "Penulisan",   note: "Luahkan idea dalam ayat sendiri" },
  SPEAKING:  { mark: "◗",  name: "Lisan",        note: "Sampaikan idea dengan jelas" },
};

const REMINDERS: { mark: string; title: string; line: string }[] = [
  { mark: "1", title: "Ambil masa", line: "Masa hanya panduan. Selepas ia tamat pun kamu boleh terus menjawab." },
  { mark: "2", title: "Cuba dahulu", line: "Tak pasti pun tak mengapa — cubaan yang jujur tetap bernilai." },
  { mark: "3", title: "Boleh semak", line: "Jawapan disimpan sendiri; kamu boleh kembali menyemaknya." },
  { mark: "4", title: "Dengar tenang", line: "Untuk soalan audio, cari tempat yang sunyi dahulu." },
];

export function MalayInstructionsView(props: Props) {
  const reduceMotion = useReducedMotion();
  const firstName = props.studentName.trim().split(/\s+/)[0] || props.studentName;

  return (
    <main className="malay-briefing" lang="ms">
      <div className="fixed right-4 top-4 z-30"><SoundToggle /></div>

      {/* woven songket / batik ambient motifs */}
      <WauGlyph className="malay-wau malay-wau-1" aria-hidden />
      <BungaRaya className="malay-bunga malay-bunga-1" aria-hidden />
      <BungaRaya className="malay-bunga malay-bunga-2" aria-hidden />

      <motion.section
        className="malay-shell"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
      >
        <div className="malay-songket-top" aria-hidden />

        {/* Hero */}
        <div className="malay-hero">
          <div className="malay-hero-copy">
            <span className="malay-kicker"><span className="dot" aria-hidden />Sebelum kita mula</span>
            <h1>{props.testTitle}</h1>
            <p className="malay-greet">Hai {firstName}! <span className="wave" aria-hidden>👋</span></p>
            <p className="malay-intro">Jom teroka bersama Sang Kancil! Tak perlu risau, tak perlu hafal. Baca elok-elok, fikir tenang, dan cuba yang termampu — itu sudah cukup hebat.</p>
          </div>
          <div className="malay-mascot"><SangKancil /></div>
        </div>

        {/* Stats */}
        <div className="malay-stats" aria-label="Maklumat penilaian">
          <div className="malay-stat s-red"><strong>{props.totalQuestions}</strong><span>Soalan</span></div>
          <div className="malay-stat s-teal"><strong>{props.duration}<i>minit</i></strong><span>Masa dicadang</span></div>
          <div className="malay-stat s-gold"><strong>{props.passingScore}%</strong><span>Garis panduan</span></div>
        </div>

        {/* Discovery map */}
        <section className="malay-panel">
          <div className="malay-panel-head">
            <span className="malay-seal" aria-hidden>◆</span>
            <div><small>Sepanjang perjalanan</small><h2>Apa yang kita terokai</h2></div>
          </div>
          <div className="malay-skill-grid">
            {props.dimensionCounts.map(([dim, count], i) => {
              const s = SKILLS[dim] ?? { mark: "•", name: dim, note: "Teroka kemahiran ini" };
              return (
                <motion.article key={dim} className="malay-skill"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : i * 0.05 }}>
                  <span className="malay-skill-mark" aria-hidden>{s.mark}</span>
                  <div><h3>{s.name}</h3><p>{s.note}</p><span className="malay-skill-count">{count} soalan</span></div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* Reminders */}
        <section className="malay-panel">
          <div className="malay-panel-head">
            <span className="malay-seal alt" aria-hidden>✦</span>
            <div><small>Teroka dengan yakin</small><h2>Ingat empat perkara ini</h2></div>
          </div>
          <ol className="malay-reminders">
            {REMINDERS.map((r) => (
              <li key={r.title}><span className="malay-rmark" aria-hidden>{r.mark}</span><div><b>{r.title}</b><span>{r.line}</span></div></li>
            ))}
          </ol>
        </section>

        <footer className="malay-actions">
          <Link href="/test/bahasa-melayu" className="malay-btn ghost">← Nanti dulu</Link>
          <Link href={`/test/attempt/${props.leadId}/exam`} className="malay-btn primary" onClick={() => sound().play("whoosh")}>
            <span>Jom mula bersama Sang Kancil</span><span aria-hidden>🌺</span>
          </Link>
        </footer>
      </motion.section>
    </main>
  );
}
