import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const OVERTIME_RATE_ZAR = 400 // R400 per hour
const DEFAULT_MONTHLY_HOURS = 2.0

// Categories that DO NOT deduct hours from client retainers
const EXEMPT_CATEGORIES = ["bug", "automation_failure", "general"]

// Server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""
const supabase = createClient(supabaseUrl, supabaseKey)

// ── 1. Call Google Gemini to estimate hours (Minimum 2.0 Hours) ──────────────
async function estimateHoursWithGemini(ticket: {
  title: string
  description: string
  category: string
  priority: string
}): Promise<{ estimated_hours: number; reasoning: string }> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    const fallbackEstimates: Record<string, number> = {
      bug: 2.0,
      automation_failure: 2.0,
      feature_request: 4.0,
      integration: 4.5,
      maintenance: 2.0,
      general: 2.0,
    }
    const base = fallbackEstimates[ticket.category] || 2.0
    const multiplier = ticket.priority === "urgent" ? 1.5 : ticket.priority === "high" ? 1.25 : 1.0
    const est = Math.max(2.0, Math.round(base * multiplier * 2) / 2)
    return {
      estimated_hours: est,
      reasoning: "Heuristic baseline estimate based on category and priority (minimum 2.0 hours applied).",
    }
  }

  const prompt = `You are a Senior Solutions Architect estimating development and operational time for a client support ticket.
Ticket details:
- Title: "${ticket.title}"
- Description: "${ticket.description}"
- Category: "${ticket.category}"
- Priority: "${ticket.priority}"

Please provide a realistic development time estimate. Account for code review, testing, debugging, and deployment.
IMPORTANT: The minimum possible estimate for any ticket is 2.0 hours. Estimates should realistically range from 2.0 to 12.0+ hours in 0.5 hour increments.

Return ONLY a valid JSON object matching this schema:
{
  "estimated_hours": <number >= 2.0>,
  "reasoning": "<1-2 sentence concise explanation of required work>"
}`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      }
    )

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`)

    const data = await res.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
    const parsed = JSON.parse(rawText)

    // Enforce strict minimum of 2.0 hours rounded to nearest 0.5 hr
    const rawHours = Number(parsed.estimated_hours) || 2.0
    const hours = Math.max(2.0, Math.round(rawHours * 2) / 2)

    return {
      estimated_hours: hours,
      reasoning: parsed.reasoning || "Realistic engineering time estimated via Gemini AI.",
    }
  } catch (err) {
    console.warn("Gemini estimation failed, using fallback:", err)
    return {
      estimated_hours: ticket.priority === "urgent" ? 3.0 : 2.0,
      reasoning: "Baseline 2.0+ hour estimate applied due to temporary AI timeout.",
    }
  }
}

// ── 2. Call Mercury API via n8n (Static IP) or fallback ─────────────────────
async function createMercuryPaymentLink(params: {
  amountZAR: number
  clientName: string
  clientEmail: string
  ticketCode: string
  description: string
}): Promise<{ paymentLink: string; invoiceId: string }> {
  const n8nWebhookUrl = process.env.N8N_MERCURY_WEBHOOK_URL || "https://n8n.stellarcode.agency/webhook/84a4bcb8-f582-43c9-924d-e19db6d8fad1"
  const mercuryKey = process.env.MERCURY_API_KEY

  // Always append unique timestamp to avoid "An invoice with this invoice number already exists"
  const uniqueInvoiceCode = `${params.ticketCode}-${Date.now().toString().slice(-4)}`

  try {
    const n8nRes = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: params.amountZAR,
        clientName: params.clientName,
        clientEmail: params.clientEmail,
        ticketCode: uniqueInvoiceCode,
        ticketTitle: params.description.slice(0, 80),
      }),
    })

    if (n8nRes.ok) {
      const data = await n8nRes.json()
      const link = data.slug
        ? `https://app.mercury.com/pay/${data.slug}`
        : data.paymentLink || data.hostedInvoiceUrl

      if (link) {
        return {
          paymentLink: link,
          invoiceId: data.invoiceId || data.id || `MERC-${Date.now()}`,
        }
      }
    }
  } catch (err) {
    console.warn("n8n invoice proxy unavailable, trying fallback:", err)
  }

  // Fallback direct Mercury API
  if (mercuryKey) {
    try {
      const mercuryRes = await fetch("https://api.mercury.com/api/v1/ar/invoices", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mercuryKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          currencyCode: "ZAR",
          creditCardEnabled: true,
          achDebitEnabled: false,
          useRealAccountNumber: true,
          sendEmailOption: "DontSend",
          ccEmails: [],
          destinationAccountId: process.env.MERCURY_DESTINATION_ACCOUNT_ID || undefined,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          invoiceDate: new Date().toISOString().split("T")[0],
          invoiceNumber: `INV-${uniqueInvoiceCode}`,
          lineItems: [
            {
              name: `Overtime Support (${params.ticketCode})`,
              unitPrice: params.amountZAR,
              quantity: 1,
            },
          ],
          payerMemo: `StellarCode Ticket Overtime: ${params.ticketCode}`,
        }),
      })

      if (mercuryRes.ok) {
        const inv = await mercuryRes.json()
        return {
          paymentLink: inv.slug ? `https://app.mercury.com/pay/${inv.slug}` : `https://app.mercury.com/pay/${inv.id}`,
          invoiceId: inv.id || `MERC-${Date.now()}`,
        }
      }
    } catch (e) {
      console.warn("Direct Mercury API error:", e)
    }
  }

  const fallbackId = `MERC-${Date.now().toString(36).toUpperCase()}`
  return {
    paymentLink: `https://mercury.com/pay/${fallbackId}?amount=${params.amountZAR}&currency=ZAR&ref=${encodeURIComponent(params.ticketCode)}`,
    invoiceId: fallbackId,
  }
}

// ── 3. POST Handler ──────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      companyName,
      contactName,
      email,
      phone,
      title,
      description,
      category = "bug",
      priority = "medium",
    } = body

    if (!email || !contactName || !title || !description) {
      return NextResponse.json(
        { error: "Missing required ticket fields." },
        { status: 400 }
      )
    }

    const cleanEmail = String(email).trim().toLowerCase()

    // Step A: Client resolution and monthly reset check
    let clientRecord: any = null
    const { data: existingClient } = await supabase
      .from("stellarcode_clients")
      .select("*")
      .ilike("email", cleanEmail)
      .maybeSingle()

    const currentMonthKey = new Date().toISOString().slice(0, 7) // "YYYY-MM"

    if (existingClient) {
      clientRecord = existingClient
      const lastReset = clientRecord.last_hours_reset || ""

      // If a new month has started, reset to client's configured monthly allocation
      if (!lastReset.startsWith(currentMonthKey)) {
        const clientAllocatedHours = Number(clientRecord.monthly_hours_allocated) || DEFAULT_MONTHLY_HOURS
        const { data: resetClient, error: resetErr } = await supabase
          .from("stellarcode_clients")
          .update({
            monthly_hours_remaining: clientAllocatedHours,
            last_hours_reset: new Date().toISOString(),
          })
          .eq("id", existingClient.id)
          .select("*")
          .single()

        if (!resetErr && resetClient) {
          clientRecord = resetClient
        }
      }
    } else {
      // New client creation with safe fallback
      const fullPayload = {
        company_name: companyName || contactName,
        contact_name: contactName,
        email: cleanEmail,
        phone: phone || null,
        status: "active",
        monthly_hours_allocated: DEFAULT_MONTHLY_HOURS,
        monthly_hours_remaining: DEFAULT_MONTHLY_HOURS,
        last_hours_reset: new Date().toISOString(),
      }

      const { data: nClient, error: fullErr } = await supabase
        .from("stellarcode_clients")
        .insert([fullPayload])
        .select("*")
        .single()

      if (fullErr) {
        const basicPayload = {
          company_name: companyName || contactName,
          contact_name: contactName,
          email: cleanEmail,
          phone: phone || null,
          status: "active",
        }
        const { data: basicClient, error: basicErr } = await supabase
          .from("stellarcode_clients")
          .insert([basicPayload])
          .select("*")
          .single()

        if (basicErr) throw basicErr
        clientRecord = basicClient
      } else {
        clientRecord = nClient
      }
    }

    const currentAvailableHours = Number(
      clientRecord?.monthly_hours_remaining !== undefined && clientRecord?.monthly_hours_remaining !== null
        ? clientRecord.monthly_hours_remaining
        : DEFAULT_MONTHLY_HOURS
    )

    // Step B: AI Estimation with Google Gemini (Realistic, >= 2.0 hrs)
    const { estimated_hours, reasoning } = await estimateHoursWithGemini({
      title,
      description,
      category,
      priority,
    })

    // Step C: Check if ticket category is exempt from hours deduction
    const isExempt = EXEMPT_CATEGORIES.includes(category)

    let hoursDeducted = 0
    let remainingHoursAfter = currentAvailableHours
    let overtimeHours = 0
    let overtimeAmount = 0
    let paymentStatus: "not_required" | "pending" | "paid" = "not_required"
    let paymentLink: string | null = null
    let mercuryInvoiceId: string | null = null

    if (isExempt) {
      // Bug reports, automation failures, and general questions do not deduct hours
      hoursDeducted = 0
      remainingHoursAfter = currentAvailableHours
      overtimeHours = 0
      overtimeAmount = 0
      paymentStatus = "not_required"
    } else {
      // Billable category (Feature requests, custom integrations, etc.)
      if (currentAvailableHours >= estimated_hours) {
        hoursDeducted = estimated_hours
        remainingHoursAfter = Math.round((currentAvailableHours - estimated_hours) * 100) / 100
        overtimeHours = 0
        overtimeAmount = 0
        paymentStatus = "not_required"
      } else {
        hoursDeducted = currentAvailableHours
        remainingHoursAfter = 0
        overtimeHours = Math.round((estimated_hours - currentAvailableHours) * 100) / 100
        overtimeAmount = Math.round(overtimeHours * OVERTIME_RATE_ZAR)
        paymentStatus = "pending"

        // Generate Mercury Payment Link for overtime
        const tempTicketCode = `ST-${Math.floor(1000 + Math.random() * 9000)}`
        const mercury = await createMercuryPaymentLink({
          amountZAR: overtimeAmount,
          clientName: contactName,
          clientEmail: cleanEmail,
          ticketCode: tempTicketCode,
          description: title,
        })
        paymentLink = mercury.paymentLink
        mercuryInvoiceId = mercury.invoiceId
      }

      // Update remaining client hours in database
      if (clientRecord?.id) {
        await supabase
          .from("stellarcode_clients")
          .update({
            monthly_hours_remaining: remainingHoursAfter,
          })
          .eq("id", clientRecord.id)
      }
    }

    // Step D: Insert Ticket Record into Supabase
    const ticketCode = `ST-${Math.floor(1000 + Math.random() * 9000)}`
    const fullTicketPayload = {
      ticket_code: ticketCode,
      client_id: clientRecord?.id || null,
      title,
      description,
      category,
      priority,
      status: "open",
      contact_name: contactName,
      contact_email: cleanEmail,
      contact_phone: phone || null,
      estimated_hours,
      gemini_reasoning: reasoning,
      hours_deducted: hoursDeducted,
      remaining_hours_after: remainingHoursAfter,
      overtime_hours: overtimeHours,
      overtime_rate: OVERTIME_RATE_ZAR,
      overtime_amount: overtimeAmount,
      payment_status: paymentStatus,
      payment_link: paymentLink,
      mercury_invoice_id: mercuryInvoiceId,
    }

    let finalTicket = null
    const { data: ticket, error: ticketErr } = await supabase
      .from("stellarcode_tickets")
      .insert([fullTicketPayload])
      .select("*")
      .single()

    if (ticketErr) {
      // Safe fallback for legacy schemas
      const baseTicketPayload = {
        ticket_code: ticketCode,
        client_id: clientRecord?.id || null,
        title,
        description: `${description}\n\n[Hours: Est ${estimated_hours}h | Deducted: ${hoursDeducted}h | Overtime: ${overtimeHours}h]`,
        category,
        priority,
        status: "open",
        contact_name: contactName,
        contact_email: cleanEmail,
        contact_phone: phone || null,
      }
      const { data: fallbackTicket, error: fallbackErr } = await supabase
        .from("stellarcode_tickets")
        .insert([baseTicketPayload])
        .select("*")
        .single()

      if (fallbackErr) throw fallbackErr
      finalTicket = fallbackTicket
    } else {
      finalTicket = ticket
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: finalTicket.id,
        ticket_code: finalTicket.ticket_code || ticketCode,
        estimated_hours,
        gemini_reasoning: reasoning,
        hours_deducted: hoursDeducted,
        previous_balance: currentAvailableHours,
        remaining_hours: remainingHoursAfter,
        overtime_hours: overtimeHours,
        overtime_amount: overtimeAmount,
        overtime_rate: OVERTIME_RATE_ZAR,
        payment_status: paymentStatus,
        payment_link: paymentLink,
        mercury_invoice_id: mercuryInvoiceId,
        is_exempt: isExempt,
      },
    })
  } catch (error: any) {
    console.error("Ticket processing error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to process ticket." },
      { status: 500 }
    )
  }
}