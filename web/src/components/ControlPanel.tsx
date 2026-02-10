import type { TransformerParams } from '../types';

interface ControlPanelProps {
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

const sliderConfigs: SliderConfig[] = [
  {
    key: 'voltagePrimary',
    label: 'Primary Voltage',
    min: 50,
    max: 500,
    step: 10,
    unit: 'V',
  },
  {
    key: 'frequency',
    label: 'Frequency',
    min: 50,
    max: 60,
    step: 10,
    unit: 'Hz',
  },
  {
    key: 'turnsRatio',
    label: 'Turns Ratio (N₁/N₂)',
    min: 0.5,
    max: 10,
    step: 0.5,
    unit: '',
  },
  {
    key: 'inductanceMag',
    label: 'Magnetizing Inductance',
    min: 0.1,
    max: 2,
    step: 0.1,
    unit: 'H',
  },
  {
    key: 'resistancePrimary',
    label: 'Primary Resistance',
    min: 0.1,
    max: 5,
    step: 0.1,
    unit: 'Ω',
  },
  {
    key: 'resistanceSecondary',
    label: 'Secondary Resistance',
    min: 0.1,
    max: 5,
    step: 0.1,
    unit: 'Ω',
  },
  {
    key: 'resistanceLoad',
    label: 'Load Resistance',
    min: 1,
    max: 100,
    step: 1,
    unit: 'Ω',
  },
];

export function ControlPanel({ params, onParamChange, onReset }: ControlPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Control Panel</h2>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {sliderConfigs.map(config => {
          const value = params[config.key];
          return (
            <div key={config.key} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label className="text-sm font-medium text-gray-700">
                  {config.label}
                </label>
                <span className="text-sm font-semibold text-blue-600">
                  {value.toFixed(1)} {config.unit}
                </span>
              </div>
              <input
                type="range"
                min={config.min}
                max={config.max}
                step={config.step}
                value={value}
                onChange={e => onParamChange(config.key, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{config.min} {config.unit}</span>
                <span>{config.max} {config.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Adjust the parameters above to see how they affect the transformer behavior.
          Watch the power triangle, waveforms, and power calculations update in real-time.
        </p>
      </div>
    </div>
  );
}
