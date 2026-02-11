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
  const phaseAngle = Math.atan2(Q, P); // Angle in radians
  const phaseAngleDeg = (phaseAngle * 180 / Math.PI);

  const data = {
    datasets: [
      {
        label: 'Active Power (P)',
        data: [
          { x: 0, y: 0 },
          { x: P, y: 0 },
        ],
        borderColor: '#10b981',
        backgroundColor: '#10b981',
        showLine: true,
        borderWidth: 4,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Reactive Power (Q)',
        data: [
          { x: P, y: 0 },
          { x: P, y: Q },
        ],
        borderColor: '#6366f1',
        backgroundColor: '#6366f1',
        showLine: true,
        borderWidth: 4,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Apparent Power (S)',
        data: [
          { x: 0, y: 0 },
          { x: P, y: Q },
        ],
        borderColor: '#8b5cf6',
        backgroundColor: '#8b5cf6',
        showLine: true,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderDash: [8, 4],
      },
    ],
  };

  const maxValue = Math.max(S, P, Q) * 1.15;

  // Plugin to draw angle arc
  const angleArcPlugin = {
    id: 'angleArc',
    afterDatasetsDraw: (chart: any) => {
      const ctx = chart.ctx;
      const xScale = chart.scales.x;
      const yScale = chart.scales.y;
      
      // Get origin in canvas coordinates
      const originX = xScale.getPixelForValue(0);
      const originY = yScale.getPixelForValue(0);
      
      // Arc radius in pixels
      const arcRadius = 40;
      
      // Draw arc
      ctx.save();
      ctx.beginPath();
      ctx.arc(originX, originY, arcRadius, -phaseAngle, 0, true);
      ctx.strokeStyle = '#fbbf24'; // amber color
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw angle label
      const labelAngle = -phaseAngle / 2;
      const labelRadius = arcRadius + 15;
      const labelX = originX + labelRadius * Math.cos(labelAngle);
      const labelY = originY - labelRadius * Math.sin(labelAngle);
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`φ = ${phaseAngleDeg.toFixed(1)}°`, labelX, labelY);
      
      ctx.restore();
    },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      angleArc: angleArcPlugin,
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#e5e7eb',
          font: {
            size: 11,
            weight: 500 as const,
          },
          padding: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(100, 102, 241, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
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
          color: '#9ca3af',
          font: {
            size: 12,
            weight: 600,
          },
        },
        min: 0,
        max: maxValue,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 10,
          },
        },
      },
      y: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'Reactive Power (VAR)',
          color: '#9ca3af',
          font: {
            size: 12,
            weight: 600,
          },
        },
        min: 0,
        max: maxValue,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 10,
          },
        },
      },
    },
  };

  return (
    <div className="glass-dark rounded-xl p-5 h-full flex flex-col shadow-2xl border border-slate-700/50">
      <h2 className="text-base font-bold text-white mb-3">Power Triangle</h2>
      
      <div className="flex-1 min-h-0">
        <Scatter data={data} options={options} plugins={[angleArcPlugin]} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="metric-card">
          <div className="text-xs text-gray-400">Active (P)</div>
          <div className="text-lg font-bold text-accent-emerald tabular-nums">
            {P.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">W</div>
        </div>
        <div className="metric-card">
          <div className="text-xs text-gray-400">Reactive (Q)</div>
          <div className="text-lg font-bold text-primary-400 tabular-nums">
            {Q.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">VAR</div>
        </div>
        <div className="metric-card">
          <div className="text-xs text-gray-400">Apparent (S)</div>
          <div className="text-lg font-bold text-accent-violet tabular-nums">
            {S.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">VA</div>
        </div>
      </div>

      <div className="mt-2 text-center space-y-1">
        <div>
          <span className="text-xs text-gray-400">Power Factor = cos(φ) = </span>
          <span className="text-sm font-bold text-white tabular-nums">
            {values.powerFactor.toFixed(3)}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          cos({phaseAngleDeg.toFixed(1)}°) = {Math.cos(phaseAngle).toFixed(3)}
        </div>
      </div>
    </div>
  );
}

