"use client";

import { useState, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

const LICENSE_TYPES = [
  "Code B Manual",
  "Code B Auto",
  "Code C1",
  "Code C",
  "Code CE",
  "Code BE",
  "Other"
];
const WORKING_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const LANGUAGES = ["English", "Oshiwambo", "Afrikaans", "Damara/Nama", "Otjiherero", "German", "Other"];
const TOTAL_STEPS = 7;
const WEBHOOK_URL = "https://hook.eu1.make.com/dpym6dzyl0z3gpb7wjfk5ntorwsf2x11";

const makeInstructor = (index) => ({
  id: Date.now() + index,
  firstName: "",
  lastName: "",
  whatsapp: "",
  email: "",
  licenseTypes: [],
  workingDays: [],
  assignedVehicle: "", // Connected to fleet management
});

const makeVehicle = (index) => ({
  id: Date.now() + index,
  makeModel: "",       // e.g. VW Polo
  plateNumber: "",     // e.g. N 12345 W
  expiryDate: "",      // NaTIS registration disk expiry
  fuelCard: "",        // Optional: Fuel card details/monthly allocation
});

const makePackage = (index) => ({
  id: Date.now() + index,
  name: "",
  price: "",
  duration: "",
  licenseType: "",
});

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
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="field-input"
    >
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
      <button
        type="button"
        className="btn-next"
        onClick={onNext}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting…" : nextLabel}
      </button>
    </div>
  );
}

// ─── Instructor Entry ─────────────────────────────────────────────────────────

function InstructorEntry({ instructor, index, onChange, onRemove, showRemove }) {
  const update = (field) => (value) => onChange(instructor.id, field, value);

  const toggleList = (field, item) => {
    const list = instructor[field];
    onChange(
      instructor.id,
      field,
      list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
    );
  };

  return (
    <div className="instructor-entry">
      <div className="entry-number">Instructor {index + 1}</div>
      {showRemove && (
        <button type="button" className="remove-btn" onClick={() => onRemove(instructor.id)}>
          Remove
        </button>
      )}

      <div className="field-row">
        <FieldGroup label="First Name" required>
          <TextInput placeholder="First name" value={instructor.firstName} onChange={update("firstName")} />
        </FieldGroup>
        <FieldGroup label="Last Name" required>
          <TextInput placeholder="Last name" value={instructor.lastName} onChange={update("lastName")} />
        </FieldGroup>
      </div>

      <div className="field-row">
        <FieldGroup label="WhatsApp Number" required>
          <TextInput type="tel" placeholder="+264 81 000 0000" value={instructor.whatsapp} onChange={update("whatsapp")} />
        </FieldGroup>
        <FieldGroup label="Email">
          <TextInput type="email" placeholder="instructor@school.com.na" value={instructor.email} onChange={update("email")} />
        </FieldGroup>
      </div>

      <div className="field-row">
        <FieldGroup label="Assigned Vehicle (Optional)" hint="Connects this instructor to an active vehicle in your fleet tracking system.">
          <TextInput placeholder="e.g. VW Polo (N 123-456 W)" value={instructor.assignedVehicle} onChange={update("assignedVehicle")} />
        </FieldGroup>
      </div>

      <FieldGroup label="License Types" required>
        <div className="checkbox-group">
          {LICENSE_TYPES.map((lt) => (
            <CheckboxItem
              key={lt}
              label={lt}
              checked={instructor.licenseTypes.includes(lt)}
              onChange={() => toggleList("licenseTypes", lt)}
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Working Days" required>
        <div className="checkbox-group">
          {WORKING_DAYS.map((day) => (
            <CheckboxItem
              key={day}
              label={day}
              checked={instructor.workingDays.includes(day)}
              onChange={() => toggleList("workingDays", day)}
            />
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

// ─── Vehicle Entry ────────────────────────────────────────────────────────────

function VehicleEntry({ vehicle, index, onChange, onRemove, showRemove }) {
  const update = (field) => (value) => onChange(vehicle.id, field, value);

  return (
    <div className="instructor-entry">
      <div className="entry-number">Vehicle {index + 1}</div>
      {showRemove && (
        <button type="button" className="remove-btn" onClick={() => onRemove(vehicle.id)}>
          Remove
        </button>
      )}

      <div className="field-row">
        <FieldGroup label="Vehicle Make & Model" required>
          <TextInput placeholder="e.g. Volkswagen Polo" value={vehicle.makeModel} onChange={update("makeModel")} />
        </FieldGroup>
        <FieldGroup label="License Plate / Registration" required>
          <TextInput placeholder="e.g. N 12345 W" value={vehicle.plateNumber} onChange={update("plateNumber")} />
        </FieldGroup>
      </div>

      <div className="field-row">
        <FieldGroup label="NaTIS Disk Expiry Date" required hint="Used to schedule automated WhatsApp NaTIS renewal alerts 1 month in advance.">
          <TextInput type="date" value={vehicle.expiryDate} onChange={update("expiryDate")} />
        </FieldGroup>
        <FieldGroup label="Fuel Card details / Monthly Budget" hint="Allows matching with fuel spend analytics.">
          <TextInput placeholder="e.g. Bank Windhoek Fuel Card (N$5,000 monthly cap)" value={vehicle.fuelCard} onChange={update("fuelCard")} />
        </FieldGroup>
      </div>
    </div>
  );
}

// ─── Package Entry ────────────────────────────────────────────────────────────

function PackageEntry({ pkg, index, onChange, onRemove, showRemove }) {
  const update = (field) => (value) => onChange(pkg.id, field, value);

  return (
    <div className="instructor-entry">
      <div className="entry-number">Package {index + 1}</div>
      {showRemove && (
        <button type="button" className="remove-btn" onClick={() => onRemove(pkg.id)}>
          Remove
        </button>
      )}

      <div className="field-row">
        <FieldGroup label="Package Name" required>
          <TextInput placeholder="e.g. Code B Manual — 1 Hour" value={pkg.name} onChange={update("name")} />
        </FieldGroup>
        <FieldGroup label="Price (N$)" required>
          <TextInput type="number" placeholder="e.g. 350" value={pkg.price} onChange={update("price")} />
        </FieldGroup>
      </div>

      <div className="field-row">
        <FieldGroup label="Duration" required>
          <TextInput placeholder="e.g. 1 hour, 10-lesson bundle" value={pkg.duration} onChange={update("duration")} />
        </FieldGroup>
        <FieldGroup label="License / Course Type" required>
          <TextInput placeholder="e.g. Code B Manual, Code C1" value={pkg.licenseType} onChange={update("licenseType")} />
        </FieldGroup>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function StellarCodeOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Step 1 — Business & SEO
  const [business, setBusiness] = useState({
    schoolName: "",
    ownerName: "",
    whatsapp: "", // Evolution API WhatsApp gateway target line
    email: "",
    address: "",
    city: "", // town/city in Namibia
    googleProfile: "",
    targetSuburbs: "",     // Target areas for Google search optimization
    domainPreference: "register-new", // "register-new", "use-existing", or "none"
    domainName: "",        // Preferred website domain name
    socialInstagram: "",   // Instagram bio link compatibility
    socialFacebook: "",
  });

  // Step 2 — Instructors
  const [instructors, setInstructors] = useState([makeInstructor(0)]);

  // Step 3 — Vehicles & Fleet (New Feature Sector)
  const [vehicles, setVehicles] = useState([makeVehicle(0)]);

  // Step 4 — Packages
  const [packages, setPackages] = useState([makePackage(0)]);

  // Step 5 — Booking & Communications
  const [booking, setBooking] = useState({
    hoursStart: "08:00",
    hoursEnd: "17:00",
    bufferTime: "15",
    advanceBooking: "2 days in advance",
    reminderTimings: ["Morning of lesson", "24 hours before"],
    schedulingNotes: "",
    manualLedgerDeduction: "manual", // "manual" (Part 2.2: verified by instructor/admin) or "automatic" (time-based)
    cancellationBroadcasts: "individual-opt-in", // "individual-opt-in" (Part 2.3: privacy-first direct messaging alerts) or "none"
  });

  // Step 6 — Payment & AI Finance Setup
  const [payment, setPayment] = useState({
    methods: [],
    bankingDetails: "",
    gateway: "",
    merchantId: "",
    timing: "upfront",
    aiAuditBankName: "",      // The specific bank format Gemini will audit against (Bank Windhoek, FNB Namibia, etc.)
    aiReceiptLogging: "enabled", // WhatsApp receipt scanning for fuel & maintenance under Part 2.1
    manualExpenseCategories: "Rent, Salaries, Marketing, Insurance", // Pre-populated custom fields
  });

  // Step 7 — Branding & Post-NaTIS Google Reviews
  const [branding, setBranding] = useState({
    brandColor: "#1a2e4a",
    logoFile: null,           // Stores Base64 file metadata object
    aiTone: "friendly",
    languages: ["English"],
    googleReviews: "yes",     // Trigger automated Google Review WhatsApp post-pass
    natisReviewMessage: "Congratulations on passing your NaTIS test! 🎉 We are incredibly proud of your milestone. Could you spare 30 seconds to support us with a Google review? Click the link to share your experience: [google_profile_link]",
    extraNotes: "",
  });

  // ── Instructor helpers ──────────────────────────────────────────────────────
  const updateInstructor = useCallback((id, field, value) => {
    setInstructors((prev) =>
      prev.map((ins) => (ins.id === id ? { ...ins, [field]: value } : ins))
    );
  }, []);

  const addInstructor = () => setInstructors((prev) => [...prev, makeInstructor(prev.length)]);
  const removeInstructor = (id) => setInstructors((prev) => prev.filter((ins) => ins.id !== id));

  // ── Vehicle helpers ─────────────────────────────────────────────────────────
  const updateVehicle = useCallback((id, field, value) => {
    setVehicles((prev) =>
      prev.map((veh) => (veh.id === id ? { ...veh, [field]: value } : veh))
    );
  }, []);

  const addVehicle = () => setVehicles((prev) => [...prev, makeVehicle(prev.length)]);
  const removeVehicle = (id) => setVehicles((prev) => prev.filter((veh) => veh.id !== id));

  // ── Package helpers ────────────────────────────────────────────────────────
  const updatePackage = useCallback((id, field, value) => {
    setPackages((prev) =>
      prev.map((pkg) => (pkg.id === id ? { ...pkg, [field]: value } : pkg))
    );
  }, []);

  const addPackage = () => setPackages((prev) => [...prev, makePackage(prev.length)]);
  const removePackage = (id) => setPackages((prev) => prev.filter((pkg) => pkg.id !== id));

  // ── Booking helpers ────────────────────────────────────────────────────────
  const toggleReminder = (item) => {
    setBooking((prev) => ({
      ...prev,
      reminderTimings: prev.reminderTimings.includes(item)
        ? prev.reminderTimings.filter((x) => x !== item)
        : [...prev.reminderTimings, item],
    }));
  };

  // ── Payment helpers ────────────────────────────────────────────────────────
  const togglePaymentMethod = (method) => {
    setPayment((prev) => ({
      ...prev,
      methods: prev.methods.includes(method)
        ? prev.methods.filter((m) => m !== method)
        : [...prev.methods, method],
    }));
  };

  // ── Logo File Reader to Base64 ─────────────────────────────────────────────
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBranding((b) => ({
          ...b,
          logoFile: {
            name: file.name,
            type: file.type,
            size: file.size,
            base64: reader.result,
          }
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setBranding((b) => ({ ...b, logoFile: null }));
    }
  };

  // ── Language helpers ───────────────────────────────────────────────────────
  const toggleLanguage = (lang) => {
    setBranding((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
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

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(false);

    // Mapped cleanly with flat, logical property names matching all user requirements
    const payload = {
      submittedAt: new Date().toISOString(),
      
      // Step 1 — Business & SEO
      schoolName: business.schoolName,
      ownerName: business.ownerName,
      whatsappNumber: business.whatsapp,
      email: business.email,
      address: business.address,
      townOrRegion: business.city,
      targetSuburbsOrTowns: business.targetSuburbs,
      domainPreference: business.domainPreference,
      preferredDomainName: business.domainName,
      googleBusinessProfileLink: business.googleProfile,
      instagramHandle: business.socialInstagram,
      socialFacebook: business.socialFacebook,

      // Step 2 — Instructors
      instructors: instructors.map((ins, i) => ({
        index: i + 1,
        firstName: ins.firstName,
        lastName: ins.lastName,
        whatsapp: ins.whatsapp,
        email: ins.email,
        licenseTypes: ins.licenseTypes,
        workingDays: ins.workingDays,
        assignedVehicle: ins.assignedVehicle,
      })),

      // Step 3 — Vehicles & Fleet
      vehicles: vehicles.map((veh, i) => ({
        index: i + 1,
        makeModel: veh.makeModel,
        plateNumber: veh.plateNumber,
        expiryDate: veh.expiryDate,
        fuelCard: veh.fuelCard,
      })),

      // Step 4 — Packages & Pricing
      packages: packages.map((pkg, i) => ({
        index: i + 1,
        name: pkg.name,
        price: pkg.price,
        duration: pkg.duration,
        licenseType: pkg.licenseType,
      })),

      // Step 5 — Booking Preferences
      hoursStart: booking.hoursStart,
      hoursEnd: booking.hoursEnd,
      bufferTime: booking.bufferTime,
      advanceBooking: booking.advanceBooking,
      reminderTiming: booking.reminderTimings,
      schedulingNotes: booking.schedulingNotes,
      lessonLedgerDeductionRule: booking.manualLedgerDeduction,
      privacyFirstCancellationAlerts: booking.cancellationBroadcasts,

      // Step 6 — Payment, AI Audit & Financial Analytics
      paymentMethods: payment.methods,
      bankingDetails: payment.bankingDetails,
      aiAuditBankName: payment.aiAuditBankName,
      paymentGateway: payment.gateway,
      merchantId: payment.merchantId,
      paymentTiming: payment.timing,
      automaticExpenseAuditing: payment.aiReceiptLogging,
      manualExpenseCategoriesToPrepopulate: payment.manualExpenseCategories,

      // Step 7 — Branding & Reviews
      brandColor: branding.brandColor,
      logoFile: branding.logoFile, // Base64 Object { name, type, size, base64 }
      aiTone: branding.aiTone,
      languages: branding.languages,
      enableGoogleReviewTriggers: branding.googleReviews,
      postNatisWhatsappMessageTemplate: branding.natisReviewMessage,
      extraNotes: branding.extraNotes,
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Progress ───────────────────────────────────────────────────────────────
  const stepStatus = (i) => {
    if (submitted) return "done";
    if (i < currentStep) return "done";
    if (i === currentStep) return "active";
    return "";
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>

      {/* Hero / Header */}
      <header className="hero">
        <div className="logo">StellarCode</div>
        <h1>Let&rsquo;s get your school set up.</h1>
        <p>Fill in the operational details below. We will use this information to configure your platform assets, automated pipelines, and analytics databases in Namibia.</p>
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

        {/* ── Step 1: Business & Web SEO Presence ───────────────────────────── */}
        {currentStep === 1 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">01 — Business &amp; SEO</div>
              <h2>School Profiles &amp; Web SEO Details</h2>
              <p>Essential details to register your Evolution API WhatsApp gateway and optimize your Google search web presence.</p>
            </div>

            <div className="field-row">
              <FieldGroup label="School Name" required>
                <TextInput
                  id="school-name"
                  placeholder="e.g. Windhoek Driving Academy"
                  value={business.schoolName}
                  onChange={(v) => setBusiness((b) => ({ ...b, schoolName: v }))}
                />
              </FieldGroup>
              <FieldGroup label="Owner / Contact Name" required>
                <TextInput
                  id="owner-name"
                  placeholder="e.g. Johannes Ndara"
                  value={business.ownerName}
                  onChange={(v) => setBusiness((b) => ({ ...b, ownerName: v }))}
                />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="WhatsApp Business Line" required hint="Used to link the Evolution API WhatsApp Gateway using the QR scanner.">
                <TextInput
                  id="whatsapp-number"
                  type="tel"
                  placeholder="+264 81 000 0000"
                  value={business.whatsapp}
                  onChange={(v) => setBusiness((b) => ({ ...b, whatsapp: v }))}
                />
              </FieldGroup>
              <FieldGroup label="Email Address" required>
                <TextInput
                  id="email"
                  type="email"
                  placeholder="you@school.com.na"
                  value={business.email}
                  onChange={(v) => setBusiness((b) => ({ ...b, email: v }))}
                />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="Physical Address" required>
                <TextInput
                  id="address"
                  placeholder="45 Independence Avenue"
                  value={business.address}
                  onChange={(v) => setBusiness((b) => ({ ...b, address: v }))}
                />
              </FieldGroup>
              <FieldGroup label="Town / Region" required>
                <TextInput
                  id="city"
                  placeholder="e.g. Windhoek, Khomas"
                  value={business.city}
                  onChange={(v) => setBusiness((b) => ({ ...b, city: v }))}
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Target Suburbs / Towns (SEO)" required hint="Comma-separated areas we should optimize your Google search visibility for (e.g. Pioneerspark, Katutura, Klein Windhoek, Swakopmund).">
              <Textarea
                id="target-suburbs"
                placeholder="List the specific suburbs or towns where you operate..."
                value={business.targetSuburbs}
                onChange={(v) => setBusiness((b) => ({ ...b, targetSuburbs: v }))}
              />
            </FieldGroup>

            <div className="field-row">
              <FieldGroup label="Domain Name Preference" required>
                <SelectInput
                  id="domain-preference"
                  value={business.domainPreference}
                  onChange={(v) => setBusiness((b) => ({ ...b, domainPreference: v }))}
                >
                  <option value="register-new">Register a new domain for me (.com.na / .na)</option>
                  <option value="use-existing">I will link an existing domain I own</option>
                  <option value="none">I do not need a custom domain</option>
                </SelectInput>
              </FieldGroup>
              <FieldGroup label="Preferred Website Domain Address" hint="Leave blank if you don't have an option yet.">
                <TextInput
                  id="domain-name"
                  placeholder="e.g. windhoekdriving.com.na"
                  value={business.domainName}
                  onChange={(v) => setBusiness((b) => ({ ...b, domainName: v }))}
                />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="Google Business Profile Link" hint="Used in the automated post-NaTIS Google Review System to link reviews directly.">
                <TextInput
                  id="google-profile"
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  value={business.googleProfile}
                  onChange={(v) => setBusiness((b) => ({ ...b, googleProfile: v }))}
                />
              </FieldGroup>
              <FieldGroup label="Instagram Handle or Link" hint="We will link this on your Google SEO optimized page.">
                <TextInput
                  id="social-instagram"
                  placeholder="e.g. @windhoekdriving"
                  value={business.socialInstagram}
                  onChange={(v) => setBusiness((b) => ({ ...b, socialInstagram: v }))}
                />
              </FieldGroup>
            </div>

            <NavRow onNext={goNext} />
          </section>
        )}

        {/* ── Step 2: Instructors ───────────────────────────────────────── */}
        {currentStep === 2 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">02 — Instructors</div>
              <h2>Your Team Configuration</h2>
              <p>Add each instructor. Their assigned profiles govern live scheduling updates, lesson rosters, and direct alerts.</p>
            </div>

            {instructors.map((ins, i) => (
              <InstructorEntry
                key={ins.id}
                instructor={ins}
                index={i}
                onChange={updateInstructor}
                onRemove={removeInstructor}
                showRemove={instructors.length > 1}
              />
            ))}

            <button type="button" className="add-btn" onClick={addInstructor}>
              + Add another instructor
            </button>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── Step 3: Vehicles & Fleet ───────────────────────────────────── */}
        {currentStep === 3 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">03 — Fleet &amp; Vehicles</div>
              <h2>Vehicle Roster &amp; Maintenance Logging</h2>
              <p>Configure vehicles to track monthly fuel spend, automate NaTIS registration renewal reminders, and match receipts scanned via WhatsApp.</p>
            </div>

            {vehicles.map((veh, i) => (
              <VehicleEntry
                key={veh.id}
                vehicle={veh}
                index={i}
                onChange={updateVehicle}
                onRemove={removeVehicle}
                showRemove={vehicles.length > 1}
              />
            ))}

            <button type="button" className="add-btn" onClick={addVehicle}>
              + Add another vehicle
            </button>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── Step 4: Packages & Pricing ────────────────────────────────── */}
        {currentStep === 4 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">04 — Packages &amp; Pricing</div>
              <h2>What Packages Do You Offer?</h2>
              <p>Specify packages that clients can book directly from your self-service portal.</p>
            </div>

            {packages.map((pkg, i) => (
              <PackageEntry
                key={pkg.id}
                pkg={pkg}
                index={i}
                onChange={updatePackage}
                onRemove={removePackage}
                showRemove={packages.length > 1}
              />
            ))}

            <button type="button" className="add-btn" onClick={addPackage}>
              + Add another package
            </button>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── Step 5: Booking & Communication Preferences ───────────────── */}
        {currentStep === 5 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">05 — Booking Preferences</div>
              <h2>Scheduling, Ledgers &amp; Notifications</h2>
              <p>Tailor calendar buffer rules and active ledger deduction logic.</p>
            </div>

            <div className="field-row">
              <FieldGroup label="Operating Hours — Start" required>
                <TextInput
                  id="hours-start"
                  type="time"
                  value={booking.hoursStart}
                  onChange={(v) => setBooking((b) => ({ ...b, hoursStart: v }))}
                />
              </FieldGroup>
              <FieldGroup label="Operating Hours — End" required>
                <TextInput
                  id="hours-end"
                  type="time"
                  value={booking.hoursEnd}
                  onChange={(v) => setBooking((b) => ({ ...b, hoursEnd: v }))}
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Buffer Time Between Lessons" hint="Buffer time prevents back-to-back bookings with no travel gap.">
              <SelectInput
                id="buffer-time"
                value={booking.bufferTime}
                onChange={(v) => setBooking((b) => ({ ...b, bufferTime: v }))}
              >
                <option value="0">No buffer</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
              </SelectInput>
            </FieldGroup>

            <FieldGroup label="How far in advance can students book?" required>
              <SelectInput
                id="advance-booking"
                value={booking.advanceBooking}
                onChange={(v) => setBooking((b) => ({ ...b, advanceBooking: v }))}
              >
                <option>Same day</option>
                <option>1 day in advance</option>
                <option>2 days in advance</option>
                <option>1 week in advance</option>
                <option>2 weeks in advance</option>
              </SelectInput>
            </FieldGroup>

            <FieldGroup label="Lesson Ledger Deduction Rule" required hint="Determines how prepaid lesson hour balances are depleted.">
              <div className="radio-group">
                <RadioItem
                  name="manual-ledger"
                  value="manual"
                  label="Manual Completion — Hour deductions remain intact until the instructor or admin manually records a finished lesson via the Portal (avoids early ledger deductions)."
                  checked={booking.manualLedgerDeduction === "manual"}
                  onChange={(v) => setBooking((b) => ({ ...b, manualLedgerDeduction: v }))}
                />
                <RadioItem
                  name="manual-ledger"
                  value="automatic"
                  label="Automatic — Deduct hours automatically from student profiles when the scheduled lesson time has passed."
                  checked={booking.manualLedgerDeduction === "automatic"}
                  onChange={(v) => setBooking((b) => ({ ...b, manualLedgerDeduction: v }))}
                />
              </div>
            </FieldGroup>

            <FieldGroup label="Privacy-First Cancellation Alerts" required hint="When a slot opens up due to a last-minute cancellation.">
              <div className="radio-group">
                <RadioItem
                  name="cancellation-alerts"
                  value="individual-opt-in"
                  label="Enabled — System will scan for active students with matching SADC licenses and broadcast individual, personalized WhatsApp notifications to offer them the open slot."
                  checked={booking.cancellationBroadcasts === "individual-opt-in"}
                  onChange={(v) => setBooking((b) => ({ ...b, cancellationBroadcasts: v }))}
                />
                <RadioItem
                  name="cancellation-alerts"
                  value="none"
                  label="Disabled — Do not broadcast open slots individually; let slots remain open for general self-service bookings."
                  checked={booking.cancellationBroadcasts === "none"}
                  onChange={(v) => setBooking((b) => ({ ...b, cancellationBroadcasts: v }))}
                />
              </div>
            </FieldGroup>

            <FieldGroup label="Reminder Timing" required>
              <div className="checkbox-group">
                {["Morning of lesson", "24 hours before", "48 hours before"].map((item) => (
                  <CheckboxItem
                    key={item}
                    label={item}
                    checked={booking.reminderTimings.includes(item)}
                    onChange={() => toggleReminder(item)}
                  />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Any scheduling notes or special requirements?">
              <Textarea
                id="scheduling-notes"
                placeholder="e.g. Instructors need a strict 13:00 - 14:00 lunch break, or no bookings on specific holidays..."
                value={booking.schedulingNotes}
                onChange={(v) => setBooking((b) => ({ ...b, schedulingNotes: v }))}
              />
            </FieldGroup>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── Step 6: Payment, AI Audit & Financial Analytics ─────────────── */}
        {currentStep === 6 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">06 — Payment &amp; Finance</div>
              <h2>Invoicing, AI Audit Setup, &amp; Expense Tracking</h2>
              <p>Configure payment methods, Proof of Payment (PoP) auditing guidelines, and custom expense tracking in Namibian Dollar format.</p>
            </div>

            <FieldGroup label="Supported Payment Methods" required>
              <div className="checkbox-group">
                {["EFT / Bank Transfer", "Cash", "Payment Gateway", "Monthly Account", "e-Wallet / EasyWallet Transfer"].map((method) => (
                  <CheckboxItem
                    key={method}
                    label={method}
                    checked={payment.methods.includes(method)}
                    onChange={() => togglePaymentMethod(method)}
                  />
                ))}
              </div>
            </FieldGroup>

            {(payment.methods.includes("EFT / Bank Transfer") || payment.methods.includes("e-Wallet / EasyWallet Transfer")) && (
              <div className="field-row">
                <FieldGroup label="Bank Accounts to Audit" required hint="Provide bank names (e.g., Bank Windhoek, FNB Namibia, Standard Bank Namibia, Nedbank Namibia) to calibrate Google Gemini's Proof of Payment receipt verification.">
                  <TextInput
                    id="pop-bank-name"
                    placeholder="e.g. Bank Windhoek and FNB Namibia"
                    value={payment.aiAuditBankName}
                    onChange={(v) => setPayment((p) => ({ ...p, aiAuditBankName: v }))}
                  />
                </FieldGroup>
                <FieldGroup label="Banking Details for Clients" hint="Displayed to clients when making a manual transfer.">
                  <TextInput
                    id="banking-details"
                    placeholder="e.g. Account Number, Branch Code..."
                    value={payment.bankingDetails}
                    onChange={(v) => setPayment((p) => ({ ...p, bankingDetails: v }))}
                  />
                </FieldGroup>
              </div>
            )}

            {payment.methods.includes("Payment Gateway") && (
              <div className="field-group">
                <label className="field-label">Payment Gateway Integration</label>
                <SelectInput
                  id="gateway-select"
                  value={payment.gateway}
                  onChange={(v) => setPayment((p) => ({ ...p, gateway: v }))}
                >
                  <option value="">Select gateway</option>
                  <option>PayToday</option>
                  <option>DPO Group</option>
                  <option>Peach Payments</option>
                  <option>Windhoek Bank Gateway</option>
                  <option>Other</option>
                </SelectInput>
                <div style={{ marginTop: 12 }}>
                  <label className="field-label">Merchant ID / API Key</label>
                  <TextInput
                    id="merchant-id"
                    placeholder="Your merchant credentials"
                    value={payment.merchantId}
                    onChange={(v) => setPayment((p) => ({ ...p, merchantId: v }))}
                  />
                </div>
              </div>
            )}

            <FieldGroup label="Automatic Expense Auditing (WhatsApp Receipt Scanning)" required hint="Under Part 2.1, instructors can snap & upload fuel or vehicle maintenance slips via WhatsApp to automatically record expenses.">
              <div className="radio-group">
                <RadioItem
                  name="expense-logging"
                  value="enabled"
                  label="Enabled — AI will parse fuel & maintenance receipts sent over WhatsApp and file them under the matching vehicle."
                  checked={payment.aiReceiptLogging === "enabled"}
                  onChange={(v) => setPayment((p) => ({ ...p, aiReceiptLogging: v }))}
                />
                <RadioItem
                  name="expense-logging"
                  value="disabled"
                  label="Disabled"
                  checked={payment.aiReceiptLogging === "disabled"}
                  onChange={(v) => setPayment((p) => ({ ...p, aiReceiptLogging: v }))}
                />
              </div>
            </FieldGroup>

            <FieldGroup label="Manual Expense Categories to Prepopulate" hint="Custom expense headings you would like structured in your financial dashboard.">
              <TextInput
                id="manual-categories"
                placeholder="e.g. Office Rent, Admin Salaries, Marketing, Fleet Insurance"
                value={payment.manualExpenseCategories}
                onChange={(v) => setPayment((p) => ({ ...p, manualExpenseCategories: v }))}
              />
            </FieldGroup>

            <FieldGroup label="When is payment required?" required>
              <div className="radio-group">
                {[
                  { value: "upfront", label: "Upfront (Prior to lesson booking validation)" },
                  { value: "month-end", label: "Month End Accounts" },
                  { value: "flexible", label: "Flexible" },
                ].map(({ value, label }) => (
                  <RadioItem
                    key={value}
                    name="payment-timing"
                    value={value}
                    label={label}
                    checked={payment.timing === value}
                    onChange={(v) => setPayment((p) => ({ ...p, timing: v }))}
                  />
                ))}
              </div>
            </FieldGroup>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── Step 7: Branding & NaTIS Google Reviews ─────────────────────── */}
        {currentStep === 7 && !submitted && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">07 — Branding &amp; Final Details</div>
              <h2>Make It Yours &amp; Configure Post-NaTIS Prompts</h2>
              <p>Personalize the customer interface and template your automated student success review prompts.</p>
            </div>

            <div className="field-row">
              <FieldGroup label="Primary Brand Colour" hint="Used on your booking page and web header.">
                <input
                  type="color"
                  id="brand-color"
                  value={branding.brandColor}
                  onChange={(e) => setBranding((b) => ({ ...b, brandColor: e.target.value }))}
                  className="field-input color-input"
                />
              </FieldGroup>
              <FieldGroup label="Logo (if available)" hint="PNG or JPG, converts automatically for database transmission.">
                <input
                  type="file"
                  id="logo-file"
                  accept="image/*"
                  className="field-input file-input"
                  onChange={handleLogoChange}
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Tone of your WhatsApp AI Chatbot" required>
              <div className="radio-group">
                {[
                  { value: "friendly", label: "Friendly and conversational — helpful and supportive voice" },
                  { value: "professional", label: "Professional and formal — structural and precise responses" },
                  { value: "mixed", label: "A balanced mix of warm and professional tones" },
                ].map(({ value, label }) => (
                  <RadioItem
                    key={value}
                    name="ai-tone"
                    value={value}
                    label={label}
                    checked={branding.aiTone === value}
                    onChange={(v) => setBranding((b) => ({ ...b, aiTone: v }))}
                  />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Languages Your Customers Prefer">
              <div className="checkbox-group">
                {LANGUAGES.map((lang) => (
                  <CheckboxItem
                    key={lang}
                    label={lang}
                    checked={branding.languages.includes(lang)}
                    onChange={() => toggleLanguage(lang)}
                  />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Enable Google Review Triggers? (Post-NaTIS Pass)" required hint="When a student passes their test, changing status to 'Passed NaTIS' automatically sends a custom WhatsApp review prompt.">
              <div className="radio-group">
                <RadioItem
                  name="reviews"
                  value="yes"
                  label="Yes — automatically dispatch a congratulations and review request to successful students"
                  checked={branding.googleReviews === "yes"}
                  onChange={(v) => setBranding((b) => ({ ...b, googleReviews: v }))}
                />
                <RadioItem
                  name="reviews"
                  value="no"
                  label="No"
                  checked={branding.googleReviews === "no"}
                  onChange={(v) => setBranding((b) => ({ ...b, googleReviews: v }))}
                />
              </div>
            </FieldGroup>

            {branding.googleReviews === "yes" && (
              <FieldGroup label="Post-NaTIS WhatsApp Message Template" hint="Customize the copy sent out to successful candidates. Make sure to keep the link prompt clear.">
                <Textarea
                  id="natis-review-message"
                  value={branding.natisReviewMessage}
                  onChange={(v) => setBranding((b) => ({ ...b, natisReviewMessage: v }))}
                />
              </FieldGroup>
            )}

            <FieldGroup label="Anything else we should know?">
              <Textarea
                id="extra-notes"
                placeholder="List any additional business guidelines, specific fuel card requirements, or customizations you need..."
                value={branding.extraNotes}
                onChange={(v) => setBranding((b) => ({ ...b, extraNotes: v }))}
              />
            </FieldGroup>

            {submitError && (
              <div className="error-msg" role="alert">
                An issue occurred while submitting the form. Please review and try again.
              </div>
            )}

            <NavRow
              onBack={goBack}
              onNext={handleSubmit}
              nextLabel="Submit Setup →"
              isSubmitting={submitting}
            />
          </section>
        )}

        {/* ── Success ───────────────────────────────────────────────────── */}
        {submitted && (
          <div className="success-screen" role="status">
            <div className="success-icon" aria-hidden="true">✓</div>
            <h2>Setup Details Submitted.</h2>
            <p>
              We have processed your configuration requirements. Our team will structure your custom platform assets, API gateways, and analytical databases in line with the proposal.
            </p>
            <hr className="divider" style={{ maxWidth: 200, margin: "32px auto" }} />
            <p style={{ fontSize: 13 }}>We will update you on our progress shortly.</p>
          </div>
        )}
      </main>
    </>
  );
}

// ─── Styles (scoped via class names) ─────────────────────────────────────────

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
