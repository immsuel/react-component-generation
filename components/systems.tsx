"use client"

import { useState } from "react"
import {
    Car,
    Sun,
    Stethoscope,
    Waves,
    Cpu,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Bot,
    Layers,
    FileText,
    ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const systems = [
    {
        id: "solar-engine",
        badge: "AI Spatial & Quoting",
        category: "Renewable Energy & Solar EPC",
        title: "Solar Engine & SolarPoint",
        tagline: "Turnkey Solar Feasibility & Photorealistic Rooftop Proposals in < 60s",
        description:
            "An autonomous solar quoting infrastructure that geolocates properties via Google Solar API, analyzes 3D roof irradiance, and uses Gemini vision models to paint realistic solar panel layouts on satellite and street-view photos before dispatching customized 3-tier ZAR proposals via WhatsApp and email.",
        icon: Sun,
        accentColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        glowColor: "from-amber-500/10",
        features: [
            "Google Solar 3D roof mesh & irradiance mapping",
            "Multimodal Gemini visual panel overlay on satellite imagery",
            "Automated 3-tier ZAR turnkey quote compilation (Day, Hybrid, Off-grid)",
            "48-hour cooldown WhatsApp lead nurturing and human takeover detection"
        ],
        tech: ["Google Solar API", "Gemini Vision", "PDFShift", "Evolution API", "n8n"]
    },
    {
        id: "bitepoint",
        badge: "Multi-Tenant SaaS",
        category: "Driving Academies & Fleet Ops",
        title: "Bitepoint SA Academy OS",
        tagline: "Complete Multi-Tenant Booking Portal & Operations Platform",
        description:
            "A domain-isolated operations platform for driving academies across South Africa and Namibia. Features student hour ledgers, a 5-hour cancellation rule engine, instructor fleet dispatch, live Leaflet GPS pickup mapping, automated PDF invoice/payslip generation, and Meta CAPI ad tracking.",
        icon: Car,
        accentColor: "text-rose-400 bg-rose-400/10 border-rose-400/20",
        glowColor: "from-rose-500/10",
        features: [
            "Host and subdomain-driven multi-tenancy with custom school branding",
            "Self-service student portal with 5-hour forfeiture cancellation logic",
            "Daily instructor schedule PDF generation & WhatsApp dispatch",
            "Fleet fuel tracking, vehicle maintenance logs, and NaTIS exam scheduling"
        ],
        tech: ["Next.js 16", "Supabase RLS", "PDFKit", "Leaflet Maps", "Meta CAPI"]
    },
    {
        id: "dental-receptionist",
        badge: "Healthcare Agent",
        category: "Clinical & Dental Operations",
        title: "MedPoint Dental AI Receptionist",
        tagline: "24/7 WhatsApp Virtual Front-Desk with Dual Role Routing",
        description:
            "A clinical WhatsApp virtual receptionist ('Mia') that detects whether the sender is a patient or staff member. Autonomously handles triage, emergency bookings, and reschedules while running a scheduled patient retention pipeline that triggers 7-day review requests and 6-month dental recalls.",
        icon: Stethoscope,
        accentColor: "text-sky-400 bg-sky-400/10 border-sky-400/20",
        glowColor: "from-sky-500/10",
        features: [
            "Staff vs. Patient routing: unlocks internal agenda controls for clinicians",
            "Real-time appointment booking, rescheduling, and conflict resolution",
            "Automated cancellation waitlist broadcast to fill open slots instantly",
            "Automated 7-day post-op reviews and 6-month checkup recall sequences"
        ],
        tech: ["Gemini 3.8 Flash", "LangChain Memory", "Supabase", "Evolution API"]
    },
    {
        id: "pool-engine",
        badge: "Civil & 3D Spatial AI",
        category: "Residential Construction",
        title: "Pool Installation Engine",
        tagline: "AI Backyard Feasibility & 3D Swimming Pool Quoting",
        description:
            "A turnkey feasibility and quoting engine for pool builders. Ingests backyard photos and dimensions, applies civil engineering formulas to size pumps, water volume, and excavation requirements, and uses generative AI to embed photorealistic pools directly into customer yard photos.",
        icon: Waves,
        accentColor: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
        glowColor: "from-cyan-500/10",
        features: [
            "Automated civil engineering sizing (volume, pump wattage, soil excavation)",
            "Satellite backyard analysis and ground-level perspective 3D pool rendering",
            "Dynamic 3-tier quotation generation (Plunge, Family Oasis, Resort & Spa)",
            "Automated contractor SMS/email lead alerts and PDF customer delivery"
        ],
        tech: ["Google Static Maps", "Gemini Vision", "PDFShift", "Supabase", "ImgBB"]
    },
    {
        id: "client-portal",
        badge: "Autonomous Ops",
        category: "Support & Retainer Billing",
        title: "Client Portal & Ticketing Infrastructure",
        tagline: "AI-Scoped Support Desk with Automated Overtime Billing",
        description:
            "A client support portal that estimates task hours via Gemini AI, tracks monthly client retainers, generates automated overtime invoices via Mercury, and broadcasts urgent alerts to developer Discord channels with zero human triage needed.",
        icon: Cpu,
        accentColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
        glowColor: "from-purple-500/10",
        features: [
            "Automated task duration scoping with realistic AI heuristic rules",
            "Warranty vs. billable categorization (bugs/failures are 100% exempt)",
            "Dynamic Mercury payment link creation for out-of-retainer overtime",
            "Real-time ticket tracking, queue estimation, and Discord notification hooks"
        ],
        tech: ["Next.js App Router", "Gemini AI", "Mercury API", "Discord Webhooks"]
    }
]

export function Systems() {
    const [activeFilter, setActiveFilter] = useState<string>("ALL")

    const filteredSystems = activeFilter === "ALL"
        ? systems
        : systems.filter((s) => s.id === activeFilter)

    const scrollToContact = () => {
        const el = document.querySelector("#contact")
        if (el) el.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <section id="systems" className="px-4 py-24 relative bg-black/95 backdrop-blur-md border-t border-white/[0.03]">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-slate-500/5 blur-[160px] pointer-events-none rounded-full" />

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                        <Sparkles className="w-3 h-3 text-slate-400" />
                        <span>Turnkey Systems &amp; Platforms</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mb-6">
                        Production Software &amp; <br />
                        <span className="text-slate-500">Autonomous Engines.</span>
                    </h2>

                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                        We don&apos;t build disposable prototypes. We engineer battle-tested platforms, multimodal AI estimators, and automated WhatsApp operations for businesses that require reliability at scale.
                    </p>
                </div>

                {/* System Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {filteredSystems.map((sys, idx) => {
                        const Icon = sys.icon
                        const isWide = idx === 0 && filteredSystems.length % 2 !== 0

                        return (
                            <div
                                key={sys.id}
                                className={`group relative bg-[#060608] border border-white/5 hover:border-white/20 rounded-[2.5rem] p-8 md:p-10 transition-all duration-500 flex flex-col justify-between overflow-hidden ${isWide ? "lg:col-span-2" : ""
                                    }`}
                            >
                                {/* Subtle Radial Gradient on Hover */}
                                <div
                                    className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl ${sys.glowColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-3xl`}
                                />

                                <div>
                                    {/* Top Header Row */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${sys.accentColor}`}>
                                            {sys.badge}
                                        </span>
                                        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
                                            {sys.category}
                                        </span>
                                    </div>

                                    {/* Title & Tagline */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 group-hover:border-white/20 transition-colors">
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                                                {sys.title}
                                            </h3>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-300 tracking-wide mt-1">
                                            {sys.tagline}
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-8">
                                        {sys.description}
                                    </p>

                                    {/* Feature Highlights */}
                                    <div className="border-t border-white/5 pt-6 mb-8 space-y-2.5">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                                            Architectural Capabilities:
                                        </p>
                                        {sys.features.map((feat, fIdx) => (
                                            <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                                                <span className="leading-snug">{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer: Tech Stack & Actions */}
                                <div className="border-t border-white/5 pt-6 mt-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {sys.tech.map((t) => (
                                            <span
                                                key={t}
                                                className="text-[9px] font-mono px-2.5 py-1 rounded-md bg-white/[0.02] border border-white/5 text-slate-400"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        {sys.id === "client-portal" ? (
                                            <Link
                                                href="/portal"
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-slate-300 transition-colors"
                                            >
                                                <span>Open Live Portal</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={scrollToContact}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-slate-300 transition-colors"
                                            >
                                                <span>Deploy This System</span>
                                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Bottom Banner */}
                <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-white/[0.02] via-white/[0.04] to-white/[0.02] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center md:text-left">
                        <h4 className="text-base font-bold text-white tracking-tight">Need a customized system built for your operations?</h4>
                        <p className="text-xs text-slate-400">We design bespoke backends, multimodal pipelines, and WhatsApp bots in 72-hour development sprints.</p>
                    </div>
                    <button
                        onClick={scrollToContact}
                        className="px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-transform hover:scale-105 active:scale-95 whitespace-nowrap shadow-xl"
                    >
                        Schedule System Audit
                    </button>
                </div>

            </div>
        </section>
    )
}

// Export both names to satisfy either usage
export { Systems as Products }