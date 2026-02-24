"use client"

import { ArrowLeft, BarChart3, Fingerprint, TrendingDown, Layers, Zap, CheckCircle, ShieldCheck, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const metrics = [
  { label: "Revenue Recovery", value: "22%", icon: Zap },
  { label: "Churn Reduction", value: "3.4x", icon: TrendingDown },
  { label: "Billing Accuracy", value: "100%", icon: Fingerprint },
]

export default function FairpayCaseStudy() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/10 font-sans">
      {/* Navigation Briefing */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Back to Terminal</span>
          </Link>
          <div className="hidden md:block text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Project Ref: <span className="text-white">FP_2025_PRED</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">
            <CreditCard className="w-3 h-3" />
            SaaS & Fintech
          </div>
          
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-8 leading-[0.9]">
            Fairpay <br />
            <span className="text-slate-500">Predictive Billing.</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed mb-12">
            For high-volume SaaS platforms, failed payments aren&apos;t just a nuisance—they are a silent killer. We built an intelligent recovery engine that predicts churn before the credit card is even declined.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((m, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col items-center text-center group hover:bg-white/[0.04] transition-colors">
                <m.icon className="w-6 h-6 text-slate-500 mb-4 group-hover:text-white transition-colors" />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold mb-4">The Friction</h3>
                <p className="text-gray-400 leading-relaxed">
                  Fairpay was losing over $12,000 monthly due to passive churn. Their standard Stripe dunning emails were being ignored, and their billing team was manually chasing failed invoices once it was already too late to save the customer.
                </p>
              </div>
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold mb-4">The Logic</h3>
                <p className="text-gray-400 leading-relaxed">
                  We engineered a **Node.js middleware** that syncs Stripe event data with a **custom regression model**. The system analyzes usage patterns; if activity drops below a threshold, it triggers a personalized "Value-First" recovery sequence, preventing the cancellation before the billing cycle ends.
                </p>
              </div>
            </div>

            {/* System Visualizer */}
            <div className="relative aspect-square bg-[#050505] border border-white/10 rounded-[3rem] overflow-hidden group p-8 flex flex-col justify-center space-y-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent opacity-50" />
              
              {/* Step 1: Analysis */}
              <div className="relative flex items-center gap-4 bg-white/[0.03] border border-white/5 p-4 rounded-2xl group-hover:border-white/20 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-3/4 animate-pulse" />
                  </div>
                  <p className="text-[8px] font-mono text-slate-500 mt-2 uppercase">Analyzing Usage // Activity Score: 0.24</p>
                </div>
              </div>

              {/* Step 2: Prediction */}
              <div className="relative flex items-center gap-4 bg-white/[0.03] border border-white/5 p-4 rounded-2xl group-hover:border-white/20 transition-all ml-6">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Fingerprint className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-white uppercase tracking-tighter">Churn Risk Detected</p>
                  <p className="text-[8px] font-mono text-orange-500/70">Probability: 89.4% // High Priority</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-orange-500 opacity-50" />
              </div>

              {/* Step 3: Action */}
              <div className="relative flex items-center gap-4 bg-white/[0.03] border border-white/5 p-4 rounded-2xl group-hover:border-white/20 transition-all ml-12">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-full animate-progress-fast" />
                  </div>
                  <p className="text-[8px] font-mono text-slate-500 mt-2 uppercase">Executing Recovery_Flow.seq</p>
                </div>
              </div>

              {/* Background Grid */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
            </div>
          </div>
        </div>
      </section>

      {/* Final ROI Quote */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium mb-12 tracking-tight leading-snug italic text-slate-200">
            "We&apos;re now identifying at-risk customers weeks before they even think about canceling."
          </h2>
          <div className="flex flex-col items-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1">Founder, Fairpay Systems</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-20 border-t border-white/5 px-6 bg-black">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h4 className="text-white font-bold text-lg mb-1">Protect your revenue.</h4>
            <p className="text-slate-500 text-sm">Automate your billing intelligence and stop passive churn.</p>
          </div>
          <Link href="/#contact">
            <Button className="bg-white text-black hover:bg-slate-200 rounded-full px-10 py-7 text-[10px] font-black uppercase tracking-[0.2em] transition-transform hover:scale-105 active:scale-95">
              Request Your Audit
            </Button>
          </Link>
        </div>
      </footer>
    </main>
  )
}