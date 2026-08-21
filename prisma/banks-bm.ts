// ──────────────────────────────────────────────────────────────────────────
// Bahasa Melayu question banks — Tahun 1–3 (Standards 1–3).
//
// SOURCE OF TRUTH: the six "YouSeed — Penilaian Tahap Penguasaan Bahasa
// Melayu" DOCX papers supplied in "Bahasa Melayu/BM". Every question, option
// and answer here is taken VERBATIM from those papers — nothing is invented.
// Only the ORAL section (Ujian Lisan, teacher-administered, "TIDAK diedarkan
// kepada murid") is excluded, as it is not part of the online written test.
//
// Question-type mapping (reusing the existing plugin system):
//   • Pick-a-word / grammar / choose-in-brackets / correct-sentence  → SINGLE
//   • Padankan perkataan dengan maksud                               → MATCHING
//   • Dengar & pilih ejaan (audio → spelling choice)                 → LISTENING (mediaUrl = mp3)
//   • Susun perkataan menjadi ayat                                   → ORDERING
//   • Petikan + soalan pemahaman / kloz berpilihan                   → READING (passage + subs)
//   • Isi tempat kosong / jawab pendek / karangan                    → SHORT (effort-scored)
//   • Betul / Salah                                                  → SINGLE (Betul / Salah)
//
// Audio lives in public/audio/bahasa-melayu-standard-{1,2,3}/*.mp3.
// Pictured items reference public/questions/bahasa-melayu-standard-*/…svg.
// ──────────────────────────────────────────────────────────────────────────

import { Q, type QData } from "./banks-s4-s6";
export { Q };
export type { QData };

// Scope blurb shown on the instructions page (Test.scope). Malay-first with a
// gentle English support line, mirroring the Mandarin scope helpers.
export const SCOPE_TEMPLATE_BM_LOWER = (tahun: string, unit: string) => [
  `Penilaian Bahasa Melayu ${tahun} — 3 bahagian:`,
  "  • Bahagian A · Ejaan & Kosa Kata  (~50%)",
  "  • Bahagian B · Tatabahasa & Ayat  (~25%)",
  "  • Bahagian C · Membaca & Menulis  (~25%)",
  "",
  `Rujukan kurikulum: ${unit}`,
  "Ambil masa anda — tiada penalti untuk mencuba. Baca setiap soalan dengan teliti.",
  "Take your time — there is no penalty for trying. Read each question carefully.",
].join("\n");

export const SCOPE_TEMPLATE_BM_UPPER = (tahun: string, unit: string) => [
  `Penilaian Bahasa Melayu ${tahun} · Format UASA — 3 bahagian:`,
  "  • Bahagian A · Tatabahasa & Kosa Kata  (~40%)",
  "  • Bahagian B · Pemahaman & Respons Kritis  (~30%)",
  "  • Bahagian C · Penulisan Karangan  (~30%)",
  "",
  `Rujukan kurikulum: ${unit}`,
  "Ambil masa anda — baca setiap petikan dan soalan dengan teliti.",
  "Take your time — read each passage and question carefully.",
].join("\n");

// Small helpers to keep the bank terse + consistent.
const opt = (arr: string[]) => arr.map((text, i) => ({ key: "ABCDEFGH"[i], text }));
const single = (
  dimension: string, prompt: string, choices: string[], answerKey: string,
  score = 1, extra: Record<string, any> = {},
): QData => ({ type: "SINGLE", dimension, score, prompt, content: { options: opt(choices), ...extra }, answer: { key: answerKey } });
const betulSalah = (
  dimension: string, statement: string, betul: boolean, score = 1,
  extra: Record<string, any> = {},
): QData => ({
  type: "SINGLE", dimension, score,
  prompt: statement,
  content: { options: opt(["Betul", "Salah"]), ...extra },
  answer: { key: betul ? "A" : "B" },
});
const listen = (
  dimension: string, prompt: string, mp3: string, spellings: string[], answerKey: string,
  extra: Record<string, any> = {},
): QData => ({
  type: "LISTENING", dimension, score: 1, prompt, mediaUrl: mp3,
  content: { options: opt(spellings), maxPlays: 3, ...extra }, answer: { key: answerKey },
});

// ══════════════════════════════════════════════════════════════════════════
// TAHUN 1  ·  BM KSSR Semakan  ·  SJKC
// ══════════════════════════════════════════════════════════════════════════
export function bahasaMelayuStandard1Questions(): QData[] {
  const IMG = "/questions/bahasa-melayu-standard-1";
  return [
    // ── Bahagian A1 · Lihat Gambar, Pilih Perkataan (Soalan 1–4) ──
    single("VOCAB", "Lihat gambar. Apakah ini?", ["buku", "bola", "basikal", "beg"], "B", 1,
      { imageUrl: `${IMG}/q01-bola.jpg`, imageAlt: "sebiji bola berwarna-warni" }),
    single("VOCAB", "Siapakah ini?", ["doktor", "guru", "polis", "petani"], "B", 1,
      { imageUrl: `${IMG}/q02-guru.jpg`, imageAlt: "seorang guru di dalam kelas" }),
    single("VOCAB", "Apakah warna buah ini?", ["merah", "kuning", "hijau", "oren"], "B", 1,
      { imageUrl: `${IMG}/q03-pisang.jpg`, imageAlt: "sebiji pisang berwarna kuning" }),
    single("VOCAB", "Apakah haiwan ini?", ["kucing", "arnab", "itik", "ayam"], "B", 1,
      { imageUrl: `${IMG}/q04-arnab.jpg`, imageAlt: "seekor arnab putih bertelinga panjang" }),

    // ── Bahagian A2 · Padankan Perkataan dengan Maksud (Soalan 5–8) ──
    { type: "MATCHING", dimension: "VOCAB", score: 4,
      prompt: "Padankan perkataan dengan maksud yang betul.",
      content: {
        left: ["bersih", "gembira", "rajin", "takut"],
        right: [
          "tidak kotor, kemas dan tersusun",
          "suka bekerja, tidak malas",
          "merasa senang dan sukacita",
          "merasa gerun atau cemas",
        ],
      },
      // bersih→A(0), gembira→C(2), rajin→B(1), takut→D(3)
      answer: { pairs: { "0": 0, "1": 2, "2": 1, "3": 3 } } },

    // ── Bahagian A3 · Dengar dan pilih jawapan yang betul (Soalan 9–12) ──
    listen("LISTENING", "Dengar audio, kemudian pilih ejaan yang betul.\n(Petunjuk: anggota badan untuk melihat)", "/audio/bahasa-melayu-standard-1/mata.mp3", ["mata", "mamta", "maitai"], "A", { imageUrl: `${IMG}/audio-mata.jpg`, imageAlt: "mata manusia" }),
    listen("LISTENING", "Dengar audio, kemudian pilih ejaan yang betul.\n(Petunjuk: sejenis warna)", "/audio/bahasa-melayu-standard-1/merah.mp3", ["meira", "merah", "mirah"], "B", { imageUrl: `${IMG}/audio-merah.jpg`, imageAlt: "beberapa objek berwarna merah" }),
    listen("LISTENING", "Dengar audio, kemudian pilih ejaan yang betul.\n(Petunjuk: tempat belajar)", "/audio/bahasa-melayu-standard-1/sekolah.mp3", ["sekolah", "sikola", "sekolih"], "A", { imageUrl: `${IMG}/audio-sekolah.jpg`, imageAlt: "bangunan sekolah rendah" }),
    listen("LISTENING", "Dengar audio, kemudian pilih ejaan yang betul.\n(Petunjuk: tempat tinggal)", "/audio/bahasa-melayu-standard-1/rumah.mp3", ["rimah", "rumah", "remih"], "B", { imageUrl: `${IMG}/audio-rumah.jpg`, imageAlt: "sebuah rumah keluarga" }),

    // ── Bahagian B1 · Pilih Perkataan yang Betul (Soalan 13–18) ──
    single("GRAMMAR", "Bulatkan perkataan yang betul.\n\nIkan itu ______.", ["berenang", "berjalan"], "A", 1, { imageUrl: `${IMG}/grammar-ikan.jpg`, imageAlt: "seekor ikan sedang berenang" }),
    single("GRAMMAR", "Bulatkan perkataan yang betul.\n\nDaun pokok itu berwarna ______.", ["hijau", "lari"], "A", 1, { imageUrl: `${IMG}/grammar-daun.jpg`, imageAlt: "daun pokok yang hijau" }),
    single("GRAMMAR", "Bulatkan perkataan yang betul.\n\nSaya belajar di ______.", ["sekolah", "cantik"], "A", 1, { imageUrl: `${IMG}/grammar-sekolah.jpg`, imageAlt: "seorang murid belajar di dalam kelas" }),
    single("GRAMMAR", "Bulatkan perkataan yang betul.\n\nBunga itu sangat ______.", ["cantik", "berlari"], "A", 1, { imageUrl: `${IMG}/grammar-bunga.jpg`, imageAlt: "sekuntum bunga yang cantik" }),
    single("GRAMMAR", "Bulatkan perkataan yang betul.\n\nAda ______ kucing di atas kerusi.", ["sebuah", "seekor"], "B", 1, { imageUrl: `${IMG}/grammar-kucing.jpg`, imageAlt: "seekor kucing duduk di atas kerusi" }),
    single("GRAMMAR", "Pilih tanda baca yang betul.\n\nSiapakah nama kamu ______", ["!", "?"], "B", 1, { imageUrl: `${IMG}/grammar-kenalan.jpg`, imageAlt: "dua orang murid sedang berkenalan" }),

    // ── Bahagian B2 · Susun Perkataan Menjadi Ayat (Soalan 19) ──
    { type: "ORDERING", dimension: "GRAMMAR", score: 2,
      prompt: "Susun perkataan-perkataan ini menjadi satu ayat yang betul.",
      content: { items: ["ke", "sekolah", "pergi", "Saya", "setiap", "hari"], imageUrl: `${IMG}/audio-sekolah.jpg`, imageAlt: "murid pergi ke sekolah" },
      // Saya(3) pergi(2) ke(0) sekolah(1) setiap(4) hari(5)
      answer: { order: [3, 2, 0, 1, 4, 5] } },
    { type: "ORDERING", dimension: "GRAMMAR", score: 2,
      prompt: "Susun perkataan-perkataan ini menjadi satu ayat yang betul.",
      content: { items: ["Kucing", "itu", "minum", "suka", "susu"], imageUrl: `${IMG}/grammar-kucing.jpg`, imageAlt: "seekor kucing di atas kerusi" },
      // Kucing(0) itu(1) suka(3) minum(2) susu(4)
      answer: { order: [0, 1, 3, 2, 4] } },

    // ── Bahagian B3 · Lengkapkan Ayat (Soalan 20) ──
    { type: "SHORT", dimension: "WRITING", score: 2,
      prompt: "Lengkapkan ayat berikut.\n\nContoh: Saya suka makan durian.\n\nSaya suka makan ______.",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "ms", imageUrl: `${IMG}/q03-pisang.jpg`, imageAlt: "pisang sebagai contoh makanan",
        template: "Tulis satu makanan yang kamu suka. Contoh ayat: “Saya suka makan ______.”" },
      answer: { rubric: "Terima mana-mana makanan yang munasabah dalam ayat lengkap (cth: Saya suka makan nasi lemak.)." } },

    // ── Bahagian C · Membaca (Soalan 21–23) — petikan "Keluarga Saya" ──
    { type: "READING", dimension: "READING", score: 3,
      prompt: "Baca petikan di bawah, kemudian jawab soalan-soalan berikut.",
      content: {
        passage: "Keluarga Saya\n\nNama saya Aiman. Saya mempunyai empat orang ahli keluarga. Ayah saya seorang guru. Ibu saya suka memasak. Abang saya suka bermain bola sepak. Saya sangat sayang akan keluarga saya.",
        passageImage: `${IMG}/reading-keluarga.jpg`, passageImageAlt: "keluarga Aiman yang terdiri daripada empat orang",
        subs: [
          { stem: "Berapakah ahli keluarga Aiman?", options: opt(["Tiga orang", "Empat orang", "Lima orang", "Enam orang"]) },
          { stem: "Apakah pekerjaan ayah Aiman?", options: opt(["Doktor", "Polis", "Guru", "Petani"]) },
          { stem: "Apakah yang ibu Aiman suka buat?", options: opt(["Bermain bola sepak", "Mengajar", "Memasak", "Membaca"]) },
        ],
      },
      answer: { keys: ["B", "C", "C"] } },

    // ── Bahagian C · Menulis Ayat (gambar taman) ──
    { type: "SHORT", dimension: "WRITING", score: 2,
      prompt: "Lihat gambar, tulis 1–2 ayat tentang gambar itu. Gunakan pola ayat yang diberikan.",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "ms",
        imageUrl: `${IMG}/writing-taman.jpg`, imageAlt: "kanak-kanak bermain di taman permainan yang ada buaian dan gelongsor",
        template: "Pola ayat:\n•  Di taman itu ada ______.\n•  Kanak-kanak sedang ______." },
      answer: { rubric: "Contoh: Di taman itu ada buaian, gelongsor dan pokok. Kanak-kanak sedang bermain dengan gembira." } },
  ];
}

// ══════════════════════════════════════════════════════════════════════════
// TAHUN 2  ·  BM KSSR Semakan  ·  SJKC
// ══════════════════════════════════════════════════════════════════════════
export function bahasaMelayuStandard2Questions(): QData[] {
  const IMG = "/questions/bahasa-melayu-standard-2";
  return [
    // ── Bahagian A1 · Pilih ejaan yang betul (gambar) (Soalan 1–4) ──
    single("VOCAB", "Lihat gambar, pilih ejaan yang betul.\n(Gambar: budak menyapu lantai)", ["menyapu", "menyapo", "menyampu"], "A", 1,
      { imageUrl: `${IMG}/q01-menyapu.jpg`, imageAlt: "seorang murid menyapu lantai kelas dengan penyapu" }),
    single("VOCAB", "Lihat gambar, pilih ejaan yang betul.\n(Gambar: kasut sekolah)", ["kasut", "kasot", "kassut"], "A", 1,
      { imageUrl: `${IMG}/q02-kasut.jpg`, imageAlt: "sepasang kasut sekolah hitam bertali" }),
    single("VOCAB", "Lihat gambar, pilih ejaan yang betul.\n(Gambar: suasana perayaan yang meriah)", ["perayan", "perayaan", "peraayaan"], "B", 1,
      { imageUrl: `${IMG}/q03-perayaan.jpg`, imageAlt: "suasana perayaan yang meriah dengan lampu dan ketupat" }),
    single("VOCAB", "Lihat gambar, pilih ejaan yang betul.\n(Gambar: murid menghias kelas)", ["mengias", "menghias", "menghiaas"], "B", 1,
      { imageUrl: `${IMG}/q04-menghias.jpg`, imageAlt: "murid-murid menghias kelas dengan hiasan berwarna-warni" }),

    // ── Bahagian A2 · Padankan Perkataan dengan Maksud (Soalan 5–8) ──
    { type: "MATCHING", dimension: "VOCAB", score: 4,
      prompt: "Padankan perkataan dengan maksud yang betul.",
      content: {
        left: ["meriah", "prihatin", "rajin", "jernih"],
        right: [
          "mengambil berat tentang orang lain",
          "suasana gembira dan ramai orang",
          "bersih dan terang",
          "tekun dan bersungguh-sungguh",
        ],
      },
      // meriah→B(1), prihatin→A(0), rajin→D(3), jernih→C(2)
      answer: { pairs: { "0": 1, "1": 0, "2": 3, "3": 2 } } },

    // ── Bahagian A3 · Sinonim & Antonim (Soalan 9–10) ──
    single("VOCAB", "Pilih perkataan seerti (sinonim).\n\ngembira = ______", ["sedih", "riang", "marah"], "B"),
    single("VOCAB", "Pilih perkataan seerti (sinonim).\n\nindah = ______", ["buruk", "cantik", "kotor"], "B"),
    single("VOCAB", "Pilih perkataan berlawan (antonim).\n\nbersih ✕ ______", ["cantik", "kotor", "kemas"], "B"),
    single("VOCAB", "Pilih perkataan berlawan (antonim).\n\nselamat ✕ ______", ["bahaya", "sihat", "gembira"], "A"),

    // ── Bahagian A4 · Dengar dan pilih jawapan yang betul (Soalan 11–14) ──
    listen("LISTENING", "Dengar audio, kemudian pilih ejaan yang betul.", "/audio/bahasa-melayu-standard-2/melipat.mp3", ["melipat", "melipet", "meliput"], "A", { imageUrl: `${IMG}/audio-melipat.jpg`, imageAlt: "seorang murid melipat pakaian" }),
    listen("LISTENING", "Dengar audio, kemudian pilih ejaan yang betul.", "/audio/bahasa-melayu-standard-2/enak.mp3", ["enek", "enak", "enam"], "B", { imageUrl: `${IMG}/audio-enak.jpg`, imageAlt: "hidangan Malaysia yang kelihatan enak" }),
    listen("LISTENING", "Dengar audio, kemudian pilih ejaan yang betul.", "/audio/bahasa-melayu-standard-2/hidangan.mp3", ["hidangan", "hiding", "heidangan"], "A", { imageUrl: `${IMG}/audio-hidangan.jpg`, imageAlt: "dulang berisi beberapa hidangan" }),
    listen("LISTENING", "Dengar audio, kemudian pilih ejaan yang betul.", "/audio/bahasa-melayu-standard-2/akuarium.mp3", ["akuriem", "akuarium", "akuareum"], "B", { imageUrl: `${IMG}/audio-akuarium.jpg`, imageAlt: "akuarium berisi ikan berwarna-warni" }),

    // ── Bahagian B1 · Kata Ganti Nama (Soalan 15) ──
    single("GRAMMAR", "Pilih kata ganti nama yang paling sesuai.\n\nAzlan dan Rafiq ialah adik-beradik. ______ selalu pergi ke sekolah bersama-sama.", ["Saya", "Kami", "Mereka"], "C", 1, { imageUrl: `${IMG}/grammar-adik-beradik.jpg`, imageAlt: "Azlan dan Rafiq berjalan ke sekolah bersama-sama" }),

    // ── Bahagian B2 · Isi Tempat Kosong dengan Imbuhan (Soalan 19–21) ──
    single("GRAMMAR", "Pilih imbuhan yang betul.\n\nPelajar itu ______ buku perpustakaan dengan berhati-hati.", ["membaca", "dibaca", "bacakan"], "A", 1, { imageUrl: `${IMG}/grammar-membaca.jpg`, imageAlt: "seorang murid membaca buku perpustakaan" }),
    single("GRAMMAR", "Pilih imbuhan yang betul.\n\nPokok bunga itu ______ pada setiap pagi oleh Encik Hamid.", ["menyiram", "disiram", "siramkan"], "B", 1, { imageUrl: `${IMG}/grammar-disiram.jpg`, imageAlt: "Encik Hamid menyiram pokok bunga" }),
    single("GRAMMAR", "Isi tempat kosong dengan kata sendi nama yang betul.\n\nMurid-murid itu pergi ______ sekolah setiap hari.", ["di", "ke", "dari"], "B", 1, { imageUrl: `${IMG}/grammar-ke-sekolah.jpg`, imageAlt: "murid-murid berjalan masuk ke sekolah" }),
    single("GRAMMAR", "Isi tempat kosong dengan kata sendi nama yang betul.\n\nBuku itu diletakkan ______ atas meja.", ["di", "ke", "dari"], "A", 1, { imageUrl: `${IMG}/grammar-buku-meja.jpg`, imageAlt: "sebuah buku diletakkan di atas meja" }),
    single("GRAMMAR", "Isi tempat kosong dengan kata sendi nama yang betul.\n\nDia baru pulang ______ pasar pagi tadi.", ["di", "ke", "dari"], "C", 1, { imageUrl: `${IMG}/grammar-pasar.jpg`, imageAlt: "suasana pasar pagi di Malaysia" }),

    // ── Bahagian B3 · Susun Ayat (Soalan 22–23) ──
    { type: "ORDERING", dimension: "GRAMMAR", score: 2,
      prompt: "Susun perkataan-perkataan ini menjadi satu ayat yang betul.",
      content: { items: ["pada", "setiap", "hari", "Azlan", "belajar", "rajin"], imageUrl: `${IMG}/grammar-membaca.jpg`, imageAlt: "Azlan belajar dengan rajin" },
      // Azlan(3) rajin(5) belajar(4) pada(0) setiap(1) hari(2)
      answer: { order: [3, 5, 4, 0, 1, 2] } },
    { type: "ORDERING", dimension: "GRAMMAR", score: 2,
      prompt: "Susun perkataan-perkataan ini menjadi satu ayat yang betul.",
      content: { items: ["meja", "meletakkan", "di", "buku", "atas", "saya"], imageUrl: `${IMG}/grammar-buku-meja.jpg`, imageAlt: "buku di atas meja" },
      // Saya(5) meletakkan(1) buku(3) di(2) atas(4) meja(0)
      answer: { order: [5, 1, 3, 2, 4, 0] } },

    // ── Bahagian B3 · Tukar Ayat Penyata kepada Ayat Tanya (Soalan 24) ──
    { type: "SHORT", dimension: "GRAMMAR", score: 2,
      prompt: "Tukar ayat penyata ini kepada ayat tanya.\n\nAyat penyata: Dia suka makan nasi lemak.",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "ms", imageUrl: `${IMG}/audio-enak.jpg`, imageAlt: "sepinggan nasi lemak sebagai rangsangan ayat",
        template: "Tulis ayat tanya kamu. Contoh mula: “Adakah …?”" },
      answer: { rubric: "Contoh: Adakah dia suka makan nasi lemak?" } },

    // ── Bahagian C · Membaca (Soalan 25–26) — petikan "Alam Semula Jadi" ──
    { type: "READING", dimension: "READING", score: 2,
      prompt: "Baca petikan di bawah, kemudian jawab soalan-soalan berikut.",
      content: {
        passage: "Alam Semula Jadi Yang Indah\n\nMalaysia mempunyai alam semula jadi yang sangat indah. Hutan-hutannya hijau dan subur. Sungainya jernih dan mengalir tenang. Di dalam hutan, terdapat banyak haiwan seperti harimau, gajah dan orang utan.\n\nKita semua mesti jaga dan lindungi alam sekitar kita. Jangan membuang sampah merata-rata. Bersama-sama kita usaha untuk menjaga keindahan alam Malaysia.",
        passageImage: `${IMG}/reading-alam.jpg`, passageImageAlt: "hutan Malaysia yang hijau dengan sungai, harimau, gajah dan orang utan",
        subs: [
          { stem: "Mengapakah hutan Malaysia dikatakan indah?", options: opt([
            "Kerana ada banyak bangunan tinggi",
            "Kerana hutan hijau, subur dan ada pelbagai haiwan",
            "Kerana sungainya kotor dan berlumpur",
            "Kerana ada banyak kilang di dalam hutan",
          ]) },
          { stem: "Apakah yang perlu kita lakukan untuk menjaga alam sekitar?", options: opt([
            "Buang sampah merata-rata",
            "Tebang pokok sesuka hati",
            "Jaga dan lindungi alam sekitar serta tidak membuang sampah",
            "Tidak perlu peduli alam sekitar",
          ]) },
        ],
      },
      answer: { keys: ["B", "C"] } },

    // ── Bahagian C · Menulis Ayat (gambar gotong-royong) ──
    { type: "SHORT", dimension: "WRITING", score: 3,
      prompt: "Lihat gambar, tulis 2–3 ayat tentang gambar itu. Gunakan kata-kata kunci yang diberikan.",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "ms",
        imageUrl: `${IMG}/writing-gotong-royong.jpg`, imageAlt: "penduduk bergotong-royong membersihkan taman",
        template: "Kata kunci: bersama-sama, tolong-menolong, bersih, usaha, kawasan" },
      answer: { rubric: "Contoh: Penduduk kampung bergotong-royong pada hari itu. Mereka bekerja bersama-sama dan tolong-menolong membersihkan kawasan itu. Semua orang berusaha supaya kawasan itu menjadi bersih." } },
  ];
}

// ══════════════════════════════════════════════════════════════════════════
// TAHUN 3  ·  BM KSSR Semakan  ·  SJKC
// ══════════════════════════════════════════════════════════════════════════
export function bahasaMelayuStandard3Questions(): QData[] {
  const IMG = "/questions/bahasa-melayu-standard-3";
  return [
    // ── Bahagian A1 · Sinonim & Antonim (Soalan 1–4) ──
    single("VOCAB", "Apakah sinonim (perkataan yang sama maksud) bagi “berani”?", ["penakut", "pengecut", "gagah", "lemah"], "C", 1, { imageUrl: `${IMG}/concept-berani.jpg`, imageAlt: "seorang murid berani membantu rakannya" }),
    single("VOCAB", "Apakah sinonim bagi “pandai”?", ["bodoh", "cerdik", "malas", "lemah"], "B", 1, { imageUrl: `${IMG}/concept-pandai.jpg`, imageAlt: "seorang murid tekun belajar" }),
    single("VOCAB", "Apakah antonim bagi “luas”?", ["besar", "sempit", "panjang", "tinggi"], "B", 1, { imageUrl: `${IMG}/concept-luas.jpg`, imageAlt: "sebuah kawasan lapang yang luas" }),
    single("VOCAB", "Apakah antonim bagi “rajin”?", ["tekun", "malas", "cerdik", "kuat"], "B", 1, { imageUrl: `${IMG}/concept-rajin.jpg`, imageAlt: "seorang murid rajin menyiapkan kerja sekolah" }),

    // ── Bahagian A2 · Pilih Perkataan Mengikut Makna (Soalan 5–6) ──
    single("VOCAB", "Pilih perkataan yang paling sesuai.\n\nDia ______ dalam pelajarannya dan sentiasa mendapat keputusan cemerlang.", ["malas", "cuai", "lalai", "tekun"], "D", 1, { imageUrl: `${IMG}/concept-pandai.jpg`, imageAlt: "murid belajar dengan tekun" }),
    single("VOCAB", "Pilih perkataan yang paling sesuai.\n\nKawasan itu sangat ______ dan menarik perhatian semua pelancong.", ["hodoh", "membosankan", "memukau", "menakutkan"], "C", 1, { imageUrl: `${IMG}/grammar-taman-bunga.jpg`, imageAlt: "taman bunga yang indah dan menarik" }),

    // ── Bahagian A3 · Simpulan Bahasa (Soalan 7–9) ──
    { type: "MATCHING", dimension: "VOCAB", score: 3,
      prompt: "Padankan simpulan bahasa dengan maksud yang betul.",
      content: {
        left: ["ringan tulang", "buah mulut", "panjang tangan"],
        right: [
          "menjadi bahan perbualan orang ramai",
          "rajin dan suka membantu",
          "suka mencuri",
        ],
      },
      // ringan tulang→B(1), buah mulut→A(0), panjang tangan→C(2)
      answer: { pairs: { "0": 1, "1": 0, "2": 2 } } },

    // ── Bahagian A4 · Dengar dan pilih jawapan yang betul (Soalan 10–13) ──
    listen("LISTENING", "Dengar audio, kemudian pilih ejaan yang betul.", "/audio/bahasa-melayu-standard-3/menjual.mp3", ["menjual", "menjuat", "minjual"], "A", { imageUrl: `${IMG}/audio-menjual.jpg`, imageAlt: "peniaga menjual buah kepada pelanggan" }),
    listen("LISTENING", "Dengar audio, kemudian pilih ejaan yang betul.", "/audio/bahasa-melayu-standard-3/naskhah.mp3", ["nakah", "naskhah", "naskeh"], "B", { imageUrl: `${IMG}/audio-naskhah.jpg`, imageAlt: "beberapa naskhah buku dan kertas bercetak" }),
    listen("LISTENING", "Dengar audio, kemudian pilih ejaan yang betul.", "/audio/bahasa-melayu-standard-3/saudaraku.mp3", ["saudaraku", "saudariku", "sadaraku"], "A", { imageUrl: `${IMG}/audio-saudaraku.jpg`, imageAlt: "dua orang saudara yang saling menyayangi" }),
    listen("LISTENING", "Dengar audio, kemudian pilih ejaan yang betul.", "/audio/bahasa-melayu-standard-3/pemeriksaan.mp3", ["pemerisaan", "pemeriksaan", "pemerrisaan"], "B", { imageUrl: `${IMG}/audio-pemeriksaan.jpg`, imageAlt: "seorang doktor menjalankan pemeriksaan kesihatan" }),

    // ── Bahagian B · Tatabahasa (Soalan 14–18) ──
    single("GRAMMAR", "Pilih penjodoh bilangan yang betul.\n\nIbu melipat lima ______ baju dengan kemas.", ["buah", "helai", "ekor", "batang"], "B", 1, { imageUrl: `${IMG}/grammar-baju.jpg`, imageAlt: "lima helai baju yang dilipat dengan kemas" }),
    single("GRAMMAR", "Pilih imbuhan yang betul. (baiki)\n\nTukang bangunan itu ______ rumah yang rosak.", ["membaiki", "dibaiki", "baiki", "baikan"], "A", 1, { imageUrl: `${IMG}/grammar-baiki-rumah.jpg`, imageAlt: "tukang bangunan membaiki dinding rumah" }),
    single("GRAMMAR", "Pilih imbuhan yang betul. (galak)\n\nGuru ______ murid-murid supaya berusaha lebih kuat.", ["menggalakkan", "digalakkan", "tergalak", "kegalakan"], "A", 1, { imageUrl: `${IMG}/grammar-galakkan.jpg`, imageAlt: "guru memberikan galakan kepada murid-murid" }),
    single("GRAMMAR", "Pilih kata hubung yang betul.\n\n______ dia berasa penat, dia tetap menyelesaikan kerja rumahnya.", ["Kerana", "Supaya", "Walaupun", "Apabila"], "C", 1, { imageUrl: `${IMG}/grammar-walaupun.jpg`, imageAlt: "murid yang penat masih menyiapkan kerja rumah" }),
    single("GRAMMAR", "Pilih kata hubung yang betul.\n\nKita mesti menjaga kebersihan ______ persekitaran kita sentiasa bersih dan sihat.", ["tetapi", "supaya", "walaupun", "apabila"], "B", 1, { imageUrl: `${IMG}/grammar-kebersihan.jpg`, imageAlt: "murid-murid menjaga kebersihan persekitaran" }),

    // ── Bahagian B1 · Kenal Pasti Ayat yang Betul (Soalan 19–20) ──
    single("GRAMMAR", "Tandakan ayat yang betul.", [
      "Walaupun hujan lebat, tetapi mereka tetap pergi ke sekolah.",
      "Walaupun hujan lebat, mereka tetap pergi ke sekolah.",
    ], "B"),
    single("GRAMMAR", "Tandakan ayat yang betul.", [
      "Kerana dia rajin belajar, sebab itu dia berjaya dalam peperiksaan.",
      "Dia berjaya dalam peperiksaan kerana dia rajin belajar.",
    ], "B", 1, { imageUrl: `${IMG}/concept-rajin.jpg`, imageAlt: "murid yang rajin belajar dan berjaya" }),

    // ── Bahagian B3 · Transformasi Ayat (Soalan 21–22) ──
    single("GRAMMAR", "Tukar ayat penyata kepada ayat tanya (guna kata tanya).\n\nAyat penyata: Imran tinggal di Taman Permai.", [
      "Apakah Imran tinggal?",
      "Di manakah Imran tinggal?",
    ], "B"),
    single("GRAMMAR", "Tukar ayat penyata kepada ayat seru.\n\nAyat penyata: Taman bunga itu sungguh cantik dan memukau.", [
      "Wahai, cantik taman bunga itu.",
      "Wah, cantiknya taman bunga itu!",
    ], "B", 1, { imageUrl: `${IMG}/grammar-taman-bunga.jpg`, imageAlt: "taman bunga yang cantik dan memukau" }),

    // ── Bahagian C · Membaca (petikan "Semangat Si Kecil") ──
    { type: "READING", dimension: "READING", score: 3,
      prompt: "Baca petikan di bawah, kemudian jawab soalan-soalan yang berikut.",
      content: {
        passage: "Semangat Si Kecil\n\nImran ialah seorang budak lelaki yang kecil dan kurus, tetapi dia mempunyai semangat waja dan keberanian. Walaupun kakinya lumpuh dan perlu menggunakan kerusi roda, dia tidak pernah berputus asa.\n\nSetiap hari, Imran menghadiri kelas pemulihan dengan tekun. Dia berlatih berjalan dengan bantuan tongkat, jatuh bangun tanpa mengeluh. Ibunya sentiasa ada di sisinya, memberi semangat dan sokongan.\n\nAkhirnya, selepas dua tahun berusaha, Imran berjaya berjalan sendiri tanpa bantuan. Semua orang bertepuk tangan dan ramai yang menitiskan air mata kegembiraan. Imran tersenyum bangga — baginya, tidak ada sesuatu yang mustahil jika kita tidak berputus asa.",
        passageImage: `${IMG}/reading-imran.jpg`, passageImageAlt: "Imran berlatih berjalan dalam kelas pemulihan dengan sokongan ibunya",
        subs: [
          { stem: "Mengapakah Imran menggunakan kerusi roda?", options: opt([
            "Kerana dia malas berjalan",
            "Kerana kakinya lumpuh",
            "Kerana kakinya terluka dalam kemalangan",
            "Kerana doktor mengarahkannya berbuat demikian",
          ]) },
          { stem: "Apakah maksud “semangat waja” dalam petikan itu?", options: opt([
            "Mudah berputus asa",
            "Tidak mempunyai kekuatan",
            "Mempunyai semangat dan keberanian yang tinggi",
            "Bersikap acuh tak acuh",
          ]) },
          { stem: "Apakah pengajaran utama daripada cerita Imran?", options: opt([
            "Kita perlu ada kerusi roda untuk berjaya",
            "Ibu bapa mesti selalu ada bersama anak",
            "Jangan putus asa dan terus berusaha walaupun menghadapi cabaran",
            "Kelas pemulihan adalah penting untuk semua orang",
          ]) },
        ],
      },
      answer: { keys: ["B", "C", "C"] } },

    // ── Bahagian C · Betul atau Salah (Soalan 23) ──
    betulSalah("READING", "Berdasarkan petikan “Semangat Si Kecil”, tandakan Betul atau Salah:\n\nImran mengambil masa dua tahun untuk berjaya berjalan sendiri.", true, 1, { imageUrl: `${IMG}/reading-imran.jpg`, imageAlt: "Imran menjalani latihan pemulihan" }),
    betulSalah("READING", "Berdasarkan petikan “Semangat Si Kecil”, tandakan Betul atau Salah:\n\nImran selalu mengeluh dan tidak mahu berlatih.", false, 1, { imageUrl: `${IMG}/reading-imran.jpg`, imageAlt: "Imran menjalani latihan pemulihan dengan tekun" }),
    betulSalah("READING", "Berdasarkan petikan “Semangat Si Kecil”, tandakan Betul atau Salah:\n\nIbu Imran memberi sokongan kepadanya setiap hari.", true, 1, { imageUrl: `${IMG}/reading-imran.jpg`, imageAlt: "ibu Imran menyokong latihan pemulihannya" }),

    // ── Bahagian C · Penulisan Pendek (Soalan 24) ──
    { type: "SHORT", dimension: "WRITING", score: 3,
      prompt: "Berdasarkan situasi dan kata kunci di bawah, tulis satu perenggan.\nBilangan patah perkataan: tidak kurang daripada 40 patah.\n\nSituasi: Kamu dan jiran-jiran bergotong-royong membersihkan kawasan taman.\nMesti ada: bila, siapa, apa yang dilakukan, perasaan.",
      content: { minWords: 40, maxWords: 1000, minimumOnly: true, lang: "ms", imageUrl: `${IMG}/writing-gotong-royong.jpg`, imageAlt: "jiran-jiran bergotong-royong membersihkan taman",
        template: "Kata kunci: gotong-royong, bersama-sama, perpaduan, bangga, bersih" },
      answer: { rubric: "Contoh (± 48 patah): Pada hari Ahad yang lalu, saya dan jiran-jiran bergotong-royong membersihkan kawasan taman. Kami bekerja bersama-sama membersihkan longkang, memotong rumput dan mengutip sampah. Semangat perpaduan dalam kalangan kami amat kuat. Selepas selesai, taman itu menjadi bersih dan cantik. Saya berasa sangat bangga dapat menyumbang kepada masyarakat." } },
  ];
}
