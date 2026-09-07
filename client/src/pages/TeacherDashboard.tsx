import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Activity, ArrowRight, BarChart3, Bell, BookOpenCheck, CheckCircle2, CircleAlert, Clock3, Download, FileText, Filter, Gauge, LogOut, RefreshCw, Save, Search, Settings2, ShieldAlert, Table2, UsersRound, Wifi } from "lucide-react";

const classOptions = ["Semua kelas", "12 DKV1", "12 DKV2", "12 DKV3"];

function formatSeen(value: Date | string) {
  const date = new Date(value);
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function safeFilePart(value: string) {
  return value.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "") || "semua";
}

type QuizHistoryItem = { id: number; score: number | null; activityLabel: string; completedAt: Date | string };
type ExportStudent = { studentName: string; className: string; activityLabel: string; activityType?: string; progress: number; score: number | null; lastSeenAt: Date | string; isOnline: number; quizHistory?: QuizHistoryItem[] };

function downloadCsv(students: ExportStudent[], classFilter: string, filePart = classFilter) {
  const exportedAt = new Date().toLocaleString("id-ID");
  const rows: unknown[][] = [
    ["Rekap Aktivitas dan Nilai Siswa — MarkupLab"],
    [`Filter kelas: ${classFilter}`, `Diekspor: ${exportedAt}`],
    [],
    ["Nama siswa", "Kelas", "Aktivitas terakhir", "Jenis aktivitas", "Progress (%)", "Nilai kuis terakhir", "Riwayat nilai kuis", "Terakhir terlihat", "Status"],
    ...students.map((student) => [student.studentName, student.className, student.activityLabel, student.activityType ?? "", student.progress, student.score ?? "", (student.quizHistory ?? []).map((quiz) => `${quiz.score}/100 (${new Date(quiz.completedAt).toLocaleDateString("id-ID")})`).join(" | "), new Date(student.lastSeenAt).toLocaleString("id-ID"), student.isOnline ? "Online" : "Offline"]),
  ];
  const content = "\ufeff" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Rekap_${safeFilePart(filePart)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function pdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function downloadPdf(students: ExportStudent[], classFilter: string, filePart = classFilter) {
  const individual = students.length === 1;
  const student = students[0];
  const lines = individual && student ? [
    "[ LOGO SEKOLAH ]  SMK DESAIN KOMUNIKASI VISUAL",
    "LAPORAN INDIVIDUAL HASIL BELAJAR HTML",
    "",
    `Nama siswa: ${student.studentName}`,
    `Kelas: ${student.className}`,
    `Progress modul: ${student.progress}%`,
    `Status terakhir: ${student.isOnline ? "Online" : "Offline"}`,
    `Aktivitas terakhir: ${student.activityLabel}`,
    `Diekspor: ${new Date().toLocaleString("id-ID")}`,
    "",
    "RIWAYAT NILAI KUIS",
    ...((student.quizHistory ?? []).length ? (student.quizHistory ?? []).map((quiz, index) => `${String(index + 1).padStart(2, "0")}. ${quiz.score ?? "-"}/100 | ${new Date(quiz.completedAt).toLocaleString("id-ID")} | ${quiz.activityLabel}`) : ["Belum ada riwayat kuis yang tersimpan."]),
    "",
    "Tanda tangan guru,",
    "",
    "",
    "____________________________",
    "Nama guru: __________________",
  ] : [
    "MARKUPLAB — REKAP AKTIVITAS SISWA",
    `Filter kelas: ${classFilter}`,
    `Diekspor: ${new Date().toLocaleString("id-ID")}`,
    `Total siswa: ${students.length}`,
    "",
    ...students.map((item, index) => `${String(index + 1).padStart(2, "0")}. ${item.studentName} | ${item.className} | ${item.progress}% | Nilai: ${item.score ?? "-"} | ${item.isOnline ? "ONLINE" : "OFFLINE"} | ${item.activityLabel} | ${formatSeen(item.lastSeenAt)}`),
  ];
  const content = ["BT", "/F1 9 Tf", "40 800 Td", ...lines.flatMap((line) => [`(${pdfText(line)}) Tj`, "0 -15 Td"]), "ET"].join("\n");
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", `<< /Length ${content.length} >>\nstream\n${content}\nendstream`];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Rekap_${safeFilePart(filePart)}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function TeacherDashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [classFilter, setClassFilter] = useState(classOptions[0]);
  const [search, setSearch] = useState("");
  const [quizSearch, setQuizSearch] = useState("");
  const [quizClassFilter, setQuizClassFilter] = useState(classOptions[0]);
  const [quizScoreFilter, setQuizScoreFilter] = useState("Semua nilai");
  const [durationDraft, setDurationDraft] = useState(30);
  const [questionCountDraft, setQuestionCountDraft] = useState(25);
  const overview = trpc.teacher.liveOverview.useQuery(undefined, { enabled: Boolean(user), refetchInterval: 5000, refetchOnWindowFocus: true });
  const quizSettingsQuery = trpc.teacher.quizSettings.useQuery(undefined, { enabled: Boolean(user), refetchOnWindowFocus: false });
  const updateQuizSettings = trpc.teacher.updateQuizSettings.useMutation({ onSuccess: () => { void quizSettingsQuery.refetch(); setToast("Pengaturan kuis berhasil disimpan."); } });

  const [toast, setToast] = useState("");

  useEffect(() => {
    if (quizSettingsQuery.data) {
      setDurationDraft(quizSettingsQuery.data.durationMinutes);
      setQuestionCountDraft(quizSettingsQuery.data.questionCount);
    }
  }, [quizSettingsQuery.data]);

  const students = useMemo(() => {
    const list = overview.data?.students ?? [];
    return list.filter((student) => {
      const matchesClass = classFilter === "Semua kelas" || student.className === classFilter;
      const matchesSearch = student.studentName.toLowerCase().includes(search.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [classFilter, search, overview.data?.students]);

  const quizHistoryRows = useMemo(() => (overview.data?.students ?? []).reduce<Array<{ id: number; studentName: string; className: string; score: number; activityLabel: string; completedAt: Date | string }>>((rows, student) => {
    student.quizHistory.forEach((quiz) => rows.push({ studentName: student.studentName, className: student.className, score: quiz.score ?? 0, activityLabel: quiz.activityLabel, completedAt: quiz.completedAt, id: quiz.id }));
    return rows;
  }, []), [overview.data?.students]);

  const filteredQuizHistory = useMemo(() => quizHistoryRows.filter((quiz) => {
    const matchesName = quiz.studentName.toLowerCase().includes(quizSearch.toLowerCase());
    const matchesClass = quizClassFilter === "Semua kelas" || quiz.className === quizClassFilter;
    const matchesScore = quizScoreFilter === "Semua nilai" || (quizScoreFilter === "Nilai tinggi (80–100)" && quiz.score >= 80) || (quizScoreFilter === "Nilai sedang (60–79)" && quiz.score >= 60 && quiz.score < 80) || (quizScoreFilter === "Perlu pendampingan (<60)" && quiz.score < 60);
    return matchesName && matchesClass && matchesScore;
  }), [quizClassFilter, quizHistoryRows, quizScoreFilter, quizSearch]);

  const lowScoreAlerts = useMemo(() => quizHistoryRows.filter((quiz) => quiz.score < 60).slice(0, 8), [quizHistoryRows]);

  const categoryChart = useMemo(() => {
    const totals = new Map<string, { correct: number; total: number }>();
    quizHistoryRows.forEach((quiz) => {
      quiz.activityLabel.split(" · ").slice(1).forEach((part) => {
        const match = part.match(/^(.+): (\d+)\/(\d+)$/);
        if (!match) return;
        const current = totals.get(match[1]) ?? { correct: 0, total: 0 };
        current.correct += Number(match[2]);
        current.total += Number(match[3]);
        totals.set(match[1], current);
      });
    });
    return Array.from(totals.entries()).map(([category, values]) => ({ category, percent: values.total ? Math.round((values.correct / values.total) * 100) : 0, correct: values.correct, total: values.total }));
  }, [quizHistoryRows]);

  const classScoreChart = useMemo(() => classOptions.slice(1).map((className) => {
    const attempts = quizHistoryRows.filter((quiz) => quiz.className === className);
    const average = attempts.length ? Math.round(attempts.reduce((sum, quiz) => sum + quiz.score, 0) / attempts.length) : 0;
    return { className, average, attempts };
  }), [quizHistoryRows]);

  if (loading) return <div className="teacher-loading"><RefreshCw className="spin" size={20} /> Menyiapkan portal guru…</div>;
  if (!user) return null;
  if (user.role !== "admin") return <div className="teacher-denied"><ShieldAlert size={30} /><h1>Akses guru diperlukan</h1><p>Akun ini belum memiliki peran admin. Minta administrator project untuk mengaktifkan akses dashboard guru.</p><button className="teacher-outline-button" onClick={() => void logout()}>Keluar</button></div>;

  const totals = overview.data?.totals ?? { active: 0, tracked: 0, averageProgress: 0 };
  const exportCurrentCsv = () => downloadCsv(students, classFilter);
  const exportCurrentPdf = () => downloadPdf(students, classFilter);

  return <div className="teacher-shell"><aside className="teacher-sidebar"><div className="teacher-logo"><span className="teacher-logo-mark">&lt;/&gt;</span><span><b>Markup<span>Lab</span></b><small>TEACHER CONSOLE</small></span></div><div className="teacher-sidebar-label">MONITORING</div><div className="teacher-side-active"><Activity size={16} /> Live activity</div><div className="teacher-sidebar-spacer" /><div className="teacher-side-user"><span className="teacher-avatar">{(user.name ?? "G").slice(0, 1).toUpperCase()}</span><span><b>{user.name ?? "Guru"}</b><small>Administrator</small></span><button onClick={() => void logout()} title="Keluar"><LogOut size={14} /></button></div></aside><main className="teacher-main"><header className="teacher-header"><div><span className="teacher-kicker"><span className="live-dot" /> REAL-TIME CLASSROOM</span><h1>Aktivitas siswa</h1><p>Pantau ritme belajar kelas HTML secara langsung.</p></div><div className="teacher-refresh"><span><Wifi size={14} /> Auto-refresh 5 detik</span><button onClick={() => void overview.refetch()}><RefreshCw size={15} className={overview.isFetching ? "spin" : ""} /> Refresh</button></div></header><section className="teacher-stats"><article><span className="stat-icon green"><UsersRound size={18} /></span><div><small>SISWA ONLINE</small><strong>{totals.active}</strong></div><em>45 detik terakhir</em></article><article><span className="stat-icon purple"><BookOpenCheck size={18} /></span><div><small>TERPANTAU</small><strong>{totals.tracked}</strong></div><em>nama / kelas unik</em></article><article><span className="stat-icon orange"><Gauge size={18} /></span><div><small>RATA-RATA PROGRESS</small><strong>{totals.averageProgress}%</strong></div><em>modul pembelajaran</em></article></section><section className="low-score-alert-panel"><div className="low-score-alert-head"><div><span className="teacher-kicker"><Bell size={13} /> NOTIFIKASI PENDAMPINGAN</span><h2>Perlu perhatian guru</h2><p>Notifikasi otomatis dari hasil kuis terbaru di bawah 60.</p></div><span className="alert-count"><CircleAlert size={14} /> {lowScoreAlerts.length} siswa perlu ditinjau</span></div>{lowScoreAlerts.length === 0 ? <div className="alert-empty"><CheckCircle2 size={18} /> Belum ada notifikasi nilai rendah.</div> : <div className="low-score-alert-list">{lowScoreAlerts.map((alert) => <article className="low-score-alert" key={alert.id}><span className="alert-score">{alert.score}</span><div><strong>{alert.studentName} <em>{alert.className}</em></strong><p>{alert.activityLabel}</p><small>{new Date(alert.completedAt).toLocaleString("id-ID")} · Disarankan pendampingan</small></div><button onClick={() => { setQuizSearch(alert.studentName); setQuizClassFilter(alert.className); setQuizScoreFilter("Perlu pendampingan (<60)"); document.querySelector(".quiz-history-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Lihat riwayat <ArrowRight size={13} /></button></article>)}</div>}</section><section className="teacher-tools-grid"><section className="category-chart-panel"><div className="activity-panel-head"><div><span className="teacher-kicker"><BarChart3 size={13} /> ANALISIS PEMAHAMAN</span><h2>Pemahaman per kategori</h2><p>Rata-rata jawaban benar berdasarkan ringkasan kuis siswa.</p></div></div>{categoryChart.length === 0 ? <div className="teacher-empty chart-empty"><BarChart3 size={22} /><b>Grafik belum tersedia</b><span>Grafik muncul setelah siswa menyelesaikan kuis.</span></div> : <div className="category-chart-list">{categoryChart.map((item) => <div className="category-chart-row" key={item.category}><div className="category-chart-label"><span>{item.category}</span><b>{item.percent}%</b></div><div className="category-bar-track"><span style={{ width: `${item.percent}%` }} /></div><small>{item.correct} jawaban benar dari {item.total}</small></div>)}</div>}</section><section className="quiz-settings-panel"><div className="activity-panel-head"><div><span className="teacher-kicker"><Settings2 size={13} /> KONTROL KUIS</span><h2>Pengaturan kuis</h2><p>Perubahan berlaku untuk sesi siswa berikutnya.</p></div></div><div className="quiz-settings-form"><label>Durasi timer (menit)<input type="number" min="5" max="120" value={durationDraft} onChange={(event) => setDurationDraft(Number(event.target.value))} /></label><label>Jumlah soal<input type="number" min="5" max="25" value={questionCountDraft} onChange={(event) => setQuestionCountDraft(Number(event.target.value))} /></label><button onClick={() => updateQuizSettings.mutate({ durationMinutes: Math.min(120, Math.max(5, durationDraft)), questionCount: Math.min(25, Math.max(5, questionCountDraft)) })} disabled={updateQuizSettings.isPending}><Save size={14} /> {updateQuizSettings.isPending ? "Menyimpan…" : "Simpan pengaturan"}</button><small>Bank soal tersedia: 25 soal · rentang timer 5–120 menit</small></div></section></section><section className="class-score-panel"><div className="activity-panel-head"><div><span className="teacher-kicker"><BarChart3 size={13} /> PERFORMA KELAS</span><h2>Perbandingan nilai rata-rata</h2><p>Rata-rata seluruh percobaan kuis untuk memantau performa 12 DKV1, 12 DKV2, dan 12 DKV3.</p></div><span className="updated-at"><BookOpenCheck size={13} /> {quizHistoryRows.length} percobaan</span></div><div className="class-score-chart">{classScoreChart.map((item) => <div className="class-score-row" key={item.className}><div className="class-score-label"><span>{item.className}</span><b>{item.attempts.length ? `${item.average}/100` : "Belum ada data"}</b></div><div className="class-score-track"><span style={{ width: `${item.average}%` }} /></div><small>{item.attempts.length ? `${item.attempts.length} percobaan · ${item.average >= 80 ? "Performa tinggi" : item.average >= 60 ? "Perlu penguatan" : "Perlu pendampingan"}` : "Menunggu siswa menyelesaikan kuis"}</small></div>)}</div></section><section className="teacher-toolbar"><div className="teacher-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama siswa…" /></div><div className="teacher-filter"><Filter size={14} /><select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>{classOptions.map((option) => <option key={option}>{option}</option>)}</select></div><span className="teacher-result-count">{students.length} siswa terlihat</span><div className="teacher-export-actions"><button onClick={exportCurrentCsv} disabled={!students.length}><Table2 size={13} /> CSV</button><button onClick={exportCurrentPdf} disabled={!students.length}><FileText size={13} /> PDF</button></div></section><section className="activity-panel"><div className="activity-panel-head"><div><h2>Live student feed</h2><p>Aktivitas terbaru berdasarkan heartbeat dari perangkat siswa.</p></div><span className="updated-at"><Clock3 size={13} /> {overview.data?.refreshedAt ? `Diperbarui ${formatSeen(overview.data.refreshedAt)}` : "Menunggu data"}</span></div>{overview.isLoading ? <div className="teacher-empty"><RefreshCw className="spin" size={18} /> Mengambil aktivitas…</div> : overview.error ? <div className="teacher-empty error"><ShieldAlert size={18} /> Dashboard memerlukan akun admin dan koneksi database aktif.</div> : students.length === 0 ? <div className="teacher-empty"><UsersRound size={22} /><b>Belum ada aktivitas siswa</b><span>Siswa akan muncul setelah membuka modul dan mengirim heartbeat.</span></div> : <div className="student-table-wrap"><table className="student-table"><thead><tr><th>SISWA</th><th>KELAS</th><th>AKTIVITAS TERKINI</th><th>PROGRESS</th><th>TERAKHIR TERLIHAT</th><th>STATUS</th><th>LAPORAN</th></tr></thead><tbody>{students.map((student) => <tr key={`${student.studentName}-${student.className}`}><td><div className="student-name-cell"><span>{student.studentName.slice(0, 1).toUpperCase()}</span><b>{student.studentName}</b></div></td><td><span className="class-badge">{student.className}</span></td><td><div className="activity-cell"><strong>{student.activityLabel}</strong><small>{student.activityType === "quiz" ? "Evaluasi formatif" : "Eksplorasi modul"}{student.score !== null ? ` · skor ${student.score}` : ""}</small>{student.quizHistory.length > 0 && <details className="quiz-history"><summary>Riwayat kuis ({student.quizHistory.length})</summary><div>{student.quizHistory.map((quiz) => <span key={quiz.id}>{quiz.score}/100 · {new Date(quiz.completedAt).toLocaleDateString("id-ID")}</span>)}</div></details>}</div></td><td><div className="progress-cell"><div><span style={{ width: `${student.progress}%` }} /></div><b>{student.progress}%</b></div></td><td><span className="seen-time">{formatSeen(student.lastSeenAt)}</span></td><td><span className={`online-status ${student.isOnline ? "online" : "offline"}`}><i />{student.isOnline ? "Online" : "Offline"}</span></td><td><div className="student-export-actions"><button title={`Unduh CSV ${student.studentName}`} onClick={() => downloadCsv([student], student.className, student.studentName)}><Table2 size={12} /></button><button title={`Unduh PDF ${student.studentName}`} onClick={() => downloadPdf([student], student.className, student.studentName)}><FileText size={12} /></button></div></td></tr>)}</tbody></table></div>}</section><section className="quiz-history-panel"><div className="activity-panel-head"><div><h2>Riwayat nilai kuis</h2><p>Telusuri semua percobaan kuis yang tersimpan berdasarkan siswa, kelas, dan rentang nilai.</p></div><span className="updated-at"><BookOpenCheck size={13} /> {filteredQuizHistory.length} hasil</span></div><div className="quiz-history-toolbar"><div className="teacher-search"><Search size={15} /><input value={quizSearch} onChange={(event) => setQuizSearch(event.target.value)} placeholder="Cari nama siswa…" /></div><div className="teacher-filter"><Filter size={14} /><select value={quizClassFilter} onChange={(event) => setQuizClassFilter(event.target.value)}>{classOptions.map((option) => <option key={option}>{option}</option>)}</select></div><div className="teacher-filter"><Gauge size={14} /><select value={quizScoreFilter} onChange={(event) => setQuizScoreFilter(event.target.value)}><option>Semua nilai</option><option>Nilai tinggi (80–100)</option><option>Nilai sedang (60–79)</option><option>Perlu pendampingan (&lt;60)</option></select></div></div>{filteredQuizHistory.length === 0 ? <div className="teacher-empty quiz-history-empty"><BookOpenCheck size={22} /><b>Riwayat kuis tidak ditemukan</b><span>Coba ubah nama, kelas, atau rentang nilai.</span></div> : <div className="quiz-history-table-wrap"><table className="student-table quiz-history-table"><thead><tr><th>SISWA</th><th>KELAS</th><th>NILAI</th><th>HASIL EVALUASI</th><th>WAKTU</th></tr></thead><tbody>{filteredQuizHistory.map((quiz) => <tr key={quiz.id}><td><div className="student-name-cell"><span>{quiz.studentName.slice(0, 1).toUpperCase()}</span><b>{quiz.studentName}</b></div></td><td><span className="class-badge">{quiz.className}</span></td><td><span className={`score-badge ${quiz.score >= 80 ? "high" : quiz.score >= 60 ? "medium" : "low"}`}>{quiz.score}/100</span></td><td><span className="quiz-result-label">{quiz.score >= 80 ? "Tuntas" : quiz.score >= 60 ? "Perlu penguatan" : "Perlu pendampingan"}</span><small className="quiz-result-detail">{quiz.activityLabel}</small></td><td><span className="seen-time">{new Date(quiz.completedAt).toLocaleString("id-ID")}</span></td></tr>)}</tbody></table></div>}</section><footer className="teacher-footer"><CheckCircle2 size={14} /> Data aktivitas disimpan aman di database project · update otomatis setiap 5 detik</footer>{toast && <div className="teacher-toast"><CheckCircle2 size={14} /> {toast}</div>}</main></div>;
}
