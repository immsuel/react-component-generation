"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "How is a 72 Hour turnaround even possible?",
    answer:
      "Our streamlined process, expert team, and powerful tooling allow us to move from concept to deployment in record time without sacrificing quality.",
  },
  {
    question: "Is the final website actually custom-coded?",
    answer:
      "Yes, every website we build is hand-coded with modern technologies like Next.js and Tailwind CSS for optimal performance and maintainability.",
  },
  {
    question: "What happens if I don't like the initial preview?",
    answer:
      "We offer unlimited revisions to ensure you're completely satisfied with the final result. Your vision is our priority.",
  },
  {
    question: "Can you handle complex integrations like e-commerce or SaaS dashboards?",
    answer:
      "Absolutely. We specialize in complex web applications including e-commerce platforms, SaaS dashboards, and custom integrations.",
  },
  {
    question: "Do you work with clients outside of my time zone?",
    answer:
      "Yes, we work with clients globally and have experience managing projects across different time zones seamlessly.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="px-4 py-20">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Navigating the Unknown</h2>
        <p className="text-gray-400 text-center mb-12">
          Answers to your questions about our 72-hour delivery, custom architecture, and the technology that makes it
          all possible.
        </p>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-white/10 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && <div className="px-5 pb-5 text-gray-400">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
