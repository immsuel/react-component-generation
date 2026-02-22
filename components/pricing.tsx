"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Workflow Starter",
    price: "R 6,250",
    period: "pm",
    description: "Perfect for local SMEs looking to eliminate repetitive manual tasks.",
    features: [
      "2 Custom Zapier/Make Automations",
      "Lead Capture & CRM Integration",
      "Auto-Reply Email Systems",
      "72-hour Priority Support",
    ],
    highlighted: false,
  },
  {
    name: "AI Scaling Partner",
    price: "R 16,500",
    period: "pm",
    description: "Deep AI integration to handle customer service and internal operations.",
    features: [
      "Custom Trained AI Chatbot (GPT-4o)",
      "Knowledge Base Synchronization",
      "Advanced Multi-step Workflows",
      "Weekly Performance Optimization",
      "Slack/Discord Team Integration",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise Intelligence",
    price: "R 32,000",
    period: "pm",
    description: "Full-scale AI transformation for data-heavy organizations.",
    features: [
      "Custom LLM Fine-tuning",
      "Proprietary Data Vectorization",
      "Automated Monthly ROI Reports",
      "Dedicated Solutions Architect",
      "Unlimited Workflow Revisions",
    ],
    highlighted: false,
  },
]

export function Pricing() {
  const scrollToContact = () => {
    const element = document.querySelector("#contact")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="pricing" className="px-4 py-24 relative overflow-visible bg-black/95 backdrop-blur-md">
      {/* Neutralized Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-500/5 blur-[140px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white tracking-tight">
            Buy Back Your Time. <span className="text-slate-500">Automate Everything.</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
            Stop wasting hours on manual work. Our AI systems operate 24/7, 
            letting your team focus on high-leverage strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`flex flex-col rounded-[2.5rem] p-10 backdrop-blur-md transition-all duration-500 ${
                plan.highlighted
                  ? "bg-white/[0.04] border border-white/20 shadow-2xl shadow-white/5 relative z-20 md:scale-105"
                  : "bg-white/[0.02] border border-white/5 opacity-80"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black text-[9px] font-bold uppercase tracking-[0.2em] rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="font-medium text-slate-400 text-sm uppercase tracking-[0.2em] mb-4">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white tracking-tighter">{plan.price}</span>
                  <span className="text-gray-600 text-xs font-semibold">{plan.period}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed min-h-[40px]">
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 border-t border-white/5 pt-8 mb-10">
                <p className="text-gray-600 text-[10px] font-semibold uppercase tracking-[0.2em] mb-6">
                  System Capabilities:
                </p>
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400 group">
                      <Check className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <span className="group-hover:text-white transition-colors duration-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={scrollToContact}
                className={`w-full py-7 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-white text-black hover:bg-slate-200"
                    : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                }`}
              >
                Start Automating
              </Button>
            </div>
          ))}
        </div>
        
        {/* Value Add for SA Context */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest italic">
            * All prices are billed monthly. No long-term lock-in. Cancel any time.
          </p>
        </div>
      </div>
    </section>
  )
}