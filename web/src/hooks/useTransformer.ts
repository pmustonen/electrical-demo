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
 * Grid distribution transformer (20kV/400V, 500kVA typical)
 * Based on real-world specifications for medium voltage distribution
 */
const GRID_TRANSFORMER_PARAMS: TransformerParams = {
  voltagePrimary: 20000,      // 20 kV primary (medium voltage)
  frequency: 50,              // 50 Hz (European grid)
  turnsRatio: 50,             // 50:1 step-down (20kV → 400V)
  inductanceMag: 110,         // 110 H (typical for 500 kVA @ 11kV, scaled)
  resistancePrimary: 5,       // 5 Ω (typical for primary winding)
  resistanceSecondary: 0.02,  // 0.02 Ω (low secondary resistance)
  resistanceLoad: 0.32,       // 0.32 Ω (500 kVA @ 400V ≈ 1250A → R = 400²/500000)
};

/**
 * Custom React hook for transformer state management
 * 
 * Manages transformer parameters as React state and provides
 * calculated values, waveform data, and power calculation data.
 * All values are recalculated automatically when parameters change.
 * 
 * @param overrideParams - Optional parameter overrides (e.g., for load disconnect)
 */
export function useTransformer(overrideParams?: Partial<TransformerParams>) {
  const [params, setParams] = useState<TransformerParams>(DEFAULT_PARAMS);
  const [powerCalcSide, setPowerCalcSide] = useState<TransformerSide>('primary');

  // Merge params with any overrides
  const effectiveParams = useMemo(
    () => ({ ...params, ...overrideParams }),
    [params, overrideParams]
  );

  // Create transformer instance and calculate values
  const transformer = useMemo(() => new Transformer(effectiveParams), [effectiveParams]);
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

  /**
   * Load grid transformer preset (20kV/400V distribution transformer)
   */
  const loadGridTransformer = () => {
    setParams(GRID_TRANSFORMER_PARAMS);
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
    loadGridTransformer,
  };
}
