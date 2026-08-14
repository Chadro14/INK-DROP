"use client";

import { useEffect, useRef, useState } from "react";

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
  onComplete?: () => void;
}

const statuses = [
  "Préparation de votre espace",
  "Chargement des créations",
  "Préparation de l’encre",
  "Synchronisation",
  "Presque prêt",
];

export function Loader({
  message = "Chargement de l’encre",
  fullScreen = true,
  onComplete,
}: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(statuses[0]);
  const completed = useRef(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const value = Math.min(100, (now - start) / 48);
      setProgress(value);
      setStatus(statuses[Math.min(statuses.length - 1, Math.floor(value / 20))]);
      if (value < 100) raf = requestAnimationFrame(tick);
      else if (!completed.current) {
        completed.current = true;
        setStatus("Prêt à créer.");
        window.setTimeout(() => onComplete?.(), 550);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  const radius = 108;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const root = fullScreen ? "loader loader--full" : "loader";

  return (
    <section className={root} role="status" aria-label={`${message} ${Math.round(progress)}%`}>
      <div className="ambient" />
      <div className="brush brush--one" />
      <div className="brush brush--two" />

      <div className={`scene ${progress >= 100 ? "scene--done" : ""}`}>
        <div className="halo" />
        <svg viewBox="0 0 260 260" className="art" aria-hidden="true">
          <defs>
            <linearGradient id="ring" x1="35" y1="35" x2="225" y2="225">
              <stop stopColor="#fff" /><stop offset=".55" stopColor="#bfd7ff" /><stop offset="1" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="ink" x1="75" y1="52" x2="185" y2="218">
              <stop stopColor="#fff" /><stop offset=".35" stopColor="#dce9ff" /><stop offset=".72" stopColor="#2f6fea" /><stop offset="1" stopColor="#0b2d70" />
            </linearGradient>
            <radialGradient id="glow"><stop stopColor="#60a5fa" stopOpacity=".35" /><stop offset="1" stopColor="#60a5fa" stopOpacity="0" /></radialGradient>
            <filter id="blur"><feGaussianBlur stdDeviation="7" /></filter>
            <clipPath id="dropClip"><path d="M130 42C111 72 73 113 73 153c0 39 25 67 57 67s57-28 57-67c0-40-38-81-57-111Z" /></clipPath>
          </defs>
          <circle cx="130" cy="130" r="112" fill="url(#glow)" filter="url(#blur)" />
          <circle cx="130" cy="130" r={radius} stroke="rgba(255,255,255,.08)" strokeWidth="2" />
          <circle cx="130" cy="130" r={radius} stroke="url(#ring)" strokeWidth="2.8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 130 130)" className="progress" />
          <circle cx="130" cy="130" r="119" stroke="#3b82f6" strokeOpacity=".28" strokeWidth="1" strokeDasharray="2 16" className="orbit" />

          <g className="fall">
            <path d="M130 7C123 17 117 25 117 34c0 9 6 15 13 15s13-6 13-15c0-9-6-17-13-27Z" fill="#fff" />
            <path d="M130 10C127 17 125 23 125 29" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
          </g>

          <g className="drop">
            <path d="M130 42C111 72 73 113 73 153c0 39 25 67 57 67s57-28 57-67c0-40-38-81-57-111Z" fill="url(#ink)" />
            <g clipPath="url(#dropClip)" opacity=".2">
              <path d="M62 142L116 91M72 170L147 93M90 199L171 115M124 218L188 154" stroke="#fff" strokeWidth="2" />
            </g>
            <path d="M99 101C88 120 82 136 82 151c0 22 12 39 29 45" stroke="#fff" strokeOpacity=".58" strokeWidth="5" strokeLinecap="round" />
            <path d="M130 92L104 155h20l-4 37 32-57h-20l7-43-9 0Z" fill="#fff" />
            <circle cx="111" cy="126" r="4" fill="#fff" opacity=".8" />
          </g>

          <g className="splash">
            <circle cx="65" cy="154" r="3" fill="#60a5fa" /><circle cx="195" cy="153" r="2.5" fill="#fff" />
            <circle cx="84" cy="207" r="2" fill="#3b82f6" /><circle cx="178" cy="204" r="2" fill="#60a5fa" />
          </g>
          <circle cx="130" cy="155" r="31" fill="none" stroke="#fff" strokeOpacity=".16" className="core" />
          <circle cx="130" cy="155" r="3" fill="#fff" className="core-dot" />
        </svg>
        <div className="percent">{String(Math.round(progress)).padStart(2, "0")}<small>%</small></div>
      </div>

      <div className="copy">
        <div className="brand"><strong>INK</strong><span>drop</span></div>
        <p>{message}</p>
        <div className="status"><i />{status}</div>
        <div className="bar"><span style={{ width: `${progress}%` }} /></div>
      </div>

      <style jsx>{`
        .loader{--blue:#3b82f6;--light:#60a5fa;position:relative;min-height:100%;width:100%;overflow:hidden;isolation:isolate;background:radial-gradient(circle at 50% 45%,rgba(59,130,246,.09),transparent 28%),#050505;color:#fff}
        .loader--full{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;align-content:center;gap:20px}
        .ambient{position:absolute;width:42vw;height:42vw;min-width:300px;min-height:300px;border-radius:50%;filter:blur(70px);opacity:.12;background:#2563eb;left:22%;top:18%;animation:ambient 7s ease-in-out infinite;z-index:-1}
        .brush{position:absolute;width:50vw;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);opacity:.35}.brush--one{top:23%;left:-10%;transform:rotate(-18deg)}.brush--two{bottom:25%;right:-10%;transform:rotate(18deg)}
        .scene{position:relative;width:min(72vw,320px);aspect-ratio:1;display:grid;place-items:center}.halo{position:absolute;width:58%;height:58%;border-radius:50%;background:rgba(59,130,246,.18);filter:blur(38px);animation:halo 2.8s ease-in-out infinite}.art{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.progress{filter:drop-shadow(0 0 5px rgba(59,130,246,.35));transition:stroke-dashoffset .08s linear}.orbit{transform-origin:130px 130px;animation:orbit 9s linear infinite}.fall{transform-origin:130px 32px;animation:fall 2.7s cubic-bezier(.2,.8,.2,1) infinite}.drop{transform-origin:130px 155px;animation:breathe 2.8s ease-in-out infinite;filter:drop-shadow(0 8px 20px rgba(59,130,246,.16))}.splash{animation:splash 2.4s ease-in-out infinite}.core{transform-origin:130px 155px;animation:core 2.4s ease-in-out infinite}.core-dot{animation:dot 1.7s ease-in-out infinite}
        .percent{position:relative;z-index:2;margin-top:150px;font:700 40px/1 system-ui,sans-serif;letter-spacing:-.06em}.percent small{color:var(--light);font-size:16px;margin-left:3px}
        .copy{width:min(82vw,360px);text-align:center}.brand{font:800 18px/1 system-ui,sans-serif;letter-spacing:-.04em;margin-bottom:13px}.brand span{color:var(--light);font-weight:500}.copy p{margin:0;color:rgba(255,255,255,.86);font:400 14px/1.5 system-ui,sans-serif;letter-spacing:.03em}.status{margin-top:9px;min-height:18px;display:flex;justify-content:center;align-items:center;gap:8px;color:rgba(255,255,255,.4);font:400 10px/1.5 system-ui,sans-serif;text-transform:uppercase;letter-spacing:.16em}.status i{width:5px;height:5px;border-radius:50%;background:var(--light);box-shadow:0 0 9px rgba(96,165,250,.7);animation:dot 1s ease-in-out infinite}.bar{height:2px;margin-top:15px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden}.bar span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#fff,var(--light));box-shadow:0 0 10px rgba(96,165,250,.45);transition:width .08s linear}
        @keyframes fall{0%,100%{transform:translateY(-9px) scale(.82);opacity:.55}42%{transform:translateY(62px) scale(1);opacity:1}55%{transform:translateY(78px) scale(1.35,.7);opacity:.9}70%{transform:translateY(56px) scale(.85);opacity:.25}}@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}@keyframes orbit{to{transform:rotate(360deg)}}@keyframes halo{0%,100%{transform:scale(.86);opacity:.55}50%{transform:scale(1.08);opacity:1}}@keyframes splash{0%,100%{transform:scale(.8);opacity:.35}50%{transform:scale(1.35);opacity:1}}@keyframes core{0%,100%{transform:scale(.75);opacity:.2}50%{transform:scale(1.1);opacity:.65}}@keyframes dot{0%,100%{opacity:.35;transform:scale(.85)}50%{opacity:1;transform:scale(1.15)}}@keyframes ambient{0%,100%{transform:scale(.9)}50%{transform:scale(1.08) translateY(-10px)}}
        @media(max-width:480px){.scene{width:72vw;max-width:285px}.copy{width:84vw}.copy p{font-size:13px}}@media(prefers-reduced-motion:reduce){.loader *{animation-duration:.01ms!important;animation-iteration-count:1!important}.progress,.bar span{transition:none}}
      `}</style>
    </section>
  );
}
