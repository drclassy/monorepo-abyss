'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function MetricsCard({ title, value, description, icon: Icon, trend }: MetricsCardProps) {
  return (
    <Card className="bg-background/50 backdrop-blur-sm border-muted/50 hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
          {trend && (
            <span className={`ml-1 font-medium ${trend.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend.value}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
