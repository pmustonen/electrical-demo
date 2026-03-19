/**
 * Harmonic distortion utilities
 *
 * Implements current harmonics for non-linear loads and inverters.
 * Harmonics are applied to current only (not voltage), which reflects
 * real-world behaviour of switching power supplies, VFDs, and inverters.
 *
 * Harmonic amplitudes (h3, h5, h7) are expressed as a fraction of the
 * fundamental amplitude (e.g. 0.3 = 30% of fundamental).
 * Harmonic components are assumed to have zero phase offset relative to the
 * voltage, making them pure distortion with no additional displacement component.
 */

/**
 * Add 3rd, 5th, and 7th harmonic components to a fundamental current waveform.
 *
 * @param time        - Time array (s)
 * @param iFundamental - Fundamental current array already containing sin(ωt + φ) envelope (A)
 * @param omega       - Angular frequency of the fundamental (rad/s)
 * @param h3          - 3rd harmonic amplitude as fraction of fundamental peak (0–1)
 * @param h5          - 5th harmonic amplitude as fraction of fundamental peak (0–1)
 * @param h7          - 7th harmonic amplitude as fraction of fundamental peak (0–1)
 * @param iPeak       - Peak value of the fundamental current (A) — used to scale harmonics
 * @returns New current array with harmonics added
 */
export function addHarmonicsToCurrentArray(
  time: number[],
  iFundamental: number[],
  omega: number,
  h3: number,
  h5: number,
  h7: number,
  iPeak: number
): number[] {
  if (h3 === 0 && h5 === 0 && h7 === 0) return iFundamental;

  return time.map((t, idx) => {
    const harmonic =
      h3 * iPeak * Math.sin(3 * omega * t) +
      h5 * iPeak * Math.sin(5 * omega * t) +
      h7 * iPeak * Math.sin(7 * omega * t);
    return iFundamental[idx] + harmonic;
  });
}

/**
 * Calculate harmonic distortion metrics given fundamental RMS values and
 * harmonic amplitude fractions.
 *
 * Returns the extended power quantities for S² = P² + Q² + D².
 *
 * @param I1_rms  - Fundamental current RMS (A)
 * @param V_rms   - Voltage RMS (V) — used to compute S_total
 * @param P       - Active power from fundamental (W)
 * @param Q       - Reactive power from fundamental (VAR)
 * @param h3      - 3rd harmonic fraction
 * @param h5      - 5th harmonic fraction
 * @param h7      - 7th harmonic fraction
 */
export function calculateHarmonicMetrics(
  I1_rms: number,
  V_rms: number,
  P: number,
  Q: number,
  h3: number,
  h5: number,
  h7: number
): {
  thd: number;               // Total Harmonic Distortion (fraction, not %)
  thdPercent: number;        // THD in %
  I_total_rms: number;       // Total RMS current including harmonics (A)
  S_total: number;           // True apparent power (VA)
  powerDistortion: number;   // Distortion power D (VA)
  displacementPF: number;    // Displacement PF = cos(φ₁)
  distortionPF: number;      // Distortion PF = 1/√(1+THD²)
  truePF: number;            // True PF = P / S_total
} {
  // THD as fraction of fundamental
  const thd = Math.sqrt(h3 ** 2 + h5 ** 2 + h7 ** 2);
  const thdPercent = thd * 100;

  // Total RMS current: I_total = I1 * √(1 + THD²)
  const I_total_rms = I1_rms * Math.sqrt(1 + thd ** 2);

  // True apparent power
  const S_total = V_rms * I_total_rms;

  // Distortion power: D = √(S² - P² - Q²)
  const D2 = S_total ** 2 - P ** 2 - Q ** 2;
  const powerDistortion = D2 > 0 ? Math.sqrt(D2) : 0;

  // Power factors
  const S_displacement = Math.sqrt(P ** 2 + Q ** 2);
  const displacementPF = S_displacement > 0 ? P / S_displacement : 1;
  const distortionPF = 1 / Math.sqrt(1 + thd ** 2);
  const truePF = S_total > 0 ? P / S_total : 1;

  return {
    thd,
    thdPercent,
    I_total_rms,
    S_total,
    powerDistortion,
    displacementPF,
    distortionPF,
    truePF,
  };
}
