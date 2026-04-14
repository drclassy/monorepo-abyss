import { BrainCircuit, ShieldCheck, Zap, Database } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Saga Velocity</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums text-primary">45 ops/s</CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-primary/20 text-primary">
              <Zap className="size-3 fill-primary" />
              Optimal
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Real-time Saga throughput
          </div>
          <div className="text-muted-foreground">Kafka cluster: Healthy</div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Global Token Usage</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">1.2M</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Database className="size-3" />
              Quota: 75%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Daily context consumption
          </div>
          <div className="text-muted-foreground">Shadow mode active</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Audit Compliance</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums text-emerald-500">100%</CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-emerald-500/20 text-emerald-500">
              <ShieldCheck className="size-3 fill-emerald-500" />
              Verified
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Governance law enforced
          </div>
          <div className="text-muted-foreground">No violations detected</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Agent Confidence</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">0.94</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <BrainCircuit className="size-3" />
              High
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Mean reasoning accuracy
          </div>
          <div className="text-muted-foreground">Based on p95 benchmarks</div>
        </CardFooter>
      </Card>
    </div>
  );
}
