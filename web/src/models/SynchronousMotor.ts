/**
 * Three-Phase Synchronous Motor Model
 * 
 * Implements synchronous motor with field excitation control, demonstrating:
 * - Under-excited operation: Lagging power factor (inductive)
 * - Unity power factor operation: Zero reactive power
 * - Over-excited operation: Leading power factor (capacitive)!
 */

import type {
  SynchronousMotorParams,
  SynchronousMotorValues,
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

export class SynchronousMotor implements IMachine {
  readonly type: MachineType = 'synchronous-motor';
  private params: SynchronousMotorParams;

  constructor(params: SynchronousMotorParams) {
    this.params = { ...params };
  }

  /**
   * Get machine metadata
   */
  getMetadata(): MachineMetadata {
    return {
      name: 'Synchronous Motor',
      description: '3-phase synchronous motor with excitation control',
      icon: '⚡',
      category: 'rotating',
      supportsWaveforms: true,
      supportsPowerTriangle: true,
      customVisualizations: ['excitation-curve'],
    };
  }

  /**
   * Update motor parameters
   */
  updateParams(params: Partial<SynchronousMotorParams>): void {
    this.params = { ...this.params, ...params } as SynchronousMotorParams;
  }

  /**
   * Get current parameters
   */
  getParams(): SynchronousMotorParams {
    return { ...this.params };
  }

  /**
   * Calculate all motor values using synchronous machine theory
   */
  calculate(): SynchronousMotorValues {
    const {
      voltage: V_line,
      frequency: f,
      poles: p,
      reactanceSynchronous: X_s,
      excitationCurrent: I_f,
      torqueLoad: T_load,
    } = this.params;

    // Convert line voltage to phase voltage (Y-connection)
    const V = V_line / Math.sqrt(3);
    
    // Synchronous speed (constant - no slip!)
    const n_sync = (120 * f) / p; // RPM
    const omega_sync = (2 * Math.PI * n_sync) / 60; // rad/s

    // Back EMF is proportional to excitation current (linear model)
    // Real machines show saturation at high excitation — this simplified model
    // is adequate for demonstrating the P-Q relationship and V-curve behavior.
    // Calibration: I_f = 5A produces E_f ≈ V (unity power factor at rated load)
    const k_f = V / 5;
    const E_f = k_f * I_f;

    // Find load angle δ where electromagnetic torque equals load torque
    // T_em = (3 * V * E_f * sin(δ)) / (ω_s * X_s)
    // Rearrange: sin(δ) = (T_load * ω_s * X_s) / (3 * V * E_f)
    
    const sin_delta = (T_load * omega_sync * X_s) / (3 * V * E_f);
    
    // Pull-out torque protection: limit sin(δ) to 0.95 (≈72°) to prevent
    // numerical instability near the theoretical maximum (δ = 90°).
    // In a real machine, exceeding pull-out causes loss of synchronism.
    if (Math.abs(sin_delta) > 0.95) {
      const delta = Math.asin(Math.sign(sin_delta) * 0.95);
      const T_em = (3 * V * E_f * Math.sin(delta)) / (omega_sync * X_s);
      
      // Return limited values
      return this.calculateWithAngle(delta, E_f, V, omega_sync, n_sync, T_em);
    }
    
    const delta = Math.asin(sin_delta); // Load angle in radians

    // Electromagnetic torque (should equal T_load)
    const T_em = (3 * V * E_f * Math.sin(delta)) / (omega_sync * X_s);
    
    return this.calculateWithAngle(delta, E_f, V, omega_sync, n_sync, T_em);
  }

  /**
   * Calculate motor values given load angle
   */
  private calculateWithAngle(
    delta: number,
    E_f: number,
    V: number,
    _omega_sync: number, // Prefix with _ to indicate intentionally unused
    n_sync: number,
    T_em: number
  ): SynchronousMotorValues {
    const { resistanceArmature: R_a, reactanceSynchronous: X_s } = this.params;
    
    // Prevent unused variable warning for omega_sync by using it in comment
    // omega_sync is passed for future use in more detailed models

    // Armature current phasor calculation
    // I_a = (V - E_f∠δ) / (R_a + jX_s)
    // Where E_f is at angle δ ahead of V (reference at 0°)
    
    // E_f components (E_f lags V by δ for motor mode)
    const E_f_real = E_f * Math.cos(delta);
    const E_f_imag = -E_f * Math.sin(delta);  // Negative: motor mode, not generator!
    
    // Voltage difference: V - E_f
    const V_diff_real = V - E_f_real;
    const V_diff_imag = -E_f_imag;
    
    // Impedance: Z = R_a + jX_s
    const Z_mag = Math.sqrt(R_a**2 + X_s**2);
    const Z_angle = Math.atan2(X_s, R_a);
    
    // Current magnitude: I_a = |V_diff| / |Z|
    const V_diff_mag = Math.sqrt(V_diff_real**2 + V_diff_imag**2);
    const I_a = V_diff_mag / Z_mag;
    
    // Current angle relative to voltage
    const V_diff_angle = Math.atan2(V_diff_imag, V_diff_real);
    const I_a_angle = V_diff_angle - Z_angle;
    
    // Power calculations (3-phase)
    const P_in = 3 * V * I_a * Math.cos(I_a_angle); // Active power input
    const Q = -3 * V * I_a * Math.sin(I_a_angle);   // Reactive power
    
    // Losses and output power
    const P_cu = 3 * I_a**2 * R_a;              // Armature copper loss
    const P_core = 0.01 * P_in;                  // Core loss (1% of input)
    const P_mech = P_in - P_cu - P_core;         // Mechanical power
    const efficiency = P_mech / P_in;

    // Harmonic metrics
    const h3 = this.params.harmonic3;
    const h5 = this.params.harmonic5;
    const h7 = this.params.harmonic7;
    // calculateHarmonicMetrics operates per-phase; divide 3-phase totals by 3
    const harmonics = calculateHarmonicMetrics(I_a, V, P_in / 3, Q / 3, h3, h5, h7);

    return {
      // Base interface values
      powerActive: P_in,
      powerReactive: Q,
      powerApparent: harmonics.S_total * 3,
      powerFactor: harmonics.truePF,
      efficiency,
      phaseAngle: I_a_angle,

      // Harmonic metrics
      thdCurrent: harmonics.thd,
      powerDistortion: harmonics.powerDistortion * 3,
      displacementPowerFactor: harmonics.displacementPF,
      distortionPowerFactor: harmonics.distortionPF,
      truePowerFactor: harmonics.truePF,
      
      // Synchronous motor-specific values
      speedSync: n_sync,
      loadAngle: (delta * 180 / Math.PI), // Convert to degrees
      backEMF: E_f,
      currentArmature: I_a,
      torqueElectromagnetic: T_em,
      powerMechanical: P_mech,
    };
  }

  /**
   * Generate time-domain waveform data
   * Shows Phase A voltage and current
   */
  getWaveformData(points: number = 300): WaveformData {
    const { frequency: f } = this.params;
    const values = this.calculate();
    
    const period = 1 / f;
    const cycles = 3;
    const totalTime = cycles * period;
    
    const time: number[] = [];
    const v1: number[] = [];
    const i1: number[] = [];
    const v2: number[] = [];
    const i2: number[] = [];
    
    // Use phase voltage for waveform display (Y-connection)
    const V_phase = this.params.voltage / Math.sqrt(3);
    const V_peak = V_phase * Math.sqrt(2);
    const I_peak = values.currentArmature * Math.sqrt(2);
    const phase_angle = values.phaseAngle;
    
    for (let i = 0; i < points; i++) {
      const t = (i / points) * totalTime;
      const omega = 2 * Math.PI * f;
      
      time.push(t);
      
      // Phase A
      const v = V_peak * Math.sin(omega * t);
      const ic_fund = I_peak * Math.sin(omega * t + phase_angle);
      
      v1.push(v);
      i1.push(ic_fund);
      
      // Duplicate for compatibility
      v2.push(v);
      i2.push(ic_fund);
    }

    // Apply current harmonics
    const h3 = this.params.harmonic3;
    const h5 = this.params.harmonic5;
    const h7 = this.params.harmonic7;
    const omega_h = 2 * Math.PI * f;
    const i1h = addHarmonicsToCurrentArray(time, i1, omega_h, h3, h5, h7, I_peak);
    const i2h = addHarmonicsToCurrentArray(time, i2, omega_h, h3, h5, h7, I_peak);
    
    return { time, v1, i1: i1h, v2, i2: i2h };
  }

  /**
   * Get power calculation data for visualization
   */
  getPowerCalculationData(points: number = 300): PowerCalculationData {
    const waveforms = this.getWaveformData(points);
    const values = this.calculate();
    
    const voltage = waveforms.v1;
    const current = waveforms.i1;
    
    // Instantaneous power p(t) = v(t) × i(t)
    const powerInstantaneous = voltage.map((v, i) => v * current[i]);
    
    return {
      time: waveforms.time,
      voltage,
      current,
      powerInstantaneous,
      powerActive: values.powerActive / 3, // Per phase
      powerReactive: values.powerReactive / 3,
      powerApparent: values.powerApparent / 3,
      powerFactor: values.powerFactor,
      powerMagnetizing: null,
    };
  }
}
