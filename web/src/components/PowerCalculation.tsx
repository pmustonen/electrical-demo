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
import type { PowerCalculationData, TransformerSide, MachineType, MachineValues } from '../types';

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
  machineType: MachineType;
  values: MachineValues;
}

export function PowerCalculation({ 
  powerCalcData, 
  side, 
  onSideChange,
  machineType,
  values,
}: PowerCalculationProps) {
  const [showReferenceLinesState, setShowReferenceLinesState] = useState({
    P: true,
    Q: false,
    S: false,
  });
  
  const showSideSelector = machineType === 'transformer';
  const is3Phase = machineType === 'induction-motor' || machineType === 'synchronous-motor' || machineType === 'bess';

  const hasHarmonics = ((values.thdCurrent as number | undefined) ?? 0) > 0.001;
  const thdPercent = ((values.thdCurrent as number | undefined) ?? 0) * 100;
  const distortionPF = (values.distortionPowerFactor as number | undefined) ?? 1;
  const displacementPF = (values.displacementPowerFactor as number | undefined) ?? values.powerFactor;
  const truePF = (values.truePowerFactor as number | undefined) ?? values.powerFactor;

  const timeMs = powerCalcData.time.map(t => (t * 1000).toFixed(1));

  // Calculate total energy transferred (integral of power over time)
  // Use trapezoidal rule: E = ∫p(t)dt ≈ Σ[(p[i] + p[i+1])/2 * Δt]
  let energyPositive = 0; // Energy delivered to load (Joules)
  let energyNegative = 0; // Energy returned from load (Joules)
  
  // Calculate cumulative energy curve E(t) = ∫₀ᵗ p(τ) dτ
  const energyCumulative = new Array(powerCalcData.time.length);
  energyCumulative[0] = 0;
  
  for (let i = 0; i < powerCalcData.time.length - 1; i++) {
    const dt = powerCalcData.time[i + 1] - powerCalcData.time[i]; // seconds
    const p1 = powerCalcData.powerInstantaneous[i];
    const p2 = powerCalcData.powerInstantaneous[i + 1];
    const avgPower = (p1 + p2) / 2;
    const energySegment = avgPower * dt; // Joules
    
    // Accumulate for cumulative curve
    energyCumulative[i + 1] = energyCumulative[i] + energySegment;
    
    // Track positive/negative energy separately
    if (energySegment > 0) {
      energyPositive += energySegment;
    } else {
      energyNegative += Math.abs(energySegment);
    }
  }
  
  const energyNet = energyPositive - energyNegative; // Net energy transfer
  
  // Also calculate energy from magnetizing power if available
  let energyMagnetizing: number[] | null = null;
  if (side === 'primary' && powerCalcData.powerMagnetizing) {
    energyMagnetizing = new Array(powerCalcData.time.length);
    energyMagnetizing[0] = 0;
    
    for (let i = 0; i < powerCalcData.time.length - 1; i++) {
      const dt = powerCalcData.time[i + 1] - powerCalcData.time[i];
      const pMag1 = powerCalcData.powerMagnetizing[i];
      const pMag2 = powerCalcData.powerMagnetizing[i + 1];
      const avgPowerMag = (pMag1 + pMag2) / 2;
      energyMagnetizing[i + 1] = energyMagnetizing[i] + avgPowerMag * dt;
    }
  }

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { chartArea } = chart;
          if (!chartArea) return 'rgba(16, 185, 129, 0.4)';
          
          const value = context.parsed?.y ?? 0;
          return value >= 0 
            ? 'rgba(16, 185, 129, 0.4)'  // Slightly more opaque to emphasize area = energy
            : 'rgba(245, 158, 11, 0.4)';
        },
        borderWidth: 2.5,
        pointRadius: 0,
        fill: 'origin',
        tension: 0.4,
        segment: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          backgroundColor: (ctx: any) => {
            const value = ctx.p1.parsed.y;
            return value >= 0 
              ? 'rgba(16, 185, 129, 0.4)'
              : 'rgba(245, 158, 11, 0.4)';
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
        <div>
          <h2 className="text-base font-bold text-white">
            Power Calculation
          </h2>
          {is3Phase && (
            <p className="text-xs text-gray-400 mt-0.5">Per-Phase Instantaneous Power</p>
          )}
        </div>
        
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

          {/* Side Selector - Only for Transformer */}
          {showSideSelector && (
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
          )}
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
          <div className="text-xs text-gray-400">{hasHarmonics ? 'True PF' : 'PF'}</div>
          <div className="text-base font-bold text-white tabular-nums">
            {(hasHarmonics ? truePF : powerCalcData.powerFactor).toFixed(3)}
          </div>
          <div className="text-xs text-gray-500">-</div>
        </div>
      </div>

      {/* Harmonic metrics row */}
      {hasHarmonics && (
        <div className="mt-2 grid grid-cols-3 gap-2 p-2 rounded-lg border border-orange-500/30 bg-orange-500/5">
          <div className="text-center">
            <div className="text-xs text-orange-400/80">THD</div>
            <div className="text-sm font-bold text-orange-400 tabular-nums">{thdPercent.toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-orange-400/80">Displ. PF</div>
            <div className="text-sm font-bold text-yellow-300 tabular-nums">{displacementPF.toFixed(3)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-orange-400/80">Distort. PF</div>
            <div className="text-sm font-bold text-orange-400 tabular-nums">{distortionPF.toFixed(3)}</div>
          </div>
        </div>
      )}

      {/* Energy Transfer Display */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="metric-card bg-accent-emerald/10 border border-accent-emerald/30">
          <div className="text-xs text-accent-emerald/80">Energy Delivered</div>
          <div className="text-sm font-bold text-accent-emerald tabular-nums">
            {energyPositive.toFixed(2)}
          </div>
          <div className="text-xs text-accent-emerald/60">J (2 cycles)</div>
        </div>
        <div className="metric-card bg-accent-orange/10 border border-accent-orange/30">
          <div className="text-xs text-accent-orange/80">Energy Returned</div>
          <div className="text-sm font-bold text-accent-orange tabular-nums">
            {energyNegative.toFixed(2)}
          </div>
          <div className="text-xs text-accent-orange/60">J (2 cycles)</div>
        </div>
        <div className={`metric-card border ${energyNet >= 0 
          ? 'bg-accent-emerald/10 border-accent-emerald/30' 
          : 'bg-accent-orange/10 border-accent-orange/30'}`}>
          <div className={`text-xs ${energyNet >= 0 ? 'text-accent-emerald/80' : 'text-accent-orange/80'}`}>
            Net Energy
          </div>
          <div className={`text-sm font-bold tabular-nums ${energyNet >= 0 ? 'text-accent-emerald' : 'text-accent-orange'}`}>
            {energyNet >= 0 ? '+' : ''}{energyNet.toFixed(2)}
          </div>
          <div className={`text-xs ${energyNet >= 0 ? 'text-accent-emerald/60' : 'text-accent-orange/60'}`}>
            J (2 cycles)
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-accent-emerald/40 rounded"></div>
          <span>Area = Energy delivered</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-accent-orange/40 rounded"></div>
          <span>Area = Energy returned</span>
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
