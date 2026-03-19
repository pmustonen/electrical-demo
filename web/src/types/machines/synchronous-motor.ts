/**
 * Synchronous Motor Type Definitions
 * 
 * 3-phase synchronous motor with field excitation control.
 * Demonstrates leading, unity, and lagging power factor operation.
 */

import type { MachineParams, MachineValues } from '../machine';

/**
 * Synchronous motor parameters
 */
export interface SynchronousMotorParams extends MachineParams {
  /** Line-to-line voltage (V) */
  voltage: number;
  
  /** Supply frequency (Hz) */
  frequency: number;
  
  /** Number of poles */
  poles: number;
  
  /** Armature (stator) resistance per phase (Ω) */
  resistanceArmature: number;
  
  /** Synchronous reactance per phase (Ω) */
  reactanceSynchronous: number;
  
  /** Field excitation current (A) - Controls power factor! */
  excitationCurrent: number;
  
  /** Mechanical load torque (N·m) */
  torqueLoad: number;
  
  /** Rotor inertia (kg·m²) */
  inertia: number;
}

/**
 * Synchronous motor calculated values
 */
export interface SynchronousMotorValues extends MachineValues {
  /** Synchronous speed (RPM) - constant, no slip */
  speedSync: number;
  
  /** Load angle / torque angle (degrees) */
  loadAngle: number;
  
  /** Back EMF from field excitation (V) */
  backEMF: number;
  
  /** Armature current magnitude (A) */
  currentArmature: number;
  
  /** Electromagnetic torque (N·m) */
  torqueElectromagnetic: number;
  
  /** Mechanical output power (W) */
  powerMechanical: number;
}
