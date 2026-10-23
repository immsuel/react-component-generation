"use client";

import { useState, useCallback, useRef } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1531615710172807362/g_qsGHxz0iGywN_DJdqAp4rvgyIr80Rz1wWrQRwxcbCSYPO77GqHPITutrkVCXVzEtPe";

const TOTAL_STEPS = 6;
const MAX_LOGO_BYTES = 8 * 1024 * 1024; // 8MB limit for Discord

const SA_PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
  "Mpumalanga", "North West", "Northern Cape", "Western Cape",
];

const LEAD_TYPES = ["Residential", "Commercial / Industrial", "Agricultural", "Distribution / Wholesale"];
const WORKING_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const LANGUAGES = ["English", "Afrikaans", "isiZulu", "isiXhosa", "Sesotho", "Setswana", "Other"];
const FOLLOW_UP_OPTIONS = ["Reminder after 1 day", "Follow-up after 3 days", "Final nudge after 7 days"];

const DAILY_LEAD_VOLUMES = [
  "Fewer than 5 leads / day",
  "5 - 15 leads / day",
  "16 - 30 leads / day",
  "30+ leads / day",
];

const DEFAULT_QUALIFYING_QUESTIONS = [
  "Average monthly electricity bill (in Rands)",
  "Electrical supply phase (Single-phase vs 3-phase)",
  "Roof type (Tile, IBR / Corrugated sheet, Flat concrete, Slate)",
  "Property ownership (Own the property vs Renting)",
  "Primary goal (Loadshedding backup vs Lower electricity bills)",
  "Full physical address (for Google Earth / satellite solar roof layout)",
];

const FINANCING_OPTIONS = [
  "Cash / Direct EFT",
  "Bank Solar Financing (e.g., Absa, Nedbank, Standard Bank)",
  "Rent-to-Own / Subscription Model",
  "Merchant Finance (e.g., Capitec, FeverTree)",
];

const PACKAGE_CATEGORIES = [
  "Hybrid (Solar + Battery)",
  "Battery Backup Only",
  "Grid-Tied (Solar Only)",
  "Custom / Commercial",
];

const SUGGESTED_FAQS = [
  {
    q: "Do you assist with municipality SSEG registration and CoC?",
    a: "",
  },
  {
    q: "How long does installation take once ordered?",
    a: "",
  },
  {
    q: "Do you offer financing or rent-to-own?",
    a: "",
  },
];

// Helper factories
const makeMember = (index) => ({
  id: Date.now() + index,
  firstName: "",
  lastName: "",
  role: "",
  whatsapp: "",
  email: "",
  leadTypes: ["Residential"],
});

const makePackage = (index, category = "Hybrid (Solar + Battery)") => ({
  id: Date.now() + index,
  name: "",
  category,
  price: "",
  inverter: "",
  battery: "",
  panels: "",
  bestForBill: "",
  warranty: "",
});

const makeFaq = (index, question = "", answer = "") => ({
  id: Date.now() + index,
  question,
  answer,
});

// ─── Discord Helpers ─────────────────────────────────────────────────────────

const clip = (v, max) => {
  const s = String(v ?? "").trim();
  if (!s) return "—";
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
};

const fld = (name, value, inline = false) => ({
  name: clip(name, 256),
  value: clip(value, 1024),
  inline,
});

const listOrDash = (arr) => (arr && arr.length ? arr.join(", ") : "—");
const hexToInt = (hex) => parseInt(String(hex || "#4a7fa5").replace("#", ""), 16) || 0x4a7fa5;
const safeFileName = (name) => String(name || "logo.png").replace(/[^A-Za-z0-9._-]/g, "_");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function makeEmbeds(title, fields, color) {
  const embeds = [];
  let current = [];
  let chars = 0;
  const flush = () => {
    if (!current.length) return;
    embeds.push({
      title: embeds.length ? `${title} (cont.)` : title,
      color,
      fields: current,
    });
    current = [];
    chars = 0;
  };
  fields.forEach((f) => {
    const size = f.name.length + f.value.length;
    if (current.length >= 25 || chars + size > 4800) flush();
    current.push(f);
    chars += size;
  });
  flush();
  return embeds;
}

async function postToDiscord(message, file) {
  for (let attempt = 0; attempt < 4; attempt++) {
    let res;
    if (file) {
      const fd = new FormData();
      fd.append("payload_json", JSON.stringify(message));
      fd.append("files[0]", file, safeFileName(file.name));
      res = await fetch(DISCORD_WEBHOOK_URL, { method: "POST", body: fd });
    } else {
      res = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
    }
    if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      await sleep(((data && data.retry_after) || 1) * 1000 + 250);
      continue;
    }
    if (!res.ok) throw new Error(`Discord HTTP ${res.status}`);
    return;
  }
  throw new Error("Discord rate limit");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldGroup({ label, required, hint, children }) {
  return (
    <div className="field-group">
      <label className="field-label">
        {label} {required && <span className="req">*</span>}
      </label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

function TextInput({ id, type = "text", placeholder, value, onChange, style, step }) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="field-input"
      style={style}
      step={step}
    />
  );
}

function SelectInput({ id, value, onChange, children }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="field-input">
      {children}
    </select>
  );
}

function Textarea({ id, placeholder, value, onChange, rows = 3 }) {
  return (
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="field-input field-textarea"
      rows={rows}
    />
  );
}

function CheckboxItem({ label, checked, onChange }) {
  return (
    <div
      className={`checkbox-item ${checked ? "checked" : ""}`}
      onClick={() => onChange(!checked)}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => e.key === " " && onChange(!checked)}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

function RadioItem({ label, name, value, checked, onChange }) {
  return (
    <div
      className={`radio-item ${checked ? "checked" : ""}`}
      onClick={() => onChange(value)}
      role="radio"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => e.key === " " && onChange(value)}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

function NavRow({ onBack, onNext, nextLabel = "Continue →", isSubmitting }) {
  return (
    <div className="nav-row">
      <div>
        {onBack && (
          <button type="button" className="btn-back" onClick={onBack}>
            ← Back
          </button>
        )}
      </div>
      <button type="button" className="btn-next" onClick={onNext} disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : nextLabel}
      </button>
    </div>
  );
}

// ─── Team Member Entry ────────────────────────────────────────────────────────

function MemberEntry({ member, index, onChange, onRemove, showRemove }) {
  const update = (field) => (value) => onChange(member.id, field, value);
  const toggleType = (item) => {
    const list = member.leadTypes;
    onChange(member.id, "leadTypes", list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  return (
    <div className="card-box">
      <div className="card-header">
        <span className="card-tag">Team Member {index + 1}</span>
        {showRemove && (
          <button type="button" className="remove-btn" onClick={() => onRemove(member.id)}>
            Remove
          </button>
        )}
      </div>

      <div className="field-row">
        <FieldGroup label="First Name" required>
          <TextInput placeholder="First name" value={member.firstName} onChange={update("firstName")} />
        </FieldGroup>
        <FieldGroup label="Last Name" required>
          <TextInput placeholder="Last name" value={member.lastName} onChange={update("lastName")} />
        </FieldGroup>
      </div>

      <div className="field-row">
        <FieldGroup label="WhatsApp Number" required hint="Instant lead alerts are pushed here.">
          <TextInput type="tel" placeholder="+27 82 000 0000" value={member.whatsapp} onChange={update("whatsapp")} />
        </FieldGroup>
        <FieldGroup label="Role">
          <TextInput placeholder="e.g. Lead Engineer, Sales Rep" value={member.role} onChange={update("role")} />
        </FieldGroup>
      </div>

      <FieldGroup label="Forward Alerts For" required>
        <div className="checkbox-group">
          {LEAD_TYPES.map((lt) => (
            <CheckboxItem key={lt} label={lt} checked={member.leadTypes.includes(lt)} onChange={() => toggleType(lt)} />
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

// ─── Package Entry ────────────────────────────────────────────────────────────

function PackageEntry({ pkg, index, onChange, onRemove, canRemove }) {
  const update = (field) => (value) => onChange(pkg.id, field, value);

  return (
    <div className="card-box">
      <div className="card-header">
        <span className="card-tag">Package {index + 1}</span>
        {canRemove && (
          <button type="button" className="remove-btn" onClick={() => onRemove(pkg.id)}>
            Delete
          </button>
        )}
      </div>

      <div className="field-row">
        <FieldGroup label="Package Name" required>
          <TextInput placeholder="e.g. Starter 5kW Family Setup" value={pkg.name} onChange={update("name")} />
        </FieldGroup>
        <FieldGroup label="Category" required>
          <SelectInput value={pkg.category} onChange={update("category")}>
            {PACKAGE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </SelectInput>
        </FieldGroup>
      </div>

      <div className="field-row">
        <FieldGroup label="Turnkey Installed Price (ZAR)" required hint="Includes VAT, installation & standard CoC.">
          <TextInput type="number" placeholder="e.g. 98000" value={pkg.price} onChange={update("price")} />
        </FieldGroup>
        <FieldGroup label="Best For (Typical Monthly Bill)" hint="Helps the bot recommend this package.">
          <TextInput placeholder="e.g. R1,800 – R3,000 / month" value={pkg.bestForBill} onChange={update("bestForBill")} />
        </FieldGroup>
      </div>

      <div className="field-row-3">
        <FieldGroup label="Inverter Size">
          <TextInput placeholder="e.g. 5kW Sunsynk" value={pkg.inverter} onChange={update("inverter")} />
        </FieldGroup>
        <FieldGroup label="Battery Capacity">
          <TextInput placeholder="e.g. 5.12kWh Dyness" value={pkg.battery} onChange={update("battery")} />
        </FieldGroup>
        <FieldGroup label="Solar Panels">
          <TextInput placeholder="e.g. 8x 550W Tier 1" value={pkg.panels} onChange={update("panels")} />
        </FieldGroup>
      </div>

      <FieldGroup label="Warranty Details">
        <TextInput placeholder="e.g. 10 yr inverter & battery, 25 yr panel linear warranty" value={pkg.warranty} onChange={update("warranty")} />
      </FieldGroup>
    </div>
  );
}

// ─── FAQ Entry ────────────────────────────────────────────────────────────────

function FaqEntry({ item, index, onChange, onRemove }) {
  return (
    <div className="card-box">
      <div className="card-header">
        <span className="card-tag">FAQ #{index + 1}</span>
        <button type="button" className="remove-btn" onClick={() => onRemove(item.id)}>
          Remove
        </button>
      </div>
      <FieldGroup label="Lead's Question" required>
        <TextInput
          placeholder="e.g. Does solar still work during cloudy/rainy days?"
          value={item.question}
          onChange={(v) => onChange(item.id, "question", v)}
        />
      </FieldGroup>
      <FieldGroup label="Your Bot's Answer" required>
        <Textarea
          placeholder="e.g. Yes! While output is reduced during heavy cloud cover, your battery backup continues providing reliable power seamlessly..."
          value={item.answer}
          onChange={(v) => onChange(item.id, "answer", v)}
          rows={2}
        />
      </FieldGroup>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SolarOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const sentCount = useRef(0);

  // Step 1: Business Details
  const [business, setBusiness] = useState({
    companyName: "",
    contactName: "",
    whatsapp: "",
    email: "",
    address: "",
    city: "",
    province: "",
    serviceAreas: "",
    website: "",
    googleProfile: "",
    instagram: "",
    facebook: "",
  });

  // Step 2: Sales Team
  const [team, setTeam] = useState([makeMember(0)]);

  // Step 3: Lead Handling, Volume & Qualification
  const [leads, setLeads] = useState({
    dailyVolume: "5 - 15 leads / day",
    leadTypes: ["Residential", "Commercial / Industrial"],
    qualifyingQuestions: [...DEFAULT_QUALIFYING_QUESTIONS],
    customQuestions: "",
    minBill: "",
    commercialContact: "",
    hoursStart: "08:00",
    hoursEnd: "17:00",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    auditMethod: "team-calls",
    notes: "",
  });

  // Step 4: Packages & Equipment (Empty initial template)
  const [packages, setPackages] = useState([makePackage(0)]);

  const [pricing, setPricing] = useState({
    financing: ["Cash / Direct EFT", "Bank Solar Financing (e.g., Absa, Nedbank, Standard Bank)"],
    ssegAssistance: "Yes - Full CoC & Municipality SSEG submission included",
    tariff: "",
    preferredBrands: "Sunsynk / Deye inverters, Hubble / Dyness batteries, JA Solar panels",
    leadTime: "1 to 3 weeks",
    paymentTerms: "",
    pricingNotes: "",
  });

  // Step 5: Communication & Knowledge Base (Tone + FAQs - Answers blank)
  const [comms, setComms] = useState({
    aiTone: "friendly",
    languages: ["English", "Afrikaans"],
    followUps: ["Reminder after 1 day", "Follow-up after 3 days", "Final nudge after 7 days"],
    followUpMessage:
      "Hi [name], thanks for reaching out to [company]. Your solar calculation and package proposal are ready! Would you like us to schedule a free 15-minute roof & site audit? Reply YES to book or STOP to opt out.",
    faqs: [
      makeFaq(0, SUGGESTED_FAQS[0].q, ""),
      makeFaq(1, SUGGESTED_FAQS[1].q, ""),
    ],
  });

  // Step 6: Branding & Final (Accreditations blank)
  const [branding, setBranding] = useState({
    brandColor: "#0f62fe",
    logoFile: null,
    aboutUs: "",
    certifications: "",
    extraNotes: "",
  });
  const [logoError, setLogoError] = useState("");
  const [consent, setConsent] = useState(false);

  // ── State Handlers ──────────────────────────────────────────────────────────
  const setB = (key) => (v) => setBusiness((b) => ({ ...b, [key]: v }));

  const toggleArrayItem = (setter, key) => (item) =>
    setter((prev) => ({
      ...prev,
      [key]: prev[key].includes(item) ? prev[key].filter((x) => x !== item) : [...prev[key], item],
    }));

  const updateMember = useCallback((id, field, value) => {
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }, []);
  const addMember = () => setTeam((prev) => [...prev, makeMember(prev.length)]);
  const removeMember = (id) => setTeam((prev) => prev.filter((m) => m.id !== id));

  const updatePackage = useCallback((id, field, value) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }, []);
  const addPackage = () => setPackages((prev) => [...prev, makePackage(prev.length)]);
  const removePackage = (id) => setPackages((prev) => prev.filter((p) => p.id !== id));

  const updateFaq = useCallback((id, field, value) => {
    setComms((prev) => ({
      ...prev,
      faqs: prev.faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    }));
  }, []);
  const addFaq = () =>
    setComms((prev) => ({ ...prev, faqs: [...prev.faqs, makeFaq(prev.faqs.length)] }));
  const removeFaq = (id) =>
    setComms((prev) => ({ ...prev, faqs: prev.faqs.filter((f) => f.id !== id) }));

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setLogoError("");
    if (file && file.size > MAX_LOGO_BYTES) {
      setLogoError("Logo is larger than 8MB. Please select a smaller file.");
      setBranding((b) => ({ ...b, logoFile: null }));
      return;
    }
    setBranding((b) => ({ ...b, logoFile: file }));
  };

  const goNext = () => {
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Build Embeds for Discord ────────────────────────────────────────────────
  const buildMessages = () => {
    const color = hexToInt(branding.brandColor);
    const sections = [];

    // Step 1: Business
    sections.push(
      ...makeEmbeds("1. Business Profile", [
        fld("Company", business.companyName, true),
        fld("Primary Contact", business.contactName, true),
        fld("WhatsApp Line", business.whatsapp, true),
        fld("Email", business.email, true),
        fld("Address", [business.address, business.city, business.province].filter(Boolean).join(", ")),
        fld("Service Areas", business.serviceAreas),
        fld("Website", business.website, true),
        fld("Google Profile", business.googleProfile, true),
        fld("Socials", [business.instagram, business.facebook].filter(Boolean).join(" | ") || "—"),
      ], color)
    );

    // Step 2: Team
    sections.push(
      ...makeEmbeds(
        "2. Sales & Alerts Routing",
        team.map((m, i) =>
          fld(
            `${i + 1}. ${m.firstName} ${m.lastName} (${m.role || "Sales"})`,
            `📱 WhatsApp: ${m.whatsapp || "—"}\n🔔 Leads: ${listOrDash(m.leadTypes)}`
          )
        ),
        color
      )
    );

    // Step 3: Lead Handling & Qualification
    const qualSummary = [
      ...leads.qualifyingQuestions.map((q) => `• ${q}`),
      leads.customQuestions ? `Custom: ${leads.customQuestions}` : "",
    ].filter(Boolean).join("\n");

    sections.push(
      ...makeEmbeds("3. Lead Handling & Pre-Qualification", [
        fld("Estimated Daily Volume", leads.dailyVolume, true),
        fld("Min Bill Threshold", leads.minBill ? `R${leads.minBill}/mo` : "None", true),
        fld("Operating Hours", `${leads.hoursStart} - ${leads.hoursEnd} (${listOrDash(leads.workingDays)})`),
        fld("Lead Types Handled", listOrDash(leads.leadTypes)),
        fld("Commercial Routing", leads.commercialContact || "None specified"),
        fld("Audit Booking Method", leads.auditMethod === "team-calls" ? "Team calls lead" : "Automated booking link"),
        fld("Pre-Qualifying Questions", qualSummary || "Standard questions"),
        fld("Special Routing Notes", leads.notes),
      ], color)
    );

    // Step 4: Packages & Pricing (filter unconfigured packages)
    const validPackages = packages.filter((p) => p.name.trim() || p.price.trim());
    const pkgFields = validPackages.length > 0
      ? validPackages.map((p, i) =>
        fld(
          `${i + 1}. [${p.category}] ${p.name || "Custom Tier"}`,
          `💵 R${p.price || "—"} (Target: ${p.bestForBill || "Any"})\n⚡ Inverter: ${p.inverter || "—"} | 🔋 Battery: ${p.battery || "—"}\n☀️ Panels: ${p.panels || "—"}\n🛡️ Warranty: ${p.warranty || "—"}`
        )
      )
      : [fld("Packages", "None specified / bespoke quoting required")];

    sections.push(
      ...makeEmbeds("4. Turnkey Packages & Pricing Specs", [
        ...pkgFields,
        fld("Financing Options", listOrDash(pricing.financing)),
        fld("SSEG & CoC", pricing.ssegAssistance),
        fld("Equipment Brands", pricing.preferredBrands),
        fld("Turnaround Lead Time", pricing.leadTime, true),
        fld("Tariff Used for ROI (R/kWh)", pricing.tariff || "Not specified", true),
        fld("Payment Terms", pricing.paymentTerms || "Not specified"),
        fld("Pricing Fine-print", pricing.pricingNotes),
      ], color)
    );

    // Step 5: Communication & FAQs (only include FAQs that have been filled out)
    const answeredFaqs = comms.faqs.filter((f) => f.question.trim() && f.answer.trim());
    const faqFields = answeredFaqs.length > 0
      ? answeredFaqs.map((f, i) => fld(`FAQ ${i + 1}: ${f.question}`, f.answer))
      : [fld("FAQs", "No custom answers provided")];

    sections.push(
      ...makeEmbeds("5. WhatsApp Assistant & FAQs", [
        fld("Assistant Tone", comms.aiTone, true),
        fld("Languages", listOrDash(comms.languages), true),
        fld("Follow-Up Cadence", listOrDash(comms.followUps)),
        fld("Follow-Up Template", comms.followUpMessage),
        ...faqFields,
      ], color)
    );

    // Step 6: Branding & Accreditations
    sections.push(
      ...makeEmbeds("6. Brand Identity & Accreditations", [
        fld("Hex Color", branding.brandColor, true),
        fld("Uploaded Logo", branding.logoFile ? branding.logoFile.name : "None", true),
        fld("Accreditations / CoC", branding.certifications || "None specified"),
        fld("Company Bio", branding.aboutUs),
        fld("Extra Requirements", branding.extraNotes),
      ], color)
    );

    const now = new Date().toISOString();
    const messages = sections.map((embed) => ({ embeds: [{ ...embed, timestamp: now }] }));

    const logo = branding.logoFile;
    messages[0].content = `**New StellarCode Onboarding:** **${business.companyName || "Unnamed Installer"}**`;
    if (logo) {
      messages[0].embeds[0].thumbnail = { url: `attachment://${safeFileName(logo.name)}` };
    }
    return messages;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!consent) {
      setSubmitError("Please confirm authorization before submitting.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");

    try {
      const messages = buildMessages();
      for (let i = sentCount.current; i < messages.length; i++) {
        await postToDiscord(messages[i], i === 0 ? branding.logoFile : null);
        sentCount.current = i + 1;
        if (i < messages.length - 1) await sleep(600);
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitError("Could not transmit details to the setup queue. Please click again.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepStatus = (i) => {
    if (submitted || i < currentStep) return "done";
    if (i === currentStep) return "active";
    return "";
  };

  return (
    <>
      <style>{CSS}</style>

      <header className="hero">
        <div className="logo">StellarCode Solar Engine</div>
        <h1>Automate your solar quotes &amp; WhatsApp sales.</h1>
        <p>Complete this quick setup to configure your WhatsApp quote generator, proposal builder, and lead routing.</p>
        <div className="progress-bar" role="progressbar">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={`progress-step ${stepStatus(i + 1)}`} />
          ))}
        </div>
        <div className="step-label">
          Step <span className="step-accent">{submitted ? TOTAL_STEPS : currentStep}</span> of {TOTAL_STEPS}
        </div>
      </header>

      <main className="form-container">
        {/* ── STEP 1: BUSINESS DETAILS ────────────────────────────────── */}
        {currentStep === 1 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">01 — Company Details</div>
              <h2>Business Profile</h2>
              <p>These details will appear on your customer proposals and WhatsApp communications.</p>
            </div>

            <div className="field-row">
              <FieldGroup label="Registered Company Name" required>
                <TextInput placeholder="e.g. Solafy Power Solutions" value={business.companyName} onChange={setB("companyName")} />
              </FieldGroup>
              <FieldGroup label="Owner / Lead Contact Name" required>
                <TextInput placeholder="e.g. Johan van der Merwe" value={business.contactName} onChange={setB("contactName")} />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="WhatsApp Business Number" required hint="The line your leads will message. We'll send a pairing QR code.">
                <TextInput type="tel" placeholder="+27 82 123 4567" value={business.whatsapp} onChange={setB("whatsapp")} />
              </FieldGroup>
              <FieldGroup label="Official Email" required>
                <TextInput type="email" placeholder="quotes@solafy.co.za" value={business.email} onChange={setB("email")} />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="Office / Workshop Address" required>
                <TextInput placeholder="e.g. Unit 4, Solar Industrial Park" value={business.address} onChange={setB("address")} />
              </FieldGroup>
              <FieldGroup label="City / Region" required>
                <TextInput placeholder="e.g. Centurion / Pretoria" value={business.city} onChange={setB("city")} />
              </FieldGroup>
            </div>

            <FieldGroup label="Province" required>
              <SelectInput value={business.province} onChange={setB("province")}>
                <option value="">Select province</option>
                {SA_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </SelectInput>
            </FieldGroup>

            <FieldGroup label="Installation Service Areas" required hint="Suburbs, cities or maximum radius (e.g. 100km from Cape Town).">
              <Textarea placeholder="e.g. Greater Johannesburg, Pretoria, Midrand, Krugersdorp" value={business.serviceAreas} onChange={setB("serviceAreas")} />
            </FieldGroup>

            <div className="field-row">
              <FieldGroup label="Website Link">
                <TextInput type="url" placeholder="https://yoursolar.co.za" value={business.website} onChange={setB("website")} />
              </FieldGroup>
              <FieldGroup label="Google Business Profile">
                <TextInput type="url" placeholder="https://maps.app.goo.gl/..." value={business.googleProfile} onChange={setB("googleProfile")} />
              </FieldGroup>
            </div>

            <NavRow onNext={goNext} />
          </section>
        )}

        {/* ── STEP 2: SALES TEAM ─────────────────────────────────────── */}
        {currentStep === 2 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">02 — Team Routing</div>
              <h2>Lead Alert Recipients</h2>
              <p>Configure which team members receive instant WhatsApp notifications when qualified leads come in.</p>
            </div>

            {team.map((m, i) => (
              <MemberEntry key={m.id} member={m} index={i} onChange={updateMember} onRemove={removeMember} showRemove={team.length > 1} />
            ))}

            <button type="button" className="add-btn" onClick={addMember}>
              + Add another team member
            </button>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── STEP 3: LEAD QUALIFICATION & ROUTING ─────────────────────── */}
        {currentStep === 3 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">03 — Lead Qualification</div>
              <h2>Volume &amp; Automated Pre-Screening</h2>
              <p>Set up how your WhatsApp bot filters leads before booking site visits or sending bespoke proposals.</p>
            </div>

            <FieldGroup label="Average Daily WhatsApp Enquiries" required hint="Helps us calibrate rate limits and notifications.">
              <div className="checkbox-group">
                {DAILY_LEAD_VOLUMES.map((vol) => (
                  <RadioItem
                    key={vol}
                    name="daily-volume"
                    value={vol}
                    label={vol}
                    checked={leads.dailyVolume === vol}
                    onChange={(v) => setLeads((l) => ({ ...l, dailyVolume: v }))}
                  />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Customer Types You Accept" required>
              <div className="checkbox-group">
                {LEAD_TYPES.map((lt) => (
                  <CheckboxItem key={lt} label={lt} checked={leads.leadTypes.includes(lt)} onChange={() => toggleArrayItem(setLeads, "leadTypes")(lt)} />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="What should the bot ask leads before generating a quote?" hint="Select all questions that apply:">
              <div className="checkbox-group">
                {DEFAULT_QUALIFYING_QUESTIONS.map((q) => (
                  <CheckboxItem
                    key={q}
                    label={q}
                    checked={leads.qualifyingQuestions.includes(q)}
                    onChange={() => toggleArrayItem(setLeads, "qualifyingQuestions")(q)}
                  />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Any Custom Qualifying Questions?">
              <TextInput
                placeholder="e.g. Do you already have a generator? Are you looking for solar geyser conversion?"
                value={leads.customQuestions}
                onChange={(v) => setLeads((l) => ({ ...l, customQuestions: v }))}
              />
            </FieldGroup>

            <div className="field-row">
              <FieldGroup label="Minimum Monthly Bill to Qualify (R)" hint="Leads under this can be flagged or disqualified.">
                <TextInput type="number" placeholder="e.g. 1500" value={leads.minBill} onChange={(v) => setLeads((l) => ({ ...l, minBill: v }))} />
              </FieldGroup>
              <FieldGroup label="Commercial Enquiries Go To" hint="Name & phone of your commercial solar engineer.">
                <TextInput placeholder="e.g. Rian, +27 82 999 1111" value={leads.commercialContact} onChange={(v) => setLeads((l) => ({ ...l, commercialContact: v }))} />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="Operating Hours (Start - End)">
                <div style={{ display: "flex", gap: "8px" }}>
                  <TextInput type="time" value={leads.hoursStart} onChange={(v) => setLeads((l) => ({ ...l, hoursStart: v }))} />
                  <TextInput type="time" value={leads.hoursEnd} onChange={(v) => setLeads((l) => ({ ...l, hoursEnd: v }))} />
                </div>
              </FieldGroup>
              <FieldGroup label="Site Audit Booking Method" required>
                <SelectInput value={leads.auditMethod} onChange={(v) => setLeads((l) => ({ ...l, auditMethod: v }))}>
                  <option value="team-calls">Our team calls the lead to schedule</option>
                  <option value="booking-link">Lead books a time slot via calendar link</option>
                </SelectInput>
              </FieldGroup>
            </div>

            <FieldGroup label="Special Lead Routing Notes">
              <Textarea
                placeholder="e.g. If client is on pre-paid Eskom in Soweto, route directly to owner. We do not do off-grid agricultural systems further than 150km."
                value={leads.notes}
                onChange={(v) => setLeads((l) => ({ ...l, notes: v }))}
              />
            </FieldGroup>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── STEP 4: PACKAGES & EQUIPMENT ─────────────────────────────── */}
        {currentStep === 4 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">04 — Packages &amp; Pricing</div>
              <h2>Your Turnkey Packages</h2>
              <p>Simple, clear packages help your WhatsApp bot suggest the best match within 30 seconds.</p>
            </div>

            {packages.map((pkg, i) => (
              <PackageEntry
                key={pkg.id}
                pkg={pkg}
                index={i}
                onChange={updatePackage}
                onRemove={removePackage}
                canRemove={packages.length > 1}
              />
            ))}

            <button type="button" className="add-btn" onClick={addPackage} style={{ marginBottom: "32px" }}>
              + Add another package tier
            </button>

            <div className="section-header" style={{ marginTop: "24px", marginBottom: "20px" }}>
              <div className="section-number">Commercial Specifications</div>
              <h3>Financing &amp; Technical Standards</h3>
            </div>

            <FieldGroup label="Financing Solutions Offered">
              <div className="checkbox-group">
                {FINANCING_OPTIONS.map((opt) => (
                  <CheckboxItem key={opt} label={opt} checked={pricing.financing.includes(opt)} onChange={() => toggleArrayItem(setPricing, "financing")(opt)} />
                ))}
              </div>
            </FieldGroup>

            <div className="field-row">
              <FieldGroup label="Municipality SSEG & CoC Support">
                <TextInput value={pricing.ssegAssistance} onChange={(v) => setPricing((p) => ({ ...p, ssegAssistance: v }))} />
              </FieldGroup>
              <FieldGroup label="Electricity Tariff Rate (R/kWh)" hint="Used in instant savings forecasts.">
                <TextInput
                  type="number"
                  step="0.01"
                  placeholder="e.g. 3.20"
                  value={pricing.tariff}
                  onChange={(v) => setPricing((p) => ({ ...p, tariff: v }))}
                />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="Hardware Brands You Trust">
                <TextInput placeholder="e.g. Deye, Sunsynk, Freedom Won, Canadian Solar" value={pricing.preferredBrands} onChange={(v) => setPricing((p) => ({ ...p, preferredBrands: v }))} />
              </FieldGroup>
              <FieldGroup label="Typical Installation Turnaround">
                <TextInput placeholder="e.g. 5 to 10 working days" value={pricing.leadTime} onChange={(v) => setPricing((p) => ({ ...p, leadTime: v }))} />
              </FieldGroup>
            </div>

            <FieldGroup label="Deposit & Payment Milestones">
              <TextInput
                placeholder="e.g. 50% deposit, 40% on delivery, 10% post-commissioning"
                value={pricing.paymentTerms}
                onChange={(v) => setPricing((p) => ({ ...p, paymentTerms: v }))}
              />
            </FieldGroup>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── STEP 5: ASSISTANT INTELLIGENCE & FAQS ─────────────────────── */}
        {currentStep === 5 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">05 — Knowledge Base &amp; Tone</div>
              <h2>Bot Tone &amp; Frequent Questions (FAQs)</h2>
              <p>Teach your WhatsApp assistant how to answer customer objections, warranties, and queries.</p>
            </div>

            <FieldGroup label="Bot Conversation Style" required>
              <div className="radio-group">
                {[
                  { value: "friendly", label: "Friendly, helpful and approachable (Recommended for residential)" },
                  { value: "professional", label: "Formal, engineering-driven and concise" },
                  { value: "mixed", label: "Balanced — warm greeting with precise technical advice" },
                ].map(({ value, label }) => (
                  <RadioItem key={value} name="ai-tone" value={value} label={label} checked={comms.aiTone === value} onChange={(v) => setComms((c) => ({ ...c, aiTone: v }))} />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Supported Languages">
              <div className="checkbox-group">
                {LANGUAGES.map((lang) => (
                  <CheckboxItem key={lang} label={lang} checked={comms.languages.includes(lang)} onChange={() => toggleArrayItem(setComms, "languages")(lang)} />
                ))}
              </div>
            </FieldGroup>

            <div style={{ marginTop: "32px", marginBottom: "16px" }}>
              <div className="section-number">Frequently Asked Questions</div>
              <p className="hint" style={{ marginBottom: "16px" }}>
                Add the typical questions your customers ask so the bot can answer them accurately.
              </p>

              {comms.faqs.map((item, i) => (
                <FaqEntry key={item.id} item={item} index={i} onChange={updateFaq} onRemove={removeFaq} />
              ))}

              <button type="button" className="add-btn" onClick={addFaq} style={{ marginBottom: "28px" }}>
                + Add Custom Question &amp; Answer
              </button>
            </div>

            <FieldGroup label="Automated Follow-Up Cadence" hint="Sent if a lead receives a quote but doesn't book a site survey.">
              <div className="checkbox-group">
                {FOLLOW_UP_OPTIONS.map((opt) => (
                  <CheckboxItem key={opt} label={opt} checked={comms.followUps.includes(opt)} onChange={() => toggleArrayItem(setComms, "followUps")(opt)} />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="WhatsApp Proposal Follow-Up Message">
              <Textarea value={comms.followUpMessage} onChange={(v) => setComms((c) => ({ ...c, followUpMessage: v }))} rows={3} />
            </FieldGroup>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── STEP 6: BRANDING & FINALIZE ──────────────────────────────── */}
        {currentStep === 6 && !submitted && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">06 — Branding &amp; Launch</div>
              <h2>Visuals &amp; Certifications</h2>
              <p>Add your company identity so all instant PDF proposals and portals look bespoke.</p>
            </div>

            <div className="field-row">
              <FieldGroup label="Primary Brand Colour" hint="Matches your logo & site palette.">
                <input
                  type="color"
                  value={branding.brandColor}
                  onChange={(e) => setBranding((b) => ({ ...b, brandColor: e.target.value }))}
                  className="field-input color-input"
                />
              </FieldGroup>
              <FieldGroup label="Company Logo" hint="PNG or SVG preferred, under 8 MB.">
                <input type="file" accept="image/*" className="field-input file-input" onChange={handleLogoChange} />
              </FieldGroup>
            </div>
            {logoError && <div className="error-msg">{logoError}</div>}

            <FieldGroup label="Accreditations & Registered Contractor Numbers" hint="Crucial for trust badges on proposals.">
              <TextInput
                placeholder="e.g. SAPVIA GreenCard, ECB/DoL Registered Contractor, ECSA PR Eng"
                value={branding.certifications}
                onChange={(v) => setBranding((b) => ({ ...b, certifications: v }))}
              />
            </FieldGroup>

            <FieldGroup label="Short Company Bio (About Us)" hint="1-2 sentences displayed on bottom of proposals.">
              <Textarea placeholder="e.g. Founded in 2017, we have installed over 750 high-yield residential and light commercial solar systems across Gauteng..." value={branding.aboutUs} onChange={(v) => setBranding((b) => ({ ...b, aboutUs: v }))} />
            </FieldGroup>

            <FieldGroup label="Anything else we need to configure?">
              <Textarea placeholder="Special CRM integrations, custom webhook endpoints, etc..." value={branding.extraNotes} onChange={(v) => setBranding((b) => ({ ...b, extraNotes: v }))} />
            </FieldGroup>

            <FieldGroup label="Authorization & Confirmation" required>
              <CheckboxItem
                label="I confirm that I am authorized to submit these company details and begin automated lead capture configuration."
                checked={consent}
                onChange={setConsent}
              />
            </FieldGroup>

            {submitError && <div className="error-msg">{submitError}</div>}

            <NavRow onBack={goBack} onNext={handleSubmit} nextLabel="Complete & Connect Setup →" isSubmitting={submitting} />
          </section>
        )}

        {/* ── SUCCESS SCREEN ───────────────────────────────────────────── */}
        {submitted && (
          <div className="success-screen">
            <div className="success-icon">✓</div>
            <h2>Setup Request Received!</h2>
            <p>Your business profile, packages, qualification criteria, and FAQs have been submitted.</p>
            <hr className="divider" style={{ maxWidth: 220, margin: "32px auto" }} />
            <p style={{ fontSize: "14px", color: "var(--accent-bright)" }}>
              Next step: Once set up, we will send you a link where you'll be able to pair your WhatsApp.
            </p>
          </div>
        )}
      </main>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --black: #070c14;
    --white: #d8e4f0;
    --accent: #2e68ff;
    --accent-bright: #689aff;
    --muted: #6b8299;
    --border: #162438;
    --surface: #0b1524;
    --input-bg: #0f1d30;
    --deep: #050a12;
  }

  body {
    background: var(--black);
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    min-height: 100vh;
  }

  .hero {
    background: var(--deep);
    border-bottom: 1px solid var(--border);
    padding: 60px 40px 48px;
    position: relative;
    overflow: hidden;
  }

  .logo {
    font-family: 'DM Serif Display', serif;
    font-size: 13px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--accent-bright);
    margin-bottom: 24px;
  }

  .hero h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(32px, 4.5vw, 54px);
    font-weight: 400;
    line-height: 1.15;
    max-width: 680px;
    margin-bottom: 14px;
    color: var(--white);
  }

  .hero p {
    color: var(--muted);
    font-size: 15px;
    max-width: 520px;
    line-height: 1.6;
  }

  .progress-bar {
    display: flex;
    gap: 8px;
    margin-top: 36px;
    max-width: 480px;
  }

  .progress-step {
    height: 3px;
    flex: 1;
    background: var(--border);
    border-radius: 2px;
    transition: background 0.3s ease;
  }

  .progress-step.active { background: var(--accent-bright); }
  .progress-step.done   { background: var(--accent); opacity: 0.6; }

  .step-label {
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
    margin-top: 12px;
  }

  .step-accent { color: var(--accent-bright); font-weight: 600; }

  .form-container {
    max-width: 760px;
    margin: 0 auto;
    padding: 50px 32px 100px;
  }

  .section { animation: fadeUp 0.35s ease; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .section-header { margin-bottom: 32px; }

  .section-number {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent-bright);
    margin-bottom: 8px;
    font-weight: 500;
  }

  .section-header h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    font-weight: 400;
    margin-bottom: 8px;
  }

  .section-header h3 {
    font-size: 18px;
    font-weight: 400;
    color: var(--white);
  }

  .section-header p {
    color: var(--muted);
    font-size: 14px;
    line-height: 1.5;
  }

  .field-group { margin-bottom: 22px; }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .field-row-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .field-label {
    display: block;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
    font-weight: 500;
  }

  .req { color: var(--accent-bright); }

  .field-input {
    width: 100%;
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 300;
    padding: 12px 14px;
    outline: none;
    transition: border-color 0.2s;
  }

  .field-input:focus { border-color: var(--accent); }
  .field-input::placeholder { color: #22374e; }
  .field-input option { background: var(--surface); color: var(--white); }

  .field-textarea { resize: vertical; min-height: 80px; line-height: 1.5; }
  .color-input { height: 46px; padding: 4px; cursor: pointer; }
  .file-input { padding: 10px 14px; font-size: 13px; cursor: pointer; }

  .hint {
    font-size: 12px;
    color: var(--muted);
    margin-top: 5px;
    line-height: 1.4;
  }

  .checkbox-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 10px;
  }

  .checkbox-item, .radio-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 11px 13px;
    cursor: pointer;
    font-size: 13.5px;
    color: var(--white);
    user-select: none;
    transition: all 0.2s;
  }

  .checkbox-item input, .radio-item input {
    width: 16px;
    height: 16px;
    accent-color: var(--accent-bright);
    pointer-events: none;
  }

  .checkbox-item.checked, .radio-item.checked {
    border-color: var(--accent);
    background: rgba(46, 104, 255, 0.08);
  }

  .radio-group { display: flex; flex-direction: column; gap: 8px; }

  .card-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .card-tag {
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent-bright);
    font-weight: 500;
  }

  .remove-btn {
    background: none;
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .remove-btn:hover { border-color: #f87171; color: #f87171; }

  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: none;
    border: 1px dashed var(--border);
    color: var(--muted);
    font-size: 13px;
    padding: 12px;
    border-radius: 6px;
    cursor: pointer;
    width: 100%;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }

  .add-btn:hover { border-color: var(--accent); color: var(--accent-bright); }

  .nav-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }

  .btn-next {
    background: var(--accent);
    color: var(--white);
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    padding: 12px 28px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-next:hover:not(:disabled) { background: var(--accent-bright); }
  .btn-next:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-back {
    background: none;
    border: 1px solid var(--border);
    color: var(--muted);
    border-radius: 6px;
    font-size: 14px;
    padding: 12px 20px;
    cursor: pointer;
  }

  .btn-back:hover { border-color: var(--white); color: var(--white); }

  .error-msg {
    background: rgba(220, 38, 38, 0.1);
    border: 1px solid rgba(220, 38, 38, 0.3);
    border-radius: 6px;
    color: #f87171;
    font-size: 13px;
    padding: 12px;
    margin-top: 16px;
  }

  .success-screen {
    text-align: center;
    padding: 60px 20px;
    animation: fadeUp 0.35s ease;
  }

  .success-icon {
    width: 56px; height: 56px;
    background: rgba(46, 104, 255, 0.1);
    border: 1px solid var(--accent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    font-size: 22px;
    color: var(--accent-bright);
  }

  .success-screen h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 32px;
    margin-bottom: 12px;
  }

  .divider { border: none; border-top: 1px solid var(--border); margin: 24px 0; }

  @media (max-width: 640px) {
    .field-row, .field-row-3 { grid-template-columns: 1fr; }
    .form-container { padding: 32px 18px 80px; }
    .hero { padding: 40px 20px; }
    .checkbox-group { grid-template-columns: 1fr; }
  }
`;