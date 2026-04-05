/**
 * PORTAL Sentra — PC Performance Charts (Row 2)
 * Four Chart.js line charts: CPU, Memory, Disk, Network I/O over time.
 * Architected and built by Claudesy.
 */

'use client'

import {
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { useEffect, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ============================================================================
// Chart.js Registration
// ============================================================================

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// ============================================================================
// Types
// ============================================================================

interface DataPoint {
  label: string
  cpu: number
  memory: number
  disk: number
  networkRx: number // KB/s
  networkTx: number // KB/s
}

const MAX_POINTS = 30
const POLL_INTERVAL_MS = 2000

// ============================================================================
// Dark Theme Defaults
// ============================================================================

const chartDefaults = {
  color: 'rgba(163, 163, 163, 0.8)',
  gridColor: 'rgba(64, 64, 64, 0.5)',
  font: { family: 'system-ui', size: 11 },
}

ChartJS.defaults.color = chartDefaults.color
ChartJS.defaults.font = chartDefaults.font

// ============================================================================
// PC Performance Charts Component
// ============================================================================

export function PcPerformanceCharts(): React.ReactElement {
  const [history, setHistory] = useState<DataPoint[]>([])
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const fetchMetrics = async (): Promise<void> => {
      try {
        const res = await fetch('/api/monitoring/metrics')
        const json = (await res.json()) as {
          success?: boolean
          data?: {
            system?: {
              metrics?: {
                cpu?: { usage?: number }
                memory?: { usage?: number }
                disk?: { usage?: number }
                network?: { rxPerSecond?: number; txPerSecond?: number }
              }
            }
          }
        }
        if (!mountedRef.current || !json.success || !json.data?.system?.metrics) return

        const m = json.data.system.metrics
        const cpu = m.cpu?.usage ?? 0
        const memory = m.memory?.usage ?? 0
        const disk = m.disk?.usage ?? 0
        const rx = (m.network?.rxPerSecond ?? 0) / 1024 // bytes -> KB/s
        const tx = (m.network?.txPerSecond ?? 0) / 1024
        const now = new Date()
        const label = now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })

        setHistory(prev => {
          const next = [...prev, { label, cpu, memory, disk, networkRx: rx, networkTx: tx }]
          return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next
        })
      } catch {
        // Silent fail for polling
      }
    }

    void fetchMetrics()
    const id = setInterval(fetchMetrics, POLL_INTERVAL_MS)
    return () => {
      mountedRef.current = false
      clearInterval(id)
    }
  }, [])

  const labels = history.length > 0 ? history.map(d => d.label) : ['—']

  const cpuChartData = {
    labels,
    datasets: [
      {
        label: 'CPU %',
        data: history.length > 0 ? history.map(d => d.cpu) : [0],
        borderColor: 'rgb(96, 165, 250)',
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  }

  const memoryChartData = {
    labels,
    datasets: [
      {
        label: 'Memory %',
        data: history.length > 0 ? history.map(d => d.memory) : [0],
        borderColor: 'rgb(74, 222, 128)',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  }

  const diskChartData = {
    labels,
    datasets: [
      {
        label: 'Disk %',
        data: history.length > 0 ? history.map(d => d.disk) : [0],
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  }

  const networkMax = Math.max(1, ...history.map(d => Math.max(d.networkRx, d.networkTx)))
  const networkChartData = {
    labels,
    datasets: [
      {
        label: 'RX (KB/s)',
        data: history.length > 0 ? history.map(d => d.networkRx) : [0],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'TX (KB/s)',
        data: history.length > 0 ? history.map(d => d.networkTx) : [0],
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  }

  const commonOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: {
        grid: { color: chartDefaults.gridColor },
        ticks: { maxTicksLimit: 8 },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: chartDefaults.gridColor },
        ticks: { stepSize: 20 },
      },
    },
  }

  const networkOptions: ChartOptions<'line'> = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      y: {
        min: 0,
        max: Math.ceil(networkMax * 1.2) || 100,
        grid: { color: chartDefaults.gridColor },
        ticks: { stepSize: Math.max(1, Math.ceil(networkMax / 5)) },
      },
    },
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-sentra-border-medium bg-surface-secondary/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-sentra-text-primary">
            CPU Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[220px]">
          <Line data={cpuChartData} options={commonOptions} />
        </CardContent>
      </Card>

      <Card className="border-sentra-border-medium bg-surface-secondary/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-sentra-text-primary">
            Memory Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[220px]">
          <Line data={memoryChartData} options={commonOptions} />
        </CardContent>
      </Card>

      <Card className="border-sentra-border-medium bg-surface-secondary/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-sentra-text-primary">
            Disk Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[220px]">
          <Line data={diskChartData} options={commonOptions} />
        </CardContent>
      </Card>

      <Card className="border-sentra-border-medium bg-surface-secondary/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-sentra-text-primary">
            Network I/O
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[220px]">
          <Line data={networkChartData} options={networkOptions} />
        </CardContent>
      </Card>
    </div>
  )
}
