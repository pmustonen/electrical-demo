import { useState } from 'react';
import { useTransformer } from './hooks/useTransformer';
import { ControlBar } from './components/ControlBar';
import { PowerTriangle } from './components/PowerTriangle';
import { WaveformChart } from './components/WaveformChart';
import { PowerCalculation } from './components/PowerCalculation';

function App() {
  const {
    params,
    values,
    waveformData,
    powerCalcData,
    updateParam,
    resetParams,
    setPowerCalcSide,
    powerCalcSide,
  } = useTransformer();

  const [isControlsExpanded, setIsControlsExpanded] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Minimal Header */}
      <header className="glass-dark border-b border-slate-700/50 px-6 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 
                          flex items-center justify-center text-white font-bold text-xl shadow-lg">
            ⚡
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">AC Transformer Education</h1>
            <p className="text-xs text-gray-400">Interactive Visualization</p>
          </div>
        </div>
        
        <div className="text-xs text-gray-400">
          Adjust parameters below to explore transformer behavior
        </div>
      </header>

      {/* Main Visualization Grid */}
      <main className="flex-1 overflow-hidden p-3 pb-20">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Power Triangle */}
          <div className="animate-scale-in">
            <PowerTriangle values={values} />
          </div>

          {/* Waveforms */}
          <div className="animate-scale-in" style={{ animationDelay: '50ms' }}>
            <WaveformChart waveformData={waveformData} />
          </div>

          {/* Power Calculation */}
          <div className="animate-scale-in" style={{ animationDelay: '100ms' }}>
            <PowerCalculation
              powerCalcData={powerCalcData}
              side={powerCalcSide}
              onSideChange={setPowerCalcSide}
            />
          </div>
        </div>
      </main>

      {/* Bottom Control Bar */}
      <ControlBar
        isExpanded={isControlsExpanded}
        onToggle={() => setIsControlsExpanded(!isControlsExpanded)}
        params={params}
        onParamChange={updateParam}
        onReset={resetParams}
      />
    </div>
  );
}

export default App;
