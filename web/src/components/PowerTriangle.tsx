import { Scatter } from 'react-chartjs-2';
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
import type { TransformerValues } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PowerTriangleProps {
  values: TransformerValues;
}

export function PowerTriangle({ values }: PowerTriangleProps) {
  const P = values.powerActivePrimary;
  const Q = values.powerReactivePrimary;
  const S = values.powerApparentPrimary;

  // Data for the three vectors: P (horizontal), Q (vertical), S (diagonal)
  const data = {
    datasets: [
      {
        label: 'Active Power (P)',
        data: [
          { x: 0, y: 0 },
          { x: P, y: 0 },
        ],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgb(34, 197, 94)',
        showLine: true,
        borderWidth: 3,
        pointRadius: 0,
      },
      {
        label: 'Reactive Power (Q)',
        data: [
          { x: P, y: 0 },
          { x: P, y: Q },
        ],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgb(59, 130, 246)',
        showLine: true,
        borderWidth: 3,
        pointRadius: 0,
      },
      {
        label: 'Apparent Power (S)',
        data: [
          { x: 0, y: 0 },
          { x: P, y: Q },
        ],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgb(168, 85, 247)',
        showLine: true,
        borderWidth: 3,
        pointRadius: 0,
        borderDash: [5, 5],
      },
    ],
  };

  // Calculate max value for scaling
  const maxValue = Math.max(S, P, Q) * 1.2;

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = label.includes('Active') ? P.toFixed(2) + ' W'
                        : label.includes('Reactive') ? Q.toFixed(2) + ' VAR'
                        : S.toFixed(2) + ' VA';
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'Active Power (W)',
        },
        min: 0,
        max: maxValue,
        grid: {
          display: true,
        },
      },
      y: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'Reactive Power (VAR)',
        },
        min: 0,
        max: maxValue,
        grid: {
          display: true,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Power Triangle</h2>
      <div className="h-80">
        <Scatter data={data} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="flex flex-col">
          <span className="text-gray-600">Active Power (P):</span>
          <span className="text-lg font-semibold text-green-600">
            {P.toFixed(2)} W
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-600">Reactive Power (Q):</span>
          <span className="text-lg font-semibold text-blue-600">
            {Q.toFixed(2)} VAR
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-600">Apparent Power (S):</span>
          <span className="text-lg font-semibold text-purple-600">
            {S.toFixed(2)} VA
          </span>
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <span>Power Factor: </span>
        <span className="font-semibold">{values.powerFactor.toFixed(3)}</span>
      </div>
    </div>
  );
}
