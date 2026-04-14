"use client";

import * as React from "react";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";

type LedgerPriority = "Escalate" | "Coach" | "Reforecast" | null;

type LedgerRow = {
  id: number;
  account: string;
  dealId: string;
  stage: string;
  blocker: string;
  owner: string;
  idleDays: number;
  closeVariance: string;
  priority: LedgerPriority;
  nextAction: string;
  riskScore: number;
};

const LEDGER_ROWS: LedgerRow[] = [
  {
    id: 1,
    account: "Sentra Health Core",
    dealId: "SAGA-9821",
    stage: "Inference",
    blocker: "Latency exceeded p95 threshold by 150ms",
    owner: "Claude 3.5",
    idleDays: 2,
    closeVariance: "150ms drift",
    priority: "Escalate",
    nextAction: "Re-route to secondary inference engine.",
    riskScore: 81,
  },
  {
    id: 2,
    account: "Abyss Foundation",
    dealId: "SAGA-9822",
    stage: "Validation",
    blocker: "FHIR schema mismatch in patient record",
    owner: "Vertex AI",
    idleDays: 1,
    closeVariance: "Critical Error",
    priority: "Coach",
    nextAction: "Manual schema alignment required.",
    riskScore: 76,
  },
  {
    id: 3,
    account: "Primary Healthcare",
    dealId: "SAGA-9823",
    stage: "Audit",
    blocker: "Audit log synchronization delayed",
    owner: "Gemini 1.5",
    idleDays: 3,
    closeVariance: "Sync lag",
    priority: "Coach",
    nextAction: "Verify Kafka cluster persistence.",
    riskScore: 75,
  },
  {
    id: 4,
    account: "Sentra Assist",
    dealId: "SAGA-9824",
    stage: "Inference",
    blocker: "Low confidence score (0.62)",
    owner: "Claude 3.5",
    idleDays: 1,
    closeVariance: "Confidence drop",
    priority: "Coach",
    nextAction: "Trigger Shadow Mode for parallel validation.",
    riskScore: 72,
  },
  {
    id: 5,
    account: "Academic Solutions",
    dealId: "SAGA-9825",
    stage: "Negotiation",
    blocker: "Token quota exceeded",
    owner: "GPT-4o",
    idleDays: 4,
    closeVariance: "Quota block",
    priority: "Coach",
    nextAction: "Increase tier-2 token limit.",
    riskScore: 69,
  },
];

const priorityTone: Record<Exclude<LedgerPriority, null>, string> = {
  Escalate: "border-destructive/35 bg-destructive/10 text-destructive",
  Coach: "border-primary/35 bg-primary/10 text-primary",
  Reforecast: "border-amber-500/35 bg-amber-500/10 text-amber-700",
};

const ledgerColumns: ColumnDef<LedgerRow>[] = [
  {
    accessorKey: "account",
    header: "Account",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <p className="font-medium text-sm">{row.original.account}</p>
        <p className="text-muted-foreground text-xs">
          {row.original.dealId} · {row.original.stage}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "blocker",
    header: "Blocker",
    cell: ({ row }) => <div className="max-w-44 text-xs">{row.original.blocker}</div>,
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => <span className="text-xs">{row.original.owner}</span>,
  },
  {
    accessorKey: "idleDays",
    header: "Idle (days)",
    cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.idleDays}d</span>,
  },
  {
    accessorKey: "closeVariance",
    header: "Close variance",
    cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.closeVariance}</span>,
  },
  {
    accessorKey: "nextAction",
    header: "Next action",
    cell: ({ row }) => (
      <div className="flex max-w-64 flex-col gap-1">
        {row.original.priority ? (
          <Badge variant="outline" className={cn("text-[10px] uppercase", priorityTone[row.original.priority])}>
            {row.original.priority}
          </Badge>
        ) : null}
        <p className="text-xs">{row.original.nextAction}</p>
      </div>
    ),
  },
  {
    accessorKey: "riskScore",
    header: ({ column }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="-mr-2 h-8 px-2 text-xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Risk Ladder
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Badge
          variant="outline"
          className={cn(
            "min-w-12 justify-center font-medium tabular-nums",
            row.original.riskScore >= 80 && "border-destructive/35 bg-destructive/10 text-destructive",
            row.original.riskScore >= 65 &&
              row.original.riskScore < 80 &&
              "border-amber-500/35 bg-amber-500/10 text-amber-700",
          )}
        >
          {row.original.riskScore}
        </Badge>
      </div>
    ),
  },
];

export function ActionsRiskLedger() {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "riskScore", desc: true }]);

  const table = useReactTable({
    data: LEDGER_ROWS,
    columns: ledgerColumns,
    getRowId: (row) => String(row.id),
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Abyss AI Audit Log</CardTitle>
        <CardDescription>Live execution logs with status, agent responsibility, and Saga actions.</CardDescription>
        <CardAction>
          <Badge variant="outline" className="font-medium tabular-nums">
            {LEDGER_ROWS.length} Active Sessions
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 text-sm sm:grid-cols-4 sm:divide-x sm:divide-border/60">
          <LedgerStat label="Failed Sessions" value="1" detail="Quality Score < 50%" />
          <LedgerStat label="Active Sagas" value="2" detail="Running now" />
          <LedgerStat label="Avg. Latency" value="412ms" detail="p95 global" />
          <LedgerStat
            label="Total AI Spend"
            value="$142.50"
            detail="Last 24 hours"
          />
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function LedgerStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="flex flex-col gap-1 px-0 sm:px-3 last:sm:pr-0 first:sm:pl-0">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-semibold text-base tabular-nums">{value}</p>
      <p className="text-muted-foreground text-xs">{detail}</p>
    </div>
  );
}
