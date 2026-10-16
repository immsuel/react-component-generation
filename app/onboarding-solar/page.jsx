"use client";

import { useState, useCallback, useRef } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1531615710172807362/g_qsGHxz0iGywN_DJdqAp4rvgyIr80Rz1wWrQRwxcbCSYPO77GqHPITutrkVCXVzEtPe";

const TOTAL_STEPS = 6;
const MAX_LOGO_BYTES = 8 * 1024 * 1024; // keep under Discord's upload limit

const SA_PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
  "Mpumalanga", "North West", "Northern Cape", "Western Cape",
];

const LEAD_TYPES = ["Residential", "Commercial", "Distribution / Wholesale"];
const WORKING_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const LANGUAGES = ["English", "Afrikaans", "isiZulu", "isiXhosa", "Sesotho", "Setswana", "Other"];
const PACKAGE_SECTIONS = ["Solar Only", "Hybrid (Solar + Battery)", "Battery Backup", "Add-ons"];
const FOLLOW_UP_OPTIONS = ["Reminder after 1 day", "Follow-up after 3 days", "Final nudge after 7 days"];

const makeMember = (index) => ({
  id: Date.now() + index,
  firstName: "",
  lastName: "",
  role: "",
  whatsapp: "",
  email: "",
  leadTypes: ["Residential"],
});

const makePackage = (index, section = "") => ({
  id: Date.now() + index,
  section,
  name: "",
  price: "",
  systemSize: "",
  panels: "",
  warranty: "",
  bestFor: "",
});

// ─── Discord helpers ─────────────────────────────────────────────────────────

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

// Split fields into embeds that respect Discord limits (25 fields / ~5000 chars each).
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

function TextInput({ id, type = "text", placeholder, value, onChange, style }) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="field-input"
      style={style}
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

function Textarea({ id, placeholder, value, onChange, rows = 4 }) {
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
    <div className="instructor-entry">
      <div className="entry-number">Team Member {index + 1}</div>
      {showRemove && (
        <button type="button" className="remove-btn" onClick={() => onRemove(member.id)}>
          Remove
        </button>
      )}

      <div className="field-row">
        <FieldGroup label="First Name" required>
          <TextInput placeholder="First name" value={member.firstName} onChange={update("firstName")} />
        </FieldGroup>
        <FieldGroup label="Last Name" required>
          <TextInput placeholder="Last name" value={member.lastName} onChange={update("lastName")} />
        </FieldGroup>
      </div>

      <div className="field-row">
        <FieldGroup label="WhatsApp Number" required hint="Lead alerts are sent to this number.">
          <TextInput type="tel" placeholder="+27 82 000 0000" value={member.whatsapp} onChange={update("whatsapp")} />
        </FieldGroup>
        <FieldGroup label="Email">
          <TextInput type="email" placeholder="name@company.co.za" value={member.email} onChange={update("email")} />
        </FieldGroup>
      </div>

      <FieldGroup label="Role">
        <TextInput placeholder="e.g. Sales Manager, Owner" value={member.role} onChange={update("role")} />
      </FieldGroup>

      <FieldGroup label="Receives Alerts For" required>
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

function PackageEntry({ pkg, index, onChange, onRemove }) {
  const update = (field) => (value) => onChange(pkg.id, field, value);

  return (
    <div className="instructor-entry">
      <div className="entry-number">Package {index + 1}</div>
      <button type="button" className="remove-btn" onClick={() => onRemove(pkg.id)}>
        Remove
      </button>

      <div className="field-row">
        <FieldGroup label="Package Name" required>
          <TextInput placeholder="e.g. Home Starter 5kW" value={pkg.name} onChange={update("name")} />
        </FieldGroup>
        <FieldGroup label="Price (R, incl. installation)" required>
          <TextInput type="number" placeholder="e.g. 89000" value={pkg.price} onChange={update("price")} />
        </FieldGroup>
      </div>

      <div className="field-row">
        <FieldGroup label="System Size" required hint="Inverter and battery, if any.">
          <TextInput placeholder="e.g. 5 kW inverter + 5 kWh battery" value={pkg.systemSize} onChange={update("systemSize")} />
        </FieldGroup>
        <FieldGroup label="Panels">
          <TextInput placeholder="e.g. 8 x 550W" value={pkg.panels} onChange={update("panels")} />
        </FieldGroup>
      </div>

      <div className="field-row">
        <FieldGroup label="Best For (Monthly Bill)" hint="Helps match the right package to a lead.">
          <TextInput placeholder="e.g. R1,500 - R3,000 per month" value={pkg.bestFor} onChange={update("bestFor")} />
        </FieldGroup>
        <FieldGroup label="Warranty">
          <TextInput placeholder="e.g. 10 yr panels, 5 yr inverter" value={pkg.warranty} onChange={update("warranty")} />
        </FieldGroup>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SolarOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const sentCount = useRef(0); // lets a retry resume without duplicating messages

  // Step 1 — Business
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

  // Step 2 — Sales team
  const [team, setTeam] = useState([makeMember(0)]);

  // Step 3 — Lead handling
  const [leads, setLeads] = useState({
    leadTypes: ["Residential"],
    minBill: "",
    commercialContact: "",
    distributionContact: "",
    hoursStart: "08:00",
    hoursEnd: "17:00",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    auditMethod: "team-calls",
    notes: "",
  });

  // Step 4 — Pricing
  const [packages, setPackages] = useState([makePackage(0, "Hybrid (Solar + Battery)")]);
  const [pricing, setPricing] = useState({
    tariff: "",
    panelBrand: "",
    inverterBrand: "",
    batteryBrand: "",
    leadTime: "",
    paymentTerms: "",
    pricingNotes: "",
  });

  // Step 5 — Communication
  const [comms, setComms] = useState({
    aiTone: "friendly",
    languages: ["English"],
    followUps: ["Reminder after 1 day", "Follow-up after 3 days", "Final nudge after 7 days"],
    followUpMessage:
      "Hi [name], thanks for your interest in solar from [company]. Your personalised proposal was sent to you earlier. Would you like us to book a free site audit? Reply YES to book, or STOP to opt out.",
  });

  // Step 6 — Branding & final
  const [branding, setBranding] = useState({
    brandColor: "#1a2e4a",
    logoFile: null,
    aboutUs: "",
    certifications: "",
    extraNotes: "",
  });
  const [logoError, setLogoError] = useState("");
  const [consent, setConsent] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const setB = (key) => (v) => setBusiness((b) => ({ ...b, [key]: v }));
  const toggleIn = (setter, key) => (item) =>
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
  const addPackage = (section) => setPackages((prev) => [...prev, makePackage(prev.length, section)]);
  const removePackage = (id) => setPackages((prev) => prev.filter((p) => p.id !== id));

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setLogoError("");
    if (file && file.size > MAX_LOGO_BYTES) {
      setLogoError("That file is too large. Please upload an image under 8 MB.");
      setBranding((b) => ({ ...b, logoFile: null }));
      return;
    }
    setBranding((b) => ({ ...b, logoFile: file }));
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goNext = () => {
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Build Discord messages ─────────────────────────────────────────────────
  const buildMessages = () => {
    const color = hexToInt(branding.brandColor);
    const sections = [];

    sections.push(
      ...makeEmbeds("1. Business", [
        fld("Company", business.companyName, true),
        fld("Contact", business.contactName, true),
        fld("WhatsApp line", business.whatsapp, true),
        fld("Email", business.email, true),
        fld("Address", [business.address, business.city, business.province].filter(Boolean).join(", ")),
        fld("Service areas", business.serviceAreas),
        fld("Website", business.website, true),
        fld("Google Business Profile", business.googleProfile, true),
        fld("Instagram", business.instagram, true),
        fld("Facebook", business.facebook, true),
      ], color)
    );

    sections.push(
      ...makeEmbeds(
        "2. Sales team",
        team.map((m, i) =>
          fld(
            `${i + 1}. ${m.firstName} ${m.lastName}`.trim(),
            `Role: ${m.role || "—"}\nWhatsApp: ${m.whatsapp || "—"}\nEmail: ${m.email || "—"}\nAlerts: ${listOrDash(m.leadTypes)}`
          )
        ),
        color
      )
    );

    sections.push(
      ...makeEmbeds("3. Lead handling", [
        fld("Lead types served", listOrDash(leads.leadTypes)),
        fld("Minimum monthly bill to qualify", leads.minBill ? `R${leads.minBill}` : "—", true),
        fld("Site audit booking", leads.auditMethod === "team-calls" ? "Team calls the lead to book" : "Lead picks a time via a booking link", true),
        fld("Commercial routing", leads.commercialContact),
        fld("Distribution routing", leads.distributionContact),
        fld("Hours", `${leads.hoursStart} - ${leads.hoursEnd}`, true),
        fld("Days", listOrDash(leads.workingDays), true),
        fld("Notes", leads.notes),
      ], color)
    );

    const pkgFields = packages.map((p, i) =>
      fld(
        `${i + 1}. [${p.section}] ${p.name}`,
        `Price: R${p.price || "—"}\nSystem: ${p.systemSize || "—"}\nPanels: ${p.panels || "—"}\nBest for: ${p.bestFor || "—"}\nWarranty: ${p.warranty || "—"}`
      )
    );
    sections.push(
      ...makeEmbeds("4. Packages & pricing", [
        ...pkgFields,
        fld("Electricity tariff (R/kWh)", pricing.tariff, true),
        fld("Typical install lead time", pricing.leadTime, true),
        fld("Panel brand", pricing.panelBrand, true),
        fld("Inverter brand", pricing.inverterBrand, true),
        fld("Battery brand", pricing.batteryBrand, true),
        fld("Payment terms", pricing.paymentTerms),
        fld("Pricing notes", pricing.pricingNotes),
      ], color)
    );

    sections.push(
      ...makeEmbeds("5. Communication", [
        fld("Bot tone", comms.aiTone, true),
        fld("Languages", listOrDash(comms.languages), true),
        fld("Follow-up schedule", listOrDash(comms.followUps)),
        fld("Follow-up message", comms.followUpMessage),
      ], color)
    );

    sections.push(
      ...makeEmbeds("6. Branding & final details", [
        fld("Brand colour", branding.brandColor, true),
        fld("Logo", branding.logoFile ? branding.logoFile.name : "Not provided", true),
        fld("About us", branding.aboutUs),
        fld("Certifications / accreditations", branding.certifications),
        fld("Anything else", branding.extraNotes),
        fld("Service agreement and consent", "Confirmed by client", true),
      ], color)
    );

    const now = new Date().toISOString();
    const messages = sections.map((embed) => ({ embeds: [{ ...embed, timestamp: now }] }));

    // Header text and logo go on the first message
    const logo = branding.logoFile;
    messages[0].content = `📥 **New solar onboarding submitted:** ${business.companyName || "Unnamed company"}`;
    if (logo) {
      messages[0].embeds[0].thumbnail = { url: `attachment://${safeFileName(logo.name)}` };
    }
    return messages;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!consent) {
      setSubmitError("Please tick the confirmation box before submitting.");
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
      setSubmitError("An issue occurred while submitting the form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepStatus = (i) => {
    if (submitted) return "done";
    if (i < currentStep) return "done";
    if (i === currentStep) return "active";
    return "";
  };

  return (
    <>
      <style>{CSS}</style>

      <header className="hero">
        <div className="logo">StellarCode</div>
        <h1>Let&rsquo;s get your solar business set up.</h1>
        <p>Fill in the details below. We use this to configure your lead capture, instant proposals and WhatsApp follow-ups.</p>
        <div className="progress-bar" role="progressbar" aria-valuenow={currentStep} aria-valuemax={TOTAL_STEPS}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={`progress-step ${stepStatus(i + 1)}`} />
          ))}
        </div>
        <div className="step-label">
          Step <span className="step-accent">{submitted ? TOTAL_STEPS : currentStep}</span> of {TOTAL_STEPS}
        </div>
      </header>

      <main className="form-container">

        {/* ── Step 1: Business ───────────────────────────────────────────── */}
        {currentStep === 1 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">01 — Business</div>
              <h2>Company Details</h2>
              <p>The basics we need to put your branding and contact details on proposals and to link your WhatsApp number.</p>
            </div>

            <div className="field-row">
              <FieldGroup label="Company Name" required>
                <TextInput id="company-name" placeholder="e.g. Sunrise Solar Solutions" value={business.companyName} onChange={setB("companyName")} />
              </FieldGroup>
              <FieldGroup label="Owner / Contact Name" required>
                <TextInput id="contact-name" placeholder="e.g. Sharifa Naidoo" value={business.contactName} onChange={setB("contactName")} />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="WhatsApp Business Line" required hint="The number your leads will chat with. We will send a QR code to link it.">
                <TextInput id="whatsapp-number" type="tel" placeholder="+27 82 000 0000" value={business.whatsapp} onChange={setB("whatsapp")} />
              </FieldGroup>
              <FieldGroup label="Email Address" required>
                <TextInput id="email" type="email" placeholder="you@company.co.za" value={business.email} onChange={setB("email")} />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="Physical Address" required>
                <TextInput id="address" placeholder="12 Main Road" value={business.address} onChange={setB("address")} />
              </FieldGroup>
              <FieldGroup label="City / Town" required>
                <TextInput id="city" placeholder="e.g. Cape Town" value={business.city} onChange={setB("city")} />
              </FieldGroup>
            </div>

            <FieldGroup label="Province" required>
              <SelectInput id="province" value={business.province} onChange={setB("province")}>
                <option value="">Select province</option>
                {SA_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </SelectInput>
            </FieldGroup>

            <FieldGroup label="Areas You Serve" required hint="Suburbs, towns or provinces where you install. Leads outside these areas can be flagged for your team.">
              <Textarea id="service-areas" placeholder="e.g. Cape Town metro, Stellenbosch, Paarl, Somerset West" value={business.serviceAreas} onChange={setB("serviceAreas")} />
            </FieldGroup>

            <div className="field-row">
              <FieldGroup label="Website">
                <TextInput id="website" type="url" placeholder="https://yourcompany.co.za" value={business.website} onChange={setB("website")} />
              </FieldGroup>
              <FieldGroup label="Google Business Profile Link">
                <TextInput id="google-profile" type="url" placeholder="https://maps.app.goo.gl/..." value={business.googleProfile} onChange={setB("googleProfile")} />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="Instagram Handle or Link">
                <TextInput id="instagram" placeholder="e.g. @yourcompany" value={business.instagram} onChange={setB("instagram")} />
              </FieldGroup>
              <FieldGroup label="Facebook Page">
                <TextInput id="facebook" placeholder="facebook.com/yourcompany" value={business.facebook} onChange={setB("facebook")} />
              </FieldGroup>
            </div>

            <NavRow onNext={goNext} />
          </section>
        )}

        {/* ── Step 2: Sales team ─────────────────────────────────────────── */}
        {currentStep === 2 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">02 — Sales Team</div>
              <h2>Who Gets Lead Alerts?</h2>
              <p>Add each person who should be notified when a new lead comes in. You choose which lead types each person receives.</p>
            </div>

            {team.map((m, i) => (
              <MemberEntry
                key={m.id}
                member={m}
                index={i}
                onChange={updateMember}
                onRemove={removeMember}
                showRemove={team.length > 1}
              />
            ))}

            <button type="button" className="add-btn" onClick={addMember}>
              + Add another team member
            </button>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── Step 3: Lead handling ──────────────────────────────────────── */}
        {currentStep === 3 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">03 — Lead Handling</div>
              <h2>Lead Types &amp; Routing</h2>
              <p>Residential leads continue through the automated flow. Commercial and distribution enquiries are routed straight to your team.</p>
            </div>

            <FieldGroup label="Which Lead Types Do You Serve?" required>
              <div className="checkbox-group">
                {LEAD_TYPES.map((lt) => (
                  <CheckboxItem key={lt} label={lt} checked={leads.leadTypes.includes(lt)} onChange={() => toggleIn(setLeads, "leadTypes")(lt)} />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Minimum Monthly Electricity Bill to Qualify (R)" hint="Optional. Leads below this amount can be flagged as low priority.">
              <TextInput id="min-bill" type="number" placeholder="e.g. 1500" value={leads.minBill} onChange={(v) => setLeads((l) => ({ ...l, minBill: v }))} />
            </FieldGroup>

            <div className="field-row">
              <FieldGroup label="Commercial Enquiries Go To" hint="Name and number of the person who handles commercial leads.">
                <TextInput id="commercial-contact" placeholder="e.g. Pieter, +27 82 000 0000" value={leads.commercialContact} onChange={(v) => setLeads((l) => ({ ...l, commercialContact: v }))} />
              </FieldGroup>
              <FieldGroup label="Distribution Enquiries Go To" hint="Name and number of the person who handles distribution or wholesale.">
                <TextInput id="distribution-contact" placeholder="e.g. Aisha, +27 82 000 0000" value={leads.distributionContact} onChange={(v) => setLeads((l) => ({ ...l, distributionContact: v }))} />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="Operating Hours — Start" required>
                <TextInput id="hours-start" type="time" value={leads.hoursStart} onChange={(v) => setLeads((l) => ({ ...l, hoursStart: v }))} />
              </FieldGroup>
              <FieldGroup label="Operating Hours — End" required>
                <TextInput id="hours-end" type="time" value={leads.hoursEnd} onChange={(v) => setLeads((l) => ({ ...l, hoursEnd: v }))} />
              </FieldGroup>
            </div>

            <FieldGroup label="Working Days" required>
              <div className="checkbox-group">
                {WORKING_DAYS.map((d) => (
                  <CheckboxItem key={d} label={d} checked={leads.workingDays.includes(d)} onChange={() => toggleIn(setLeads, "workingDays")(d)} />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="How Are Site Audits Booked?" required>
              <div className="radio-group">
                <RadioItem
                  name="audit-method"
                  value="team-calls"
                  label="My team calls the lead to arrange a time."
                  checked={leads.auditMethod === "team-calls"}
                  onChange={(v) => setLeads((l) => ({ ...l, auditMethod: v }))}
                />
                <RadioItem
                  name="audit-method"
                  value="booking-link"
                  label="The lead picks a time themselves using a booking link."
                  checked={leads.auditMethod === "booking-link"}
                  onChange={(v) => setLeads((l) => ({ ...l, auditMethod: v }))}
                />
              </div>
            </FieldGroup>

            <FieldGroup label="Anything Else About How You Handle Leads?">
              <Textarea id="lead-notes" placeholder="e.g. We do not install in rural areas, or commercial leads must be over 50 kW..." value={leads.notes} onChange={(v) => setLeads((l) => ({ ...l, notes: v }))} />
            </FieldGroup>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── Step 4: Packages & pricing ─────────────────────────────────── */}
        {currentStep === 4 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">04 — Packages &amp; Pricing</div>
              <h2>Your Residential Packages</h2>
              <p>These prices appear in the instant proposals your leads receive, so please use your real installed prices.</p>
            </div>

            {PACKAGE_SECTIONS.map((section) => {
              const sectionPackages = packages.filter((p) => p.section === section);
              return (
                <div key={section} className="package-section-block" style={{ marginBottom: "40px" }}>
                  <h3
                    style={{
                      fontSize: "15px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--accent-bright)",
                      borderBottom: "1px solid var(--border)",
                      paddingBottom: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    {section}
                  </h3>

                  {sectionPackages.length === 0 ? (
                    <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "16px", fontStyle: "italic" }}>
                      No {section} packages added yet.
                    </p>
                  ) : (
                    sectionPackages.map((pkg, i) => (
                      <PackageEntry key={pkg.id} pkg={pkg} index={i} onChange={updatePackage} onRemove={removePackage} />
                    ))
                  )}

                  <button type="button" className="add-btn" onClick={() => addPackage(section)} style={{ marginBottom: "12px" }}>
                    + Add {section} Package
                  </button>
                </div>
              );
            })}

            <div className="field-row">
              <FieldGroup label="Electricity Tariff (R per kWh)" hint="Used to estimate savings. Use your area's typical rate.">
                <TextInput id="tariff" type="number" placeholder="e.g. 3.20" value={pricing.tariff} onChange={(v) => setPricing((p) => ({ ...p, tariff: v }))} />
              </FieldGroup>
              <FieldGroup label="Typical Installation Lead Time">
                <TextInput id="lead-time" placeholder="e.g. 2 to 4 weeks" value={pricing.leadTime} onChange={(v) => setPricing((p) => ({ ...p, leadTime: v }))} />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="Panel Brand(s)">
                <TextInput id="panel-brand" placeholder="e.g. Canadian Solar, JA Solar" value={pricing.panelBrand} onChange={(v) => setPricing((p) => ({ ...p, panelBrand: v }))} />
              </FieldGroup>
              <FieldGroup label="Inverter Brand(s)">
                <TextInput id="inverter-brand" placeholder="e.g. Sunsynk, Deye, Victron" value={pricing.inverterBrand} onChange={(v) => setPricing((p) => ({ ...p, inverterBrand: v }))} />
              </FieldGroup>
            </div>

            <FieldGroup label="Battery Brand(s)">
              <TextInput id="battery-brand" placeholder="e.g. Pylontech, Dyness" value={pricing.batteryBrand} onChange={(v) => setPricing((p) => ({ ...p, batteryBrand: v }))} />
            </FieldGroup>

            <FieldGroup label="Payment Terms" hint="e.g. deposit amount, finance partners, or payment on completion.">
              <TextInput id="payment-terms" placeholder="e.g. 50% deposit, balance on completion" value={pricing.paymentTerms} onChange={(v) => setPricing((p) => ({ ...p, paymentTerms: v }))} />
            </FieldGroup>

            <FieldGroup label="Other Pricing Notes">
              <Textarea id="pricing-notes" placeholder="e.g. Prices exclude DB board upgrades and travel outside Gauteng..." value={pricing.pricingNotes} onChange={(v) => setPricing((p) => ({ ...p, pricingNotes: v }))} />
            </FieldGroup>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── Step 5: Communication ──────────────────────────────────────── */}
        {currentStep === 5 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">05 — Communication</div>
              <h2>How Your WhatsApp Assistant Talks</h2>
              <p>Choose the tone, languages and follow-up schedule for leads who have not yet booked a site audit.</p>
            </div>

            <FieldGroup label="Tone of Your WhatsApp Assistant" required>
              <div className="radio-group">
                {[
                  { value: "friendly", label: "Friendly and conversational — warm and helpful" },
                  { value: "professional", label: "Professional and formal — clear and precise" },
                  { value: "mixed", label: "A balanced mix of warm and professional" },
                ].map(({ value, label }) => (
                  <RadioItem key={value} name="ai-tone" value={value} label={label} checked={comms.aiTone === value} onChange={(v) => setComms((c) => ({ ...c, aiTone: v }))} />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Languages Your Customers Prefer">
              <div className="checkbox-group">
                {LANGUAGES.map((lang) => (
                  <CheckboxItem key={lang} label={lang} checked={comms.languages.includes(lang)} onChange={() => toggleIn(setComms, "languages")(lang)} />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Automatic Follow-Ups" required hint="Sent to leads who received a proposal but have not booked. Every message includes an option to opt out.">
              <div className="checkbox-group">
                {FOLLOW_UP_OPTIONS.map((opt) => (
                  <CheckboxItem key={opt} label={opt} checked={comms.followUps.includes(opt)} onChange={() => toggleIn(setComms, "followUps")(opt)} />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Follow-Up Message Template" hint="Edit the wording to suit your business. Keep the opt-out line in.">
              <Textarea id="follow-up-message" value={comms.followUpMessage} onChange={(v) => setComms((c) => ({ ...c, followUpMessage: v }))} />
            </FieldGroup>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── Step 6: Branding & final ───────────────────────────────────── */}
        {currentStep === 6 && !submitted && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">06 — Branding &amp; Final Details</div>
              <h2>Make It Yours</h2>
              <p>Personalise the proposals your leads receive and confirm your details.</p>
            </div>

            <div className="field-row">
              <FieldGroup label="Primary Brand Colour" hint="Used on your proposals and booking page.">
                <input
                  type="color"
                  id="brand-color"
                  value={branding.brandColor}
                  onChange={(e) => setBranding((b) => ({ ...b, brandColor: e.target.value }))}
                  className="field-input color-input"
                />
              </FieldGroup>
              <FieldGroup label="Logo (if available)" hint="PNG or JPG, under 8 MB.">
                <input type="file" id="logo-file" accept="image/*" className="field-input file-input" onChange={handleLogoChange} />
              </FieldGroup>
            </div>
            {logoError && <div className="error-msg" role="alert">{logoError}</div>}

            <FieldGroup label="About Your Company" hint="A short paragraph shown on your proposals.">
              <Textarea id="about-us" placeholder="e.g. We have installed over 500 residential systems across the Western Cape since 2018..." value={branding.aboutUs} onChange={(v) => setBranding((b) => ({ ...b, aboutUs: v }))} />
            </FieldGroup>

            <FieldGroup label="Certifications & Accreditations" hint="e.g. SAPVIA membership, registered electrical contractor, ECSA, CoC provider.">
              <TextInput id="certifications" placeholder="List any you would like shown on proposals" value={branding.certifications} onChange={(v) => setBranding((b) => ({ ...b, certifications: v }))} />
            </FieldGroup>

            <FieldGroup label="Anything Else We Should Know?">
              <Textarea id="extra-notes" placeholder="Any other requirements or customisations..." value={branding.extraNotes} onChange={(v) => setBranding((b) => ({ ...b, extraNotes: v }))} />
            </FieldGroup>

            <FieldGroup label="Confirmation" required>
              <div className="checkbox-group" style={{ gridTemplateColumns: "1fr" }}>
                <CheckboxItem
                  label="I am authorised to share these details, and I have read and accepted the Service Agreement, including how personal information is handled."
                  checked={consent}
                  onChange={setConsent}
                />
              </div>
            </FieldGroup>

            {submitError && (
              <div className="error-msg" role="alert">
                {submitError}
              </div>
            )}

            <NavRow onBack={goBack} onNext={handleSubmit} nextLabel="Submit Setup →" isSubmitting={submitting} />
          </section>
        )}

        {/* ── Success ───────────────────────────────────────────────────── */}
        {submitted && (
          <div className="success-screen" role="status">
            <div className="success-icon" aria-hidden="true">✓</div>
            <h2>Setup Details Submitted.</h2>
            <p>Thank you. We have your details and will reach out if we need anything else.</p>
            <hr className="divider" style={{ maxWidth: 200, margin: "32px auto" }} />
            <p style={{ fontSize: 13 }}>We will update you on our progress shortly.</p>
          </div>
        )}
      </main>
    </>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --black: #070c14;
    --white: #d8e4f0;
    --accent: #4a7fa5;
    --accent-bright: #6aa3cc;
    --muted: #4d6277;
    --border: #1a2840;
    --surface: #0d1826;
    --input-bg: #0f1e2e;
    --deep: #050a10;
  }

  body {
    background: var(--black);
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    min-height: 100vh;
  }

  /* ── Hero ─────────────────────────────────────────────────────────────── */
  .hero {
    background: var(--deep);
    border-bottom: 1px solid var(--border);
    padding: 60px 40px 50px;
    position: relative;
    overflow: hidden;
  }

  .hero::before {
    content: '';
    position: absolute;
    top: -100px; right: -100px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(74,127,165,0.07) 0%, transparent 65%);
    pointer-events: none;
  }

  .hero::after {
    content: '';
    position: absolute;
    bottom: -60px; left: 20%;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(40,80,120,0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  .logo {
    font-family: 'DM Serif Display', serif;
    font-size: 13px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent-bright);
    margin-bottom: 40px;
  }

  .hero h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(36px, 5vw, 64px);
    font-weight: 400;
    line-height: 1.1;
    max-width: 600px;
    margin-bottom: 16px;
    color: var(--white);
  }

  .hero p {
    color: var(--muted);
    font-size: 15px;
    max-width: 480px;
    line-height: 1.7;
  }

  /* ── Progress ─────────────────────────────────────────────────────────── */
  .progress-bar {
    display: flex;
    gap: 6px;
    margin-top: 40px;
  }

  .progress-step {
    height: 3px;
    flex: 1;
    background: var(--border);
    border-radius: 2px;
    transition: background 0.3s;
  }

  .progress-step.active { background: var(--accent-bright); }
  .progress-step.done   { background: rgba(74,127,165,0.5); }

  .step-label {
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
    margin-top: 12px;
  }

  .step-accent { color: var(--accent-bright); }

  /* ── Form container ───────────────────────────────────────────────────── */
  .form-container {
    max-width: 720px;
    margin: 0 auto;
    padding: 60px 40px 100px;
  }

  /* ── Section ──────────────────────────────────────────────────────────── */
  .section {
    animation: fadeUp 0.4s ease;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .section-header { margin-bottom: 40px; }

  .section-number {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent-bright);
    margin-bottom: 12px;
  }

  .section-header h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    font-weight: 400;
    margin-bottom: 8px;
    color: var(--white);
  }

  .section-header p {
    color: var(--muted);
    font-size: 14px;
    line-height: 1.6;
  }

  /* ── Fields ───────────────────────────────────────────────────────────── */
  .field-group { margin-bottom: 28px; }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .field-label {
    display: block;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 8px;
    font-weight: 400;
    cursor: default;
  }

  .req { color: var(--accent-bright); }

  .field-input {
    width: 100%;
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 300;
    padding: 14px 16px;
    outline: none;
    transition: border-color 0.2s;
    appearance: none;
  }

  .field-input:focus { border-color: var(--accent); }

  .field-input::placeholder { color: #1e3550; }

  .field-input option { background: var(--input-bg); color: var(--white); }

  .field-textarea {
    resize: vertical;
    min-height: 100px;
    line-height: 1.6;
  }

  .color-input {
    height: 48px;
    padding: 4px 8px;
    cursor: pointer;
  }

  .file-input {
    padding: 12px 16px;
    font-size: 13px;
    cursor: pointer;
  }

  .hint {
    font-size: 12px;
    color: var(--muted);
    margin-top: 6px;
    line-height: 1.5;
  }

  /* ── Checkbox & Radio ─────────────────────────────────────────────────── */
  .checkbox-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 10px;
  }

  .checkbox-item,
  .radio-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 12px 14px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    font-size: 14px;
    color: var(--white);
    user-select: none;
  }

  .checkbox-item input,
  .radio-item input {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    accent-color: var(--accent-bright);
    padding: 0;
    pointer-events: none;
  }

  .checkbox-item.checked,
  .radio-item.checked {
    border-color: var(--accent);
    background: rgba(74,127,165,0.08);
  }

  .radio-group { display: flex; flex-direction: column; gap: 10px; }

  /* ── Instructor / Package cards ───────────────────────────────────────── */
  .instructor-entry {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    position: relative;
  }

  .entry-number {
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent-bright);
    margin-bottom: 16px;
  }

  .remove-btn {
    position: absolute;
    top: 16px; right: 16px;
    background: none;
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }

  .remove-btn:hover { border-color: #5a7fa0; color: #5a7fa0; }

  .add-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 1px dashed var(--border);
    color: var(--muted);
    font-size: 13px;
    padding: 12px 20px;
    border-radius: 6px;
    cursor: pointer;
    width: 100%;
    justify-content: center;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
    margin-top: 8px;
  }

  .add-btn:hover { border-color: var(--accent); color: var(--accent-bright); }

  /* ── Nav row ──────────────────────────────────────────────────────────── */
  .nav-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid var(--border);
  }

  .btn-next {
    background: var(--accent);
    color: var(--white);
    border: none;
    border-radius: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.05em;
    padding: 14px 32px;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
  }

  .btn-next:hover:not(:disabled) { background: var(--accent-bright); }
  .btn-next:active:not(:disabled) { transform: scale(0.98); }
  .btn-next:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-back {
    background: none;
    border: 1px solid var(--border);
    color: var(--muted);
    border-radius: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    padding: 14px 24px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }

  .btn-back:hover { border-color: var(--white); color: var(--white); }

  /* ── Error ────────────────────────────────────────────────────────────── */
  .error-msg {
    background: rgba(165,74,74,0.08);
    border: 1px solid rgba(165,74,74,0.3);
    border-radius: 6px;
    color: #cc6a6a;
    font-size: 13px;
    padding: 12px 16px;
    margin-top: 16px;
  }

  /* ── Success screen ───────────────────────────────────────────────────── */
  .success-screen {
    text-align: center;
    padding: 80px 40px;
    animation: fadeUp 0.4s ease;
  }

  .success-icon {
    width: 64px; height: 64px;
    background: rgba(74,127,165,0.1);
    border: 1px solid var(--accent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 32px;
    font-size: 24px;
    color: var(--accent-bright);
  }

  .success-screen h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 36px;
    font-weight: 400;
    margin-bottom: 16px;
    color: var(--white);
  }

  .success-screen p {
    color: var(--muted);
    font-size: 15px;
    line-height: 1.7;
    max-width: 420px;
    margin: 0 auto;
  }

  .divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 32px 0;
  }

  /* ── Responsive ───────────────────────────────────────────────────────── */
  @media (max-width: 560px) {
    .field-row { grid-template-columns: 1fr; }
    .form-container { padding: 40px 24px 80px; }
    .hero { padding: 40px 24px; }
  }
`;
