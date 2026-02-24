"use client"

import { useState, useMemo } from "react"
import { ArrowRight, Wallet, Clock, TrendingDown, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTA() {
  const [hours, setHours] = useState(20)
  const [rate, setRate] = useState(450) // Average mid-level SA hourly rate

  // useMemo ensures the calculation is lightning fast and doesn't lag the slider
  const potentialSavings = useMemo(() => {
    const annualWaste = hours * rate * 52
    return Math.round(annualWaste * 0.85)
  }, [hours, rate])

  // Formatter for South African Rand
  const formatRand = (val: number) => 
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(val)

  return (
    <section className="px-4 py-24 relative bg-black/95 backdrop-blur-md">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-white/[0.03] via-transparent to-slate-500/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-14 backdrop-blur-2xl relative overflow-hidden">
        
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-slate-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-400/5 border border-white/10 text-slate-400 text-xs font-mono mb-8">
              <Clock className="w-3.5 h-3.5 opacity-70" />
              <span className="tracking-wide">Time Leak Analysis</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-white leading-[1.1] tracking-tight">
              See how much <br />
              <span className="text-slate-300">human time you're wasting.</span>
            </h2>
            
            <p className="text-gray-500 mb-10 text-lg max-w-md">
              Most teams lose 20+ hours a week to tasks that don't require a brain. Calculate what that's costing your bottom line.
            </p>
            
            <div className="space-y-8">
              <div className="group">
                <div className="flex justify-between mb-4">
                  <label className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors italic">Lost hours per week</label>
                  <span className="text-white font-mono bg-white/5 px-3 py-1 rounded-md border border-white/5 text-sm">{hours} Hours</span>
                </div>
                <input 
                  type="range" min="5" max="160" value={hours} 
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white transition-all"
                />
              </div>

              <div className="group">
                <div className="flex justify-between mb-4">
                  <label className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors italic">Average staff hourly cost</label>
                  <span className="text-white font-mono bg-white/5 px-3 py-1 rounded-md border border-white/5 text-sm">R{rate}/hr</span>
                </div>
                <input 
                  type="range" min="150" max="2500" step="50" value={rate} 
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-slate-500/5 blur-3xl rounded-full" />
            
            <div className="relative bg-white/[0.01] border border-white/10 rounded-3xl p-8 md:p-10 text-center flex flex-col justify-center backdrop-blur-sm">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <TrendingDown className="w-8 h-8 text-slate-400/80" />
                </div>
              </div>
              
              <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mb-3 font-medium">Money you could save every year</p>
              <div className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tighter">
                {formatRand(potentialSavings)}
              </div>
              
              <div className="space-y-4">
                <Button className="w-full bg-white text-black hover:bg-gray-200 rounded-xl py-7 text-lg font-semibold transition-all shadow-none group">
                  Stop the Leaks
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}