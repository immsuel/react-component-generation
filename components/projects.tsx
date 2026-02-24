"use client"

import { useState } from "react"
import { ExternalLink, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const projects = [
  {
    id: "VELARI",
    title: "VELARI",
    slug: "/velaricasestudy",
    type: "Autonomous Support Ecosystem",
    year: "2026",
    // Logic "blueprint" for the preview
    code: `class SupportAgent {
  async process(ticket) {
    const context = await vectorDB.query(ticket.query);
    const response = await openai.generate({
      system: "Identify intent & resolve",
      context: context
    });
    return response.autoReply();
  }
}`,
    tags: ["OpenAI", "Vector DB", "Real-time Sync"],
    description: "Built a fully autonomous support layer that reduced human ticket volume by 72% within the first month.",
  },
  {
    id: "FAIRPAY",
    title: "FAIRPAY",
    slug: "/fairpaycasestudy",
    type: "Predictive Billing Logic",
    year: "2025",
    code: `function predictChurn(user) {
  const score = models.regression.analyze({
    activity: user.last30Days,
    payments: user.history
  });
  
  if (score > 0.85) {
    triggerRecoverySequence(user.id);
  }
}`,
    tags: ["Regression Models", "Stripe API", "Node.js"],
    description: "Developed a custom billing engine that predicts churn risks and automates recovery sequences.",
  },
  {
    id: "MYM CONSULTING",
    title: "MYM CONSULTING",
    slug: "/mymcasestudy",
    type: "Lead Intelligence System",
    year: "2025",
    code: `export const leadFlow = {
  trigger: "new_webhook",
  steps: [
    enrichData("Apollo.io"),
    scoreLead({ criteria: "ICP" }),
    notifyChannel("#sales-leads")
  ]
};`,
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

          {/* Right Side: Code Preview */}
          <div className="relative lg:sticky lg:top-24">
            <div className="absolute -top-10 right-0 text-gray-700 font-medium text-[9px] tracking-[0.4em] uppercase">
              Core Engine // {projects[activeIndex].year}
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-8 bg-blue-500/5 blur-[100px] rounded-[3rem] transition-opacity duration-1000 group-hover:opacity-100 opacity-40 pointer-events-none" />
              
              <div className="relative bg-[#080808] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md transition-all duration-500 group-hover:border-white/10">
                {/* Code Window Header */}
                <div className="flex items-center gap-1.5 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                  <div className="w-2 h-2 rounded-full bg-red-500/20" />
                  <div className="w-2 h-2 rounded-full bg-orange-500/20" />
                  <div className="w-2 h-2 rounded-full bg-green-500/20" />
                  <span className="ml-2 text-[10px] text-slate-600 font-mono uppercase tracking-widest">engine.ts</span>
                </div>

                <div className="aspect-[4/3] overflow-hidden p-8 font-mono text-sm leading-relaxed">
                  <pre className="text-slate-400">
                    <code className="block whitespace-pre-wrap">
                      {projects[activeIndex].code.split('\n').map((line, i) => (
                        <div key={i} className="flex gap-4">
                          <span className="text-slate-700 w-4 text-right select-none">{i + 1}</span>
                          <span className={line.includes('class') || line.includes('function') ? 'text-blue-400' : 'text-slate-400'}>
                            {line}
                          </span>
                        </div>
                      ))}
                    </code>
                  </pre>
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
                  
                  <Link 
                    href={projects[activeIndex].slug}
                    className="inline-flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-[0.2em] group/btn transition-colors hover:text-slate-300"
                  >
                    Technical Breakdown 
                    <ExternalLink className="w-3 h-3 opacity-60 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                  </Link>
                </div>

                <div className="absolute top-16 right-6 px-4 py-1.5 bg-green-500/10 backdrop-blur-xl rounded-full text-[9px] font-bold text-green-500/80 border border-green-500/20 tracking-[0.1em]">
                  NODE_ACTIVE
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}