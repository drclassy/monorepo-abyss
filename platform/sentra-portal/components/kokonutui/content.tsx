"use client"

import { Activity, Brain, Server, Zap, Database, Terminal, Heart, Cpu, BookOpen, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import EcosystemCharts from "./ecosystem-charts"

export default function Content() {
  const PANTONE_RED = "#EE2737"; // Pantone 18-1664 TCX

  // UNIFORMITY CONSTANTS (Single Source of Truth)
  const SECTION_TITLE = "text-[13px] font-medium text-zinc-500 mb-6 text-left flex items-center gap-2 uppercase tracking-[0.2em]";
  const ITEM_TITLE = "text-[15px] font-medium text-zinc-800 dark:text-zinc-300"; 
  const ITEM_SUBTITLE = "text-[13px] font-medium text-zinc-500";
  const ITEM_PANTONE = "text-[13px] font-medium"; 
  const BUTTON_TEXT = "text-[11px] font-medium uppercase tracking-widest";

  return (
    <div className="space-y-6 font-sans">
      {/* Row 1: Operational Status & Health Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pilar 1: Operational Status */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
          <h2 className={SECTION_TITLE}>
            <Server className="w-4 h-4" />
            Operational Status
          </h2>
          <div className="space-y-3">
             {[
               { id: "S1", name: "Sentra Main Cloud", status: "STABLE", activity: "1.2k req/m" },
               { id: "S2", name: "Referralink Gateway", status: "ACTIVE", activity: "450 req/m" },
               { id: "S3", name: "Aby Engine (Gemma 2)", status: "GOVERNING", activity: "Gemma 2 9B" },
               { id: "S4", name: "Orchestrator Saga Node", status: "STABLE", activity: "98.2% Sync" }
             ].map((item) => (
               <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                  <div className="text-left">
                    <h4 className={ITEM_TITLE}>{item.name}</h4>
                    <p className={ITEM_PANTONE} style={{ color: PANTONE_RED }}>{item.activity}</p>
                  </div>
                  <span className={cn(
                    BUTTON_TEXT,
                    "text-zinc-900 px-3 py-1 rounded-md bg-white border border-zinc-200",
                    "shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)]",
                    "dark:shadow-[2px_2px_5px_rgba(0,0,0,0.4),-1px_-1px_5px_rgba(255,255,255,0.05)]"
                  )}>
                    {item.status}
                  </span>
               </div>
             ))}
          </div>
        </div>

        {/* Pilar 2: Health Integration & API */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
          <h2 className={SECTION_TITLE}>
            <Activity className="w-4 h-4" />
            Health Integration & API
          </h2>
          <div className="grid grid-cols-1 gap-4">
             {[
               { api: "Vertex RAG API", latency: "142ms", throughput: "High" },
               { api: "FHIR Engine Gateway", latency: "28ms", throughput: "Stable" },
               { api: "Neon DB Connection", latency: "5ms", throughput: "Active" },
               { api: "Composio MCP", latency: "89ms", throughput: "Medium" }
             ].map((api, i) => (
               <div key={i} className="flex items-center justify-between p-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <div className="text-left">
                    <h4 className={ITEM_TITLE}>{api.api}</h4>
                    <p className={ITEM_PANTONE} style={{ color: PANTONE_RED }}>{api.latency}</p>
                  </div>
                  <div className={cn(ITEM_SUBTITLE, "font-bold uppercase tracking-widest")}>{api.throughput}</div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Row 2: Charts Pulse */}
      <EcosystemCharts />

      {/* Row 3: Knowledge Capacity */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
        <h2 className={SECTION_TITLE}>
          <Database className="w-4 h-4" />
          Knowledge Capacity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: "Internal Medicine", value: "13", sub: "Indexed Files", icon: BookOpen },
             { label: "Pediatrics / OBGYN", value: "12", sub: "Clinical Docs", icon: Zap },
             { label: "General Reference", value: "94", sub: "Library Growth", icon: Database },
             { label: "Total Library", value: "119", sub: "Active Memory", icon: Activity }
           ].map((stat, i) => (
             <div key={i} className="flex flex-col text-left p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800">
                <stat.icon className="w-3.5 h-3.5 text-zinc-400 mb-2" />
                <span className={cn(ITEM_SUBTITLE, "font-bold uppercase tracking-tighter")}>{stat.label}</span>
                <span className="text-[21px] font-bold text-zinc-900 dark:text-zinc-50 mt-1">{stat.value}</span>
                <p className={ITEM_PANTONE + " mt-0.5"} style={{ color: PANTONE_RED }}>{stat.sub}</p>
             </div>
           ))}
        </div>
      </div>

      {/* Row 4: Agent Activity */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
        <h2 className={SECTION_TITLE}>
          <Zap className="w-4 h-4" />
          Agent Activity
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className={cn(SECTION_TITLE, "pb-3 mb-0")}>Node</th>
                <th className={cn(SECTION_TITLE, "pb-3 mb-0")}>Task</th>
                <th className={cn(SECTION_TITLE, "pb-3 mb-0 text-center")}>Duration</th>
                <th className={cn(SECTION_TITLE, "pb-3 mb-0 text-right")}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
               {[
                 { node: "Aby (Gemma 2)", task: "Clinical Knowledge Governance", duration: "1.2s", status: "GOVERNING" },
                 { node: "Jen Governor", task: "Root Monorepo Cleanup & Integrity Scan", duration: "15m", status: "DONE" },
                 { node: "Vertex RAG", task: "Vectorizing Medical Guidelines", duration: "32m", status: "SYNCING" }
               ].map((log, i) => (
                 <tr key={i} className="group transition-all">
                    <td className={cn(ITEM_TITLE, "py-4")}>{log.node}</td>
                    <td className={cn(ITEM_SUBTITLE, "py-4")}>{log.task}</td>
                    <td className={cn(ITEM_PANTONE, "py-4 text-center font-bold")} style={{ color: PANTONE_RED }}>{log.duration}</td>
                    <td className="py-4 text-right">
                       <button className={cn(BUTTON_TEXT, "px-3 py-1 rounded bg-white dark:bg-zinc-200 text-zinc-900 font-bold shadow-[2px_2px_5px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-all font-sans")}>INTERVENE</button>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
