import { Activity, Brain, Server, ShieldCheck, Zap, UserCheck } from "lucide-react"

import Layout from "./layout"
import EcosystemList from "./ecosystem-list"

export default function DashboardEcosystem() {
  return (
    <Layout>
      <div className="space-y-4">
        {/* Row 1: High-Level Agents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border-2 border-purple-500/20 dark:border-purple-500/30">
             <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-purple-500" />
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Kate AI (Executive)</h3>
             </div>
             <p className="text-2xl font-bold mt-2 text-purple-500 uppercase tracking-tight">Deploying v1.4</p>
          </div>
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
             <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Aby Status (Clinical)</h3>
             </div>
             <p className="text-2xl font-bold mt-2 text-emerald-500 uppercase tracking-tight">Vigilant</p>
          </div>
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
             <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Governor Mode</h3>
             </div>
             <p className="text-2xl font-bold mt-2 text-blue-500 uppercase tracking-tight">System Guarded</p>
          </div>
        </div>

        {/* Row 2: Capabilities & Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2 ">
              <Server className="w-4 h-4 text-blue-600" />
              Division Hierarchy
            </h2>
            <EcosystemList />
          </div>

          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
             <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2 ">
              <Zap className="w-4 h-4 text-amber-600" />
              Kate AI Skillset (Hermes Framework)
            </h2>
            <div className="space-y-4">
               {[
                 { skill: "KPI Brief", status: "ACTIVE", type: "Autonomous" },
                 { skill: "Task Orchestrator", status: "SYNCED", type: "Linear" },
                 { skill: "Intel Monitor", status: "SCANNING", type: "Drive/Notion" },
                 { skill: "Doc Synthesis", status: "READY", type: "Medical Library" },
                 { skill: "Meeting Prep", status: "PENDING", type: "CEO Schedule" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.skill}</span>
                        <span className="text-[10px] text-zinc-500">{item.type}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-widest ${
                        item.status === 'ACTIVE' || item.status === 'READY' || item.status === 'SYNCED' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>{item.status}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
