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
  Filler,
} from 'chart.js';
import type { PowerCalculationData, TransformerSide } from '../types';

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

interface PowerCalculationProps {
  powerCalcData: PowerCalculationData;
  side: TransformerSide;
  onSideChange: (side: TransformerSide) => void;
}

export function PowerCalculation({ 
  powerCalcData, 
  side, 
  onSideChange 
}: PowerCalculationProps) {
  const [showReferenceLinesState, setShowReferenceLinesState] = useState({
    P: true,
    Q: false,
    S: false,
  });

  const timeMs = powerCalcData.time.map(t => (t * 1000).toFixed(1));

  // Helper to create constant reference lines
  const createReferenceLine = (value: number) => 
    Array(powerCalcData.time.length).fill(value);

  const powerData = {
    labels: timeMs,
    datasets: [
      {
        label: 'p(t) = v(t) × i(t)',
        data: powerCalcData.powerInstantaneous,
        borderColor: '#10b981',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { chartArea } = chart;
          if (!chartArea) return 'rgba(16, 185, 129, 0.3)';
          
          const value = context.parsed?.y ?? 0;
          return value >= 0 
            ? 'rgba(16, 185, 129, 0.3)'
            : 'rgba(245, 158, 11, 0.3)';
        },
        borderWidth: 2.5,
        pointRadius: 0,
        fill: 'origin',
        tension: 0.4,
        segment: {
          backgroundColor: (ctx: any) => {
            const value = ctx.p1.parsed.y;
            return value >= 0 
              ? 'rgba(16, 185, 129, 0.3)'
              : 'rgba(245, 158, 11, 0.3)';
          },
        },
      },
      // Add magnetizing power overlay (only for primary side)
      ...(side === 'primary' && powerCalcData.powerMagnetizing ? [{
        label: 'p_mag(t) = v(t) × i_mag(t)',
        data: powerCalcData.powerMagnetizing,
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        tension: 0.4,
      }] : []),
      // Add reference lines for P, Q, S
      ...(showReferenceLinesState.P ? [{
        label: 'P (Active Power)',
        data: createReferenceLine(powerCalcData.powerActive),
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderDash: [8, 4],
        pointRadius: 0,
        fill: false,
        tension: 0,
      }] : []),
      ...(showReferenceLinesState.Q ? [{
        label: 'Q (Reactive Power)',
        data: createReferenceLine(powerCalcData.powerReactive),
        borderColor: '#6366f1',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderDash: [8, 4],
        pointRadius: 0,
        fill: false,
        tension: 0,
      }] : []),
      ...(showReferenceLinesState.S ? [{
        label: 'S (Apparent Power)',
        data: createReferenceLine(powerCalcData.powerApparent),
        borderColor: '#8b5cf6',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderDash: [8, 4],
        pointRadius: 0,
        fill: false,
        tension: 0,
      }] : []),
    ],
  };

  const powerOptions = {
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
      y: {
        title: {
          display: true,
          text: 'Instantaneous Power (W)',
          color: '#9ca3af',
          font: {
            size: 11,
            weight: 600,
          },
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
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
        <h2 className="text-base font-bold text-white">
          Power Calculation
        </h2>
        
        <div className="flex items-center gap-2">
          {/* Reference Line Toggles */}
          <div className="flex gap-1">
            <button
              onClick={() => setShowReferenceLinesState(prev => ({ ...prev, P: !prev.P }))}
              className={`px-2 py-1 glass rounded transition-colors text-xs font-medium
                ${showReferenceLinesState.P 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              title="Toggle active power reference line"
            >
              P
            </button>
            <button
              onClick={() => setShowReferenceLinesState(prev => ({ ...prev, Q: !prev.Q }))}
              className={`px-2 py-1 glass rounded transition-colors text-xs font-medium
                ${showReferenceLinesState.Q 
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              title="Toggle reactive power reference line"
            >
              Q
            </button>
            <button
              onClick={() => setShowReferenceLinesState(prev => ({ ...prev, S: !prev.S }))}
              className={`px-2 py-1 glass rounded transition-colors text-xs font-medium
                ${showReferenceLinesState.S 
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              title="Toggle apparent power reference line"
            >
              S
            </button>
          </div>

          {/* Side Selector */}
          <div className="flex gap-1 glass rounded-lg p-1">
            <button
              onClick={() => onSideChange('primary')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200
                ${side === 'primary'
                  ? 'bg-primary-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              Primary
            </button>
            <button
              onClick={() => onSideChange('secondary')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200
                ${side === 'secondary'
                  ? 'bg-primary-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              Secondary
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Line data={powerData} options={powerOptions} />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <div className="metric-card">
          <div className="text-xs text-gray-400">P</div>
          <div className="text-base font-bold text-accent-emerald tabular-nums">
            {powerCalcData.powerActive.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">W</div>
        </div>
        <div className="metric-card">
          <div className="text-xs text-gray-400">Q</div>
          <div className="text-base font-bold text-primary-400 tabular-nums">
            {powerCalcData.powerReactive.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">VAR</div>
        </div>
        <div className="metric-card">
          <div className="text-xs text-gray-400">S</div>
          <div className="text-base font-bold text-accent-violet tabular-nums">
            {powerCalcData.powerApparent.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">VA</div>
        </div>
        <div className="metric-card">
          <div className="text-xs text-gray-400">PF</div>
          <div className="text-base font-bold text-white tabular-nums">
            {powerCalcData.powerFactor.toFixed(3)}
          </div>
          <div className="text-xs text-gray-500">-</div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-accent-emerald/30 rounded"></div>
          <span>Energy to load</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-accent-orange/30 rounded"></div>
          <span>Energy returned</span>
        </div>
        {side === 'primary' && powerCalcData.powerMagnetizing && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-accent-orange rounded" style={{ borderTop: '2px dashed #f59e0b' }}></div>
            <span>Pure magnetizing</span>
          </div>
        )}
      </div>
    </div>
  );
}
