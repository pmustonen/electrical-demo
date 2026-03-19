/**
 * Induction Motor type definitions
 */

/**
 * Input parameters for 3-phase squirrel cage induction motor
 */
export interface InductionMotorParams {
  // Base MachineParams fields
  voltage: number;             // Line voltage (V)
  frequency: number;           // Supply frequency (Hz)
  
  // Motor configuration
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
  
  // Index signature for IMachine compatibility
  [key: string]: number | string | boolean;
}

/**
 * Calculated induction motor values
 */
export interface InductionMotorValues {
  // Base MachineValues fields
  powerActive: number;                // Active power (W)
  powerReactive: number;              // Reactive power (VAR)
  powerApparent: number;              // Apparent power (VA)
  powerFactor: number;                // Power factor (0-1)
  efficiency: number;                 // Efficiency (0-1)
  phaseAngle: number;                 // Phase angle (radians)
  
  // Speeds
  speedSync: number;                  // Synchronous speed (RPM)
  speedRotor: number;                 // Rotor speed (RPM)
  slip: number;                       // Slip (0-1)
  
  // Currents
  currentStator: number;              // Stator current (A)
  currentRotor: number;               // Rotor current referred to stator (A)
  currentMag: number;                 // Magnetizing current (A)
  
  // Powers
  powerInput: number;                 // Input electrical power (W)
  powerAirgap: number;                // Power crossing air gap (W)
  powerOutput: number;                // Mechanical output power (W)
  powerCopperStator: number;          // Stator copper loss (W)
  powerCopperRotor: number;           // Rotor copper loss (W)
  powerCore: number;                  // Core loss (W) - simplified
  
  // Torques
  torqueElectromagnetic: number;      // Electromagnetic torque (N·m)
  torqueOutput: number;               // Output torque (N·m)
  
  // Index signature for IMachine compatibility
  [key: string]: number | string | boolean;
}
