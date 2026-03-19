import type {
  TransformerParams,
  TransformerValues,
  WaveformData,
  PowerCalculationData,
  TransformerSide,
  IMachine,
  MachineType,
  MachineMetadata,
} from '../types';
import {
  addHarmonicsToCurrentArray,
  calculateHarmonicMetrics,
} from '../utils/harmonics';

/**
 * AC Transformer model with full electrical calculations
 * 
 * This class implements the physics of a single-phase AC transformer
 * including voltage transformation, current calculations, power analysis,
 * and time-domain waveform generation.
 * 
 * Implements IMachine interface for compatibility with multi-machine platform.
 */
export class Transformer implements IMachine {
  readonly type: MachineType = 'transformer';
  private params: TransformerParams;

  constructor(params: TransformerParams) {
    // Ensure voltage alias matches voltagePrimary
    const voltage = params.voltagePrimary || params.voltage;
    this.params = { 
      ...params,
      voltage,
      voltagePrimary: voltage,
    };
  }

  /**
   * Get machine metadata for UI rendering
   */
  getMetadata(): MachineMetadata {
    return {
      name: 'AC Transformer',
      description: 'Single-phase power transformer with magnetizing inductance',
      icon: '⚡',
      category: 'static',
      supportsWaveforms: true,
      supportsPowerTriangle: true,
    };
  }

  /**
   * Update transformer parameters
   */
  updateParams(params: Partial<TransformerParams>): void {
    this.params = { ...this.params, ...params } as TransformerParams;
    // Keep voltage alias in sync with voltagePrimary
    if (params.voltagePrimary !== undefined) {
      this.params.voltage = params.voltagePrimary;
    } else if (params.voltage !== undefined) {
      this.params.voltagePrimary = params.voltage;
    }
  }

  /**
   * Get current parameters
   */
  getParams(): TransformerParams {
    return { ...this.params };
  }

  /**
   * Calculate all transformer values
   */
  calculate(): TransformerValues {
    const {
      voltagePrimary: V1,
      frequency: f,
      turnsRatio: n,
      inductanceMag: Lmag,
      resistancePrimary: R1,
      resistanceSecondary: R2,
      resistanceLoad: Rload,
    } = this.params;

    // Angular frequency
    const omega = 2 * Math.PI * f;

    // Magnetizing reactance
    const Xmag = omega * Lmag;

    // Iterative solution needed since I1 affects Vmag which affects Imag which affects I1
    // Start with approximation
    let I1 = 0.1; // Initial guess
    let I2_reflected = 0;
    let Imag = 0;
    let Vmag = V1;
    let V2 = V1 / n;
    let I2 = 0;
    
    // Iterate to converge (usually 3-5 iterations enough)
    for (let iter = 0; iter < 10; iter++) {
      // Magnetizing voltage after R1 drop
      Vmag = V1 - I1 * R1;
      
      // Secondary voltage (ideal transformation from magnetizing voltage)
      V2 = Vmag / n;
      
      // Load current
      I2 = V2 / (R2 + Rload);
      
      // Current reflected to primary
      I2_reflected = I2 / n;
      
      // Magnetizing current
      Imag = Vmag / Xmag;
      
      // Total primary current (phasor sum)
      const I1_new = Math.sqrt(I2_reflected ** 2 + Imag ** 2);
      
      // Check convergence
      if (Math.abs(I1_new - I1) < 0.0001) {
        I1 = I1_new;
        break;
      }
      I1 = I1_new;
    }
    
    const Iload = I2;

    // Power calculations - Primary side
    const P1 = V1 * I2_reflected;  // Active power (resistive component)
    const Q1 = V1 * Imag;          // Reactive power (magnetizing)
    const S1 = V1 * I1;            // Apparent power

    // Power calculations - Secondary side
    const P2 = V2 * I2;
    const Q2 = 0;  // No reactive component on secondary (resistive load)
    const S2 = V2 * I2;

    // Load power
    const Pload = I2 ** 2 * Rload;

    // Magnetizing reactive power
    const Qmag = Q1;

    // Power factor and phase angle (displacement, from fundamental only)
    const powerFactor = P1 / S1;
    // Phase angle for inductive load (negative because current lags voltage)
    const phaseAngle = -Math.acos(powerFactor);
    
    // Efficiency (output power / input power)
    const efficiency = P2 / P1;

    // Harmonic metrics
    const h3 = (this.params.harmonic3 as number) ?? 0;
    const h5 = (this.params.harmonic5 as number) ?? 0;
    const h7 = (this.params.harmonic7 as number) ?? 0;
    const harmonics = calculateHarmonicMetrics(I1, V1, P1, Q1, h3, h5, h7);
    const powerApparentTrue = harmonics.S_total;
    const powerFactorTrue = harmonics.truePF;

    return {
      voltageSecondary: V2,
      voltageMagnetizing: Vmag,
      currentPrimary: harmonics.I_total_rms,
      currentSecondary: I2,
      currentMagnetizing: Imag,
      currentLoad: Iload,
      powerActivePrimary: P1,
      powerReactivePrimary: Q1,
      powerApparentPrimary: powerApparentTrue,
      powerActiveSecondary: P2,
      powerReactiveSecondary: Q2,
      powerApparentSecondary: S2,
      powerLoad: Pload,
      powerReactiveMagnetizing: Qmag,
      powerFactor: powerFactorTrue,
      phaseAngle,
      // Base interface values (for IMachine compatibility)
      powerActive: P1,
      powerReactive: Q1,
      powerApparent: powerApparentTrue,
      efficiency,
      // Harmonic distortion metrics
      thdCurrent: harmonics.thd,
      powerDistortion: harmonics.powerDistortion,
      displacementPowerFactor: harmonics.displacementPF,
      distortionPowerFactor: harmonics.distortionPF,
      truePowerFactor: harmonics.truePF,
    };
  }

  /**
   * Generate time-domain waveform data
   * 
   * Creates voltage and current waveforms for both primary and secondary sides
   * over 3-4 AC cycles for visualization.
   * 
   * @param cycles - Number of AC cycles to generate (default: 3)
   * @param pointsPerCycle - Number of data points per cycle (default: 100)
   */
  getWaveformData(cycles: number = 3, pointsPerCycle: number = 100): WaveformData {
    const { voltagePrimary: V1, frequency: f } = this.params;
    const values = this.calculate();
    
    const V2 = values.voltageSecondary;
    const phi = values.phaseAngle;

    // Time array
    const totalPoints = cycles * pointsPerCycle;
    const period = 1 / f;
    const dt = (cycles * period) / totalPoints;
    const time: number[] = [];
    
    for (let i = 0; i < totalPoints; i++) {
      time.push(i * dt);
    }

    // Angular frequency
    const omega = 2 * Math.PI * f;

    // Harmonic amplitudes — needed to recover the fundamental current from I_total_rms
    const h3 = (this.params.harmonic3 as number) ?? 0;
    const h5 = (this.params.harmonic5 as number) ?? 0;
    const h7 = (this.params.harmonic7 as number) ?? 0;
    const thd = Math.sqrt(h3 ** 2 + h5 ** 2 + h7 ** 2);

    // values.currentPrimary is I_total_rms (what a clamp meter would read).
    // Recover the fundamental RMS so the base sinusoid carries correct P.
    // I_fund = I_total / √(1 + THD²)
    const I1_fund = (values.currentPrimary as number) / Math.sqrt(1 + thd ** 2);
    const I2_fund = (values.currentSecondary as number); // secondary not inflated

    // Peak values (RMS × √2)
    const V1_peak = V1 * Math.sqrt(2);
    const V2_peak = V2 * Math.sqrt(2);
    const I1_peak = I1_fund * Math.sqrt(2);   // fundamental peak
    const I2_peak = I2_fund * Math.sqrt(2);

    // Generate waveforms
    const v1 = time.map(t => V1_peak * Math.sin(omega * t));
    const v2 = time.map(t => V2_peak * Math.sin(omega * t));

    // Fundamental current waveforms
    const i1_fund = time.map(t => I1_peak * Math.sin(omega * t - phi));
    const i2_fund = time.map(t => I2_peak * Math.sin(omega * t - phi));

    // Apply current harmonics (harmonic amplitudes scale from the fundamental peak)
    const i1 = addHarmonicsToCurrentArray(time, i1_fund, omega, h3, h5, h7, I1_peak);
    const i2 = addHarmonicsToCurrentArray(time, i2_fund, omega, h3, h5, h7, I2_peak);

    return { time, v1, i1, v2, i2 };
  }

  /**
   * Generate power calculation data showing p(t) = v(t) × i(t)
   * 
   * Calculates instantaneous power and demonstrates how active (P),
   * reactive (Q), and apparent (S) power are derived from the waveforms.
   * 
   * @param side - Which side to calculate ('primary' or 'secondary')
   * @param cycles - Number of AC cycles (default: 3)
   * @param pointsPerCycle - Points per cycle (default: 100)
   */
  /**
   * Get power calculation data (IMachine interface implementation)
   * @param points - Number of points to generate (uses pointsPerCycle internally)
   */
  getPowerCalculationData(points?: number): PowerCalculationData {
    const pointsPerCycle = points ? Math.floor(points / 3) : 100;
    return this.getPowerCalculationDataForSide('primary', 3, pointsPerCycle);
  }

  /**
   * Get power calculation data for specific transformer side
   * @param side - Which side to calculate power for
   * @param cycles - Number of AC cycles
   * @param pointsPerCycle - Points per cycle
   */
  getPowerCalculationDataForSide(
    side: TransformerSide = 'primary',
    cycles: number = 3,
    pointsPerCycle: number = 100
  ): PowerCalculationData {
    const waveforms = this.getWaveformData(cycles, pointsPerCycle);
    const values = this.calculate();
    const { frequency: f } = this.params;

    // Select voltage and current based on side
    const voltage = side === 'primary' ? waveforms.v1 : waveforms.v2;
    const current = side === 'primary' ? waveforms.i1 : waveforms.i2;

    // Calculate instantaneous power p(t) = v(t) × i(t)
    const powerInstantaneous = voltage.map((v, i) => v * current[i]);

    // Active power = average of instantaneous power
    const powerActive = powerInstantaneous.reduce((sum, p) => sum + p, 0) / powerInstantaneous.length;
    
    // Apparent power and power factor
    const powerApparent = side === 'primary'
      ? values.powerApparentPrimary
      : values.powerApparentSecondary;

    const powerFactor = values.powerFactor;

    // Use displacement reactive power directly — it equals V×I×sin(φ₁) and is
    // what the Power Triangle also shows. Computing Q as S×sin(acos(truePF))
    // would give √(Q²+D²) which conflates reactive and distortion power.
    const powerReactive = side === 'primary'
      ? values.powerReactivePrimary
      : values.powerReactiveSecondary;

    // Generate pure magnetizing power waveform (only for primary side)
    // p_mag(t) = v(t) × i_mag(t) where i_mag lags v by 90°
    const powerMagnetizing = side === 'primary' ? (() => {
      const omega = 2 * Math.PI * f;
      const V1_peak = this.params.voltagePrimary * Math.sqrt(2);
      const Imag_peak = values.currentMagnetizing * Math.sqrt(2);
      return waveforms.time.map(t => 
        V1_peak * Math.sin(omega * t) * Imag_peak * Math.sin(omega * t - Math.PI / 2)
      );
    })() : null;

    return {
      time: waveforms.time,
      voltage,
      current,
      powerInstantaneous,
      powerActive,
      powerReactive,
      powerApparent,
      powerMagnetizing,
      powerFactor,
    };
  }
}
