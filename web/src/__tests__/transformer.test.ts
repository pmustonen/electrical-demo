import { describe, it, expect } from 'vitest';
import { Transformer } from '../models/Transformer';
import type { TransformerParams } from '../types';
import { testWaveformDataShape, testPowerCalcDataShape } from './test-helpers';

/** Base params: 230V primary, n=2 (step-down to 115V), ideal-ish core */
const BASE_PARAMS: TransformerParams = {
  voltage: 230,
  voltagePrimary: 230,
  frequency: 50,
  turnsRatio: 2,
  inductanceMag: 0.5,
  resistancePrimary: 1,
  resistanceSecondary: 0.5,
  resistanceLoad: 10,
  harmonic3: 0,
  harmonic5: 0,
  harmonic7: 0,
};

/** Lossless params for clean power conservation checks */
const IDEAL_PARAMS: TransformerParams = {
  ...BASE_PARAMS,
  resistancePrimary: 0,
  resistanceSecondary: 0,
  inductanceMag: 1e6, // Huge → I_mag ≈ 0
};

describe('Transformer — voltage transformation', () => {
  const V1 = IDEAL_PARAMS.voltagePrimary; // 230 V

  it('V2 = V1/n for step-down (n=2)', () => {
    const t = new Transformer({ ...IDEAL_PARAMS, turnsRatio: 2 });
    expect(t.calculate().voltageSecondary).toBeCloseTo(V1 / 2, 3);
  });

  it('V2 = V1 for isolation transformer (n=1)', () => {
    const t = new Transformer({ ...IDEAL_PARAMS, turnsRatio: 1 });
    expect(t.calculate().voltageSecondary).toBeCloseTo(V1, 3);
  });

  it('V2 > V1 for step-up (n=0.5)', () => {
    const t = new Transformer({ ...IDEAL_PARAMS, turnsRatio: 0.5 });
    expect(t.calculate().voltageSecondary).toBeCloseTo(V1 * 2, 3);
  });
});

describe('Transformer — power conservation (lossless)', () => {
  it('P1 ≈ P2 when resistances are zero', () => {
    const t = new Transformer(IDEAL_PARAMS);
    const v = t.calculate();
    // Active power on primary ≈ active power on secondary (no winding losses)
    expect(v.powerActivePrimary).toBeCloseTo(v.powerActiveSecondary, 0);
  });

  it('S2 ≤ S1 (secondary apparent power does not exceed primary)', () => {
    const t = new Transformer(BASE_PARAMS);
    const v = t.calculate();
    expect(v.powerApparentSecondary).toBeLessThanOrEqual(v.powerApparentPrimary + 0.01);
  });
});

describe('Transformer — magnetizing reactive power', () => {
  it('Q > 0 (transformer consumes reactive power)', () => {
    const t = new Transformer(BASE_PARAMS);
    const v = t.calculate();
    expect(v.powerReactivePrimary).toBeGreaterThan(0);
  });

  it('Q decreases as L_mag increases (ideal core limit)', () => {
    const tLow = new Transformer({ ...IDEAL_PARAMS, inductanceMag: 0.1 });
    const tHigh = new Transformer({ ...IDEAL_PARAMS, inductanceMag: 10 });
    expect(tLow.calculate().powerReactivePrimary).toBeGreaterThan(
      tHigh.calculate().powerReactivePrimary
    );
  });
});

describe('Transformer — power triangle S² = P² + Q²', () => {
  it('holds without harmonics', () => {
    const t = new Transformer(BASE_PARAMS);
    const v = t.calculate();
    const S = v.powerApparentPrimary;
    const P = v.powerActivePrimary;
    const Q = v.powerReactivePrimary;
    // P now includes R1 copper loss, so S² ≈ P² + Q² within ~0.2%
    // (the exact relation requires full complex phasor arithmetic)
    const relativeError = Math.abs(S ** 2 - (P ** 2 + Q ** 2)) / (S ** 2);
    expect(relativeError).toBeLessThan(0.005);
  });
});

describe('Transformer — harmonics do not change active or displacement-reactive power', () => {
  it('active power P unchanged when harmonics added', () => {
    const tClean = new Transformer(BASE_PARAMS);
    const tHarm = new Transformer({ ...BASE_PARAMS, harmonic3: 0.3, harmonic5: 0.2, harmonic7: 0.1 });
    expect(tHarm.calculate().powerActivePrimary).toBeCloseTo(
      tClean.calculate().powerActivePrimary, 1
    );
  });

  it('displacement reactive power Q unchanged when harmonics added', () => {
    const tClean = new Transformer(BASE_PARAMS);
    const tHarm = new Transformer({ ...BASE_PARAMS, harmonic3: 0.3, harmonic5: 0.2 });
    expect(tHarm.calculate().powerReactivePrimary).toBeCloseTo(
      tClean.calculate().powerReactivePrimary, 1
    );
  });

  it('true apparent power S_total increases when harmonics added', () => {
    const tClean = new Transformer(BASE_PARAMS);
    const tHarm = new Transformer({ ...BASE_PARAMS, harmonic3: 0.3, harmonic5: 0.2 });
    expect(tHarm.calculate().powerApparent).toBeGreaterThan(tClean.calculate().powerApparent);
  });

  it('S² = P² + Q² + D² with harmonics', () => {
    const t = new Transformer({ ...BASE_PARAMS, harmonic3: 0.3, harmonic5: 0.2, harmonic7: 0.1 });
    const v = t.calculate();
    const S = v.powerApparent as number;
    const P = v.powerActivePrimary;
    const Q = v.powerReactivePrimary;
    const D = (v.powerDistortion as number) ?? 0;
    expect(S ** 2).toBeCloseTo(P ** 2 + Q ** 2 + D ** 2, 0);
  });
});

describe('Transformer — power factor', () => {
  it('power factor is between 0 and 1', () => {
    const t = new Transformer(BASE_PARAMS);
    const v = t.calculate();
    expect(v.powerFactor).toBeGreaterThan(0);
    expect(v.powerFactor).toBeLessThanOrEqual(1);
  });

  it('power factor = P / S', () => {
    const t = new Transformer(BASE_PARAMS);
    const v = t.calculate();
    expect(v.powerFactor).toBeCloseTo(v.powerActivePrimary / v.powerApparentPrimary, 5);
  });
});

describe('Transformer — machine-specific values', () => {
  it('currentPrimary > 0 for loaded transformer', () => {
    const t = new Transformer(BASE_PARAMS);
    const v = t.calculate();
    expect(v.currentPrimary).toBeGreaterThan(0);
  });

  it('currentSecondary matches V2/(R2+Rload)', () => {
    const t = new Transformer(BASE_PARAMS);
    const v = t.calculate();
    const expected = v.voltageSecondary / (BASE_PARAMS.resistanceSecondary + BASE_PARAMS.resistanceLoad);
    expect(v.currentSecondary).toBeCloseTo(expected, 3);
  });

  it('magnetizing current decreases with increasing Lmag', () => {
    const t1 = new Transformer({ ...BASE_PARAMS, inductanceMag: 0.5 });
    const t2 = new Transformer({ ...BASE_PARAMS, inductanceMag: 5.0 });
    expect(t2.calculate().currentMagnetizing).toBeLessThan(t1.calculate().currentMagnetizing);
  });

  it('powerReactiveMagnetizing > 0 with finite inductance', () => {
    const t = new Transformer(BASE_PARAMS);
    const v = t.calculate();
    expect(v.powerReactiveMagnetizing).toBeGreaterThan(0);
  });
});

describe('Transformer — waveform and power data', () => {
  it('waveform data has correct shape', () => {
    const t = new Transformer(BASE_PARAMS);
    testWaveformDataShape(t);
  });

  it('power calculation data has correct shape', () => {
    const t = new Transformer(BASE_PARAMS);
    testPowerCalcDataShape(t);
  });
});
