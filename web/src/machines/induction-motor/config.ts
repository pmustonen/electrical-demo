/**
 * Induction Motor Machine Configuration
 * 
 * Configuration, parameters, and presets for 3-phase induction motor
 */

import { InductionMotor } from '../../models/InductionMotor';
import type { MachineConfig, MachineParameter, MachinePreset, InductionMotorParams } from '../../types';
import { HARMONIC_PARAMETERS, DEFAULT_HARMONIC_PARAMS } from '../harmonic-params';

export const DEFAULT_MOTOR_PARAMS: InductionMotorParams = {
  voltage: 400,
  frequency: 50,
  poles: 4,
  resistanceStator: 2.8,
  reactanceStator: 5.2,
  resistanceRotor: 2.5,
  reactanceRotor: 5.2,
  reactanceMag: 150,
  torqueLoad: 10,
  inertia: 0.01,
  ...DEFAULT_HARMONIC_PARAMS,
};

/**
 * Parameter definitions for UI generation
 */
export const MOTOR_PARAMETERS: MachineParameter[] = [
  {
    key: 'voltage',
    label: 'Line Voltage',
    symbol: 'V',
    min: 100,
    max: 690,
    step: 10,
    unit: 'V',
    category: 'electrical',
    description: 'Line-to-line voltage',
  },
  {
    key: 'frequency',
    label: 'Frequency',
    symbol: 'f',
    min: 50,
    max: 60,
    step: 10,
    unit: 'Hz',
    category: 'electrical',
    description: 'Supply frequency',
  },
  {
    key: 'poles',
    label: 'Number of Poles',
    symbol: 'p',
    min: 2,
    max: 12,
    step: 2,
    unit: '',
    category: 'configuration',
    description: 'Number of magnetic poles (affects speed)',
  },
  {
    key: 'torqueLoad',
    label: 'Load Torque',
    symbol: 'Tₗ',
    min: 0,
    max: 100,
    step: 1,
    unit: 'N·m',
    category: 'load',
    description: 'Mechanical load torque on shaft',
  },
  ...HARMONIC_PARAMETERS,
];

/**
 * Induction motor presets
 */
export const MOTOR_PRESETS: MachinePreset<InductionMotorParams>[] = [
  {
    name: 'Small Motor',
    description: '1.5 kW, 4-pole, 400V motor',
    params: {
      voltage: 400,
      frequency: 50,
      poles: 4,
      resistanceStator: 2.8,
      reactanceStator: 5.2,
      resistanceRotor: 2.5,
      reactanceRotor: 5.2,
      reactanceMag: 150,
      torqueLoad: 10,
      inertia: 0.01,
    },
  },
  {
    name: 'Medium Motor',
    description: '15 kW, 6-pole, 400V motor',
    params: {
      voltage: 400,
      frequency: 50,
      poles: 6,
      resistanceStator: 0.5,
      reactanceStator: 2.0,
      resistanceRotor: 0.4,
      reactanceRotor: 2.0,
      reactanceMag: 80,
      torqueLoad: 90,
      inertia: 0.1,
    },
  },
];

/**
 * Induction motor configuration for registry
 */
export const MOTOR_CONFIG: MachineConfig<InductionMotorParams> = {
  type: 'induction-motor',
  constructor: InductionMotor,
  defaultParams: DEFAULT_MOTOR_PARAMS,
  parameters: MOTOR_PARAMETERS,
  presets: MOTOR_PRESETS,
};
