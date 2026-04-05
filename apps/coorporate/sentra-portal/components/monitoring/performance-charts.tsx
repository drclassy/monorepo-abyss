'use client'

import { Activity, AlertTriangle, CheckCircle, Clock, TrendingDown, TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PerformanceData {
  timestamp: string
  responseTime: number
  errorRate: number
  throughput: number
  cpuUsage: number
  memoryUsage: number
}

interface PerformanceChartsProps {
  data: PerformanceData[]
  timeframe: '1h' | '24h' | '7d' | '30d'
  onTimeframeChange?: (timeframe: '1h' | '24h' | '30d') => void
  loading?: boolean
}

export function PerformanceCharts({
  data,
  timeframe,
  onTimeframeChange,
  loading,
}: PerformanceChartsProps) {
  const timeframeOptions = [
    { label: '1H', value: '1h' as const },
    { label: '24H', value: '24h' as const },
    { label: '30D', value: '30d' as const },
  ]

  // Calculate summary metrics
  const latest = data[data.length - 1]
  const previous = data[data.length - 2]

  const responseTimeChange = previous
    ? ((latest.responseTime - previous.responseTime) / previous.responseTime) * 100
    : 0
  const errorRateChange = previous
    ? ((latest.errorRate - previous.errorRate) / (previous.errorRate || 1)) * 100
    : 0
  const throughputChange = previous
    ? ((latest.throughput - previous.throughput) / previous.throughput) * 100
    : 0

  // Health status based on metrics
  const getHealthStatus = () => {
    if (latest.errorRate > 5 || latest.responseTime > 2000) return 'error'
    if (latest.errorRate > 1 || latest.responseTime > 1000) return 'warning'
    return 'healthy'
  }

  const healthStatus = getHealthStatus()

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    switch (timeframe) {
      case '1h':
        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      case '24h':
        return date.toLocaleTimeString([], { hour: '2-digit' })
      case '7d':
      case '30d':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      default:
        return timestamp
    }
  }

  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'responseTime':
        return [`${value}ms`, 'Response Time']
      case 'errorRate':
        return [`${value.toFixed(2)}/min`, 'Error Rate']
      case 'throughput':
        return [`${value}/min`, 'Throughput']
      case 'cpuUsage':
        return [`${value.toFixed(1)}%`, 'CPU Usage']
      case 'memoryUsage':
        return [`${value.toFixed(1)}%`, 'Memory Usage']
      default:
        return [value, name]
    }
  }

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <Card className="bg-surface-secondary border-sentra-border-medium shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-sentra-text-secondary flex items-center gap-2">
              <Activity className="h-4 w-4 text-sentra-text-muted" />
              Performance Overview
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                className={`font-medium ${
                  healthStatus === 'healthy'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : healthStatus === 'warning'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                }`}
              >
                {healthStatus === 'healthy' && <CheckCircle className="h-3 w-3 mr-1" />}
                {healthStatus === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {healthStatus === 'error' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
              </Badge>
              <div className="flex gap-1">
                {timeframeOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={timeframe === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onTimeframeChange?.(option.value)}
                    className={`px-3 py-1 h-7 text-xs ${
                      timeframe === option.value
                        ? 'bg-surface-elevated text-sentra-text-primary border-sentra-border-strong'
                        : 'border-sentra-border-strong text-sentra-text-secondary hover:bg-surface-hover hover:text-sentra-text-primary'
                    }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Response Time */}
            <div className="p-4 bg-surface-primary rounded-lg border border-sentra-border-medium">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-sentra-text-muted">Response Time</span>
                <div
                  className={`flex items-center gap-1 text-xs ${
                    responseTimeChange > 0 ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {responseTimeChange > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(responseTimeChange).toFixed(1)}%
                </div>
              </div>
              <div className="text-2xl font-semibold text-sentra-text-primary">
                {latest?.responseTime || 0}ms
              </div>
              <div className="text-xs text-sentra-text-muted mt-1">Target: &lt;1000ms</div>
            </div>

            {/* Error Rate */}
            <div className="p-4 bg-surface-primary rounded-lg border border-sentra-border-medium">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-sentra-text-muted">Error Rate</span>
                <div
                  className={`flex items-center gap-1 text-xs ${
                    errorRateChange > 0 ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {errorRateChange > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(errorRateChange).toFixed(1)}%
                </div>
              </div>
              <div className="text-2xl font-semibold text-sentra-text-primary">
                {latest?.errorRate.toFixed(2) || 0}/min
              </div>
              <div className="text-xs text-sentra-text-muted mt-1">Target: &lt;1/min</div>
            </div>

            {/* Throughput */}
            <div className="p-4 bg-surface-primary rounded-lg border border-sentra-border-medium">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-sentra-text-muted">Throughput</span>
                <div
                  className={`flex items-center gap-1 text-xs ${
                    throughputChange > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {throughputChange > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(throughputChange).toFixed(1)}%
                </div>
              </div>
              <div className="text-2xl font-semibold text-sentra-text-primary">
                {latest?.throughput || 0}/min
              </div>
              <div className="text-xs text-sentra-text-muted mt-1">Requests per minute</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Response Time Chart */}
        <Card className="bg-surface-secondary border-sentra-border-medium shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-sentra-text-secondary">
              Response Time Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sentra-border-strong"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis
                      dataKey="timestamp"
                      stroke="#525252"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={formatTimestamp}
                    />
                    <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        border: '1px solid #262626',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#a3a3a3',
                      }}
                      formatter={formatTooltipValue}
                      labelFormatter={label => formatTimestamp(label)}
                    />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#737373"
                      strokeWidth={2}
                      dot={{ fill: '#737373', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#737373', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Rate Chart */}
        <Card className="bg-surface-secondary border-sentra-border-medium shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-sentra-text-secondary">
              Error Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sentra-border-strong"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis
                      dataKey="timestamp"
                      stroke="#525252"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={formatTimestamp}
                    />
                    <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        border: '1px solid #262626',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#a3a3a3',
                      }}
                      formatter={formatTooltipValue}
                      labelFormatter={label => formatTimestamp(label)}
                    />
                    <Area
                      type="monotone"
                      dataKey="errorRate"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#errorGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Resources Chart */}
      <Card className="bg-surface-secondary border-sentra-border-medium shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-sentra-text-secondary">
            System Resource Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sentra-border-strong"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#525252"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatTimestamp}
                  />
                  <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171717',
                      border: '1px solid #262626',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#a3a3a3',
                    }}
                    formatter={formatTooltipValue}
                    labelFormatter={label => formatTimestamp(label)}
                  />
                  <Bar dataKey="cpuUsage" fill="#3b82f6" name="CPU Usage" />
                  <Bar dataKey="memoryUsage" fill="#10b981" name="Memory Usage" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
