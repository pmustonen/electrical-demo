import { useState, useMemo } from 'react';
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
import type { WaveformData, MachineType } from '../types';

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
  phaseAngle: number; // Phase angle in radians
  machineType: MachineType;
}

type ViewMode = 'primary' | 'secondary' | 'both';

export function WaveformChart({ waveformData, phaseAngle, machineType }: WaveformChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('primary');
  const [axesFrozen, setAxesFrozen] = useState(false);
  const [showRMS, setShowRMS] = useState(true);
  const [showPhaseShift, setShowPhaseShift] = useState(false);
  const [frozenRanges, setFrozenRanges] = useState<{
    voltage: { min: number; max: number };
    current: { min: number; max: number };
  } | null>(null);
  
  // For 3-phase systems: only show single phase
  // For transformer: show primary/secondary/both
  const is3Phase = machineType === 'induction-motor' || machineType === 'synchronous-motor' || machineType === 'bess';
  const showViewModeSelector = !is3Phase; // Only transformer has multiple sides
  const primaryLabel = is3Phase ? 'Phase A' : 'Primary';
  const secondaryLabel = 'Secondary'; // Not used for 3-phase systems

  // Memoized zero-crossings calculation
  const zeroCrossings = useMemo(() => {
    const voltages = viewMode === 'secondary' ? waveformData.v2 : waveformData.v1;
    const currents = viewMode === 'secondary' ? waveformData.i2 : waveformData.i1;
    const time = waveformData.time;
    
    // Collect all positive-going zero crossings for voltage and current
    const vCrossings: number[] = [];
    const iCrossings: number[] = [];
    for (let i = 1; i < voltages.length; i++) {
      if (voltages[i-1] <= 0 && voltages[i] > 0) vCrossings.push(i);
    }
    for (let i = 1; i < currents.length; i++) {
      if (currents[i-1] <= 0 && currents[i] > 0) iCrossings.push(i);
    }

    const vZero = vCrossings.length > 0 ? vCrossings[0] : -1;

    // Find the current zero crossing nearest in time to vZero (within ±half period)
    let iZero = -1;
    let timeDiff = 0;
    let period = 0;
    if (vZero !== -1 && iCrossings.length > 0) {
      const totalTime = time[time.length - 1] - time[0];
      period = totalTime / 2;
      const vTime = time[vZero];
      let bestDiff = Infinity;
      for (const idx of iCrossings) {
        let diff = time[idx] - vTime;
        // Wrap diff into ±half period so we compare within the same cycle
        while (diff > period / 2) diff -= period;
        while (diff < -period / 2) diff += period;
        if (Math.abs(diff) < Math.abs(bestDiff)) {
          bestDiff = diff;
          iZero = idx;
        }
      }
      timeDiff = bestDiff;
    }
    
    return {
      vZero,
      iZero,
      timeDiff,
      period,
      found: vZero !== -1 && iZero !== -1,
    };
  }, [viewMode, waveformData]);

  // Memoized RMS values (Peak / √2)
  const rmsValues = useMemo(() => {
    const v1Peak = Math.max(...waveformData.v1.map(Math.abs));
    const v2Peak = Math.max(...waveformData.v2.map(Math.abs));
    const i1Peak = Math.max(...waveformData.i1.map(Math.abs));
    const i2Peak = Math.max(...waveformData.i2.map(Math.abs));
    return {
      v1: v1Peak / Math.sqrt(2),
      v2: v2Peak / Math.sqrt(2),
      i1: i1Peak / Math.sqrt(2),
      i2: i2Peak / Math.sqrt(2),
    };
  }, [waveformData]);

  // Memoized axis ranges based on visible data
  const currentRanges = useMemo(() => {
    let voltages: number[] = [];
    let currents: number[] = [];
    
    // Only include data that's actually being displayed
    if (viewMode === 'primary') {
      voltages = waveformData.v1;
      currents = waveformData.i1;
    } else if (viewMode === 'secondary') {
      voltages = waveformData.v2;
      currents = waveformData.i2;
    } else {
      // 'both' mode - include all data
      voltages = [...waveformData.v1, ...waveformData.v2];
      currents = [...waveformData.i1, ...waveformData.i2];
    }
    
    const voltageMin = Math.min(...voltages);
    const voltageMax = Math.max(...voltages);
    const currentMin = Math.min(...currents);
    const currentMax = Math.max(...currents);
    
    // Add 10% padding
    const voltagePadding = (voltageMax - voltageMin) * 0.1;
    const currentPadding = (currentMax - currentMin) * 0.1;
    
    return {
      voltage: { 
        min: voltageMin - voltagePadding, 
        max: voltageMax + voltagePadding 
      },
      current: { 
        min: currentMin - currentPadding, 
        max: currentMax + currentPadding 
      },
    };
  }, [viewMode, waveformData]);

  // Handle freeze toggle - capture current ranges when freezing
  const handleFreezeToggle = () => {
    if (!axesFrozen) {
      setFrozenRanges(currentRanges);
    } else {
      setFrozenRanges(null);
    }
    setAxesFrozen(!axesFrozen);
  };

  const timeMs = useMemo(() => waveformData.time.map(t => (t * 1000).toFixed(1)), [waveformData.time]);

  const datasets = useMemo(() => {
    const datasets = [];
    
    // Helper to create constant RMS line
    const createRMSLine = (value: number) => 
      Array(waveformData.time.length).fill(value);
    
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
      
      // Add RMS lines for primary
      if (showRMS) {
        datasets.push(
          {
            label: 'V₁ RMS',
            data: createRMSLine(rmsValues.v1),
            borderColor: '#6366f1',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderDash: [8, 4],
            pointRadius: 0,
            yAxisID: 'y-voltage',
            tension: 0,
          },
          {
            label: 'I₁ RMS',
            data: createRMSLine(rmsValues.i1),
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderDash: [8, 4],
            pointRadius: 0,
            yAxisID: 'y-current',
            tension: 0,
          }
        );
      }
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
      
      // Add RMS lines for secondary
      if (showRMS) {
        datasets.push(
          {
            label: 'V₂ RMS',
            data: createRMSLine(rmsValues.v2),
            borderColor: '#8b5cf6',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderDash: [8, 4],
            pointRadius: 0,
            yAxisID: 'y-voltage',
            tension: 0,
          },
          {
            label: 'I₂ RMS',
            data: createRMSLine(rmsValues.i2),
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderDash: [8, 4],
            pointRadius: 0,
            yAxisID: 'y-current',
            tension: 0,
          }
        );
      }
    }
    
    // Add zero-crossing markers for phase shift visualization
    if (showPhaseShift && viewMode !== 'both') {
      const crossings = zeroCrossings;
      
      if (crossings.found) {
        const voltageColor = viewMode === 'secondary' ? '#8b5cf6' : '#6366f1';
        const currentColor = viewMode === 'secondary' ? '#f59e0b' : '#10b981';
        
        const voltages = viewMode === 'secondary' ? waveformData.v2 : waveformData.v1;
        const currents = viewMode === 'secondary' ? waveformData.i2 : waveformData.i1;
        
        // Voltage zero-crossing marker
        const vZeroData = waveformData.time.map((_t, idx) => 
          idx === crossings.vZero ? voltages[idx] : null
        );
        datasets.push({
          label: 'V zero',
          data: vZeroData,
          borderColor: voltageColor,
          backgroundColor: voltageColor,
          borderWidth: 3,
          pointRadius: 8,
          pointStyle: 'circle' as const,
          yAxisID: 'y-voltage',
          showLine: false,
        });
        
        // Current zero-crossing marker
        const iZeroData = waveformData.time.map((_t, idx) => 
          idx === crossings.iZero ? currents[idx] : null
        );
        datasets.push({
          label: 'I zero',
          data: iZeroData,
          borderColor: currentColor,
          backgroundColor: currentColor,
          borderWidth: 3,
          pointRadius: 8,
          pointStyle: 'circle' as const,
          yAxisID: 'y-current',
          showLine: false,
        });
      }
    }
    
    return datasets;
  }, [viewMode, showRMS, showPhaseShift, waveformData, rmsValues, zeroCrossings]);

  const data = useMemo(() => ({
    labels: timeMs,
    datasets,
  }), [timeMs, datasets]);

  // Get axis ranges (frozen or auto-scaling) — uses state, not ref
  const ranges = axesFrozen && frozenRanges ? frozenRanges : currentRanges;
  // Destructure to avoid React Compiler misinterpreting ranges.current as ref access
  const { voltage: voltageRange, current: currentRange } = ranges;

  const options = useMemo(() => {
    const axisColors = {
      voltage: viewMode === 'secondary' ? '#8b5cf6' : '#6366f1',
      current: viewMode === 'secondary' ? '#f59e0b' : '#10b981',
    };

    return {
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
        min: voltageRange.min,
        max: voltageRange.max,
        title: {
          display: true,
          text: 'Voltage (V)',
          color: axisColors.voltage,
          font: {
            size: 11,
            weight: 600,
          },
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: axisColors.voltage,
          font: {
            size: 10,
          },
        },
      },
      'y-current': {
        type: 'linear' as const,
        position: 'right' as const,
        min: currentRange.min,
        max: currentRange.max,
        title: {
          display: true,
          text: 'Current (A)',
          color: axisColors.current,
          font: {
            size: 11,
            weight: 600,
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          color: axisColors.current,
          font: {
            size: 10,
          },
        },
      },
    },
    };
  }, [voltageRange, currentRange, viewMode]);

  return (
    <div className="glass-dark rounded-xl p-5 h-full flex flex-col shadow-2xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-white">Voltage & Current Waveforms</h2>
        
        <div className="flex items-center gap-2">
          {/* Phase Shift Toggle */}
          <button
            onClick={() => setShowPhaseShift(!showPhaseShift)}
            className={`px-3 py-1 glass rounded transition-all duration-200 text-xs font-medium flex items-center gap-1
              ${showPhaseShift 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-lg shadow-amber-500/20' 
                : 'text-gray-400 hover:text-amber-300 hover:bg-amber-500/10 hover:border hover:border-amber-500/30'
              }`}
            title={showPhaseShift ? 'Hide phase angle calculation' : 'Show phase angle calculation'}
            disabled={viewMode === 'both'}
          >
            <span className="text-base">∠</span>
            <span>Phase Angle</span>
          </button>

          {/* RMS Toggle */}
          <button
            onClick={() => setShowRMS(!showRMS)}
            className={`px-2 py-1 glass rounded transition-colors text-xs font-medium
              ${showRMS 
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            title={showRMS ? 'Hide RMS lines' : 'Show RMS lines'}
          >
            RMS
          </button>

          {/* Freeze Toggle */}
          <button
            onClick={handleFreezeToggle}
            className={`px-2 py-1 glass rounded transition-colors text-xs font-medium
              ${axesFrozen 
                ? 'bg-accent-orange/20 text-accent-orange border border-accent-orange/50' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            title={axesFrozen ? 'Unfreeze axes' : 'Freeze axes'}
          >
            {axesFrozen ? '🔒' : '🔓'}
          </button>

          {/* View Mode Toggle - Only for Transformer */}
          {showViewModeSelector && (
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
                  {mode === 'both' ? 'Both' : mode === 'primary' ? primaryLabel : secondaryLabel}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Line data={data} options={options} />
      </div>

      {/* RMS Values Display */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {(viewMode === 'primary' || viewMode === 'both') && (<>
          <div className="glass rounded px-3 py-1.5 flex items-center justify-between">
            <span className="text-indigo-400 font-medium">{is3Phase ? 'V' : 'V₁'} <span className="text-gray-500">rms</span></span>
            <span className="text-white font-mono">{rmsValues.v1.toFixed(1)} V</span>
          </div>
          <div className="glass rounded px-3 py-1.5 flex items-center justify-between">
            <span className="text-emerald-400 font-medium">{is3Phase ? 'I' : 'I₁'} <span className="text-gray-500">rms</span></span>
            <span className="text-white font-mono">{rmsValues.i1.toFixed(2)} A</span>
          </div>
        </>)}
        {(viewMode === 'secondary' || viewMode === 'both') && (<>
          <div className="glass rounded px-3 py-1.5 flex items-center justify-between">
            <span className="text-purple-400 font-medium">V₂ <span className="text-gray-500">rms</span></span>
            <span className="text-white font-mono">{rmsValues.v2.toFixed(1)} V</span>
          </div>
          <div className="glass rounded px-3 py-1.5 flex items-center justify-between">
            <span className="text-amber-400 font-medium">I₂ <span className="text-gray-500">rms</span></span>
            <span className="text-white font-mono">{rmsValues.i2.toFixed(2)} A</span>
          </div>
        </>)}
      </div>

      {/* Phase Angle Calculation Panel - Prominent when enabled */}
      {showPhaseShift && viewMode !== 'both' && (() => {
        const crossings = zeroCrossings;
        const angleCalc = (phaseAngle * 180 / Math.PI).toFixed(1);
        const angleMagnitude = Math.abs(parseFloat(angleCalc)).toFixed(1);
        
        if (crossings.found) {
          const timeDiffMs = (Math.abs(crossings.timeDiff) * 1000).toFixed(2);
          const periodMs = (crossings.period * 1000).toFixed(2);
          const ratio = (Math.abs(crossings.timeDiff) / crossings.period).toFixed(3);
          
          return (
            <div className="mt-3 glass-dark border border-amber-500/30 rounded-lg p-3 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <div className="text-amber-400 text-2xl">∠</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-amber-300 mb-1">
                    Phase Angle Calculation
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="glass rounded px-2 py-1">
                      <span className="text-gray-400">Time difference:</span>
                      <span className="text-white font-mono ml-1">Δt = {timeDiffMs} ms</span>
                    </div>
                    <div className="glass rounded px-2 py-1">
                      <span className="text-gray-400">Period:</span>
                      <span className="text-white font-mono ml-1">T = {periodMs} ms</span>
                    </div>
                  </div>
                  
                  <div className="text-xs space-y-0.5">
                    <div className="text-gray-300">
                      φ = <span className="text-white font-mono">(Δt / T)</span> × 360°
                    </div>
                    <div className="text-gray-300 ml-4">
                      = <span className="text-white font-mono">({timeDiffMs} ms / {periodMs} ms)</span> × 360°
                    </div>
                    <div className="text-gray-300 ml-4">
                      = <span className="text-white font-mono">{ratio}</span> × 360°
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-amber-400">φ = {phaseAngle < 0 ? '-' : '+'}{angleMagnitude}°</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        phaseAngle < 0
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : phaseAngle > 0.01
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                      }`}>
                        {phaseAngle < -0.01 
                          ? 'Current lags voltage (inductive)' 
                          : phaseAngle > 0.01
                          ? 'Current leads voltage (capacitive)' 
                          : 'Unity power factor'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div className="mt-3 glass-dark border border-amber-500/30 rounded-lg p-2 bg-amber-500/5 text-center">
            <span className="text-amber-400 text-sm font-medium">Phase angle: {angleCalc}°</span>
          </div>
        );
      })()}

      <div className="mt-3 text-xs text-gray-400 text-center">
        {!is3Phase && viewMode === 'both' && `Solid: ${primaryLabel} • Dashed: ${secondaryLabel}`}
        {!is3Phase && viewMode === 'primary' && `Showing ${primaryLabel.toLowerCase()} waveforms`}
        {!is3Phase && viewMode === 'secondary' && `Showing ${secondaryLabel.toLowerCase()} waveforms`}
        {is3Phase && `Showing Phase A (single-phase waveforms, per-phase values)`}
        {showRMS && ' • RMS values shown'}
        {axesFrozen && ' • 🔒 Axes frozen'}
      </div>
    </div>
  );
}
