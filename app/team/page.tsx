"use client"

import { Github, Linkedin, Cpu, Globe, Zap, ShieldCheck, Box, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"

const team = [
  {
    name: "Immanuel Shipale",
    role: "Founder & Lead Architect",
    specialty: "Automation & Systems Engineering",
    tag: "FOUNDER",
    bio: "Immanuel designs custom software and automated workflows that eliminate repetitive manual work, helping businesses run faster and more efficiently.",
    social: { github: "#", linkedin: "#" }
  },
  {
    name: "Susmita Dey",
    role: "Lead Web Developer",
    specialty: "Web Applications & UI/UX",
    tag: "DEVELOPMENT",
    bio: "Susmita builds fast, responsive, and easy-to-use web applications, turning complex requirements into clean, polished digital experiences.",
    social: { github: "#", linkedin: "#" }
  },
  {
    name: "Michaela",
    role: "Head of Marketing & Sales",
    specialty: "Client Partnerships & Growth",
    tag: "GROWTH",
    bio: "Michaela leads marketing and client relationships, helping teams identify the right solutions for their bottlenecks and driving steady business growth.",
    social: { github: "#", linkedin: "#" }
  }
]

const principles = [
  {
    title: "Efficiency First",
    desc: "If a task is repetitive and time-consuming, we find a way to automate it so your team can focus on what matters.",
    icon: Zap
  },
  {
    title: "Clear & Transparent",
    desc: "No confusing black boxes. You'll always understand how your software works and why it was built that way.",
    icon: CheckCircle2
  },
  {
    title: "Built to Last",
    desc: "We write clean, reliable code with safeguards in place to keep your everyday operations running smoothly.",
    icon: ShieldCheck
  },
  {
    title: "Flexible & Scalable",
    desc: "Everything we build is modular, meaning your tools can easily adapt and expand as your business grows.",
    icon: Box
  },
]

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/10 pt-32 pb-20 px-6">

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[11px] uppercase tracking-wider font-semibold">Back to Home</span>
          </Link>
          <div className="hidden md:block text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            Our Team
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <div className="max-w-3xl mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-medium tracking-wide mb-6">
            <Cpu className="w-3.5 h-3.5" />
            Meet the Team
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
            Building software that helps <br />
            <span className="text-slate-500">your business scale.</span>
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed">
            We are a lean team of developers and problem-solvers. We replace tedious manual tasks with custom software and automation, helping your company do more with less friction.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mb-32">
          {team.map((member, i) => (
            <div
              key={i}
              className="group relative bg-[#050505] border border-white/5 rounded-3xl p-8 transition-all duration-300 hover:border-white/20 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-8">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${member.tag === 'FOUNDER'
                      ? 'text-blue-400 bg-blue-400/5 border-blue-400/20'
                      : member.tag === 'DEVELOPMENT'
                        ? 'text-purple-400 bg-purple-400/5 border-purple-400/20'
                        : 'text-emerald-400 bg-emerald-400/5 border-emerald-400/20'
                    }`}>
                    {member.tag}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold tracking-tight mb-1">{member.name}</h3>
                  <p className="text-slate-300 text-sm font-medium">{member.role}</p>
                  <p className="text-xs text-slate-500 mt-1">{member.specialty}</p>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                  {member.bio}
                </p>
              </div>

              <div className="flex gap-4 pt-6 border-t border-white/5">
                <Link href={member.social.github} aria-label="GitHub" className="text-slate-500 hover:text-white transition-colors">
                  <Github className="w-4 h-4" />
                </Link>
                <Link href={member.social.linkedin} aria-label="LinkedIn" className="text-slate-500 hover:text-white transition-colors">
                  <Linkedin className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* How We Work Section */}
        <section className="mb-32">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">How We Work</h2>
              <p className="text-slate-400 text-sm">The simple principles behind every project we build.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {principles.map((p, i) => (
              <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors">
                <p.icon className="w-5 h-5 text-slate-400 mb-4" />
                <h4 className="text-sm font-semibold tracking-wide mb-2">{p.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#080808] to-black border border-white/5 rounded-3xl p-10 md:p-16 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.08)_0%,transparent_50%)] pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto">
            <Globe className="w-10 h-10 text-slate-600 mx-auto mb-6" />
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to save time and scale your operations?
            </h2>
            <p className="text-slate-400 text-sm mb-8">
              We partner with businesses to automate manual workflows and create fast, modern software solutions.
            </p>

            <div className="flex items-center justify-center">
              <Link href="/#contact">
                <button className="px-7 py-3.5 bg-white text-black rounded-full text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all flex items-center gap-2">
                  Get in touch <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>

          <div className="mt-14 pt-8 border-t border-white/5 text-xs text-slate-600 flex flex-col md:flex-row justify-between items-center gap-2">
            <span>High reliability & uptime</span>
            <span>StellarCode Solutions</span>
          </div>
        </section>
      </div>
    </main>
  )
}