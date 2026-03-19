import { describe, it, expect } from 'vitest';
import { Bess } from '../models/Bess';
import type { BessParams } from '../types';

const BASE_PARAMS: BessParams = {
  voltage: 400,
  frequency: 50,
  powerRated: 100,
  energyCapacity: 200,
  powerSetpoint: 0,
  reactiveSetpoint: 0,
  harmonic3: 0,
  harmonic5: 0,
  harmonic7: 0,
};

describe('Bess — active power setpoint', () => {
  it('P setpoint = 0 → calculated P ≈ 0 W', () => {
    const b = new Bess({ ...BASE_PARAMS, powerSetpoint: 0 });
    expect(b.calculate().powerActive).toBeCloseTo(0, 1);
  });

  it('P setpoint = 80 kW → calculated P ≈ 80,000 W (discharging)', () => {
    const b = new Bess({ ...BASE_PARAMS, powerSetpoint: 80 });
    expect(b.calculate().powerActive).toBeCloseTo(80_000, 0);
  });

  it('P setpoint = -60 kW → calculated P ≈ -60,000 W (charging)', () => {
    const b = new Bess({ ...BASE_PARAMS, powerSetpoint: -60 });
    expect(b.calculate().powerActive).toBeCloseTo(-60_000, 0);
  });
});

describe('Bess — reactive power setpoint', () => {
  it('Q setpoint = 0 → calculated Q ≈ 0 VAR', () => {
    const b = new Bess({ ...BASE_PARAMS, reactiveSetpoint: 0 });
    expect(b.calculate().powerReactive).toBeCloseTo(0, 1);
  });

  it('Q setpoint = 50 kVAR → calculated Q ≈ 50,000 VAR', () => {
    const b = new Bess({ ...BASE_PARAMS, reactiveSetpoint: 50 });
    expect(b.calculate().powerReactive).toBeCloseTo(50_000, 0);
  });

  it('Q setpoint = -40 kVAR → calculated Q ≈ -40,000 VAR (capacitive)', () => {
    const b = new Bess({ ...BASE_PARAMS, reactiveSetpoint: -40 });
    expect(b.calculate().powerReactive).toBeCloseTo(-40_000, 0);
  });
});

describe('Bess — power factor', () => {
  it('Q=0 → PF = 1', () => {
    const b = new Bess({ ...BASE_PARAMS, powerSetpoint: 80, reactiveSetpoint: 0 });
    expect(Math.abs(b.calculate().powerFactor)).toBeCloseTo(1, 3);
  });

  it('Q≠0 → PF < 1', () => {
    const b = new Bess({ ...BASE_PARAMS, powerSetpoint: 60, reactiveSetpoint: 40 });
    expect(Math.abs(b.calculate().powerFactor)).toBeLessThan(1);
  });
});

describe('Bess — harmonics', () => {
  it('active power P unchanged when harmonics added', () => {
    const bClean = new Bess({ ...BASE_PARAMS, powerSetpoint: 80 });
    const bHarm = new Bess({ ...BASE_PARAMS, powerSetpoint: 80, harmonic3: 0.3, harmonic5: 0.2, harmonic7: 0.1 });
    expect(bHarm.calculate().powerActive).toBeCloseTo(bClean.calculate().powerActive, 1);
  });

  it('displacement reactive power Q unchanged when harmonics added', () => {
    const bClean = new Bess({ ...BASE_PARAMS, powerSetpoint: 60, reactiveSetpoint: 40 });
    const bHarm = new Bess({ ...BASE_PARAMS, powerSetpoint: 60, reactiveSetpoint: 40, harmonic3: 0.3 });
    expect(bHarm.calculate().powerReactive).toBeCloseTo(bClean.calculate().powerReactive, 1);
  });

  it('true apparent power S_total increases when harmonics added', () => {
    const bClean = new Bess({ ...BASE_PARAMS, powerSetpoint: 80, reactiveSetpoint: 40 });
    const bHarm = new Bess({ ...BASE_PARAMS, powerSetpoint: 80, reactiveSetpoint: 40, harmonic3: 0.3 });
    expect(bHarm.calculate().powerApparent).toBeGreaterThan(bClean.calculate().powerApparent);
  });

  it('S² = P² + Q² + D² with harmonics', () => {
    const b = new Bess({ ...BASE_PARAMS, powerSetpoint: 60, reactiveSetpoint: 40, harmonic3: 0.3, harmonic5: 0.2 });
    const v = b.calculate();
    const S = v.powerApparent as number;
    const P = v.powerActive;
    const Q = v.powerReactive;
    const D = (v.powerDistortion as number) ?? 0;
    expect(S ** 2).toBeCloseTo(P ** 2 + Q ** 2 + D ** 2, 0);
  });
});
