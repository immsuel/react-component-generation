"use client"

import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative px-6 pt-32 pb-20 md:pt-44 md:pb-32 text-center overflow-hidden min-h-[100dvh] flex flex-col items-center bg-black">
      
      {/* 1. Optimized Background Grid - Responsive Density */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.03] md:opacity-[0.02]" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '80px 80px', // Smaller grid for mobile feel
            maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 100%)'
          }} 
        />
      </div>

      {/* 2. Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Tag: Increased touch target feel and centered tracking */}
        <div className="mb-8 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md">
          <span className="text-[9px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-400 font-semibold">
            Intelligence at the Speed of Light
          </span>
        </div>

        {/* Headline: Adjusted leading and clamp for mobile readability */}
        <h1 className="text-[2.5rem] leading-[1.1] md:text-[clamp(2rem,5vw,3.8rem)] font-semibold tracking-tight text-white md:leading-[1.2] mb-6 max-w-4xl">
          Automate the <span className="text-white">Routine.</span><br className="md:hidden" />{" "}
          <span className="text-slate-500">
            Scale the Reality.
          </span>
        </h1>

        {/* Body: Improved contrast for small screens */}
        <p className="text-gray-400 text-sm md:text-base max-w-[500px] leading-relaxed mb-12 px-2 md:px-0">
          Manual operations are the ceiling to your growth. We build autonomous AI agents 
          that reclaim your team's time in <span className="text-white font-medium">72 hours.</span>
        </p>

        {/* Button: Full width on very small screens, centered on others */}
        <div className="w-full sm:w-auto px-4 sm:px-0">
          <button className="group relative flex items-center justify-center gap-3 w-full sm:w-fit px-10 py-5 rounded-full bg-white text-black hover:bg-slate-200 transition-all duration-300 shadow-2xl shadow-white/5 active:scale-95">
            <span className="text-[11px] font-black tracking-[0.2em] uppercase">
              Audit My Workflows
            </span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* 3. Mobile-Specific Ambient Glow (Centered on text) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[30%] rounded-full bg-slate-500/10 blur-[80px] md:blur-[120px]" />
      </div>

      {/* 4. The Cinematic Arc - Adjusted for Mobile Aspect Ratios */}
      <div className="absolute -bottom-12 md:-bottom-24 w-full h-[150px] md:h-[350px] pointer-events-none z-20">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 400" 
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M-100 300 Q 720 50 1540 300" // Shallower curve for mobile
            stroke="url(#heroArcGradientMobile)"
            strokeWidth="20" // Thinner for elegance
            className="opacity-40 md:opacity-100 blur-[4px] md:blur-[8px]" 
          />
          <defs>
            <linearGradient id="heroArcGradientMobile" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  )
}