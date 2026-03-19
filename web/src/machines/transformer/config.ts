/**
 * Transformer Machine Configuration
 * 
 * Configuration, parameters, and presets for AC transformer
 */

import { Transformer } from '../../models/Transformer';
import type { MachineConfig, MachineParameter, MachinePreset, TransformerParams } from '../../types';
import { HARMONIC_PARAMETERS, DEFAULT_HARMONIC_PARAMS } from '../harmonic-params';

/**
 * Default transformer parameters for educational demonstration
 */
export const DEFAULT_TRANSFORMER_PARAMS: TransformerParams = {
  voltage: 230,
  voltagePrimary: 230,
  frequency: 50,
  turnsRatio: 2,
  inductanceMag: 0.5,
  resistancePrimary: 1,
  resistanceSecondary: 0.5,
  resistanceLoad: 10,
  ...DEFAULT_HARMONIC_PARAMS,
};

/**
 * Parameter definitions for UI generation
 */
export const TRANSFORMER_PARAMETERS: MachineParameter[] = [
  {
    key: 'voltagePrimary',
    label: 'Primary Voltage',
    symbol: 'V₁',
    min: 50,
    max: 25000,
    step: 50,
    unit: 'V',
    category: 'electrical',
    description: 'Primary winding voltage',
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
    description: 'AC supply frequency',
  },
  {
    key: 'turnsRatio',
    label: 'Turns Ratio',
    symbol: 'n',
    min: 0.5,
    max: 100,
    step: 0.5,
    unit: '',
    category: 'configuration',
    description: 'Ratio of primary to secondary turns (N1/N2)',
  },
  {
    key: 'inductanceMag',
    label: 'Magnetizing Inductance',
    symbol: 'Lₘ',
    min: 0.1,
    max: 200,
    step: 0.5,
    unit: 'H',
    category: 'electrical',
    description: 'Magnetizing inductance of the core',
  },
  {
    key: 'resistancePrimary',
    label: 'Primary Resistance',
    symbol: 'R₁',
    min: 0.01,
    max: 20,
    step: 0.1,
    unit: 'Ω',
    category: 'electrical',
    description: 'Primary winding resistance',
    hidden: true, // Hidden from UI but used in calculations
  },
  {
    key: 'resistanceSecondary',
    label: 'Secondary Resistance',
    symbol: 'R₂',
    min: 0.01,
    max: 5,
    step: 0.01,
    unit: 'Ω',
    category: 'electrical',
    description: 'Secondary winding resistance',
    hidden: true, // Hidden from UI but used in calculations
  },
  {
    key: 'resistanceLoad',
    label: 'Load Resistance',
    symbol: 'Rₗ',
    min: 0.1,
    max: 100,
    step: 0.1,
    unit: 'Ω',
    category: 'load',
    description: 'Connected load resistance',
  },
  ...HARMONIC_PARAMETERS,
];

/**
 * Transformer presets for quick configuration
 */
export const TRANSFORMER_PRESETS: MachinePreset[] = [
  {
    name: 'Small Transformer',
    description: '230V household transformer',
    params: {
      voltage: 230,
      voltagePrimary: 230,
      frequency: 50,
      turnsRatio: 2,
      inductanceMag: 0.5,
      resistancePrimary: 1,
      resistanceSecondary: 0.5,
      resistanceLoad: 10,
    },
  },
  {
    name: 'Grid Transformer',
    description: '20kV/400V distribution transformer (500 kVA)',
    params: {
      voltage: 20000,
      voltagePrimary: 20000,
      frequency: 50,
      turnsRatio: 50,
      inductanceMag: 110,
      resistancePrimary: 5,
      resistanceSecondary: 0.02,
      resistanceLoad: 0.32,
    },
  },
];

/**
 * Transformer machine configuration for registry
 */
export const TRANSFORMER_CONFIG: MachineConfig<TransformerParams> = {
  type: 'transformer',
  constructor: Transformer,
  defaultParams: DEFAULT_TRANSFORMER_PARAMS,
  parameters: TRANSFORMER_PARAMETERS,
  presets: TRANSFORMER_PRESETS,
};
