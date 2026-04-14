import { AbyssChat } from '@/components/flows/abyss-chat'
import { SagaVisualizer } from '@/components/flows/saga-visualizer'
import { ChartAreaInteractive } from './_components/chart-area-interactive'
import data from './_components/data.json'
import { ProposalSectionsTable } from './_components/governance-audit-log-table/table'
import { SectionCards } from './_components/section-cards'

export default function Page() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
        <p className="text-muted-foreground text-sm">
          System-wide overview of The Abyss monorepo and Sentra AI operations.
        </p>
      </div>

      <SectionCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartAreaInteractive />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Saga Monitoring</h3>
            <SagaVisualizer />
          </div>
        </div>
        <div className="space-y-6">
          <AbyssChat />
          <div className="rounded-[32px] bg-card p-6 border border-border/50 shadow-sm">
            <h3 className="font-semibold mb-4 text-sm">Orchestrator Status</h3>
            <div className="space-y-3">
              <StatusItem label="Saga Engine" status="Online" color="text-emerald-500" />
              <StatusItem label="Audit Logs" status="Syncing" color="text-primary" />
              <StatusItem label="Agents" status="8 Active" color="text-primary" />
              <StatusItem label="Governance" status="Enforced" color="text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Governance Audit Log</h3>
        <ProposalSectionsTable data={data} />
      </div>
    </div>
  )
}

function StatusItem({ label, status, color }: { label: string; status: string; color: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${color} font-medium font-mono uppercase tracking-wider`}>{status}</span>
    </div>
  )
}
