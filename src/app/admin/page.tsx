"use client";

import { useEffect, useState, useCallback } from "react";

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  region: string;
  brands: string[];
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const ADMIN_PASSWORD = "1234";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries");
      const data = await res.json();
      setInquiries(data);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) fetchInquiries();
  }, [authed, fetchInquiries]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const markRead = async (id: string) => {
    await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, read: true } : i))
    );
    if (selected?.id === id) setSelected({ ...selected, read: true });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setDeleting(id);
    await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleting(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const unreadCount = inquiries.filter((i) => !i.read).length;

  /* ──── Login Screen ──── */
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-sm space-y-6"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, #d4380d, #f97316)" }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">관리자 로그인</h1>
            <p className="text-sm text-gray-500 mt-1">YJF&B 문의 관리 시스템</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setPwError(false); }}
              placeholder="비밀번호를 입력하세요"
              className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-center text-lg tracking-widest ${
                pwError ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-orange-400"
              }`}
              autoFocus
            />
            {pwError && (
              <p className="text-red-500 text-sm mt-2 text-center">비밀번호가 올바르지 않습니다.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl text-white font-bold transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #d4380d, #f97316)" }}
          >
            로그인
          </button>
        </form>
      </div>
    );
  }

  /* ──── Admin Dashboard ──── */
  return (
    <div className="min-h-screen" style={{ background: "#f5f5f7" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-gray-200" style={{ background: "rgba(255,255,255,0.85)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #d4380d, #f97316)" }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">문의 관리</h1>
              <p className="text-xs text-gray-500">YJF&B Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: "#d4380d" }}>
                새 문의 {unreadCount}건
              </span>
            )}
            <button
              onClick={fetchInquiries}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              title="새로고침"
            >
              <svg className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={() => { setAuthed(false); setPw(""); }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "전체 문의", value: inquiries.length, color: "#6366f1" },
            { label: "미확인", value: unreadCount, color: "#d4380d" },
            { label: "확인완료", value: inquiries.length - unreadCount, color: "#22c55e" },
            { label: "오늘 접수", value: inquiries.filter((i) => new Date(i.createdAt).toDateString() === new Date().toDateString()).length, color: "#f97316" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {inquiries.length === 0 && !loading ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-400 text-lg">접수된 문의가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* List */}
            <div className="lg:col-span-2 space-y-3">
              {inquiries.map((inq) => (
                <button
                  key={inq.id}
                  onClick={() => { setSelected(inq); if (!inq.read) markRead(inq.id); }}
                  className={`w-full text-left p-5 rounded-2xl border transition-all hover:shadow-md ${
                    selected?.id === inq.id
                      ? "border-orange-300 bg-orange-50/60 shadow-md"
                      : inq.read
                        ? "border-gray-100 bg-white"
                        : "border-orange-200 bg-white"
                  }`}
                  style={{ boxShadow: selected?.id === inq.id ? undefined : "0 2px 8px rgba(0,0,0,0.03)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {!inq.read && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#d4380d" }} />
                        )}
                        <span className="font-bold text-gray-900 truncate">{inq.name}</span>
                        {inq.type && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
                            {inq.type}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{inq.phone}</p>
                      {inq.message && (
                        <p className="text-sm text-gray-400 mt-1 truncate">{inq.message}</p>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
                      {formatDate(inq.createdAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail */}
            <div className="lg:col-span-3">
              {selected ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selected.name}</h2>
                      <p className="text-gray-500 mt-1">{formatDate(selected.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(selected.id)}
                      disabled={deleting === selected.id}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors disabled:opacity-50"
                    >
                      {deleting === selected.id ? "삭제 중..." : "삭제"}
                    </button>
                  </div>

                  <div className="space-y-5">
                    {[
                      { label: "연락처", value: selected.phone },
                      { label: "희망 창업 지역", value: selected.region },
                      { label: "관심 브랜드", value: selected.brands?.length ? selected.brands.join(", ") : "" },
                      { label: "구분", value: selected.type },
                    ].filter((f) => f.value).map((f) => (
                      <div key={f.label} className="flex gap-4">
                        <span className="text-sm font-semibold text-gray-500 w-28 flex-shrink-0">{f.label}</span>
                        <span className="text-sm text-gray-900">{f.value}</span>
                      </div>
                    ))}

                    {selected.message && (
                      <div className="pt-5 border-t border-gray-100">
                        <p className="text-sm font-semibold text-gray-500 mb-3">문의 내용</p>
                        <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {selected.message}
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <a
                        href={`tel:${selected.phone}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all hover:scale-[1.02] hover:shadow-lg"
                        style={{ background: "linear-gradient(135deg, #d4380d, #f97316)" }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        전화 연결
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-400">문의를 선택하면 상세 내용이 표시됩니다.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
