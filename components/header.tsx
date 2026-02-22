"use client"

import { useState } from "react"
import { Menu, X, ArrowRight } from "lucide-react"

const navItems = [
  { label: "Home", href: "#hero" },
  { label: "Engine", href: "#stats" },
  { label: "Portfolio", href: "#projects" },
  { label: "Pricing", href: "#pricing" },
  { label: "Process", href: "#phases" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-5 bg-black/95">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Section */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => scrollToSection("#hero")}>
          <div className="p-1.5 rounded-lg">
            <img 
              src="/logo.svg" 
              alt="StellarCode Logo" 
              className="w-5 h-5 object-contain opacity-90"
            />
          </div>
          <span className="font-semibold text-sm tracking-[0.2em] text-white uppercase">
            StellarCode
          </span>
        </div>

        {/* Desktop Navigation - Slate Pill */}
        <nav className="hidden md:flex items-center gap-1 bg-black/40 backdrop-blur-xl rounded-full px-1.5 py-1.5 border border-white/[0.08] shadow-2xl shadow-black">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.href)}
              className="px-5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 hover:text-white transition-all duration-300 rounded-full hover:bg-white/[0.05]"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Button - High Contrast */}
        <div className="hidden md:block">
          <button 
            onClick={() => scrollToSection("#contact")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
          >
            Start Audit
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center md:hidden">
          <button 
            className="p-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Matte Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-6 right-6 mt-4 bg-black/95 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/[0.03] rounded-2xl text-left transition-all border border-transparent hover:border-white/5"
              >
                {item.label}
              </button>
            ))}
            <button 
               onClick={() => scrollToSection("#contact")}
               className="mt-4 w-full py-5 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center"
            >
              Free AI Audit
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}