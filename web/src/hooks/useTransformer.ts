import { useState, useMemo } from 'react';
import { Transformer } from '../models/Transformer';
import type { TransformerParams, TransformerSide } from '../types';

/**
 * Default transformer parameters for educational demonstration
 */
const DEFAULT_PARAMS: TransformerParams = {
  voltagePrimary: 230,        // 230V AC (European standard)
  frequency: 50,              // 50 Hz
  turnsRatio: 2,              // 2:1 step-down
  inductanceMag: 0.5,         // 0.5 H
  resistancePrimary: 1,       // 1 Ω
  resistanceSecondary: 0.5,   // 0.5 Ω
  resistanceLoad: 10,         // 10 Ω
};

/**
 * Custom React hook for transformer state management
 * 
 * Manages transformer parameters as React state and provides
 * calculated values, waveform data, and power calculation data.
 * All values are recalculated automatically when parameters change.
 */
export function useTransformer() {
  const [params, setParams] = useState<TransformerParams>(DEFAULT_PARAMS);
  const [powerCalcSide, setPowerCalcSide] = useState<TransformerSide>('primary');

  // Create transformer instance and calculate values
  const transformer = useMemo(() => new Transformer(params), [params]);
  const values = useMemo(() => transformer.calculate(), [transformer]);
  const waveformData = useMemo(() => transformer.getWaveformData(), [transformer]);
  const powerCalcData = useMemo(
    () => transformer.getPowerCalculationData(powerCalcSide),
    [transformer, powerCalcSide]
  );

  /**
   * Update a single parameter
   */
  const updateParam = (key: keyof TransformerParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Update multiple parameters at once
   */
  const updateParams = (updates: Partial<TransformerParams>) => {
    setParams(prev => ({ ...prev, ...updates }));
  };

  /**
   * Reset parameters to defaults
   */
  const resetParams = () => {
    setParams(DEFAULT_PARAMS);
  };

  return {
    // State
    params,
    powerCalcSide,
    
    // Calculated values
    values,
    waveformData,
    powerCalcData,
    
    // Actions
    updateParam,
    updateParams,
    setPowerCalcSide,
    resetParams,
  };
}
