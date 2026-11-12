"use client"

import { useState } from "react"
import { Brain, Network, Zap } from "lucide-react"

const phases = [
  {
    number: 1,
    title: "Step 01",
    subtitle: "Plan & Scope",
    icon: Brain,
    description:
      "We review your daily workflows and software requirements to pinpoint exactly what to build and what tasks can be automated with AI.",
    details: ["Process Review", "Software Spec", "Tool Connections", "Clear Roadmap"],
  },
  {
    number: 2,
    title: "Step 02",
    subtitle: "Code & Connect",
    icon: Network,
    description:
      "We build your custom web app or internal tool and connect AI directly into your existing software—like your CRM, email, and Slack.",
    details: ["Custom Web Apps", "API Integrations", "AI Assistants", "Automated Triggers"],
  },
  {
    number: 3,
    title: "Step 03",
    subtitle: "Launch & Support",
    icon: Zap,
    description:
      "We test thoroughly, train your team, and deploy reliable software and automations that run smoothly around the clock.",
    details: ["Thorough Testing", "Team Handover", "Live Monitoring", "Ongoing Support"],
  },
] 

export function Phases() {
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null)

  return (
    <section className="px-4 py-24 bg-black/95 backdrop-blur-md">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white tracking-tight">
          How We Build <span className="text-slate-400">Software & Automations</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-16 text-sm md:text-base">
          No endless meetings or tech buzzwords. We understand how your business works, write clean code, and set up automations that save your team hours every day.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {phases.map((phase) => {
            const Icon = phase.icon
            const isHovered = hoveredPhase === phase.number

            return (
              <div
                key={phase.number}
                className="relative bg-white/[0.02] border border-white/5 rounded-[2.5rem] aspect-square overflow-hidden cursor-pointer group transition-all duration-500 hover:bg-white/[0.04]"
                onMouseEnter={() => setHoveredPhase(phase.number)}
                onMouseLeave={() => setHoveredPhase(null)}
              >
                {/* Subtle Slate Background Glow on hover */}
                <div
                  className={`absolute inset-0 bg-slate-500/5 transition-opacity duration-700 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Content container */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
                  
                  {/* Default state - Minimalist Step Title */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
                      isHovered ? "opacity-0 scale-90" : "opacity-100 scale-100"
                    }`}
                  >
                    <span className="text-slate-500 font-medium tracking-[0.3em] uppercase text-[10px]">
                      {phase.title}
                    </span>
                  </div>

                  {/* Hover state - Functional Details */}
                  <div
                    className={`flex flex-col items-center text-center transition-all duration-700 ease-in-out ${
                      isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                  >
                    {/* Icon Box */}
                    <div className="mb-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                      <Icon className="w-5 h-5 text-white opacity-80" />
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-1">{phase.subtitle}</h3>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-4">
                      {phase.title}
                    </span>

                    <p className="text-xs text-gray-500 mb-6 leading-relaxed px-2">
                      {phase.description}
                    </p>

                    {/* Details tags */}
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {phase.details.map((detail, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-2.5 py-1 rounded-full bg-white/[0.03] text-slate-300 border border-white/5 font-medium"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom line accent (Slate version) */}
                <div
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-slate-500/50 to-transparent transition-opacity duration-700 ${
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