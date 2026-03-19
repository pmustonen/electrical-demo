/**
 * Three-Phase Squirrel Cage Induction Motor Model
 * 
 * Implements complete AC induction motor physics including:
 * - Equivalent circuit calculations
 * - Torque-slip characteristics
 * - Power flow and efficiency
 * - Time-domain waveform generation
 */

import type {
  InductionMotorParams,
  InductionMotorValues,
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

export class InductionMotor implements IMachine {
  readonly type: MachineType = 'induction-motor';
  private params: InductionMotorParams;

  constructor(params: InductionMotorParams) {
    this.params = { ...params };
  }

  /**
   * Get machine metadata
   */
  getMetadata(): MachineMetadata {
    return {
      name: 'Induction Motor',
      description: '3-phase squirrel cage induction motor',
      icon: '🔌',
      category: 'rotating',
      supportsWaveforms: true,
      supportsPowerTriangle: true,
      customVisualizations: ['torque-speed-curve'],
    };
  }

  /**
   * Update motor parameters
   */
  updateParams(params: Partial<InductionMotorParams>): void {
    this.params = { ...this.params, ...params } as InductionMotorParams;
  }

  /**
   * Get current parameters
   */
  getParams(): InductionMotorParams {
    return { ...this.params };
  }

  /**
   * Calculate all motor values using equivalent circuit model
   */
  calculate(): InductionMotorValues {
    const {
      voltage: V_line,
      frequency: f,
      poles: p,
      resistanceStator: R1,
      reactanceStator: X1,
      resistanceRotor: R2,
      reactanceRotor: X2,
      reactanceMag: Xm,
      torqueLoad: T_load,
    } = this.params;

    // Convert line voltage to phase voltage (Y-connection assumed)
    const V = V_line / Math.sqrt(3);
    
    // Synchronous speed (RPM)
    const n_sync = (120 * f) / p;
    const omega_sync = (2 * Math.PI * n_sync) / 60; // rad/s

    // Find operating slip through iterative torque balance
    let slip = 0.05; // Initial guess (5%)
    
    // Iterate to find slip where electromagnetic torque equals load torque
    for (let iter = 0; iter < 50; iter++) {
      const T_em = this.calculateTorque(slip);
      const error = T_em - T_load;
      
      if (Math.abs(error) < 0.01) break;
      
      // Adjust slip based on error (simple gradient descent)
      const dT_ds = (this.calculateTorque(slip + 0.001) - T_em) / 0.001;
      if (Math.abs(dT_ds) > 0.1) {
        slip -= error / dT_ds * 0.5; // Damped adjustment
      }
      
      // Keep slip in reasonable bounds
      slip = Math.max(0.001, Math.min(0.99, slip));
    }

    // Rotor speed
    const n_rotor = n_sync * (1 - slip);
    const omega_rotor = omega_sync * (1 - slip);

    // Equivalent impedance calculations
    const R2_s = R2 / slip; // Rotor resistance divided by slip
    
    // Parallel combination of magnetizing branch and rotor branch
    const Z_rotor_real = R2_s;
    const Z_rotor_imag = X2;
    const Z_mag_imag = Xm;
    
    // Parallel impedance: 1/Z_parallel = 1/Z_rotor + 1/Z_mag
    const Y_rotor_real = Z_rotor_real / (Z_rotor_real**2 + Z_rotor_imag**2);
    const Y_rotor_imag = -Z_rotor_imag / (Z_rotor_real**2 + Z_rotor_imag**2);
    const Y_mag_imag = -1/Z_mag_imag;
    
    const Y_parallel_real = Y_rotor_real;
    const Y_parallel_imag = Y_rotor_imag + Y_mag_imag;
    
    const Z_parallel_mag = 1 / Math.sqrt(Y_parallel_real**2 + Y_parallel_imag**2);
    const Z_parallel_angle = Math.atan2(-Y_parallel_imag, Y_parallel_real);
    const Z_parallel_real = Z_parallel_mag * Math.cos(Z_parallel_angle);
    const Z_parallel_imag = Z_parallel_mag * Math.sin(Z_parallel_angle);
    
    // Total impedance
    const Z_total_real = R1 + Z_parallel_real;
    const Z_total_imag = X1 + Z_parallel_imag;
    const Z_total_mag = Math.sqrt(Z_total_real**2 + Z_total_imag**2);
    
    // Stator current
    const I1 = V / Z_total_mag;
    const I1_angle = -Math.atan2(Z_total_imag, Z_total_real);
    
    // Voltage across parallel branch
    const V_parallel = I1 * Z_parallel_mag;
    
    // Magnetizing current
    const I_mag = V_parallel / Xm;
    
    // Rotor current (referred to stator)
    const Z_rotor_mag = Math.sqrt(Z_rotor_real**2 + Z_rotor_imag**2);
    const I2 = V_parallel / Z_rotor_mag;
    
    // Power calculations
    const P_in = 3 * V * I1 * Math.cos(I1_angle); // 3-phase input power
    const P_cu_stator = 3 * I1**2 * R1; // Stator copper loss
    const P_airgap = P_in - P_cu_stator; // Power crossing air gap
    const P_cu_rotor = 3 * I2**2 * R2; // Rotor copper loss
    const P_out = P_airgap - P_cu_rotor; // Mechanical output power
    const P_core = 0.02 * P_in; // Core loss (simplified, ~2% of input)
    
    // Torques
    const T_em = P_airgap / omega_sync; // Electromagnetic torque
    const T_out = P_out / omega_rotor; // Output torque
    
    // Power factor and efficiency
    const efficiency = P_out / P_in;
    
    // Reactive and apparent power
    // Note: I1_angle is negative (current lags voltage for inductive motor)
    // Q must be positive for inductive load (motor consumes reactive power)
    // Therefore negate: Q = -V*I*sin(negative) = positive
    const Q = -3 * V * I1 * Math.sin(I1_angle);

    // Harmonic metrics (applied to stator current)
    const h3 = this.params.harmonic3;
    const h5 = this.params.harmonic5;
    const h7 = this.params.harmonic7;
    // calculateHarmonicMetrics operates per-phase; divide 3-phase totals by 3
    const harmonics = calculateHarmonicMetrics(I1, V, P_in / 3, Q / 3, h3, h5, h7);

    return {
      // Base interface values
      powerActive: P_in,
      powerReactive: Q,
      powerApparent: harmonics.S_total * 3,
      powerFactor: harmonics.truePF,
      efficiency,
      phaseAngle: I1_angle,

      // Harmonic metrics
      thdCurrent: harmonics.thd,
      powerDistortion: harmonics.powerDistortion * 3,
      displacementPowerFactor: harmonics.displacementPF,
      distortionPowerFactor: harmonics.distortionPF,
      truePowerFactor: harmonics.truePF,
      
      // Motor-specific values
      speedSync: n_sync,
      speedRotor: n_rotor,
      slip,
      
      currentStator: I1,
      currentRotor: I2,
      currentMag: I_mag,
      
      powerInput: P_in,
      powerAirgap: P_airgap,
      powerOutput: P_out,
      powerCopperStator: P_cu_stator,
      powerCopperRotor: P_cu_rotor,
      powerCore: P_core,
      
      torqueElectromagnetic: T_em,
      torqueOutput: T_out,
    };
  }

  /**
   * Calculate electromagnetic torque for a given slip
   * Used for torque-slip curve and operating point calculation
   */
  private calculateTorque(slip: number): number {
    const { voltage: V, frequency: f, poles: p, resistanceStator: R1, reactanceStator: X1,
            resistanceRotor: R2, reactanceRotor: X2, reactanceMag: Xm } = this.params;
    
    if (slip < 0.0001) return 0;
    
    const n_sync = (120 * f) / p;
    const omega_sync = (2 * Math.PI * n_sync) / 60;
    
    const R2_s = R2 / slip;
    
    // Thevenin equivalent for simplified torque calculation
    const V_th = V * Xm / Math.sqrt((R1)**2 + (X1 + Xm)**2);
    const R_th = R1 * Xm**2 / ((R1)**2 + (X1 + Xm)**2);
    const X_th = (X1 * Xm**2 + X1 * Xm * X1) / ((R1)**2 + (X1 + Xm)**2);
    
    // Torque formula
    const T = (3 / omega_sync) * (V_th**2 * R2_s) / ((R_th + R2_s)**2 + (X_th + X2)**2);
    
    return T;
  }

  /**
   * Generate time-domain waveform data
   * Shows Phase A voltage and current (single phase)
   * Note: v2/i2 fields populated for compatibility but represent same phase
   */
  getWaveformData(points: number = 300): WaveformData {
    const { frequency: f } = this.params;
    const values = this.calculate();
    
    const period = 1 / f;
    const cycles = 3;
    const totalTime = cycles * period;
    
    const time: number[] = [];
    const v1: number[] = []; // Phase A voltage (phase-to-neutral)
    const i1: number[] = []; // Phase A current
    const v2: number[] = []; // Duplicate of Phase A for compatibility
    const i2: number[] = []; // Duplicate of Phase A for compatibility
    
    // Use phase voltage for waveform display (Y-connection)
    const V_phase = this.params.voltage / Math.sqrt(3);
    const V_peak = V_phase * Math.sqrt(2);
    const I_peak = values.currentStator * Math.sqrt(2);
    const phase_angle = values.phaseAngle;
    
    for (let i = 0; i < points; i++) {
      const t = (i / points) * totalTime;
      const omega = 2 * Math.PI * f;
      
      time.push(t); // Time in seconds (NOT milliseconds)
      
      // Phase A
      const v = V_peak * Math.sin(omega * t);
      const ic_fund = I_peak * Math.sin(omega * t + phase_angle);
      
      v1.push(v);
      v2.push(v);

      i1.push(ic_fund);
      i2.push(ic_fund);
    }

    // Apply current harmonics after loop
    const h3 = this.params.harmonic3;
    const h5 = this.params.harmonic5;
    const h7 = this.params.harmonic7;
    const omega = 2 * Math.PI * f;
    const i1h = addHarmonicsToCurrentArray(time, i1, omega, h3, h5, h7, I_peak);
    const i2h = addHarmonicsToCurrentArray(time, i2, omega, h3, h5, h7, I_peak);
    
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
      powerMagnetizing: null, // Not applicable for motor
    };
  }
}
