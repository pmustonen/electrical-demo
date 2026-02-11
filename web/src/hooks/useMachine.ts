/**
 * Generic Machine Hook
 * 
 * React hook for managing any electrical machine type.
 * Replaces useTransformer with a machine-agnostic version.
 */

import { useState, useMemo } from 'react';
import { machineRegistry } from '../machines';
import type { IMachine, MachineType, MachineParams, MachineValues, WaveformData, PowerCalculationData, TransformerSide } from '../types';

interface UseMachineOptions {
  /** Optional parameter overrides (e.g., for load disconnect) */
  overrideParams?: Partial<MachineParams>;
}

/**
 * Generic React hook for machine state management
 * 
 * Manages machine parameters, calculates values, generates waveforms.
 * Works with any machine type registered in the machine registry.
 */
export function useMachine(
  machineType: MachineType,
  options: UseMachineOptions = {}
) {
  const { overrideParams } = options;
  
  // Get machine configuration from registry
  const config = machineRegistry.get(machineType);
  if (!config) {
    throw new Error(`Machine type "${machineType}" is not registered`);
  }

  // State for machine parameters
  const [params, setParams] = useState<MachineParams>(config.defaultParams);
  
  // State for power calculation side (transformer-specific, but kept for compatibility)
  const [powerCalcSide, setPowerCalcSide] = useState<TransformerSide>('primary');

  // Merge params with any overrides
  const effectiveParams: MachineParams = useMemo(
    () => ({ ...params, ...overrideParams } as MachineParams),
    [params, overrideParams]
  );

  // Create machine instance and calculate values
  const machine: IMachine = useMemo(
    () => machineRegistry.create(machineType, effectiveParams),
    [machineType, effectiveParams]
  );
  
  const values: MachineValues = useMemo(() => machine.calculate(), [machine]);
  const waveformData: WaveformData = useMemo(() => machine.getWaveformData(), [machine]);
  const powerCalcData: PowerCalculationData = useMemo(
    () => machine.getPowerCalculationData(),
    [machine]
  );

  /**
   * Update a single parameter
   */
  const updateParam = (key: string, value: number) => {
    setParams(prev => ({ ...prev, [key]: value } as MachineParams));
  };

  /**
   * Update multiple parameters at once
   */
  const updateParams = (updates: Partial<MachineParams>) => {
    setParams(prev => ({ ...prev, ...updates } as MachineParams));
  };

  /**
   * Reset parameters to defaults
   */
  const resetParams = () => {
    setParams(config.defaultParams);
  };

  /**
   * Load a preset configuration
   */
  const loadPreset = (presetName: string) => {
    const preset = config.presets?.find(p => p.name === presetName);
    if (preset) {
      updateParams(preset.params);
    } else {
      console.warn(`Preset "${presetName}" not found for machine type "${machineType}"`);
    }
  };

  return {
    // Machine instance
    machine,
    
    // Configuration
    config,
    
    // State
    params,
    values,
    waveformData,
    powerCalcData,
    
    // Power calc side (for backward compatibility with transformer)
    powerCalcSide,
    setPowerCalcSide,
    
    // Actions
    updateParam,
    updateParams,
    resetParams,
    loadPreset,
  };
}
