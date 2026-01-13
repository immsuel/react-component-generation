"use client"

import { ArrowRight, Zap, Layers, Cpu, Database, Globe } from "lucide-react"

export function Hero() {
  return (
    <section className="relative px-4 pt-16 pb-12 text-center overflow-hidden min-h-[100dvh] flex flex-col items-center justify-between">
      {/* 1. Background Grid & Stars */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 40%, transparent 100%)'
          }} 
        />
      </div>

      {/* 2. Main Content Area */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col items-center mt-12">
        <div className="mb-8 px-6 py-2 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-semibold">
            Design at the Speed of Light
          </span>
        </div>

        <h1 className="text-[clamp(2.2rem,8vw,5.5rem)] font-bold tracking-tighter text-white leading-[1.1] md:leading-none mb-8 max-w-[90vw] md:max-w-none md:whitespace-nowrap">
          See the <span className="text-white">Magic.</span>{" "}
          <span className="bg-gradient-to-r from-[#8b5cf6] via-[#d946ef] to-[#3b82f6] bg-clip-text text-transparent">
            Own the Reality.
          </span>
        </h1>

        <p className="text-gray-400 text-base md:text-lg max-w-[850px] leading-relaxed font-normal mb-10 opacity-80">
          Traditional agencies take months. We bridge the gap between imagination and reality, delivering
          high-performance, custom-coded sites in record time.
        </p>

        <button className="group flex items-center gap-3 px-7 py-3 rounded-md border border-white/20 bg-white/[0.03] hover:bg-white/10 transition-all duration-300">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white">
            Start Your Design
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-white transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* 5. Ambient Background Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[50%] h-[20%] rounded-full bg-[#d946ef] opacity-[0.2] blur-[100px]" />
      </div>

      {/* 3. The Cinematic Arc - HIDDEN ON MOBILE (hidden), VISIBLE ON DESKTOP (md:block) */}
      <div className="hidden md:block absolute bottom-0 w-full h-[400px] pointer-events-none z-20 overflow-visible">
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
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
              <stop offset="25%" stopColor="#d946ef" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#fff" stopOpacity="1" />
              <stop offset="75%" stopColor="#3B82F6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          <path
            d="M-300 220 Q 720 -50 1740 220"
            stroke="url(#heroArcGradient)"
            strokeWidth="180" 
            className="opacity-20 blur-[20px]"
          />
          
          <path
            d="M-300 220 Q 720 -50 1740 220"
            stroke="url(#heroArcGradient)"
            strokeWidth="80"
            className="opacity-30 blur-[20px]"
          />

          <path
            d="M-300 220 Q 720 -50 1740 220"
            stroke="url(#heroArcGradient)"
            strokeWidth="60"
            className="opacity-100 blur-[5px]" 
          />

          <path
            d="M-300 220 Q 720 -50 1740 220"
            stroke="white"
            strokeWidth="15"
            className="opacity-30 blur-[10px]"
          />
        </svg>
      </div>

      {/* 4. Trusted By Section */}
      <div className="relative z-30 w-full flex flex-col items-center gap-8 pb-8 md:pb-4">
        <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em]">
          Powering The Next Generation
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-20 opacity-30 grayscale px-4">
          <TechItem icon={<Zap className="w-4 h-4" />} label="Next.js" />
          <TechItem icon={<Layers className="w-4 h-4" />} label="Tailwind" />
          <TechItem icon={<Cpu className="w-4 h-4" />} label="TypeScript" />
          <TechItem icon={<Database className="w-4 h-4" />} label="Supabase" />
          <TechItem icon={<Globe className="w-4 h-4" />} label="Vercel" />
        </div>
      </div>
    </section>
  )
}

function TechItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-white">{icon}</div>
      <span className="text-white font-medium text-xs tracking-tight">{label}</span>
    </div>
  )
}