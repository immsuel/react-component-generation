"use client"

import { Star } from "lucide-react"

const footerLinks = {
  main: [
    { label: "Preview", href: "#hero" },
    { label: "Engine", href: "#stats" },
    { label: "Portfolio", href: "#projects" },
    { label: "Pricing", href: "#pricing" },
    { label: "Process", href: "#phases" },
  ],
  secondary: [
    { label: "About Us", href: "#" },
    { label: "Team", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
}

export function Footer() {
  const scrollToSection = (href: string) => {
    if (href === "#") return
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="px-4 py-16 relative bg-black/95 backdrop-blur-md border-t border-white/[0.03]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/10">
                <img 
                  src="/logo.svg" 
                  alt="StellarCode Logo" 
                  className="w-5 h-5 object-contain opacity-80"
                />
              </div>
              <span className="font-semibold text-base tracking-tight text-white uppercase tracking-[0.15em]">
                StellarCode
              </span>
            </div>
            <p className="text-gray-600 text-[11px] uppercase tracking-widest leading-relaxed max-w-[200px]">
              Merging AI speed with human precision. Deployed in 72h.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-16 gap-y-10">
            {/* Column 1: Navigation */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Navigation</span>
              {footerLinks.main.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="text-xs text-gray-500 hover:text-white transition-colors text-left w-fit"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Column 2: Company */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Company</span>
              {footerLinks.secondary.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="text-xs text-gray-500 hover:text-white transition-colors text-left w-fit"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Column 3: Legal */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Legal</span>
              {footerLinks.legal.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="text-xs text-gray-500 hover:text-white transition-colors text-left w-fit"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/[0.03] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-700 uppercase tracking-widest">
            © 2026 StellarCode Intelligence. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-slate-500 uppercase tracking-[0.2em]">Systems Fully Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}