"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const sharedOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#71717a', font: { size: 10, family: "'Inter', sans-serif" } }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#71717a', font: { size: 10, family: "'Inter', sans-serif" } }
    },
  },
};

const labels = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

// PANTONE 18-1664 TCX - Fiery Red
const apiData = {
  labels,
  datasets: [
    {
      fill: true,
      label: 'API Pulse',
      data: [120, 135, 110, 145, 95, 105, 130],
      borderColor: '#EE2737', // Pantone Red
      backgroundColor: 'rgba(238, 39, 55, 0.08)',
      tension: 0.45,
      pointRadius: 0,
      borderWidth: 2,
    }
  ],
};

// PANTONE 2251 C - Vitality Green
const knowledgeData = {
  labels,
  datasets: [
    {
      fill: true,
      label: 'Knowledge Ingestion',
      data: [10, 25, 45, 60, 85, 90, 119],
      borderColor: '#00AB84', // Pantone Green
      backgroundColor: 'rgba(0, 171, 132, 0.08)',
      tension: 0.45,
      pointRadius: 0,
      borderWidth: 2,
    }
  ],
};

export default function EcosystemCharts() {
  const SECTION_TITLE = "text-[13px] font-medium text-zinc-500 mb-6 text-left flex items-center gap-2 uppercase tracking-[0.25em]";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
      {/* Chart 1: PANTONE Red */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
        <div className="flex items-center justify-between mb-6">
            <h3 className={SECTION_TITLE}>Network Latency Pulse</h3>
            <span className="text-[9px] font-mono text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-rose-500/20">PANTONE 18-1664</span>
        </div>
        <div className="h-[180px] w-full">
          <Line options={sharedOptions} data={apiData} />
        </div>
      </div>

      {/* Chart 2: PANTONE Green */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
        <div className="flex items-center justify-between mb-6">
            <h3 className={SECTION_TITLE}>Knowledge Accumulation</h3>
            <span className="text-[9px] font-mono text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-emerald-500/20">PANTONE 2251 C</span>
        </div>
        <div className="h-[180px] w-full">
          <Line options={sharedOptions} data={knowledgeData} />
        </div>
      </div>
    </div>
  );
}
