import { useMemo } from 'react';
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
import type { MachineValues, MachineType } from '../types';

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
  values: MachineValues;
  machineType: MachineType;
}

export function PowerTriangle({ values, machineType }: PowerTriangleProps) {
  const P = values.powerActive;
  const Q = values.powerReactive;
  const S = values.powerApparent;
  const phaseAngle = Math.atan2(Q, P);
  const phaseAngleDeg = (phaseAngle * 180 / Math.PI);

  const hasHarmonics = (values.thdCurrent as number | undefined ?? 0) > 0.001;
  const D = (values.powerDistortion as number | undefined) ?? 0;
  const displacementPF = (values.displacementPowerFactor as number | undefined) ?? values.powerFactor;
  const distortionPF = (values.distortionPowerFactor as number | undefined) ?? 1;
  const truePF = (values.truePowerFactor as number | undefined) ?? values.powerFactor;
  const thdPercent = ((values.thdCurrent as number | undefined) ?? 0) * 100;

  // S_displacement = √(P²+Q²), used for the P-Q triangle
  const S_disp = Math.sqrt(P ** 2 + Q ** 2);
  
  // Determine if we're showing 3-phase total or single-phase values
  const is3Phase = machineType === 'induction-motor' || machineType === 'synchronous-motor' || machineType === 'bess';

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
      // Apparent power: S_displacement when harmonics present, full S otherwise
      {
        label: hasHarmonics ? 'Displacement S' : 'Apparent Power (S)',
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
      // Distortion power D — only shown when harmonics are active
      ...(hasHarmonics ? [{
        label: 'Distortion Power (D)',
        data: [
          { x: P, y: Q },
          { x: P + D * (P / (S_disp || 1)), y: Q + D * (Q / (S_disp || 1)) },
        ],
        borderColor: '#f97316',
        backgroundColor: '#f97316',
        showLine: true,
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderDash: [4, 4],
      }] : []),
    ],
  };

  const maxValue = Math.max(S, Math.abs(P), Math.abs(Q), D) * 1.15;
  
  // For BESS and sync motor: Q can be negative (capacitive)
  // For BESS: P can be negative (charging)
  // Make axes symmetric to show all quadrants
  const xMin = P < 0 ? -maxValue : 0;
  const xMax = maxValue;
  const yMin = Q < 0 ? -maxValue : 0;
  const yMax = maxValue;

  // Plugin to draw angle arc - memoized with dependencies
  const angleArcPlugin = useMemo(() => ({
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
  }), [phaseAngle, phaseAngleDeg]);

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
        min: xMin,
        max: xMax,
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
        min: yMin,
        max: yMax,
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
      <div className="mb-3">
        <h2 className="text-base font-bold text-white">Power Triangle</h2>
        {is3Phase && (
          <p className="text-xs text-gray-400 mt-0.5">3-Phase Total Power Values</p>
        )}
        {machineType === 'bess' && (P < 0 || Q < 0) && (
          <p className="text-xs text-amber-400 mt-1">
            ⚡ Four-Quadrant Operation: {P < 0 ? 'Charging' : 'Discharging'} + {Q < 0 ? 'Capacitive' : 'Inductive'}
          </p>
        )}
      </div>
      
      <div className="flex-1 min-h-0">
        <Scatter key={phaseAngleDeg} data={data} options={options} plugins={[angleArcPlugin]} />
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
          <div className="text-xs text-gray-400">{hasHarmonics ? 'True S' : 'Apparent (S)'}</div>
          <div className="text-lg font-bold text-accent-violet tabular-nums">
            {S.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">VA</div>
        </div>
        {hasHarmonics && (
          <div className="metric-card col-span-3 border border-orange-500/30">
            <div className="grid grid-cols-3 gap-2 w-full">
              <div className="text-center">
                <div className="text-xs text-gray-400">Distortion (D)</div>
                <div className="text-base font-bold text-orange-400 tabular-nums">{D.toFixed(1)}</div>
                <div className="text-xs text-gray-500">VA</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">THD</div>
                <div className="text-base font-bold text-orange-400 tabular-nums">{thdPercent.toFixed(1)}%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Disp. PF</div>
                <div className="text-base font-bold text-yellow-300 tabular-nums">{displacementPF.toFixed(3)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-center space-y-1">
        {hasHarmonics ? (
          <>
            <div>
              <span className="text-xs text-gray-400">True PF = Displacement × Distortion = </span>
              <span className="text-sm font-bold text-white tabular-nums">{truePF.toFixed(3)}</span>
            </div>
            <div className="text-xs text-gray-500">
              {displacementPF.toFixed(3)} × {distortionPF.toFixed(3)} = {truePF.toFixed(3)}
            </div>
          </>
        ) : (
          <>
            <div>
              <span className="text-xs text-gray-400">Power Factor = cos(φ) = </span>
              <span className="text-sm font-bold text-white tabular-nums">
                {values.powerFactor.toFixed(3)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              cos({phaseAngleDeg.toFixed(1)}°) = {Math.cos(phaseAngle).toFixed(3)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

