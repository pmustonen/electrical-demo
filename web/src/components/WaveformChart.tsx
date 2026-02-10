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
} from 'chart.js';
import type { WaveformData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WaveformChartProps {
  waveformData: WaveformData;
}

export function WaveformChart({ waveformData }: WaveformChartProps) {
  // Primary side data
  const primaryData = {
    labels: waveformData.time.map(t => (t * 1000).toFixed(1)), // Convert to ms
    datasets: [
      {
        label: 'V₁(t)',
        data: waveformData.v1,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        yAxisID: 'y-voltage',
      },
      {
        label: 'I₁(t)',
        data: waveformData.i1,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        yAxisID: 'y-current',
      },
    ],
  };

  // Secondary side data
  const secondaryData = {
    labels: waveformData.time.map(t => (t * 1000).toFixed(1)),
    datasets: [
      {
        label: 'V₂(t)',
        data: waveformData.v2,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        yAxisID: 'y-voltage',
      },
      {
        label: 'I₂(t)',
        data: waveformData.i2,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        yAxisID: 'y-current',
      },
    ],
  };

  const commonOptions = {
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Voltage & Current Waveforms
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Side */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Primary Side</h3>
          <div className="h-64">
            <Line data={primaryData} options={commonOptions} />
          </div>
        </div>

        {/* Secondary Side */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Secondary Side</h3>
          <div className="h-64">
            <Line data={secondaryData} options={commonOptions} />
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <p>
          Blue lines represent voltage waveforms, red lines represent current waveforms.
          Note the phase shift between voltage and current due to the inductive load.
        </p>
      </div>
    </div>
  );
}
