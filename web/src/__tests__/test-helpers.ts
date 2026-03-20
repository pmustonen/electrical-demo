import { expect } from 'vitest';
import type { IMachine, MachineParams, MachineValues } from '../types';

/**
 * Test that active power P is unchanged when harmonics are added
 */
export function testHarmonicsPowerInvariance(
  MachineClass: new (params: MachineParams) => IMachine,
  baseParams: MachineParams,
  tolerance = 1
) {
  const clean = new MachineClass(baseParams);
  const harmonic = new MachineClass({ ...baseParams, harmonic3: 0.3, harmonic5: 0.2, harmonic7: 0.1 });
  const vClean = clean.calculate();
  const vHarm = harmonic.calculate();
  expect(vHarm.powerActive).toBeCloseTo(vClean.powerActive, tolerance);
}

/**
 * Test power triangle identity: S² = P² + Q² + D²
 */
export function testPowerTriangleWithHarmonics(values: MachineValues) {
  const S = values.powerApparent;
  const P = values.powerActive;
  const Q = values.powerReactive;
  const D = values.powerDistortion;
  const lhs = S ** 2;
  const rhs = P ** 2 + Q ** 2 + D ** 2;
  // Use relative tolerance since absolute values vary by machine
  if (lhs > 1) {
    expect(Math.abs(lhs - rhs) / lhs).toBeLessThan(0.01);
  }
}

/**
 * Test that waveform data is well-formed
 */
export function testWaveformDataShape(machine: IMachine) {
  const waveform = machine.getWaveformData();
  expect(waveform.time.length).toBeGreaterThan(0);
  expect(waveform.v1.length).toBe(waveform.time.length);
  expect(waveform.i1.length).toBe(waveform.time.length);
  expect(waveform.v2.length).toBe(waveform.time.length);
  expect(waveform.i2.length).toBe(waveform.time.length);
  // Time should be monotonically increasing
  for (let i = 1; i < waveform.time.length; i++) {
    expect(waveform.time[i]).toBeGreaterThan(waveform.time[i - 1]);
  }
}

/**
 * Test that power calculation data is well-formed and consistent
 */
export function testPowerCalcDataShape(machine: IMachine) {
  const pcData = machine.getPowerCalculationData();
  expect(pcData.time.length).toBeGreaterThan(0);
  expect(pcData.voltage.length).toBe(pcData.time.length);
  expect(pcData.current.length).toBe(pcData.time.length);
  expect(pcData.powerInstantaneous.length).toBe(pcData.time.length);
  // Power values should be finite
  expect(Number.isFinite(pcData.powerActive)).toBe(true);
  expect(Number.isFinite(pcData.powerReactive)).toBe(true);
  expect(Number.isFinite(pcData.powerApparent)).toBe(true);
}
