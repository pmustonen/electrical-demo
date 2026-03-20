import { describe, it, expect } from 'vitest';
import { SynchronousMotor } from '../models/SynchronousMotor';
import type { SynchronousMotorParams } from '../types';
import { testWaveformDataShape, testPowerCalcDataShape } from './test-helpers';

const BASE_PARAMS: SynchronousMotorParams = {
  voltage: 400,
  frequency: 50,
  poles: 6,                   // 1000 RPM at 50 Hz
  resistanceArmature: 0.15,
  reactanceSynchronous: 5.0,
  excitationCurrent: 5.0, // Nominal: k_f=V/5 → E_f ≈ V → near-unity PF
  torqueLoad: 200,
  inertia: 2.5,
  harmonic3: 0,
  harmonic5: 0,
  harmonic7: 0,
};

const UNDER_EXCITED: SynchronousMotorParams = { ...BASE_PARAMS, excitationCurrent: 3.5 };
const OVER_EXCITED: SynchronousMotorParams = { ...BASE_PARAMS, excitationCurrent: 9.0 };

describe('SynchronousMotor — excitation effect on power factor', () => {
  it('under-excitation produces lagging PF (motor absorbs Q > 0)', () => {
    const m = new SynchronousMotor(UNDER_EXCITED);
    const v = m.calculate();
    expect(v.powerReactive).toBeGreaterThan(0);
  });

  it('over-excitation produces leading PF (motor supplies Q < 0)', () => {
    const m = new SynchronousMotor(OVER_EXCITED);
    const v = m.calculate();
    expect(v.powerReactive).toBeLessThan(0);
  });

  it('nominal excitation produces near-unity PF', () => {
    const m = new SynchronousMotor(BASE_PARAMS);
    const v = m.calculate();
    expect(Math.abs(v.powerFactor)).toBeGreaterThan(0.85);
  });

  it('power factor is between -1 and 1 in all cases', () => {
    [UNDER_EXCITED, BASE_PARAMS, OVER_EXCITED].forEach(params => {
      const v = new SynchronousMotor(params).calculate();
      expect(Math.abs(v.powerFactor)).toBeGreaterThanOrEqual(0);
      expect(Math.abs(v.powerFactor)).toBeLessThanOrEqual(1.001);
    });
  });
});

describe('SynchronousMotor — active power determined by load, not excitation', () => {
  it('changing excitation changes Q much more than P (Q is the control variable)', () => {
    const vUnder = new SynchronousMotor(UNDER_EXCITED).calculate();
    const vOver = new SynchronousMotor(OVER_EXCITED).calculate();
    const deltaP = Math.abs(vOver.powerActive - vUnder.powerActive);
    const deltaQ = Math.abs(vOver.powerReactive - vUnder.powerReactive);
    // Q swing should be many times larger than P swing
    expect(deltaQ).toBeGreaterThan(deltaP * 5);
  });

  it('higher torque load → higher active power', () => {
    const mLight = new SynchronousMotor(BASE_PARAMS);
    const mHeavy = new SynchronousMotor({ ...BASE_PARAMS, torqueLoad: 400 });
    expect(mHeavy.calculate().powerActive).toBeGreaterThan(mLight.calculate().powerActive);
  });
});

describe('SynchronousMotor — speed', () => {
  it('n_s = 1000 RPM for 6-pole 50Hz motor', () => {
    const m = new SynchronousMotor(BASE_PARAMS);
    const v = m.calculate();
    expect(v.speedSync).toBeCloseTo(1000, 0);
  });
});

describe('SynchronousMotor — harmonics', () => {
  it('active power P unchanged when harmonics added', () => {
    const mClean = new SynchronousMotor(BASE_PARAMS);
    const mHarm = new SynchronousMotor({ ...BASE_PARAMS, harmonic3: 0.3, harmonic5: 0.2, harmonic7: 0.1 });
    expect(mHarm.calculate().powerActive).toBeCloseTo(mClean.calculate().powerActive, 1);
  });

  it('displacement reactive power Q unchanged when harmonics added', () => {
    const mClean = new SynchronousMotor(UNDER_EXCITED);
    const mHarm = new SynchronousMotor({ ...UNDER_EXCITED, harmonic3: 0.3 });
    expect(mHarm.calculate().powerReactive).toBeCloseTo(mClean.calculate().powerReactive, 1);
  });

  it('S² = P² + Q² + D² with harmonics', () => {
    const m = new SynchronousMotor({ ...BASE_PARAMS, harmonic3: 0.3, harmonic5: 0.2 });
    const v = m.calculate();
    const S = v.powerApparent as number;
    const P = v.powerActive;
    const Q = v.powerReactive;
    const D = (v.powerDistortion as number) ?? 0;
    expect(S ** 2).toBeCloseTo(P ** 2 + Q ** 2 + D ** 2, 0);
  });
});

describe('SynchronousMotor — motor-specific values', () => {
  it('load angle > 0 under load', () => {
    const m = new SynchronousMotor(BASE_PARAMS);
    expect(m.calculate().loadAngle).toBeGreaterThan(0);
  });

  it('back EMF proportional to excitation current', () => {
    const m1 = new SynchronousMotor({ ...BASE_PARAMS, excitationCurrent: 3 });
    const m2 = new SynchronousMotor({ ...BASE_PARAMS, excitationCurrent: 6 });
    const ratio = m2.calculate().backEMF / m1.calculate().backEMF;
    expect(ratio).toBeCloseTo(2, 1);
  });

  it('armature current > 0', () => {
    const m = new SynchronousMotor(BASE_PARAMS);
    expect(m.calculate().currentArmature).toBeGreaterThan(0);
  });

  it('waveform data has correct shape', () => {
    const m = new SynchronousMotor(BASE_PARAMS);
    testWaveformDataShape(m);
  });

  it('power calculation data has correct shape', () => {
    const m = new SynchronousMotor(BASE_PARAMS);
    testPowerCalcDataShape(m);
  });
});
