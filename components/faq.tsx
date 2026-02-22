"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

const faqs = [
  {
    question: "How is a 72-hour turnaround for AI possible?",
    answer:
      "We don't start from zero. We use our proprietary library of pre-built automation logic and API middleware. This allows us to focus 100% of the time on your specific data mapping and agent prompting rather than basic infrastructure.",
  },
  {
    question: "Is my data secure when using your AI agents?",
    answer:
      "Absolutely. We primarily build using Enterprise-grade APIs from OpenAI and Anthropic that do not train on your business data. We also implement custom encryption layers for any sensitive API handshakes.",
  },
  {
    question: "What exactly do I 'own' after the 72 hours?",
    answer:
      "You own the full logic architecture. Whether we build it in a custom Next.js environment or an automation platform like Make.com, you have full administrative control and ownership of the accounts and code.",
  },
  {
    question: "Can your automations handle complex legacy systems?",
    answer:
      "Yes. If your software has an API, we can connect to it. If it doesn't, we can often use browser-based automation or custom webhooks to bridge the gap between your old tools and new AI logic.",
  },
  {
    question: "What happens if the AI makes a mistake?",
    answer:
      "We build 'Human-in-the-loop' systems for sensitive tasks. You can set confidence thresholds where the AI will flag a task for your approval rather than executing it autonomously, ensuring 100% oversight.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="px-4 py-24 relative bg-black/95 backdrop-blur-md border-t border-white/[0.02]">
      <div className="max-w-3xl mx-auto">
        
        {/* Minimalist Header Icon */}
        <div className="flex justify-center mb-8">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                <HelpCircle className="w-5 h-5 text-slate-400 opacity-80" />
            </div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4 text-white tracking-tight">
          System <span className="text-slate-500">Architecture</span> FAQs
        </h2>
        <p className="text-gray-500 text-center mb-16 text-sm md:text-base max-w-xl mx-auto">
          Technical insights into our 72-hour delivery, data security protocols, and the autonomous logic layers we deploy.
        </p>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`transition-all duration-500 rounded-[1.5rem] overflow-hidden border ${
                openIndex === index 
                  ? "border-white/20 bg-white/[0.04] shadow-2xl shadow-white/5" 
                  : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]"
              }`}
            >
              <button
                className="w-full flex items-center justify-between p-7 text-left transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className={`text-sm md:text-base font-medium transition-colors duration-300 ${
                  openIndex === index ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                }`}>
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-500 ${
                    openIndex === index ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>
              
              <div 
                className={`transition-all duration-500 ease-in-out ${
                    openIndex === index ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-7 pb-7 text-gray-500 text-sm leading-relaxed border-t border-white/5 pt-5 mt-1">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}