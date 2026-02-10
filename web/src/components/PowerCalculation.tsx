import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { PowerCalculationData, TransformerSide } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PowerCalculationProps {
  powerCalcData: PowerCalculationData;
  side: TransformerSide;
  onSideChange: (side: TransformerSide) => void;
}

export function PowerCalculation({ 
  powerCalcData, 
  side, 
  onSideChange 
}: PowerCalculationProps) {
  const timeMs = powerCalcData.time.map(t => (t * 1000).toFixed(1));

  // Top subplot: V(t) and I(t)
  const waveformData = {
    labels: timeMs,
    datasets: [
      {
        label: 'v(t)',
        data: powerCalcData.voltage,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        yAxisID: 'y-voltage',
      },
      {
        label: 'i(t)',
        data: powerCalcData.current,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        yAxisID: 'y-current',
      },
    ],
  };

  // Bottom subplot: p(t) = v(t) × i(t) with fill
  const powerData = {
    labels: timeMs,
    datasets: [
      {
        label: 'p(t) = v(t) × i(t)',
        data: powerCalcData.powerInstantaneous,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: (context: any) => {
          const value = context.parsed?.y;
          if (value === undefined) return 'rgba(34, 197, 94, 0.2)';
          return value >= 0 
            ? 'rgba(34, 197, 94, 0.3)'  // Green for positive (to load)
            : 'rgba(255, 165, 0, 0.3)';  // Orange for negative (from inductor)
        },
        borderWidth: 2,
        pointRadius: 0,
        fill: 'origin',
        segment: {
          backgroundColor: (ctx: any) => {
            const value = ctx.p1.parsed.y;
            return value >= 0 
              ? 'rgba(34, 197, 94, 0.3)'
              : 'rgba(255, 165, 0, 0.3)';
          },
        },
      },
    ],
  };

  const waveformOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (ms)',
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
      'y-voltage': {
        type: 'linear' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Voltage (V)',
          color: 'rgb(59, 130, 246)',
        },
        grid: {
          display: true,
        },
        ticks: {
          color: 'rgb(59, 130, 246)',
        },
      },
      'y-current': {
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Current (A)',
          color: 'rgb(239, 68, 68)',
        },
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgb(239, 68, 68)',
        },
      },
    },
  };

  const powerOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (ms)',
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Instantaneous Power (W)',
        },
        grid: {
          display: true,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Power Calculation: p(t) = v(t) × i(t)
        </h2>
        <select
          value={side}
          onChange={e => onSideChange(e.target.value as TransformerSide)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="primary">Primary Side</option>
          <option value="secondary">Secondary Side</option>
        </select>
      </div>

      <div className="space-y-6">
        {/* Waveforms subplot */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Voltage and Current Waveforms
          </h3>
          <div className="h-48">
            <Line data={waveformData} options={waveformOptions} />
          </div>
        </div>

        {/* Instantaneous power subplot */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Instantaneous Power
          </h3>
          <div className="h-64">
            <Line data={powerData} options={powerOptions} />
          </div>
        </div>
      </div>

      {/* Power metrics */}
      <div className="mt-6 grid grid-cols-4 gap-4 text-sm">
        <div className="flex flex-col">
          <span className="text-gray-600">Active Power (P):</span>
          <span className="text-lg font-semibold text-green-600">
            {powerCalcData.powerActive.toFixed(2)} W
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-600">Reactive Power (Q):</span>
          <span className="text-lg font-semibold text-blue-600">
            {powerCalcData.powerReactive.toFixed(2)} VAR
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-600">Apparent Power (S):</span>
          <span className="text-lg font-semibold text-purple-600">
            {powerCalcData.powerApparent.toFixed(2)} VA
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-600">Power Factor:</span>
          <span className="text-lg font-semibold text-gray-800">
            {powerCalcData.powerFactor.toFixed(3)}
          </span>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <p>
          <span className="inline-block w-3 h-3 bg-green-500 bg-opacity-30 mr-1"></span>
          Green shading: Positive power (energy flowing to load)
          <span className="ml-4 inline-block w-3 h-3 bg-orange-500 bg-opacity-30 mr-1"></span>
          Orange shading: Negative power (energy returned from inductor)
        </p>
      </div>
    </div>
  );
}
