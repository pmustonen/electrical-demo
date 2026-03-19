/**
 * Transformer-specific type definitions
 */

import type { MachineParams, MachineValues } from '../machine';

/**
 * Input parameters for AC transformer
 */
export interface TransformerParams extends MachineParams {
  voltagePrimary: number;      // Same as voltage, kept for clarity (V)
  turnsRatio: number;          // Turns ratio N1/N2
  inductanceMag: number;       // Magnetizing inductance (H)
  resistancePrimary: number;   // Primary winding resistance (Ω)
  resistanceSecondary: number; // Secondary winding resistance (Ω)
  resistanceLoad: number;      // Load resistance (Ω)
}

/**
 * Calculated transformer values
 */
export interface TransformerValues extends MachineValues {
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
}
