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
    Calendar,
    Ticket as TicketIcon,
    Clock,
    AlertTriangle,
    Tag,
    UserCheck,
    MessageSquare
} from "lucide-react"
import { supabase, type StellarLead } from "@/lib/supabase"
import Link from "next/link"

// ── Types ────────────────────────────────────────────────────────────────────

export interface StellarTicket {
    id?: string
    created_at?: string
    updated_at?: string
    title: string
    description?: string
    status: "open" | "in_progress" | "resolved" | "closed"
    priority: "low" | "medium" | "high" | "urgent"
    contact_name?: string
    contact_email?: string
    contact_phone?: string
    assigned_to?: string
    lead_id?: string
}

type LeadSortKey =
    | "Contact"
    | "Phone Number"
    | "Email"
    | "created_at"
    | "Contacted"
    | "Responded"
    | "Interested"
    | "Closed"
    | "Value"

type TicketSortKey = "title" | "status" | "priority" | "created_at" | "contact_name"

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

export default function CRMPage() {
    const router = useRouter()

    // Active Dashboard Tab
    const [activeTab, setActiveTab] = useState<"leads" | "tickets">("leads")

    // ── LEADS STATE ──────────────────────────────────────────────────────────
    const [leads, setLeads] = useState<StellarLead[]>([])
    const [loadingLeads, setLoadingLeads] = useState(true)
    const [leadSearch, setLeadSearch] = useState("")
    const [filterStage, setFilterStage] = useState<"ALL" | "Contacted" | "Responded" | "Interested" | "Closed">("ALL")
    const [leadSortConfig, setLeadSortConfig] = useState<{ key: LeadSortKey; direction: "asc" | "desc" }>({
        key: "created_at",
        direction: "desc",
    })

    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
    const [editingLead, setEditingLead] = useState<StellarLead | null>(null)
    const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
    const [isSubmittingLead, setIsSubmittingLead] = useState(false)

    const emptyLeadForm: StellarLead = {
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
    const [leadFormData, setLeadFormData] = useState<StellarLead>(emptyLeadForm)

    // ── TICKETS STATE ────────────────────────────────────────────────────────
    const [tickets, setTickets] = useState<StellarTicket[]>([])
    const [loadingTickets, setLoadingTickets] = useState(true)
    const [ticketSearch, setTicketSearch] = useState("")
    const [filterTicketStatus, setFilterTicketStatus] = useState<"ALL" | "open" | "in_progress" | "resolved" | "closed">("ALL")
    const [filterTicketPriority, setFilterTicketPriority] = useState<"ALL" | "low" | "medium" | "high" | "urgent">("ALL")
    const [ticketSortConfig, setTicketSortConfig] = useState<{ key: TicketSortKey; direction: "asc" | "desc" }>({
        key: "created_at",
        direction: "desc",
    })

    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
    const [editingTicket, setEditingTicket] = useState<StellarTicket | null>(null)
    const [isSubmittingTicket, setIsSubmittingTicket] = useState(false)

    const emptyTicketForm: StellarTicket = {
        title: "",
        description: "",
        status: "open",
        priority: "medium",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        assigned_to: "",
    }
    const [ticketFormData, setTicketFormData] = useState<StellarTicket>(emptyTicketForm)

    // Auth Guard
    useEffect(() => {
        const auth = sessionStorage.getItem("stellar_crm_auth")
        if (!auth) {
            router.push("/login")
        } else {
            fetchLeads()
            fetchTickets()
        }
    }, [router])

    // ── FETCH HANDLERS ───────────────────────────────────────────────────────
    const fetchLeads = async () => {
        setLoadingLeads(true)
        try {
            const { data, error } = await supabase.from("stellarcode_leads").select("*")
            if (error) throw error
            if (data) setLeads(data)
        } catch (err: any) {
            console.error("Error loading leads:", err?.message || err)
        } finally {
            setLoadingLeads(false)
        }
    }

    const fetchTickets = async () => {
        setLoadingTickets(true)
        try {
            const { data, error } = await supabase
                .from("stellarcode_tickets")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error
            if (data) setTickets(data)
        } catch (err: any) {
            console.error("Error loading tickets:", err?.message || err)
        } finally {
            setLoadingTickets(false)
        }
    }

    const refreshAll = () => {
        if (activeTab === "leads") fetchLeads()
        else fetchTickets()
    }

    // ── LEADS HANDLERS ───────────────────────────────────────────────────────
    const isChecked = (val: any) => val === "checked" || val === true || val === "true"

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
            if (lead.id) query = query.eq("id", lead.id)
            else if (lead["Phone Number"]) query = query.eq("Phone Number", lead["Phone Number"])
            else if (lead.Email) query = query.eq("Email", lead.Email)
            await query
        } catch (err) {
            console.error("Update error:", err)
            fetchLeads()
        }
    }

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
            if (cleanPhone.length >= 7 && existingPhone.length >= 7 && cleanPhone === existingPhone) return true
            const existingContact = normalizeStr(l.Contact)
            if (cleanContact.length >= 3 && existingContact === cleanContact) return true
            const existingEmail = normalizeStr(l.Email)
            if (cleanEmail.length >= 4 && existingEmail === cleanEmail) return true
            const existingBiz = normalizeStr(l["Business Name"])
            if (cleanBiz.length >= 3 && existingBiz.length >= 3 && cleanBiz === existingBiz) return true
            return false
        })
    }

    const handleLeadSort = (key: LeadSortKey) => {
        setLeadSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }))
    }

    const handleOpenAddLead = () => {
        setEditingLead(null)
        setLeadFormData(emptyLeadForm)
        setDuplicateWarning(null)
        setIsLeadModalOpen(true)
    }

    const handleOpenEditLead = (lead: StellarLead) => {
        setEditingLead(lead)
        setLeadFormData({ ...lead, Value: lead.Value || 600 })
        setDuplicateWarning(null)
        setIsLeadModalOpen(true)
    }

    const handleDeleteLead = async (lead: StellarLead) => {
        if (!confirm(`Are you sure you want to delete ${lead.Contact || lead["Business Name"] || "this lead"}?`)) return
        setLeads((prev) => prev.filter((l) => l !== lead))

        try {
            let query = supabase.from("stellarcode_leads").delete()
            if (lead.id) query = query.eq("id", lead.id)
            else if (lead["Phone Number"]) query = query.eq("Phone Number", lead["Phone Number"])
            else if (lead.Email) query = query.eq("Email", lead.Email)
            await query
        } catch (err) {
            console.error("Delete error:", err)
            fetchLeads()
        }
    }

    const handleSaveLead = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmittingLead(true)
        setDuplicateWarning(null)

        const dup = checkForDuplicates(
            leadFormData.Contact,
            leadFormData["Phone Number"],
            leadFormData.Email,
            leadFormData["Business Name"],
            editingLead?.id
        )

        if (dup && !editingLead) {
            setDuplicateWarning(
                `This lead already exists: matches "${dup.Contact || "Unnamed"}" (${dup["Phone Number"] || dup.Email || "No phone"}).`
            )
            setIsSubmittingLead(false)
            return
        }

        try {
            const payload = {
                ...leadFormData,
                created_at: editingLead?.created_at || new Date().toISOString(),
            }

            if (editingLead) {
                let query = supabase.from("stellarcode_leads").update(payload)
                if (editingLead.id) query = query.eq("id", editingLead.id)
                else query = query.eq("Phone Number", editingLead["Phone Number"])
                await query
            } else {
                await supabase.from("stellarcode_leads").insert([payload])
            }

            setIsLeadModalOpen(false)
            fetchLeads()
        } catch (err: any) {
            console.error("Save error:", err)
            alert(err?.message || "Failed to save lead.")
        } finally {
            setIsSubmittingLead(false)
        }
    }

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

        const blob = new Blob([headers.concat(rows.join("\n")).join("")], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // ── TICKETS HANDLERS ─────────────────────────────────────────────────────
    const handleTicketSort = (key: TicketSortKey) => {
        setTicketSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }))
    }

    const handleOpenAddTicket = () => {
        setEditingTicket(null)
        setTicketFormData(emptyTicketForm)
        setIsTicketModalOpen(true)
    }

    const handleOpenEditTicket = (ticket: StellarTicket) => {
        setEditingTicket(ticket)
        setTicketFormData(ticket)
        setIsTicketModalOpen(true)
    }

    const handleQuickTicketStatus = async (ticket: StellarTicket, newStatus: StellarTicket["status"]) => {
        const updated = { ...ticket, status: newStatus }
        setTickets((prev) => prev.map((t) => (t.id === ticket.id ? updated : t)))

        try {
            await supabase.from("stellarcode_tickets").update({ status: newStatus }).eq("id", ticket.id)
        } catch (err) {
            console.error("Ticket status error:", err)
            fetchTickets()
        }
    }

    const handleDeleteTicket = async (ticket: StellarTicket) => {
        if (!confirm(`Are you sure you want to delete ticket "${ticket.title}"?`)) return
        setTickets((prev) => prev.filter((t) => t.id !== ticket.id))

        try {
            await supabase.from("stellarcode_tickets").delete().eq("id", ticket.id)
        } catch (err) {
            console.error("Delete ticket error:", err)
            fetchTickets()
        }
    }

    const handleSaveTicket = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmittingTicket(true)

        try {
            if (editingTicket?.id) {
                const { error } = await supabase
                    .from("stellarcode_tickets")
                    .update(ticketFormData)
                    .eq("id", editingTicket.id)
                if (error) throw error
            } else {
                const { error } = await supabase.from("stellarcode_tickets").insert([ticketFormData])
                if (error) throw error
            }

            setIsTicketModalOpen(false)
            fetchTickets()
        } catch (err: any) {
            console.error("Save ticket error:", err)
            alert(err?.message || "Failed to save ticket.")
        } finally {
            setIsSubmittingTicket(false)
        }
    }

    // ── COMPUTED DATA ────────────────────────────────────────────────────────
    const sortedAndFilteredLeads = useMemo(() => {
        const filtered = leads.filter((lead) => {
            const matchSearch =
                (lead.Contact || "").toLowerCase().includes(leadSearch.toLowerCase()) ||
                (lead["Business Name"] || "").toLowerCase().includes(leadSearch.toLowerCase()) ||
                (lead.Email || "").toLowerCase().includes(leadSearch.toLowerCase()) ||
                String(lead["Phone Number"] || "").includes(leadSearch)

            if (!matchSearch) return false
            if (filterStage === "Contacted") return isChecked(lead.Contacted)
            if (filterStage === "Responded") return isChecked(lead.Responded)
            if (filterStage === "Interested") return isChecked(lead.Interested)
            if (filterStage === "Closed") return isChecked(lead.Closed)
            return true
        })

        return filtered.sort((a, b) => {
            const { key, direction } = leadSortConfig
            const mod = direction === "asc" ? 1 : -1

            if (key === "created_at") {
                const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
                const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
                return (timeA - timeB) * mod
            }

            if (key === "Value") {
                return (Number(a.Value || 600) - Number(b.Value || 600)) * mod
            }

            if (key === "Contacted" || key === "Responded" || key === "Interested" || key === "Closed") {
                const boolA = isChecked(a[key]) ? 1 : 0
                const boolB = isChecked(b[key]) ? 1 : 0
                return (boolA - boolB) * mod
            }

            const strA = (a[key] ? String(a[key]) : "").toLowerCase()
            const strB = (b[key] ? String(b[key]) : "").toLowerCase()
            return strA.localeCompare(strB) * mod
        })
    }, [leads, leadSearch, filterStage, leadSortConfig])

    const sortedAndFilteredTickets = useMemo(() => {
        const filtered = tickets.filter((t) => {
            const matchSearch =
                (t.title || "").toLowerCase().includes(ticketSearch.toLowerCase()) ||
                (t.description || "").toLowerCase().includes(ticketSearch.toLowerCase()) ||
                (t.contact_name || "").toLowerCase().includes(ticketSearch.toLowerCase()) ||
                (t.contact_email || "").toLowerCase().includes(ticketSearch.toLowerCase())

            if (!matchSearch) return false
            if (filterTicketStatus !== "ALL" && t.status !== filterTicketStatus) return false
            if (filterTicketPriority !== "ALL" && t.priority !== filterTicketPriority) return false
            return true
        })

        return filtered.sort((a, b) => {
            const { key, direction } = ticketSortConfig
            const mod = direction === "asc" ? 1 : -1

            if (key === "created_at") {
                const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
                const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
                return (timeA - timeB) * mod
            }

            const strA = (a[key] ? String(a[key]) : "").toLowerCase()
            const strB = (b[key] ? String(b[key]) : "").toLowerCase()
            return strA.localeCompare(strB) * mod
        })
    }, [tickets, ticketSearch, filterTicketStatus, filterTicketPriority, ticketSortConfig])

    // Lead Metrics
    const leadMetrics = useMemo(() => {
        const total = leads.length
        const contacted = leads.filter((l) => isChecked(l.Contacted)).length
        const responded = leads.filter((l) => isChecked(l.Responded)).length
        const closedLeads = leads.filter((l) => isChecked(l.Closed))
        const closed = closedLeads.length

        const closedAnnualValue = closedLeads.reduce(
            (acc, curr) => acc + (Number(curr.Value) > 0 ? Number(curr.Value) : 600),
            0
        )

        const responseRate = contacted > 0 ? Math.round((responded / contacted) * 100) : 0
        const conversionRate = total > 0 ? Math.round((closed / total) * 100) : 0

        return { total, contacted, responded, closed, closedAnnualValue, responseRate, conversionRate }
    }, [leads])

    // Ticket Metrics
    const ticketMetrics = useMemo(() => {
        const total = tickets.length
        const open = tickets.filter((t) => t.status === "open").length
        const inProgress = tickets.filter((t) => t.status === "in_progress").length
        const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length
        const urgent = tickets.filter((t) => (t.priority === "urgent" || t.priority === "high") && t.status !== "closed").length

        return { total, open, inProgress, resolved, urgent }
    }, [tickets])

    // Helper Badges
    const renderPriorityBadge = (priority: StellarTicket["priority"]) => {
        switch (priority) {
            case "urgent":
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-rose-500/10 text-rose-400 border border-rose-500/20">URGENT</span>
            case "high":
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/20">HIGH</span>
            case "medium":
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20">MEDIUM</span>
            case "low":
            default:
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-slate-500/10 text-slate-400 border border-slate-500/20">LOW</span>
        }
    }

    const renderStatusBadge = (status: StellarTicket["status"]) => {
        switch (status) {
            case "open":
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Open</span>
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
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-sm font-semibold tracking-wide text-white hover:text-slate-300 transition-colors">
                            StellarCode
                        </Link>
                        <div className="h-3 w-px bg-white/10 hidden sm:block" />

                        {/* Navigation Tab Switcher */}
                        <div className="flex items-center bg-white/[0.04] p-1 rounded-full border border-white/10">
                            <button
                                onClick={() => setActiveTab("leads")}
                                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all ${activeTab === "leads" ? "bg-white text-black shadow-md font-semibold" : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                <Layers className="w-3.5 h-3.5" />
                                <span>Leads</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("tickets")}
                                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all ${activeTab === "tickets" ? "bg-white text-black shadow-md font-semibold" : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                <TicketIcon className="w-3.5 h-3.5" />
                                <span>Tickets</span>
                                {ticketMetrics.open > 0 && (
                                    <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                                        {ticketMetrics.open}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={refreshAll}
                            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all"
                            title="Refresh data"
                        >
                            <RefreshCw className={`w-4 h-4 ${(activeTab === "leads" ? loadingLeads : loadingTickets) ? "animate-spin text-white" : ""}`} />
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

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 1: LEADS VIEW                                                  */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeTab === "leads" && (
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
                                    onClick={handleOpenAddLead}
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
                                <div className="text-3xl font-bold tracking-tight text-white mb-1">{leadMetrics.total}</div>
                                <div className="text-xs text-slate-500">
                                    {leadMetrics.contacted} contacted ({Math.round((leadMetrics.contacted / (leadMetrics.total || 1)) * 100)}%)
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                <div className="flex justify-between items-center text-slate-400 mb-4 text-xs font-medium">
                                    <span>Response Rate</span>
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="text-3xl font-bold tracking-tight text-white mb-1">{leadMetrics.responseRate}%</div>
                                <div className="text-xs text-slate-500">
                                    {leadMetrics.responded} replied to outreach
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                <div className="flex justify-between items-center text-slate-400 mb-4 text-xs font-medium">
                                    <span>Closed Deals</span>
                                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                                </div>
                                <div className="text-3xl font-bold tracking-tight text-white mb-1">{leadMetrics.closed}</div>
                                <div className="text-xs text-slate-500">
                                    {leadMetrics.conversionRate}% conversion rate
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                <div className="flex justify-between items-center text-slate-400 mb-4 text-xs font-medium">
                                    <span>Total Annual Value</span>
                                    <DollarSign className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="text-3xl font-bold tracking-tight text-white mb-1">
                                    £{leadMetrics.closedAnnualValue.toLocaleString()}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {leadMetrics.closed} closed {leadMetrics.closed === 1 ? "deal" : "deals"} (£600/yr)
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
                                    value={leadSearch}
                                    onChange={(e) => setLeadSearch(e.target.value)}
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
                                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${isActive ? "bg-white text-black shadow-md" : "text-slate-400 hover:text-white"
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
                                            <th onClick={() => handleLeadSort("Contact")} className="py-4 px-6 cursor-pointer group hover:text-white select-none">
                                                <div className="flex items-center">
                                                    <span>Contact & Business</span>
                                                    <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-40 group-hover:opacity-100 ml-1.5 shrink-0" />
                                                </div>
                                            </th>
                                            <th onClick={() => handleLeadSort("created_at")} className="py-4 px-4 cursor-pointer group hover:text-white select-none">
                                                <div className="flex items-center">
                                                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                                                    <span>Date Added</span>
                                                    <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-40 group-hover:opacity-100 ml-1.5 shrink-0" />
                                                </div>
                                            </th>
                                            <th onClick={() => handleLeadSort("Phone Number")} className="py-4 px-6 cursor-pointer group hover:text-white select-none">
                                                <span>Phone / WhatsApp</span>
                                            </th>
                                            <th onClick={() => handleLeadSort("Email")} className="py-4 px-6 cursor-pointer group hover:text-white select-none">
                                                <span>Email</span>
                                            </th>
                                            <th onClick={() => handleLeadSort("Contacted")} className="py-4 px-3 text-center cursor-pointer group hover:text-white select-none">
                                                <span>Contacted</span>
                                            </th>
                                            <th onClick={() => handleLeadSort("Responded")} className="py-4 px-3 text-center cursor-pointer group hover:text-white select-none">
                                                <span>Responded</span>
                                            </th>
                                            <th onClick={() => handleLeadSort("Interested")} className="py-4 px-3 text-center cursor-pointer group hover:text-white select-none">
                                                <span>Interested</span>
                                            </th>
                                            <th onClick={() => handleLeadSort("Closed")} className="py-4 px-3 text-center cursor-pointer group hover:text-white select-none">
                                                <span>Closed</span>
                                            </th>
                                            <th onClick={() => handleLeadSort("Value")} className="py-4 px-6 cursor-pointer group hover:text-white select-none">
                                                <span>Annual Value</span>
                                            </th>
                                            <th className="py-4 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {loadingLeads ? (
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
                                                <tr key={lead.id || idx} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="py-4 px-6">
                                                        <div className="font-semibold text-white text-sm">
                                                            {lead.Contact || "Unnamed Contact"}
                                                        </div>
                                                        <div className="text-xs text-slate-400 mt-0.5">
                                                            {lead["Business Name"] || "—"}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 font-mono text-slate-400 whitespace-nowrap">
                                                        {formatDate(lead.created_at)}
                                                    </td>
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
                                                    <td className="py-4 px-6 text-slate-300">
                                                        {lead.Email ? (
                                                            <a href={`mailto:${lead.Email}`} className="inline-flex items-center gap-1.5 hover:text-white transition-colors truncate max-w-[160px]">
                                                                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                                <span className="truncate">{lead.Email}</span>
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-600">—</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-3 text-center">
                                                        <button
                                                            onClick={() => toggleStatus(lead, "Contacted")}
                                                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${isChecked(lead.Contacted) ? "bg-white text-black shadow-lg" : "bg-white/[0.03] border border-white/10 hover:border-white/30 text-transparent"
                                                                }`}
                                                        >
                                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                        </button>
                                                    </td>
                                                    <td className="py-4 px-3 text-center">
                                                        <button
                                                            onClick={() => toggleStatus(lead, "Responded")}
                                                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${isChecked(lead.Responded) ? "bg-emerald-400 text-black shadow-lg" : "bg-white/[0.03] border border-white/10 hover:border-white/30 text-transparent"
                                                                }`}
                                                        >
                                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                        </button>
                                                    </td>
                                                    <td className="py-4 px-3 text-center">
                                                        <button
                                                            onClick={() => toggleStatus(lead, "Interested")}
                                                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${isChecked(lead.Interested) ? "bg-amber-400 text-black shadow-lg" : "bg-white/[0.03] border border-white/10 hover:border-white/30 text-transparent"
                                                                }`}
                                                        >
                                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                        </button>
                                                    </td>
                                                    <td className="py-4 px-3 text-center">
                                                        <button
                                                            onClick={() => toggleStatus(lead, "Closed")}
                                                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center transition-all ${isChecked(lead.Closed) ? "bg-purple-400 text-black shadow-lg" : "bg-white/[0.03] border border-white/10 hover:border-white/30 text-transparent"
                                                                }`}
                                                        >
                                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                        </button>
                                                    </td>
                                                    <td className="py-4 px-6 font-medium text-white font-mono">
                                                        £{Number(lead.Value || 600).toLocaleString()}
                                                        <span className="text-slate-500 text-xs">/yr</span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleOpenEditLead(lead)}
                                                                className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/10 transition-all"
                                                                title="Edit lead"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteLead(lead)}
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
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* TAB 2: TICKETS VIEW                                                */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeTab === "tickets" && (
                <section className="pt-32 pb-8 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-medium mb-4">
                                    <TicketIcon className="w-3.5 h-3.5" />
                                    Support & Client Tasks
                                </div>
                                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                                    Ticket Management
                                </h1>
                            </div>

                            <button
                                onClick={handleOpenAddTicket}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-semibold transition-transform hover:scale-105 active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                Create Ticket
                            </button>
                        </div>

                        {/* Ticket Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                <div className="flex justify-between items-center text-slate-400 mb-4 text-xs font-medium">
                                    <span>Total Tickets</span>
                                    <Tag className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="text-3xl font-bold tracking-tight text-white mb-1">{ticketMetrics.total}</div>
                                <div className="text-xs text-slate-500">
                                    All support and feature requests
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                <div className="flex justify-between items-center text-slate-400 mb-4 text-xs font-medium">
                                    <span>Open Tickets</span>
                                    <Clock className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="text-3xl font-bold tracking-tight text-white mb-1">{ticketMetrics.open}</div>
                                <div className="text-xs text-slate-500">
                                    Awaiting initial action
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                <div className="flex justify-between items-center text-slate-400 mb-4 text-xs font-medium">
                                    <span>In Progress</span>
                                    <TrendingUp className="w-4 h-4 text-sky-400" />
                                </div>
                                <div className="text-3xl font-bold tracking-tight text-white mb-1">{ticketMetrics.inProgress}</div>
                                <div className="text-xs text-slate-500">
                                    Currently being worked on
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                <div className="flex justify-between items-center text-slate-400 mb-4 text-xs font-medium">
                                    <span>High / Urgent Priority</span>
                                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                                </div>
                                <div className="text-3xl font-bold tracking-tight text-rose-400 mb-1">{ticketMetrics.urgent}</div>
                                <div className="text-xs text-slate-500">
                                    Requires immediate attention
                                </div>
                            </div>
                        </div>

                        {/* Search & Ticket Filter Bar */}
                        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search tickets by title, description, or contact..."
                                    value={ticketSearch}
                                    onChange={(e) => setTicketSearch(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-all"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Status Pills */}
                                <div className="flex items-center gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-full">
                                    {(["ALL", "open", "in_progress", "resolved", "closed"] as const).map((st) => {
                                        const isActive = filterTicketStatus === st
                                        return (
                                            <button
                                                key={st}
                                                onClick={() => setFilterTicketStatus(st)}
                                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${isActive ? "bg-white text-black shadow-md font-semibold" : "text-slate-400 hover:text-white"
                                                    }`}
                                            >
                                                {st === "ALL" ? "All Status" : st.replace("_", " ")}
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Priority Filter Dropdown */}
                                <select
                                    value={filterTicketPriority}
                                    onChange={(e: any) => setFilterTicketPriority(e.target.value)}
                                    className="bg-[#0c0c0c] border border-white/10 text-slate-300 text-xs rounded-full px-4 py-2 focus:outline-none focus:border-white/30"
                                >
                                    <option value="ALL">All Priorities</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Tickets Table */}
                        <div className="bg-[#050505] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead className="sticky top-0 bg-[#080808] border-b border-white/10 text-xs font-semibold text-slate-400 z-20">
                                        <tr>
                                            <th onClick={() => handleTicketSort("title")} className="py-4 px-6 cursor-pointer group hover:text-white select-none">
                                                <div className="flex items-center">
                                                    <span>Ticket Title & Details</span>
                                                    <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-40 group-hover:opacity-100 ml-1.5 shrink-0" />
                                                </div>
                                            </th>
                                            <th onClick={() => handleTicketSort("priority")} className="py-4 px-4 cursor-pointer group hover:text-white select-none">
                                                <div className="flex items-center">
                                                    <span>Priority</span>
                                                    <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-40 group-hover:opacity-100 ml-1.5 shrink-0" />
                                                </div>
                                            </th>
                                            <th onClick={() => handleTicketSort("status")} className="py-4 px-4 cursor-pointer group hover:text-white select-none">
                                                <div className="flex items-center">
                                                    <span>Status</span>
                                                    <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-40 group-hover:opacity-100 ml-1.5 shrink-0" />
                                                </div>
                                            </th>
                                            <th onClick={() => handleTicketSort("contact_name")} className="py-4 px-4 cursor-pointer group hover:text-white select-none">
                                                <span>Contact / Client</span>
                                            </th>
                                            <th className="py-4 px-4">
                                                <span>Assignee</span>
                                            </th>
                                            <th onClick={() => handleTicketSort("created_at")} className="py-4 px-4 cursor-pointer group hover:text-white select-none">
                                                <div className="flex items-center">
                                                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                                                    <span>Created</span>
                                                    <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-40 group-hover:opacity-100 ml-1.5 shrink-0" />
                                                </div>
                                            </th>
                                            <th className="py-4 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {loadingTickets ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-20 text-xs text-slate-500">
                                                    Loading tickets from Supabase...
                                                </td>
                                            </tr>
                                        ) : sortedAndFilteredTickets.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-20 text-xs text-slate-500">
                                                    No tickets found.
                                                </td>
                                            </tr>
                                        ) : (
                                            sortedAndFilteredTickets.map((ticket) => (
                                                <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    {/* Title & Desc */}
                                                    <td className="py-4 px-6 max-w-sm">
                                                        <div className="font-semibold text-white text-sm">
                                                            {ticket.title}
                                                        </div>
                                                        {ticket.description && (
                                                            <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                                                                {ticket.description}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Priority */}
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        {renderPriorityBadge(ticket.priority)}
                                                    </td>

                                                    {/* Quick Status Dropdown */}
                                                    <td className="py-4 px-4 whitespace-nowrap">
                                                        <select
                                                            value={ticket.status}
                                                            onChange={(e: any) => handleQuickTicketStatus(ticket, e.target.value)}
                                                            className="bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-white/30 cursor-pointer"
                                                        >
                                                            <option value="open" className="bg-[#111]">Open</option>
                                                            <option value="in_progress" className="bg-[#111]">In Progress</option>
                                                            <option value="resolved" className="bg-[#111]">Resolved</option>
                                                            <option value="closed" className="bg-[#111]">Closed</option>
                                                        </select>
                                                    </td>

                                                    {/* Contact / Client */}
                                                    <td className="py-4 px-4">
                                                        <div className="text-white font-medium">
                                                            {ticket.contact_name || "—"}
                                                        </div>
                                                        {ticket.contact_email && (
                                                            <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                                                                {ticket.contact_email}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Assigned To */}
                                                    <td className="py-4 px-4 text-slate-300">
                                                        {ticket.assigned_to ? (
                                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[11px]">
                                                                <UserCheck className="w-3 h-3 text-slate-400" />
                                                                <span>{ticket.assigned_to}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-600">—</span>
                                                        )}
                                                    </td>

                                                    {/* Created Date */}
                                                    <td className="py-4 px-4 font-mono text-slate-400 whitespace-nowrap">
                                                        {formatDate(ticket.created_at)}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleOpenEditTicket(ticket)}
                                                                className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/10 transition-all"
                                                                title="Edit ticket"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteTicket(ticket)}
                                                                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-rose-500/10 transition-all"
                                                                title="Delete ticket"
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
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* MODAL 1: ADD / EDIT LEAD                                           */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {isLeadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#050505] border border-white/10 w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsLeadModalOpen(false)}
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
                                        value={leadFormData.Contact}
                                        onChange={(e) => {
                                            setLeadFormData({ ...leadFormData, Contact: e.target.value })
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
                                        value={leadFormData["Business Name"]}
                                        onChange={(e) => {
                                            setLeadFormData({ ...leadFormData, "Business Name": e.target.value })
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
                                        value={leadFormData["Phone Number"] || ""}
                                        onChange={(e) => {
                                            setLeadFormData({ ...leadFormData, "Phone Number": e.target.value })
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
                                        value={leadFormData.Email || ""}
                                        onChange={(e) => {
                                            setLeadFormData({ ...leadFormData, Email: e.target.value })
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
                                        value={leadFormData["Website (if applicable)"] || ""}
                                        onChange={(e) => setLeadFormData({ ...leadFormData, "Website (if applicable)": e.target.value })}
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
                                        value={leadFormData.Value}
                                        onChange={(e) => setLeadFormData({ ...leadFormData, Value: Number(e.target.value) })}
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
                                        const active = isChecked(leadFormData[stage])
                                        return (
                                            <button
                                                key={stage}
                                                type="button"
                                                onClick={() => setLeadFormData({ ...leadFormData, [stage]: active ? null : "checked" })}
                                                className={`py-3 px-4 rounded-2xl text-xs font-semibold border transition-all flex items-center justify-between ${active ? "bg-white text-black border-white" : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
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
                                    placeholder="Add notes about recent calls, emails, or requirements..."
                                    value={leadFormData.Comments || ""}
                                    onChange={(e) => setLeadFormData({ ...leadFormData, Comments: e.target.value })}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsLeadModalOpen(false)}
                                    className="px-5 py-3 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingLead}
                                    className="px-7 py-3 bg-white text-black hover:bg-slate-200 rounded-full text-xs font-semibold uppercase tracking-wider transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmittingLead ? "Saving..." : editingLead ? "Save Changes" : "Add Lead"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* MODAL 2: ADD / EDIT TICKET                                         */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {isTicketModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#050505] border border-white/10 w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsTicketModalOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                                {editingTicket ? "Edit Ticket" : "Create New Ticket"}
                            </h2>
                            <p className="text-xs text-slate-400">
                                Create or modify a support request, client bug, or internal task.
                            </p>
                        </div>

                        <form onSubmit={handleSaveTicket} className="space-y-5">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                    Ticket Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Website DNS configuration or Payment gateway issue"
                                    value={ticketFormData.title}
                                    onChange={(e) => setTicketFormData({ ...ticketFormData, title: e.target.value })}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                        Priority
                                    </label>
                                    <select
                                        value={ticketFormData.priority}
                                        onChange={(e: any) => setTicketFormData({ ...ticketFormData, priority: e.target.value })}
                                        className="w-full bg-[#0c0c0c] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/30 transition-all"
                                    >
                                        <option value="low">Low Priority</option>
                                        <option value="medium">Medium Priority</option>
                                        <option value="high">High Priority</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                        Status
                                    </label>
                                    <select
                                        value={ticketFormData.status}
                                        onChange={(e: any) => setTicketFormData({ ...ticketFormData, status: e.target.value })}
                                        className="w-full bg-[#0c0c0c] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/30 transition-all"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                        Client / Contact Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. John Smith"
                                        value={ticketFormData.contact_name || ""}
                                        onChange={(e) => setTicketFormData({ ...ticketFormData, contact_name: e.target.value })}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="e.g. client@example.com"
                                        value={ticketFormData.contact_email || ""}
                                        onChange={(e) => setTicketFormData({ ...ticketFormData, contact_email: e.target.value })}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                        Contact Phone
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 07700 900077"
                                        value={ticketFormData.contact_phone || ""}
                                        onChange={(e) => setTicketFormData({ ...ticketFormData, contact_phone: e.target.value })}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                        Assigned Team Member
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Alex / Support"
                                        value={ticketFormData.assigned_to || ""}
                                        onChange={(e) => setTicketFormData({ ...ticketFormData, assigned_to: e.target.value })}
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                    Ticket Description & Details
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Describe the issue, steps to reproduce, or request specifications..."
                                    value={ticketFormData.description || ""}
                                    onChange={(e) => setTicketFormData({ ...ticketFormData, description: e.target.value })}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsTicketModalOpen(false)}
                                    className="px-5 py-3 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingTicket}
                                    className="px-7 py-3 bg-white text-black hover:bg-slate-200 rounded-full text-xs font-semibold uppercase tracking-wider transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmittingTicket ? "Saving..." : editingTicket ? "Save Changes" : "Create Ticket"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}