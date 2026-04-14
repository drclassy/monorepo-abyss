import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const ACTIVE_SUB_TASKS = [
  {
    taskId: "TASK-9821-A",
    status: "Processing",
    agent: "Claude 3.5",
    latency: "450ms",
    description: "Analyzing FHIR patient record for anomalies.",
  },
  {
    taskId: "TASK-9822-B",
    status: "Retrying",
    agent: "Vertex AI",
    latency: "1200ms",
    description: "Re-generating Bayesian inference due to low confidence.",
  },
  {
    taskId: "TASK-9823-C",
    status: "Pending",
    agent: "Gemini 1.5",
    latency: "0ms",
    description: "Waiting for token availability in academic domain.",
  },
] as const;

export function ActionsManagerQueue() {
  return (
    <Card className="h-full shadow-xs">
      <CardHeader>
        <CardTitle>Saga Task Queue</CardTitle>
        <CardDescription>Real-time orchestrator sub-tasks and compensation states.</CardDescription>
      </CardHeader>

      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex h-full flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Active Sagas" value="12" />
            <StatCard label="Task Velocity" value="45 ops/s" mono />
            <StatCard label="Compensations" value="2" />
            <StatCard label="Queue Depth" value="156" mono />
          </div>

          <div className="space-y-2 rounded-md border bg-muted/20 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">Saga Lifecycle Mix</p>
              <Badge variant="outline" className="h-5 px-2 text-[11px] tabular-nums">
                Active 128 tokens
              </Badge>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between rounded-md border bg-background/70 px-2.5 py-1.5">
                <span className="text-xs">Inference</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  8 tasks · 65% · 1.2k tokens
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border bg-background/70 px-2.5 py-1.5">
                <span className="text-xs">Validation</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  3 tasks · 25% · 450 tokens
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border bg-background/70 px-2.5 py-1.5">
                <span className="text-xs">Compensation</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  1 task · 10% · 120 tokens
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <p className="text-muted-foreground text-xs">Active Sub-Tasks</p>

            {ACTIVE_SUB_TASKS.map((item) => (
              <div key={`${item.status}-${item.taskId}`} className="space-y-1 rounded-md border px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm font-mono">{item.taskId}</span>
                  <Badge variant={item.status === 'Processing' ? 'default' : 'secondary'} className="h-5 px-2 text-[11px]">
                    {item.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  {item.agent} · {item.latency} latency
                </p>
                <p className="text-xs">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2">
            <span className="text-muted-foreground text-xs">Kafka Cluster Status</span>
            <span className="text-emerald-500 font-medium text-xs tabular-nums">Healthy</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border bg-muted/20 px-2.5 py-2">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className={mono ? "font-semibold text-base tabular-nums" : "font-semibold text-base"}>{value}</p>
    </div>
  );
}
