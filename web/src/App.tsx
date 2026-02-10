import { useTransformer } from './hooks/useTransformer';
import { ControlPanel } from './components/ControlPanel';
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900">
            AC Transformer Education
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Interactive visualization of single-phase AC transformer behavior
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Control Panel */}
          <div className="lg:col-span-1">
            <ControlPanel
              params={params}
              onParamChange={updateParam}
              onReset={resetParams}
            />
          </div>

          {/* Right: Visualizations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Power Triangle */}
            <PowerTriangle values={values} />

            {/* Waveforms */}
            <WaveformChart waveformData={waveformData} />

            {/* Power Calculation */}
            <PowerCalculation
              powerCalcData={powerCalcData}
              side={powerCalcSide}
              onSideChange={setPowerCalcSide}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
