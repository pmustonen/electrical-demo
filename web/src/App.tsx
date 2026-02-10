import { useState } from 'react';
import { useTransformer } from './hooks/useTransformer';
import { ControlDrawer } from './components/ControlDrawer';
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

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Minimal Header */}
      <header className="glass-dark border-b border-slate-700/50 px-6 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-violet 
                          flex items-center justify-center text-white font-bold text-xl shadow-lg">
            ⚡
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">AC Transformer Education</h1>
            <p className="text-xs text-gray-400">Interactive Visualization</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 glass rounded-lg hover:bg-white/20 transition-all duration-200
                     text-white font-medium text-sm flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Controls
        </button>
      </header>

      {/* Main Visualization Grid */}
      <main className="flex-1 overflow-hidden p-3">
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

      {/* Control Drawer */}
      <ControlDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        params={params}
        onParamChange={updateParam}
        onReset={resetParams}
      />
    </div>
  );
}

export default App;
