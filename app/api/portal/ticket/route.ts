import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const OVERTIME_RATE_ZAR = 400 // R400 per hour
const DEFAULT_MONTHLY_HOURS = 2.0

// Server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""
const supabase = createClient(supabaseUrl, supabaseKey)

// ── 1. Call Google Gemini to estimate hours ──────────────────────────────────
async function estimateHoursWithGemini(ticket: {
  title: string
  description: string
  category: string
  priority: string
}): Promise<{ estimated_hours: number; reasoning: string }> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    const fallbackEstimates: Record<string, number> = {
      bug: 1.0,
      automation_failure: 1.5,
      feature_request: 3.5,
      integration: 3.0,
      maintenance: 0.5,
      general: 0.5,
    }
    const base = fallbackEstimates[ticket.category] || 1.0
    const multiplier = ticket.priority === "urgent" ? 1.5 : ticket.priority === "high" ? 1.2 : 1.0
    const est = Math.round(base * multiplier * 2) / 2
    return {
      estimated_hours: est,
      reasoning: "Heuristic estimate based on category and priority (GEMINI_API_KEY not configured).",
    }
  }

  const prompt = `You are a Senior Solutions Architect estimating development and operational time for a client support ticket.
Ticket details:
- Title: "${ticket.title}"
- Description: "${ticket.description}"
- Category: "${ticket.category}"
- Priority: "${ticket.priority}"

Please provide a realistic estimate in hours (e.g. 0.5, 1.0, 1.5, 2.0, 3.5, etc.) required to investigate, implement, test, and deploy this resolution.
Return ONLY a valid JSON object matching this schema:
{
  "estimated_hours": <number between 0.25 and 20>,
  "reasoning": "<1-2 sentence concise explanation>"
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

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status}`)
    }

    const data = await res.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
    const parsed = JSON.parse(rawText)

    const hours = Math.max(0.25, Math.round(Number(parsed.estimated_hours || 1.0) * 4) / 4)
    return {
      estimated_hours: hours,
      reasoning: parsed.reasoning || "Estimated via Gemini model based on ticket complexity.",
    }
  } catch (err) {
    console.warn("Gemini estimation failed, using fallback:", err)
    return {
      estimated_hours: ticket.priority === "urgent" ? 2.5 : 1.5,
      reasoning: "Automated baseline applied due to temporary AI timeout.",
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
  const n8nWebhookUrl = process.env.N8N_MERCURY_WEBHOOK_URL || "https://n8n.stellarcode.agency/webhook/mercury-invoice"
  const mercuryKey = process.env.MERCURY_API_KEY

  // Strategy A: Route via self-hosted n8n (retains static IP allowlist)
  try {
    const n8nRes = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: params.amountZAR,
        clientName: params.clientName,
        clientEmail: params.clientEmail,
        ticketCode: params.ticketCode,
        ticketTitle: params.description.slice(0, 80),
      }),
    })

    if (n8nRes.ok) {
      const data = await n8nRes.json()
      if (data.paymentLink) {
        return {
          paymentLink: data.paymentLink,
          invoiceId: data.invoiceId || `MERC-${Date.now()}`,
        }
      }
    }
  } catch (err) {
    console.warn("n8n invoice proxy unreachable, trying direct or reference fallback...", err)
  }

  // Strategy B: Direct Mercury API with "sendEmailOption": "DontSend"
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
          currencyCode: "USD",
          creditCardEnabled: true,
          achDebitEnabled: true,
          sendEmailOption: "DontSend", // Guarantees Mercury DOES NOT email the client
          destinationAccountId: process.env.MERCURY_DESTINATION_ACCOUNT_ID || undefined,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          invoiceDate: new Date().toISOString().split("T")[0],
          invoiceNumber: `INV-${params.ticketCode}`,
          lineItems: [
            {
              name: `Overtime Support (${params.ticketCode})`,
              unitPrice: params.amountZAR,
              quantity: 1,
            },
          ],
          payerMemo: `StellarCode Ticket Overtime Billed: R${params.amountZAR}`,
        }),
      })

      if (mercuryRes.ok) {
        const inv = await mercuryRes.json()
        return {
          paymentLink: inv.paymentLink || inv.hostedInvoiceUrl || `https://app.mercury.com/pay/${inv.id}`,
          invoiceId: inv.id || `MERC-${Date.now()}`,
        }
      }
    } catch (e) {
      console.warn("Direct Mercury API error:", e)
    }
  }

  // Strategy C: Safe reference fallback link
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

    // Step A: Client resolution and monthly 2-hour reset check
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
      if (!lastReset.startsWith(currentMonthKey)) {
        const { data: resetClient } = await supabase
          .from("stellarcode_clients")
          .update({
            monthly_hours_allocated: DEFAULT_MONTHLY_HOURS,
            monthly_hours_remaining: DEFAULT_MONTHLY_HOURS,
            last_hours_reset: new Date().toISOString(),
          })
          .eq("id", existingClient.id)
          .select("*")
          .single()

        clientRecord = resetClient || {
          ...existingClient,
          monthly_hours_remaining: DEFAULT_MONTHLY_HOURS,
        }
      }
    } else {
      const { data: newClient, error: clientErr } = await supabase
        .from("stellarcode_clients")
        .insert([
          {
            company_name: companyName || contactName,
            contact_name: contactName,
            email: cleanEmail,
            phone: phone || null,
            status: "active",
            monthly_hours_allocated: DEFAULT_MONTHLY_HOURS,
            monthly_hours_remaining: DEFAULT_MONTHLY_HOURS,
            last_hours_reset: new Date().toISOString(),
          },
        ])
        .select("*")
        .single()

      if (clientErr) throw clientErr
      clientRecord = newClient
    }

    const currentAvailableHours = Number(
      clientRecord.monthly_hours_remaining !== undefined && clientRecord.monthly_hours_remaining !== null
        ? clientRecord.monthly_hours_remaining
        : DEFAULT_MONTHLY_HOURS
    )

    // Step B: AI Estimation with Google Gemini
    const { estimated_hours, reasoning } = await estimateHoursWithGemini({
      title,
      description,
      category,
      priority,
    })

    // Step C: Deduct from monthly hours & compute overtime
    let hoursDeducted = 0
    let remainingHoursAfter = currentAvailableHours
    let overtimeHours = 0
    let overtimeAmount = 0
    let paymentStatus: "not_required" | "pending" | "paid" = "not_required"
    let paymentLink: string | null = null
    let mercuryInvoiceId: string | null = null

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

      // Step D: Generate Mercury Payment Link for overtime
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

    // Step E: Update client record in Supabase
    await supabase
      .from("stellarcode_clients")
      .update({
        monthly_hours_remaining: remainingHoursAfter,
      })
      .eq("id", clientRecord.id)

    // Step F: Insert Ticket with full billing and time logging
    const ticketCode = `ST-${Math.floor(1000 + Math.random() * 9000)}`
    const { data: ticket, error: ticketErr } = await supabase
      .from("stellarcode_tickets")
      .insert([
        {
          ticket_code: ticketCode,
          client_id: clientRecord.id,
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
        },
      ])
      .select("*")
      .single()

    if (ticketErr) throw ticketErr

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticket_code: ticket.ticket_code,
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
      },
    })
  } catch (error: any) {
    console.error("Ticket processing error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to process ticket and hours deduction." },
      { status: 500 }
    )
  }
}