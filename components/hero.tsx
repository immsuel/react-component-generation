"use client"

import { ArrowRight, BrainCircuit, Workflow, Cpu, Bot, Zap } from "lucide-react"

export function Hero() {
  return (
    <section className="relative px-4 pt-8 pb-6 text-center overflow-hidden min-h-[100dvh] flex flex-col items-center justify-between bg-black/95 backdrop-blur-md">
      
      {/* 1. Ultra-Subtle Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.02]" // Dropped even further for elegance
          style={{ 
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '120px 120px',
            maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 20%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 20%, transparent 100%)'
          }} 
        />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
      </div>

      {/* 2. Main Content Area */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col items-center mt-32">
        {/* Tag: Switched from purple to muted slate */}
        <div className="mb-6 px-5 py-1.5 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md">
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.5em] text-slate-400 font-medium">
            Intelligence at the Speed of Light
          </span>
        </div>

        <h1 className="text-[clamp(1.8rem,5vw,3.8rem)] font-semibold tracking-tight text-white leading-[1.2] mb-6 max-w-4xl">
          Automate the <span className="text-white">Routine.</span>{" "}
          <span className="text-slate-400">
            Scale the Reality.
          </span>
        </h1>

        <p className="text-gray-500 text-sm md:text-base max-w-[650px] leading-relaxed font-normal mb-10 opacity-70">
          Manual operations are the ceiling to your growth. We build autonomous AI agents 
          and custom logic systems that eliminate friction and reclaim your team's time in 72 hours.
        </p>

        {/* Button: Switched to the high-contrast matte white style */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-white/5 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />
          <button className="relative flex items-center gap-3 px-8 py-3.5 rounded-full bg-white text-black hover:bg-gray-200 transition-all duration-300 shadow-xl shadow-white/5">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase">
              Audit My Workflows
            </span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* 5. Subdued Ambient Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[40%] h-[15%] rounded-full bg-slate-500/5 blur-[120px]" />
      </div>

      {/* 3. The Cinematic Arc - Now Silver/Slate instead of Neon */}
      <div className="hidden md:block absolute -bottom-24 w-full md:h-[250px] lg:h-[350px] pointer-events-none z-20 overflow-visible translate-y-12">
        <style>{`
          @keyframes pulse-subtle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.5; }
          }
        `}</style>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 400" 
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="heroArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0" />
              <stop offset="25%" stopColor="#94a3b8" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="75%" stopColor="#94a3b8" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M-300 220 Q 720 -50 1740 220"
            stroke="url(#heroArcGradient)"
            strokeWidth="40"
            className="opacity-100 blur-[8px] animate-[pulse-subtle_6s_ease-in-out_infinite]" 
          />
        </svg>
      </div>
    </section>
  )
}