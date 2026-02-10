/**
 * TypeScript type definitions for AC Transformer Education App
 */

/**
 * Input parameters for the transformer
 */
export interface TransformerParams {
  voltagePrimary: number;      // Primary voltage (V)
  frequency: number;            // AC frequency (Hz)
  turnsRatio: number;          // Turns ratio N1/N2
  inductanceMag: number;       // Magnetizing inductance (H)
  resistancePrimary: number;   // Primary winding resistance (Ω)
  resistanceSecondary: number; // Secondary winding resistance (Ω)
  resistanceLoad: number;      // Load resistance (Ω)
}

/**
 * Calculated transformer values
 */
export interface TransformerValues {
  // Voltages
  voltageSecondary: number;           // V2 (V)
  voltageMagnetizing: number;         // Vmag (V)
  
  // Currents
  currentPrimary: number;             // I1 (A)
  currentSecondary: number;           // I2 (A)
  currentMagnetizing: number;         // Imag (A)
  currentLoad: number;                // Iload (A)
  
  // Power - Primary side
  powerActivePrimary: number;         // P1 (W)
  powerReactivePrimary: number;       // Q1 (VAR)
  powerApparentPrimary: number;       // S1 (VA)
  
  // Power - Secondary side
  powerActiveSecondary: number;       // P2 (W)
  powerReactiveSecondary: number;     // Q2 (VAR)
  powerApparentSecondary: number;     // S2 (VA)
  
  // Power - Load
  powerLoad: number;                  // Pload (W)
  
  // Power - Magnetizing
  powerReactiveMagnetizing: number;   // Qmag (VAR)
  
  // Phase angle
  powerFactor: number;                // cos(φ)
  phaseAngle: number;                 // φ (radians)
}

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
 * Power calculation data showing p(t) = v(t) × i(t)
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
  powerFactor: number;             // Power factor cos(φ)
  
  // Magnetizing power (only for primary side)
  powerMagnetizing: number[] | null;  // Pure magnetizing power p_mag(t) = v(t) × i_mag(t) (W)
}

/**
 * Side selection for power calculation visualization
 */
export type TransformerSide = 'primary' | 'secondary';
