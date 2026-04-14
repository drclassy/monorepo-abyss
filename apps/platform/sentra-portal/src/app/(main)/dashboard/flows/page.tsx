'use client';

import { useState, useEffect } from 'react';
import { MetricsCard } from '@/components/flows/metrics-card';
import { LiveExecutionFeed } from '@/components/flows/live-feed';
import { SagaVisualizer } from '@/components/flows/saga-visualizer';
import { AbyssChat } from '@/components/flows/abyss-chat';
import { Activity, DollarSign, Zap, CheckCircle, BrainCircuit } from 'lucide-react';

export default function FlowsPage() {
  const [executions, setExecutions] = useState<any[]>([]);

  useEffect(() => {
    // Simulated live feed
    setExecutions([
      { id: '1', flowId: 'fhir-validator-v1', status: 'completed', latency: '450ms', timestamp: '2s ago' },
      { id: '2', flowId: 'shadow-diagnosa', status: 'running', latency: '820ms', timestamp: 'Just now' },
      { id: '3', flowId: 'academic-grader', status: 'failed', latency: '1200ms', timestamp: '5s ago' },
      { id: '4', flowId: 'referral-router', status: 'compensating', latency: '310ms', timestamp: '10s ago' },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
          <BrainCircuit className="text-primary" size={32} />
          AI Flow Orchestration
        </h1>
        <p className="text-muted-foreground text-sm">
          Real-time monitoring of The Abyss autonomous agents and Saga execution engine.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard 
          title="Total Executions" 
          value="12,450" 
          description="Last 24 hours" 
          icon={Activity} 
          trend={{ value: "+12%", positive: true }} 
        />
        <MetricsCard 
          title="Success Rate" 
          value="98.2%" 
          description="Current stability" 
          icon={CheckCircle} 
        />
        <MetricsCard 
          title="Avg. Latency" 
          value="412ms" 
          description="Global p95" 
          icon={Zap} 
          trend={{ value: "-5%", positive: true }} 
        />
        <MetricsCard 
          title="Daily Cost" 
          value="$142.50" 
          description="Estimated consumption" 
          icon={DollarSign} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SagaVisualizer />
          <LiveExecutionFeed executions={executions} />
        </div>
        <div className="space-y-6">
          <AbyssChat />
          <div className="bg-background/50 backdrop-blur-sm rounded-[32px] border border-white/5 p-6 shadow-[20px_20px_60px_#050505,-20px_-20px_60px_#121212]">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
              System Health
            </h3>
            <div className="space-y-4">
              <HealthItem label="Saga Engine" status="Operational" />
              <HealthItem label="Kafka Cluster" status="Healthy" />
              <HealthItem label="Orchestrator API" status="99.9% Uptime" />
              <HealthItem label="Shadow Mode" status="Active" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-[#00D1FF] font-medium font-mono text-xs uppercase tracking-wider">{status}</span>
    </div>
  );
}
