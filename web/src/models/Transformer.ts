import type {
  TransformerParams,
  TransformerValues,
  WaveformData,
  PowerCalculationData,
  TransformerSide,
} from '../types';

/**
 * AC Transformer model with full electrical calculations
 * 
 * This class implements the physics of a single-phase AC transformer
 * including voltage transformation, current calculations, power analysis,
 * and time-domain waveform generation.
 */
export class Transformer {
  private params: TransformerParams;

  constructor(params: TransformerParams) {
    this.params = { ...params };
  }

  /**
   * Update transformer parameters
   */
  updateParams(params: Partial<TransformerParams>): void {
    this.params = { ...this.params, ...params };
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

    // Power factor and phase angle
    const powerFactor = P1 / S1;
    const phaseAngle = Math.acos(powerFactor);

    return {
      voltageSecondary: V2,
      voltageMagnetizing: Vmag,
      currentPrimary: I1,
      currentSecondary: I2,
      currentMagnetizing: Imag,
      currentLoad: Iload,
      powerActivePrimary: P1,
      powerReactivePrimary: Q1,
      powerApparentPrimary: S1,
      powerActiveSecondary: P2,
      powerReactiveSecondary: Q2,
      powerApparentSecondary: S2,
      powerLoad: Pload,
      powerReactiveMagnetizing: Qmag,
      powerFactor,
      phaseAngle,
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
    const I1 = values.currentPrimary;
    const I2 = values.currentSecondary;
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

    // Peak values (RMS × √2)
    const V1_peak = V1 * Math.sqrt(2);
    const V2_peak = V2 * Math.sqrt(2);
    const I1_peak = I1 * Math.sqrt(2);
    const I2_peak = I2 * Math.sqrt(2);

    // Generate waveforms
    const v1 = time.map(t => V1_peak * Math.sin(omega * t));
    const i1 = time.map(t => I1_peak * Math.sin(omega * t - phi));
    const v2 = time.map(t => V2_peak * Math.sin(omega * t));
    const i2 = time.map(t => I2_peak * Math.sin(omega * t - phi));

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
  getPowerCalculationData(
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
    
    // Reactive power from power triangle: Q = S × sin(φ)
    const phaseAngle = Math.acos(Math.max(-1, Math.min(1, powerFactor)));
    const powerReactive = powerApparent * Math.sin(phaseAngle);

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
