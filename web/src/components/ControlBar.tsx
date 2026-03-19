import { useState } from 'react';
import type { MachineParams, MachineParameter, MachinePreset, MachineType, MachineValues } from '../types';

interface ControlBarProps {
  isExpanded: boolean;
  onToggle: () => void;
  params: MachineParams;
  values?: MachineValues; // Optional for BESS SOC and operating mode display
  parameterConfigs: MachineParameter[];
  onParamChange: (key: string, value: number) => void;
  onReset: () => void;
  onLoadPreset: (presetName: string) => void;
  presets: MachinePreset[];
  loadDisconnected: boolean;
  onLoadDisconnectToggle: () => void;
  machineType: MachineType;
}

export function ControlBar({ 
  isExpanded, 
  onToggle, 
  params,
  values,
  parameterConfigs,
  onParamChange, 
  onReset, 
  onLoadPreset,
  presets,
  loadDisconnected,
  onLoadDisconnectToggle,
  machineType,
}: ControlBarProps) {
  const [dragValue, setDragValue] = useState<{ key: string; value: number } | null>(null);

  // Filter out hidden parameters for UI display
  const visibleParams = parameterConfigs.filter(p => !p.hidden);
  
  // Show load disconnect only for transformer
  const showLoadDisconnect = machineType === 'transformer';
  
  // Show BESS-specific displays
  const isBess = machineType === 'bess';

  const handleSliderChange = (key: string, value: number) => {
    setDragValue({ key, value });
  };

  const handleSliderCommit = (key: string, value: number) => {
    onParamChange(key, value);
    setDragValue(null);
  };

  return (
    <div className="flex-shrink-0 border-t border-slate-700/50 relative">

      {/* Floating expanded panel — absolute so it overlays charts without compressing them */}
      {isExpanded && (
        <div className="absolute bottom-full left-0 right-0 z-50
                        glass-dark border-t border-slate-700/50
                        shadow-2xl shadow-black/60 animate-fade-in
                        max-h-[45vh] overflow-y-auto">
          <div className="p-3 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-3">
            {visibleParams.map(config => {
              // Toggle / select parameters
              if (config.options) {
                const currentValue = params[config.key] as string;
                const currentIndex = config.options.findIndex(opt => opt.value === currentValue);
                return (
                  <div key={config.key} className="space-y-1">
                    <label className="text-xs text-gray-400">{config.label}</label>
                    <div className="flex gap-1">
                      {config.options.map((option, idx) => (
                        <button
                          key={option.value}
                          onClick={() => onParamChange(config.key, option.value as any)}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all
                            ${currentIndex === idx
                              ? 'bg-primary-500 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              // Slider parameters
              const displayValue = (dragValue?.key === config.key ? dragValue.value : params[config.key]) as number;
              if (displayValue === undefined) return null;

              const isLoadResistance = config.key === 'resistanceLoad';
              const isDisabled = isLoadResistance && loadDisconnected;

              return (
                <div key={config.key} className={`space-y-0.5 ${isDisabled ? 'opacity-40' : ''}`}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-gray-300">{config.symbol}</span>
                    <span className="text-xs font-bold text-primary-400 tabular-nums">
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
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer
                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                               [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500
                               [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-125
                               [&::-webkit-slider-thumb]:transition-transform"
                  />
                  <div className="text-xs text-gray-500 truncate">{config.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Collapsed bar — always visible, click to toggle */}
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
              if (value === undefined) return null;
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
          {isBess && (
            <div className="px-2 py-1 rounded text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
              Rated: {params.powerRated} kVA
            </div>
          )}
          {isBess && values && 'operatingMode' in values && (
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              (values.operatingMode as string).includes('Discharging') ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' :
              (values.operatingMode as string).includes('Charging') ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
              (values.operatingMode as string).includes('Reactive') ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' :
              'bg-slate-500/20 text-slate-400 border border-slate-500/50'
            }`}>
              {values.operatingMode}
            </div>
          )}
          {showLoadDisconnect && (
            <button
              onClick={(e) => { e.stopPropagation(); onLoadDisconnectToggle(); }}
              className={`px-3 py-1 glass rounded transition-colors text-xs font-medium border
                ${loadDisconnected
                  ? 'bg-red-500/20 text-red-400 border-red-500/50'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                }`}
            >
              {loadDisconnected ? '⚡ No Load' : '🔌 Load Connected'}
            </button>
          )}
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
    </div>
  );
}
