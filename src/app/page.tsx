"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Image from "next/image";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ─────────────────────────────────────────────── */
/*                     DATA                        */
/* ─────────────────────────────────────────────── */
const NAV = [
  { label: "소개", href: "#about" },
  { label: "브랜드", href: "#brands" },
  { label: "창업지원", href: "#startup" },
  { label: "창업상담", href: "#contact" },
];

const BRANDS = [
  {
    name: "부산촌놈둘",
    sub: "정통 부산식 고기 전문점",
    desc: "부산의 정을 담아, 푸짐한 고기 한상으로 손님을 맞이합니다. 가성비와 맛 두 마리 토끼를 잡은 인기 브랜드.",
    color: "from-orange-500 to-red-600",
    accent: "#f97316",
    icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z",
    menus: [
      { name: "광안리 플렉스커플 SET (3인분)", img: "/images/busan-gwanganri-3.jpg" },
      { name: "기장 낭만가득 SET (2인분)", img: "/images/busan-gijang-2.jpg" },
      { name: "서면 MZ 가성비 SET (1.5인분)", img: "/images/busan-seomyeon-1.5.jpg" },
      { name: "연산동 도시남녀 혼밥 SET (1.5인분)", img: "/images/busan-yeonsandong-1.5.jpg" },
    ],
  },
  {
    name: "제육브로",
    sub: "제육 & 돈까스 전문점",
    desc: "매콤한 제육볶음과 바삭한 돈까스의 완벽 조합. 남녀노소 누구나 좋아하는 메뉴로 높은 재방문율을 자랑합니다.",
    color: "from-red-600 to-rose-700",
    accent: "#e11d48",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    menus: [
      { name: "1인 실속 세트", img: "/images/jeyuk-1.jpg" },
      { name: "2인 든든 세트", img: "/images/jeyuk-2.jpg" },
      { name: "3인 한상 세트", img: "/images/jeyuk-3.jpg" },
      { name: "제육돈까스", img: "/images/jeyuk-donkatsu.jpg" },
    ],
  },
  {
    name: "시골할매구이집",
    sub: "시골 감성 고기 구이 전문점",
    desc: "어머니 손맛 그대로, 시골 인심 가득한 구이 한상. 푸짐한 밥상으로 고객 만족도가 높은 브랜드입니다.",
    color: "from-amber-600 to-orange-600",
    accent: "#d97706",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    menus: [
      { name: "고기면 세트", img: "/images/sigol-noodle.jpg" },
      { name: "고기볶음밥 세트", img: "/images/sigol-friedrice.jpg" },
      { name: "고기비빔밥 세트", img: "/images/sigol-bibimbap.jpg" },
      { name: "밥상다리 부러질 세트", img: "/images/sigol-full.jpg" },
    ],
  },
];

const SUPPORTS = [
  { title: "상권 분석", desc: "빅데이터 기반 최적의 입지를 찾아드립니다. 유동인구, 경쟁점, 매출 예측까지.", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7", gradient: "from-blue-500 to-cyan-400" },
  { title: "인테리어 지원", desc: "본사 직영 시공팀이 합리적인 비용으로 최적의 매장을 만들어 드립니다.", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", gradient: "from-violet-500 to-purple-400" },
  { title: "레시피 & 교육", desc: "본사 표준 레시피로 누구나 동일한 맛을 재현. 체계적인 운영 교육을 제공합니다.", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", gradient: "from-emerald-500 to-teal-400" },
  { title: "마케팅 지원", desc: "배달앱, SNS, 블로그 등 다양한 채널의 온·오프라인 마케팅을 지원합니다.", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z", gradient: "from-pink-500 to-rose-400" },
  { title: "물류 시스템", desc: "본사 직영 물류센터에서 신선한 식자재를 안정적으로 공급합니다.", icon: "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0", gradient: "from-amber-500 to-yellow-400" },
  { title: "사후 관리", desc: "오픈 이후에도 지속적인 슈퍼바이저 방문과 매출 관리를 지원합니다.", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", gradient: "from-red-500 to-orange-400" },
];

/* ───────── STORE LOCATIONS ───────── */
const STORES: { region: string; stores: { name: string; address: string; lat: number; lng: number }[] }[] = [
  {
    region: "부산",
    stores: [
      { name: "본점", address: "수영구 수영로 666번길 60", lat: 35.1553, lng: 129.1133 },
      { name: "서면직영점", address: "부산진구 부암동 680-21 2층", lat: 35.1579, lng: 129.0600 },
      { name: "연산점", address: "연제구 월드컵대로 10번길 10 1층", lat: 35.1822, lng: 129.0797 },
      { name: "해운대점", address: "해운대구 대천로 205", lat: 35.1631, lng: 129.1635 },
      { name: "금정점", address: "금정구 기찰로 17", lat: 35.2435, lng: 129.0921 },
      { name: "사직점", address: "동래구 여고로 113번길 42-1", lat: 35.1960, lng: 129.0618 },
      { name: "중서구점", address: "중구 흑교로21번길 20", lat: 35.1048, lng: 129.0301 },
    ],
  },
  {
    region: "경기도",
    stores: [
      { name: "부천점", address: "부천시 원미구 중동 1149", lat: 37.5034, lng: 126.7660 },
    ],
  },
];

/* ─────────────────────────────────────────────── */
/*                    HOOKS                        */
/* ─────────────────────────────────────────────── */
function useScrollAnim(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─────────────────────────────────────────────── */
/*                  COMPONENTS                     */
/* ─────────────────────────────────────────────── */

/* Scroll-triggered animation wrapper */
function Anim({
  children, className = "", type = "fade-up", delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  type?: "fade-up" | "scale" | "slide-left" | "slide-right" | "clip" | "rotate";
  delay?: number;
}) {
  const { ref, visible } = useScrollAnim(0.1);
  const map: Record<string, [string, string]> = {
    "fade-up": ["anim-hidden", "anim-visible"],
    scale: ["anim-scale-hidden", "anim-scale-visible"],
    "slide-left": ["anim-slide-left-hidden", "anim-slide-left-visible"],
    "slide-right": ["anim-slide-right-hidden", "anim-slide-right-visible"],
    clip: ["anim-clip-hidden", "anim-clip-visible"],
    rotate: ["anim-rotate-hidden", "anim-rotate-visible"],
  };
  const [h, v] = map[type];
  return (
    <div ref={ref} className={`${h} ${visible ? v : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* Animated counter */
function Counter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const { ref, visible } = useScrollAnim(0.3);
  const [display, setDisplay] = useState("0");
  const num = parseInt(value.replace(/,/g, ""), 10);
  useEffect(() => {
    if (!visible) return;
    if (num === 0) { setDisplay("0"); return; }
    const dur = 2000;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 4); // ease-out quart
      setDisplay(Math.round(ease * num).toLocaleString());
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, num]);
  return <span ref={ref}>{display}<span className="text-lg font-bold text-gray-500 ml-0.5">{suffix}</span></span>;
}

/* Parallax background image */
function ParallaxBg({ src, alt, speed = 0.25 }: { src: string; alt: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const offset = (rect.top - window.innerHeight / 2) * speed;
      const img = el.querySelector("img");
      if (img) img.style.transform = `translateY(${offset}px) scale(1.2)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <Image src={src} alt={alt} fill className="object-cover parallax-img" quality={80} />
    </div>
  );
}

/* Particle canvas for hero */
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.1,
        r: Math.random() * 2.5 + 0.5,
        a: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,200,120,${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="particle-canvas" />;
}

/* Typing effect */
function Typewriter({ texts, speed = 80, pause = 2500 }: { texts: string[]; speed?: number; pause?: number }) {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const text = texts[idx];
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          if (charIdx < text.length) {
            setDisplay(text.slice(0, charIdx + 1));
            setCharIdx(charIdx + 1);
          } else {
            setTimeout(() => setDeleting(true), pause);
          }
        } else {
          if (charIdx > 0) {
            setDisplay(text.slice(0, charIdx - 1));
            setCharIdx(charIdx - 1);
          } else {
            setDeleting(false);
            setIdx((idx + 1) % texts.length);
          }
        }
      },
      deleting ? speed / 2 : speed
    );
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, idx, texts, speed, pause]);

  return <span className="typewriter-cursor">{display}</span>;
}

/* Letter-by-letter animated heading */
function SplitText({ text, visible, baseDelay = 0 }: { text: string; visible: boolean; baseDelay?: number }) {
  return (
    <>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={visible ? "letter-anim" : ""}
          style={{
            animationDelay: visible ? `${baseDelay + i * 40}ms` : "0ms",
            opacity: visible ? undefined : 0,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </>
  );
}

/* Mouse-tracking glow on a card */
function GlowCard({
  children, className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };
  return (
    <div className={`glow-card ${className}`} onMouseMove={onMove}>
      {children}
    </div>
  );
}

/* Section heading block */
/* Leaflet Map */
function StoreMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    import("leaflet").then((L) => {
      const map = L.map(mapRef.current!, {
        center: [35.17, 129.07],
        zoom: 11,
        scrollWheelZoom: false,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      const markerIcon = L.divIcon({
        className: "",
        html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#d4380d,#f97316);border-radius:50%;border:3px solid #fff;box-shadow:0 4px 14px rgba(212,56,13,0.4);display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const allStores = STORES.flatMap((r) => r.stores);
      const bounds: L.LatLngExpression[] = [];

      for (const s of allStores) {
        const pos: L.LatLngExpression = [s.lat, s.lng];
        bounds.push(pos);
        L.marker(pos, { icon: markerIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:Pretendard,sans-serif;padding:4px 2px"><strong style="font-size:14px;color:#d4380d">${s.name}</strong><br/><span style="font-size:12px;color:#666">${s.address}</span></div>`,
            { closeButton: false, offset: [0, -8] }
          );
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50], maxZoom: 13 });
      }

      mapInstance.current = map;

      setTimeout(() => map.invalidateSize(), 300);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} className="w-full h-full rounded-2xl" style={{ minHeight: 400 }} />;
}

function SectionHead({
  label, title, titleAccent, desc, dark = false,
}: {
  label: string;
  title: string;
  titleAccent?: string;
  desc?: string;
  dark?: boolean;
}) {
  return (
    <Anim className="text-center mb-20">
      <p className="gradient-label font-bold text-sm tracking-[0.25em] uppercase mb-4">
        {label}
      </p>
      <h2 className={`text-3xl sm:text-4xl md:text-[3.2rem] font-black mb-5 ${dark ? "text-white" : ""}`}>
        {title}
        {titleAccent && (
          <>
            {" "}
            <span className="relative inline-block text-primary">
              {titleAccent}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0 6 Q50 0 100 6 T200 6" stroke="#d4380d" strokeWidth="2.5" fill="none" opacity="0.35" />
              </svg>
            </span>
          </>
        )}
      </h2>
      {desc && <p className={`max-w-2xl mx-auto text-lg ${dark ? "text-gray-400" : "text-gray-500"}`}>{desc}</p>}
    </Anim>
  );
}

/* ═══════════════════════════════════════════════ */
/*                 CONTACT FORM                    */
/* ═══════════════════════════════════════════════ */
function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const brands = fd.getAll("brands") as string[];
    const body = {
      name: fd.get("name"),
      phone: fd.get("phone"),
      region: fd.get("region"),
      brands,
      type: fd.get("type") || "",
      message: fd.get("message"),
    };
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSubmitted(true);
        form.reset();
      } else {
        alert("접수에 실패했습니다. 다시 시도해주세요.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div
        className="relative bg-white rounded-[2rem] p-8 sm:p-12 text-center overflow-hidden"
        style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)" }}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ background: "linear-gradient(135deg, #d4380d, #f97316)" }}>
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">상담 신청이 접수되었습니다!</h3>
        <p className="text-gray-500 mb-6">빠른 시일 내에 연락드리겠습니다.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="px-6 py-3 rounded-xl text-sm font-bold text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all"
        >
          추가 문의하기
        </button>
      </div>
    );
  }

  return (
    <form
      className="relative bg-white rounded-[2rem] p-8 sm:p-12 space-y-7 overflow-hidden"
      style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)" }}
      onSubmit={handleSubmit}
    >
      {/* Corner deco */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(253,242,233,1), transparent 70%)" }} />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.06), transparent 70%)" }} />

      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2.5">성함 <span className="text-primary">*</span></label>
          <input name="name" type="text" required placeholder="홍길동" className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50/50 focus:bg-white text-[15px]" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2.5">연락처 <span className="text-primary">*</span></label>
          <input name="phone" type="tel" required placeholder="010-0000-0000" className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50/50 focus:bg-white text-[15px]" />
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-bold text-gray-700 mb-2.5">희망 창업 지역</label>
        <input name="region" type="text" placeholder="예: 서울 강남구" className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-primary outline-none transition-all bg-gray-50/50 focus:bg-white text-[15px]" />
      </div>

      <div className="relative">
        <label className="block text-sm font-bold text-gray-700 mb-2.5">관심 브랜드</label>
        <div className="flex flex-wrap gap-3">
          {BRANDS.map((b) => (
            <label key={b.name} className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-gray-200 hover:border-primary cursor-pointer transition-all duration-300 hover:shadow-sm bg-gray-50/50 hover:bg-warm group">
              <input type="checkbox" name="brands" value={b.name} className="w-4 h-4 text-primary rounded-md focus:ring-primary" />
              <span className="text-sm font-medium group-hover:text-primary transition-colors">{b.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-bold text-gray-700 mb-2.5">구분</label>
        <div className="flex gap-5">
          {["신규 창업", "업종 변경"].map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="type" value={opt} className="w-4 h-4 text-primary focus:ring-primary" />
              <span className="text-sm font-medium group-hover:text-primary transition-colors">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-bold text-gray-700 mb-2.5">문의 내용</label>
        <textarea name="message" rows={4} placeholder="궁금하신 점을 자유롭게 남겨주세요" className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-primary outline-none transition-all resize-none bg-gray-50/50 focus:bg-white text-[15px]" />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="relative w-full py-5 rounded-2xl text-lg font-bold text-white transition-all duration-300 hover:scale-[1.015] hover:shadow-xl overflow-hidden group disabled:opacity-70 disabled:hover:scale-100"
        style={{ background: "linear-gradient(135deg, #d4380d, #f97316)" }}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {submitting ? "접수 중..." : "창업 상담 신청하기"}
          {!submitting && (
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          )}
        </span>
        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />
      </button>

      <p className="text-xs text-gray-400 text-center">
        제출 시 개인정보 수집 및 이용에 동의하는 것으로 간주합니다.
      </p>
    </form>
  );
}

/* ═══════════════════════════════════════════════ */
/*                   MAIN PAGE                     */
/* ═══════════════════════════════════════════════ */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  const [activeBrand, setActiveBrand] = useState(0);
  const [heroReady, setHeroReady] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const heroSplitRef = useRef<HTMLDivElement>(null);
  const [heroSplitVisible, setHeroSplitVisible] = useState(false);

  /* Hero entrance */
  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 300);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (heroReady) {
      const t = setTimeout(() => setHeroSplitVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, [heroReady]);

  /* Scroll tracking */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      setShowFloat(window.scrollY > 600);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Brand auto-rotate */
  const brandTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRotation = useCallback(() => {
    if (brandTimer.current) clearInterval(brandTimer.current);
    brandTimer.current = setInterval(() => setActiveBrand((p) => (p + 1) % BRANDS.length), 5000);
  }, []);
  useEffect(() => { startRotation(); return () => { if (brandTimer.current) clearInterval(brandTimer.current); }; }, [startRotation]);
  const pickBrand = (i: number) => { setActiveBrand(i); startRotation(); };

  /* Smooth-scroll nav */
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  };

  return (
    <>
      {/* ━━━ SCROLL PROGRESS ━━━ */}
      <div className="scroll-progress" style={{ width: `${scrollPct}%` }} />

      {/* ━━━━━━━━━━ HEADER ━━━━━━━━━━ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-2.5" : "py-5"}`}
        style={
          scrolled
            ? { background: "rgba(255,255,255,0.82)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", boxShadow: "0 1px 40px rgba(0,0,0,0.06)" }
            : {}
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg group-hover:shadow-[rgba(212,56,13,0.3)]">
              <span className="text-white text-[11px] font-black tracking-tight">YJ</span>
            </div>
            <span className={`text-[22px] font-extrabold tracking-tight transition-colors duration-300 ${scrolled ? "text-gray-900" : "text-white"}`}>
              F&amp;B
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map((n) => (
              <button
                key={n.href}
                onClick={() => scrollTo(n.href)}
                className={`relative text-sm font-semibold transition-all duration-300 hover:text-primary cursor-pointer ${scrolled ? "text-gray-600" : "text-white/90 hover:text-white"} after:absolute after:bottom-[-6px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-primary after:to-accent after:transition-all after:duration-300 hover:after:w-full`}
              >
                {n.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo("#contact")}
              className="magnetic-btn bg-primary hover:bg-primary-dark text-white px-7 py-2.5 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[rgba(212,56,13,0.25)]"
              style={{ animation: "pulse-glow 2.5s infinite" }}
            >
              창업문의
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden flex flex-col gap-[5px] p-2 relative w-10 h-10 items-center justify-center" aria-label="메뉴">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`block w-[22px] h-[2px] rounded-full transition-all duration-400 ${scrolled ? "bg-gray-800" : "bg-white"}`}
                style={{
                  transform: mobileOpen
                    ? i === 0 ? "translateY(7px) rotate(45deg)" : i === 1 ? "scaleX(0)" : "translateY(-7px) rotate(-45deg)"
                    : "none",
                  opacity: mobileOpen && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden absolute top-full left-0 right-0 transition-all duration-400 ${mobileOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-4"}`}
          style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", boxShadow: "0 25px 50px rgba(0,0,0,0.08)" }}
        >
          <div className="flex flex-col p-5 gap-1">
            {NAV.map((n, i) => (
              <button
                key={n.href}
                onClick={() => scrollTo(n.href)}
                className="text-left text-gray-700 hover:text-primary font-semibold py-3.5 px-5 rounded-2xl hover:bg-warm transition-all duration-300"
                style={{ transitionDelay: mobileOpen ? `${i * 60}ms` : "0ms", transform: mobileOpen ? "translateX(0)" : "translateX(-20px)", opacity: mobileOpen ? 1 : 0 }}
              >
                {n.label}
              </button>
            ))}
            <button onClick={() => scrollTo("#contact")} className="mt-3 bg-primary text-white text-center py-3.5 rounded-full font-bold hover:bg-primary-dark transition-colors">
              창업문의
            </button>
          </div>
        </div>
      </header>

      {/* ━━━━━━━━━━ HERO ━━━━━━━━━━ */}
      <section className="relative h-screen min-h-[750px] flex items-center justify-center overflow-hidden bg-black">
        {/* Ken Burns BG */}
        <Image src="/images/hero.jpg" alt="YJF&amp;B 대표 메뉴" fill className="object-cover ken-burns" priority quality={85} style={{ objectPosition: "30% center" }} />

        {/* Gradient overlays */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.6) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(212,56,13,0.15), transparent 60%)" }} />

        {/* Particles */}
        <Particles />

        {/* Morphing blobs */}
        <div className="absolute top-[10%] left-[5%] w-[350px] h-[350px] morph-blob float-slow pointer-events-none" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.15), transparent 70%)" }} />
        <div className="absolute bottom-[15%] right-[8%] w-[450px] h-[450px] morph-blob float-slower pointer-events-none" style={{ background: "radial-gradient(circle, rgba(212,56,13,0.12), transparent 70%)" }} />

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-5xl">
          <p
            className="text-xs sm:text-sm tracking-[0.4em] uppercase mb-8 font-medium"
            style={{ opacity: heroReady ? 0.7 : 0, transform: heroReady ? "translateY(0)" : "translateY(20px)", transition: "all 1s cubic-bezier(0.22,1,0.36,1) 0.2s" }}
          >
            Franchise Recruitment
          </p>

          <h1
            className="text-[2.8rem] sm:text-6xl md:text-[5.5rem] font-black mb-8 tracking-tight"
            style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(20px)", transition: "all 1s cubic-bezier(0.22,1,0.36,1) 0.5s" }}
          >
            맛으로 승부하는{" "}<span className="text-shimmer">브랜드</span>
          </h1>

          <div
            className="flex flex-wrap justify-center gap-3 mb-14"
            style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s cubic-bezier(0.22,1,0.36,1) 1.5s" }}
          >
            <span className="backdrop-blur-md border px-5 py-2.5 rounded-full text-sm font-semibold" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.2)" }}>
              가맹비 <span className="line-through opacity-60">550만원</span>
            </span>
            <span className="backdrop-blur-md border px-5 py-2.5 rounded-full text-sm font-semibold" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.2)" }}>
              교육비 <span className="line-through opacity-60">200만원</span>
            </span>
            <span className="backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-bold border" style={{ background: "rgba(249,115,22,0.85)", borderColor: "rgba(249,115,22,0.4)" }}>
              선착순 10호점까지 무료
            </span>
          </div>

          <div style={{ opacity: heroReady ? 1 : 0, transition: "opacity 0.8s ease 1.8s" }}>
            <button
              onClick={() => scrollTo("#contact")}
              className="magnetic-btn group inline-flex items-center gap-3 bg-primary hover:bg-primary-dark text-white px-14 py-5 rounded-full text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_rgba(212,56,13,0.4)]"
            >
              무료 창업 상담 받기
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3" style={{ opacity: heroReady ? 0.6 : 0, transition: "opacity 1s ease 2.2s" }}>
          <span className="text-white text-[10px] tracking-[0.35em] uppercase font-medium">Scroll</span>
          <div className="w-[22px] h-[38px] border-2 rounded-full flex justify-center" style={{ borderColor: "rgba(255,255,255,0.25)" }}>
            <div className="w-[3px] h-[10px] rounded-full mt-2 scroll-indicator" style={{ background: "rgba(255,255,255,0.7)" }} />
          </div>
        </div>

        {/* Wave divider */}
        <div className="wave-divider">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path d="M0,60 L0,20 Q360,60 720,20 T1440,20 L1440,60 Z" fill="#111111" />
          </svg>
        </div>
      </section>

      {/* ━━━━━━━━━━ MARQUEE ━━━━━━━━━━ */}
      <div className="bg-dark py-5 overflow-hidden border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex whitespace-nowrap marquee-track">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="flex items-center gap-8 mx-8 text-sm font-bold tracking-wide">
              {["선착순 10호점 가맹비·교육비 무료", "2,000만원 이내 창업", "3개 브랜드 동시 운영"].map((t) => (
                <span key={t} className="flex items-center gap-3">
                  <span className="text-accent text-lg">&#x2726;</span>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>{t}</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ━━━━━━━━━━ ABOUT ━━━━━━━━━━ */}
      <section id="about" className="relative py-32 sm:py-40 bg-white overflow-hidden">
        {/* Deco */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full float-slow pointer-events-none" style={{ background: "radial-gradient(circle, rgba(253,242,233,0.9), transparent 60%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] morph-blob float-slower pointer-events-none" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.06), transparent 60%)" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHead
            label="About YJF&amp;B"
            title="대한민국 외식 프랜차이즈의"
            titleAccent="새로운 기준"
            desc="YJF&B는 검증된 3개 브랜드를 통해 예비 창업자에게 최소 비용, 최대 수익의 창업 기회를 제공합니다. 선착순 10호점까지 가맹비·교육비 무료, 2,000만원 이내 창업으로 여러분의 성공을 함께 만들어갑니다."
          />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-7">
            {[
              { value: "550", unit: "만원", desc: "가맹비 (10호점까지 무료)", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", strike: true },
              { value: "200", unit: "만원", desc: "교육비 (10호점까지 무료)", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", strike: true },
              { value: "2,000", unit: "만원", desc: "이내 올인원 창업", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
              { value: "3", unit: "개", desc: "브랜드 동시 운영", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
            ].map((b, i) => (
              <Anim key={b.desc} type="scale" delay={i * 120}>
                <GlowCard className="relative text-center p-8 sm:p-10 rounded-[1.5rem] bg-gradient-to-br from-white to-warm border border-orange-100/80 card-3d overflow-hidden">
                  <div className="relative z-10">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={b.icon} /></svg>
                    </div>
                    <div className={`text-4xl sm:text-5xl font-black text-primary mb-3 whitespace-nowrap ${(b as Record<string, unknown>).strike ? "line-through decoration-2 opacity-70" : ""}`}>
                      <Counter value={b.value} suffix={b.unit} />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{b.desc}</p>
                  </div>
                </GlowCard>
              </Anim>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ CTA BANNER 1 ━━━━━━━━━━ */}
      <section className="relative py-28 overflow-hidden noise-overlay">
        <ParallaxBg src="/images/menu-collection.jpg" alt="메뉴 모음" speed={0.2} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(212,56,13,0.2), transparent 70%)" }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center text-white px-4">
          <Anim>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
              선착순 10호점{" "}
              <span className="text-shimmer">가맹비 · 교육비 무료</span>
            </h3>
            <p className="text-xl sm:text-2xl font-bold mb-4">
              창업비용{" "}
              <span className="relative inline-block">
                <span className="text-accent">2,000만원 이내</span>
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-accent rounded-full" />
              </span>
              로 시작하세요
            </p>
            <p className="mb-12 text-lg" style={{ color: "rgba(255,255,255,0.65)" }}>
              초보 창업자도 안심하고 시작할 수 있는 합리적인 창업 시스템
            </p>
            <button
              onClick={() => scrollTo("#contact")}
              className="group inline-flex items-center gap-3 bg-accent hover:bg-orange-600 text-white px-12 py-4.5 rounded-full text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_rgba(249,115,22,0.35)]"
            >
              지금 상담 신청하기
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </Anim>
        </div>
      </section>

      {/* ━━━━━━━━━━ BRANDS ━━━━━━━━━━ */}
      <section id="brands" className="relative py-32 sm:py-40 overflow-hidden" style={{ background: "linear-gradient(180deg, #f8f8f8, #ffffff)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Anim className="text-center mb-20">
            <p className="gradient-label font-bold text-sm tracking-[0.25em] uppercase mb-4">Our Brands</p>
            <h2 className="text-3xl sm:text-4xl md:text-[3.2rem] font-black mb-2">맛으로 승부하는,</h2>
            <h2 className="text-3xl sm:text-4xl md:text-[3.2rem] font-black mb-2">
              <span className="relative inline-block text-primary">
                브랜드
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0 6 Q50 0 100 6 T200 6" stroke="#d4380d" strokeWidth="2.5" fill="none" opacity="0.35" />
                </svg>
              </span>
            </h2>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-600 mt-4 mb-1">소자본 창업,</h3>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-600 mb-5">효율적인 시스템</h3>
            <p className="max-w-2xl mx-auto text-lg text-gray-500">각기 다른 매력의 3가지 브랜드로 다양한 고객층을 사로잡으세요</p>
          </Anim>

          {/* Brand tabs */}
          <Anim className="flex justify-center gap-3 sm:gap-4 mb-6 flex-wrap">
            {BRANDS.map((b, i) => (
              <button
                key={b.name}
                onClick={() => pickBrand(i)}
                className={`relative px-7 sm:px-10 py-3.5 rounded-full font-bold text-sm sm:text-base transition-all duration-500 ${
                  activeBrand === i
                    ? "text-white scale-105 shadow-xl"
                    : "bg-white text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
                style={
                  activeBrand === i
                    ? { background: "linear-gradient(135deg, #d4380d, #f97316)", boxShadow: "0 10px 40px rgba(212,56,13,0.3)" }
                    : {}
                }
              >
                <svg className="w-4 h-4 mr-1.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={b.icon} /></svg>
                {b.name}
              </button>
            ))}
          </Anim>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-14">
            {BRANDS.map((_, i) => (
              <button
                key={i}
                onClick={() => pickBrand(i)}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: activeBrand === i ? 48 : 16,
                  background: activeBrand === i ? "linear-gradient(90deg, #d4380d, #f97316)" : "#d1d5db",
                }}
              />
            ))}
          </div>

          {/* Active brand */}
          {BRANDS.map((brand, idx) => (
            <div
              key={brand.name}
              style={{
                display: activeBrand === idx ? "block" : "none",
                animation: activeBrand === idx ? "fadeSlideIn 0.7s cubic-bezier(0.22,1,0.36,1)" : "none",
              }}
            >
              {/* Brand header */}
              <div className="text-center mb-14">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={brand.icon} /></svg>
                </div>
                <h3 className={`text-4xl sm:text-5xl font-black bg-gradient-to-r ${brand.color} bg-clip-text text-transparent mb-3`}>
                  {brand.name}
                </h3>
                <p className="text-gray-500 font-semibold text-lg">{brand.sub}</p>
                <p className="text-gray-400 mt-3 max-w-lg mx-auto">{brand.desc}</p>
              </div>

              {/* Menu grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
                {brand.menus.map((menu, mi) => (
                  <div
                    key={menu.name}
                    className="group bg-white rounded-[1.5rem] overflow-hidden card-3d border border-gray-100"
                    style={{ animationDelay: `${mi * 80}ms` }}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={menu.img}
                        alt={menu.name}
                        fill
                        className="object-cover transition-transform duration-[800ms] group-hover:scale-110"
                        sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {/* Menu name on hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <p className="text-white font-bold text-lg drop-shadow-lg">{menu.name}</p>
                      </div>
                    </div>
                    <div className="p-5 text-center">
                      <p className="font-bold text-gray-800 group-hover:text-primary transition-colors duration-300">
                        {menu.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━ STARTUP SUPPORT ━━━━━━━━━━ */}
      <section id="startup" className="relative py-32 sm:py-40 bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] morph-blob float-slow pointer-events-none" style={{ background: "radial-gradient(circle, rgba(253,242,233,0.6), transparent 60%)" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHead
            label="Startup Support"
            title=""
            titleAccent="체계적인 창업 지원 시스템"
            desc="오픈 전부터 오픈 후까지, 본사가 함께합니다"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUPPORTS.map((s, i) => (
              <Anim key={s.title} delay={i * 80}>
                <GlowCard className={`group relative bg-white rounded-[1.5rem] p-8 h-full border border-gray-100 card-3d overflow-hidden`}>
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg`}>
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">{s.title}</h4>
                    <p className="text-gray-500 text-[15px]">{s.desc}</p>
                  </div>
                </GlowCard>
              </Anim>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ PROCESS ━━━━━━━━━━ */}
      <section className="relative py-32 sm:py-40 bg-dark text-white overflow-hidden noise-overlay">
        <div className="absolute top-0 left-[20%] w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(212,56,13,0.08), transparent 60%)" }} />
        <div className="absolute bottom-0 right-[15%] w-[500px] h-[500px] morph-blob pointer-events-none" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.06), transparent 60%)" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHead label="Process" title="창업 절차 안내" desc="간단하고 빠른 5단계 창업 프로세스" dark />

          <div className="relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-10 left-[10%] right-[10%] h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,56,13,0.3), rgba(249,115,22,0.3), rgba(212,56,13,0.3), transparent)" }} />

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-10 sm:gap-6">
              {[
                { step: "01", title: "창업 상담", desc: "전화·온라인 상담", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
                { step: "02", title: "상권 분석", desc: "입지 선정 및 분석", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
                { step: "03", title: "계약 체결", desc: "가맹 계약 진행", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                { step: "04", title: "인테리어 컨설팅", desc: "자율시공 가능(점주부담 최소화)", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
                { step: "05", title: "그랜드 오픈", desc: "오픈 지원 및 교육", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
              ].map((p, i) => (
                <Anim key={p.step} type="scale" delay={i * 150}>
                  <div className="text-center group">
                    <div className="relative inline-flex mb-7">
                      {/* Glow ring */}
                      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.3), transparent 70%)", transform: "scale(2.5)" }} />
                      <div className="w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-500 group-hover:scale-110 relative z-10" style={{ background: "linear-gradient(135deg, #d4380d, #f97316)", boxShadow: "0 8px 30px rgba(212,56,13,0.3)" }}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={p.icon} /></svg>
                      </div>
                      {/* Step number badge */}
                      <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white text-dark text-xs font-black flex items-center justify-center shadow-lg z-20">
                        {p.step}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold mb-1.5">{p.title}</h4>
                    <p className="text-gray-400 text-sm">{p.desc}</p>
                  </div>
                </Anim>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ STORE MAP ━━━━━━━━━━ */}
      <section id="stores" className="relative py-32 sm:py-40 overflow-hidden" style={{ background: "linear-gradient(180deg, #f8f8f8, #ffffff)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHead
            label="Our Stores"
            title="전국"
            titleAccent="가맹점 현황"
            desc="YJF&B의 검증된 맛, 전국으로 확장 중입니다"
          />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Store list */}
            <div className="lg:col-span-2 space-y-6">
              {STORES.map((region, ri) => (
                <Anim key={region.region} delay={ri * 100}>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold">{region.region}</h4>
                      <span className="ml-auto text-xs font-bold text-primary bg-red-50 px-2.5 py-1 rounded-full">{region.stores.length}개점</span>
                    </div>
                    <div className="space-y-3">
                      {region.stores.map((s) => (
                        <div key={s.name} className="flex items-start gap-3 group">
                          <div className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">{s.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{s.address}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Anim>
              ))}

              {/* CTA */}
              <Anim delay={200}>
                <button
                  onClick={() => scrollTo("#contact")}
                  className="group w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                  style={{ background: "linear-gradient(135deg, #d4380d, #f97316)" }}
                >
                  가맹 문의하기
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </Anim>
            </div>

            {/* Map */}
            <Anim className="lg:col-span-3" type="slide-right" delay={150}>
              <div className="rounded-2xl overflow-hidden border border-gray-200" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
                <StoreMap />
              </div>
            </Anim>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ CONTACT ━━━━━━━━━━ */}
      <section id="contact" className="relative py-32 sm:py-40 overflow-hidden" style={{ background: "linear-gradient(180deg, #fdf2e9, #fbe3cd)" }}>
        <div className="absolute top-0 left-[50%] -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(212,56,13,0.04), transparent 60%)" }} />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <SectionHead
            label="Contact Us"
            title="창업 상담 신청"
            desc="아래 양식을 작성해주시면 빠르게 연락드리겠습니다"
          />

          <Anim type="scale">
            <ContactForm />
          </Anim>
        </div>
      </section>

      {/* ━━━━━━━━━━ FOOTER ━━━━━━━━━━ */}
      <footer className="relative bg-dark pt-20 pb-10 overflow-hidden noise-overlay">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,56,13,0.3), transparent)" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 pb-12 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {/* Logo & tagline */}
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2.5 justify-center md:justify-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white text-[11px] font-black">YJ</span>
                </div>
                <span className="text-white text-2xl font-black">F&amp;B</span>
              </div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                부산촌놈둘 &middot; 제육브로 &middot; 시골할매구이집
              </p>
            </div>

            {/* Nav links */}
            <div className="flex flex-wrap justify-center gap-2">
              {NAV.map((n) => (
                <button
                  key={n.href}
                  onClick={() => scrollTo(n.href)}
                  className="text-sm px-4 py-2 rounded-full transition-all duration-300 hover:bg-[rgba(255,255,255,0.05)]"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {n.label}
                </button>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => scrollTo("#contact")}
              className="px-8 py-3 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #d4380d, #f97316)" }}
            >
              창업 상담
            </button>
          </div>

          {/* Business info */}
          <div className="pt-8 space-y-3">
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              <span>(주)와이제이에프앤비</span>
              <span>대표: 김용현</span>
              <span>사업자등록번호: 402-88-03725</span>
              <span>법인등록번호: 180111-0165856</span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              <span>부산광역시 수영구 수영로 666번길 60(광안동)</span>
              <span>창업상담: 1544-5099</span>
            </div>
            <p className="text-xs text-center md:text-left" style={{ color: "rgba(255,255,255,0.2)" }}>
              &copy; {new Date().getFullYear()} YJF&amp;B. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ━━━━━━━━━━ FLOATING CTA ━━━━━━━━━━ */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
        style={{ opacity: showFloat ? 1 : 0, transform: showFloat ? "translateY(0)" : "translateY(30px)", pointerEvents: showFloat ? "auto" : "none", transition: "all 0.6s cubic-bezier(0.22,1,0.36,1)" }}
      >
        {/* Chat CTA */}
        <button
          onClick={() => scrollTo("#contact")}
          className="group flex items-center"
          aria-label="창업 상담"
        >
          <span className="mr-3 bg-dark text-white text-sm font-bold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap shadow-lg">
            창업 상담
          </span>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:scale-110"
            style={{ background: "linear-gradient(135deg, #d4380d, #f97316)", animation: "pulse-glow 2.5s infinite" }}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </button>

        {/* Phone */}
        <a
          href="tel:1544-5099"
          className="group flex items-center gap-3 bg-white text-gray-800 pl-5 pr-6 py-3 rounded-full shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-100"
          style={{ opacity: showFloat ? 1 : 0, transform: showFloat ? "translateX(0)" : "translateX(20px)", transition: "all 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s" }}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <span className="text-sm font-bold">1544-5099</span>
        </a>
      </div>
    </>
  );
}
