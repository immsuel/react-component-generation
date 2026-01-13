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
    <footer className="px-4 py-12 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-3">
             <div className="flex items-center gap-3">
          <img 
            src="/logo.svg" 
            alt="StellarCode Logo" 
            className="w-7 h-7 object-contain"
          />
          <span className="font-semibold text-lg tracking-tight text-white">
            StellarCode
          </span>
        </div>
            <p className="text-gray-500 text-sm">Merging AI speed with human precision</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-8 md:gap-16">
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {footerLinks.main.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {footerLinks.secondary.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {footerLinks.legal.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
