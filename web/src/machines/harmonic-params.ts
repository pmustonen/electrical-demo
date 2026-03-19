/**
 * Shared harmonic parameter descriptors
 *
 * Spread these into any machine's MachineParameter[] to give it
 * 3rd / 5th / 7th current harmonic sliders.
 */

import type { MachineParameter } from '../types';

export const HARMONIC_PARAMETERS: MachineParameter[] = [
  {
    key: 'harmonic3',
    label: '3rd Harmonic',
    symbol: 'H₃',
    min: 0,
    max: 0.5,
    step: 0.01,
    unit: 'pu',
    category: 'electrical',
    description: '3rd harmonic current amplitude as fraction of fundamental (0 = off, 0.5 = 50%)',
  },
  {
    key: 'harmonic5',
    label: '5th Harmonic',
    symbol: 'H₅',
    min: 0,
    max: 0.5,
    step: 0.01,
    unit: 'pu',
    category: 'electrical',
    description: '5th harmonic current amplitude as fraction of fundamental',
  },
  {
    key: 'harmonic7',
    label: '7th Harmonic',
    symbol: 'H₇',
    min: 0,
    max: 0.5,
    step: 0.01,
    unit: 'pu',
    category: 'electrical',
    description: '7th harmonic current amplitude as fraction of fundamental',
  },
];

/**
 * Default values for harmonic parameters (all off)
 */
export const DEFAULT_HARMONIC_PARAMS = {
  harmonic3: 0,
  harmonic5: 0,
  harmonic7: 0,
};
