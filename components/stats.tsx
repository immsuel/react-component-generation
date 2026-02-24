"use client"

import { useEffect, useRef } from "react"
import { useInView, useMotionValue, useSpring, useTransform, motion } from "framer-motion"
import { Cpu, Zap } from "lucide-react"

// Helper component for the counting animation
function CountUp({ value }: { value: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const match = value.match(/([\d.]+)(.*)/)
  const numericPart = match ? parseFloat(match[1]) : 0
  const suffix = match ? match[2] : ""

  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 80,
  })

  const displayValue = useTransform(springValue, (latest) => {
    const hasDecimal = value.includes(".")
    return hasDecimal ? latest.toFixed(1) : Math.floor(latest)
  })

  useEffect(() => {
    if (isInView) {
      motionValue.set(numericPart)
    }
  }, [isInView, motionValue, numericPart])

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{displayValue}</motion.span>
      <span>{suffix}</span>
    </span>
  )
}

const stats = [
  { value: "72", label: "Hours", sublabel: "From Audit to Live Agent" },
  { value: "85%", label: "Op-Ex Reduction", sublabel: "Average labor cost savings" },
  { value: "10x", label: "Workflow Velocity", sublabel: "Faster task completion" },
]

const bottomStats = [
  { value: "5k+", label: "Tasks Automated", sublabel: "Manual actions eliminated for our clients", icon: Zap },
  { value: "24/7", label: "Autonomous Uptime", sublabel: "Systems that never sleep or fatigue", icon: Cpu },
]

export function Stats() {
  return (
    <section className="px-4 py-24 relative bg-black/95 backdrop-blur-md">
      {/* Softened neutral glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-500/5 blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <h2 className="text-center text-gray-600 mb-16 uppercase tracking-[0.4em] text-[10px] font-medium">
          Proven Efficiency Metrics
        </h2>

        {/* Top Stats: Grid with matte cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 text-center backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-500"
            >
              <div className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tighter">
                <CountUp value={stat.value} />
              </div>
              <div className="text-slate-300 font-medium tracking-tight text-sm uppercase tracking-[0.1em]">{stat.label}</div>
              {stat.sublabel && (
                <div className="text-gray-600 text-[10px] mt-3 font-medium uppercase tracking-widest leading-relaxed">
                  {stat.sublabel}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Stats: Horizontal style with muted icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {bottomStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex items-center gap-6 backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-500"
            >
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <stat.icon className="w-6 h-6 text-slate-400 opacity-80 shrink-0" />
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  <CountUp value={stat.value} /> 
                  <span className="ml-2 text-sm font-medium text-slate-500 uppercase tracking-widest">{stat.label}</span>
                </div>
                {stat.sublabel && (
                  <div className="text-gray-600 text-xs mt-1 font-medium">
                    {stat.sublabel}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}