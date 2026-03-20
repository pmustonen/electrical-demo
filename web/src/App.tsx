import { useState } from 'react';
import { useMachine } from './hooks/useMachine';
import type { MachineType, MachineParams } from './types';
import { MachineSelector } from './components/MachineSelector';
import { ControlBar } from './components/ControlBar';
import { PowerTriangle } from './components/PowerTriangle';
import { WaveformChart } from './components/WaveformChart';
import { PowerCalculation } from './components/PowerCalculation';

function App() {
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [loadDisconnected, setLoadDisconnected] = useState(false);
  const [machineType, setMachineType] = useState<MachineType>('transformer');

  // Use generic machine hook
  const {
    config,
    params,
    values,
    waveformData,
    powerCalcData,
    updateParam,
    resetParams,
    loadPreset,
    setPowerCalcSide,
    powerCalcSide,
  } = useMachine(machineType, {
    overrideParams: loadDisconnected ? { resistanceLoad: 1e9 } as unknown as Partial<MachineParams> : undefined, // 1GΩ = open circuit
  });

  const handleMachineChange = (newMachineType: MachineType) => {
    setMachineType(newMachineType);
    setLoadDisconnected(false); // Reset load state when switching machines
  };

  return (
    <div className="h-full flex flex-col">
      {/* Minimal Header */}
      <header className="glass-dark border-b border-slate-700/50 px-3 lg:px-6 py-2 lg:py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 lg:gap-4 min-w-0">
          <div className="w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 
                          flex items-center justify-center text-white font-bold text-lg lg:text-xl shadow-lg">
            ⚡
          </div>
          <div className="min-w-0">
            <h1 className="text-sm lg:text-lg font-bold text-white leading-tight truncate">Electrical Machines</h1>
            <p className="text-xs text-gray-400 hidden sm:block">Interactive Visualization</p>
          </div>
          
          {/* Machine Selector */}
          <MachineSelector
            currentMachine={machineType}
            onMachineChange={handleMachineChange}
          />
        </div>
        
        <div className="text-xs text-gray-400 hidden lg:block">
          Click Parameters bar below to adjust values
        </div>
      </header>

      {/* Main Visualization Grid — scrollable on mobile, fixed-height on desktop */}
      <main className="flex-1 overflow-y-auto lg:overflow-hidden min-h-0 p-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:h-full gap-3">
          {/* Power Triangle */}
          <div className="animate-scale-in min-h-[320px] lg:min-h-0">
            <PowerTriangle values={values} machineType={machineType} />
          </div>

          {/* Waveforms */}
          <div className="animate-scale-in min-h-[360px] lg:min-h-0" style={{ animationDelay: '50ms' }}>
            <WaveformChart 
              waveformData={waveformData} 
              phaseAngle={values.phaseAngle}
              machineType={machineType}
            />
          </div>

          {/* Power Calculation */}
          <div className="animate-scale-in min-h-[400px] lg:min-h-0" style={{ animationDelay: '100ms' }}>
            <PowerCalculation
              powerCalcData={powerCalcData}
              side={powerCalcSide}
              onSideChange={setPowerCalcSide}
              machineType={machineType}
              values={values}
            />
          </div>
        </div>
      </main>

      {/* Bottom Control Bar */}
      <ControlBar
        isExpanded={isControlsExpanded}
        onToggle={() => setIsControlsExpanded(!isControlsExpanded)}
        params={params}
        values={values}
        parameterConfigs={config.parameters}
        onParamChange={updateParam}
        onReset={resetParams}
        onLoadPreset={(name) => loadPreset(name)}
        presets={config.presets || []}
        loadDisconnected={loadDisconnected}
        onLoadDisconnectToggle={() => setLoadDisconnected(!loadDisconnected)}
        machineType={machineType}
      />
    </div>
  );
}

export default App;
