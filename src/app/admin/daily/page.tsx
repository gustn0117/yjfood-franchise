"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface Client {
  id: string;
  name: string;
  project: string;
  price: string;
  address: string;
}

interface DailyTask {
  id: string;
  clientId: string;
  date: string;
  content: string;
  done: boolean;
}

const ADMIN_PASSWORD = "1234";

export default function DailyPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newTask, setNewTask] = useState("");
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientForm, setClientForm] = useState({ name: "", project: "", price: "", address: "" });
  const printRef = useRef<HTMLDivElement>(null);

  const fetchClients = useCallback(async () => {
    const res = await fetch("/api/clients");
    setClients(await res.json());
  }, []);

  const fetchTasks = useCallback(async (clientId: string, d: string) => {
    const res = await fetch(`/api/daily-tasks?clientId=${clientId}&date=${d}`);
    setTasks(await res.json());
  }, []);

  useEffect(() => {
    if (authed) fetchClients();
  }, [authed, fetchClients]);

  useEffect(() => {
    if (selected) fetchTasks(selected.id, date);
  }, [selected, date, fetchTasks]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(false); }
    else setPwError(true);
  };

  const addClient = async () => {
    if (!clientForm.name) return;
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientForm),
    });
    const c = await res.json();
    setClients((prev) => [c, ...prev]);
    setSelected(c);
    setClientForm({ name: "", project: "", price: "", address: "" });
    setShowAddClient(false);
  };

  const deleteClient = async (id: string) => {
    if (!confirm("클라이언트를 삭제하시겠습니까?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (selected?.id === id) { setSelected(null); setTasks([]); }
  };

  const addTask = async () => {
    if (!newTask.trim() || !selected) return;
    const res = await fetch("/api/daily-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selected.id, date, content: newTask }),
    });
    const t = await res.json();
    setTasks((prev) => [...prev, t]);
    setNewTask("");
  };

  const toggleTask = async (id: string, done: boolean) => {
    await fetch(`/api/daily-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !done }),
    });
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !done } : t)));
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/daily-tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>데일리 업무 - ${selected?.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Pretendard', -apple-system, sans-serif; padding: 40px; color: #1a1a1a; }
  .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 3px solid #d4380d; }
  .header h1 { font-size: 28px; font-weight: 900; color: #d4380d; margin-bottom: 4px; }
  .header .date { font-size: 14px; color: #888; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 32px; margin-bottom: 32px; padding: 20px; background: #fdf2e9; border-radius: 12px; }
  .info-item { display: flex; gap: 8px; }
  .info-label { font-size: 13px; font-weight: 700; color: #888; min-width: 72px; }
  .info-value { font-size: 13px; color: #1a1a1a; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #d4380d; color: white; font-size: 13px; font-weight: 700; padding: 10px 16px; text-align: left; }
  th:first-child { width: 48px; text-align: center; border-radius: 8px 0 0 0; }
  th:last-child { border-radius: 0 8px 0 0; width: 80px; text-align: center; }
  td { padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #eee; }
  td:first-child { text-align: center; font-weight: 700; color: #d4380d; }
  td:last-child { text-align: center; }
  tr:nth-child(even) { background: #fafafa; }
  .done { text-decoration: line-through; color: #aaa; }
  .check { color: #22c55e; font-weight: 700; }
  .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #bbb; padding-top: 16px; border-top: 1px solid #eee; }
  @media print { body { padding: 20px; } }
</style></head><body>`);
    win.document.write(`
      <div class="header">
        <h1>YJF&B 데일리 업무</h1>
        <p class="date">${formatDateKR(date)}</p>
      </div>
      <div class="info-grid">
        <div class="info-item"><span class="info-label">클라이언트</span><span class="info-value">${selected?.name || ""}</span></div>
        <div class="info-item"><span class="info-label">프로젝트</span><span class="info-value">${selected?.project || "-"}</span></div>
        <div class="info-item"><span class="info-label">단가</span><span class="info-value">${selected?.price || "-"}</span></div>
        <div class="info-item"><span class="info-label">주소</span><span class="info-value">${selected?.address || "-"}</span></div>
      </div>
      <table>
        <thead><tr><th>No.</th><th>업무 내용</th><th>완료</th></tr></thead>
        <tbody>
          ${tasks.map((t, i) => `<tr>
            <td>${i + 1}</td>
            <td class="${t.done ? "done" : ""}">${t.content}</td>
            <td>${t.done ? '<span class="check">&#10003;</span>' : ""}</td>
          </tr>`).join("")}
          ${tasks.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:#aaa;padding:24px;">등록된 업무가 없습니다.</td></tr>' : ""}
        </tbody>
      </table>
      <div class="footer">&copy; ${new Date().getFullYear()} YJF&B. All rights reserved.</div>
    `);
    win.document.write("</body></html>");
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  const filtered = clients.filter(
    (c) => c.name.includes(search) || c.project.includes(search)
  );

  const formatDateKR = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${y}년 ${Number(m)}월 ${Number(day)}일`;
  };

  /* ──── Login ──── */
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, #d4380d, #f97316)" }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">데일리 업무 관리</h1>
            <p className="text-sm text-gray-500 mt-1">YJF&B Daily Task</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
            <input
              type="password" value={pw}
              onChange={(e) => { setPw(e.target.value); setPwError(false); }}
              placeholder="비밀번호를 입력하세요"
              className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-center text-lg tracking-widest ${pwError ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-orange-400"}`}
              autoFocus
            />
            {pwError && <p className="text-red-500 text-sm mt-2 text-center">비밀번호가 올바르지 않습니다.</p>}
          </div>
          <button type="submit" className="w-full py-3.5 rounded-xl text-white font-bold transition-all hover:scale-[1.02] hover:shadow-lg" style={{ background: "linear-gradient(135deg, #d4380d, #f97316)" }}>
            로그인
          </button>
        </form>
      </div>
    );
  }

  /* ──── Main ──── */
  return (
    <div className="min-h-screen" style={{ background: "#f5f5f7" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-gray-200" style={{ background: "rgba(255,255,255,0.85)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #d4380d, #f97316)" }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">데일리 업무</h1>
              <p className="text-xs text-gray-500">YJF&B Daily Task</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">문의 관리</a>
            <button onClick={() => { setAuthed(false); setPw(""); }} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">로그아웃</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left: Client List ── */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="클라이언트 검색..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-orange-400 text-sm transition-colors"
              />
            </div>

            {/* Add Client Button */}
            <button onClick={() => setShowAddClient(!showAddClient)} className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #d4380d, #f97316)" }}>
              + 클라이언트 추가
            </button>

            {/* Add Client Form */}
            {showAddClient && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                <input value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} placeholder="클라이언트명 *" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-orange-400" />
                <input value={clientForm.project} onChange={(e) => setClientForm({ ...clientForm, project: e.target.value })} placeholder="프로젝트명" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-orange-400" />
                <input value={clientForm.price} onChange={(e) => setClientForm({ ...clientForm, price: e.target.value })} placeholder="단가 (예: 150만원)" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-orange-400" />
                <input value={clientForm.address} onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} placeholder="주소" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-orange-400" />
                <div className="flex gap-2">
                  <button onClick={addClient} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors">등록</button>
                  <button onClick={() => setShowAddClient(false)} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">취소</button>
                </div>
              </div>
            )}

            {/* Client List */}
            <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md group ${
                    selected?.id === c.id ? "border-orange-300 bg-orange-50/60 shadow-md" : "border-gray-100 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{c.name}</p>
                      {c.project && <p className="text-xs text-gray-400 mt-0.5 truncate">{c.project}</p>}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteClient(c.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">
                  {search ? "검색 결과가 없습니다." : "클라이언트를 추가하세요."}
                </p>
              )}
            </div>
          </div>

          {/* ── Right: Task Area ── */}
          <div className="lg:col-span-8 xl:col-span-9" ref={printRef}>
            {selected ? (
              <div className="space-y-6">
                {/* Client Info Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selected.name}</h2>
                      {selected.project && <p className="text-gray-500 mt-0.5">{selected.project}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="date" value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400"
                      />
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                        style={{ background: "linear-gradient(135deg, #d4380d, #f97316)" }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        PDF 출력
                      </button>
                    </div>
                  </div>

                  {/* Client Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "클라이언트", value: selected.name },
                      { label: "프로젝트", value: selected.project || "-" },
                      { label: "단가", value: selected.price || "-" },
                      { label: "주소", value: selected.address || "-" },
                    ].map((item) => (
                      <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                        <p className="text-[11px] font-bold text-gray-400 mb-1">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Task */}
                <div className="flex gap-3">
                  <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    placeholder="할 일을 입력하세요..."
                    className="flex-1 px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-orange-400 transition-colors"
                  />
                  <button
                    onClick={addTask}
                    className="px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg, #d4380d, #f97316)" }}
                  >
                    추가
                  </button>
                </div>

                {/* Task Table */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">
                      {formatDateKR(date)} 업무 목록
                      <span className="ml-2 text-sm font-normal text-gray-400">{tasks.length}건</span>
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-600 font-semibold">{tasks.filter((t) => t.done).length} 완료</span>
                      <span className="text-gray-300">/</span>
                      <span className="text-gray-500">{tasks.length} 전체</span>
                    </div>
                  </div>

                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wider">
                        <th className="w-14 py-3 text-center">No.</th>
                        <th className="py-3 text-left px-4">업무 내용</th>
                        <th className="w-20 py-3 text-center">완료</th>
                        <th className="w-16 py-3 text-center">삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((t, i) => (
                        <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 text-center text-sm font-bold" style={{ color: "#d4380d" }}>{i + 1}</td>
                          <td className={`py-3.5 px-4 text-sm ${t.done ? "line-through text-gray-300" : "text-gray-800"}`}>{t.content}</td>
                          <td className="py-3.5 text-center">
                            <button
                              onClick={() => toggleTask(t.id, t.done)}
                              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${t.done ? "border-green-500 bg-green-500" : "border-gray-300 hover:border-orange-400"}`}
                            >
                              {t.done && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          </td>
                          <td className="py-3.5 text-center">
                            <button onClick={() => deleteTask(t.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {tasks.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-16 text-center text-gray-400 text-sm">
                            등록된 업무가 없습니다. 위 입력란에서 할 일을 추가하세요.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-400 text-lg mb-1">클라이언트를 선택하세요</p>
                <p className="text-gray-300 text-sm">좌측에서 클라이언트를 선택하거나 새로 추가하세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
