"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Digital Foundation",
    price: "$500pm",
    description: "",
    features: ["Unlimited Revisions", "Rocket-Fast Delivery", "72-hour guaranteed deployment"],
    highlighted: false,
  },
  {
    name: "Design Partner",
    price: "$2,500pm",
    description: "",
    features: [
      "Everything in Digital Foundation +",
      "All Design Files for Visual Assets",
      "More, Custom Media Graphics, Email Templates",
      "Custom Automations",
    ],
    highlighted: true,
  },
  {
    name: "Growth Partner",
    price: "$1,000pm",
    description: "",
    features: [
      "Original marketing copy every month",
      "Access AI Chatbot",
      "Monthly Performance Audit",
      "Expanded Site Capabilities",
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
    <section id="pricing" className="px-4 py-20 relative overflow-visible">
      <div className="max-w-5xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Transparent Investment. Accelerated Growth.</h2>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
          Simple, value-driven engagements designed for startups and scale-ups that can&apos;t afford to wait months for
          a world-class presence.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-6 backdrop-blur-sm ${
                plan.highlighted
                  ? "bg-gradient-to-b from-purple-500/20 to-purple-900/10 border-2 border-purple-500/50 shadow-lg shadow-purple-500/10"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              <h3 className="font-semibold mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold mb-4">{plan.price}</div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <p className="text-gray-500 text-sm mb-4">Included:</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={scrollToContact}
                className={`w-full rounded-full ${
                  plan.highlighted
                    ? "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                Contact
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
