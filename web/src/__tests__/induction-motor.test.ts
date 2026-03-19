import { describe, it, expect } from 'vitest';
import { InductionMotor } from '../models/InductionMotor';
import type { InductionMotorParams } from '../types';

const BASE_PARAMS: InductionMotorParams = {
  voltage: 400,
  frequency: 50,
  poles: 4,
  resistanceStator: 2.8,
  reactanceStator: 5.2,
  resistanceRotor: 2.5,
  reactanceRotor: 5.2,
  reactanceMag: 150,
  torqueLoad: 10,
  harmonic3: 0,
  harmonic5: 0,
  harmonic7: 0,
};

const HEAVY_LOAD: InductionMotorParams = { ...BASE_PARAMS, torqueLoad: 50 };

describe('InductionMotor — synchronous speed', () => {
  it('n_s = 1500 RPM for 4-pole 50Hz motor', () => {
    const m = new InductionMotor(BASE_PARAMS);
    const v = m.calculate();
    expect(v.speedSync).toBeCloseTo(1500, 0);
  });

  it('n_s = 1000 RPM for 6-pole 50Hz motor', () => {
    const m = new InductionMotor({ ...BASE_PARAMS, poles: 6 });
    const v = m.calculate();
    expect(v.speedSync).toBeCloseTo(1000, 0);
  });

  it('n_s = 3000 RPM for 2-pole 50Hz motor', () => {
    const m = new InductionMotor({ ...BASE_PARAMS, poles: 2 });
    const v = m.calculate();
    expect(v.speedSync).toBeCloseTo(3000, 0);
  });
});

describe('InductionMotor — slip and speed', () => {
  it('rotor speed is less than synchronous speed under load', () => {
    const m = new InductionMotor(BASE_PARAMS);
    const v = m.calculate();
    expect(v.speedRotor).toBeLessThan(v.speedSync);
  });

  it('slip is positive and between 0 and 1 under normal load', () => {
    const m = new InductionMotor(BASE_PARAMS);
    const v = m.calculate();
    expect(v.slip).toBeGreaterThan(0);
    expect(v.slip).toBeLessThan(1);
  });

  it('slip = (n_s - n) / n_s', () => {
    const m = new InductionMotor(BASE_PARAMS);
    const v = m.calculate();
    const expected = (v.speedSync - v.speedRotor) / v.speedSync;
    expect(v.slip).toBeCloseTo(expected, 5);
  });

  it('higher load torque → higher slip → lower speed', () => {
    const mLight = new InductionMotor(BASE_PARAMS);
    const mHeavy = new InductionMotor(HEAVY_LOAD);
    expect(mHeavy.calculate().slip).toBeGreaterThan(mLight.calculate().slip);
    expect(mHeavy.calculate().speedRotor).toBeLessThan(mLight.calculate().speedRotor);
  });
});

describe('InductionMotor — power balance', () => {
  it('P_input = P_airgap + P_stator_copper_loss', () => {
    const m = new InductionMotor(BASE_PARAMS);
    const v = m.calculate();
    expect(v.powerInput).toBeCloseTo(v.powerAirgap + v.powerCopperStator, 0);
  });

  it('P_airgap = P_output + P_rotor_copper_loss', () => {
    const m = new InductionMotor(BASE_PARAMS);
    const v = m.calculate();
    expect(v.powerAirgap).toBeCloseTo(v.powerOutput + v.powerCopperRotor, 0);
  });

  it('efficiency = P_output / P_input, and is < 100%', () => {
    const m = new InductionMotor(HEAVY_LOAD);
    const v = m.calculate();
    expect(v.efficiency).toBeCloseTo(v.powerOutput / v.powerInput, 4);
    expect(v.efficiency).toBeGreaterThan(0);
    expect(v.efficiency).toBeLessThan(1);
  });
});

describe('InductionMotor — reactive power', () => {
  it('Q > 0 (induction motor absorbs reactive power)', () => {
    const m = new InductionMotor(BASE_PARAMS);
    expect(m.calculate().powerReactive).toBeGreaterThan(0);
  });

  it('power factor is lagging (between 0 and 1)', () => {
    const m = new InductionMotor(BASE_PARAMS);
    const v = m.calculate();
    expect(v.powerFactor).toBeGreaterThan(0);
    expect(v.powerFactor).toBeLessThan(1);
  });
});

describe('InductionMotor — harmonics', () => {
  it('active power P unchanged when harmonics added', () => {
    const mClean = new InductionMotor(BASE_PARAMS);
    const mHarm = new InductionMotor({ ...BASE_PARAMS, harmonic3: 0.3, harmonic5: 0.2, harmonic7: 0.1 });
    expect(mHarm.calculate().powerActive).toBeCloseTo(mClean.calculate().powerActive, 1);
  });

  it('S² = P² + Q² + D² with harmonics', () => {
    const m = new InductionMotor({ ...BASE_PARAMS, harmonic3: 0.3, harmonic5: 0.2 });
    const v = m.calculate();
    const S = v.powerApparent as number;
    const P = v.powerActive;
    const Q = v.powerReactive;
    const D = (v.powerDistortion as number) ?? 0;
    expect(S ** 2).toBeCloseTo(P ** 2 + Q ** 2 + D ** 2, 0);
  });
});
