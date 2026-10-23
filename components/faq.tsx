"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

const faqs = [
  {
    question: "What kind of software and automations do you build?",
    answer:
      "We design and build custom web applications, internal tools, customer portals, and AI automations. That includes AI customer support assistants, lead qualification systems, CRM integrations, automated billing pipelines, and custom dashboards tailored to your exact workflow.",
  },
  {
    question: "How fast can you deliver a project?",
    answer:
      "Most automation workflows and AI assistants are built, tested, and live within 72 hours. For custom software applications and full-scale web platforms, we work in rapid sprints, delivering working software in days rather than waiting months.",
  },
  {
    question: "Is our business data secure with AI?",
    answer:
      "Yes, absolutely. We use enterprise-tier APIs from providers like OpenAI and Anthropic with zero-data-retention policies, meaning your data is never used to train public AI models. We also apply end-to-end encryption and strict security standards to all custom software.",
  },
  {
    question: "Can you connect with our existing tools and software?",
    answer:
      "Yes. If your software has an API or webhook, we can connect it. We regularly integrate with tools like HubSpot, Salesforce, Airtable, Google Workspace, Slack, WhatsApp, Xero, Stripe, and custom databases.",
  },
  {
    question: "Do we own the software and automations you build?",
    answer:
      "Yes, 100%. You own all the source code, automation accounts, and intellectual property. When the project is complete, you have complete administrative access and control over everything.",
  },
  {
    question: "What happens if an automation fails or needs changes?",
    answer:
      "We build robust error handling and notifications into every system so you are alerted immediately if anything needs attention. We also provide ongoing support to monitor, optimize, and update your software and workflows as your business evolves.",
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
          Frequently Asked <span className="text-slate-500">Questions</span>
        </h2>
        <p className="text-gray-400 text-center mb-16 text-sm md:text-base max-w-xl mx-auto">
          Clear answers about how we build software, set up AI automations, and keep your business running smoothly.
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