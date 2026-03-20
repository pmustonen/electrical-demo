/**
 * Synchronous Motor Machine Configuration
 */

import { SynchronousMotor } from '../../models/SynchronousMotor';
import type { MachineConfig, MachineParameter, MachinePreset, SynchronousMotorParams } from '../../types';
import { HARMONIC_PARAMETERS, DEFAULT_HARMONIC_PARAMS } from '../harmonic-params';

export const DEFAULT_SYNC_MOTOR_PARAMS: SynchronousMotorParams = {
  voltage: 400,
  frequency: 50,
  poles: 6,
  resistanceArmature: 0.15,
  reactanceSynchronous: 5.0,
  excitationCurrent: 5.0,
  torqueLoad: 200,
  inertia: 2.5,
  ...DEFAULT_HARMONIC_PARAMS,
};

export const SYNC_MOTOR_PARAMETERS: MachineParameter[] = [
  {
    key: 'voltage',
    label: 'Line Voltage',
    symbol: 'V',
    min: 200,
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
    description: 'Number of magnetic poles',
  },
  {
    key: 'excitationCurrent',
    label: 'Field Excitation',
    symbol: 'If',
    min: 1.0,
    max: 12.0,
    step: 0.5,
    unit: 'A',
    category: 'electrical',
    description: 'Field excitation current - controls power factor!',
  },
  {
    key: 'torqueLoad',
    label: 'Load Torque',
    symbol: 'Tₗ',
    min: 0,
    max: 800,
    step: 10,
    unit: 'N·m',
    category: 'load',
    description: 'Mechanical load torque',
  },
  ...HARMONIC_PARAMETERS,
];

export const SYNC_MOTOR_PRESETS: MachinePreset<SynchronousMotorParams>[] = [
  {
    name: 'Under-Excited',
    description: 'Low excitation - lagging PF',
    params: {
      voltage: 400,
      frequency: 50,
      poles: 6,
      resistanceArmature: 0.15,
      reactanceSynchronous: 5.0,
      excitationCurrent: 3.5,
      torqueLoad: 200,
      inertia: 2.5,
    },
  },
  {
    name: 'Unity PF',
    description: 'Optimal excitation',
    params: {
      voltage: 400,
      frequency: 50,
      poles: 6,
      resistanceArmature: 0.15,
      reactanceSynchronous: 5.0,
      excitationCurrent: 5.0,
      torqueLoad: 250,
      inertia: 2.5,
    },
  },
  {
    name: 'Over-Excited',
    description: 'High excitation - leading PF!',
    params: {
      voltage: 400,
      frequency: 50,
      poles: 6,
      resistanceArmature: 0.15,
      reactanceSynchronous: 5.0,
      excitationCurrent: 9.0,
      torqueLoad: 200,
      inertia: 2.5,
    },
  },
];

export const SYNC_MOTOR_CONFIG: MachineConfig<SynchronousMotorParams> = {
  type: 'synchronous-motor',
  constructor: SynchronousMotor,
  defaultParams: DEFAULT_SYNC_MOTOR_PARAMS,
  parameters: SYNC_MOTOR_PARAMETERS,
  presets: SYNC_MOTOR_PRESETS,
};
