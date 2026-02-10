import { useTransformer } from './hooks/useTransformer';
import { ControlPanel } from './components/ControlPanel';

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
            {/* Power Triangle Placeholder */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Power Triangle</h2>
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <p className="text-gray-500">Power Triangle Visualization (Coming Soon)</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Active Power:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    {values.powerActivePrimary.toFixed(2)} W
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Reactive Power:</span>
                  <span className="ml-2 font-semibold text-blue-600">
                    {values.powerReactivePrimary.toFixed(2)} VAR
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Apparent Power:</span>
                  <span className="ml-2 font-semibold text-purple-600">
                    {values.powerApparentPrimary.toFixed(2)} VA
                  </span>
                </div>
              </div>
            </div>

            {/* Waveforms Placeholder */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Voltage & Current Waveforms</h2>
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <p className="text-gray-500">Waveform Charts (Coming Soon)</p>
              </div>
            </div>

            {/* Power Calculation Placeholder */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Power Calculation</h2>
                <select
                  value={powerCalcSide}
                  onChange={e => setPowerCalcSide(e.target.value as 'primary' | 'secondary')}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="primary">Primary Side</option>
                  <option value="secondary">Secondary Side</option>
                </select>
              </div>
              <div className="h-96 bg-gray-50 rounded flex items-center justify-center">
                <p className="text-gray-500">Power Calculation Diagram (Coming Soon)</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
