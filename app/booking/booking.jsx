"use client";

import { useState, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

const LICENSE_TYPES = ["Code 8 Manual", "Code 8 Auto", "Code 10", "Code 14"];
const WORKING_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const LANGUAGES = ["English", "Afrikaans", "Zulu", "Xhosa", "Sotho", "Other"];
const TOTAL_STEPS = 6;
const WEBHOOK_URL = "https://hook.eu1.make.com/dpym6dzyl0z3gpb7wjfk5ntorwsf2x11";

const makeInstructor = (index) => ({
  id: Date.now() + index,
  firstName: "",
  lastName: "",
  whatsapp: "",
  email: "",
  licenseTypes: [],
  workingDays: [],
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
          <TextInput type="tel" placeholder="+27 82 000 0000" value={instructor.whatsapp} onChange={update("whatsapp")} />
        </FieldGroup>
        <FieldGroup label="Email">
          <TextInput type="email" placeholder="instructor@school.co.za" value={instructor.email} onChange={update("email")} />
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
          <TextInput placeholder="e.g. Code 8 Manual — 1 Hour" value={pkg.name} onChange={update("name")} />
        </FieldGroup>
        <FieldGroup label="Price (R)" required>
          <TextInput type="number" placeholder="e.g. 350" value={pkg.price} onChange={update("price")} />
        </FieldGroup>
      </div>

      <div className="field-row">
        <FieldGroup label="Duration" required>
          <TextInput placeholder="e.g. 1 hour, 90 minutes" value={pkg.duration} onChange={update("duration")} />
        </FieldGroup>
        <FieldGroup label="License / Course Type" required>
          <TextInput placeholder="e.g. Code 8 Manual, Code 10" value={pkg.licenseType} onChange={update("licenseType")} />
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

  // Step 1 — Business
  const [business, setBusiness] = useState({
    schoolName: "",
    ownerName: "",
    whatsapp: "",
    email: "",
    address: "",
    city: "",
    googleProfile: "",
  });

  // Step 2 — Instructors
  const [instructors, setInstructors] = useState([makeInstructor(0)]);

  // Step 3 — Packages
  const [packages, setPackages] = useState([makePackage(0)]);

  // Step 4 — Booking Preferences
  const [booking, setBooking] = useState({
    hoursStart: "08:00",
    hoursEnd: "17:00",
    bufferTime: "0",
    advanceBooking: "2 days in advance",
    reminderTimings: ["Morning of lesson"],
    schedulingNotes: "",
  });

  // Step 5 — Payment
  const [payment, setPayment] = useState({
    methods: [],
    bankingDetails: "",
    gateway: "",
    merchantId: "",
    timing: "",
  });

  // Step 6 — Branding
  const [branding, setBranding] = useState({
    brandColor: "#1a2e4a",
    logoFile: null,
    aiTone: "",
    languages: ["English"],
    googleReviews: "yes",
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

    const payload = {
      submittedAt: new Date().toISOString(),
      business: {
        schoolName: business.schoolName,
        ownerName: business.ownerName,
        whatsappNumber: business.whatsapp,
        email: business.email,
        address: business.address,
        city: business.city,
        googleProfile: business.googleProfile,
      },
      instructors: instructors.map((ins, i) => ({
        index: i + 1,
        firstName: ins.firstName,
        lastName: ins.lastName,
        whatsapp: ins.whatsapp,
        email: ins.email,
        licenseTypes: ins.licenseTypes,
        workingDays: ins.workingDays,
      })),
      packages: packages.map((pkg, i) => ({
        index: i + 1,
        name: pkg.name,
        price: pkg.price,
        duration: pkg.duration,
        licenseType: pkg.licenseType,
      })),
      bookingPreferences: {
        hoursStart: booking.hoursStart,
        hoursEnd: booking.hoursEnd,
        bufferTime: booking.bufferTime,
        advanceBooking: booking.advanceBooking,
        reminderTimings: booking.reminderTimings,
        schedulingNotes: booking.schedulingNotes,
      },
      payment: {
        methods: payment.methods,
        bankingDetails: payment.bankingDetails,
        gateway: payment.gateway,
        merchantId: payment.merchantId,
        timing: payment.timing,
      },
      branding: {
        brandColor: branding.brandColor,
        aiTone: branding.aiTone,
        languages: branding.languages,
        googleReviews: branding.googleReviews,
        extraNotes: branding.extraNotes,
        // Note: logo file upload should be handled via a separate
        // multipart/form-data endpoint or a file storage service
      },
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
        <p>Fill in the details below and we&rsquo;ll handle everything from here. This takes about 5 minutes.</p>
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

        {/* ── Step 1: Business Details ───────────────────────────────────── */}
        {currentStep === 1 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">01 — Business Details</div>
              <h2>Tell us about your school</h2>
              <p>Basic information we need to set everything up in your name.</p>
            </div>

            <div className="field-row">
              <FieldGroup label="School Name" required>
                <TextInput
                  id="school-name"
                  placeholder="e.g. Josiah's Driving School"
                  value={business.schoolName}
                  onChange={(v) => setBusiness((b) => ({ ...b, schoolName: v }))}
                />
              </FieldGroup>
              <FieldGroup label="Owner / Contact Name" required>
                <TextInput
                  id="owner-name"
                  placeholder="e.g. Josiah Petersen"
                  value={business.ownerName}
                  onChange={(v) => setBusiness((b) => ({ ...b, ownerName: v }))}
                />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="WhatsApp Number" required hint="This is the number students will message.">
                <TextInput
                  id="whatsapp-number"
                  type="tel"
                  placeholder="+27 82 000 0000"
                  value={business.whatsapp}
                  onChange={(v) => setBusiness((b) => ({ ...b, whatsapp: v }))}
                />
              </FieldGroup>
              <FieldGroup label="Email Address" required>
                <TextInput
                  id="email"
                  type="email"
                  placeholder="you@school.co.za"
                  value={business.email}
                  onChange={(v) => setBusiness((b) => ({ ...b, email: v }))}
                />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="Physical Address" required>
                <TextInput
                  id="address"
                  placeholder="123 Main Street"
                  value={business.address}
                  onChange={(v) => setBusiness((b) => ({ ...b, address: v }))}
                />
              </FieldGroup>
              <FieldGroup label="City / Province" required>
                <TextInput
                  id="city"
                  placeholder="e.g. Cape Town, Western Cape"
                  value={business.city}
                  onChange={(v) => setBusiness((b) => ({ ...b, city: v }))}
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Google Business Profile Link" hint="Paste your Google Maps listing URL if you have one.">
              <TextInput
                id="google-profile"
                type="url"
                placeholder="https://maps.app.goo.gl/..."
                value={business.googleProfile}
                onChange={(v) => setBusiness((b) => ({ ...b, googleProfile: v }))}
              />
            </FieldGroup>

            <NavRow onNext={goNext} />
          </section>
        )}

        {/* ── Step 2: Instructors ───────────────────────────────────────── */}
        {currentStep === 2 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">02 — Instructors</div>
              <h2>Your team</h2>
              <p>Add each instructor — we use this to manage scheduling and send daily briefings.</p>
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

        {/* ── Step 3: Packages ──────────────────────────────────────────── */}
        {currentStep === 3 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">03 — Packages &amp; Pricing</div>
              <h2>What do you offer?</h2>
              <p>List your lesson packages so students can choose when booking.</p>
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

        {/* ── Step 4: Booking Preferences ───────────────────────────────── */}
        {currentStep === 4 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">04 — Booking Preferences</div>
              <h2>How do you run your day?</h2>
              <p>We use this to set up your calendar and slot availability.</p>
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

            <FieldGroup label="Buffer Time Between Lessons" hint="Buffer time prevents back-to-back bookings with no gap.">
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
                placeholder="e.g. No bookings on public holidays, instructors take lunch 12–1pm..."
                value={booking.schedulingNotes}
                onChange={(v) => setBooking((b) => ({ ...b, schedulingNotes: v }))}
              />
            </FieldGroup>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── Step 5: Payment ───────────────────────────────────────────── */}
        {currentStep === 5 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">05 — Payment</div>
              <h2>How do students pay?</h2>
              <p>We use this to set up your proof of payment flow and booking confirmation.</p>
            </div>

            <FieldGroup label="Payment Method" required>
              <div className="checkbox-group">
                {["EFT / Bank Transfer", "Cash", "Payment Gateway", "Monthly Account"].map((method) => (
                  <CheckboxItem
                    key={method}
                    label={method}
                    checked={payment.methods.includes(method)}
                    onChange={() => togglePaymentMethod(method)}
                  />
                ))}
              </div>
            </FieldGroup>

            {payment.methods.includes("EFT / Bank Transfer") && (
              <FieldGroup label="Banking Details" hint="Students will see this when making payment.">
                <Textarea
                  id="banking-details"
                  placeholder="Bank name, account holder, account number, branch code..."
                  value={payment.bankingDetails}
                  onChange={(v) => setPayment((p) => ({ ...p, bankingDetails: v }))}
                />
              </FieldGroup>
            )}

            {payment.methods.includes("Payment Gateway") && (
              <div className="field-group">
                <label className="field-label">Payment Gateway</label>
                <SelectInput
                  id="gateway-select"
                  value={payment.gateway}
                  onChange={(v) => setPayment((p) => ({ ...p, gateway: v }))}
                >
                  <option value="">Select gateway</option>
                  <option>PayFast</option>
                  <option>Peach Payments</option>
                  <option>PayGate</option>
                  <option>Yoco</option>
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

            <FieldGroup label="When is payment required?" required>
              <div className="radio-group">
                {[
                  { value: "upfront", label: "Upfront before lesson" },
                  { value: "month-end", label: "Month end" },
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

        {/* ── Step 6: Branding ──────────────────────────────────────────── */}
        {currentStep === 6 && !submitted && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">06 — Branding &amp; Final Details</div>
              <h2>Make it yours</h2>
              <p>We use this to match the system to your school&rsquo;s look and feel.</p>
            </div>

            <div className="field-row">
              <FieldGroup label="Primary Brand Colour" hint="Used on your booking page and website.">
                <input
                  type="color"
                  id="brand-color"
                  value={branding.brandColor}
                  onChange={(e) => setBranding((b) => ({ ...b, brandColor: e.target.value }))}
                  className="field-input color-input"
                />
              </FieldGroup>
              <FieldGroup label="Logo (if available)" hint="PNG or JPG, any size.">
                {/*
                  Note: File inputs in React are uncontrolled.
                  Store the file reference via onChange and send via
                  FormData to a separate upload endpoint before submitting.
                */}
                <input
                  type="file"
                  id="logo-file"
                  accept="image/*"
                  className="field-input file-input"
                  onChange={(e) =>
                    setBranding((b) => ({ ...b, logoFile: e.target.files[0] ?? null }))
                  }
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Tone of your WhatsApp AI" required>
              <div className="radio-group">
                {[
                  { value: "friendly", label: "Friendly and casual — feels like chatting with a person" },
                  { value: "professional", label: "Professional and formal — business-like responses" },
                  { value: "mixed", label: "Mix of both" },
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

            <FieldGroup label="Language(s) your students use">
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

            <FieldGroup label="Enable Google Review Requests?">
              <div className="radio-group">
                <RadioItem
                  name="reviews"
                  value="yes"
                  label="Yes — automatically ask students for Google reviews after lessons"
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

            <FieldGroup label="Anything else we should know?">
              <Textarea
                id="extra-notes"
                placeholder="Special requests, existing systems, anything you want us to keep in mind..."
                value={branding.extraNotes}
                onChange={(v) => setBranding((b) => ({ ...b, extraNotes: v }))}
              />
            </FieldGroup>

            {submitError && (
              <div className="error-msg" role="alert">
                Something went wrong submitting your form. Please try again.
              </div>
            )}

            <NavRow
              onBack={goBack}
              onNext={handleSubmit}
              nextLabel="Submit →"
              isSubmitting={submitting}
            />
          </section>
        )}

        {/* ── Success ───────────────────────────────────────────────────── */}
        {submitted && (
          <div className="success-screen" role="status">
            <div className="success-icon" aria-hidden="true">✓</div>
            <h2>You&rsquo;re all set.</h2>
            <p>
              We&rsquo;ve received your details and will be in touch within 24 hours to confirm
              your setup timeline. Your system will be live within a week.
            </p>
            <hr className="divider" style={{ maxWidth: 200, margin: "32px auto" }} />
            <p style={{ fontSize: 13 }}>Questions? Message us on WhatsApp anytime.</p>
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
    /* Fix: labels are not wrapping inputs anymore, so pointer events are fine */
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
    pointer-events: none; /* clicks handled by parent div */
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
