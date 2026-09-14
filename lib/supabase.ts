import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

//comment