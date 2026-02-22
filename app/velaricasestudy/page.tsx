"use client"

import { ArrowLeft, BarChart3, Fingerprint, Globe, Layers, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const metrics = [
  { label: "Manual Input Reduced", value: "92%", icon: Zap },
  { label: "Processing Speed", value: "14x", icon: BarChart3 },
  { label: "Data Accuracy", value: "100%", icon: Fingerprint },
]

export default function VelariaCaseStudy() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/10">
      {/* Navigation Briefing */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Back to Terminal</span>
          </Link>
          <div className="hidden md:block text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Project Ref: <span className="text-white">VEL_092_SA</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">
            <Globe className="w-3 h-3" />
            E-Commerce Logistics
          </div>
          
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-8 leading-[0.9]">
            Velaria <br />
            <span className="text-slate-500">Autonomous Supply.</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed mb-12">
            Scaling a luxury furniture brand across South Africa meant managing 400+ custom orders weekly. We replaced their manual dispatch team with a self-correcting AI logic engine.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((m, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                <m.icon className="w-6 h-6 text-slate-500 mb-4" />
                <div className="text-4xl font-bold mb-1 tracking-tighter">{m.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution Grid */}
      <section className="py-24 px-6 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-12">
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold mb-4">The Friction</h3>
                <p className="text-gray-400 leading-relaxed">
                  Velaria’s staff spent 6 hours a day manually typing shipping labels and cross-referencing inventory in Excel. Human error led to a 4% mis-shipment rate, costing roughly R45,000 in monthly logistics overhead.
                </p>
              </div>
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold mb-4">The Logic</h3>
                <p className="text-gray-400 leading-relaxed">
                  We deployed a multi-stage **Make.com pipeline** combined with **GPT-4o data cleaning**. The system now intercepts Shopify orders, validates the SA postal codes, assigns a local courier based on weight, and notifies the warehouse without a single human click.
                </p>
              </div>
            </div>

            <div className="relative aspect-square md:aspect-auto bg-white/[0.03] border border-white/10 rounded-[3rem] overflow-hidden group">
              {/* This represents where a project screenshot would go */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center p-12">
                 <div className="w-full h-full border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center space-y-4">
                    <Layers className="w-12 h-12 text-white/10" />
                    <span className="text-[10px] uppercase tracking-widest text-white/20">System Architecture Visual</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final ROI Quote */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-medium mb-10 tracking-tight">
            "We didn't just save time; we regained the ability to scale without adding more salary overhead. StellarCode fixed the foundation."
          </h2>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 mb-4 overflow-hidden border border-white/10">
               {/* CEO Avatar Placeholder */}
            </div>
            <p className="text-sm font-bold uppercase tracking-widest">Andre Viljoen</p>
            <p className="text-xs text-slate-500">Director, Velaria Logistics</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-20 border-t border-white/5 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-400 text-sm italic">Ready to see similar results in your engine?</p>
          <Link href="/#contact">
            <Button className="bg-white text-black hover:bg-slate-200 rounded-full px-8 py-6 text-xs font-black uppercase tracking-widest">
              Request Your Audit
            </Button>
          </Link>
        </div>
      </footer>
    </main>
  )
}