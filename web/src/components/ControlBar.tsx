import { useState } from 'react';
import type { TransformerParams } from '../types';

interface ControlBarProps {
  isExpanded: boolean;
  onToggle: () => void;
  params: TransformerParams;
  onParamChange: (key: keyof TransformerParams, value: number) => void;
  onReset: () => void;
  onLoadGridTransformer: () => void;
  loadDisconnected: boolean;
  onLoadDisconnectToggle: () => void;
}

interface SliderConfig {
  key: keyof TransformerParams;
  label: string;
  symbol: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const SLIDER_CONFIGS: SliderConfig[] = [
  { key: 'voltagePrimary', label: 'Primary Voltage', symbol: 'V₁', min: 50, max: 25000, step: 50, unit: 'V' },
  { key: 'frequency', label: 'Frequency', symbol: 'f', min: 50, max: 60, step: 10, unit: 'Hz' },
  { key: 'turnsRatio', label: 'Turns Ratio', symbol: 'n', min: 0.5, max: 100, step: 0.5, unit: '' },
  { key: 'inductanceMag', label: 'Magnetizing Inductance', symbol: 'Lₘ', min: 0.1, max: 200, step: 0.5, unit: 'H' },
  { key: 'resistancePrimary', label: 'Primary Resistance', symbol: 'R₁', min: 0.01, max: 20, step: 0.1, unit: 'Ω' },
  { key: 'resistanceSecondary', label: 'Secondary Resistance', symbol: 'R₂', min: 0.01, max: 5, step: 0.01, unit: 'Ω' },
  { key: 'resistanceLoad', label: 'Load Resistance', symbol: 'Rₗ', min: 0.1, max: 100, step: 0.1, unit: 'Ω' },
];

export function ControlBar({ 
  isExpanded, 
  onToggle, 
  params, 
  onParamChange, 
  onReset, 
  onLoadGridTransformer,
  loadDisconnected,
  onLoadDisconnectToggle 
}: ControlBarProps) {
  const [dragValue, setDragValue] = useState<{ key: keyof TransformerParams; value: number } | null>(null);

  const handleSliderChange = (key: keyof TransformerParams, value: number) => {
    setDragValue({ key, value });
  };

  const handleSliderCommit = (key: keyof TransformerParams, value: number) => {
    onParamChange(key, value);
    setDragValue(null);
  };

  return (
    <div className="flex-shrink-0 border-t border-slate-700/50">
      {/* Collapsed Bar */}
      <div 
        onClick={onToggle}
        className="glass-dark px-6 py-3 cursor-pointer hover:bg-white/5 transition-colors 
                   flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="text-white font-semibold">Parameters</div>
          <div className="flex gap-3 text-xs">
            {SLIDER_CONFIGS.slice(0, 4).map(config => {
              const value = dragValue?.key === config.key ? dragValue.value : params[config.key];
              return (
                <div key={config.key} className="flex items-center gap-1">
                  <span className="text-gray-400">{config.symbol}:</span>
                  <span className="text-primary-400 font-semibold tabular-nums">
                    {value.toFixed(1)}{config.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Load Disconnect Toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); onLoadDisconnectToggle(); }}
            className={`px-3 py-1 glass rounded transition-colors text-xs font-medium border
              ${loadDisconnected
                ? 'bg-red-500/20 text-red-400 border-red-500/50'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
              }`}
            title={loadDisconnected ? 'Connect load (idle mode)' : 'Disconnect load (idle mode)'}
          >
            {loadDisconnected ? '⚡ No Load' : '🔌 Load Connected'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onLoadGridTransformer(); }}
            className="px-3 py-1 glass rounded hover:bg-primary-500/20 transition-colors text-xs text-primary-400 border border-primary-500/30"
            title="Load 20kV/400V grid transformer preset"
          >
            Grid Transformer
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReset(); }}
            className="px-3 py-1 glass rounded hover:bg-white/10 transition-colors text-xs text-gray-300"
          >
            Reset
          </button>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </div>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="glass-dark border-t border-slate-700/50 animate-fade-in">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            {SLIDER_CONFIGS.map(config => {
              const displayValue = dragValue?.key === config.key ? dragValue.value : params[config.key];
              const isLoadResistance = config.key === 'resistanceLoad';
              const isDisabled = isLoadResistance && loadDisconnected;
              
              return (
                <div key={config.key} className={`space-y-1.5 ${isDisabled ? 'opacity-40' : ''}`}>
                  <div className="flex justify-between items-baseline">
                    <label className="text-xs font-medium text-gray-300">
                      {config.label}
                      {isDisabled && ' (Disconnected)'}
                    </label>
                    <span className="text-sm font-bold text-primary-400 tabular-nums">
                      {isDisabled ? '∞' : `${displayValue.toFixed(1)}${config.unit}`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={displayValue}
                    disabled={isDisabled}
                    onChange={e => handleSliderChange(config.key, parseFloat(e.target.value))}
                    onMouseUp={e => handleSliderCommit(config.key, parseFloat((e.target as HTMLInputElement).value))}
                    onTouchEnd={e => handleSliderCommit(config.key, parseFloat((e.target as HTMLInputElement).value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer 
                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                               [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r 
                               [&::-webkit-slider-thumb]:from-primary-400 [&::-webkit-slider-thumb]:to-primary-600 
                               [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary-500/50
                               [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
                               [&::-webkit-slider-thumb]:hover:scale-110"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{config.min}</span>
                    <span>{config.max}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
