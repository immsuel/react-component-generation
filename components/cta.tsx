"use client"

import { useState } from "react"
import { ArrowRight, Calculator, Zap, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTA() {
  const [hours, setHours] = useState(20)
  const [rate, setRate] = useState(50)

  // Calculations: (Weekly Hours * Rate * 52 Weeks) * 85% Efficiency Gain
  const annualWaste = hours * rate * 52
  const potentialSavings = Math.round(annualWaste * 0.85)

  return (
    <section className="px-4 py-24 relative bg-black/95 backdrop-blur-md">
      {/* Outer Container with softer, more neutral gradients */}
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-white/[0.03] via-transparent to-slate-500/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-14 backdrop-blur-2xl relative overflow-hidden">
        
        {/* Subdued Ambient Glow - changed from purple to a soft slate-blue with lower opacity */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-slate-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            {/* Tag: Muted indigo instead of bright purple */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-400/5 border border-white/10 text-slate-400 text-xs font-mono mb-8">
              <Calculator className="w-3.5 h-3.5 opacity-70" />
              <span className="tracking-wide">Efficiency Analysis</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-white leading-[1.1] tracking-tight">
              Calculate your <br />
              <span className="text-slate-300">Automation ROI.</span>
            </h2>
            
            <p className="text-gray-500 mb-10 text-lg max-w-md">
              Manual workflows create hidden overhead. Visualize the capital impact of transitioning to autonomous logic.
            </p>
            
            <div className="space-y-8">
              <div className="group">
                <div className="flex justify-between mb-4">
                  <label className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors">Weekly Manual Labor</label>
                  <span className="text-gray-300 font-mono bg-white/5 px-3 py-1 rounded-md border border-white/5 text-xs">{hours} Hours</span>
                </div>
                <input 
                  type="range" min="5" max="160" value={hours} 
                  onChange={(e) => setHours(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-slate-400 hover:accent-slate-300 transition-all"
                />
              </div>

              <div className="group">
                <div className="flex justify-between mb-4">
                  <label className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors">Resource Rate</label>
                  <span className="text-gray-300 font-mono bg-white/5 px-3 py-1 rounded-md border border-white/5 text-xs">${rate}/hr</span>
                </div>
                <input 
                  type="range" min="15" max="250" step="5" value={rate} 
                  onChange={(e) => setRate(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-slate-400 hover:accent-slate-300 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Much softer center glow */}
            <div className="absolute inset-0 bg-slate-500/5 blur-3xl rounded-full" />
            
            <div className="relative bg-white/[0.01] border border-white/10 rounded-3xl p-8 md:p-10 text-center flex flex-col justify-center backdrop-blur-sm">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <TrendingDown className="w-8 h-8 text-slate-400/80" />
                </div>
              </div>
              
              <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mb-3 font-medium">Estimated Annual Savings</p>
              <div className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tighter">
                ${potentialSavings.toLocaleString()}
              </div>
              
              <div className="space-y-4">
                <Button className="w-full bg-white text-black hover:bg-gray-200 rounded-xl py-7 text-lg font-semibold transition-all shadow-none group">
                  Reclaim Capital
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Zap className="w-3 h-3 fill-current opacity-40" />
                  <p className="text-[9px] uppercase tracking-widest font-mono opacity-60">Based on 85% autonomous efficiency</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}