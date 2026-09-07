import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  ArrowDown,
  ArrowRight,
  Activity,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCode2,
  FormInput,
  Image as ImageIcon,
  Layers3,
  LayoutTemplate,
  Lightbulb,
  Link2,
  LogOut,
  ListChecks,
  Menu,
  MonitorPlay,
  Palette,
  Play,
  RotateCcw,
  Sparkles,
  Table2,
  Target,
  TerminalSquare,
  TimerReset,
  Type,
  UserRound,
  X,
  Zap,
} from "lucide-react";

type Module = {
  id: number;
  label: string;
  title: string;
  short: string;
  icon: typeof LayoutTemplate;
  color: string;
  light: string;
  tags: string[];
  description: string;
  code: string;
  tips: string[];
};

const modules: Module[] = [
  {
    id: 1,
    label: "Struktur",
    title: "Format halaman web",
    short: "Bangun kanvas dan hirarki halaman.",
    icon: LayoutTemplate,
    color: "lime",
    light: "bg-lime-300 text-slate-950",
    tags: ["HTML5", "Semantik", "Layout"],
    description: "Anggap HTML sebagai blueprint portofolio: ia menentukan urutan, makna, dan area yang akan diisi oleh visual desainmu.",
    code: `<header>\n  <h1>Studio Visual</h1>\n  <nav>Menu navigasi</nav>\n</header>\n<main>\n  <section>Proyek pilihan</section>\n</main>\n<footer>© 2026</footer>`,
    tips: ["Gunakan satu <main> untuk konten utama.", "Pilih tag semantik sebelum menambah CSS.", "Hirarki yang rapi membuat layout mudah dikembangkan."],
  },
  {
    id: 2,
    label: "Teks",
    title: "Format teks & paragraf",
    short: "Atur ritme baca dengan tipografi HTML.",
    icon: Type,
    color: "violet",
    light: "bg-violet-300 text-slate-950",
    tags: ["Heading", "Paragraf", "Emphasis"],
    description: "Teks adalah elemen visual juga. Gunakan heading untuk struktur, paragraf untuk narasi, dan emphasis untuk menuntun perhatian.",
    code: `<h1>Judul utama</h1>\n<h2>Subjudul proyek</h2>\n<p>Eksplorasi <strong>warna</strong>\n  dan <em>komposisi</em> visual.</p>\n<blockquote>Design tells a story.</blockquote>`,
    tips: ["Jangan melompat dari h1 langsung ke h4.", "<strong> menandai hal penting, bukan sekadar huruf tebal.", "Paragraf pendek lebih nyaman dibaca di layar."],
  },
  {
    id: 3,
    label: "Tabel",
    title: "Format tabel pada halaman web",
    short: "Susun data proyek agar mudah dipindai.",
    icon: Table2,
    color: "sky",
    light: "bg-sky-300 text-slate-950",
    tags: ["Table", "Row", "Cell"],
    description: "Tabel cocok untuk data terstruktur seperti paket jasa, timeline, spesifikasi, atau daftar aset—bukan untuk mengatur layout halaman.",
    code: `<table>\n  <tr>\n    <th>Proyek</th><th>Status</th>\n  </tr>\n  <tr>\n    <td>Brand kit</td><td>Selesai</td>\n  </tr>\n</table>`,
    tips: ["<tr> membuat baris, <th> membuat kepala kolom.", "Gunakan caption untuk konteks tabel.", "Pastikan kontras header dan isi cukup jelas."],
  },
  {
    id: 4,
    label: "Media",
    title: "Multimedia pada halaman web",
    short: "Hidupkan konsep dengan gambar, audio, video.",
    icon: ImageIcon,
    color: "orange",
    light: "bg-orange-300 text-slate-950",
    tags: ["Image", "Video", "Alt text"],
    description: "Media memperkuat pesan visual. Tambahkan alternatif teks agar karya tetap dapat dipahami ketika gambar gagal dimuat atau dibaca screen reader.",
    code: `<figure>\n  <img src="poster.jpg"\n    alt="Poster kampanye warna" />\n  <figcaption>Eksplorasi warna neon.</figcaption>\n</figure>\n<video controls src="showreel.mp4"></video>`,
    tips: ["Selalu isi atribut alt dengan deskripsi bermakna.", "Kompres aset agar halaman tetap cepat.", "Kontrol video memberi kendali pada pengguna."],
  },
  {
    id: 5,
    label: "Link",
    title: "Format hyperlink pada halaman web",
    short: "Hubungkan halaman, karya, dan referensi.",
    icon: Link2,
    color: "pink",
    light: "bg-pink-300 text-slate-950",
    tags: ["Anchor", "Href", "Target"],
    description: "Hyperlink adalah jembatan antar-ide. Tulis label tautan yang deskriptif supaya pengguna tahu tujuan sebelum mengeklik.",
    code: `<a href="/tentang">Tentang saya</a>\n<a href="https://behance.net"\n  target="_blank"\n  rel="noreferrer">\n  Buka Behance ↗\n</a>`,
    tips: ["Gunakan href untuk alamat tujuan.", "Label ‘klik di sini’ kurang informatif.", "Rel noreferrer melengkapi tautan tab baru."],
  },
  {
    id: 6,
    label: "Form",
    title: "Format formulir pada halaman web",
    short: "Terima brief klien dengan input yang jelas.",
    icon: FormInput,
    color: "teal",
    light: "bg-teal-300 text-slate-950",
    tags: ["Label", "Input", "Textarea"],
    description: "Form adalah titik percakapan dengan audiens. Label yang jelas, tipe input yang tepat, dan tombol aksi akan membuat brief mudah dikirim.",
    code: `<form>\n  <label for="nama">Nama klien</label>\n  <input id="nama" type="text" />\n  <label for="brief">Brief proyek</label>\n  <textarea id="brief"></textarea>\n  <button type="submit">Kirim brief</button>\n</form>`,
    tips: ["Pasangkan setiap input dengan label.", "Pilih type=email untuk alamat email.", "Textarea cocok untuk brief yang panjang."],
  },
];

const quizData = [
  ["Tag yang menampung konten visual utama di browser adalah...", ["<head>", "<body>", "<title>", "<meta>"], 1, "<body> menampung konten yang terlihat pengguna."],
  ["Heading dengan hirarki paling utama adalah...", ["<h6>", "<header>", "<h1>", "<strong>"], 2, "<h1> adalah heading tingkat pertama."],
  ["Tag untuk membuat paragraf adalah...", ["<p>", "<para>", "<text>", "<br>"], 0, "<p> membungkus satu paragraf teks."],
  ["Tag kepala kolom pada tabel adalah...", ["<td>", "<tr>", "<th>", "<thead>"], 2, "<th> menandai table header."],
  ["Atribut aksesibilitas penting pada gambar adalah...", ["href", "alt", "target", "title"], 1, "alt memberi teks pengganti yang bermakna."],
  ["Atribut untuk alamat tujuan hyperlink adalah...", ["src", "link", "href", "url"], 2, "href menyimpan alamat tujuan anchor."],
  ["Elemen untuk teks panjang multiline adalah...", ["<input>", "<textarea>", "<textfield>", "<paragraph>"], 1, "<textarea> menerima teks dalam beberapa baris."],
  ["Tag pembungkus utama input pengguna adalah...", ["<form>", "<input>", "<button>", "<fieldset>"], 0, "<form> mengelompokkan dan mengirim data input."],
  ["Atribut yang menampilkan kontrol pada video adalah...", ["play", "buttons", "controls", "media"], 2, "controls menampilkan kontrol pemutar bawaan."],
  ["Tag pembuat baris tabel adalah...", ["<td>", "<row>", "<tr>", "<table-row>"], 2, "<tr> berarti table row."],
  ["Deklarasi tipe dokumen HTML modern adalah...", ["<!html>", "<!doctype html>", "<doctype>", "<html5>"], 1, "<!doctype html> memberi tahu browser bahwa dokumen menggunakan HTML5."],
  ["Atribut untuk membuka hyperlink di tab baru adalah...", ["target=\"_blank\"", "open=\"new\"", "window=\"tab\"", "tab=\"new\""], 0, "target=\"_blank\" membuka tautan pada tab baru."],
  ["Tag untuk menyisipkan gambar ke halaman web adalah...", ["<picture>", "<img>", "<image>", "<src>"], 1, "<img> menampilkan gambar dan sebaiknya memiliki atribut alt."],
  ["Atribut yang menentukan sumber file gambar adalah...", ["href", "link", "src", "path"], 2, "src berisi lokasi atau URL sumber gambar."],
  ["Tag untuk membuat daftar tidak berurutan adalah...", ["<ol>", "<list>", "<ul>", "<dl>"], 2, "<ul> membuat unordered list dengan penanda bullet."],
  ["Elemen item pada daftar HTML adalah...", ["<item>", "<li>", "<list-item>", "<point>"], 1, "<li> digunakan untuk setiap item dalam daftar."],
  ["Tag untuk membuat tautan ke email adalah...", ["<mail>", "<a href=\"mailto:...\">", "<email>", "<send>"], 1, "Skema mailto pada href membuka aplikasi email pengguna."],
  ["Atribut yang membuat input wajib diisi adalah...", ["required", "needed", "validate", "must"], 0, "required mencegah formulir dikirim saat input masih kosong."],
  ["Tipe input untuk alamat email adalah...", ["type=\"mail\"", "type=\"email\"", "input=\"email\"", "format=\"email\""], 1, "type=\"email\" membantu validasi format alamat email."],
  ["Tag untuk judul halaman yang tampil di tab browser adalah...", ["<head>", "<title>", "<caption>", "<tab>"], 1, "<title> berada di dalam head dan tampil pada tab browser."],
  ["Atribut colspan pada tabel digunakan untuk...", ["menggabungkan kolom", "menggabungkan baris", "mengubah warna", "menghapus tabel"], 0, "colspan menggabungkan beberapa kolom secara horizontal."],
  ["Tag untuk area navigasi utama halaman adalah...", ["<navigate>", "<menu>", "<nav>", "<links>"], 2, "<nav> menandai bagian yang berisi tautan navigasi."],
  ["Elemen semantik untuk konten mandiri seperti artikel adalah...", ["<article>", "<content>", "<section-text>", "<post>"], 0, "<article> cocok untuk konten mandiri yang dapat berdiri sendiri."],
  ["Atribut alt pada gambar terutama membantu...", ["mengatur ukuran", "aksesibilitas dan teks alternatif", "memutar gambar", "mengubah format"], 1, "alt membantu pembaca layar dan tampil ketika gambar gagal dimuat."],
  ["Tag untuk menyematkan video dari file lokal adalah...", ["<movie>", "<video>", "<media>", "<source-only>"], 1, "<video> digunakan untuk memutar konten video pada halaman web."],
] as const;

const starterCode = `<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Portofolio DKV</title>
  <style>
    body { font-family: Arial; padding: 24px; color: #172033; }
    h1 { color: #6c2bd9; }
    .chip { background: #d9f99d; padding: 6px 10px; border-radius: 999px; }
    table { width: 100%; border-collapse: collapse; margin: 18px 0; }
    th, td { border: 1px solid #d8dbe5; padding: 10px; text-align: left; }
    th { background: #f1f5d9; }
    input, textarea { display: block; width: 100%; padding: 9px; margin: 6px 0 12px; border: 1px solid #c9cddd; border-radius: 8px; }
    button { background: #6c2bd9; color: white; border: 0; padding: 10px 14px; border-radius: 8px; }
  </style>
</head>
<body>
  <span class="chip">XII DKV / 2026</span>
  <h1>Studio Visual</h1>
  <p>Selamat datang di portofolio mini saya.</p>
  <h2>Proyek pilihan</h2>
  <table>
    <tr><th>Proyek</th><th>Status</th></tr>
    <tr><td>Brand kit UMKM</td><td>Selesai</td></tr>
  </table>
  <p><a href="https://behance.net" target="_blank">Lihat galeri di Behance ↗</a></p>
  <h2>Brief klien</h2>
  <form onsubmit="event.preventDefault(); alert('Brief tersimpan!')">
    <label for="nama">Nama klien</label>
    <input id="nama" placeholder="Contoh: Kedai Rona" />
    <label for="brief">Ceritakan kebutuhanmu</label>
    <textarea id="brief" rows="3" placeholder="Tulis brief singkat..."></textarea>
    <button type="submit">Kirim brief</button>
  </form>
</body>
</html>`;

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function fileSafe(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "") || "siswa";
}

function wrapPdfText(value: string, maxChars = 92) {
  const lines: string[] = [];
  value.split("\\n").forEach((rawLine) => {
    const line = rawLine.replace(/\t/g, "  ");
    if (!line) {
      lines.push("");
      return;
    }
    for (let index = 0; index < line.length; index += maxChars) {
      lines.push(line.slice(index, index + maxChars));
    }
  });
  return lines;
}

function downloadTextPdf(filename: string, title: string, sections: { heading: string; body: string }[]) {
  const pages: string[][] = [];
  let currentPage: string[] = [];
  const pushLine = (line: string) => {
    if (currentPage.length >= 45) {
      pages.push(currentPage);
      currentPage = [];
    }
    currentPage.push(line);
  };

  pushLine(title);
  pushLine("MarkupLab / PJJ HTML Interaktif XII DKV");
  pushLine("============================================================");
  pushLine("");
  sections.forEach((section) => {
    pushLine(section.heading.toUpperCase());
    pushLine("------------------------------------------------------------");
    wrapPdfText(section.body).forEach(pushLine);
    pushLine("");
  });
  if (currentPage.length) pages.push(currentPage);

  const objects: string[] = [];
  const addObject = (body: string) => {
    objects.push(body);
    return objects.length;
  };
  const catalogId = addObject("");
  const pagesId = addObject("");
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pageIds: number[] = [];

  pages.forEach((pageLines) => {
    const commands = ["BT", "/F1 10 Tf", "50 760 Td", "14 TL"];
    pageLines.forEach((line, index) => {
      const size = index === 0 ? 15 : index === 1 ? 9 : 10;
      if (index === 0) commands.push(`/F1 ${size} Tf`);
      commands.push(`(${escapePdfText(line)}) Tj`, "0 -14 Td");
    });
    commands.push("ET");
    const stream = commands.join("\n");
    const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function SectionLabel({ children, tone = "lime" }: { children: React.ReactNode; tone?: string }) {
  return <div className={`section-label ${tone}`}><span className="section-dot" />{children}</div>;
}

type StudentSession = { name: string; className: string };
type DisplayQuestion = { prompt: string; options: string[]; correctIndex: number; explanation: string; category: string };
type LocalExport = { filename: string; savedAt: string; name: string; className: string };
const classOptions = ["12 DKV1", "12 DKV2", "12 DKV3"];
const quizCategories = ["Struktur & teks", "Struktur & teks", "Struktur & teks", "Tabel", "Multimedia", "Hyperlink", "Formulir", "Formulir", "Multimedia", "Tabel", "Struktur & teks", "Hyperlink", "Multimedia", "Multimedia", "Struktur & teks", "Struktur & teks", "Formulir", "Hyperlink", "Formulir", "Formulir", "Struktur & teks", "Tabel", "Struktur & teks", "Struktur & teks", "Multimedia"];

function seededHash(value: string) {
  return Array.from(value).reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0, 0) >>> 0;
}

function seededShuffle<T>(items: T[], seed: number) {
  const result = [...items];
  let state = seed || 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function StudentLogin({ onLogin }: { onLogin: (student: StudentSession) => void }) {
  const [name, setName] = useState("");
  const [className, setClassName] = useState(classOptions[0]);
  const [error, setError] = useState("");

  const submitLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim().replace(/\s+/g, " ");
    if (cleanName.length < 2) {
      setError("Masukkan nama lengkap minimal 2 karakter.");
      return;
    }
    onLogin({ name: cleanName, className });
  };

  return <div className="login-shell"><div className="login-grid" /><div className="login-orbit" /><div className="login-card card-surface"><div className="login-brand"><span className="brand-mark"><Code2 size={22} /></span><div className="brand-copy"><strong>Markup<span>Lab</span></strong><small>STUDIO BELAJAR PJJ</small></div></div><SectionLabel>AREA SISWA / PJJ HTML</SectionLabel><h1>Siapa yang<br /><em>sedang belajar?</em></h1><p className="login-lede">Masuk dengan identitasmu untuk memulai modul HTML interaktif kelas XII DKV.</p><form onSubmit={submitLogin} className="login-form"><label htmlFor="student-name">Nama siswa<span>*</span></label><div className="login-input-wrap"><UserRound size={17} /><input id="student-name" value={name} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="Contoh: Alya Putri" autoComplete="name" autoFocus /></div><label htmlFor="student-class">Pilih kelas<span>*</span></label><div className="login-select-wrap"><Layers3 size={17} /><select id="student-class" value={className} onChange={(event) => setClassName(event.target.value)}>{classOptions.map((option) => <option key={option}>{option}</option>)}</select></div>{error && <p className="login-error">{error}</p>}<button type="submit" className="primary-button login-submit">Masuk ke modul <ArrowRight size={17} /></button></form><div className="login-note"><Sparkles size={14} /> Data sesi hanya disimpan di browser perangkat ini.</div></div><div className="login-side-note"><span>HTML / 01</span><strong>Rancang struktur.<br /><i>Hidupkan</i> ide.</strong><small>Modul pembelajaran jarak jauh<br />untuk Desain Komunikasi Visual.</small></div></div>;
}

export default function Home() {
  const activityHeartbeat = trpc.student.heartbeat.useMutation();
  const quizSettingsQuery = trpc.student.quizSettings.useQuery(undefined, { staleTime: 30_000, refetchInterval: 30_000 });
  const quizSettings = quizSettingsQuery.data ?? { durationMinutes: 30, questionCount: 25 };
  const [student, setStudent] = useState<StudentSession | null>(() => {
    try {
      const saved = window.localStorage.getItem("markup-lab-student");
      return saved ? JSON.parse(saved) as StudentSession : null;
    } catch {
      return null;
    }
  });
  const [activeModule, setActiveModule] = useState(0);
  const [code, setCode] = useState(starterCode);
  const [timer, setTimer] = useState(80 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [quizTimer, setQuizTimer] = useState(30 * 60);
  const [quizTimerRunning, setQuizTimerRunning] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [lastLocalExport, setLastLocalExport] = useState<LocalExport | null>(() => {
    try {
      const saved = window.localStorage.getItem("markup-lab-last-quiz-export");
      return saved ? JSON.parse(saved) as LocalExport : null;
    } catch {
      return null;
    }
  });

  const currentModule = modules[activeModule];
  const progress = Math.round((completed.length / modules.length) * 100);
  const displayQuizData = useMemo<DisplayQuestion[]>(() => {
    if (!student) return [];
    const seed = seededHash(`${student.name}::${student.className}`);
    return seededShuffle(quizData.map((question, sourceIndex) => {
      const choices = question[1].map((text, optionIndex) => ({ text, isCorrect: optionIndex === question[2] }));
      const shuffledChoices = seededShuffle(choices, seed + sourceIndex + 1);
      return { prompt: question[0], options: shuffledChoices.map((choice) => choice.text), correctIndex: shuffledChoices.findIndex((choice) => choice.isCorrect), explanation: question[3], category: quizCategories[sourceIndex] ?? "Struktur & teks" };
    }), seed).slice(0, quizSettings.questionCount);
  }, [quizSettings.questionCount, student]);
  const score = useMemo(() => displayQuizData.length ? Math.round((displayQuizData.reduce((total, question, index) => total + (quizAnswers[index] === question.correctIndex ? 1 : 0), 0) / displayQuizData.length) * 100) : 0, [displayQuizData, quizAnswers]);
  const categorySummary = useMemo(() => Array.from(new Set(displayQuizData.map((question) => question.category))).map((category) => {
    const questions = displayQuizData.map((question, index) => ({ question, index })).filter((item) => item.question.category === category);
    const correct = questions.filter((item) => quizAnswers[item.index] === item.question.correctIndex).length;
    return `${category}: ${correct}/${questions.length}`;
  }).join(" · "), [displayQuizData, quizAnswers]);
  const categoryResults = useMemo(() => Array.from(new Set(displayQuizData.map((question) => question.category))).map((category) => {
    const items = displayQuizData.map((question, index) => ({ question, index })).filter((item) => item.question.category === category);
    const correct = items.filter((item) => quizAnswers[item.index] === item.question.correctIndex).length;
    return { category, correct, total: items.length };
  }), [displayQuizData, quizAnswers]);

  const loginStudent = (nextStudent: StudentSession) => {
    setStudent(nextStudent);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizTimer(quizSettings.durationMinutes * 60);
    setQuizTimerRunning(false);
    window.localStorage.setItem("markup-lab-student", JSON.stringify(nextStudent));
  };

  const logoutStudent = () => {
    setStudent(null);
    window.localStorage.removeItem("markup-lab-student");
    setTimerRunning(false);
    setQuizTimerRunning(false);
  };

  const submitQuiz = (automatic = false) => {
    if (!automatic && Object.keys(quizAnswers).length < displayQuizData.length) {
      setToast("Jawab semua soal dulu agar hasil dapat dihitung.");
      return;
    }
    setQuizSubmitted(true);
    setQuizTimerRunning(false);
    setToast(automatic ? "Waktu habis. Jawaban kuis dinilai otomatis." : "Kuis dinilai. Lihat hasilmu di bagian atas.");
  };

  useEffect(() => {
    if (!timerRunning || timer <= 0) return;
    const interval = window.setInterval(() => setTimer((value) => value - 1), 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning, timer]);

  useEffect(() => {
    if (!quizTimerRunning || quizTimer <= 0) return;
    const interval = window.setInterval(() => setQuizTimer((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [quizTimerRunning, quizTimer]);

  useEffect(() => {
    if (!quizTimerRunning && !quizSubmitted) setQuizTimer(quizSettings.durationMinutes * 60);
  }, [quizSettings.durationMinutes, quizSubmitted, quizTimerRunning]);

  useEffect(() => {
    if (timer === 0) {
      setTimerRunning(false);
      setToast("Waktu belajar selesai. Saatnya refleksi!");
    }
  }, [timer]);

  useEffect(() => {
    if (quizTimer === 0 && !quizSubmitted && displayQuizData.length) submitQuiz(true);
  }, [displayQuizData.length, quizSubmitted, quizTimer]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!student) return;
    const sendHeartbeat = () => activityHeartbeat.mutate({
      studentName: student.name,
      className: student.className,
      activityType: quizSubmitted ? "quiz" : "module",
      activityLabel: quizSubmitted ? `Kuis formatif · ${categorySummary}` : currentModule.title,
      progress,
      score: quizSubmitted ? score : null,
    });
    sendHeartbeat();
    const interval = window.setInterval(sendHeartbeat, 5000);
    return () => window.clearInterval(interval);
  }, [student, activeModule, categorySummary, progress, quizSubmitted, score]);

  const formatTimer = `${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(timer % 60).padStart(2, "0")}`;
  const formatQuizTimer = `${String(Math.floor(quizTimer / 60)).padStart(2, "0")}:${String(quizTimer % 60).padStart(2, "0")}`;
  const toggleComplete = (id: number) => {
    setCompleted((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
    setToast(completed.includes(id) ? "Topik ditandai belum selesai." : "Topik selesai — lanjutkan eksplorasi!");
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileNav(false);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setToast("Kode berhasil disalin ke clipboard.");
    } catch {
      setToast("Clipboard tidak tersedia di browser ini.");
    }
  };

  const resetCode = () => {
    setCode(starterCode);
    setToast("Template sandbox dikembalikan ke awal.");
  };

  const downloadSandboxPdf = () => {
    downloadTextPdf("markup-lab-kode-sandbox.pdf", "HASIL PRAKTIK HTML SANDBOX", [
      { heading: "Catatan praktik", body: "Kode berikut adalah snapshot dari editor HTML saat tombol unduh ditekan. Gunakan sebagai lampiran laporan PJJ atau arsip portofolio." },
      { heading: "Kode HTML", body: code },
    ]);
    setToast("PDF kode sandbox sedang diunduh.");
  };

  const downloadQuizPdf = () => {
    const safeStudent = student?.name ?? "siswa";
    const safeClass = student?.className ?? "kelas";
    const filename = `${fileSafe(safeStudent)}_${fileSafe(safeClass)}_HasilKuis.pdf`;
    const savedAt = new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
    const answerSummary = displayQuizData.map((question, index) => {
      const answer = quizAnswers[index];
      const status = answer === question.correctIndex ? "BENAR" : answer === undefined ? "KOSONG" : "KURANG TEPAT";
      return `${String(index + 1).padStart(2, "0")}. [${question.category}] ${status} — Jawaban benar: ${question.options[question.correctIndex]}`;
    }).join("\n");
    downloadTextPdf(filename, "HASIL KUIS FORMATIF HTML", [
      { heading: "Identitas siswa", body: `Nama siswa: ${student?.name ?? "Belum diisi"}\nKelas: ${student?.className ?? "Belum dipilih"}` },
      { heading: "Ringkasan nilai", body: quizSubmitted ? `Skor akhir: ${score}/100. Terima kasih sudah menyelesaikan evaluasi pembelajaran.` : "Kuis belum dikirim. File ini berisi status jawaban sementara." },
      { heading: "Rekap jawaban", body: answerSummary },
    ]);
    const exportRecord = { filename, savedAt, name: safeStudent, className: safeClass };
    setLastLocalExport(exportRecord);
    window.localStorage.setItem("markup-lab-last-quiz-export", JSON.stringify(exportRecord));
    setToast(`PDF tersimpan lokal: ${filename}`);
  };

  if (!student) return <StudentLogin onLogin={loginStudent} />;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
            <button className="brand" onClick={() => scrollTo("top")} aria-label="Kembali ke atas">
            <span className="brand-mark"><Code2 size={19} /></span>
            <span className="brand-copy"><strong>Markup<span>Lab</span></strong><small>STUDIO BELAJAR PJJ</small></span>
          </button>
          <nav className={`main-nav ${mobileNav ? "open" : ""}`}>
            <button onClick={() => scrollTo("alur")}>Alur belajar</button>
            <button onClick={() => scrollTo("materi")}>Materi</button>
            <button onClick={() => scrollTo("sandbox")}>Sandbox</button>
            <button onClick={() => scrollTo("kuis")}>Kuis</button>
          </nav>
          <a className="teacher-link" href="/guru">Portal guru <Activity size={13} /></a>
          <div className="topbar-actions">
            <div className="student-chip"><span>{student.name.slice(0, 1).toUpperCase()}</span><strong>{student.name}</strong><small>{student.className}</small><button onClick={logoutStudent} title="Keluar dari sesi siswa" aria-label="Keluar"><LogOut size={13} /></button></div>
            <div className="timer-pill"><Clock3 size={15} /><span>{formatTimer}</span><button onClick={() => setTimerRunning((running) => !running)} aria-label="Mulai atau jeda timer"><span className={timerRunning ? "pause-icon" : "play-icon"}>{timerRunning ? "Ⅱ" : "▶"}</span></button></div>
            <button className="mobile-menu" onClick={() => setMobileNav((open) => !open)} aria-label="Buka navigasi">{mobileNav ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-grid" />
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="container hero-layout">
            <div className="hero-copy">
              <SectionLabel>MODUL 01 / PEMROGRAMAN WEB</SectionLabel>
              <h1>Rancang struktur.<br /><em>Hidupkan</em> ide.</h1>
              <p className="hero-lede">Ruang belajar interaktif untuk menerjemahkan konsep visual DKV menjadi halaman HTML yang rapi, bermakna, dan siap dipamerkan.</p>
              <div className="hero-cta-row">
                <button className="primary-button" onClick={() => scrollTo("materi")}>Mulai eksplorasi <ArrowRight size={17} /></button>
                <button className="text-button" onClick={() => scrollTo("alur")}><Play size={15} fill="currentColor" /> Lihat alur 80 menit</button>
              </div>
              <div className="hero-meta"><span><span className="avatar-stack"><i>12</i><i>DKV</i><i>+</i></span> Kelas XII DKV</span><span className="meta-divider" /><span><Clock3 size={14} /> 2 JP / 80 menit</span></div>
            </div>
            <div className="hero-card-wrap">
              <div className="hero-card card-surface">
                <div className="card-window-top"><span className="window-dots"><i /><i /><i /></span><span className="window-file"><FileCode2 size={13} /> portfolio.html</span><span className="window-status"><span /> live</span></div>
                <div className="code-preview-lines"><span className="line-number">01</span><span><b className="syntax-tag">&lt;main&gt;</b></span><span className="line-number">02</span><span>&nbsp;&nbsp;<b className="syntax-tag">&lt;h1&gt;</b><b className="syntax-text">Ruang visual</b><b className="syntax-tag">&lt;/h1&gt;</b></span><span className="line-number">03</span><span>&nbsp;&nbsp;<b className="syntax-tag">&lt;p&gt;</b><b className="syntax-text">Membuat makna.</b><b className="syntax-tag">&lt;/p&gt;</b></span><span className="line-number">04</span><span>&nbsp;&nbsp;<b className="syntax-tag">&lt;img</b> <b className="syntax-attr">alt=</b><b className="syntax-string">"ide baru"</b> <b className="syntax-tag">/&gt;</b></span><span className="line-number">05</span><span><b className="syntax-tag">&lt;/main&gt;</b><b className="cursor-blink">|</b></span></div>
                <div className="hero-card-footer"><span><Eye size={13} /> Preview visual</span><span className="footer-accent">semantic / accessible / expressive</span></div>
              </div>
              <div className="float-note note-top"><Sparkles size={14} /><span>Belajar sambil<br /><b>membuat karya</b></span></div>
              <div className="float-note note-bottom"><span className="tiny-bar" /><span>Progress<br /><b>{progress}% tercapai</b></span></div>
            </div>
          </div>
        </section>

        <section id="alur" className="section-block roadmap-section container">
          <div className="section-heading split-heading"><div><SectionLabel tone="violet">RITME PEMBELAJARAN</SectionLabel><h2>80 menit, satu alur<br /><span>yang terasa ringan.</span></h2></div><p>Ikuti ritme ini seperti brief proyek: mulai dari konteks, eksplorasi elemen, praktik, lalu uji pemahaman.</p></div>
          <div className="roadmap-grid">
            {[{time:"00—10", title:"Orientasi", text:"Hubungkan layout DKV dengan struktur HTML.", icon:Target, tone:"violet", label:"01"}, {time:"10—30", title:"Eksplorasi", text:"Buka enam modul elemen dan baca contoh sintaks.", icon:Layers3, tone:"lime", label:"02"}, {time:"30—65", title:"Live sandbox", text:"Rakit mini portofolio dan lihat preview langsung.", icon:TerminalSquare, tone:"orange", label:"03"}, {time:"65—80", title:"Refleksi", text:"Uji pemahaman lewat kuis formatif sepuluh soal.", icon:ClipboardCheck, tone:"pink", label:"04"}].map((item) => { const Icon = item.icon; return <article className={`roadmap-card ${item.tone}`} key={item.label}><div className="roadmap-top"><span className="roadmap-number">{item.label}</span><span className="roadmap-time">{item.time} <small>MENIT</small></span></div><Icon size={22} /><h3>{item.title}</h3><p>{item.text}</p></article>; })}
          </div>
        </section>

        <section id="materi" className="section-block container modules-section">
          <div className="section-heading split-heading"><div><SectionLabel tone="orange">ENAM KOMPONEN INTI</SectionLabel><h2>HTML sebagai<br /><span>kanvas digital.</span></h2></div><p>Setiap topik punya contoh, tips desain, dan ruang untuk kamu tandai setelah dipahami.</p></div>
          <div className="module-layout">
            <aside className="module-list" aria-label="Daftar modul">
              <div className="module-list-head"><span>INDEX / 06</span><span>{completed.length} selesai</span></div>
              {modules.map((item, index) => { const Icon = item.icon; return <button key={item.id} className={`module-item ${activeModule === index ? "active" : ""}`} onClick={() => setActiveModule(index)}><span className={`module-icon ${item.color}`}><Icon size={17} /></span><span className="module-item-copy"><small>0{item.id} / {item.label}</small><strong>{item.title}</strong><em>{item.short}</em></span>{completed.includes(item.id) ? <CheckCircle2 size={17} className="completed-check" /> : <ChevronRight size={16} className="module-arrow" />}</button>; })}
            </aside>
            <div className={`module-detail detail-${currentModule.color}`}>
              <div className="module-detail-head"><div><span className="eyebrow">TOPIK 0{currentModule.id} / 06</span><h3>{currentModule.title}</h3></div><span className="detail-index">{String(currentModule.id).padStart(2, "0")} <span>/ 06</span></span></div>
              <p className="module-description">{currentModule.description}</p>
              <div className="tag-row">{currentModule.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <div className="module-detail-grid"><div className="syntax-card"><div className="mini-label"><Code2 size={13} /> CONTOH SINTAKS</div><pre><code>{currentModule.code}</code></pre></div><div className="tips-card"><div className="mini-label"><Lightbulb size={13} /> CATATAN DESAIN</div><ul>{currentModule.tips.map((tip) => <li key={tip}><span>+</span>{tip}</li>)}</ul><button className={`complete-button ${completed.includes(currentModule.id) ? "done" : ""}`} onClick={() => toggleComplete(currentModule.id)}>{completed.includes(currentModule.id) ? <><Check size={15} /> Selesai dipelajari</> : <>Tandai selesai <ArrowRight size={15} /></>}</button></div></div>
              <div className="module-nav"><button disabled={activeModule === 0} onClick={() => setActiveModule((index) => Math.max(0, index - 1))}><ChevronLeft size={15} /> Sebelumnya</button><button disabled={activeModule === modules.length - 1} onClick={() => setActiveModule((index) => Math.min(modules.length - 1, index + 1))}>Topik berikutnya <ChevronRight size={15} /></button></div>
            </div>
          </div>
        </section>

        <section id="sandbox" className="section-block container sandbox-section">
          <div className="sandbox-banner"><div><SectionLabel tone="lime">PRAKTIK / LIVE HTML SANDBOX</SectionLabel><h2>Rakit. Ubah. <span>Lihat.</span></h2><p>Ubah kode di kiri, lalu amati dampaknya di preview kanan. Tidak perlu takut salah—eksperimen adalah bagian dari desain.</p></div><div className="sandbox-badge"><Zap size={16} /> LIVE PREVIEW</div></div>
          <div className="sandbox-workspace">
            <div className="editor-pane"><div className="pane-head"><span><span className="pane-dot purple" /> editor.html</span><div><button onClick={copyCode} title="Salin kode"><Copy size={14} /></button><button onClick={resetCode} title="Reset template"><RotateCcw size={14} /></button><button onClick={downloadSandboxPdf} title="Unduh kode sebagai PDF"><Download size={14} /></button></div></div><textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} aria-label="Editor kode HTML" /></div>
            <div className="preview-pane"><div className="pane-head"><span><span className="pane-dot green" /> preview / browser</span><span className="preview-live"><span /> updating</span></div><div className="browser-chrome"><span className="browser-dots"><i /><i /><i /></span><span className="browser-url"><span>⌕</span> localhost / portfolio.html</span><ExternalLink size={13} /></div><iframe title="Preview HTML live" srcDoc={code} sandbox="allow-scripts" /></div>
          </div>
          <div className="sandbox-foot"><span><MonitorPlay size={15} /> Coba ubah teks judul, warna, atau tambah satu baris tabel.</span><div className="sandbox-foot-actions"><button onClick={downloadSandboxPdf}><Download size={14} /> Unduh kode PDF</button><button onClick={() => scrollTo("kuis")}>Selesai praktik? Ke kuis <ArrowRight size={15} /></button></div></div>
        </section>

        <section id="kuis" className="section-block container quiz-section">
          <div className="section-heading split-heading"><div><SectionLabel tone="pink">CEK PEMAHAMAN</SectionLabel><h2>Uji diri, <br /><span>tanpa menghakimi.</span></h2></div><p>Sepuluh pertanyaan singkat untuk mengunci konsep. Nilai muncul setelah semua jawaban dikirim.</p></div>
          <div className="quiz-card"><div className="quiz-card-head"><div><span className="eyebrow">FORMATIF / {displayQuizData.length} SOAL</span><h3>Seberapa siap kamu membuat halaman HTML?</h3></div><div className="score-orb">{quizSubmitted ? <><strong>{score}</strong><small>/100</small></> : <CircleHelp size={24} />}</div><div className={`quiz-countdown ${quizTimer <= 300 ? "urgent" : ""}`}><TimerReset size={14} /><span>{formatQuizTimer}</span><small>{quizSettings.durationMinutes} MENIT</small></div></div><div className="quiz-grid">{displayQuizData.map((question, index) => <fieldset className={`question-card ${quizSubmitted ? (quizAnswers[index] === question.correctIndex ? "correct" : "incorrect") : ""}`} key={index}><legend><span>{String(index + 1).padStart(2, "0")}</span>{question.prompt}</legend><div className="answer-options">{question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={`question-${index}`} checked={quizAnswers[index] === optionIndex} onChange={() => { setQuizAnswers((answers) => ({ ...answers, [index]: optionIndex })); setQuizSubmitted(false); setQuizTimerRunning(true); }} /><span>{option}</span></label>)}</div>{quizSubmitted && <div className="answer-note">{quizAnswers[index] === question.correctIndex ? <><CheckCircle2 size={14} /> Benar — {question.explanation}</> : <><CircleHelp size={14} /> Belum tepat — jawaban: <b>{question.options[question.correctIndex]}</b></>}</div>}</fieldset>)}</div>{quizSubmitted && <div className="quiz-review-panel"><div className="quiz-review-heading"><CheckCircle2 size={17} /><div><strong>Pembahasan selesai</strong><span>Jawaban benar ditandai hijau, jawaban yang perlu diperbaiki ditandai ungu. Baca catatan pada setiap soal untuk memahami konsepnya.</span></div></div><div className="quiz-review-categories">{categoryResults.map((result) => <span key={result.category}><b>{result.category}</b><em>{result.correct}/{result.total} benar</em></span>)}</div></div>}<div className="quiz-actions"><span>{Object.keys(quizAnswers).length} / {displayQuizData.length} dijawab</span><div className="quiz-action-buttons"><button className="download-button" onClick={downloadQuizPdf}><Download size={15} /> Unduh hasil PDF</button><a className="drive-button" href="https://drive.google.com/drive/folders/1PFitGIEp-bNsmeZcigpcShSjEBtDsX1T?usp=drive_link" target="_blank" rel="noreferrer"><ExternalLink size={14} /> Buka folder Drive</a><button className="primary-button" onClick={() => { if (Object.keys(quizAnswers).length < 25) { setToast("Jawab semua soal dulu agar hasil dapat dihitung."); return; } setQuizSubmitted(true); setToast("Kuis dinilai. Lihat hasilmu di bagian atas."); }}>Kirim jawaban <ArrowRight size={16} /></button></div></div>{lastLocalExport && <div className="local-export-status"><CheckCircle2 size={15} /><span><b>Simulasi penyimpanan lokal aktif.</b> {lastLocalExport.filename}<small>{lastLocalExport.savedAt} · siap diunggah ke Drive setelah koneksi diaktifkan</small></span></div>}</div>
        </section>

        <section className="final-cta container"><div><SectionLabel tone="violet">NEXT STEP</SectionLabel><h2>Jadikan kode ini<br /><span>bagian dari portofoliomu.</span></h2></div><div className="final-cta-side"><p>Simpan hasil sandbox, tambahkan identitas visualmu, lalu teruskan eksplorasi ke CSS dan JavaScript.</p><button className="outline-button" onClick={() => scrollTo("sandbox")}>Kembali ke sandbox <ArrowUpIcon /></button></div></section>
      </main>

      <footer className="footer"><div className="container footer-inner"><div className="brand footer-brand"><span className="brand-mark"><Code2 size={18} /></span><span className="brand-copy"><strong>Markup<span>Lab</span></strong><small>MODUL PJJ XII DKV</small></span></div><span>Format halaman · teks · tabel · multimedia · hyperlink · formulir</span><span>© 2026 / dibuat untuk belajar</span></div></footer>
      {toast && <div className="toast"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}

function ArrowUpIcon() { return <ArrowDown size={15} className="rotate-up" />; }
