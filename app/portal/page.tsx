"use client"

import { useState, useEffect, useMemo } from "react"
import {
    Ticket,
    Send,
    Search,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ArrowLeft,
    Layers,
    User,
    Mail,
    Phone,
    Building,
    ExternalLink,
    ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const CATEGORIES = [
    { id: "bug", label: "Bug / Error Report", desc: "Something in the automation or system stopped working (Included)" },
    { id: "automation_failure", label: "Automation Failure", desc: "Webhook, Make.com, or API sync failure (Included)" },
    { id: "feature_request", label: "New Feature / Logic", desc: "Request changes or additions to existing logic" },
    { id: "integration", label: "App Integration", desc: "Connect a new tool (CRM, Slack, Stripe, etc.)" },
    { id: "maintenance", label: "Routine Maintenance", desc: "Updates, credentials change, or routine cleanups" },
    { id: "general", label: "General Question", desc: "Any operational or general consulting inquiry (Included)" },
]

const PRIORITIES = [
    { id: "low", label: "Low", hint: "Standard inquiry", baseHours: 48 },
    { id: "medium", label: "Medium", hint: "Normal priority", baseHours: 24 },
    { id: "high", label: "High", hint: "Impacts workflow", baseHours: 8 },
    { id: "urgent", label: "Urgent", hint: "Critical system block", baseHours: 4 },
]

// ─── ETA Helper Functions ───────────────────────────────────────────────────

function calculateETAFromQueue(priority: string, outstandingCount: number, baseDate = new Date()) {
    const priorityConfig = PRIORITIES.find((p) => p.id === priority) || PRIORITIES[1]

    const queueMultiplier = priority === "urgent" ? 0.3 : priority === "high" ? 0.7 : 1.2
    const additionalHours = Math.round(outstandingCount * queueMultiplier)
    const totalHours = priorityConfig.baseHours + additionalHours

    const targetDate = new Date(baseDate.getTime() + totalHours * 60 * 60 * 1000)

    const isToday = targetDate.toDateString() === new Date().toDateString()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const isTomorrow = targetDate.toDateString() === tomorrow.toDateString()

    const timeStr = targetDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

    let dayLabel = targetDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
    if (isToday) dayLabel = "Today"
    else if (isTomorrow) dayLabel = "Tomorrow"

    return {
        totalHours,
        targetDate,
        formattedEstimate: `${dayLabel} by ${timeStr}`,
        humanDuration: totalHours < 24 ? `~${totalHours} hours` : `~${Math.round(totalHours / 24)} days`,
    }
}

export default function ClientPortalPage() {
    const [activeTab, setActiveTab] = useState<"create" | "track">("create")

    // Active desk queue state
    const [activeQueueCount, setActiveQueueCount] = useState(0)
    const [loadingQueue, setLoadingQueue] = useState(true)

    // Form state
    const [submitting, setSubmitting] = useState(false)
    const [submittedData, setSubmittedData] = useState<{
        code: string
        queuePos: number
        etaFormatted: string
        humanDuration: string
        estimatedHours: number
        geminiReasoning: string
        hoursDeducted: number
        remainingHours: number
        overtimeHours: number
        overtimeAmount: number
        paymentLink: string | null
        paymentStatus: string
        isExempt: boolean
    } | null>(null)

    const [formData, setFormData] = useState({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        title: "",
        description: "",
        category: "bug",
        priority: "medium",
    })

    // Track state
    const [lookupEmail, setLookupEmail] = useState("")
    const [trackedTickets, setTrackedTickets] = useState<any[]>([])
    const [searchingTickets, setSearchingTickets] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    // Fetch live active queue volume
    const fetchQueueStats = async () => {
        setLoadingQueue(true)
        try {
            const { count, error } = await supabase
                .from("stellarcode_tickets")
                .select("id", { count: "exact", head: true })
                .in("status", ["open", "in_progress"])

            if (!error && count !== null) {
                setActiveQueueCount(count)
            }
        } catch (err) {
            console.error("Queue load error:", err)
        } finally {
            setLoadingQueue(false)
        }
    }

    useEffect(() => {
        fetchQueueStats()
    }, [])

    const currentLiveETA = useMemo(() => {
        return calculateETAFromQueue(formData.priority, activeQueueCount)
    }, [formData.priority, activeQueueCount])

    // Handle ticket creation via Next.js Backend Route
    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const res = await fetch("/api/portal/ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to submit ticket.")

            const queuePos = activeQueueCount + 1
            const calculatedEta = calculateETAFromQueue(formData.priority, activeQueueCount)

            setSubmittedData({
                code: data.ticket.ticket_code,
                queuePos,
                etaFormatted: calculatedEta.formattedEstimate,
                humanDuration: calculatedEta.humanDuration,
                estimatedHours: data.ticket.estimated_hours,
                geminiReasoning: data.ticket.gemini_reasoning,
                hoursDeducted: data.ticket.hours_deducted,
                remainingHours: data.ticket.remaining_hours,
                overtimeHours: data.ticket.overtime_hours,
                overtimeAmount: data.ticket.overtime_amount,
                paymentLink: data.ticket.payment_link,
                paymentStatus: data.ticket.payment_status,
                isExempt: Boolean(data.ticket.is_exempt),
            })

            fetchQueueStats()

            setFormData({
                companyName: "",
                contactName: "",
                email: "",
                phone: "",
                title: "",
                description: "",
                category: "bug",
                priority: "medium",
            })
        } catch (err: any) {
            console.error("Ticket submission error:", err)
            alert(err?.message || "Failed to submit ticket. Please check your connection.")
        } finally {
            setSubmitting(false)
        }
    }

    // Handle ticket tracking by email
    const handleLookupTickets = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!lookupEmail.trim()) return

        setSearchingTickets(true)
        setHasSearched(true)

        try {
            const { data, error } = await supabase
                .from("stellarcode_tickets")
                .select("*")
                .ilike("contact_email", lookupEmail.trim())
                .order("created_at", { ascending: false })

            if (error) throw error
            setTrackedTickets(data || [])
        } catch (err) {
            console.error("Lookup error:", err)
        } finally {
            setSearchingTickets(false)
        }
    }

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "open":
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Open / In Queue</span>
            case "in_progress":
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">In Active Progress</span>
            case "resolved":
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">Resolved</span>
            case "closed":
            default:
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/5 text-slate-400 border border-white/10">Closed</span>
        }
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/10 font-sans pb-24">

            {/* Top Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-md px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        <span className="text-xs uppercase tracking-widest font-semibold">Back to Website</span>
                    </Link>

                    {/* View Switcher */}
                    <div className="flex items-center bg-white/[0.04] p-1 rounded-full border border-white/10">
                        <button
                            onClick={() => { setActiveTab("create"); setSubmittedData(null) }}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeTab === "create" ? "bg-white text-black font-semibold shadow-md" : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>Create Ticket</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("track")}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeTab === "track" ? "bg-white text-black font-semibold shadow-md" : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <Search className="w-3.5 h-3.5" />
                            <span>Track Tickets</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 pt-32">

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* TAB 1: CREATE TICKET                                           */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {activeTab === "create" && !submittedData && (
                    <div className="animate-in fade-in duration-300">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-medium mb-4">
                                <Layers className="w-3.5 h-3.5" />
                                Client Support
                            </div>
                            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-3">
                                Submit a Support Request
                            </h1>
                            <p className="text-slate-400 text-sm max-w-lg mx-auto">
                                Need an issue resolved, an automation modified, or new system logic deployed? Log your ticket directly to our developers.
                            </p>
                        </div>

                        <form onSubmit={handleSubmitTicket} className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-8">

                            {/* Section 1: Contact Details */}
                            <div>
                                <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">
                                    01 // Client Identification
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Company / Brand Name"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Your Full Name"
                                            value={formData.contactName}
                                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="Work Email Address"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="tel"
                                            placeholder="Phone / WhatsApp (Optional)"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Category & Priority */}
                            <div className="border-t border-white/5 pt-8">
                                <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">
                                    02 // Classification & Priority
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-2">Category</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {CATEGORIES.map((c) => {
                                                const selected = formData.category === c.id
                                                return (
                                                    <div
                                                        key={c.id}
                                                        onClick={() => setFormData({ ...formData, category: c.id })}
                                                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${selected
                                                            ? "bg-white/10 border-white/40 text-white"
                                                            : "bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10"
                                                            }`}
                                                    >
                                                        <div className="text-xs font-semibold">{c.label}</div>
                                                        <div className="text-[10px] text-slate-500 mt-1 leading-snug">{c.desc}</div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs text-slate-400">Urgency Level</label>
                                            <span className="text-[11px] font-mono text-emerald-400">
                                                Target Completion Window: {currentLiveETA.formattedEstimate}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                            {PRIORITIES.map((p) => {
                                                const selected = formData.priority === p.id
                                                return (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, priority: p.id })}
                                                        className={`py-3 px-3 rounded-2xl border text-center transition-all ${selected
                                                            ? p.id === "urgent"
                                                                ? "bg-rose-500/20 border-rose-500 text-rose-300 font-semibold"
                                                                : "bg-white text-black border-white font-semibold"
                                                            : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                                                            }`}
                                                    >
                                                        <div className="text-xs capitalize font-medium">{p.label}</div>
                                                        <div className="text-[9px] opacity-60 mt-0.5">{p.hint}</div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Ticket Description */}
                            <div className="border-t border-white/5 pt-8">
                                <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">
                                    03 // Request Specifications
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                            Brief Subject / Title *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Webhook failing on Typeform submissions"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                            Detailed Explanation & Steps to Reproduce *
                                        </label>
                                        <textarea
                                            required
                                            rows={5}
                                            placeholder="Describe what occurred, affected endpoints, links, or expectations..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all resize-none leading-relaxed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="border-t border-white/5 pt-4 space-y-3">
                                <div className="flex items-center justify-between text-xs text-slate-400 bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Current Queue: <strong className="text-white">{activeQueueCount} ahead</strong></span>
                                    </div>
                                    <div>
                                        Target Window: <strong className="text-white">{currentLiveETA.formattedEstimate}</strong>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-5 bg-white text-black hover:bg-slate-200 active:scale-98 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-2xl disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <span>Analyzing & Logging Request...</span>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Transmit Support Ticket</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Success Screen with Dynamic Retainer & Hours Card ── */}
                {submittedData && (
                    <div className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Ticket Logged &amp; Evaluated</h2>
                        <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
                            Your support request has been logged. Our systems have evaluated your task and updated your account balance.
                        </p>

                        {/* Category Exemption Notice */}
                        {submittedData.isExempt ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 max-w-xl mx-auto mb-6 flex items-center gap-3 text-left">
                                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                                <div className="text-xs text-emerald-300">
                                    <strong>No Hours Deducted:</strong> This request falls under our system maintenance and reliability guarantee and was not billed against your monthly retainer.
                                </div>
                            </div>
                        ) : null}

                        {/* Breakdown Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-6 text-left">
                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                                    Estimated Time
                                </div>
                                <div className="font-mono text-xl font-bold text-white">
                                    {submittedData.estimatedHours} hrs
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1" title={submittedData.geminiReasoning}>
                                    {submittedData.geminiReasoning}
                                </div>
                            </div>

                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                                    Hours Deducted
                                </div>
                                <div className="font-mono text-xl font-bold text-sky-400">
                                    {submittedData.hoursDeducted > 0 ? `-${submittedData.hoursDeducted} hrs` : "0 hrs"}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                    {submittedData.isExempt ? "Covered by warranty" : "From monthly balance"}
                                </div>
                            </div>

                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                                    Remaining Balance
                                </div>
                                <div className="font-mono text-xl font-bold text-emerald-400">
                                    {submittedData.remainingHours} hrs
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                    Current balance remaining
                                </div>
                            </div>
                        </div>

                        {/* Overtime & Mercury Payment Link */}
                        {submittedData.overtimeHours > 0 && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 max-w-xl mx-auto mb-8 text-left">
                                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Overtime Hours Incurred</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                    This ticket exceeds your available monthly balance by{" "}
                                    <strong>{submittedData.overtimeHours} hour(s)</strong>. Overtime is billed at{" "}
                                    <strong>R400 / hr</strong> (Total:{" "}
                                    <strong className="text-white">R{submittedData.overtimeAmount}</strong>).
                                </p>

                                {submittedData.paymentLink ? (
                                    <a
                                        href={submittedData.paymentLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg"
                                    >
                                        <span>Pay R{submittedData.overtimeAmount} via Mercury</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                ) : (
                                    <div className="text-[11px] text-amber-300/80 bg-black/20 p-3 rounded-xl border border-amber-500/20">
                                        An invoice for <strong>R{submittedData.overtimeAmount}</strong> will be sent to your email address shortly.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <button
                                onClick={() => {
                                    setSubmittedData(null)
                                    setActiveTab("track")
                                }}
                                className="px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-xs font-semibold tracking-wider uppercase transition-all"
                            >
                                Track Status
                            </button>
                            <button
                                onClick={() => setSubmittedData(null)}
                                className="px-6 py-3.5 bg-white text-black hover:bg-slate-200 rounded-full text-xs font-semibold tracking-wider uppercase transition-all"
                            >
                                Submit Another Ticket
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* TAB 2: TRACK TICKETS                                           */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {activeTab === "track" && (
                    <div className="animate-in fade-in duration-300">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">
                                Ticket Status Tracker
                            </h1>
                            <p className="text-slate-400 text-xs">
                                Enter your company email to review real-time progress and completion estimates on open requests.
                            </p>
                        </div>

                        {/* Search bar */}
                        <form onSubmit={handleLookupTickets} className="max-w-md mx-auto flex items-center gap-2 mb-12">
                            <div className="relative flex-1">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email address..."
                                    value={lookupEmail}
                                    onChange={(e) => setLookupEmail(e.target.value)}
                                    className="w-full bg-[#050505] border border-white/10 rounded-full pl-11 pr-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={searchingTickets}
                                className="px-6 py-3 bg-white text-black hover:bg-slate-200 rounded-full text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 shrink-0"
                            >
                                {searchingTickets ? "Searching..." : "Lookup"}
                            </button>
                        </form>

                        {/* Results List */}
                        <div className="space-y-4">
                            {trackedTickets.length > 0 ? (
                                trackedTickets.map((t, idx) => {
                                    const ticketETA = calculateETAFromQueue(
                                        t.priority || "medium",
                                        activeQueueCount,
                                        new Date(t.created_at || Date.now())
                                    )

                                    const isComplete = t.status === "resolved" || t.status === "closed"
                                    const isTicketExempt = ["bug", "automation_failure", "general"].includes(t.category)

                                    return (
                                        <div
                                            key={t.id}
                                            className="bg-[#050505] border border-white/10 rounded-3xl p-6 transition-all hover:border-white/20"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-xs text-slate-500 font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                                        {t.ticket_code || `ST-10${idx + 1}`}
                                                    </span>
                                                    <h4 className="font-semibold text-white text-sm">
                                                        {t.title}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {renderStatusBadge(t.status)}
                                                </div>
                                            </div>

                                            <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                                {t.description}
                                            </p>

                                            {/* Time and Billing Breakdown */}
                                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-4 text-xs space-y-2">
                                                <div className="flex justify-between items-center text-slate-300">
                                                    <span>AI Estimated Time: <strong className="text-white">{t.estimated_hours || 0} hrs</strong></span>
                                                    <span>
                                                        Hours Deducted:{" "}
                                                        <strong className={isTicketExempt ? "text-emerald-400" : "text-sky-400"}>
                                                            {isTicketExempt ? "0 hrs (Included)" : `-${t.hours_deducted || 0} hrs`}
                                                        </strong>
                                                    </span>
                                                </div>
                                                {t.overtime_hours > 0 && (
                                                    <div className="flex justify-between items-center pt-2 border-t border-white/5 text-amber-400 font-medium">
                                                        <span>Overtime Billed: R{t.overtime_amount} ({t.overtime_hours} hrs @ R400/hr)</span>
                                                        {t.payment_link && (
                                                            <a
                                                                href={t.payment_link}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 text-white bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1 rounded-lg border border-amber-500/30"
                                                            >
                                                                <span>Pay Mercury Invoice</span>
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Live ETA Box */}
                                            {!isComplete ? (
                                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 mb-4 flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                                                        <span>Target Completion Window:</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-medium text-emerald-400">{ticketETA.formattedEstimate}</span>
                                                        <span className="text-[10px] text-slate-500 ml-1.5 font-mono">({ticketETA.humanDuration})</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-3.5 mb-4 flex items-center gap-2 text-xs text-emerald-400">
                                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                    <span>Completed and verified by our development team.</span>
                                                </div>
                                            )}

                                            {t.resolution_notes && (
                                                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 text-xs text-emerald-300 mb-4">
                                                    <span className="font-bold text-emerald-400">Resolution Update: </span>
                                                    {t.resolution_notes}
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5 text-[11px] text-slate-500 font-mono">
                                                <div>
                                                    Category: <span className="text-slate-300 capitalize">{t.category?.replace("_", " ")}</span>
                                                </div>
                                                <div>
                                                    Priority: <span className="text-slate-300 capitalize font-medium">{t.priority || "Medium"}</span>
                                                </div>
                                                {t.assigned_to && (
                                                    <div>
                                                        Developer: <span className="text-slate-300">{t.assigned_to}</span>
                                                    </div>
                                                )}
                                                <div>
                                                    Submitted: <span className="text-slate-300">{new Date(t.created_at).toLocaleDateString("en-GB")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : hasSearched && !searchingTickets ? (
                                <div className="text-center py-16 bg-[#050505] border border-white/5 rounded-3xl text-slate-500 text-xs">
                                    No tickets found under &quot;{lookupEmail}&quot;. Make sure you are using the same email provided when creating your ticket.
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}