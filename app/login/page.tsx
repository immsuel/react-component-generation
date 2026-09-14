"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Lock, ShieldCheck, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const [passcode, setPasscode] = useState("")
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(false)

        const expectedPasscode = process.env.NEXT_PUBLIC_CRM_PASSCODE || "stellar2026"

        if (passcode.trim() === expectedPasscode) {
            sessionStorage.setItem("stellar_crm_auth", "true")
            router.push("/crm")
        } else {
            setTimeout(() => {
                setError(true)
                setLoading(false)
            }, 300)
        }
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/10 font-sans relative flex flex-col justify-between p-6 md:p-10 overflow-hidden">

            {/* ── Background Grid ─────────────────────────────────────────── */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '80px 80px',
                    maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 100%)'
                }}
            />

            {/* ── Ambient Glow ────────────────────────────────────────────── */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-500/5 blur-[160px] pointer-events-none rounded-full" />

            {/* ── Header ──────────────────────────────────────────────────── */}
            <header className="relative z-10 max-w-6xl w-full mx-auto flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-xs font-medium">Back to website</span>
                </Link>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Admin Portal</span>
                </div>
            </header>

            {/* ── Center Login Card ───────────────────────────────────────── */}
            <div className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
                <div className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative group transition-all duration-500 hover:border-white/20">

                    <div className="flex justify-between items-start mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                            Private Access
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2 leading-tight">
                            Sign In <br />
                            <span className="text-slate-500">to your CRM.</span>
                        </h1>
                        <p className="text-xs text-slate-400 leading-relaxed font-normal">
                            Enter your admin passcode to view and manage your client leads and pipeline.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-slate-400">
                                Passcode
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="password"
                                    placeholder="Enter passcode"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    autoFocus
                                    required
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2.5 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>Incorrect passcode. Please try again.</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-4 bg-white text-black hover:bg-slate-200 active:scale-95 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl"
                        >
                            {loading ? (
                                <span>Signing in...</span>
                            ) : (
                                <>
                                    <span>Log In</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <footer className="relative z-10 max-w-6xl w-full mx-auto pt-6 text-xs text-slate-600 flex justify-between items-center border-t border-white/5">
                <span>StellarCode Lead Management</span>
                <span>Authorized access only</span>
            </footer>
        </main>
    )
}