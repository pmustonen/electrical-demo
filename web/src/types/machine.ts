/**
 * Core interfaces for electrical machine abstraction
 * 
 * This module defines the common interface that all electrical machines
 * (transformers, motors, generators, etc.) must implement to work with
 * the educational platform's visualization and control components.
 */

import type { WaveformData, PowerCalculationData } from './index';

/**
 * Supported machine types
 */
export type MachineType = 
  | 'transformer' 
  | 'induction-motor'
  | 'synchronous-motor'
  | 'bess'
  | 'dc-motor' 
  | 'synchronous-generator';

/**
 * Machine category for grouping and UI organization
 */
export type MachineCategory = 'static' | 'rotating' | 'converter';

/**
 * Base interface that all electrical machines must implement
 */
export interface IMachine {
  /** Unique identifier for machine type */
  readonly type: MachineType;
  
  /** Get current machine parameters */
  getParams(): MachineParams;
  
  /** Update machine parameters (partial update supported) */
  updateParams(params: Partial<MachineParams>): void;
  
  /** Calculate all electrical values based on current parameters */
  calculate(): MachineValues;
  
  /** Generate time-domain waveform data for visualization */
  getWaveformData(points?: number): WaveformData;
  
  /** Get power calculation data for instantaneous power chart */
  getPowerCalculationData(points?: number): PowerCalculationData;
  
  /** Get machine-specific metadata for UI rendering */
  getMetadata(): MachineMetadata;
}

/**
 * Metadata describing machine capabilities and characteristics
 */
export interface MachineMetadata {
  /** Display name of the machine */
  name: string;
  
  /** Brief description for tooltips/help */
  description: string;
  
  /** Icon/emoji for UI */
  icon: string;
  
  /** Category for grouping */
  category: MachineCategory;
  
  /** Whether machine supports time-domain waveform visualization */
  supportsWaveforms: boolean;
  
  /** Whether machine can display power triangle (P, Q, S) */
  supportsPowerTriangle: boolean;
  
  /** Optional machine-specific visualizations */
  customVisualizations?: string[];
}

/**
 * Base parameters common to all machines
 * Machine-specific params should extend this interface
 */
export interface MachineParams {
  /** Supply voltage (V) */
  voltage: number;
  
  /** Supply frequency (Hz) */
  frequency: number;

  /** Allow machine-specific parameters (including harmonic3, harmonic5, harmonic7) */
  [key: string]: number | string | boolean;
}

/**
 * Base calculated values common to all machines
 * Machine-specific values should extend this interface.
 *
 * Harmonic distortion metrics (thdCurrent, powerDistortion, etc.) are
 * returned by all machines via the index signature and accessed with
 * type assertion in components. They equal 0 when no harmonics are active.
 */
export interface MachineValues {
  /** Active power (W) - real power doing work */
  powerActive: number;
  
  /** Reactive power (VAR) - oscillating power */
  powerReactive: number;
  
  /** Apparent power (VA) - total power capacity */
  powerApparent: number;
  
  /** Power factor (0-1) - efficiency of power usage */
  powerFactor: number;
  
  /** Efficiency (0-1) - output power / input power */
  efficiency: number;
  
  /** Phase angle (radians) - angle between voltage and current */
  phaseAngle: number;

  /** Allow machine-specific values (including harmonic metrics) */
  [key: string]: number | string | boolean;
}

/**
 * Parameter descriptor for dynamic UI generation
 */
export interface MachineParameter {
  /** Parameter key matching MachineParams property */
  key: string;
  
  /** Display label for UI */
  label: string;
  
  /** Short symbol (e.g., 'V₁', 'f', 'T') */
  symbol: string;
  
  /** Minimum value for slider */
  min: number;
  
  /** Maximum value for slider */
  max: number;
  
  /** Step size for slider */
  step: number;
  
  /** Unit of measurement (e.g., 'V', 'Hz', 'N·m') */
  unit: string;
  
  /** Category for grouping in UI */
  category: 'electrical' | 'mechanical' | 'load' | 'configuration';
  
  /** Optional description for tooltips */
  description?: string;
  
  /** Whether to hide this parameter from UI (but keep in model) */
  hidden?: boolean;
  
  /** Options for select/toggle parameters */
  options?: Array<{ value: string | number; label: string }>;
}

/**
 * Preset configuration for quick machine setup
 */
export interface MachinePreset {
  /** Preset name for display */
  name: string;
  
  /** Description of what this preset represents */
  description?: string;
  
  /** Parameter values for this preset */
  params: Partial<MachineParams>;
}

/**
 * Machine configuration for registry
 */
export interface MachineConfig<P extends MachineParams = MachineParams> {
  /** Machine type identifier */
  type: MachineType;
  
  /** Constructor for creating machine instances */
  constructor: new (params: P) => IMachine;
  
  /** Default parameter values */
  defaultParams: P;
  
  /** Parameter definitions for UI generation */
  parameters: MachineParameter[];
  
  /** Optional presets for quick configuration */
  presets?: MachinePreset[];
}
