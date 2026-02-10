import { useState } from 'react';
import { useTransformer } from './hooks/useTransformer';
import { ControlBar } from './components/ControlBar';
import { PowerTriangle } from './components/PowerTriangle';
import { WaveformChart } from './components/WaveformChart';
import { PowerCalculation } from './components/PowerCalculation';

function App() {
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [loadDisconnected, setLoadDisconnected] = useState(false);

  // Pass override params to hook when load is disconnected
  const {
    params,
    values,
    waveformData,
    powerCalcData,
    updateParam,
    resetParams,
    loadGridTransformer,
    setPowerCalcSide,
    powerCalcSide,
  } = useTransformer(
    loadDisconnected ? { resistanceLoad: 1e9 } : undefined // 1GΩ = open circuit
  );

  return (
    <div className="h-full flex flex-col">
      {/* Minimal Header */}
      <header className="glass-dark border-b border-slate-700/50 px-6 py-3 flex items-center justify-between flex-shrink-0">
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
          Click Parameters bar below to adjust values
        </div>
      </header>

      {/* Main Visualization Grid - Shrinks when controls expand */}
      <main className="flex-1 min-h-0 overflow-hidden p-3">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Power Triangle */}
          <div className="animate-scale-in min-h-0">
            <PowerTriangle values={values} />
          </div>

          {/* Waveforms */}
          <div className="animate-scale-in min-h-0" style={{ animationDelay: '50ms' }}>
            <WaveformChart waveformData={waveformData} />
          </div>

          {/* Power Calculation */}
          <div className="animate-scale-in min-h-0" style={{ animationDelay: '100ms' }}>
            <PowerCalculation
              powerCalcData={powerCalcData}
              side={powerCalcSide}
              onSideChange={setPowerCalcSide}
            />
          </div>
        </div>
      </main>

      {/* Bottom Control Bar - Takes up space naturally */}
      <ControlBar
        isExpanded={isControlsExpanded}
        onToggle={() => setIsControlsExpanded(!isControlsExpanded)}
        params={params}
        onParamChange={updateParam}
        onReset={resetParams}
        onLoadGridTransformer={loadGridTransformer}
        loadDisconnected={loadDisconnected}
        onLoadDisconnectToggle={() => setLoadDisconnected(!loadDisconnected)}
      />
    </div>
  );
}

export default App;
