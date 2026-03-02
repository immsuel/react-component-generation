"use client"

import { 
  FileText, 
  Code2, 
  Database, 
  Cpu, 
  MessageSquare, 
  Calendar, 
  Clock, 
  CheckCircle2,
  Printer,
  Download,
  Lock,
  ArrowRight
} from "lucide-react"

export default function ProjectScope() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-black text-slate-300 font-sans selection:bg-white/10 selection:text-white pb-20 print:bg-white print:text-black">
      
      {/* 1. Formal Control Bar - Hidden on Print */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50 print:hidden">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-slate-500" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400">Restricted Access // Torque Driving Academy</span>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
          >
            <Printer className="w-3 h-3" />
            Save as PDF
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 pt-20">
        
        {/* 2. Formal Letterhead Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-24 border-l-2 border-white/20 pl-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter uppercase mb-4">
              Project Scope <br />
              <span className="text-slate-600 italic">Statement of Work</span>
            </h1>
            <p className="font-mono text-[11px] text-slate-500 uppercase tracking-widest">
              Document Ref: STR-TDA-2026-001 <br />
              Issue Date: March 02, 2026
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl min-w-[240px]">
            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500 mb-4 font-bold">Authorized Contractor</p>
            <p className="text-white font-bold tracking-tight text-lg">StellarCode LTD</p>
            <p className="text-slate-400 text-xs mt-1">Covent Garde, WC2H 9JQN</p>
          </div>
        </div>

        {/* 3. Executive Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 mb-20 overflow-hidden rounded-xl">
          <div className="bg-black p-8">
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">Project Classification</p>
            <p className="text-white font-medium">Autonomous Operations</p>
          </div>
          <div className="bg-black p-8">
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">Infrastructure Cost</p>
            <p className="text-white font-medium">R30,000.00 (ZAR)</p>
          </div>
          <div className="bg-black p-8">
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">Ongoing Maintenance</p>
            <p className="text-white font-medium">R3,000.00 / Month</p>
          </div>
        </div>

        {/* 4. Infrastructure Mapping Diagram (Text-based) */}
        
        
        {/* 5. Deployment Modules */}
        <div className="space-y-16">
          <SectionHeader title="01 // Communication Protocols" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="text-white font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" /> WhatsApp Inbound Hook
              </h4>
              <p className="text-sm leading-relaxed text-slate-400">
                The system will intercept all incoming WhatsApp Business communications. Using a keyword-based logic engine, it will differentiate between general inquiries and booking intent.
              </p>
              <ul className="space-y-3 font-mono text-[11px] text-slate-500">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-slate-700 rounded-full" /> 
                  KEYWORD_MAP: ["booking", "lessons", "price"]
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-slate-700 rounded-full" /> 
                  ACTION: TRIGGER_TEMPLATE_B1
                </li>
              </ul>
            </div>
            <div className="border-l border-white/5 pl-8 space-y-4">
               <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Logic Flow</h5>
               <p className="text-xs text-slate-500 italic">If Contact exists in Airtable (CRM) → Send "Welcome Back" notification.</p>
               <p className="text-xs text-slate-500 italic">If Contact is New → Register lead and redirect to booking terminal.</p>
            </div>
          </div>

          <SectionHeader title="02 // Data Synchronization" />
          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h4 className="text-white font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" /> Scheduling Logic
                </h4>
                <p className="text-sm text-slate-400">
                  Automated conversion of website booking arrays into Google Calendar events. Supports multi-session iteration (iterators handle multiple dates from a single checkout).
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-bold flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-500" /> Airtable Integration
                </h4>
                <p className="text-sm text-slate-400">
                  Primary Data Store. Automatic record creation in 'Students' and 'Lessons' tables with relational linking.
                </p>
              </div>
            </div>
          </div>

          <SectionHeader title="03 // Internal Reporting & Notifications" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="border border-white/5 p-8 rounded-2xl bg-black">
                <h5 className="text-white font-bold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" /> Instructor Briefing
                </h5>
                <p className="text-xs text-slate-500 leading-relaxed font-mono">
                  Daily 08:00 AM Aggregate Search <br />
                  Filter: Date = Today <br />
                  Output: Consolidated WhatsApp Briefing
                </p>
             </div>
             <div className="border border-white/5 p-8 rounded-2xl bg-black">
                <h5 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" /> Proactive Reminders
                </h5>
                <p className="text-xs text-slate-500 leading-relaxed font-mono">
                  Cycle: Every 60 Minutes <br />
                  Logic: StartTime - Now &lt;= 180min <br />
                  Action: Automated Student SMS/WhatsApp
                </p>
             </div>
          </div>
        </div>

        {/* 6. Signature Section */}
        <div className="mt-32 pt-20 border-t border-white/10 print:mt-10">
          <div className="grid grid-cols-2 gap-20">
            <div className="space-y-8">
              <div className="h-px bg-slate-800 w-full" />
              <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500">StellarCode Representative</p>
            </div>
            <div className="space-y-8">
              <div className="h-px bg-slate-800 w-full" />
              <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500">Torque Driving Academy Client</p>
            </div>
          </div>
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-2 text-slate-700 text-[10px] font-mono tracking-widest">
              <Lock className="w-3 h-3" />
              SECURE DOCUMENT // END OF SPECIFICATION
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .bg-black {
            background-color: white !important;
          }
          .text-white {
            color: black !important;
          }
          .text-slate-400, .text-slate-500 {
            color: #333 !important;
          }
          .border-white\/10, .border-white\/5 {
            border-color: #eee !important;
          }
          nav, button, header {
            display: none !important;
          }
          .print\:hidden {
            display: none !important;
          }
          .print\:bg-white {
            background-color: white !important;
          }
        }
      `}</style>
    </main>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <h3 className="text-xs uppercase font-black tracking-[0.5em] text-slate-500 whitespace-nowrap">
        {title}
      </h3>
      <div className="h-px bg-white/5 w-full" />
    </div>
  )
}