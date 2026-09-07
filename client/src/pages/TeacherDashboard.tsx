import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Activity, BookOpenCheck, CheckCircle2, Clock3, Filter, Gauge, LogOut, RefreshCw, Search, ShieldAlert, UsersRound, Wifi } from "lucide-react";

const classOptions = ["Semua kelas", "12 DK1", "12 DKV2", "12 DKV3"];

function formatSeen(value: Date | string) {
  const date = new Date(value);
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function TeacherDashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [classFilter, setClassFilter] = useState(classOptions[0]);
  const [search, setSearch] = useState("");
  const overview = trpc.teacher.liveOverview.useQuery(undefined, { enabled: Boolean(user), refetchInterval: 5000, refetchOnWindowFocus: true });

  const students = useMemo(() => {
    const list = overview.data?.students ?? [];
    return list.filter((student) => {
      const matchesClass = classFilter === "Semua kelas" || student.className === classFilter;
      const matchesSearch = student.studentName.toLowerCase().includes(search.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [classFilter, search, overview.data?.students]);

  if (loading) return <div className="teacher-loading"><RefreshCw className="spin" size={20} /> Menyiapkan portal guru…</div>;
  if (!user) return null;
  if (user.role !== "admin") return <div className="teacher-denied"><ShieldAlert size={30} /><h1>Akses guru diperlukan</h1><p>Akun ini belum memiliki peran admin. Minta administrator project untuk mengaktifkan akses dashboard guru.</p><button className="teacher-outline-button" onClick={() => void logout()}>Keluar</button></div>;

  const totals = overview.data?.totals ?? { active: 0, tracked: 0, averageProgress: 0 };

  return <div className="teacher-shell"><aside className="teacher-sidebar"><div className="teacher-logo"><span className="teacher-logo-mark">&lt;/&gt;</span><span><b>Markup<span>Lab</span></b><small>TEACHER CONSOLE</small></span></div><div className="teacher-sidebar-label">MONITORING</div><div className="teacher-side-active"><Activity size={16} /> Live activity</div><div className="teacher-sidebar-spacer" /><div className="teacher-side-user"><span className="teacher-avatar">{(user.name ?? "G").slice(0, 1).toUpperCase()}</span><span><b>{user.name ?? "Guru"}</b><small>Administrator</small></span><button onClick={() => void logout()} title="Keluar"><LogOut size={14} /></button></div></aside><main className="teacher-main"><header className="teacher-header"><div><span className="teacher-kicker"><span className="live-dot" /> REAL-TIME CLASSROOM</span><h1>Aktivitas siswa</h1><p>Pantau ritme belajar kelas HTML secara langsung.</p></div><div className="teacher-refresh"><span><Wifi size={14} /> Auto-refresh 5 detik</span><button onClick={() => void overview.refetch()}><RefreshCw size={15} className={overview.isFetching ? "spin" : ""} /> Refresh</button></div></header><section className="teacher-stats"><article><span className="stat-icon green"><UsersRound size={18} /></span><div><small>SISWA ONLINE</small><strong>{totals.active}</strong></div><em>45 detik terakhir</em></article><article><span className="stat-icon purple"><BookOpenCheck size={18} /></span><div><small>TERPANTAU</small><strong>{totals.tracked}</strong></div><em>nama / kelas unik</em></article><article><span className="stat-icon orange"><Gauge size={18} /></span><div><small>RATA-RATA PROGRESS</small><strong>{totals.averageProgress}%</strong></div><em>modul pembelajaran</em></article></section><section className="teacher-toolbar"><div className="teacher-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama siswa…" /></div><div className="teacher-filter"><Filter size={14} /><select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>{classOptions.map((option) => <option key={option}>{option}</option>)}</select></div><span className="teacher-result-count">{students.length} siswa terlihat</span></section><section className="activity-panel"><div className="activity-panel-head"><div><h2>Live student feed</h2><p>Aktivitas terbaru berdasarkan heartbeat dari perangkat siswa.</p></div><span className="updated-at"><Clock3 size={13} /> {overview.data?.refreshedAt ? `Diperbarui ${formatSeen(overview.data.refreshedAt)}` : "Menunggu data"}</span></div>{overview.isLoading ? <div className="teacher-empty"><RefreshCw className="spin" size={18} /> Mengambil aktivitas…</div> : overview.error ? <div className="teacher-empty error"><ShieldAlert size={18} /> Dashboard memerlukan akun admin dan koneksi database aktif.</div> : students.length === 0 ? <div className="teacher-empty"><UsersRound size={22} /><b>Belum ada aktivitas siswa</b><span>Siswa akan muncul setelah membuka modul dan mengirim heartbeat.</span></div> : <div className="student-table-wrap"><table className="student-table"><thead><tr><th>SISWA</th><th>KELAS</th><th>AKTIVITAS TERKINI</th><th>PROGRESS</th><th>TERAKHIR TERLIHAT</th><th>STATUS</th></tr></thead><tbody>{students.map((student) => <tr key={`${student.studentName}-${student.className}`}><td><div className="student-name-cell"><span>{student.studentName.slice(0, 1).toUpperCase()}</span><b>{student.studentName}</b></div></td><td><span className="class-badge">{student.className}</span></td><td><div className="activity-cell"><strong>{student.activityLabel}</strong><small>{student.activityType === "quiz" ? "Evaluasi formatif" : "Eksplorasi modul"}{student.score !== null ? ` · skor ${student.score}` : ""}</small></div></td><td><div className="progress-cell"><div><span style={{ width: `${student.progress}%` }} /></div><b>{student.progress}%</b></div></td><td><span className="seen-time">{formatSeen(student.lastSeenAt)}</span></td><td><span className={`online-status ${student.isOnline ? "online" : "offline"}`}><i />{student.isOnline ? "Online" : "Offline"}</span></td></tr>)}</tbody></table></div>}</section><footer className="teacher-footer"><CheckCircle2 size={14} /> Data aktivitas disimpan aman di database project · update otomatis setiap 5 detik</footer></main></div>;
}
