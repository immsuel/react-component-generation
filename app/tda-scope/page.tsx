"use client"

import { 
  FileText, 
  Code2, 
  Database, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Printer,
  Lock,
  ChevronRight
} from "lucide-react"

export default function ProjectScope() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-black text-slate-300 font-sans selection:bg-white/10 selection:text-white pb-10 print:bg-white print:text-black">
      
      {/* 1. Formal Control Bar - Optimized for Mobile */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50 print:hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em] font-bold text-slate-400 truncate max-w-[150px] md:max-w-none">
              Restricted // Torque Academy
            </span>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            <Printer className="w-3 h-3" />
            <span className="hidden xs:inline">Save PDF</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-12 md:pt-20">
        
        {/* 2. Formal Letterhead - Stacked on Mobile */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8 mb-16 border-l-2 border-white/20 pl-4 md:pl-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-6xl font-bold text-white tracking-tighter uppercase leading-none">
              Project Scope <br />
              <span className="text-slate-600 italic font-normal">Statement of Work</span>
            </h1>
            <p className="font-mono text-[9px] md:text-[11px] text-slate-500 uppercase tracking-widest">
              Ref: STR-TDA-2026-001 | Issued: March 02, 2026
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 p-4 md:p-6 rounded-xl w-full md:w-auto md:min-w-[240px]">
            <p className="text-[8px] uppercase tracking-[0.3em] text-slate-500 mb-2 font-bold">Authorized Contractor</p>
            <p className="text-white font-bold tracking-tight text-base md:text-lg">StellarCode LTD</p>
            <p className="text-slate-400 text-[10px] mt-1">Covent Garden, WC2H 9JQ</p>
          </div>
        </div>

        {/* 3. Executive Summary - Grid optimized for small screens */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 border border-white/10 mb-16 overflow-hidden rounded-xl">
          {[
            { label: "Classification", value: "Autonomous Ops" },
            { label: "Dev Cost", value: "R50,000.00" },
            { label: "Retainer", value: "R5,000.00/mo" }
          ].map((item, i) => (
            <div key={i} className="bg-black p-5 md:p-8">
              <p className="text-[8px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">{item.label}</p>
              <p className="text-white font-medium text-sm md:text-base">{item.value}</p>
            </div>
          ))}
        </div>

        {/* 4. Deployment Modules */}
        <div className="space-y-12 md:space-y-20">
          
          {/* Module 1 */}
          <section>
            <SectionHeader title="01 // Communication" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-4">
                <h4 className="text-white font-bold flex items-center gap-2 text-sm md:text-base">
                  <MessageSquare className="w-4 h-4 text-slate-500" /> WhatsApp Inbound Hook
                </h4>
                <p className="text-xs md:text-sm leading-relaxed text-slate-400">
                  Intercepts incoming communications. Uses keyword logic to route inquiries vs. booking intent.
                </p>
                <div className="flex flex-col gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-lg font-mono text-[10px] text-slate-500">
                   <span className="text-slate-400"># KEYWORDS</span>
                   <span>"booking", "lessons", "price", "manual"</span>
                </div>
              </div>
              <div className="space-y-3 border-l border-white/5 pl-6">
                 <h5 className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Logic Flow</h5>
                 <p className="text-[11px] text-slate-400 flex items-start gap-2">
                   <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                   If Contact exists: Welcome Back routing.
                 </p>
                 <p className="text-[11px] text-slate-400 flex items-start gap-2">
                   <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                   If Contact is New: Register Lead + Template Redirect.
                 </p>
              </div>
            </div>
          </section>

          {/* Module 2 */}
          <section>
            <SectionHeader title="02 // Automation" />
            <div className="p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-500" /> Scheduling Logic
                  </h4>
                  <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed">
                    Iterative Google Calendar sync. Handles multi-session arrays from web checkout to distinct calendar events.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                    <Database className="w-4 h-4 text-slate-500" /> Database Sync
                  </h4>
                  <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed">
                    Airtable student/lesson cross-linking. Ensures zero-duplicate lead generation.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Module 3 & 4 Grid */}
          <section>
            <SectionHeader title="03 // Reminders" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="border border-white/10 p-6 rounded-xl bg-black/40">
                  <h5 className="text-white font-bold mb-2 flex items-center gap-2 text-xs">
                    <FileText className="w-3.5 h-3.5 text-slate-500" /> Daily Briefing
                  </h5>
                  <p className="text-[10px] text-slate-500 font-mono">Run 08:00 AM // Consolidated WhatsApp Brief</p>
               </div>
               <div className="border border-white/10 p-6 rounded-xl bg-black/40">
                  <h5 className="text-white font-bold mb-2 flex items-center gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-500" /> Reminders
                  </h5>
                  <p className="text-[10px] text-slate-500 font-mono">T-180min Logic // Student & Instructor SMS</p>
               </div>
            </div>
          </section>
        </div>

        {/* 5. Signature Section - Stacked for Mobile */}
        <div className="mt-20 md:mt-32 pt-10 md:pt-20 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
            <div className="space-y-4">
              <div className="h-px bg-slate-800 w-full" />
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-500 text-center md:text-left">StellarCode Representative</p>
            </div>
            <div className="space-y-4">
              <div className="h-px bg-slate-800 w-full" />
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-500 text-center md:text-left">Client Representative</p>
            </div>
          </div>
          <div className="mt-16 md:mt-24 text-center">
            <div className="inline-flex items-center gap-2 text-slate-700 text-[9px] font-mono tracking-widest bg-white/[0.02] px-4 py-2 rounded-full border border-white/5">
              <Lock className="w-3 h-3" />
              SECURE DOCUMENT // END OF SPEC
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background-color: white !important; color: black !important; padding-bottom: 0 !important; }
          .bg-black, .bg-black\/80, .bg-black\/40 { background-color: white !important; }
          .text-white, .text-slate-300, .text-slate-400, .text-slate-500 { color: black !important; }
          .border-white\/10, .border-white\/5, .border-white\/20 { border-color: #ddd !important; border-width: 1px !important; }
          .print\:hidden, nav, button, .sticky { display: none !important; }
          .max-w-5xl { max-width: 100% !important; margin: 0 !important; padding: 20px !important; }
        }
      `}</style>
    </main>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 md:gap-4 mb-8">
      <h3 className="text-[9px] md:text-xs uppercase font-black tracking-[0.3em] md:tracking-[0.5em] text-slate-500 whitespace-nowrap">
        {title}
      </h3>
      <div className="h-px bg-white/5 w-full" />
    </div>
  )
}