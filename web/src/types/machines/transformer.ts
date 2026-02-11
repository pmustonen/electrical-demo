/**
 * Transformer-specific type definitions
 */

/**
 * Input parameters for AC transformer
 * Note: We explicitly include all MachineParams fields for clarity
 */
export interface TransformerParams {
  // Base MachineParams fields
  voltage: number;             // Primary voltage (V) - IMachine compatibility
  frequency: number;            // AC frequency (Hz)
  
  // Transformer-specific fields
  voltagePrimary: number;      // Same as voltage, kept for clarity
  turnsRatio: number;          // Turns ratio N1/N2
  inductanceMag: number;       // Magnetizing inductance (H)
  resistancePrimary: number;   // Primary winding resistance (Ω)
  resistanceSecondary: number; // Secondary winding resistance (Ω)
  resistanceLoad: number;      // Load resistance (Ω)
  
  // Index signature for IMachine compatibility
  [key: string]: number | string | boolean;
}

/**
 * Calculated transformer values
 * Extends base MachineValues with transformer-specific properties
 */
export interface TransformerValues {
  // Base MachineValues fields (explicitly included)
  powerActive: number;                // Active power (W)
  powerReactive: number;              // Reactive power (VAR)
  powerApparent: number;              // Apparent power (VA)
  powerFactor: number;                // Power factor (0-1)
  efficiency: number;                 // Efficiency (0-1)
  phaseAngle: number;                 // Phase angle (radians)
  
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
  
  // Index signature for IMachine compatibility
  [key: string]: number | string | boolean;
}
