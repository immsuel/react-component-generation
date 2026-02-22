"use client"

import { Cpu, Zap, Link, Bot, BrainCircuit } from "lucide-react"

const integrations = [
  { name: "OpenAI", icon: BrainCircuit },
  { name: "Anthropic", icon: Bot },
  { name: "Make.com", icon: Link },
  { name: "Zapier", icon: Zap },
  { name: "Pinecone", icon: Cpu },
]

export function TrustedBy() {
  return (
    <section className="py-12 bg-black/95 backdrop-blur-md border-y border-white/[0.03]">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-center text-gray-600 text-[10px] font-medium uppercase tracking-[0.4em] mb-10">
          Powering Automations with Industry Leaders
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20">
          {integrations.map((brand) => (
            <div 
              key={brand.name} 
              className="flex items-center gap-2.5 group cursor-default transition-opacity duration-500 opacity-40 hover:opacity-100"
            >
              <brand.icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-300" />
              <span className="text-slate-300 group-hover:text-white font-medium tracking-tight text-sm md:text-base transition-colors duration-300">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}