"use client"

import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative px-6 pt-32 pb-20 md:pt-44 md:pb-32 text-center overflow-hidden min-h-[100dvh] flex flex-col items-center bg-black">
      
      {/* 1. Optimized Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.03] md:opacity-[0.02]" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 100%)'
          }} 
        />
      </div>

      {/* 2. Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        
        <div className="mb-8 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md">
          <span className="text-[9px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-400 font-semibold">
            Custom Software & AI Automation
          </span>
        </div>

        <h1 className="text-[2.5rem] leading-[1.1] md:text-[clamp(2rem,5vw,3.8rem)] font-semibold tracking-tight text-white md:leading-[1.2] mb-6 max-w-4xl">
          We build custom software and<br className="hidden sm:inline" />{" "}
          <span className="text-slate-400">
            automate your business with AI.
          </span>
        </h1>

        <p className="text-gray-400 text-sm md:text-base max-w-[560px] leading-relaxed mb-12 px-2 md:px-0">
          From custom web apps and internal tools to intelligent AI workflows that take over repetitive tasks. We design, code, and deploy solutions that help your business move faster.
        </p>

        <div className="w-full sm:w-auto px-4 sm:px-0">
          <button 
            onClick={() => {
              const el = document.querySelector("#contact")
              if (el) el.scrollIntoView({ behavior: "smooth" })
            }}
            className="group relative flex items-center justify-center gap-3 w-full sm:w-fit px-10 py-5 rounded-full bg-white text-black hover:bg-slate-200 transition-all duration-300 shadow-2xl shadow-white/5 active:scale-95"
          >
            <span className="text-[11px] font-black tracking-[0.2em] uppercase">
              Start a Project
            </span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* 3. Subdued Ambient Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[30%] rounded-full bg-slate-500/10 blur-[80px] md:blur-[120px]" />
      </div>

      {/* 4. Cinematic Arc - HIDDEN ON MOBILE */}
      <div className="hidden md:block absolute -bottom-24 w-full h-[350px] pointer-events-none z-20 overflow-visible translate-y-12">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 400" 
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M-300 220 Q 720 -50 1740 220"
            stroke="url(#heroArcGradient)"
            strokeWidth="40"
            className="opacity-100 blur-[8px]" 
          />
          <defs>
            <linearGradient id="heroArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0" />
              <stop offset="25%" stopColor="#94a3b8" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="75%" stopColor="#94a3b8" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  )
}