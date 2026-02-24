"use client"

import { Github, Linkedin, Terminal, Cpu, Globe, Command, Zap, Binary, Box, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"

const team = [
  {
    name: "Immanuel Shipale",
    role: "Founder & Systems Architect",
    specialty: "Autonomous Logic & Automation Engineering",
    status: "SYSTEM_ROOT",
    bio: "Specializing in the orchestration of self-correcting business engines. Immanuel bridges the gap between complex operational friction and streamlined, autonomous software solutions.",
    social: { github: "#", linkedin: "#" }
  },
  {
    name: "Susmita Dey",
    role: "Lead Web Developer",
    specialty: "Interface Logic & Frontend Architecture",
    status: "INTERFACE_DEPLOYED",
    bio: "Expert in translating deep system logic into seamless, high-performance web environments. Susmita ensures that the complexity under the hood is matched by a world-class user experience.",
    social: { github: "#", linkedin: "#" }
  }
]

const protocols = [
  { title: "Efficiency First", desc: "If a task is repeated three times, it is a candidate for autonomous logic.", icon: Zap },
  { title: "Transparent Logic", desc: "We build 'white-box' systems—you always know why the engine made a decision.", icon: Binary },
  { title: "Resilient Deploys", desc: "Every automation is built with self-healing error handling as the baseline.", icon: ShieldCheck },
  { title: "Modular Growth", desc: "Systems are designed as swappable components, not rigid monoliths.", icon: Box },
]

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/10 pt-32 pb-20 px-6">

    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Back to Terminal</span>
          </Link>
          <div className="hidden md:block text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Team
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
            <Cpu className="w-3 h-3" />
            Core Intelligence Unit
          </div>
          
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-8 leading-[0.9]">
            The Architects <br />
            <span className="text-slate-500">of Deployed Logic.</span>
          </h1>
          
          <p className="text-xl text-gray-400 leading-relaxed">
            We are a lean collective of engineers dedicated to replacing manual overhead with autonomous software. Our mission is to build the engines that run your business while you sleep.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mb-40">
          {team.map((member, i) => (
            <div 
              key={i} 
              className="group relative bg-[#050505] border border-white/5 rounded-[2.5rem] p-8 transition-all duration-500 hover:border-white/20"
            >
              <div className="flex justify-between items-start mb-12">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Access Level //</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                    member.status === 'SYSTEM_ROOT' 
                    ? 'text-blue-400 bg-blue-400/5 border-blue-400/10' 
                    : 'text-purple-400 bg-purple-400/5 border-purple-400/10'
                  }`}>
                    {member.status}
                  </span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl group-hover:bg-white/5 transition-colors">
                  <Command className="w-5 h-5 text-slate-500" />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold tracking-tight mb-1">{member.name}</h3>
                <p className="text-slate-400 text-sm font-medium">{member.role}</p>
                <p className="text-[10px] font-mono text-slate-600 mt-2 uppercase tracking-tighter">{member.specialty}</p>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed mb-8 font-normal">
                {member.bio}
              </p>

              <div className="flex gap-4 pt-6 border-t border-white/5">
                <Link href={member.social.github} className="text-slate-600 hover:text-white transition-colors">
                  <Github className="w-4 h-4" />
                </Link>
                <Link href={member.social.linkedin} className="text-slate-600 hover:text-white transition-colors">
                  <Linkedin className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Our Operating System (Protocols) */}
        <section className="mb-40">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <h2 className="text-3xl font-bold tracking-tighter uppercase">Our Operating <span className="text-slate-500">System.</span></h2>
            <p className="text-slate-500 text-sm max-w-sm">The core principles governing every line of code we deploy and every system we architect.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {protocols.map((p, i) => (
              <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-colors group">
                <p.icon className="w-5 h-5 text-slate-600 mb-6 group-hover:text-white transition-colors" />
                <h4 className="text-sm font-bold uppercase tracking-widest mb-3">{p.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Join the Architecture (Enhanced CTA) */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#080808] to-black border border-white/5 rounded-[3rem] p-12 md:p-20 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.08)_0%,transparent_50%)] pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
                <Globe className="w-12 h-12 text-slate-800 mx-auto mb-8" />
                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6 italic">
                    Ready to scale without <br /> adding more human hours?
                </h2>
                <p className="text-slate-500 text-sm mb-12 max-w-md mx-auto">
                    We are currently accepting high-impact projects for Q2 2026. Join the architecture of the future.
                </p>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <Link href="/#contact">
                        <button className="px-8 py-4 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
                            Let's get in contact <ArrowRight className="w-3 h-3" />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Live Terminal Log Mockup */}
            <div className="mt-20 pt-10 border-t border-white/5 font-mono text-[10px] text-slate-700 flex flex-col md:flex-row justify-between gap-4 opacity-40">
                <div className="flex gap-4">
                    <span>UPTIME: 99.99%</span>
                    <span>LATENCY: 12ms</span>
                    <span>ACTIVE_DEPLOYS: 14</span>
                </div>
                <div className="uppercase tracking-[0.2em]">
                    Build: v4.0.2 // StellarCode
                </div>
            </div>
        </section>
      </div>
    </main>
  )
}