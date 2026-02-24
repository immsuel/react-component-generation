"use client"

import type React from "react"
import { useState } from "react"
import { Send, User, Mail, MessageSquare, Briefcase, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const SERVICE_OPTIONS = [
  "Handle Customer Chats",
  "Automate Repetitive Tasks",
  "Sales & Lead Follow-up",
  "Connect My Current Apps",
  "Data Reports & Insights",
  "Custom AI Strategy"
]

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  })

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service) 
        : [...prev, service]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    const submissionData = {
      ...formData,
      needs: selectedServices.join(", "),
    }

    try {
      const response = await fetch("https://formspree.io/f/mjgeazya", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(submissionData),
      })

      if (response.ok) {
        setStatus("success")
        setFormData({ name: "", email: "", company: "", message: "" })
        setSelectedServices([])
        setTimeout(() => setStatus("idle"), 5000)
      } else {
        setStatus("error")
      }
    } catch (error) {
      setStatus("error")
    }
  }

  return (
    <section id="contact" className="px-4 py-24 relative bg-black/95 backdrop-blur-md">
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white tracking-tight">
            Let’s Put Your Business on <span className="text-slate-500">Autopilot</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
            Tell us what's slowing you down. We'll show you how AI can handle it in 72 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all text-sm"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="Work Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all text-sm"
                required
              />
            </div>
          </div>

          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Business Name"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all text-sm"
            />
          </div>

          {/* Service Selection: Re-styled as matte chips */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2 ml-1 uppercase tracking-[0.2em]">
             
              Primary Automation Goals
            </label>
            <div className="grid grid-cols-2 gap-3">
              {SERVICE_OPTIONS.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`py-4 px-3 rounded-2xl border text-[11px] font-semibold tracking-tight transition-all duration-300 ${
                    selectedServices.includes(service)
                      ? "bg-white text-black border-white shadow-xl shadow-white/5"
                      : "bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/10"
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
            <textarea
              placeholder="Tell us about the biggest bottleneck in your company..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all resize-none text-sm"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={status === "loading"}
            className={`w-full py-8 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                status === "success" 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" 
                : "bg-white text-black hover:bg-slate-200"
            }`}
          >
            {status === "loading" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : status === "success" ? (
              "Message Logged"
            ) : (
              "Request Free AI Audit"
            )}
          </Button>
        </form>
      </div>
    </section>
  )
}