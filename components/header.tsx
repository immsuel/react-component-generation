"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Preview", href: "#hero" },
  { label: "Pricing", href: "#pricing" },
  { label: "Portfolio", href: "#projects" },
  { label: "Process", href: "#phases" },
  { label: "Features", href: "#stats" },
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
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[#08080f]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo Section */}
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

        {/* Desktop Navigation - Glass Pill */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-full px-2 py-1 border border-white/10">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.href)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full border border-white/5">
            Log In
          </button>
          <Button className="bg-white hover:bg-gray-200 text-black font-semibold rounded-full px-6 h-9 transition-all active:scale-95">
            Sign Up
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#08080f]/95 backdrop-blur-xl border-t border-white/10 p-6 shadow-2xl">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg text-left transition-colors"
              >
                {item.label}
              </button>
            ))}
            <div className="h-px bg-white/10 my-4" />
            <div className="flex flex-col gap-3">
              <button className="px-4 py-3 text-sm text-gray-300 hover:text-white text-left bg-white/5 rounded-lg">
                Log In
              </button>
              <Button className="bg-white text-black hover:bg-gray-200 rounded-lg py-6 font-bold">
                Sign Up
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}