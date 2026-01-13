"use client"

import { useState } from "react"
import { Sparkles, Palette, Rocket } from "lucide-react"

const phases = [
  {
    number: 1,
    title: "Step 01",
    subtitle: "Architecture",
    icon: Sparkles,
    description:
      "We align on project scope, user requirements, and technical constraints to establish a robust foundation for development.",
    details: ["Audit & Analysis", "UX Mapping", "Tech Stack Selection", "Project Scoping"],
  },
  {
    number: 2,
    title: "Step 02",
    subtitle: "Interface",
    icon: Palette,
    description:
      "High-fidelity design systems built for scalability. We focus on intuitive layouts that prioritize user retention and conversion.",
    details: ["Design Systems", "Interactive Prototypes", "Visual Identity", "Usability Testing"],
  },
  {
    number: 3,
    title: "Step 03",
    subtitle: "Ship",
    icon: Rocket,
    description:
      "Engineered for performance. We transition from design to a fully optimized, production-grade application in days, not months.",
    details: ["Clean Engineering", "API Integration", "Vercel Deployment", "SEO & Core Web Vitals"],
  },
] 
export function Phases() {
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null)

  return (
    <section className="px-4 py-20">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">From Spark to System in 72 Hours.</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-12">
          Our three-phase forge eliminates the friction of traditional agencies. We move from your initial vision to a
          production-ready reality at the speed of thought.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {phases.map((phase) => {
            const Icon = phase.icon
            const isHovered = hoveredPhase === phase.number

            return (
              <div
                key={phase.number}
                className="relative bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/30 rounded-2xl aspect-square overflow-hidden cursor-pointer group"
                onMouseEnter={() => setHoveredPhase(phase.number)}
                onMouseLeave={() => setHoveredPhase(null)}
              >
                {/* Background glow effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-purple-600/20 via-purple-500/10 to-transparent transition-opacity duration-500 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Animated border glow */}
                <div
                  className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    isHovered ? "shadow-[inset_0_0_30px_rgba(168,85,247,0.3),0_0_40px_rgba(168,85,247,0.2)]" : ""
                  }`}
                />

                {/* Corner accent */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-purple-500/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:bg-purple-500/30 transition-colors duration-500" />

                {/* Content container */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
                  {/* Default state - just phase title */}
                  <div
                    className={`absolute inset-0 flex items-end justify-center pb-8 transition-all duration-500 ${
                      isHovered ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                    }`}
                  >
                    <span className="text-gray-400 font-medium">{phase.title}</span>
                  </div>

                  {/* Hover state - full content */}
                  <div
                    className={`flex flex-col items-center text-center transition-all duration-500 ${
                      isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                    }`}
                  >
                    {/* Icon with glow */}
                    <div
                      className={`mb-3 p-3 rounded-xl bg-purple-500/20 transition-all duration-300 ${
                        isHovered ? "shadow-[0_0_20px_rgba(168,85,247,0.4)]" : ""
                      }`}
                    >
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-1">{phase.subtitle}</h3>
                    <span className="text-xs text-purple-400 mb-3">{phase.title}</span>

                    {/* Description */}
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">{phase.description}</p>

                    {/* Details list */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {phase.details.map((detail, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom shine effect on hover */}
                <div
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent transition-opacity duration-500 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
