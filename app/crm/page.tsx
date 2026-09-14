"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
    Search,
    Plus,
    Trash2,
    Edit3,
    RefreshCw,
    LogOut,
    Download,
    Users,
    CheckCircle2,
    TrendingUp,
    DollarSign,
    Phone,
    Mail,
    X,
    AlertCircle,
    Layers,
    Check
} from "lucide-react"
import { supabase, type StellarLead } from "@/lib/supabase"
import Link from "next/link"

// ── Phone & String Normalizers for Precision Duplicate Matching ──────────────

function normalizePhone(phone: string | number | null | undefined): string {
    if (!phone) return ""
    let digits = String(phone).replace(/\D/g, "")
    // Normalize UK & International prefixes (+44 or leading 0)
    if (digits.startsWith("44")) digits = digits.slice(2)
    if (digits.startsWith("0")) digits = digits.slice(1)
    return digits
}

function normalizeStr(str: string | null | undefined): string {
    return (str || "").trim().toLowerCase().replace(/\s+/g, " ")
}

export default function CRMPage() {
    const router = useRouter()
    const [leads, setLeads] = useState<StellarLead[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterStage, setFilterStage] = useState<"ALL" | "Contacted" | "Responded" | "Interested" | "Closed">("ALL")

    // Modal & Drawer State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingLead, setEditingLead] = useState<StellarLead | null>(null)
    const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Default Value £600/year
    const emptyForm: StellarLead = {
        "Business Name": "",
        Contact: "",
        "Phone Number": "",
        Email: "",
        Comments: "",
        "Website (if applicable)": "",
        Contacted: null,
        Responded: null,
        Interested: null,
        Closed: null,
        Value: 600
    }
    const [formData, setFormData] = useState<StellarLead>(emptyForm)

    // Auth Guard
    useEffect(() => {
        const auth = sessionStorage.getItem("stellar_crm_auth")
        if (!auth) {
            router.push("/login")
        } else {
            fetchLeads()
        }
    }, [router])

    const fetchLeads = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("stellarcode_leads")
                .select("*")

            if (error) throw error
            if (data) setLeads(data)
        } catch (err: any) {
            console.error("Supabase load error:", err?.message || err)
        } finally {
            setLoading(false)
        }
    }

    const isChecked = (val: any) => val === "checked" || val === true || val === "true"

    // Quick Toggle Status
    const toggleStatus = async (lead: StellarLead, field: "Contacted" | "Responded" | "Interested" | "Closed") => {
        const nextVal = isChecked(lead[field]) ? null : "checked"
        const updated = { ...lead, [field]: nextVal }

        setLeads((prev) => prev.map((l) => (
            (l.id && l.id === lead.id) || (l.Email === lead.Email && l["Phone Number"] === lead["Phone Number"]) ? updated : l
        )))

        try {
            let query = supabase.from("stellarcode_leads").update({ [field]: nextVal })
            if (lead.id) {
                query = query.eq("id", lead.id)
            } else if (lead["Phone Number"]) {
                query = query.eq("Phone Number", lead["Phone Number"])
            } else if (lead.Email) {
                query = query.eq("Email", lead.Email)
            }
            await query
        } catch (err) {
            console.error("Toggle error:", err)
            fetchLeads()
        }
    }

    // ── Robust Duplicate Finder (Checks Person, Phone & Email) ─────────────────
    const checkForDuplicates = (
        contact: string,
        phone: string | number | null,
        email: string | null,
        business: string,
        currentId?: string | number
    ) => {
        const cleanContact = normalizeStr(contact)
        const cleanPhone = normalizePhone(phone)
        const cleanEmail = normalizeStr(email)
        const cleanBiz = normalizeStr(business)

        return leads.find((l) => {
            // Don't compare record against itself when editing
            if (currentId && l.id === currentId) return false

            // 1. Phone duplicate (matching normalized last 9-10 digits)
            const existingPhone = normalizePhone(l["Phone Number"])
            if (cleanPhone.length >= 7 && existingPhone.length >= 7 && cleanPhone === existingPhone) {
                return true
            }

            // 2. Person / Contact Name duplicate
            const existingContact = normalizeStr(l.Contact)
            if (cleanContact.length >= 3 && existingContact === cleanContact) {
                return true
            }

            // 3. Email duplicate
            const existingEmail = normalizeStr(l.Email)
            if (cleanEmail.length >= 4 && existingEmail === cleanEmail) {
                return true
            }

            // 4. Business name duplicate (only if business name is provided)
            const existingBiz = normalizeStr(l["Business Name"])
            if (cleanBiz.length >= 3 && existingBiz.length >= 3 && cleanBiz === existingBiz) {
                return true
            }

            return false
        })
    }

    const handleOpenAdd = () => {
        setEditingLead(null)
        setFormData(emptyForm)
        setDuplicateWarning(null)
        setIsModalOpen(true)
    }

    const handleOpenEdit = (lead: StellarLead) => {
        setEditingLead(lead)
        setFormData({
            ...lead,
            Value: lead.Value || 600
        })
        setDuplicateWarning(null)
        setIsModalOpen(true)
    }

    const handleDelete = async (lead: StellarLead) => {
        if (!confirm(`Purge record for ${lead.Contact || lead["Business Name"] || "this entry"}?`)) return

        setLeads((prev) => prev.filter((l) => l !== lead))

        try {
            let query = supabase.from("stellarcode_leads").delete()
            if (lead.id) {
                query = query.eq("id", lead.id)
            } else if (lead["Phone Number"]) {
                query = query.eq("Phone Number", lead["Phone Number"])
            } else if (lead.Email) {
                query = query.eq("Email", lead.Email)
            }
            await query
        } catch (err) {
            console.error("Delete error:", err)
            fetchLeads()
        }
    }

    const handleSaveLead = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setDuplicateWarning(null)

        // 1. Client Duplicate Verification
        const dup = checkForDuplicates(
            formData.Contact,
            formData["Phone Number"],
            formData.Email,
            formData["Business Name"],
            editingLead?.id
        )

        if (dup && !editingLead) {
            setDuplicateWarning(
                `DUPLICATE BLOCKED: A lead with this person ("${dup.Contact || "Unnamed"}"), phone (${dup["Phone Number"] || "None"}), or email (${dup.Email || "None"}) already exists in your database.`
            )
            setIsSubmitting(false)
            return
        }

        try {
            if (editingLead) {
                let query = supabase.from("stellarcode_leads").update(formData)
                if (editingLead.id) {
                    query = query.eq("id", editingLead.id)
                } else {
                    query = query.eq("Phone Number", editingLead["Phone Number"])
                }
                await query
            } else {
                await supabase.from("stellarcode_leads").insert([formData])
            }

            setIsModalOpen(false)
            fetchLeads()
        } catch (err: any) {
            console.error("Save error:", err)
            alert(err?.message || "Failed to save record.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Export Filtered CSV
    const exportCSV = () => {
        const headers = ["Business Name,Contact,Phone Number,Email,Website,Contacted,Responded,Interested,Closed,Value,Comments\n"]
        const rows = filteredLeads.map((l) =>
            [
                `"${l["Business Name"] || ""}"`,
                `"${l.Contact || ""}"`,
                `"${l["Phone Number"] || ""}"`,
                `"${l.Email || ""}"`,
                `"${l["Website (if applicable)"] || ""}"`,
                isChecked(l.Contacted) ? "TRUE" : "FALSE",
                isChecked(l.Responded) ? "TRUE" : "FALSE",
                isChecked(l.Interested) ? "TRUE" : "FALSE",
                isChecked(l.Closed) ? "TRUE" : "FALSE",
                l.Value || 600,
                `"${(l.Comments || "").replace(/"/g, '""')}"`
            ].join(",")
        )

        const blob = new Blob([headers.concat(rows.join("\n")).join("")], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `STELLARCODE_LEADS_${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Search & Filter Pipeline
    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            const matchSearch =
                (lead.Contact || "").toLowerCase().includes(search.toLowerCase()) ||
                (lead["Business Name"] || "").toLowerCase().includes(search.toLowerCase()) ||
                (lead.Email || "").toLowerCase().includes(search.toLowerCase()) ||
                String(lead["Phone Number"] || "").includes(search)

            if (!matchSearch) return false

            if (filterStage === "Contacted") return isChecked(lead.Contacted)
            if (filterStage === "Responded") return isChecked(lead.Responded)
            if (filterStage === "Interested") return isChecked(lead.Interested)
            if (filterStage === "Closed") return isChecked(lead.Closed)
            return true
        })
    }, [leads, search, filterStage])

    // Analytics Metrics
    // Analytics Metrics
    const metrics = useMemo(() => {
        const total = leads.length
        const contacted = leads.filter((l) => isChecked(l.Contacted)).length
        const responded = leads.filter((l) => isChecked(l.Responded)).length
        const closedLeads = leads.filter((l) => isChecked(l.Closed))
        const closed = closedLeads.length

        // Calculate annual value ONLY from closed leads (defaulting to £600/yr per closed deal)
        const closedAnnualValue = closedLeads.reduce(
            (acc, curr) => acc + (Number(curr.Value) > 0 ? Number(curr.Value) : 600),
            0
        )

        const responseRate = contacted > 0 ? Math.round((responded / contacted) * 100) : 0
        const conversionYield = total > 0 ? Math.round((closed / total) * 100) : 0

        return {
            total,
            contacted,
            responded,
            closed,
            closedAnnualValue,
            responseRate,
            conversionYield
        }
    }, [leads])

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/10 font-sans pb-24">

            {/* ── Precision Control Bar ────────────────────────────────────────── */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-md px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white group-hover:text-slate-300 transition-colors">
                                Bitepoint - Dashboard
                            </span>
                        </Link>
                        <div className="h-3 w-px bg-white/10 hidden sm:block" />
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchLeads}
                            className="p-2 text-slate-500 hover:text-white rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all"
                            title="Sync Database"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-white" : ""}`} />
                        </button>
                        <button
                            onClick={() => {
                                sessionStorage.removeItem("stellar_crm_auth")
                                router.push("/login")
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <LogOut className="w-3 h-3" />
                            <span>Exit</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Header Briefing ──────────────────────────────────────────────── */}
            <section className="pt-32 pb-10 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter leading-[0.95]">
                                <span className="text-slate-500">Dashboard</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={exportCSV}
                                className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] text-slate-300 text-[10px] font-bold uppercase tracking-widest transition-all"
                            >
                                <Download className="w-3 h-3 text-slate-500" />
                                Export CSV
                            </button>
                            <button
                                onClick={handleOpenAdd}
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black hover:bg-slate-200 text-[10px] font-black uppercase tracking-[0.2em] transition-transform hover:scale-105 active:scale-95"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Deploy Lead
                            </button>
                        </div>
                    </div>

                    {/* ── Executive Metric Tiles ─────────────────────────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-colors">
                            <div className="flex justify-between items-center text-slate-500 mb-6">
                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold">Total Ingested</span>
                                <Users className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                            </div>
                            <div className="text-4xl font-bold tracking-tighter text-white mb-1">{metrics.total}</div>
                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                {metrics.contacted} Contacted ({Math.round((metrics.contacted / (metrics.total || 1)) * 100)}%)
                            </div>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-colors">
                            <div className="flex justify-between items-center text-slate-500 mb-6">
                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold">Response Yield</span>
                                <TrendingUp className="w-4 h-4 text-emerald-500/70" />
                            </div>
                            <div className="text-4xl font-bold tracking-tighter text-white mb-1">{metrics.responseRate}%</div>
                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                {metrics.responded} Active Replies
                            </div>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-colors">
                            <div className="flex justify-between items-center text-slate-500 mb-6">
                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold">Closed Deals</span>
                                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="text-4xl font-bold tracking-tighter text-white mb-1">{metrics.closed}</div>
                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                {metrics.conversionYield}% Win Rate
                            </div>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-colors">
                            <div className="flex justify-between items-center text-slate-500 mb-6">
                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold">Total Annual Pipeline</span>
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="text-4xl font-bold tracking-tighter text-white mb-1">
                                £{metrics.closedAnnualValue.toLocaleString()}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                {metrics.closed} Closed {metrics.closed === 1 ? "Deal" : "Deals"} (£600/yr)
                            </div>
                        </div>
                    </div>

                    {/* ── Filter Bar & Terminal Search ───────────────────────────────── */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                            <input
                                type="text"
                                placeholder="Filter by contact, business, phone, or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all font-mono"
                            />
                        </div>

                        {/* Stage Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-full">
                            {(["ALL", "Contacted", "Responded", "Interested", "Closed"] as const).map((stage) => {
                                const isActive = filterStage === stage
                                return (
                                    <button
                                        key={stage}
                                        onClick={() => setFilterStage(stage)}
                                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${isActive
                                            ? "bg-white text-black shadow-md"
                                            : "text-slate-500 hover:text-white"
                                            }`}
                                    >
                                        {stage}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* ── Precision Spreadsheet View ─────────────────────────────────── */}
                    <div className="bg-[#050505] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="sticky top-0 bg-[#080808] border-b border-white/10 text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em] z-20">
                                    <tr>
                                        <th className="py-4 px-6 font-bold">Contact & Entity</th>
                                        <th className="py-4 px-6 font-bold">Direct Phone</th>
                                        <th className="py-4 px-6 font-bold">Email Interface</th>
                                        <th className="py-4 px-4 font-bold text-center">Contacted</th>
                                        <th className="py-4 px-4 font-bold text-center">Responded</th>
                                        <th className="py-4 px-4 font-bold text-center">Interested</th>
                                        <th className="py-4 px-4 font-bold text-center">Closed</th>
                                        <th className="py-4 px-6 font-bold">Est. Value</th>
                                        <th className="py-4 px-6 font-bold text-right">Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={9} className="text-center py-20 font-mono text-xs text-slate-600 uppercase tracking-widest">
                                                Interrogating Supabase Endpoint...
                                            </td>
                                        </tr>
                                    ) : filteredLeads.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="text-center py-20 font-mono text-xs text-slate-600 uppercase tracking-widest">
                                                No telemetry matches query parameters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLeads.map((lead, idx) => (
                                            <tr
                                                key={lead.id || idx}
                                                className="hover:bg-white/[0.02] transition-colors group"
                                            >
                                                {/* Contact & Company */}
                                                <td className="py-4 px-6">
                                                    <div className="font-semibold text-white tracking-tight text-sm">
                                                        {lead.Contact || "Unnamed Entity"}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
                                                        {lead["Business Name"] || "INDIVIDUAL"}
                                                    </div>
                                                </td>

                                                {/* Phone */}
                                                <td className="py-4 px-6 font-mono text-slate-400">
                                                    {lead["Phone Number"] ? (
                                                        <a
                                                            href={`https://wa.me/${normalizePhone(lead["Phone Number"])}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                                                        >
                                                            <Phone className="w-3 h-3 text-slate-600" />
                                                            {lead["Phone Number"]}
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-700">—</span>
                                                    )}
                                                </td>

                                                {/* Email */}
                                                <td className="py-4 px-6 font-mono text-slate-400">
                                                    {lead.Email ? (
                                                        <a
                                                            href={`mailto:${lead.Email}`}
                                                            className="inline-flex items-center gap-1.5 hover:text-white transition-colors truncate max-w-[160px]"
                                                        >
                                                            <Mail className="w-3 h-3 text-slate-600 shrink-0" />
                                                            <span className="truncate">{lead.Email}</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-700">—</span>
                                                    )}
                                                </td>

                                                {/* Status Toggle: Contacted */}
                                                <td className="py-4 px-4 text-center">
                                                    <button
                                                        onClick={() => toggleStatus(lead, "Contacted")}
                                                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${isChecked(lead.Contacted)
                                                            ? "bg-white text-black shadow-lg"
                                                            : "bg-white/[0.03] border border-white/10 hover:border-white/30 text-transparent"
                                                            }`}
                                                    >
                                                        <Check className="w-3 h-3 stroke-[3]" />
                                                    </button>
                                                </td>

                                                {/* Status Toggle: Responded */}
                                                <td className="py-4 px-4 text-center">
                                                    <button
                                                        onClick={() => toggleStatus(lead, "Responded")}
                                                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${isChecked(lead.Responded)
                                                            ? "bg-emerald-400 text-black shadow-lg shadow-emerald-500/20"
                                                            : "bg-white/[0.03] border border-white/10 hover:border-white/30 text-transparent"
                                                            }`}
                                                    >
                                                        <Check className="w-3 h-3 stroke-[3]" />
                                                    </button>
                                                </td>

                                                {/* Status Toggle: Interested */}
                                                <td className="py-4 px-4 text-center">
                                                    <button
                                                        onClick={() => toggleStatus(lead, "Interested")}
                                                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${isChecked(lead.Interested)
                                                            ? "bg-amber-400 text-black shadow-lg shadow-amber-500/20"
                                                            : "bg-white/[0.03] border border-white/10 hover:border-white/30 text-transparent"
                                                            }`}
                                                    >
                                                        <Check className="w-3 h-3 stroke-[3]" />
                                                    </button>
                                                </td>

                                                {/* Status Toggle: Closed */}
                                                <td className="py-4 px-4 text-center">
                                                    <button
                                                        onClick={() => toggleStatus(lead, "Closed")}
                                                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${isChecked(lead.Closed)
                                                            ? "bg-purple-400 text-black shadow-lg shadow-purple-500/20"
                                                            : "bg-white/[0.03] border border-white/10 hover:border-white/30 text-transparent"
                                                            }`}
                                                    >
                                                        <Check className="w-3 h-3 stroke-[3]" />
                                                    </button>
                                                </td>

                                                {/* Value (£600/yr Default) */}
                                                <td className="py-4 px-6 font-mono font-medium text-white">
                                                    £{Number(lead.Value || 600).toLocaleString()}<span className="text-slate-600 text-[10px]">/yr</span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleOpenEdit(lead)}
                                                            className="p-2 text-slate-500 hover:text-white rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/10 transition-all"
                                                            title="Modify Record"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(lead)}
                                                            className="p-2 text-slate-500 hover:text-rose-400 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-rose-500/10 transition-all"
                                                            title="Purge"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Precision Modal / Config Drawer ──────────────────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-[#050505] border border-white/10 w-full max-w-2xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto">

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-8 right-8 p-2 rounded-full bg-white/5 text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="mb-8">
                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-2 font-bold">
                                {editingLead ? "RECORD_MODIFICATION" : "LEAD_REGISTRATION"}
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-white">
                                {editingLead ? "Edit Lead Parameter" : "Deploy New Lead"}
                            </h2>
                        </div>

                        {duplicateWarning && (
                            <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-2xl text-xs font-mono mb-6">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                                <span>{duplicateWarning}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveLead} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-2">
                                        Contact / Person Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Abdullah Mousa"
                                        value={formData.Contact}
                                        onChange={(e) => {
                                            setFormData({ ...formData, Contact: e.target.value })
                                            setDuplicateWarning(null)
                                        }}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-white/30 transition-all font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-2">
                                        Business / Driving School Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Manchester Driving Hub"
                                        value={formData["Business Name"]}
                                        onChange={(e) => {
                                            setFormData({ ...formData, "Business Name": e.target.value })
                                            setDuplicateWarning(null)
                                        }}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-white/30 transition-all font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-2">
                                        Phone Number / WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 07741 299633"
                                        value={formData["Phone Number"] || ""}
                                        onChange={(e) => {
                                            setFormData({ ...formData, "Phone Number": e.target.value })
                                            setDuplicateWarning(null)
                                        }}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-white/30 transition-all font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-2">
                                        Email Target
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="e.g. contact@domain.co.uk"
                                        value={formData.Email || ""}
                                        onChange={(e) => {
                                            setFormData({ ...formData, Email: e.target.value })
                                            setDuplicateWarning(null)
                                        }}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-white/30 transition-all font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-2">
                                        Website URL
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={formData["Website (if applicable)"] || ""}
                                        onChange={(e) => setFormData({ ...formData, "Website (if applicable)": e.target.value })}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-white/30 transition-all font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-2">
                                        Annual Value (£/year)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="600"
                                        value={formData.Value}
                                        onChange={(e) => setFormData({ ...formData, Value: Number(e.target.value) })}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-white/30 transition-all font-mono"
                                    />
                                </div>
                            </div>

                            {/* Status Toggles */}
                            <div>
                                <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-3">
                                    Pipeline Progression
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    {(["Contacted", "Responded", "Interested", "Closed"] as const).map((stage) => {
                                        const active = isChecked(formData[stage])
                                        return (
                                            <button
                                                key={stage}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, [stage]: active ? null : "checked" })}
                                                className={`py-3 px-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-between ${active
                                                    ? "bg-white text-black border-white"
                                                    : "bg-white/[0.02] border-white/10 text-slate-500 hover:text-white"
                                                    }`}
                                            >
                                                <span>{stage}</span>
                                                {active && <Check className="w-3 h-3 stroke-[3]" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-2">
                                    Operational Comments / Logs
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Notes on communication, booking specifics, or custom requirements..."
                                    value={formData.Comments || ""}
                                    onChange={(e) => setFormData({ ...formData, Comments: e.target.value })}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-white/30 transition-all resize-none font-mono"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                                >
                                    Dismiss
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3.5 bg-white text-black hover:bg-slate-200 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? "Committing..." : editingLead ? "Save Changes" : "Commit Record"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}