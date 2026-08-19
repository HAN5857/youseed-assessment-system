// ──────────────────────────────────────────────────────────────────────────
// Bahasa Melayu question banks — Tahun 4–6 (Standards 4–6), Format UASA.
//
// SOURCE OF TRUTH: "NEW TAHUN {4,5,6} YOUSEED UJIAN PAPER.docx". Every
// question / option / answer is taken VERBATIM. The oral section is excluded.
// Cloze-with-choices and comprehension passages are modelled as READING
// (passage + MCQ subs). Essays / short answers are SHORT (effort-scored;
// tutor reviews). Karangan graphics come from the DOCX (image1.png).
// ──────────────────────────────────────────────────────────────────────────

import { Q, type QData } from "./banks-s4-s6";
export { Q };
export type { QData };

const opt = (arr: string[]) => arr.map((text, i) => ({ key: "ABCDEFGH"[i], text }));
const single = (
  dimension: string, prompt: string, choices: string[], answerKey: string,
  score = 1, extra: Record<string, any> = {},
): QData => ({ type: "SINGLE", dimension, score, prompt, content: { options: opt(choices), ...extra }, answer: { key: answerKey } });
const betulSalah = (dimension: string, statement: string, betul: boolean, score = 1): QData => ({
  type: "SINGLE", dimension, score, prompt: statement,
  content: { options: opt(["Betul", "Salah"]) }, answer: { key: betul ? "A" : "B" },
});

// ══════════════════════════════════════════════════════════════════════════
// TAHUN 4  ·  Format UASA
// ══════════════════════════════════════════════════════════════════════════
export function bahasaMelayuStandard4Questions(): QData[] {
  const IMG = "/questions/bahasa-melayu-standard-4";
  return [
    // ── A1 · Tatabahasa & Kosa Kata (Soalan 1–6) ──
    single("GRAMMAR", "Pilih kata yang paling sesuai.\n\nMurid-murid ______ buku teks ke sekolah setiap hari.", ["bawa", "membawa", "dibawa", "terbawa"], "B"),
    single("GRAMMAR", "Pilih kata yang paling sesuai.\n\nEncik Hafiz ______ dari Kuala Lumpur ke Johor Bahru semalam.", ["pergi", "tiba", "bertolak", "singgah"], "C"),
    single("GRAMMAR", "Pilih kata yang paling sesuai.\n\n______ kamu tidak sihat, lebih baik kamu berehat di rumah hari ini.", ["Supaya", "Apabila", "Jika", "Walaupun"], "C"),
    single("GRAMMAR", "Pilih penjodoh bilangan yang sesuai.\n\nMurid-murid sedang menampalkan se______ poster yang cantik di sudut kesihatan kelas.", ["helai", "keping", "buah", "biji"], "B"),
    single("GRAMMAR", "Pilih kata ganti nama yang betul.\n\nPuan Salmah seorang guru. ______ mengajar mata pelajaran Sains.", ["Dia", "Beliau", "Mereka", "Kami"], "B"),
    single("VOCAB", "Pilih kata adjektif yang paling tepat.\n\nAyah memandu kereta agak ______ semasa hujan lebat demi keselamatan keluarganya.", ["deras", "cepat", "ligat", "perlahan"], "D"),

    // ── A1 · Pilih maksud yang betul (Soalan 7–9) — MATCHING ──
    { type: "MATCHING", dimension: "VOCAB", score: 3,
      prompt: "Padankan perkataan dengan maksud yang betul.",
      content: {
        left: ["waspada", "prihatin", "berhemat"],
        right: [
          "Mengambil berat tentang keadaan orang lain",
          "Berhati-hati dan berjaga-jaga",
          "Berjimat cermat semasa berbelanja",
        ],
      },
      // waspada→B(1), prihatin→A(0), berhemat→C(2)
      answer: { pairs: { "0": 1, "1": 0, "2": 2 } } },

    // ── A2 · Kloz "Kelas Kami Bersih" (Soalan 10–14) — READING ──
    { type: "READING", dimension: "GRAMMAR", score: 5,
      prompt: "Baca petikan di bawah dan pilih jawapan yang paling sesuai bagi setiap tempat kosong.",
      content: {
        passage: "Kelas Kami Bersih\n\nSetiap pagi, murid-murid ___(10) kelas sebelum pelajaran bermula. Mereka ___(11) lantai dengan penyapu. Semua sampah dibuang ke dalam ___(12). Cikgu Aida ___(13) murid-murid supaya menjaga kebersihan setiap hari. Akhirnya, kelas kami menjadi ___(14) dan selesa.",
        subs: [
          { stem: "Tempat kosong (10): Murid-murid ___ kelas sebelum pelajaran bermula.", options: opt(["membeli", "membersihkan", "memasak"]) },
          { stem: "Tempat kosong (11): Mereka ___ lantai dengan penyapu.", options: opt(["menyapu", "menyiram", "menulis"]) },
          { stem: "Tempat kosong (12): Semua sampah dibuang ke dalam ___.", options: opt(["almari", "beg sekolah", "tong sampah"]) },
          { stem: "Tempat kosong (13): Cikgu Aida ___ murid-murid supaya menjaga kebersihan.", options: opt(["melupakan", "mengingatkan", "meninggalkan"]) },
          { stem: "Tempat kosong (14): Kelas kami menjadi ___ dan selesa.", options: opt(["kotor", "bersih", "gelap"]) },
        ],
      },
      answer: { keys: ["B", "A", "C", "B", "B"] } },

    // ── B · Pemahaman Petikan "Budaya Berkebun" (Soalan 15–19) — READING ──
    { type: "READING", dimension: "READING", score: 5,
      prompt: "Baca petikan di bawah, kemudian jawab soalan-soalan berikut.",
      content: {
        passage: "Budaya Berkebun\n\nPada setiap hujung minggu, keluarga Encik Rizal berkumpul di kebun kecil mereka di belakang rumah. Ada yang mencabut rumpai, ada yang menyiram pokok dan ada yang membaja tanah. Anak-anak kecil pun turut serta, walaupun hanya mampu membantu memegang penyiram.\n\nEncik Rizal percaya bahawa berkebun bukan sekadar hobi. Ia mengajar disiplin, kesabaran dan rasa syukur terhadap rezeki yang dikurniakan. “Bila kita menanam sendiri dan melihat pokok itu berbuah, kepuasan yang kita rasa tiada tandingannya,” katanya.",
        subs: [
          { stem: "Di manakah keluarga Encik Rizal berkebun?", options: opt(["Di ladang besar", "Di taman awam", "Di kebun kecil di belakang rumah", "Di sekolah"]) },
          { stem: "Apakah yang dilakukan oleh anak-anak kecil semasa berkebun?", options: opt(["Mencabut rumpai", "Membaja tanah", "Membantu memegang penyiram", "Memetik buah-buahan"]) },
          { stem: "Mengapa Encik Rizal percaya bahawa berkebun adalah penting?", options: opt(["Kerana ia menghasilkan banyak wang", "Kerana ia mengajar disiplin, kesabaran dan rasa syukur", "Kerana ia menjimatkan masa", "Kerana ia mudah dilakukan oleh semua orang"]) },
          { stem: "Apakah maksud “tiada tandingannya” dalam petikan itu?", options: opt(["Tiada pertandingan yang berlaku", "Tiada yang dapat menandingi atau menyamai", "Tidak ada hadiah diberikan", "Tidak ada yang berminat"]) },
          { stem: "Apakah pengajaran daripada petikan ini?", options: opt(["Semua orang perlu ada kebun di rumah", "Berkebun hanya sesuai untuk orang dewasa", "Aktiviti keluarga bersama mengajar nilai-nilai murni", "Anak-anak tidak perlu membantu kerja rumah"]) },
        ],
      },
      answer: { keys: ["C", "C", "B", "B", "C"] } },

    // ── B1 · Betul / Salah berdasarkan petikan "Budaya Berkebun" (Soalan 20) ──
    betulSalah("READING", "Berdasarkan petikan “Budaya Berkebun”, Betul atau Salah:\n\nKeluarga Encik Rizal berkebun pada setiap hari bekerja.", false),
    betulSalah("READING", "Berdasarkan petikan “Budaya Berkebun”, Betul atau Salah:\n\nEncik Rizal berpendapat bahawa berkebun mengajar nilai-nilai yang baik.", true),
    betulSalah("READING", "Berdasarkan petikan “Budaya Berkebun”, Betul atau Salah:\n\nAnak-anak kecil tidak dibenarkan berkebun bersama keluarga.", false),

    // ── B2 · Jawab Soalan Pendek (Soalan 21) — SHORT ──
    { type: "SHORT", dimension: "WRITING", score: 3,
      prompt: "Jawab dalam ayat yang lengkap.\n\nBerdasarkan petikan “Budaya Berkebun”, nyatakan DUA nilai yang boleh dipelajari daripada aktiviti berkebun.",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "ms",
        template: "Nilai 1: ______\nNilai 2: ______" },
      answer: { rubric: "Contoh: (1) Disiplin — berkebun mengajar kita berdisiplin kerana pokok perlu dijaga secara berterusan. (2) Kesabaran — kita perlu bersabar menunggu pokok membesar dan berbuah (atau rasa syukur)." } },

    // ── B3 · Respons Kritis (Soalan 22) — SHORT ──
    { type: "SHORT", dimension: "WRITING", score: 4,
      prompt: "Kamu dan rakan-rakan sedang mengadakan aktiviti gotong-royong untuk membersihkan taman sekolah. Namun, kamu ternampak seorang murid membuang sampah di lantai.\n\nSebagai seorang murid yang bertanggungjawab, apakah yang akan kamu lakukan?",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "ms" },
      answer: { rubric: "Contoh (± 32 patah): Saya akan menegur perbuatan murid itu dan memberitahunya bahawa tindakannya akan mengotorkan taman sekolah. Selain itu, saya juga akan memintanya supaya mengutip sampah itu lalu membuangnya ke dalam tong sampah." } },

    // ── C · Penulisan Karangan (Soalan 23) — SHORT + grafik kesihatan ──
    { type: "SHORT", dimension: "WRITING", score: 10,
      prompt: "Teliti bahan grafik di bawah. Berdasarkan grafik, tuliskan pendapat kamu tentang cara-cara mengekalkan kesihatan tubuh badan.\nJawapan kamu hendaklah ditulis dalam satu perenggan, tidak lebih daripada 50 patah perkataan.",
      content: { minWords: 30, maxWords: 60, minimumOnly: false, lang: "ms",
        imageUrl: `${IMG}/karangan-kesihatan.png`, imageAlt: "grafik panduan kesihatan: makan buah dan sayur, minum 8 gelas air, elak gula-gula, bersenam" },
      answer: { rubric: "Contoh (± 43 patah): Pada pendapat saya, cara-cara mengekalkan kesihatan tubuh badan termasuklah makan buah-buahan dan sayur-sayuran untuk memperoleh serat yang mencukupi. Selain itu, kita juga perlu minum air yang cukup, iaitu sekurang-kurangnya 8 gelas sehari supaya kita tidak mudah jatuh sakit." } },
  ];
}

// ══════════════════════════════════════════════════════════════════════════
// TAHUN 5  ·  Format UASA
// ══════════════════════════════════════════════════════════════════════════
export function bahasaMelayuStandard5Questions(): QData[] {
  const IMG = "/questions/bahasa-melayu-standard-5";
  return [
    // ── A1 · Imbuhan & Tatabahasa (Soalan 1–6) ──
    single("GRAMMAR", "Pilih jawapan yang paling tepat.\n\nCadangan itu ______ oleh semua ahli jawatankuasa dengan sebulat suara.", ["menyokong", "disokong", "tersokong", "menyokongkan"], "B"),
    single("GRAMMAR", "Pilih jawapan yang paling tepat.\n\nKerajaan ______ kemudahan awam di kawasan luar bandar bagi meningkatkan kualiti hidup penduduk.", ["dipertingkatkan", "mempertingkatkan", "pertingkatkan", "bertingkat"], "B"),
    single("GRAMMAR", "Pilih jawapan yang paling tepat.\n\nGuru itu memberikan ______ kepada murid yang menghadapi masalah.", ["menasihat", "nasihat", "dinasihati", "penasihat"], "B"),
    single("GRAMMAR", "Pilih kata hubung yang betul.\n\nPelajar cemerlang itu berjaya melanjutkan pelajarannya ke universiti ______ keluarganya tidak berada.", ["kerana", "walaupun", "supaya", "apabila"], "B"),
    single("GRAMMAR", "Pilih kata penguat yang betul.\n\nPemandangan di puncak bukit itu indah ______ pada waktu pagi.", ["amat", "terlalu", "sekali", "paling"], "C"),

    // ── A1 · Pilih maksud yang betul (Soalan 7–9) — MATCHING ──
    { type: "MATCHING", dimension: "VOCAB", score: 3,
      prompt: "Padankan perkataan dengan maksud yang betul.",
      content: {
        left: ["integriti", "amanah", "inovasi"],
        right: [
          "Boleh dipercayai dan menunaikan tanggungjawab yang diberikan",
          "Sifat jujur, amanah dan bertanggungjawab dalam setiap tindakan",
          "Penciptaan atau penambahbaikan sesuatu yang baharu dan berguna",
        ],
      },
      // integriti→B(1), amanah→A(0), inovasi→C(2)
      answer: { pairs: { "0": 1, "1": 0, "2": 2 } } },

    // ── A2 · Kloz "Gotong-royong" (Soalan 10–14) — READING ──
    { type: "READING", dimension: "GRAMMAR", score: 5,
      prompt: "Baca petikan di bawah dan pilih jawapan yang paling sesuai bagi setiap tempat kosong.",
      content: {
        passage: "Sekolah saya ___(10) gotong-royong pada hari Sabtu. Semua murid datang awal untuk ___(11) guru membersihkan kawasan sekolah. Murid-murid ___(12) daun kering, mengutip sampah dan menanam pokok bunga. Semua murid bekerjasama dengan penuh semangat. Selepas selesai aktiviti, guru besar mengucapkan ___(13) kepada semua murid. Murid-murid menanam se___(14) pokok bunga di taman sekolah.",
        subs: [
          { stem: "Tempat kosong (10): Sekolah saya ___ gotong-royong pada hari Sabtu.", options: opt(["mengadakan", "menyapu", "membersihkan"]) },
          { stem: "Tempat kosong (11): Semua murid datang awal untuk ___ guru.", options: opt(["membantu", "menunggu", "memanggil"]) },
          { stem: "Tempat kosong (12): Murid-murid ___ daun kering.", options: opt(["menyiram", "menyapu", "memasak"]) },
          { stem: "Tempat kosong (13): Guru besar mengucapkan ___ kepada semua murid.", options: opt(["tahniah", "terima kasih", "selamat tinggal"]) },
          { stem: "Tempat kosong (14): Murid-murid menanam se___ pokok bunga di taman sekolah.", options: opt(["buah", "batang", "helai"]) },
        ],
      },
      answer: { keys: ["A", "A", "B", "B", "B"] } },

    // ── B · Pemahaman "Integriti" (Soalan 15) — READING (MCQ sub) ──
    { type: "READING", dimension: "READING", score: 1,
      prompt: "Baca petikan di bawah dengan teliti, kemudian jawab soalan yang berikutnya.",
      content: {
        passage: "Integriti\n\nIntegriti ialah nilai murni yang merujuk kepada kejujuran, amanah dan bertanggungjawab dalam setiap tindakan. Individu yang berintegriti akan melakukan perkara yang betul walaupun tanpa pengawasan. Dalam kehidupan seharian, integriti dapat dilihat melalui sikap menepati janji, tidak menipu, dan tidak mengambil hak orang lain. Di tempat kerja, integriti penting untuk membina kepercayaan antara rakan sekerja dan majikan. Dalam kalangan pelajar, integriti boleh ditunjukkan dengan tidak meniru dalam peperiksaan. Nilai ini perlu dipupuk sejak kecil agar menjadi asas kepada masyarakat yang bersih dan bermoral tinggi.",
        subs: [
          { stem: "Pilih ayat yang sama maksud dengan: “Dalam kalangan pelajar, integriti boleh ditunjukkan dengan tidak meniru dalam peperiksaan.”", options: opt([
            "Integriti boleh menunjukkan kalangan murid dengan tidak meniru dalam peperiksaan.",
            "Dalam kalangan pelajar, integriti boleh ditunjukkan apabila mereka tidak meniru dalam peperiksaan.",
          ]) },
        ],
      },
      answer: { keys: ["B"] } },
    // (a) FILL
    { type: "FILL", dimension: "READING", score: 1,
      prompt: "Berdasarkan petikan “Integriti”:\n\nNilai murni yang merujuk kepada kejujuran, amanah dan tanggungjawab dalam setiap tindakan dikenali sebagai ______.",
      content: { caseSensitive: false }, answer: { accepted: ["integriti"] } },
    // (b) SHORT
    { type: "SHORT", dimension: "READING", score: 1,
      prompt: "Berdasarkan petikan “Integriti”, bagaimanakah integriti dapat dilihat dalam kehidupan seharian?",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "ms" },
      answer: { rubric: "Contoh: Integriti dapat dilihat melalui sikap menepati janji, tidak menipu dan tidak mengambil hak orang lain." } },
    // (c) FILL — kata kerja
    { type: "FILL", dimension: "GRAMMAR", score: 1,
      prompt: "Tulis satu kata kerja yang terdapat dalam ayat berikut:\n\n“Di tempat kerja, integriti penting untuk membina kepercayaan antara rakan sekerja dan majikan.”",
      content: { caseSensitive: false }, answer: { accepted: ["membina"] } },

    // ── B3 · Respons Kritis — SHORT ──
    { type: "SHORT", dimension: "WRITING", score: 4,
      prompt: "Ketika meronda di kantin sekolah, kamu ternampak seorang murid menangis kerana kehilangan dompet. Dia kelihatan sangat cemas dan tercari-cari dompetnya di sekitar kantin. Namun, loceng tamat waktu rehat sudah berbunyi ketika itu.\n\nApakah tindakan yang perlu kamu lakukan?",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "ms" },
      answer: { rubric: "Contoh (± 31 patah): Saya akan cuba menenangkan murid itu supaya dia tidak berasa terlalu cemas. Kemudian, saya akan menemaninya untuk melaporkan hal ini kepada guru bertugas supaya pihak sekolah dapat mengambil tindakan yang sewajarnya." } },

    // ── C · Penulisan Karangan — SHORT + grafik "Sambutan Hari Sukan" ──
    { type: "SHORT", dimension: "WRITING", score: 10,
      prompt: "Teliti bahan grafik di bawah. Kemudian, tulis sebuah karangan dalam bentuk berformat atau tidak berformat.\nPanjangnya jawapan kamu hendaklah antara 50 hingga 80 patah perkataan.\n\nTajuk: Sambutan Hari Sukan",
      content: { minWords: 50, maxWords: 120, minimumOnly: true, lang: "ms",
        imageUrl: `${IMG}/karangan-sukan.png`, imageAlt: "bahan grafik karangan bertajuk Sambutan Hari Sukan" },
      answer: { rubric: "Karangan naratif berdasarkan grafik Hari Sukan (pendahuluan – isi – penutup); nilai kesukanan & persahabatan; contoh jawapan penuh diberikan dalam kertas asal." } },
  ];
}

// ══════════════════════════════════════════════════════════════════════════
// TAHUN 6  ·  Format UASA (Aras Peperiksaan)
// ══════════════════════════════════════════════════════════════════════════
export function bahasaMelayuStandard6Questions(): QData[] {
  const IMG = "/questions/bahasa-melayu-standard-6";
  return [
    // ── A1 · Tatabahasa Menyeluruh (Soalan 1–8) ──
    single("GRAMMAR", "Pilih jawapan yang paling tepat.\n\nPunca utama pencemaran sungai itu ______ pembuangan sisa kilang secara haram.", ["ialah", "adalah", "merupakannya", "yang"], "A"),
    single("GRAMMAR", "Pilih jawapan yang paling tepat.\n\n______ teknologi moden telah mengubah cara manusia berkomunikasi pada hari ini.", ["Membangunkan", "Dibangunkan", "Pembangunan", "Bangunan"], "C"),
    single("GRAMMAR", "Pilih kata ganda yang betul.\n\nSuasana di dalam dewan itu menjadi ______ apabila keputusan pertandingan diumumkan.", ["riuh-riuh", "riuh-rendah", "meriah-meriah", "riuh-riuhan"], "B"),
    single("GRAMMAR", "Pilih ayat yang menggunakan imbuhan dengan betul.", [
      "Projek itu telah disiapkan dengan jayanya oleh pasukan itu.",
      "Projek itu telah menyiap dengan jayanya oleh pasukan itu.",
      "Projek itu telah siapkan dengan jayanya oleh pasukan itu.",
      "Pasukan itu telah menyiap projek itu dengan jayanya.",
    ], "A"),
    single("GRAMMAR", "Ayat manakah yang gramatis dan betul dari segi tatabahasa?", [
      "Dia telah pergi ke pasar selepas dia sudah makan.",
      "Setelah makan, dia pergi ke pasar.",
      "Dia makan kemudian dia pergi ke pasar selepas itu.",
      "Dia pergi ke pasar setelah sudah dia makan.",
    ], "B"),
    single("GRAMMAR", "Kenal pasti kesalahan dalam ayat ini dan pilih pembetulan yang betul:\n\n“Para pelajar-pelajar di sekolah ini sangat rajin belajar.”", [
      "“Para” dan “-pelajar” kedua-duanya bermaksud jamak — buang salah satu",
      "Gantikan “sangat” dengan “amat”",
      "Tambah “yang” selepas “sekolah ini”",
      "Tiada kesalahan dalam ayat ini",
    ], "A"),
    single("VOCAB", "Pilih simpulan bahasa yang betul.\n\nGuru itu tidak pernah ______ dalam melayan semua muridnya.", ["buah hati", "makan angin", "pilih kasih", "kaki ayam"], "C"),
    single("GRAMMAR", "Pilih ayat susunan songsang.", [
      "Beliau sungguh kreatif.",
      "Kreatif betul beliau.",
      "Beliau mencipta kompang itu.",
      "Kompang itu dicipta oleh beliau.",
    ], "D"),

    // ── A1 · Pilih maksud yang betul (Soalan 9–11) — MATCHING ──
    { type: "MATCHING", dimension: "VOCAB", score: 3,
      prompt: "Padankan perkataan dengan maksud yang betul.",
      content: {
        left: ["inovasi", "kreatif", "sepakat"],
        right: [
          "Berkebolehan mencipta atau menghasilkan idea yang baharu dan menarik",
          "Penciptaan atau penambahbaikan sesuatu yang baharu dan berguna",
          "Bersetuju dan bekerjasama untuk mencapai satu tujuan",
        ],
      },
      // inovasi→B(1), kreatif→A(0), sepakat→C(2)
      answer: { pairs: { "0": 1, "1": 0, "2": 2 } } },

    // ── A2 · Kloz "Kempen Kitar Semula" (Soalan 12–16) — READING ──
    { type: "READING", dimension: "GRAMMAR", score: 5,
      prompt: "Baca petikan di bawah dan pilih jawapan yang paling sesuai bagi setiap tempat kosong.",
      content: {
        passage: "Kempen Kitar Semula\n\nSekolah saya ___(12) Kempen Kitar Semula sempena Hari Alam Sekitar. Semua murid ___(13) bahan-bahan kitar semula seperti botol plastik, surat khabar lama dan tin aluminium. Aktiviti ini dapat ___(14) kesedaran murid tentang kepentingan menjaga alam sekitar. Guru besar mengucapkan ___(15) kepada semua murid atas kerjasama yang diberikan. Kempen ini berjaya ___(16) sikap bertanggungjawab dalam kalangan murid.",
        subs: [
          { stem: "Tempat kosong (12).", options: opt(["mengadakan", "menghadiri", "membuang", "meninggalkan"]) },
          { stem: "Tempat kosong (13).", options: opt(["menanam", "mengumpulkan", "melukis", "membakar"]) },
          { stem: "Tempat kosong (14).", options: opt(["meningkatkan", "menurunkan", "memindahkan", "menghapuskan"]) },
          { stem: "Tempat kosong (15).", options: opt(["simpati", "takziah", "terima kasih", "selamat tinggal"]) },
          { stem: "Tempat kosong (16).", options: opt(["mencabut", "memupuk", "membuang", "melupakan"]) },
        ],
      },
      answer: { keys: ["A", "B", "A", "C", "B"] } },

    // ── B · Pemahaman "Ketupat" (Soalan 17–19) — READING ──
    { type: "READING", dimension: "READING", score: 3,
      prompt: "Baca petikan di bawah dengan teliti, kemudian jawab soalan-soalan yang berikutnya.",
      content: {
        passage: "Ketupat\n\nKetupat ialah makanan tradisional masyarakat Melayu yang tersohor. Namun begitu, ketupat mendapat sambutan yang baik dalam kalangan kaum Cina, India dan lain-lain. Dalam kalangan masyarakat Melayu, ketupat sering dihidangkan pada sambutan Hari Raya Aidilfitri dan Hari Raya Aidiladha.\n\nKetupat merupakan sejenis makanan berisi beras atau pulut yang dibungkus dengan anyaman daun kelapa atau daun pandan. Makanan ini sering dimakan dengan rendang, lontong, sup pucuk, kari ayam dan kuah kacang. Kini, ketupat mempunyai variasi baharu dengan diisi inti kacang tanah, jagung dan serondeng.",
        subs: [
          { stem: "Ketupat merupakan makanan tradisional yang terkenal dalam kalangan kaum apa?", options: opt(["Kaum Cina", "Kaum Iban", "Kaum India", "Kaum Melayu"]) },
          { stem: "Pilih pernyataan yang benar tentang petikan.", options: opt([
            "Ketupat merupakan sejenis makanan berisi tepung pulut.",
            "Ketupat ialah makanan tradisional kaum Cina yang terkenal.",
            "Ketupat sering dimakan dengan rendang, lontong, jagung dan serondeng.",
            "Ketupat sering dihidangkan pada sambutan Hari Raya Aidilfitri dan Hari Raya Aidiladha.",
          ]) },
          { stem: "Berikut ialah jenis-jenis inti baharu ketupat berdasarkan petikan, kecuali", options: opt(["jagung", "serondeng", "kari ayam", "kacang tanah"]) },
        ],
      },
      answer: { keys: ["D", "D", "C"] } },

    // ── B · Betul / Salah (Soalan 20–21) ──
    betulSalah("READING", "Berdasarkan petikan “Ketupat”, Betul atau Salah:\n\nKetupat hanya digemari oleh masyarakat Melayu sahaja.", false),
    betulSalah("READING", "Berdasarkan petikan “Ketupat”, Betul atau Salah:\n\nKetupat dibungkus dengan anyaman daun kelapa atau daun pandan.", true),

    // ── B3 · Respons Kritis & Kreatif (Soalan 22) — SHORT ──
    { type: "SHORT", dimension: "WRITING", score: 4,
      prompt: "Semasa menunggang basikal ke sekolah, kamu ternampak seorang budak lelaki terjatuh di jalan raya.\n\nBerdasarkan situasi di atas, apakah tindakan yang patut kamu lakukan?",
      content: { minWords: 1, maxWords: 1000, countOnly: true, lang: "ms" },
      answer: { rubric: "Contoh (± 28 patah): Saya akan memapah budak yang terjatuh itu lalu memujuknya supaya dia tidak menangis. Kemudian, saya akan memeriksa keadaannya sama ada budak itu tercedera dan membantu menghubungi ibu bapanya." } },

    // ── C · Penulisan Karangan — SHORT + grafik "Perkhemahan" ──
    { type: "SHORT", dimension: "WRITING", score: 12,
      prompt: "Teliti bahan grafik di bawah. Kemudian, tulis sebuah karangan dalam bentuk berformat atau tidak berformat.\nPanjangnya jawapan kamu hendaklah antara 50 hingga 80 patah perkataan.",
      content: { minWords: 50, maxWords: 120, minimumOnly: true, lang: "ms",
        imageUrl: `${IMG}/karangan-perkhemahan.png`, imageAlt: "bahan grafik karangan bertajuk Perkhemahan" },
      answer: { rubric: "Karangan naratif berdasarkan grafik perkhemahan (pendahuluan – isi – penutup); nilai kerjasama & pengalaman berharga; contoh jawapan penuh diberikan dalam kertas asal." } },
  ];
}
