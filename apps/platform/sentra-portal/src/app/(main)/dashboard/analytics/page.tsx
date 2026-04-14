import { ActionsManagerQueue } from "./_components/analytics-actions-manager-queue";
import { ActionsRiskLedger } from "./_components/analytics-actions-risk-ledger";
import { DriversCoverageTriage } from "./_components/analytics-drivers-coverage-triage";
import { SagaVisualizer } from "@/components/flows/saga-visualizer";
import { AbyssChat } from "@/components/flows/abyss-chat";
import { AnalyticsOverview } from "./_components/analytics-overview";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <AnalyticsOverview />

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <SagaVisualizer />
          <AbyssChat />
          <DriversCoverageTriage />
        </div>
        <ActionsManagerQueue />
      </div>

      <ActionsRiskLedger />
    </div>
  );
}
