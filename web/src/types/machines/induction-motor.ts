/**
 * Induction Motor type definitions
 */

import type { MachineParams, MachineValues } from '../machine';

/**
 * Input parameters for 3-phase squirrel cage induction motor
 */
export interface InductionMotorParams extends MachineParams {
  poles: number;               // Number of poles (2, 4, 6, 8, etc.)
  
  // Stator parameters
  resistanceStator: number;    // Stator resistance per phase (Ω)
  reactanceStator: number;     // Stator reactance per phase (Ω)
  
  // Rotor parameters (referred to stator)
  resistanceRotor: number;     // Rotor resistance referred to stator (Ω)
  reactanceRotor: number;      // Rotor reactance referred to stator (Ω)
  
  // Magnetizing branch
  reactanceMag: number;        // Magnetizing reactance (Ω)
  
  // Mechanical load
  torqueLoad: number;          // Load torque (N·m)
  inertia: number;             // Rotor inertia (kg·m²)
}

/**
 * Calculated induction motor values
 */
export interface InductionMotorValues extends MachineValues {
  // Speeds
  speedSync: number;                  // Synchronous speed (RPM)
  speedRotor: number;                 // Rotor speed (RPM)
  slip: number;                       // Slip (0-1)
  
  // Currents
  currentStator: number;              // Stator current per phase (A)
  currentRotor: number;               // Rotor current referred to stator per phase (A)
  currentMag: number;                 // Magnetizing current per phase (A)
  
  // Powers
  powerInput: number;                 // Input electrical power — 3-phase total (W)
  powerAirgap: number;                // Power crossing air gap — 3-phase total (W)
  powerOutput: number;                // Mechanical output power (W)
  powerCopperStator: number;          // Stator copper loss — 3-phase total (W)
  powerCopperRotor: number;           // Rotor copper loss — 3-phase total (W)
  powerCore: number;                  // Core loss (W) - simplified
  
  // Torques
  torqueElectromagnetic: number;      // Electromagnetic torque (N·m)
  torqueOutput: number;               // Output torque (N·m)
}
