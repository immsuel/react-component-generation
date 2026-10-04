"use client"

import { useState } from "react"
import {
    Ticket,
    Send,
    Search,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ArrowLeft,
    Check,
    Layers,
    User,
    Mail,
    Phone,
    Building,
    FileText,
    ExternalLink
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const CATEGORIES = [
    { id: "bug", label: "Bug / Error Report", desc: "Something in the automation or system stopped working" },
    { id: "automation_failure", label: "Automation Failure", desc: "Webhook, Make.com, or API sync failure" },
    { id: "feature_request", label: "New Feature / Logic", desc: "Request changes or additions to existing logic" },
    { id: "integration", label: "App Integration", desc: "Connect a new tool (CRM, Slack, Stripe, etc.)" },
    { id: "maintenance", label: "Routine Maintenance", desc: "Updates, credentials change, or routine cleanups" },
    { id: "general", label: "General Question", desc: "Any operational or general consulting inquiry" },
]

const PRIORITIES = [
    { id: "low", label: "Low", hint: "Standard inquiry (within 48h)" },
    { id: "medium", label: "Medium", hint: "Normal priority (within 24h)" },
    { id: "high", label: "High", hint: "Impacts workflow (within 8h)" },
    { id: "urgent", label: "Urgent", hint: "System down / critical blocking" },
]

export default function ClientPortalPage() {
    const [activeTab, setActiveTab] = useState<"create" | "track">("create")

    // Form state
    const [submitting, setSubmitting] = useState(false)
    const [submittedCode, setSubmittedCode] = useState<string | null>(null)
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

    // Handle ticket creation
    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            // 1. Look up or auto-create client in stellarcode_clients
            let clientId: string | null = null
            const cleanEmail = formData.email.trim().toLowerCase()

            const { data: existingClient } = await supabase
                .from("stellarcode_clients")
                .select("id")
                .ilike("email", cleanEmail)
                .maybeSingle()

            if (existingClient?.id) {
                clientId = existingClient.id
            } else {
                const { data: newClient } = await supabase
                    .from("stellarcode_clients")
                    .insert([
                        {
                            company_name: formData.companyName || formData.contactName,
                            contact_name: formData.contactName,
                            email: cleanEmail,
                            phone: formData.phone || null,
                        },
                    ])
                    .select("id")
                    .single()

                if (newClient) clientId = newClient.id
            }

            // 2. Insert Ticket
            const { data: createdTicket, error: ticketError } = await supabase
                .from("stellarcode_tickets")
                .insert([
                    {
                        client_id: clientId,
                        title: formData.title,
                        description: formData.description,
                        category: formData.category,
                        priority: formData.priority,
                        status: "open",
                        contact_name: formData.contactName,
                        contact_email: cleanEmail,
                        contact_phone: formData.phone || null,
                    },
                ])
                .select("ticket_code, id")
                .single()

            if (ticketError) throw ticketError

            setSubmittedCode(createdTicket?.ticket_code || "ST-RECEIVED")
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
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Open / Logged</span>
            case "in_progress":
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">In Progress</span>
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
                            onClick={() => { setActiveTab("create"); setSubmittedCode(null) }}
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
                {activeTab === "create" && !submittedCode && (
                    <div className="animate-in fade-in duration-300">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-medium mb-4">
                                <Layers className="w-3.5 h-3.5" />
                                Client Engineering Support
                            </div>
                            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-3">
                                Submit a Support Request
                            </h1>
                            <p className="text-slate-400 text-sm max-w-lg mx-auto">
                                Need an issue resolved, an automation modified, or new system logic deployed? Log your ticket directly with our engineering desk.
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
                                        <label className="block text-xs text-slate-400 mb-2">Urgency Level</label>
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
                                            placeholder="e.g. Lead webhook failing on Typeform submissions"
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
                                            placeholder="Describe what occurred, any error messages, affected accounts, links, or expectations..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all resize-none leading-relaxed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="border-t border-white/5 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-5 bg-white text-black hover:bg-slate-200 active:scale-98 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-2xl disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <span>Dispatching to Engineering Desk...</span>
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

                {/* ── Success Screen ────────────────────────────────────────── */}
                {submittedCode && (
                    <div className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-12 text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Ticket Logged Successfully</h2>
                        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                            Your support ticket has been received and added to our priority queue.
                        </p>

                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 max-w-xs mx-auto mb-8">
                            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Your Tracking Code</div>
                            <div className="font-mono text-2xl font-bold text-white tracking-wider">{submittedCode}</div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <button
                                onClick={() => {
                                    setSubmittedCode(null)
                                    setActiveTab("track")
                                }}
                                className="px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-xs font-semibold tracking-wider uppercase transition-all"
                            >
                                Track Status
                            </button>
                            <button
                                onClick={() => setSubmittedCode(null)}
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
                                Enter your company email to review real-time progress on open and resolved requests.
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
                                trackedTickets.map((t) => (
                                    <div
                                        key={t.id}
                                        className="bg-[#050505] border border-white/10 rounded-3xl p-6 transition-all hover:border-white/20"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-xs text-slate-500 font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                                    {t.ticket_code || "ST-LOG"}
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
                                            {t.assigned_to && (
                                                <div>
                                                    Engineer: <span className="text-slate-300">{t.assigned_to}</span>
                                                </div>
                                            )}
                                            <div>
                                                Submitted: <span className="text-slate-300">{new Date(t.created_at).toLocaleDateString("en-GB")}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
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