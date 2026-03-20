/**
 * BESS (Battery Energy Storage System) Model
 * 
 * Grid-forming inverter with independent active and reactive power control.
 * Demonstrates modern power electronics with decoupled P-Q control.
 */

import type {
  BessParams,
  BessValues,
  WaveformData,
  PowerCalculationData,
  IMachine,
  MachineType,
  MachineMetadata,
} from '../types';
import {
  addHarmonicsToCurrentArray,
  calculateHarmonicMetrics,
} from '../utils/harmonics';

export class Bess implements IMachine {
  readonly type: MachineType = 'bess';
  private params: BessParams;

  constructor(params: BessParams) {
    this.params = { ...params };
  }

  /**
   * Get machine metadata
   */
  getMetadata(): MachineMetadata {
    return {
      name: 'Battery Energy Storage',
      description: 'Grid-forming inverter with independent P-Q control',
      icon: '🔋',
      category: 'rotating',
      supportsWaveforms: true,
      supportsPowerTriangle: true,
      customVisualizations: ['soc-gauge', 'pq-capability'],
    };
  }

  /**
   * Update BESS parameters
   */
  updateParams(params: Partial<BessParams>): void {
    this.params = { ...this.params, ...params } as BessParams;
  }

  /**
   * Get current parameters
   */
  getParams(): BessParams {
    return { ...this.params };
  }

  /**
   * Calculate BESS values with P-Q control
   */
  calculate(): BessValues {
    const {
      voltage: V_line,
      powerRated: P_rated_kW,
      powerSetpoint: P_set_kW,
      reactiveSetpoint: Q_set_kvar,
      efficiency: eff_percent,
      socInitial,
      priorityMode,
    } = this.params;

    // Convert to base units (W, var)
    const P_rated = P_rated_kW * 1000;
    // Inverter rated apparent power: typically 10% above active power rating
    // to allow simultaneous P and Q delivery
    const S_rated = P_rated * 1.1;
    const P_requested = P_set_kW * 1000;
    const Q_requested = Q_set_kvar * 1000;

    // Apply P-Q capability curve based on priority mode
    let P_actual = P_requested;
    let Q_actual = Q_requested;
    
    if (priorityMode === 'active') {
      // ACTIVE POWER PRIORITY: Deliver requested P, reduce Q to fit
      if (Math.abs(P_actual) > S_rated) {
        // P alone exceeds rating - limit it
        P_actual = Math.sign(P_actual) * S_rated;
        Q_actual = 0; // No capacity left for Q
      } else {
        // P is within limit - check if P+Q fits
        const S_requested = Math.sqrt(P_actual ** 2 + Q_actual ** 2);
        
        if (S_requested > S_rated) {
          // Reduce Q to fit, keep P as requested
          // S_rated² = P² + Q_max²
          // Q_max = √(S_rated² - P²)
          const Q_max = Math.sqrt(S_rated ** 2 - P_actual ** 2);
          Q_actual = Math.sign(Q_actual) * Q_max;
        }
      }
    } else {
      // REACTIVE POWER PRIORITY: Deliver requested Q, reduce P to fit
      if (Math.abs(Q_actual) > S_rated) {
        // Q alone exceeds rating - limit it
        Q_actual = Math.sign(Q_actual) * S_rated;
        P_actual = 0; // No capacity left for P
      } else {
        // Q is within limit - check if P+Q fits
        const S_requested = Math.sqrt(P_actual ** 2 + Q_actual ** 2);
        
        if (S_requested > S_rated) {
          // Reduce P to fit, keep Q as requested
          // S_rated² = Q² + P_max²
          // P_max = √(S_rated² - Q²)
          const P_max = Math.sqrt(S_rated ** 2 - Q_actual ** 2);
          P_actual = Math.sign(P_actual) * P_max;
        }
      }
    }

    // Calculate apparent power
    const S = Math.sqrt(P_actual ** 2 + Q_actual ** 2);
    
    // Phase angle convention (consistent with all machine models):
    // Negative = current lags voltage (inductive), Positive = current leads (capacitive)
    // Q > 0 (inductive) → atan2 > 0 → negate to get negative (lagging)
    // Q < 0 (capacitive) → atan2 < 0 → negate to get positive (leading)
    const phi = -Math.atan2(Q_actual, P_actual);

    // Grid current and harmonic metrics (3-phase)
    const V_phase = V_line / Math.sqrt(3);
    const I_grid = S / (3 * V_phase);

    // Determine operating mode
    const mode = this.getOperatingMode(P_actual, Q_actual);

    // P-Q utilization
    const utilization = (S / S_rated) * 100;

    // Efficiency (simplified: constant efficiency)
    const efficiency = eff_percent / 100;

    // Harmonic metrics
    const I_rms_fund = S / (3 * V_phase);
    const h3 = this.params.harmonic3;
    const h5 = this.params.harmonic5;
    const h7 = this.params.harmonic7;
    // calculateHarmonicMetrics operates per-phase; divide 3-phase totals by 3
    const harmonics = calculateHarmonicMetrics(I_rms_fund, V_phase, P_actual / 3, Q_actual / 3, h3, h5, h7);

    return {
      // Standard machine interface
      powerActive: P_actual,
      powerReactive: Q_actual,
      powerApparent: harmonics.S_total * 3,
      powerFactor: harmonics.truePF,
      efficiency,
      phaseAngle: phi,

      // Harmonic metrics
      thdCurrent: harmonics.thd,
      powerDistortion: harmonics.powerDistortion * 3,
      displacementPowerFactor: harmonics.displacementPF,
      distortionPowerFactor: harmonics.distortionPF,
      truePowerFactor: harmonics.truePF,

      // BESS-specific values
      stateOfCharge: socInitial, // Static - no time integration
      currentGrid: I_grid,
      operatingMode: mode,
      utilizationPQ: utilization,
      powerRequested: P_requested / 1000,
      reactiveRequested: Q_requested / 1000,
    };
  }

  /**
   * Determine operating mode from P and Q
   */
  private getOperatingMode(P: number, Q: number): string {
    const P_threshold = 1000; // 1 kW
    const Q_threshold = 1000; // 1 kvar

    // Pure reactive support (no active power)
    if (Math.abs(P) < P_threshold && Math.abs(Q) > Q_threshold) {
      return Q < 0 ? 'Reactive Support (Capacitive)' : 'Reactive Support (Inductive)';
    }

    // Charging (negative power)
    if (P < -P_threshold) {
      if (Math.abs(Q) < Q_threshold) return 'Charging (Unity PF)';
      return Q < 0 ? 'Charging (Capacitive)' : 'Charging (Inductive)';
    }

    // Discharging (positive power)
    if (P > P_threshold) {
      if (Math.abs(Q) < Q_threshold) return 'Discharging (Unity PF)';
      return Q < 0 ? 'Discharging (Capacitive)' : 'Discharging (Inductive)';
    }

    // Standby
    return 'Standby';
  }

  /**
   * Generate voltage and current waveforms
   */
  getWaveformData(): WaveformData {
    const values = this.calculate();
    const { voltage: V_line, frequency: f } = this.params;

    const phi = values.phaseAngle; // Phase angle between V and I

    // Phase voltage
    const V_phase = V_line / Math.sqrt(3);
    const V_peak = V_phase * Math.sqrt(2);

    // Use the fundamental current (currentGrid is computed from displacement S, not S_total).
    // Using S_total here would inflate the fundamental and erroneously increase P.
    const I_fund_rms = values.currentGrid;
    const I_peak = I_fund_rms * Math.sqrt(2);
    const cycles = 2;
    const samples_per_cycle = 100;
    const num_samples = cycles * samples_per_cycle;
    const dt = 1 / (f * samples_per_cycle);

    const time: number[] = [];
    const v1: number[] = [];
    const i1: number[] = [];

    const omega = 2 * Math.PI * f;

    for (let i = 0; i < num_samples; i++) {
      const t = i * dt;
      time.push(t);

      // Voltage (reference at 0°)
      v1.push(V_peak * Math.sin(omega * t));

      // Fundamental current
      i1.push(I_peak * Math.sin(omega * t - phi));
    }

    // Apply current harmonics
    const h3 = this.params.harmonic3;
    const h5 = this.params.harmonic5;
    const h7 = this.params.harmonic7;
    const i1h = addHarmonicsToCurrentArray(time, i1, omega, h3, h5, h7, I_peak);

    // For BESS, v2/i2 are not used (single-sided)
    return {
      time,
      v1,
      i1: i1h,
      v2: time.map(() => 0),
      i2: time.map(() => 0),
    };
  }

  /**
   * Get power calculation data for visualization
   */
  getPowerCalculationData(): PowerCalculationData {
    const waveforms = this.getWaveformData();
    const values = this.calculate();

    // Calculate instantaneous per-phase power p(t) = v(t) × i(t)
    const powerInstantaneousPerPhase = waveforms.v1.map((v, i) => v * waveforms.i1[i]);

    // Scale to total 3-phase to match powerReactive and powerApparent (both 3-phase totals)
    const powerInstantaneous = powerInstantaneousPerPhase.map(p => p * 3);

    return {
      time: waveforms.time,
      voltage: waveforms.v1,
      current: waveforms.i1,
      powerInstantaneous,
      powerActive: values.powerActive,
      powerReactive: values.powerReactive,
      powerApparent: values.powerApparent,
      powerFactor: values.powerFactor,
      powerMagnetizing: null,
    };
  }
}
