"use client";

import { useState, useRef } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLES = [
  "Developer",
  "UI / UX Designer",
  "Marketing",
  "Sales / Business Development",
  "Operations / Support",
  "Other",
];

const PAYMENT_METHODS = [
  "Direct Bank Transfer",
  "Mobile Money / Wallet",
  "Wise / International Transfer",
  "Crypto / Stablecoin",
];

const TOTAL_STEPS = 4;
const WEBHOOK_URL = "https://n8n.stellarcode.agency/webhook/employee-onboarding";

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

function RadioCard({ label, selected, onClick, description }) {
  return (
    <div className={`radio-card ${selected ? "selected" : ""}`} onClick={onClick}>
      <div className="radio-dot">{selected && <div className="radio-dot-inner" />}</div>
      <div>
        <div className="radio-card-title">{label}</div>
        {description && <div className="radio-card-desc">{description}</div>}
      </div>
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EmployeeOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Step 1 — Role
  const [roleInfo, setRoleInfo] = useState({
    role: "",
    customRole: "",
    startDate: "",
  });

  // Step 2 — Personal Details
  const [personal, setPersonal] = useState({
    fullName: "",
    preferredName: "",
    email: "",
    phone: "",
    countryCity: "",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
  });

  // Step 3 — Payment Options & Banking
  const [payment, setPayment] = useState({
    paymentMethod: "Direct Bank Transfer",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    branchCode: "",
    swiftOrIBAN: "",
    additionalPaymentNotes: "",
  });

  // Step 4 — Digital Signature
  const [signatureType, setSignatureType] = useState("type"); // "type" | "draw"
  const [typedSignature, setTypedSignature] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Canvas Ref for Drawing
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Canvas Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(
      (e.clientX || e.touches[0].clientX) - rect.left,
      (e.clientY || e.touches[0].clientY) - rect.top
    );
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(
      (e.clientX || e.touches[0].clientX) - rect.left,
      (e.clientY || e.touches[0].clientY) - rect.top
    );
    ctx.strokeStyle = "#d8e4f0";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
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
    if (!agreedToTerms) {
      alert("Please check the confirmation box to agree to the terms.");
      return;
    }

    let finalSignature = "";
    if (signatureType === "type") {
      if (!typedSignature.trim()) {
        alert("Please type your full legal name as your digital signature.");
        return;
      }
      finalSignature = typedSignature;
    } else {
      if (!hasDrawn || !canvasRef.current) {
        alert("Please draw your signature in the canvas box.");
        return;
      }
      finalSignature = canvasRef.current.toDataURL();
    }

    setSubmitting(true);
    setSubmitError(false);

    const payload = {
      submittedAt: new Date().toISOString(),
      role: roleInfo,
      personal,
      payment,
      signature: {
        type: signatureType,
        value: finalSignature,
        agreedToTerms: true,
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

  const stepStatus = (i) => {
    if (submitted) return "done";
    if (i < currentStep) return "done";
    if (i === currentStep) return "active";
    return "";
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Hero Header */}
      <header className="hero">
        <div className="logo">Internal Portal</div>
        <h1>Team Member Onboarding</h1>
        <p>Complete your onboarding setup by confirming your role, contact information, payout preferences, and digital agreement.</p>
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

        {/* ── Step 1: Role Selection ───────────────────────────────────────── */}
        {currentStep === 1 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">01 — Department &amp; Role</div>
              <h2>Which role are you joining?</h2>
              <p>Select the core position or team you will be joining.</p>
            </div>

            <div className="radio-grid">
              {ROLES.map((r) => (
                <RadioCard
                  key={r}
                  label={r}
                  selected={roleInfo.role === r}
                  onClick={() => setRoleInfo((prev) => ({ ...prev, role: r }))}
                />
              ))}
            </div>

            {roleInfo.role === "Other" && (
              <FieldGroup label="Specify Role Title" required>
                <TextInput
                  placeholder="e.g. Content Strategist, Video Editor"
                  value={roleInfo.customRole}
                  onChange={(v) => setRoleInfo((prev) => ({ ...prev, customRole: v }))}
                />
              </FieldGroup>
            )}

            <FieldGroup label="Expected Start Date">
              <TextInput
                type="date"
                value={roleInfo.startDate}
                onChange={(v) => setRoleInfo((prev) => ({ ...prev, startDate: v }))}
              />
            </FieldGroup>

            <NavRow
              onNext={() => {
                if (!roleInfo.role) {
                  alert("Please select a role to continue.");
                  return;
                }
                goNext();
              }}
            />
          </section>
        )}

        {/* ── Step 2: Personal Information ────────────────────────────────── */}
        {currentStep === 2 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">02 — Personal Details</div>
              <h2>Personal &amp; Contact Details</h2>
              <p>Please provide your contact details for primary communication and internal profile setup.</p>
            </div>

            <div className="field-row">
              <FieldGroup label="Full Legal Name" required>
                <TextInput
                  placeholder="e.g. Cassidy Kahn"
                  value={personal.fullName}
                  onChange={(v) => setPersonal((p) => ({ ...p, fullName: v }))}
                />
              </FieldGroup>
              <FieldGroup label="Preferred Name">
                <TextInput
                  placeholder="e.g. Cass"
                  value={personal.preferredName}
                  onChange={(v) => setPersonal((p) => ({ ...p, preferredName: v }))}
                />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="Email Address" required>
                <TextInput
                  type="email"
                  placeholder="you@email.com"
                  value={personal.email}
                  onChange={(v) => setPersonal((p) => ({ ...p, email: v }))}
                />
              </FieldGroup>
              <FieldGroup label="Phone / WhatsApp Number" required>
                <TextInput
                  type="tel"
                  placeholder="+264 81 000 0000"
                  value={personal.phone}
                  onChange={(v) => setPersonal((p) => ({ ...p, phone: v }))}
                />
              </FieldGroup>
            </div>

            <FieldGroup label="City & Country of Residence" required>
              <TextInput
                placeholder="e.g. Windhoek, Namibia"
                value={personal.countryCity}
                onChange={(v) => setPersonal((p) => ({ ...p, countryCity: v }))}
              />
            </FieldGroup>

            <hr className="divider" />
            <h3 className="sub-heading">Emergency Contact</h3>

            <div className="field-row">
              <FieldGroup label="Emergency Contact Name" required>
                <TextInput
                  placeholder="Contact Name"
                  value={personal.emergencyName}
                  onChange={(v) => setPersonal((p) => ({ ...p, emergencyName: v }))}
                />
              </FieldGroup>
              <FieldGroup label="Relationship" required>
                <TextInput
                  placeholder="e.g. Parent, Partner, Sibling"
                  value={personal.emergencyRelationship}
                  onChange={(v) => setPersonal((p) => ({ ...p, emergencyRelationship: v }))}
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Emergency Contact Phone" required>
              <TextInput
                type="tel"
                placeholder="+264 81 000 0000"
                value={personal.emergencyPhone}
                onChange={(v) => setPersonal((p) => ({ ...p, emergencyPhone: v }))}
              />
            </FieldGroup>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── Step 3: Payment Options & Banking ────────────────────────────── */}
        {currentStep === 3 && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">03 — Payment Info</div>
              <h2>Preferred Payment &amp; Banking Setup</h2>
              <p>Specify how and where you would like to receive your monthly payments.</p>
            </div>

            <FieldGroup label="Preferred Payment Method" required>
              <SelectInput
                value={payment.paymentMethod}
                onChange={(v) => setPayment((p) => ({ ...p, paymentMethod: v }))}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </SelectInput>
            </FieldGroup>

            <div className="field-row">
              <FieldGroup label="Bank Name / Service Provider" required>
                <TextInput
                  placeholder="e.g. FNB Namibia / Wise / Binance"
                  value={payment.bankName}
                  onChange={(v) => setPayment((p) => ({ ...p, bankName: v }))}
                />
              </FieldGroup>
              <FieldGroup label="Account Holder Name" required hint="Must match legal identity on statement">
                <TextInput
                  placeholder="e.g. Cassidy Kahn"
                  value={payment.accountHolder}
                  onChange={(v) => setPayment((p) => ({ ...p, accountHolder: v }))}
                />
              </FieldGroup>
            </div>

            <div className="field-row">
              <FieldGroup label="Account / Wallet Number" required>
                <TextInput
                  placeholder="Account Number or Wallet Address"
                  value={payment.accountNumber}
                  onChange={(v) => setPayment((p) => ({ ...p, accountNumber: v }))}
                />
              </FieldGroup>
              <FieldGroup label="Branch Code / Routing">
                <TextInput
                  placeholder="e.g. 281872"
                  value={payment.branchCode}
                  onChange={(v) => setPayment((p) => ({ ...p, branchCode: v }))}
                />
              </FieldGroup>
            </div>

            <FieldGroup label="SWIFT / IBAN (Optional)" hint="Required for international bank transfers.">
              <TextInput
                placeholder="SWIFT code or IBAN"
                value={payment.swiftOrIBAN}
                onChange={(v) => setPayment((p) => ({ ...p, swiftOrIBAN: v }))}
              />
            </FieldGroup>

            <FieldGroup label="Payment Notes or Specific Instructions">
              <Textarea
                placeholder="Mention any currency preferences or specific instructions..."
                value={payment.additionalPaymentNotes}
                onChange={(v) => setPayment((p) => ({ ...p, additionalPaymentNotes: v }))}
              />
            </FieldGroup>

            <NavRow onBack={goBack} onNext={goNext} />
          </section>
        )}

        {/* ── Step 4: Digital Agreement & Signature ───────────────────────── */}
        {currentStep === 4 && !submitted && (
          <section className="section active">
            <div className="section-header">
              <div className="section-number">04 — Agreement &amp; Signature</div>
              <h2>Sign Onboarding Agreement</h2>
              <p>Review the agreement summary and provide your digital signature below to complete onboarding.</p>
            </div>

            {/* Contract Terms Box */}
            <div className="terms-box">
              <h3>Standard Onboarding Terms &amp; Acknowledgment</h3>
              <ul>
                <li>I confirm that all personal and payout information provided is accurate and truthful.</li>
                <li>I agree to maintain confidentiality regarding all proprietary systems, code, client information, and internal processes.</li>
                <li>I acknowledge that my duties and responsibilities align with the role assigned: <strong>{roleInfo.role === "Other" ? roleInfo.customRole : roleInfo.role || "Selected Role"}</strong>.</li>
              </ul>
            </div>

            {/* Signature Toggle */}
            <div className="sig-toggle">
              <button
                type="button"
                className={`sig-toggle-btn ${signatureType === "type" ? "active" : ""}`}
                onClick={() => setSignatureType("type")}
              >
                Type Signature
              </button>
              <button
                type="button"
                className={`sig-toggle-btn ${signatureType === "draw" ? "active" : ""}`}
                onClick={() => setSignatureType("draw")}
              >
                Draw Signature
              </button>
            </div>

            {/* Type Signature Mode */}
            {signatureType === "type" ? (
              <FieldGroup label="Type Full Legal Name" required hint="Your typed name serves as a legal digital signature.">
                <TextInput
                  placeholder="e.g. Cassidy Kahn"
                  value={typedSignature}
                  onChange={setTypedSignature}
                />
                {typedSignature && (
                  <div className="typed-preview">
                    <em>{typedSignature}</em>
                  </div>
                )}
              </FieldGroup>
            ) : (
              /* Draw Signature Mode */
              <FieldGroup label="Draw Signature Below" required hint="Use your mouse, trackpad, or finger to draw your signature.">
                <div className="canvas-wrapper">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  <button type="button" className="btn-clear" onClick={clearCanvas}>
                    Clear
                  </button>
                </div>
              </FieldGroup>
            )}

            {/* Checkbox Confirmation */}
            <label className="checkbox-agreement">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <span>
                I agree to the terms above and confirm that this digital signature is legally binding.
              </span>
            </label>

            {submitError && (
              <div className="error-msg" role="alert">
                An issue occurred while submitting your onboarding profile. Please try again.
              </div>
            )}

            <NavRow
              onBack={goBack}
              onNext={handleSubmit}
              nextLabel="Sign & Submit Everything →"
              isSubmitting={submitting}
            />
          </section>
        )}

        {/* ── Success Screen ─────────────────────────────────────────────── */}
        {submitted && (
          <div className="success-screen" role="status">
            <div className="success-icon" aria-hidden="true">✓</div>
            <h2>You're All Set!</h2>
            <p>
              Your onboarding information and signed agreement have been successfully submitted. Welcome to the team!
            </p>
            <hr className="divider" style={{ maxWidth: 200, margin: "32px auto" }} />
            <p style={{ fontSize: 13, color: "var(--muted)" }}>An administrator will review your setup shortly.</p>
          </div>
        )}
      </main>
    </>
  );
}

// ─── CSS Styles ─────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&family=Dancing+Script:wght@600&display=swap');

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

  .hero {
    background: var(--deep);
    border-bottom: 1px solid var(--border);
    padding: 60px 40px 50px;
    position: relative;
    overflow: hidden;
  }

  .logo {
    font-family: 'DM Serif Display', serif;
    font-size: 13px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent-bright);
    margin-bottom: 30px;
  }

  .hero h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(32px, 5vw, 56px);
    font-weight: 400;
    line-height: 1.1;
    max-width: 600px;
    margin-bottom: 16px;
    color: var(--white);
  }

  .hero p {
    color: var(--muted);
    font-size: 15px;
    max-width: 500px;
    line-height: 1.7;
  }

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

  .form-container {
    max-width: 720px;
    margin: 0 auto;
    padding: 60px 40px 100px;
  }

  .section {
    animation: fadeUp 0.4s ease;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .section-header { margin-bottom: 36px; }

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

  .sub-heading {
    font-family: 'DM Serif Display', serif;
    font-size: 18px;
    color: var(--accent-bright);
    margin-bottom: 20px;
  }

  .radio-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    margin-bottom: 28px;
  }

  .radio-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .radio-card:hover { border-color: var(--accent); }

  .radio-card.selected {
    border-color: var(--accent-bright);
    background: rgba(74, 127, 165, 0.1);
  }

  .radio-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid var(--muted);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .radio-card.selected .radio-dot { border-color: var(--accent-bright); }

  .radio-dot-inner {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-bright);
  }

  .radio-card-title {
    font-size: 14px;
    color: var(--white);
    font-weight: 400;
  }

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
    min-height: 90px;
    line-height: 1.6;
  }

  .hint {
    font-size: 12px;
    color: var(--muted);
    margin-top: 6px;
    line-height: 1.5;
  }

  .terms-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .terms-box h3 {
    font-size: 14px;
    color: var(--accent-bright);
    margin-bottom: 12px;
    font-weight: 500;
  }

  .terms-box ul {
    list-style-type: disc;
    padding-left: 20px;
    color: var(--white);
    font-size: 13px;
    line-height: 1.7;
  }

  .sig-toggle {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .sig-toggle-btn {
    flex: 1;
    background: var(--input-bg);
    border: 1px solid var(--border);
    color: var(--muted);
    padding: 10px;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .sig-toggle-btn.active {
    border-color: var(--accent);
    color: var(--white);
    background: rgba(74, 127, 165, 0.1);
  }

  .typed-preview {
    margin-top: 12px;
    padding: 16px;
    background: var(--surface);
    border: 1px dashed var(--border);
    border-radius: 6px;
    text-align: center;
    font-family: 'Dancing Script', cursive;
    font-size: 28px;
    color: var(--accent-bright);
  }

  .canvas-wrapper {
    position: relative;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--input-bg);
    touch-action: none;
  }

  .canvas-wrapper canvas {
    width: 100%;
    height: 150px;
    display: block;
    cursor: crosshair;
  }

  .btn-clear {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0,0,0,0.4);
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn-clear:hover { color: var(--white); }

  .checkbox-agreement {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 24px;
    cursor: pointer;
    font-size: 13px;
    color: var(--white);
    line-height: 1.5;
  }

  .checkbox-agreement input {
    margin-top: 3px;
    accent-color: var(--accent-bright);
  }

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

  .error-msg {
    background: rgba(165,74,74,0.08);
    border: 1px solid rgba(165,74,74,0.3);
    border-radius: 6px;
    color: #cc6a6a;
    font-size: 13px;
    padding: 12px 16px;
    margin-top: 16px;
  }

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

  @media (max-width: 560px) {
    .field-row { grid-template-columns: 1fr; }
    .form-container { padding: 40px 24px 80px; }
    .hero { padding: 40px 24px; }
  }
`;
