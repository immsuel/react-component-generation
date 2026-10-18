// lib/supabase.ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface StellarClient {
    id?: string
    created_at?: string
    updated_at?: string
    company_name: string
    contact_name: string
    email: string
    phone?: string | null
    website?: string | null
    status?: "active" | "inactive" | "onboarding"
    notes?: string | null
    monthly_hours_allocated?: number // 2 hours default
    monthly_hours_remaining?: number
    last_hours_reset?: string
}

export interface StellarTicket {
    id?: string
    ticket_code?: string
    created_at?: string
    updated_at?: string
    client_id?: string | null
    title: string
    description: string
    category?: "bug" | "automation_failure" | "feature_request" | "integration" | "maintenance" | "general"
    priority: "low" | "medium" | "high" | "urgent"
    status: "open" | "in_progress" | "resolved" | "closed"
    contact_name: string
    contact_email: string
    contact_phone?: string | null
    assigned_to?: string | null
    resolution_notes?: string | null
    lead_id?: string | null
    // Hours & Billing
    estimated_hours?: number
    gemini_reasoning?: string | null
    hours_deducted?: number
    remaining_hours_after?: number
    overtime_hours?: number
    overtime_rate?: number // R400
    overtime_amount?: number // R400 * overtime_hours
    payment_status?: "not_required" | "pending" | "paid"
    payment_link?: string | null
    mercury_invoice_id?: string | null
}

export interface StellarLead {
    id?: string | number
    "Business Name": string
    Contact: string
    "Phone Number": string | number | null
    Email: string | null
    Comments: string | null
    "Website (if applicable)": string | null
    Contacted: string | boolean | null
    Responded: string | boolean | null
    Interested: string | boolean | null
    Closed: string | boolean | null
    Value: number
    created_at?: string
}