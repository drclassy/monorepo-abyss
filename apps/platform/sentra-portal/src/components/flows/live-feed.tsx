'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Activity, Clock } from 'lucide-react';

interface Execution {
  id: string;
  flowId: string;
  status: 'completed' | 'failed' | 'running' | 'compensating';
  latency: string;
  timestamp: string;
}

export function LiveExecutionFeed({ executions }: { executions: Execution[] }) {
  return (
    <div className="rounded-xl border border-muted/50 bg-background/50 backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-muted/50 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary animate-pulse" />
          Live Audit Trail
        </h3>
        <Badge variant="outline" className="text-xs font-mono">
          REAL-TIME
        </Badge>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="divide-y divide-muted/30">
          {executions.map((exe) => (
            <div key={exe.id} className="p-4 hover:bg-muted/10 transition-colors flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium font-mono">{exe.flowId}</span>
                  <Badge 
                    variant={
                      exe.status === 'completed' ? 'secondary' : 
                      exe.status === 'failed' ? 'destructive' : 'default'
                    }
                    className="h-5 px-1.5 text-[10px] uppercase"
                  >
                    {exe.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {exe.latency}
                  </span>
                  <span>{exe.timestamp}</span>
                </div>
              </div>
              <div>
                {exe.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : exe.status === 'failed' ? (
                  <XCircle className="h-5 w-5 text-rose-500" />
                ) : (
                  <Activity className="h-5 w-5 text-blue-500 animate-spin-slow" />
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
