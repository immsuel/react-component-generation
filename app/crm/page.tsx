"use client"

export const dynamic = "force-dynamic"

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
    Check,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Calendar
} from "lucide-react"
import { supabase, type StellarLead } from "@/lib/supabase"
import Link from "next/link"

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizePhone(phone: string | number | null | undefined): string {
    if (!phone) return ""
    let digits = String(phone).replace(/\D/g, "")
    if (digits.startsWith("44")) digits = digits.slice(2)
    if (digits.startsWith("0")) digits = digits.slice(1)
    return digits
}

function normalizeStr(str: string | null | undefined): string {
    return (str || "").trim().toLowerCase().replace(/\s+/g, " ")
}

function formatDate(dateStr?: string | null): string {
    if (!dateStr) return "—"
    try {
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return "—"
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
    } catch {
        return "—"
    }
}

type SortKey =
    | "Contact"
    | "Phone Number"
    | "Email"
    | "created_at"
    | "Contacted"
    | "Responded"
    | "Interested"
    | "Closed"
    | "Value"

export default function CRMPage() {
    const router = useRouter()
    const [leads, setLeads] = useState<StellarLead[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterStage, setFilterStage] = useState<"ALL" | "Contacted" | "Responded" | "Interested" | "Closed">("ALL")

    // Sorting State
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
        key: "created_at",
        direction: "desc",
    })

    // Modal & Drawer State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingLead, setEditingLead] = useState<StellarLead | null>(null)
    const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

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
        Value: 600,
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
            console.error("Error loading leads:", err?.message || err)
        } finally {
            setLoading(false)
        }
    }

    const isChecked = (val: any) => val === "checked" || val === true || val === "true"

    // Quick Toggle Status
    const toggleStatus = async (lead: StellarLead, field: "Contacted" | "Responded" | "Interested" | "Closed") => {
        const nextVal = isChecked(lead[field]) ? null : "checked"
        const updated = { ...lead, [field]: nextVal }

        setLeads((prev) =>
            prev.map((l) =>
                (l.id && l.id === lead.id) ||
                    (l.Email === lead.Email && l["Phone Number"] === lead["Phone Number"])
                    ? updated
                    : l
            )
        )

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
            console.error("Update error:", err)
            fetchLeads()
        }
    }

    // Duplicate Finder
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
            if (currentId && l.id === currentId) return false

            const existingPhone = normalizePhone(l["Phone Number"])
            if (cleanPhone.length >= 7 && existingPhone.length >= 7 && cleanPhone === existingPhone) {
                return true
            }

            const existingContact = normalizeStr(l.Contact)
            if (cleanContact.length >= 3 && existingContact === cleanContact) {
                return true
            }

            const existingEmail = normalizeStr(l.Email)
            if (cleanEmail.length >= 4 && existingEmail === cleanEmail) {
                return true
            }

            const existingBiz = normalizeStr(l["Business Name"])
            if (cleanBiz.length >= 3 && existingBiz.length >= 3 && cleanBiz === existingBiz) {
                return true
            }

            return false
        })
    }

    // Handle Sort Header Click
    const handleSort = (key: SortKey) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }))
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
            Value: lead.Value || 600,
        })
        setDuplicateWarning(null)
        setIsModalOpen(true)
    }

    const handleDelete = async (lead: StellarLead) => {
        if (!confirm(`Are you sure you want to delete ${lead.Contact || lead["Business Name"] || "this lead"}?`)) return

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

        const dup = checkForDuplicates(
            formData.Contact,
            formData["Phone Number"],
            formData.Email,
            formData["Business Name"],
            editingLead?.id
        )

        if (dup && !editingLead) {
            setDuplicateWarning(
                `This lead already exists: matches "${dup.Contact || "Unnamed"}" (${dup["Phone Number"] || dup.Email || "No phone"}).`
            )
            setIsSubmitting(false)
            return
        }

        try {
            const payload = {
                ...formData,
                created_at: editingLead?.created_at || new Date().toISOString(),
            }

            if (editingLead) {
                let query = supabase.from("stellarcode_leads").update(payload)
                if (editingLead.id) {
                    query = query.eq("id", editingLead.id)
                } else {
                    query = query.eq("Phone Number", editingLead["Phone Number"])
                }
                await query
            } else {
                await supabase.from("stellarcode_leads").insert([payload])
            }

            setIsModalOpen(false)
            fetchLeads()
        } catch (err: any) {
            console.error("Save error:", err)
            alert(err?.message || "Failed to save lead.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Export Filtered CSV
    const exportCSV = () => {
        const headers = [
            "Date Added,Business Name,Contact,Phone Number,Email,Website,Contacted,Responded,Interested,Closed,Value,Comments\n",
        ]
        const rows = sortedAndFilteredLeads.map((l) =>
            [
                `"${formatDate(l.created_at)}"`,
                `"${l["Business Name"] || ""}"`,
                `"${l.Contact || ""}"`,
                `"${l["Phone Number"] || ""}"`,
                `"${l.Email || ""}"`,
                `"${l["Website (if applicable)"] || ""}"`,
                isChecked(l.Contacted) ? "Yes" : "No",
                isChecked(l.Responded) ? "Yes" : "No",
                isChecked(l.Interested) ? "Yes" : "No",
                isChecked(l.Closed) ? "Yes" : "No",
                l.Value || 600,
                `"${(l.Comments || "").replace(/"/g, '""')}"`,
            ].join(",")
        )

        const blob = new Blob([headers.concat(rows.join("\n")).join("")], {
            type: "text/csv;charset=utf-8;",
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Search & Stage Filter
    const sortedAndFilteredLeads = useMemo(() => {
        const filtered = leads.filter((lead) => {
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

        // Apply Sorting
        return filtered.sort((a, b) => {
            const { key, direction } = sortConfig
            const mod = direction === "asc" ? 1 : -1

            if (key === "created_at") {
                const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
                const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
                return (timeA - timeB) * mod
            }

            if (key === "Value") {
                const valA = Number(a.Value || 600)
                const valB = Number(b.Value || 600)
                return (valA - valB) * mod
            }

            if (
                key === "Contacted" ||
                key === "Responded" ||
                key === "Interested" ||
                key === "Closed"
            ) {
                const boolA = isChecked(a[key]) ? 1 : 0
                const boolB = isChecked(b[key]) ? 1 : 0
                return (boolA - boolB) * mod
            }

            const strA = (a[key] ? String(a[key]) : "").toLowerCase()
            const strB = (b[key] ? String(b[key]) : "").toLowerCase()
            return strA.localeCompare(strB) * mod
        })
    }, [leads, search, filterStage, sortConfig])

    // Analytics Metrics
    const metrics = useMemo(() => {
        const total = leads.length
        const contacted = leads.filter((l) => isChecked(l.Contacted)).length
        const responded = leads.filter((l) => isChecked(l.Responded)).length
        const closedLeads = leads.filter((l) => isChecked(l.Closed))
        const closed = closedLeads.length

        // Calculate annual value ONLY from closed leads
        const closedAnnualValue = closedLeads.reduce(
            (acc, curr) => acc + (Number(curr.Value) > 0 ? Number(curr.Value) : 600),
            0
        )

        const responseRate = contacted > 0 ? Math.round((responded / contacted) * 100) : 0
        const conversionRate = total > 0 ? Math.round((closed / total) * 100) : 0

        return { total, contacted, responded, closed, closedAnnualValue, responseRate, conversionRate }
    }, [leads])

    // Render Sort Header Indicator
    const renderSortIndicator = (key: SortKey) => {
        if (sortConfig.key !== key) {
            return <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-40 group-hover:opacity-100 transition-opacity ml-1.5 shrink-0" />
        }
        return sortConfig.direction === "asc" ? (
            <ArrowUp className="w-3 h-3 text-white ml-1.5 shrink-0" />
        ) : (
            <ArrowDown className="w-3 h-3 text-white ml-1.5 shrink-0" />
        )
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/10 font-sans pb-24">

            {/* Top Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-md px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-sm font-semibold tracking-wide text-white hover:text-slate-300 transition-colors">
                            StellarCode
                        </Link>
                        <div className="h-3 w-px bg-white/10 hidden sm:block" />
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>CRM Dashboard</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchLeads}
                            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all"
                            title="Refresh leads"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-white" : ""}`} />
                        </button>
                        <button
                            onClick={() => {
                                sessionStorage.removeItem("stellar_crm_auth")
                                router.push("/login")
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Log out</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Header */}
            <section className="pt-32 pb-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-medium mb-4">
                                <Layers className="w-3.5 h-3.5" />
                                Leads Overview
                            </div>
                            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                                Client Pipeline
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={exportCSV}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] text-slate-300 text-xs font-semibold transition-all"
                            >
                                <Download className="w-3.5 h-3.5 text-slate-400" />
                                Export CSV
                            </button>
                            <button
                                onClick={handleOpenAdd}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-semibold transition-transform hover:scale-105 active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                Add Lead
                            </button>
                        </div>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                            <div className="flex justify-between items-center text-slate-400 mb-4 text-xs font-medium">
                                <span>Total Leads</span>
                                <Users className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="text-3xl font-bold tracking-tight text-white mb-1">{metrics.total}</div>
                            <div className="text-xs text-slate-500">
                                {metrics.contacted} contacted ({Math.round((metrics.contacted / (metrics.total || 1)) * 100)}%)
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                            <div className="flex justify-between items-center text-slate-400 mb-4 text-xs font-medium">
                                <span>Response Rate</span>
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="text-3xl font-bold tracking-tight text-white mb-1">{metrics.responseRate}%</div>
                            <div className="text-xs text-slate-500">
                                {metrics.responded} replied to outreach
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                            <div className="flex justify-between items-center text-slate-400 mb-4 text-xs font-medium">
                                <span>Closed Deals</span>
                                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="text-3xl font-bold tracking-tight text-white mb-1">{metrics.closed}</div>
                            <div className="text-xs text-slate-500">
                                {metrics.conversionRate}% conversion rate
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                            <div className="flex justify-between items-center text-slate-400 mb-4 text-xs font-medium">
                                <span>Total Annual Value</span>
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="text-3xl font-bold tracking-tight text-white mb-1">
                                £{metrics.closedAnnualValue.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-500">
                                {metrics.closed} closed {metrics.closed === 1 ? "deal" : "deals"} (£600/yr)
                            </div>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by contact, business, phone, or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-full">
                            {(["ALL", "Contacted", "Responded", "Interested", "Closed"] as const).map((stage) => {
                                const isActive = filterStage === stage
                                return (
                                    <button
                                        key={stage}
                                        onClick={() => setFilterStage(stage)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${isActive
                                            ? "bg-white text-black shadow-md"
                                            : "text-slate-400 hover:text-white"
                                            }`}
                                    >
                                        {stage === "ALL" ? "All Leads" : stage}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Leads Spreadsheet Table */}
                    <div className="bg-[#050505] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="sticky top-0 bg-[#080808] border-b border-white/10 text-xs font-semibold text-slate-400 z-20">
                                    <tr>
                                        {/* Sortable Header: Contact & Business */}
                                        <th
                                            onClick={() => handleSort("Contact")}
                                            className="py-4 px-6 cursor-pointer group hover:text-white select-none transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <span>Contact & Business</span>
                                                {renderSortIndicator("Contact")}
                                            </div>
                                        </th>

                                        {/* Sortable Header: Date Added */}
                                        <th
                                            onClick={() => handleSort("created_at")}
                                            className="py-4 px-4 cursor-pointer group hover:text-white select-none transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                                                <span>Date Added</span>
                                                {renderSortIndicator("created_at")}
                                            </div>
                                        </th>

                                        {/* Sortable Header: Phone */}
                                        <th
                                            onClick={() => handleSort("Phone Number")}
                                            className="py-4 px-6 cursor-pointer group hover:text-white select-none transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <span>Phone / WhatsApp</span>
                                                {renderSortIndicator("Phone Number")}
                                            </div>
                                        </th>

                                        {/* Sortable Header: Email */}
                                        <th
                                            onClick={() => handleSort("Email")}
                                            className="py-4 px-6 cursor-pointer group hover:text-white select-none transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <span>Email</span>
                                                {renderSortIndicator("Email")}
                                            </div>
                                        </th>

                                        {/* Sortable Header: Contacted */}
                                        <th
                                            onClick={() => handleSort("Contacted")}
                                            className="py-4 px-3 text-center cursor-pointer group hover:text-white select-none transition-colors"
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Contacted</span>
                                                {renderSortIndicator("Contacted")}
                                            </div>
                                        </th>

                                        {/* Sortable Header: Responded */}
                                        <th
                                            onClick={() => handleSort("Responded")}
                                            className="py-4 px-3 text-center cursor-pointer group hover:text-white select-none transition-colors"
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Responded</span>
                                                {renderSortIndicator("Responded")}
                                            </div>
                                        </th>

                                        {/* Sortable Header: Interested */}
                                        <th
                                            onClick={() => handleSort("Interested")}
                                            className="py-4 px-3 text-center cursor-pointer group hover:text-white select-none transition-colors"
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Interested</span>
                                                {renderSortIndicator("Interested")}
                                            </div>
                                        </th>

                                        {/* Sortable Header: Closed */}
                                        <th
                                            onClick={() => handleSort("Closed")}
                                            className="py-4 px-3 text-center cursor-pointer group hover:text-white select-none transition-colors"
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Closed</span>
                                                {renderSortIndicator("Closed")}
                                            </div>
                                        </th>

                                        {/* Sortable Header: Annual Value */}
                                        <th
                                            onClick={() => handleSort("Value")}
                                            className="py-4 px-6 cursor-pointer group hover:text-white select-none transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <span>Annual Value</span>
                                                {renderSortIndicator("Value")}
                                            </div>
                                        </th>

                                        <th className="py-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={10} className="text-center py-20 text-xs text-slate-500">
                                                Loading leads from Supabase...
                                            </td>
                                        </tr>
                                    ) : sortedAndFilteredLeads.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="text-center py-20 text-xs text-slate-500">
                                                No leads found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedAndFilteredLeads.map((lead, idx) => (
                                            <tr
                                                key={lead.id || idx}
                                                className="hover:bg-white/[0.02] transition-colors group"
                                            >
                                                {/* Contact & Business */}
                                                <td className="py-4 px-6">
                                                    <div className="font-semibold text-white text-sm">
                                                        {lead.Contact || "Unnamed Contact"}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-0.5">
                                                        {lead["Business Name"] || "—"}
                                                    </div>
                                                </td>

                                                {/* Date Added */}
                                                <td className="py-4 px-4 font-mono text-slate-400 whitespace-nowrap">
                                                    {formatDate(lead.created_at)}
                                                </td>

                                                {/* Phone */}
                                                <td className="py-4 px-6 text-slate-300">
                                                    {lead["Phone Number"] ? (
                                                        <a
                                                            href={`https://wa.me/${normalizePhone(lead["Phone Number"])}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 hover:text-white transition-colors font-mono"
                                                        >
                                                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                                                            {lead["Phone Number"]}
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-600">—</span>
                                                    )}
                                                </td>

                                                {/* Email */}
                                                <td className="py-4 px-6 text-slate-300">
                                                    {lead.Email ? (
                                                        <a
                                                            href={`mailto:${lead.Email}`}
                                                            className="inline-flex items-center gap-1.5 hover:text-white transition-colors truncate max-w-[160px]"
                                                        >
                                                            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                            <span className="truncate">{lead.Email}</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-600">—</span>
                                                    )}
                                                </td>

                                                {/* Contacted */}
                                                <td className="py-4 px-3 text-center">
                                                    <button
                                                        onClick={() => toggleStatus(lead, "Contacted")}
                                                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${isChecked(lead.Contacted)
                                                            ? "bg-white text-black shadow-lg"
                                                            : "bg-white/[0.03] border border-white/10 hover:border-white/30 text-transparent"
                                                            }`}
                                                    >
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    </button>
                                                </td>

                                                {/* Responded */}
                                                <td className="py-4 px-3 text-center">
                                                    <button
                                                        onClick={() => toggleStatus(lead, "Responded")}
                                                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${isChecked(lead.Responded)
                                                            ? "bg-emerald-400 text-black shadow-lg"
                                                            : "bg-white/[0.03] border border-white/10 hover:border-white/30 text-transparent"
                                                            }`}
                                                    >
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    </button>
                                                </td>

                                                {/* Interested */}
                                                <td className="py-4 px-3 text-center">
                                                    <button
                                                        onClick={() => toggleStatus(lead, "Interested")}
                                                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${isChecked(lead.Interested)
                                                            ? "bg-amber-400 text-black shadow-lg"
                                                            : "bg-white/[0.03] border border-white/10 hover:border-white/30 text-transparent"
                                                            }`}
                                                    >
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    </button>
                                                </td>

                                                {/* Closed */}
                                                <td className="py-4 px-3 text-center">
                                                    <button
                                                        onClick={() => toggleStatus(lead, "Closed")}
                                                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${isChecked(lead.Closed)
                                                            ? "bg-purple-400 text-black shadow-lg"
                                                            : "bg-white/[0.03] border border-white/10 hover:border-white/30 text-transparent"
                                                            }`}
                                                    >
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    </button>
                                                </td>

                                                {/* Value */}
                                                <td className="py-4 px-6 font-medium text-white font-mono">
                                                    £{Number(lead.Value || 600).toLocaleString()}
                                                    <span className="text-slate-500 text-xs">/yr</span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleOpenEdit(lead)}
                                                            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/10 transition-all"
                                                            title="Edit lead"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(lead)}
                                                            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-rose-500/10 transition-all"
                                                            title="Delete lead"
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

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#050505] border border-white/10 w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                                {editingLead ? "Edit Lead" : "Add New Lead"}
                            </h2>
                            <p className="text-xs text-slate-400">
                                Fill in the details below. Existing phone numbers and contact names will be checked to prevent duplicates.
                            </p>
                        </div>

                        {duplicateWarning && (
                            <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-2xl text-xs mb-6">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                                <span>{duplicateWarning}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveLead} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                        Contact Name *
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
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
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
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                        Phone / WhatsApp Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 07741 299633"
                                        value={formData["Phone Number"] || ""}
                                        onChange={(e) => {
                                            setFormData({ ...formData, "Phone Number": e.target.value })
                                            setDuplicateWarning(null)
                                        }}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="e.g. contact@domain.co.uk"
                                        value={formData.Email || ""}
                                        onChange={(e) => {
                                            setFormData({ ...formData, Email: e.target.value })
                                            setDuplicateWarning(null)
                                        }}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                        Website (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://example.com"
                                        value={formData["Website (if applicable)"] || ""}
                                        onChange={(e) => setFormData({ ...formData, "Website (if applicable)": e.target.value })}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                        Annual Value (£/year)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="600"
                                        value={formData.Value}
                                        onChange={(e) => setFormData({ ...formData, Value: Number(e.target.value) })}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-2.5">
                                    Pipeline Stage
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    {(["Contacted", "Responded", "Interested", "Closed"] as const).map((stage) => {
                                        const active = isChecked(formData[stage])
                                        return (
                                            <button
                                                key={stage}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, [stage]: active ? null : "checked" })}
                                                className={`py-3 px-4 rounded-2xl text-xs font-semibold border transition-all flex items-center justify-between ${active
                                                    ? "bg-white text-black border-white"
                                                    : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                                                    }`}
                                            >
                                                <span>{stage}</span>
                                                {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                    Notes & Comments
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Add any notes about recent calls, emails, or requirements..."
                                    value={formData.Comments || ""}
                                    onChange={(e) => setFormData({ ...formData, Comments: e.target.value })}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-3 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-7 py-3 bg-white text-black hover:bg-slate-200 rounded-full text-xs font-semibold uppercase tracking-wider transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? "Saving..." : editingLead ? "Save Changes" : "Add Lead"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}