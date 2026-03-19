/**
 * TypeScript type definitions for Electrical Machines Education App
 */

// Machine abstraction types
export * from './machine';

// Machine-specific types
export * from './machines/transformer';
export * from './machines/induction-motor';
export * from './machines/synchronous-motor';
export * from './machines/bess';

/**
 * Time-domain waveform data for voltage and current
 */
export interface WaveformData {
  time: number[];          // Time array (s)
  
  // Primary side
  v1: number[];           // Primary voltage V1(t) (V)
  i1: number[];           // Primary current I1(t) (A)
  
  // Secondary side
  v2: number[];           // Secondary voltage V2(t) (V)
  i2: number[];           // Secondary current I2(t) (A)
}

/**
 * Power calculation data showing p(t) = v(t) * i(t)
 */
export interface PowerCalculationData {
  time: number[];                  // Time array (s)
  voltage: number[];               // Voltage waveform v(t) (V)
  current: number[];               // Current waveform i(t) (A)
  powerInstantaneous: number[];    // Instantaneous power p(t) (W)
  
  // Integrated power values
  powerActive: number;             // Active power P (W)
  powerReactive: number;           // Reactive power Q (VAR)
  powerApparent: number;           // Apparent power S (VA)
  powerFactor: number;             // Power factor cos(phi)
  
  // Magnetizing power (only for primary side)
  powerMagnetizing: number[] | null;  // Pure magnetizing power p_mag(t) = v(t) * i_mag(t) (W)
}

/**
 * Side selection for power calculation visualization
 */
export type TransformerSide = 'primary' | 'secondary';
