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
 * Time-domain waveform data for voltage and current.
 *
 * Convention: v1/i1 and v2/i2 are always **per-phase** waveforms (V/A).
 * For 3-phase machines the instantaneous power p(t) = 3 × v1(t) × i1(t).
 * For single-phase transformers p(t) = v1(t) × i1(t) directly.
 */
export interface WaveformData {
  time: number[];          // Time array (s)
  
  // Primary side — per-phase waveforms
  v1: number[];           // Primary voltage V1(t) (V, per-phase)
  i1: number[];           // Primary current I1(t) (A, per-phase)
  
  // Secondary side — per-phase waveforms
  v2: number[];           // Secondary voltage V2(t) (V, per-phase)
  i2: number[];           // Secondary current I2(t) (A, per-phase)
}

/**
 * Power calculation data for the instantaneous power visualization.
 *
 * Convention: powerActive/powerReactive/powerApparent are **3-phase totals** (W/VAR/VA).
 * powerInstantaneous is also scaled to 3-phase total for motors and BESS;
 * it remains single-phase for the transformer (which is a single-phase device).
 */
export interface PowerCalculationData {
  time: number[];                  // Time array (s)
  voltage: number[];               // Per-phase voltage waveform v(t) (V)
  current: number[];               // Per-phase current waveform i(t) (A)
  powerInstantaneous: number[];    // Instantaneous power p(t) — see convention above (W)
  
  // Power values — from the analytical model (authoritative single source of truth)
  powerActive: number;             // Active power P (W)
  powerReactive: number;           // Reactive power Q (VAR)
  powerApparent: number;           // Apparent power S (VA)
  powerFactor: number;             // Power factor cos(phi)
  
  // Magnetizing power (only for transformer primary side)
  powerMagnetizing: number[] | null;  // Pure magnetizing power p_mag(t) = v(t) × i_mag(t) (W)
}

/**
 * Side selection for power calculation visualization
 */
export type TransformerSide = 'primary' | 'secondary';
