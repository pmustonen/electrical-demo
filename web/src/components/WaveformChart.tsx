import { useState, useRef } from 'react';
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
  phaseAngle: number; // Phase angle in radians
}

type ViewMode = 'primary' | 'secondary' | 'both';

export function WaveformChart({ waveformData, phaseAngle }: WaveformChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [axesFrozen, setAxesFrozen] = useState(false);
  const [showRMS, setShowRMS] = useState(true);
  const [showPhaseShift, setShowPhaseShift] = useState(false);
  const frozenRangesRef = useRef<{
    voltage: { min: number; max: number };
    current: { min: number; max: number };
  } | null>(null);

  // Calculate RMS values (Peak / √2)
  const getRMSValues = () => {
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
  };

  // Calculate current data ranges based on visible data only
  const getCurrentRanges = () => {
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
  };

  // Handle freeze toggle - capture current ranges when freezing
  const handleFreezeToggle = () => {
    if (!axesFrozen) {
      // Freezing: capture current ranges
      frozenRangesRef.current = getCurrentRanges();
    } else {
      // Unfreezing: clear frozen ranges
      frozenRangesRef.current = null;
    }
    setAxesFrozen(!axesFrozen);
  };

  const timeMs = waveformData.time.map(t => (t * 1000).toFixed(1));

  const getDatasets = () => {
    const datasets = [];
    const rmsValues = getRMSValues();
    
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
    
    return datasets;
  };

  const data = {
    labels: timeMs,
    datasets: getDatasets(),
  };

  // Get axis ranges (frozen or auto-scaling)
  const ranges = axesFrozen && frozenRangesRef.current 
    ? frozenRangesRef.current 
    : getCurrentRanges();

  // Get axis colors based on view mode
  const axisColors = {
    voltage: viewMode === 'secondary' ? '#8b5cf6' : '#6366f1', // Purple for secondary, Blue for primary
    current: viewMode === 'secondary' ? '#f59e0b' : '#10b981', // Orange for secondary, Green for primary
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
        min: ranges.voltage.min,
        max: ranges.voltage.max,
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
        min: ranges.current.min,
        max: ranges.current.max,
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

  return (
    <div className="glass-dark rounded-xl p-5 h-full flex flex-col shadow-2xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-white">Voltage & Current Waveforms</h2>
        
        <div className="flex items-center gap-2">
          {/* Phase Shift Toggle */}
          <button
            onClick={() => setShowPhaseShift(!showPhaseShift)}
            className={`px-2 py-1 glass rounded transition-colors text-xs font-medium
              ${showPhaseShift 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            title={showPhaseShift ? 'Hide phase shift markers' : 'Show phase shift markers'}
            disabled={viewMode === 'both'}
          >
            φ
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

          {/* View Mode Toggle */}
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
      </div>

      <div className="flex-1 min-h-0">
        <Line data={data} options={options} />
      </div>

      <div className="mt-3 text-xs text-gray-400 text-center">
        {viewMode === 'both' && 'Solid lines: Primary • Dashed lines: Secondary'}
        {viewMode === 'primary' && 'Showing primary side waveforms'}
        {viewMode === 'secondary' && 'Showing secondary side waveforms'}
        {showRMS && ' • RMS values shown'}
        {showPhaseShift && viewMode !== 'both' && (
          ` • Phase shift: ${(phaseAngle * 180 / Math.PI).toFixed(1)}°`
        )}
        {axesFrozen && ' • 🔒 Axes frozen'}
      </div>
    </div>
  );
}
