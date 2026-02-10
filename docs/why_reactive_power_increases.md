# Why Reactive Power Increases with Low Resistive Load

## The Question
When you decrease the load resistance (move the slider left), you see reactive power (Q) become MUCH larger than active power (P). Why does this happen?

## The Physics

### The Circuit Components

In our transformer model, we have:
- **Resistance (R)**: R_primary + R_load
- **Inductive Reactance (X_L)**: 2πfL (constant, depends on frequency and inductance)

### What Happens When Load Resistance is LOW

#### 1. **Reactance Dominates**

With our example (L=0.5H, f=50Hz):
- X_L = 2π × 50 × 0.5 = **157 Ω** (always the same)

When load = 500Ω:
- R_total = 500.1 Ω
- **X_L/R = 157/500 = 0.31** → Resistance dominates
- Circuit behaves more resistive

When load = 10Ω:
- R_total = 10.1 Ω
- **X_L/R = 157/10 = 15.5** → Reactance dominates!
- Circuit behaves very inductive

#### 2. **Phase Angle Increases**

The phase angle φ = arctan(X_L / R_total)

- High resistance (500Ω): φ = 17° → mostly in phase → resistive
- Low resistance (10Ω): φ = 86° → almost 90° out of phase → inductive

**Physical meaning**: The current lags the voltage by almost 90°!

#### 3. **Higher Current Flows**

Lower resistance → Lower impedance → **Higher current**

- Z = √(R² + X_L²)
- High R (500Ω): Z = 524Ω, I = 0.44A
- Low R (10Ω): Z = 157Ω, I = 1.46A

Current more than TRIPLES!

#### 4. **Power Distribution Changes**

The key equations:
```
P = I² × R_total    (active power - dissipated as heat)
Q = I² × X_L        (reactive power - stored in magnetic field)
```

With **HIGH resistance (500Ω)**:
- P = (0.44)² × 500 = 96 W
- Q = (0.44)² × 157 = 30 VAR
- **P dominates** because R is large

With **LOW resistance (10Ω)**:
- P = (1.46)² × 10 = 22 W  (small R, even with high I²)
- Q = (1.46)² × 157 = 335 VAR (same X_L, but I² is huge!)
- **Q dominates** because X_L stays constant while R is small

## The Key Insight

**Reactive power (Q) increases dramatically because:**

1. **Current increases** (lower impedance)
2. **I² term in Q = I²X_L grows quadratically**
3. **X_L stays constant** (depends only on L and f)
4. **R is very small**, so P = I²R doesn't grow as much

## Analogy

Think of it like this:

**Resistance** is like friction that converts electrical energy to heat (useful work).

**Reactance** is like a spring that stores and releases energy back and forth.

With **low resistance**:
- Little friction → not much energy converted to heat → small P
- The inductor can freely store/release energy → large Q
- Most of the energy just sloshes back and forth in the magnetic field!

With **high resistance**:
- Lots of friction → most energy converted to heat → large P
- The inductor still stores energy, but it's a smaller fraction → small Q

## Why It Matters

This is why:
1. **Inductive motors** (low resistance, high inductance) have poor power factor
2. **Transformers** need power factor correction under light load
3. **Utilities charge** for low power factor (you draw high current but do little useful work)

## Try This in the App

1. Set: V=230V, f=50Hz, L=0.5H, R_primary=0.1Ω
2. Start with Load=500Ω
   - Notice: P > Q, good power factor (0.95)
3. Slowly decrease Load to 10Ω
   - Watch: Q grows MUCH faster than P
   - Phase angle approaches 90°
   - Power factor drops to ~0.06 (very poor!)
4. Observe the power triangle
   - Starts wide (mostly horizontal P)
   - Becomes tall and narrow (mostly vertical Q)

## Mathematical Relationship

At low resistance, when X_L >> R:
- φ approaches 90°
- sin(φ) approaches 1
- cos(φ) approaches 0
- Q = VI sin(φ) → maximum
- P = VI cos(φ) → minimum

The circuit becomes almost purely inductive!
