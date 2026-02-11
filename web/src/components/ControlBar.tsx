import { useState } from 'react';
import type { MachineParams, MachineParameter, MachinePreset } from '../types';

interface ControlBarProps {
  isExpanded: boolean;
  onToggle: () => void;
  params: MachineParams;
  parameterConfigs: MachineParameter[];
  onParamChange: (key: string, value: number) => void;
  onReset: () => void;
  onLoadPreset: (presetName: string) => void;
  presets: MachinePreset[];
  loadDisconnected: boolean;
  onLoadDisconnectToggle: () => void;
}

export function ControlBar({ 
  isExpanded, 
  onToggle, 
  params, 
  parameterConfigs,
  onParamChange, 
  onReset, 
  onLoadPreset,
  presets,
  loadDisconnected,
  onLoadDisconnectToggle 
}: ControlBarProps) {
  const [dragValue, setDragValue] = useState<{ key: string; value: number } | null>(null);

  // Filter out hidden parameters for UI display
  const visibleParams = parameterConfigs.filter(p => !p.hidden);

  const handleSliderChange = (key: string, value: number) => {
    setDragValue({ key, value });
  };

  const handleSliderCommit = (key: string, value: number) => {
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
            {visibleParams.slice(0, 4).map(config => {
              const value = dragValue?.key === config.key ? dragValue.value : params[config.key] as number;
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
          
          {/* Preset Buttons */}
          {presets.map(preset => (
            <button
              key={preset.name}
              onClick={(e) => { e.stopPropagation(); onLoadPreset(preset.name); }}
              className="px-3 py-1 glass rounded hover:bg-primary-500/20 transition-colors text-xs text-primary-400 border border-primary-500/30"
              title={preset.description || `Load ${preset.name} preset`}
            >
              {preset.name}
            </button>
          ))}
          
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
            {visibleParams.map(config => {
              const displayValue = (dragValue?.key === config.key ? dragValue.value : params[config.key]) as number;
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
