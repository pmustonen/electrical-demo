import { useState } from 'react';
import type { TransformerParams } from '../types';

interface ControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  params: TransformerParams;
  onParamChange: (key: keyof TransformerParams, value: number) => void;
  onReset: () => void;
}

interface SliderConfig {
  key: keyof TransformerParams;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const PRIMARY_CONFIGS: SliderConfig[] = [
  { key: 'voltagePrimary', label: 'Primary Voltage', min: 50, max: 500, step: 10, unit: 'V' },
  { key: 'frequency', label: 'Frequency', min: 50, max: 60, step: 10, unit: 'Hz' },
  { key: 'turnsRatio', label: 'Turns Ratio (N₁/N₂)', min: 0.5, max: 10, step: 0.5, unit: '' },
  { key: 'inductanceMag', label: 'Magnetizing Inductance', min: 0.1, max: 2, step: 0.1, unit: 'H' },
];

const RESISTANCE_CONFIGS: SliderConfig[] = [
  { key: 'resistancePrimary', label: 'Primary Resistance', min: 0.1, max: 5, step: 0.1, unit: 'Ω' },
  { key: 'resistanceSecondary', label: 'Secondary Resistance', min: 0.1, max: 5, step: 0.1, unit: 'Ω' },
  { key: 'resistanceLoad', label: 'Load Resistance', min: 1, max: 100, step: 1, unit: 'Ω' },
];

export function ControlDrawer({ isOpen, onClose, params, onParamChange, onReset }: ControlDrawerProps) {
  const [dragValue, setDragValue] = useState<{ key: keyof TransformerParams; value: number } | null>(null);

  const handleSliderChange = (key: keyof TransformerParams, value: number) => {
    setDragValue({ key, value });
  };

  const handleSliderCommit = (key: keyof TransformerParams, value: number) => {
    onParamChange(key, value);
    setDragValue(null);
  };

  const renderSlider = (config: SliderConfig) => {
    const displayValue = dragValue?.key === config.key ? dragValue.value : params[config.key];
    
    return (
      <div key={config.key} className="space-y-2">
        <div className="flex justify-between items-baseline">
          <label className="text-sm font-medium text-gray-300">
            {config.label}
          </label>
          <span className="text-sm font-semibold text-primary-400 tabular-nums">
            {displayValue.toFixed(1)} {config.unit}
          </span>
        </div>
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={config.step}
          value={displayValue}
          onChange={e => handleSliderChange(config.key, parseFloat(e.target.value))}
          onMouseUp={e => handleSliderCommit(config.key, parseFloat((e.target as HTMLInputElement).value))}
          onTouchEnd={e => handleSliderCommit(config.key, parseFloat((e.target as HTMLInputElement).value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer 
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
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
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-96 glass-dark shadow-2xl z-50 
                    transform transition-transform duration-300 ease-out overflow-y-auto
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Transformer Parameters</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Primary Parameters */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Primary Parameters
            </h3>
            {PRIMARY_CONFIGS.map(renderSlider)}
          </div>

          {/* Resistances */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Resistances
            </h3>
            {RESISTANCE_CONFIGS.map(renderSlider)}
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-3">
            <button
              onClick={onReset}
              className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 
                       text-white rounded-lg font-medium shadow-lg shadow-primary-500/30
                       hover:from-primary-600 hover:to-primary-700 transition-all duration-200
                       hover:scale-105 active:scale-95"
            >
              Reset to Defaults
            </button>
            
            <div className="glass rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">About</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Adjust parameters to explore transformer behavior. All three visualizations 
                update in real-time as you change values.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
