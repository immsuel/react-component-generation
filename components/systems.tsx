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
    ExternalLink
} from "lucide-react"
import Link from "next/link"

const systems = [
    {
        id: "solar-quote-generator",
        badge: "For Solar Companies",
        category: "Solar & Clean Energy",
        title: "Solar Proposal & Quote Generator",
        tagline: "Instant rooftop estimates & realistic solar proposals sent straight to WhatsApp",
        description:
            "A fast quoting tool for solar installers. When a homeowner enters their address and monthly power bill, the system analyzes their roof from satellite imagery, places realistic solar panels on their roof, and sends a complete 3-option price quote straight to their WhatsApp and email in under 60 seconds.",
        icon: Sun,
        accentColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        glowColor: "from-amber-500/10",
        features: [
            "Calculates solar panel requirements from the customer's power bill",
            "Shows a real satellite picture of their home with solar panels fitted",
            "Automatically creates 3 pricing packages (Daytime, Battery Backup, Off-Grid)",
            "Follows up with leads on WhatsApp without being pushy or spammy"
        ],
        tech: ["Google Solar API", "Satellite Imagery", "Instant PDF Generator", "WhatsApp Integration"]
    },
    {
        id: "driving-school-system",
        badge: "For Driving Schools",
        category: "Driving Academies & Instructors",
        title: "Driving School Automation Package",
        tagline: "Complete student booking, instructor scheduling, and payment platform",
        description:
            "An all-in-one platform built specifically for driving schools. Students can choose packages and book lesson slots online with map pickup pins. Instructors get their daily schedules delivered automatically to WhatsApp every morning, and school owners can track student hours, vehicle fuel, and instructor payroll.",
        icon: Car,
        accentColor: "text-rose-400 bg-rose-400/10 border-rose-400/20",
        glowColor: "from-rose-500/10",
        features: [
            "Online student portal to book, reschedule, or cancel lessons",
            "Automatic daily lesson schedules sent to instructors on WhatsApp",
            "Instant invoice and student payment receipt generation",
            "Tracks vehicle fuel expenses and warns when licenses/disks expire"
        ],
        tech: ["Next.js Booking Portal", "Secure Student Database", "PDF Invoices", "WhatsApp Gateway"]
    },
    {
        id: "clinic-ai-receptionist",
        badge: "For Medical & Dental",
        category: "Dentists & Medical Clinics",
        title: "Clinic & Dental AI Receptionist",
        tagline: "24/7 WhatsApp receptionist that books patients and brings back past clients",
        description:
            "A smart 24/7 virtual assistant for your clinic's WhatsApp line. It answers patient questions instantly, checks dentist availability, books appointments, and prioritizes urgent emergencies. When an appointment gets canceled, it immediately messages waitlisted patients to keep your calendar full.",
        icon: Stethoscope,
        accentColor: "text-sky-400 bg-sky-400/10 border-sky-400/20",
        glowColor: "from-sky-500/10",
        features: [
            "Answers patient questions and schedules appointments 24 hours a day",
            "Recognizes clinic staff to give them quick schedule and patient overviews",
            "Fills last-minute canceled slots by automatically alerting waitlisted patients",
            "Sends Google review requests and 6-month routine checkup reminders"
        ],
        tech: ["Smart AI Assistant", "Calendar Synchronization", "Waitlist Automation", "WhatsApp Business"]
    },
    {
        id: "pool-quote-builder",
        badge: "For Pool Contractors",
        category: "Pool Builders & Landscapers",
        title: "Pool Visualizer & Quote Builder",
        tagline: "Show clients what a pool looks like in their backyard with instant pricing",
        description:
            "An interactive tool for swimming pool builders that turns casual website visitors into signed contracts. Homeowners pick their pool size, upload a backyard photo, and receive a realistic picture of the pool in their lawn alongside an itemized equipment, excavation, and installation quote.",
        icon: Waves,
        accentColor: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
        glowColor: "from-cyan-500/10",
        features: [
            "Shows realistic images of the pool placed directly in the customer's yard",
            "Calculates pool volume, pump/filter requirements, and excavation timelines",
            "Sends itemized 3-tier proposals (Entry, Family, Luxury) to the client's phone",
            "Notifies your sales team the moment a qualified quote is created"
        ],
        tech: ["Satellite Mapping", "AI Image Generation", "Turnkey Cost Calculator", "PDF & WhatsApp"]
    },
    {
        id: "client-support-portal",
        badge: "For Agencies & Consultants",
        category: "Client Support & Retainers",
        title: "Client Support & Task Portal",
        tagline: "Central hub for client requests, project updates, and overtime billing",
        description:
            "A simple, professional client portal where your clients can submit support tickets, request new features, and track project status. It automatically estimates the hours required for each task, deducts hours from their monthly retainer, and sends payment links if work goes out of scope.",
        icon: Cpu,
        accentColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
        glowColor: "from-purple-500/10",
        features: [
            "Gives your clients a clean, branded portal to submit and track requests",
            "Automatically scopes task time and shows realistic completion windows",
            "Tracks monthly retainer hours and generates invoices for extra work",
            "Alerts your developers on Discord or Slack as soon as tickets arrive"
        ],
        tech: ["Client Portal Web App", "Automated Task Scoping", "Online Invoicing", "Team Notifications"]
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
                        <span>Turnkey Systems &amp; Packages</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mb-6">
                        Software We Build &amp; <br />
                        <span className="text-slate-500">Automations Ready to Deploy.</span>
                    </h2>

                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                        We don&apos;t just write code from scratch every time. We build proven, ready-to-customize systems that solve sales, booking, and operational bottlenecks for specific industries.
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
                                            What This System Does:
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
                                        {sys.id === "client-support-portal" ? (
                                            <Link
                                                href="/portal"
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-slate-300 transition-colors"
                                            >
                                                <span>View Live Demo</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={scrollToContact}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-slate-300 transition-colors"
                                            >
                                                <span>Build For My Business</span>
                                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Bottom Callout Banner */}
                <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-white/[0.02] via-white/[0.04] to-white/[0.02] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center md:text-left">
                        <h4 className="text-base font-bold text-white tracking-tight">Need a custom system built for your specific workflow?</h4>
                        <p className="text-xs text-slate-400">Tell us what manual tasks are slowing your team down, and we&apos;ll propose an automated solution.</p>
                    </div>
                    <button
                        onClick={scrollToContact}
                        className="px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-transform hover:scale-105 active:scale-95 whitespace-nowrap shadow-xl"
                    >
                        Ask About a System
                    </button>
                </div>

            </div>
        </section>
    )
}

export { Systems as Products }