"use client"

import { useState } from "react"
import { ExternalLink, CheckCircle2 } from "lucide-react"
import Link from "next/link" // Import Link for navigation

const projects = [
  {
    id: "VELARI",
    title: "VELARI",
    slug: "/velaricasestudy", // Added the path to your new file
    type: "Autonomous Support Ecosystem",
    year: "2026",
    image: "/Velari.jpg",
    tags: ["OpenAI", "Vector DB", "Real-time Sync"],
    description: "Built a fully autonomous support layer that reduced human ticket volume by 72% within the first month.",
  },
  {
    id: "FAIRPAY",
    title: "FAIRPAY",
    slug: "/fairpay-case-study",
    type: "Predictive Billing Logic",
    year: "2025",
    image: "/Fairpay.jpg",
    tags: ["Regression Models", "Stripe API", "Node.js"],
    description: "Developed a custom billing engine that predicts churn risks and automates recovery sequences.",
  },
  {
    id: "MYM CONSULTING",
    title: "MYM CONSULTING",
    slug: "/mym-case-study",
    type: "Lead Intelligence System",
    year: "2025",
    image: "/MYM.jpg",
    tags: ["Make.com", "Enrichment API", "Slack"],
    description: "Automated the entire lead scoring process, delivering enriched profiles directly to the sales team.",
  },
]

export function Projects() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="px-4 py-24 relative overflow-visible bg-black/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* Left Side: Client List */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-400 text-[10px] font-medium uppercase tracking-[0.3em] mb-8">
              <CheckCircle2 className="w-3 h-3 opacity-70" />
              <span>Proven Results</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-white tracking-tight">
              Deployed <span className="text-slate-500">Logic.</span>
            </h2>
            
            <p className="text-gray-500 mb-16 max-w-sm leading-relaxed text-sm">
              We don&apos;t just build interfaces; we build engines. Explore how we&apos;ve automated operations for global industry leaders.
            </p>

            <div className="space-y-10">
              {projects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="group cursor-pointer"
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {/* Clicking the name now also takes you to the case study */}
                  <Link href={project.slug} className="flex items-center gap-6">
                    <div className={`h-[1px] transition-all duration-700 bg-gradient-to-r from-slate-400 to-transparent ${
                      activeIndex === index ? "w-12 opacity-100" : "w-0 opacity-0"
                    }`} />
                    
                    <span
                      className={`text-2xl md:text-4xl font-bold tracking-tighter transition-all duration-500 ${
                        activeIndex === index ? "text-white translate-x-2" : "text-gray-800 group-hover:text-gray-500"
                      }`}
                    >
                      {project.title}
                    </span>
                  </Link>
                  
                  {activeIndex === index && (
                    <div className="ml-20 mt-3 text-slate-500 text-[10px] font-medium uppercase tracking-[0.2em] animate-in fade-in slide-in-from-left-4 duration-500">
                      {project.type}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Project Preview */}
          <div className="relative lg:sticky lg:top-24">
            <div className="absolute -top-10 right-0 text-gray-700 font-medium text-[9px] tracking-[0.4em] uppercase">
              Project Archive // {projects[activeIndex].year}
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-8 bg-slate-500/5 blur-[100px] rounded-[3rem] transition-opacity duration-1000 group-hover:opacity-100 opacity-40 pointer-events-none" />
              
              <div className="relative bg-[#050505] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md transition-all duration-500 group-hover:border-white/10">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={projects[activeIndex].image}
                    alt={projects[activeIndex].title}
                    className="w-full h-full object-cover transition-transform duration-1000 scale-[1.01] group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                </div>
                
                <div className="p-10 bg-gradient-to-b from-white/[0.02] to-transparent">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {projects[activeIndex].tags.map(tag => (
                      <span key={tag} className="text-[9px] px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-md text-slate-500 font-medium tracking-wide uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-gray-500 text-sm leading-relaxed mb-8 font-normal">
                    {projects[activeIndex].description}
                  </p>
                  
                  {/* Updated Button to Link */}
                  <Link 
                    href={projects[activeIndex].slug}
                    className="inline-flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-[0.2em] group/btn transition-colors hover:text-slate-300"
                  >
                    Technical Breakdown 
                    <ExternalLink className="w-3 h-3 opacity-60 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                  </Link>
                </div>

                <div className="absolute top-6 right-6 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full text-[9px] font-bold text-white border border-white/20 tracking-[0.1em]">
                  SYSTEM LIVE
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}