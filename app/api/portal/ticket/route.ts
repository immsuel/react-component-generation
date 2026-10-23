// app/api/portal/ticket/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const OVERTIME_RATE_ZAR = 400 // R400 per hour
const DEFAULT_MONTHLY_HOURS = 12.0

// Categories that DO NOT deduct hours from client retainers
const EXEMPT_CATEGORIES = ["bug", "automation_failure", "general"]

// Server-side Supabase client with safe fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co"
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-key"
const supabase = createClient(supabaseUrl, supabaseKey)

// Discord Webhook for broadcasting customer portal tickets
const DISCORD_TICKET_WEBHOOK_URL =
  process.env.DISCORD_TICKET_WEBHOOK_URL ||
  "https://discord.com/api/webhooks/1563079716158570551/32RILGC7u03QE0zzNUwb9WILP11g1_FTkz9f64cakNGuP-Lp6A3JTBZ9eMCmksQRSO3Z"

const PRIORITY_CONFIG: Record<string, { color: number; label: string; emoji: string }> = {
  urgent: { color: 0xef4444, label: "URGENT", emoji: "🚨" },
  high: { color: 0xf97316, label: "High", emoji: "🔥" },
  medium: { color: 0x3b82f6, label: "Medium", emoji: "⚡" },
  low: { color: 0x64748b, label: "Low", emoji: "🟢" },
}

const CATEGORY_CONFIG: Record<string, string> = {
  bug: "🐛 Bug Report",
  automation_failure: "⚠️ Automation Failure",
  feature_request: "✨ Feature Request",
  integration: "🔌 Integration",
  maintenance: "🛠️ Maintenance",
  general: "💬 General Question",
}

async function broadcastTicketToDiscord(params: {
  ticketCode: string
  title: string
  description: string
  category: string
  priority: string
  contactName: string
  contactEmail: string
  companyName?: string | null
  phone?: string | null
  estimatedHours: number
  geminiReasoning?: string | null
  hoursDeducted: number
  remainingHours: number
  overtimeHours: number
  overtimeAmount: number
  paymentLink?: string | null
  isExempt: boolean
}) {
  try {
    const priorityKey = (params.priority || "medium").toLowerCase()
    const priorityInfo = PRIORITY_CONFIG[priorityKey] || PRIORITY_CONFIG.medium
    const categoryLabel = CATEGORY_CONFIG[params.category] || params.category

    const fields: Array<{ name: string; value: string; inline?: boolean }> = [
      {
        name: "👤 Contact Name",
        value: params.contactName || "Unknown",
        inline: true,
      },
      {
        name: "🏢 Company",
        value: params.companyName || "Not specified",
        inline: true,
      },
      {
        name: "📧 Email",
        value: params.contactEmail || "Not provided",
        inline: true,
      },
      {
        name: "📞 Phone",
        value: params.phone || "Not provided",
        inline: true,
      },
      {
        name: "📂 Category",
        value: categoryLabel,
        inline: true,
      },
      {
        name: "⚡ Priority",
        value: `${priorityInfo.emoji} **${priorityInfo.label}**`,
        inline: true,
      },
      {
        name: "⏱️ AI Time Estimate",
        value: `**${params.estimatedHours} hrs**`,
        inline: true,
      },
      {
        name: "📉 Retainer Deducted",
        value: params.isExempt
          ? "0.0 hrs *(Covered / Exempt)*"
          : `${params.hoursDeducted} hrs`,
        inline: true,
      },
      {
        name: "💼 Retainer Remaining",
        value: `${params.remainingHours} hrs`,
        inline: true,
      },
    ]

    if (params.overtimeHours > 0) {
      fields.push({
        name: "💰 Overtime Required",
        value: `**${params.overtimeHours} hrs** (R${params.overtimeAmount.toLocaleString()})`,
        inline: true,
      })
    }

    if (params.paymentLink) {
      fields.push({
        name: "💳 Mercury Payment Invoice",
        value: `[👉 Click here to pay invoice](${params.paymentLink})`,
        inline: false,
      })
    }

    if (params.geminiReasoning) {
      fields.push({
        name: "🤖 AI Estimation Reasoning",
        value: params.geminiReasoning.slice(0, 1000),
        inline: false,
      })
    }

    const payload = {
      content: `🔔 **New Portal Ticket Received:** \`${params.ticketCode}\` | **${params.companyName || params.contactName}**`,
      embeds: [
        {
          title: `🎫 [${params.ticketCode}] ${params.title.slice(0, 200)}`,
          description: params.description ? params.description.slice(0, 2000) : "*No description provided*",
          color: priorityInfo.color,
          fields,
          footer: {
            text: "StellarCode Customer Portal • Live Ticket Broadcast",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }

    const res = await fetch(DISCORD_TICKET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(`Discord webhook returned status ${res.status}:`, errText)
    }
  } catch (err) {
    console.error("Error broadcasting ticket to Discord webhook:", err)
  }
}

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
      bug: 1.0,
      automation_failure: 1.0,
      feature_request: 2.0,
      integration: 2.25,
      maintenance: 1.0,
      general: 1.0,
    }
    const base = fallbackEstimates[ticket.category] || 2.0
    const multiplier = ticket.priority === "urgent" ? 1.5 : ticket.priority === "high" ? 1.25 : 1.0
    const est = Math.max(1.0, Math.round(base * multiplier * 2) / 2)
    return {
      estimated_hours: est,
      reasoning: "Heuristic baseline estimate based on category and priority (minimum 1.0 hours applied).",
    }
  }

  const prompt = `You are a Senior Solutions Architect estimating development and operational time for a client support ticket.
Ticket details:
- Title: "${ticket.title}"
- Description: "${ticket.description}"
- Category: "${ticket.category}"
- Priority: "${ticket.priority}"

Please provide a realistic development time estimate. Account for code review, testing, debugging, and deployment.
IMPORTANT: The minimum possible estimate for any ticket is 1.0 hours. Estimates should realistically range from 1.0 to 8 hours in 0.5 hour increments.

Return ONLY a valid JSON object matching this schema:
{
  "estimated_hours": <number >= 1.0>,
  "reasoning": "<1-2 sentence concise explanation of required work>"
}`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
  const n8nWebhookUrl =
    process.env.N8N_MERCURY_WEBHOOK_URL ||
    "https://n8n.stellarcode.agency/webhook/84a4bcb8-f582-43c9-924d-e19db6d8fad1"

  const mercuryKey = process.env.MERCURY_API_KEY

  // Append a 4-digit timestamp suffix to prevent duplicate invoiceNumber errors on re-tests
  const uniqueInvoiceCode = `${params.ticketCode}-${Date.now().toString().slice(-4)}`

  // Strategy A: Call via n8n (retains static IP allowlist)
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

    if (!n8nRes.ok) {
      const errText = await n8nRes.text()
      console.error("n8n invoice proxy returned an error:", n8nRes.status, errText)
      throw new Error(`n8n webhook error: ${n8nRes.status} ${errText}`)
    }

    const data = await n8nRes.json()

    // Extract clean Mercury slug (e.g. 6g8r81n6hvh8kg8t)
    let slug = data.slug || ""
    if (!slug && data.paymentLink && typeof data.paymentLink === "string") {
      const match = data.paymentLink.match(/\/pay\/([a-zA-Z0-9_-]+)/)
      if (match) slug = match[1]
    }

    // Ensure slug doesn't contain raw template brackets
    if (slug && !slug.includes("{") && !slug.includes("%7B")) {
      return {
        paymentLink: `https://app.mercury.com/pay/${slug.trim()}`,
        invoiceId: data.invoiceId || data.id || slug.trim(),
      }
    }

    if (data.paymentLink && !data.paymentLink.includes("{") && !data.paymentLink.includes("%7B")) {
      return {
        paymentLink: data.paymentLink,
        invoiceId: data.invoiceId || data.id || `INV-${uniqueInvoiceCode}`,
      }
    }

    throw new Error("n8n succeeded but returned an invalid or unrendered payment link.")
  } catch (err) {
    console.warn("n8n proxy failed, attempting direct Mercury API fallback...", err)
  }

  // Strategy B: Fallback direct call to Mercury (if API key provided)
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
        const slug = inv.slug || inv.id
        return {
          paymentLink: `https://app.mercury.com/pay/${slug}`,
          invoiceId: inv.id || `INV-${uniqueInvoiceCode}`,
        }
      }
    } catch (e) {
      console.error("Direct Mercury API error:", e)
    }
  }

  // If both n8n and Mercury fail, throw error so the user is alerted rather than receiving a dead 404 URL
  throw new Error("Unable to generate Mercury payment link at this moment. Please check n8n connection.")
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
        try {
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
        } catch (e) {
          console.warn("Client hours reset skipped:", e)
        }
      }
    } else {
      // Create new client with safe fallback
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
    const normalizedCategory = String(category || "").toLowerCase().trim()
    const isExempt =
      EXEMPT_CATEGORIES.includes(normalizedCategory) ||
      normalizedCategory.includes("bug") ||
      normalizedCategory.includes("automation_failure") ||
      normalizedCategory.includes("general")

    let hoursDeducted = 0
    let remainingHoursAfter = currentAvailableHours
    let overtimeHours = 0
    let overtimeAmount = 0
    let paymentStatus: "not_required" | "pending" | "paid" = "not_required"
    let paymentLink: string | null = null
    let mercuryInvoiceId: string | null = null

    // Generate a single consistent ticket code shared across Supabase and Mercury
    const ticketCode = `ST-${Math.floor(1000 + Math.random() * 9000)}`

    if (isExempt) {
      // Bug reports, automation failures, and general questions do not deduct hours
      hoursDeducted = 0
      remainingHoursAfter = currentAvailableHours
      overtimeHours = 0
      overtimeAmount = 0
      paymentStatus = "not_required"
    } else {
      // Billable category (Feature requests, custom integrations, maintenance)
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

        // Generate Mercury Payment Link for overtime using the exact ticketCode
        try {
          const mercury = await createMercuryPaymentLink({
            amountZAR: overtimeAmount,
            clientName: contactName,
            clientEmail: cleanEmail,
            ticketCode: ticketCode,
            description: title,
          })
          paymentLink = mercury.paymentLink
          mercuryInvoiceId = mercury.invoiceId
        } catch (mercuryErr) {
          console.error("Payment link creation error:", mercuryErr)
        }
      }

      // Update remaining client hours in database
      if (clientRecord?.id) {
        try {
          await supabase
            .from("stellarcode_clients")
            .update({
              monthly_hours_remaining: remainingHoursAfter,
            })
            .eq("id", clientRecord.id)
        } catch (e) {
          console.warn("Client hours update skipped:", e)
        }
      }
    }

    // Step D: Insert Ticket Record into Supabase
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

    let finalTicket: any = null
    try {
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
    } catch (dbErr) {
      console.warn("Database notice during ticket save:", dbErr)
      finalTicket = { id: ticketCode, ticket_code: ticketCode }
    }

    // Step E: Broadcast Ticket Details to Discord Webhook
    try {
      await broadcastTicketToDiscord({
        ticketCode: finalTicket?.ticket_code || ticketCode,
        title,
        description,
        category,
        priority,
        contactName,
        contactEmail: cleanEmail,
        companyName: companyName || clientRecord?.company_name,
        phone: phone || clientRecord?.phone,
        estimatedHours: estimated_hours,
        geminiReasoning: reasoning,
        hoursDeducted,
        remainingHours: remainingHoursAfter,
        overtimeHours,
        overtimeAmount,
        paymentLink,
        isExempt,
      })
    } catch (discordErr) {
      console.error("Failed to broadcast ticket to Discord:", discordErr)
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