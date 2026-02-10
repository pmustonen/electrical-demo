import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { WaveformData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WaveformChartProps {
  waveformData: WaveformData;
}

type ViewMode = 'primary' | 'secondary' | 'both';

export function WaveformChart({ waveformData }: WaveformChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('both');

  const timeMs = waveformData.time.map(t => (t * 1000).toFixed(1));

  const getDatasets = () => {
    const datasets = [];
    
    if (viewMode === 'primary' || viewMode === 'both') {
      datasets.push(
        {
          label: 'V₁(t)',
          data: waveformData.v1,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 2.5,
          pointRadius: 0,
          yAxisID: 'y-voltage',
          tension: 0.4,
        },
        {
          label: 'I₁(t)',
          data: waveformData.i1,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2.5,
          pointRadius: 0,
          yAxisID: 'y-current',
          tension: 0.4,
        }
      );
    }
    
    if (viewMode === 'secondary' || viewMode === 'both') {
      datasets.push(
        {
          label: 'V₂(t)',
          data: waveformData.v2,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 2.5,
          pointRadius: 0,
          yAxisID: 'y-voltage',
          tension: 0.4,
          borderDash: viewMode === 'both' ? [5, 3] : undefined,
        },
        {
          label: 'I₂(t)',
          data: waveformData.i2,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2.5,
          pointRadius: 0,
          yAxisID: 'y-current',
          tension: 0.4,
          borderDash: viewMode === 'both' ? [5, 3] : undefined,
        }
      );
    }
    
    return datasets;
  };

  const data = {
    labels: timeMs,
    datasets: getDatasets(),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#e5e7eb',
          font: {
            size: 11,
            weight: 500 as const,
          },
          padding: 8,
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (ms)',
          color: '#9ca3af',
          font: {
            size: 11,
            weight: 600,
          },
        },
        ticks: {
          maxTicksLimit: 8,
          color: '#9ca3af',
          font: {
            size: 10,
          },
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      'y-voltage': {
        type: 'linear' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Voltage (V)',
          color: '#6366f1',
          font: {
            size: 11,
            weight: 600,
          },
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#6366f1',
          font: {
            size: 10,
          },
        },
      },
      'y-current': {
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Current (A)',
          color: '#10b981',
          font: {
            size: 11,
            weight: 600,
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          color: '#10b981',
          font: {
            size: 10,
          },
        },
      },
    },
  };

  return (
    <div className="glass-dark rounded-xl p-5 h-full flex flex-col shadow-2xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-white">Voltage & Current Waveforms</h2>
        
        <div className="flex gap-1 glass rounded-lg p-1">
          {(['primary', 'secondary', 'both'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200
                ${viewMode === mode 
                  ? 'bg-primary-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {mode === 'both' ? 'Both' : mode === 'primary' ? 'Primary' : 'Secondary'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Line data={data} options={options} />
      </div>

      <div className="mt-3 text-xs text-gray-400 text-center">
        {viewMode === 'both' && 'Solid lines: Primary • Dashed lines: Secondary'}
        {viewMode === 'primary' && 'Showing primary side waveforms'}
        {viewMode === 'secondary' && 'Showing secondary side waveforms'}
      </div>
    </div>
  );
}
