# Architecture Review & Unit Test Plan

---

## Part 1: Architecture Review

*(See web/docs/architecture-review.md for full findings)*

Eight structural pain points found, all rooted in:
- Multiple independent `calculate()` calls allowing P/Q/S to diverge
- Index-signature escape hatches preventing typed harmonic fields
- Unenforced per-phase vs 3-phase convention across machines
- `PowerCalculationData` re-deriving values already in `calculate()`

---

## Part 2: Unit Tests

### Goal

Test the parts of the software that have real, verifiable correctness criteria: the electrical physics. This means pure utility functions and model calculations where we know what the correct answers are from electrical engineering first principles.

### Framework: Vitest

Natural choice for Vite + TypeScript — zero extra config, Jest-compatible API, runs natively with the existing build setup.

**Setup:**
1. `npm install --save-dev vitest`
2. Add `"test": "vitest"` to `package.json` scripts
3. Add `test: { environment: 'node' }` to `vite.config.ts`

---

### Suite 1: `harmonics.test.ts`

Pure functions — the easiest and most reliable things to test.

| Test | Verifies |
|------|----------|
| No harmonics → waveform unchanged | Identity: h3=h5=h7=0 is a no-op |
| THD formula | `THD = √(h3²+h5²+h7²)` |
| Total RMS scales correctly | `I_total = I_fund × √(1+THD²)` |
| Power triangle identity | `D = √(S²−P²−Q²)` |
| Distortion PF formula | `1/√(1+THD²)` |
| True PF = displacement × distortion | Multiplicative relationship |
| Harmonics orthogonal to voltage | Active power P unchanged (harmonics contribute zero to P) |
| S_total = V × I_total | Apparent power definition |

---

### Suite 2: `transformer.test.ts`

Single-phase transformer — well-defined, textbook physics.

| Test | Verifies |
|------|----------|
| Voltage transformation V2 = V1/n | n=2: 230V→115V, n=0.5: 230V→460V |
| Current reflection I1_reflected = I2/n | n=2: I2=10A → I1_reflected=5A |
| Power conservation P1 ≈ P2 | With R1=R2=0, no losses |
| Magnetizing reactive power | Q > 0 with finite L_mag |
| Ideal transformer Q≈0 | Very large L_mag → I_mag→0 |
| Power factor is cos(φ) | `cos(acos(PF)) = PF` |
| S² = P² + Q² | Power triangle closure without harmonics |
| S² = P² + Q² + D² | Power triangle closure with harmonics |
| P unchanged when harmonics added | `calculate()` active power invariant to harmonics |
| Q unchanged when harmonics added | Displacement Q invariant |
| S_total > S_displacement with harmonics | True apparent power is larger |

---

### Suite 3: `induction-motor.test.ts`

Induction motor — slip/speed physics and power balance.

| Test | Verifies |
|------|----------|
| Synchronous speed formula | `n_s = 60f/p`: f=50Hz, 2 poles → 1500 RPM |
| Slip definition | `slip = (n_s − n) / n_s` |
| Speed decreases with load | Higher torque → higher slip → lower RPM |
| Power balance | `P_input = P_airgap + P_stator_loss` |
| Airgap power split | `P_airgap = P_output + P_rotor_loss` |
| Efficiency < 100% | Output < input always |
| P unchanged when harmonics added | Active power invariant |
| S² = P² + Q² + D² with harmonics | Power triangle |

---

### Suite 4: `synchronous-motor.test.ts`

Synchronous motor — excitation effects on reactive power.

| Test | Verifies |
|------|----------|
| Under-excitation → Q > 0 (inductive) | Motor absorbs reactive power |
| Over-excitation → Q < 0 (capacitive) | Motor supplies reactive power |
| Unity excitation → Q ≈ 0, PF ≈ 1 | Neither absorbing nor supplying Q |
| P determined by mechanical load | Excitation changes Q, not P |
| P unchanged when harmonics added | Active power invariant |

---

### Suite 5: `bess.test.ts`

BESS inverter — independent P/Q control.

| Test | Verifies |
|------|----------|
| P setpoint = calculated P | Direct active power control |
| Q setpoint = calculated Q | Direct reactive power control |
| Q=0 → PF=1 | Unity power factor at zero reactive setpoint |
| Charging P < 0, discharging P > 0 | Sign convention |
| P unchanged when harmonics added | Active power invariant |
| S² = P² + Q² + D² with harmonics | Power triangle |

---

### File layout

```
web/src/
  __tests__/
    harmonics.test.ts
    transformer.test.ts
    induction-motor.test.ts
    synchronous-motor.test.ts
    bess.test.ts
```

---

## Todos

See SQL todos table.
