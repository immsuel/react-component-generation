"use client"

import { useEffect, useRef } from "react"
import { useInView, useMotionValue, useSpring, useTransform, motion } from "framer-motion"
import { Globe, Rocket } from "lucide-react"

// Helper component for the counting animation
function CountUp({ value }: { value: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // 1. Split the string into the part that should animate and the part that is static
  // Example: "99/100" -> number: "99", suffix: "/100"
  // Example: "3.5x" -> number: "3.5", suffix: "x"
  const match = value.match(/([\d.]+)(.*)/)
  const numericPart = match ? parseFloat(match[1]) : 0
  const suffix = match ? match[2] : ""

  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 80, // Slightly slower for a more premium feel
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
  { value: "72", label: "Hours", sublabel: "Concept to Deployment" },
  { value: "99/100", label: "Average", sublabel: "Lighthouse Score" },
  { value: "3.5x", label: "Average Conversion Lift", sublabel: "" },
]

const bottomStats = [
  { value: "5+", label: "Countries", sublabel: "Strategic presence across global markets", icon: Globe },
  { value: "40+", label: "Projects Launched", sublabel: "", icon: Rocket },
]

export function Stats() {
  return (
    <section className="px-4 py-20 relative">
      <div className="max-w-5xl mx-auto relative z-10">
        <h2 className="text-center text-gray-400 mb-12 uppercase tracking-widest text-xs font-bold">
          The numbers speak for themselves
        </h2>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-8 text-center backdrop-blur-sm"
            >
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                <CountUp value={stat.value} />
              </div>
              <div className="text-white font-medium">{stat.label}</div>
              {stat.sublabel && <div className="text-gray-500 text-sm">{stat.sublabel}</div>}
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {bottomStats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-8 flex items-center gap-4 backdrop-blur-sm"
            >
              <stat.icon className="w-10 h-10 text-purple-400 shrink-0" />
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">
                  <CountUp value={stat.value} /> <span className="text-xl font-normal text-gray-400">{stat.label}</span>
                </div>
                {stat.sublabel && <div className="text-gray-500 text-sm">{stat.sublabel}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}