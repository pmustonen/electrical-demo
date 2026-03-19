import { describe, it, expect } from 'vitest';
import { addHarmonicsToCurrentArray, calculateHarmonicMetrics } from '../utils/harmonics';

const EPSILON = 1e-9;

describe('addHarmonicsToCurrentArray', () => {
  const omega = 2 * Math.PI * 50; // 50 Hz
  const N = 100;
  const time = Array.from({ length: N }, (_, i) => i / (N * 50)); // one cycle
  const iPeak = 10;
  const iFund = time.map(t => iPeak * Math.sin(omega * t));

  it('returns original array unchanged when all harmonics are zero', () => {
    const result = addHarmonicsToCurrentArray(time, iFund, omega, 0, 0, 0, iPeak);
    expect(result).toBe(iFund); // same reference
  });

  it('adds 3rd harmonic at correct amplitude and frequency', () => {
    const h3 = 0.3;
    const result = addHarmonicsToCurrentArray(time, iFund, omega, h3, 0, 0, iPeak);
    // At t where sin(ωt)=0 and sin(3ωt)=1, contribution should equal h3*iPeak
    // Find such a t: 3ωt = π/2 → t = π/(6ω)
    const t_check = Math.PI / (6 * omega);
    // sin(ωt) at t_check is sin(π/6) = 0.5
    const expected = iPeak * Math.sin(omega * t_check) + h3 * iPeak * Math.sin(3 * omega * t_check);
    // Interpolate result since t_check may not be in array exactly — check via formula
    const result_formula = result.map((val, i) =>
      Math.abs(val - (iFund[i] + h3 * iPeak * Math.sin(3 * omega * time[i]))) < EPSILON ? 0 : 1
    );
    expect(result_formula.every(v => v === 0)).toBe(true);
    expect(expected).toBeCloseTo(iPeak * 0.5 + h3 * iPeak * 1, 5);
  });

  it('result length equals input length', () => {
    const result = addHarmonicsToCurrentArray(time, iFund, omega, 0.1, 0.05, 0.02, iPeak);
    expect(result.length).toBe(N);
  });
});

describe('calculateHarmonicMetrics', () => {
  // Use self-consistent inputs: V=230 V, I_fund=10 A, φ=30°
  // → S_disp = 230*10 = 2300 VA, P = 2300*cos(30°) ≈ 1992 W, Q = 2300*sin(30°) = 1150 VAR
  const V = 230, I_fund = 10;
  const phi = Math.PI / 6; // 30°
  const S_disp = V * I_fund;
  const P = S_disp * Math.cos(phi);
  const Q = S_disp * Math.sin(phi);

  describe('with no harmonics', () => {
    const metrics = calculateHarmonicMetrics(I_fund, V, P, Q, 0, 0, 0);

    it('THD is zero', () => {
      expect(metrics.thd).toBeCloseTo(0, 10);
      expect(metrics.thdPercent).toBeCloseTo(0, 10);
    });

    it('I_total_rms equals I_fund', () => {
      expect(metrics.I_total_rms).toBeCloseTo(I_fund, 10);
    });

    it('S_total = V * I_fund (no inflation)', () => {
      expect(metrics.S_total).toBeCloseTo(V * I_fund, 5);
    });

    it('distortion power D is zero', () => {
      expect(metrics.powerDistortion).toBeCloseTo(0, 5);
    });

    it('distortion PF is 1', () => {
      expect(metrics.distortionPF).toBeCloseTo(1, 10);
    });

    it('displacement PF = cos(φ)', () => {
      expect(metrics.displacementPF).toBeCloseTo(Math.cos(phi), 8);
    });

    it('true PF equals displacement PF when no harmonics', () => {
      expect(metrics.truePF).toBeCloseTo(metrics.displacementPF, 8);
    });
  });

  describe('THD formula', () => {
    it('THD = sqrt(h3^2 + h5^2 + h7^2)', () => {
      const h3 = 0.3, h5 = 0.2, h7 = 0.1;
      const expected = Math.sqrt(h3 ** 2 + h5 ** 2 + h7 ** 2);
      const { thd } = calculateHarmonicMetrics(I_fund, V, P, Q, h3, h5, h7);
      expect(thd).toBeCloseTo(expected, 10);
    });

    it('single harmonic: THD = h3 when only h3 present', () => {
      const h3 = 0.4;
      const { thd } = calculateHarmonicMetrics(I_fund, V, P, Q, h3, 0, 0);
      expect(thd).toBeCloseTo(h3, 10);
    });
  });

  describe('I_total_rms', () => {
    it('I_total = I_fund * sqrt(1 + THD^2)', () => {
      const h3 = 0.3;
      const thd = h3; // only h3
      const expected = I_fund * Math.sqrt(1 + thd ** 2);
      const { I_total_rms } = calculateHarmonicMetrics(I_fund, V, P, Q, h3, 0, 0);
      expect(I_total_rms).toBeCloseTo(expected, 8);
    });
  });

  describe('power triangle identity S^2 = P^2 + Q^2 + D^2', () => {
    it('holds with harmonics', () => {
      const { S_total, powerDistortion } = calculateHarmonicMetrics(I_fund, V, P, Q, 0.3, 0.2, 0.1);
      const lhs = S_total ** 2;
      const rhs = P ** 2 + Q ** 2 + powerDistortion ** 2;
      expect(lhs).toBeCloseTo(rhs, 1);
    });

    it('holds without harmonics (D = 0)', () => {
      const { S_total, powerDistortion } = calculateHarmonicMetrics(I_fund, V, P, Q, 0, 0, 0);
      expect(powerDistortion).toBeCloseTo(0, 5);
      expect(S_total ** 2).toBeCloseTo(P ** 2 + Q ** 2, 1);
    });
  });

  describe('distortion PF', () => {
    it('distortion PF = 1 / sqrt(1 + THD^2)', () => {
      const h3 = 0.3, h5 = 0.2, h7 = 0.1;
      const thd = Math.sqrt(h3 ** 2 + h5 ** 2 + h7 ** 2);
      const expected = 1 / Math.sqrt(1 + thd ** 2);
      const { distortionPF } = calculateHarmonicMetrics(I_fund, V, P, Q, h3, h5, h7);
      expect(distortionPF).toBeCloseTo(expected, 10);
    });
  });

  describe('true PF = displacement PF × distortion PF', () => {
    it('true PF equals the product', () => {
      const { truePF, displacementPF, distortionPF } = calculateHarmonicMetrics(
        I_fund, V, P, Q, 0.3, 0.2, 0.1
      );
      expect(truePF).toBeCloseTo(displacementPF * distortionPF, 8);
    });
  });

  describe('harmonics are orthogonal to voltage: P is invariant', () => {
    it('apparent power S_total increases when harmonics are added', () => {
      const { S_total: S_no_harm } = calculateHarmonicMetrics(I_fund, V, P, Q, 0, 0, 0);
      const { S_total: S_with_harm } = calculateHarmonicMetrics(I_fund, V, P, Q, 0.3, 0.2, 0.1);
      expect(S_with_harm).toBeGreaterThan(S_no_harm);
    });

    it('true PF decreases when harmonics are added (same P, larger S)', () => {
      const pf_no_harm = calculateHarmonicMetrics(I_fund, V, P, Q, 0, 0, 0).truePF;
      const pf_with_harm = calculateHarmonicMetrics(I_fund, V, P, Q, 0.3, 0.2, 0.1).truePF;
      expect(pf_with_harm).toBeLessThan(pf_no_harm);
    });
  });
});
