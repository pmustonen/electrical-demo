# User Guide - AC Transformer Demonstration

## Overview

This interactive application demonstrates how **real transformers** work, including voltage transformation, current relationships, and reactive power. Perfect for learning electrical engineering concepts!

## Quick Start

```bash
./run.sh
```

The application window shows:
- **Left panel**: Controls and measured values
- **Right panel**: Power triangle visualization

## Understanding the Interface

### Primary Side Parameters

**Primary Voltage (100-400V)**
- The voltage applied to the primary winding
- Default: 230V (European residential)
- This is what you plug into the wall

**Frequency (50Hz or 60Hz)**
- AC frequency of the power source
- 50Hz: Europe, most of world
- 60Hz: Americas, parts of Asia
- Affects magnetizing reactance

**Primary Resistance (0.01-10Ω)**
- Resistance of the primary winding copper
- Causes power loss and heat
- Typical: 1-5Ω for small transformers

### Transformer Parameters

**Turns Ratio (0.5:1 to 20:1)**
- **Most important parameter!**
- Ratio of primary to secondary turns: n = N1/N2
- Determines voltage transformation:
  - n > 1: Step-down (e.g., 10:1 means 230V → 23V)
  - n < 1: Step-up (e.g., 0.5:1 means 115V → 230V)
  - n = 1: Isolation transformer (same voltage)

**Magnetizing Inductance (0.5-20H)**
- Creates the magnetic field that couples primary to secondary
- Draws magnetizing current (reactive power)
- Higher is better for efficiency
- Typical: 5-10H for small transformers

### Secondary Side Parameters

**Secondary Resistance (0.01-5Ω)**
- Resistance of the secondary winding copper
- Causes voltage drop under load
- Typical: 0.1-0.5Ω

**Load Resistance (1-100Ω)**
- The device connected to the transformer output
- Lower resistance = more current drawn = more power
- Examples:
  - Light bulb: 50-200Ω
  - Motor: 5-20Ω
  - Heater: 10-50Ω

## Display Values Explained

### Primary Side Values

**Voltage (V1)**
- What you set with the slider
- Applied to primary winding

**Current (I1)**
- Primary current has two parts:
  1. Magnetizing current (creates field)
  2. Reflected load current (from secondary)
- Formula: I1 = √(I_reflected² + I_mag²)

**Apparent Power (S1)**
- Total power drawn from source
- S1 = V1 × I1
- Measured in VA (volt-amperes)

### Secondary Side Values

**Voltage (ideal)**
- Calculated from turns ratio: V2 = V1/n
- What you'd get with no load and no losses
- Example: 230V ÷ 10 = 23V

**Voltage (actual)**
- Real voltage at the load
- Lower than ideal due to winding resistance
- V2_actual = V2_ideal - (I2 × R2)

**Current (I2)**
- Current flowing in secondary and through load
- I2 = V2 / (R2 + R_load)
- Transforms from I1 by turns ratio

**Apparent Power (S2)**
- Power delivered to secondary side
- S2 = V2_actual × I2
- Less than S1 due to losses

### Performance Metrics

**Power Factor**
- Ratio of real power to apparent power
- Range: 0 to 1 (closer to 1 is better)
- Low at light load (magnetizing current dominates)
- Higher at full load (load current dominates)

**Efficiency**
- Percentage of input power delivered to load
- η = P_load / S1 × 100%
- Losses reduce efficiency:
  - Copper losses in windings
  - Reactive power (magnetizing)

**Power to Load**
- Actual useful power: P_load = I2² × R_load
- This is what powers your device
- Measured in Watts

**Reactive Power**
- Power oscillating in magnetic field
- Q = I_mag² × X_mag
- Necessary for transformer operation
- Doesn't do useful work
- Measured in VAR

## How Voltage Transformation Works

### Step-Down Example (10:1 ratio)

```
Primary:    230V, low current
    ↓  (10:1 turns ratio)
Secondary:  23V, high current
```

- Primary has 10× more turns than secondary
- Voltage steps DOWN by factor of 10
- Current steps UP by factor of 10
- Power conserved: 230V × 1A = 23V × 10A

### Step-Up Example (1:10 ratio = 0.1:1)

```
Primary:    23V, high current
    ↓  (1:10 turns ratio)
Secondary:  230V, low current
```

- Secondary has 10× more turns than primary
- Voltage steps UP by factor of 10
- Current steps DOWN by factor of 10

### Key Formula

**Always remember:**
```
V2/V1 = 1/n
I2/I1 = n
V1 × I1 ≈ V2 × I2  (power conservation)
```

## Experiments to Try

### 1. Basic Voltage Transformation

**Setup:**
- Primary voltage: 230V
- Turns ratio: 10:1
- Load: 10Ω

**Observe:**
- Secondary voltage ≈ 23V (230V ÷ 10)
- Secondary current ≈ 2.3A
- Primary current ≈ 0.27A (includes magnetizing current)

**Lesson:** Voltage transforms by turns ratio!

### 2. Step-Up Transformer

**Setup:**
- Primary voltage: 230V
- Turns ratio: 0.5:1 (step-up to 460V!)
- Load: 100Ω

**Observe:**
- Secondary voltage ≈ 460V (230V ÷ 0.5)
- Lower secondary current
- Higher primary current

**Lesson:** Step-up transformers increase voltage but decrease current.

### 3. Effect of Load on Efficiency

**Setup:**
- Primary: 230V
- Turns ratio: 10:1
- Magnetizing inductance: 5H

**Try:**
a) High load (1Ω): Watch efficiency
b) Medium load (10Ω): Watch efficiency
c) Light load (100Ω): Watch efficiency

**Observe:**
- Efficiency highest at medium/heavy load
- Efficiency drops at light load (magnetizing current becomes significant)

**Lesson:** Transformers are most efficient near their rated load.

### 4. No-Load Operation

**Setup:**
- Primary: 230V
- Turns ratio: 10:1
- Load: 100Ω (very high = light load)
- Mag. inductance: 5H

**Observe:**
- Primary current is mostly magnetizing current
- Low power factor
- Secondary voltage close to ideal
- Most power is reactive (not useful)

**Lesson:** Transformers draw reactive power even with no load!

### 5. Voltage Regulation

**Setup:**
- Primary: 230V
- Turns ratio: 10:1
- Secondary resistance: 1Ω

**Try:**
a) Light load (100Ω): Check V2_actual vs V2_ideal
b) Heavy load (5Ω): Check V2_actual vs V2_ideal

**Observe:**
- Heavy load → larger voltage drop
- V2_actual < V2_ideal due to winding resistance
- This is "voltage regulation"

**Lesson:** Secondary voltage drops under heavy load.

### 6. Magnetizing Inductance Effect

**Setup:**
- Primary: 230V
- Turns ratio: 10:1
- Load: 10Ω

**Try:**
a) Low L_mag (1H): Watch reactive power and power factor
b) High L_mag (20H): Watch reactive power and power factor

**Observe:**
- Higher L_mag → lower reactive power
- Higher L_mag → better power factor
- Higher L_mag → better efficiency

**Lesson:** Larger cores (more inductance) make better transformers!

## Power Triangle Visualization

The right panel shows vectors:

- **Blue arrow (P)**: Power to load - useful work
- **Red arrow (Q)**: Reactive power - magnetizing
- **Green arrow (S)**: Total apparent power

**Shape indicates performance:**
- Wide triangle (horizontal): Good power factor, efficient
- Tall triangle (vertical): Poor power factor, lots of reactive power

## Common Transformer Applications

### 1. Phone Charger (Step-Down)
- Primary: 230V
- Turns ratio: ~10:1
- Secondary: 24V
- Then rectified to DC

### 2. Power Distribution (Step-Up)
- Primary: 11kV (power station)
- Turns ratio: 1:20
- Secondary: 220kV (transmission lines)
- Reduces current for efficient transmission

### 3. Isolation Transformer (1:1)
- Turns ratio: 1:1
- Same voltage in/out
- Provides electrical isolation
- Improves safety

## Tips for Understanding

1. **Focus on turns ratio** - This is the key to transformers!
2. **Watch voltage AND current** - They transform inversely
3. **Compare ideal vs actual** - See the effect of losses
4. **Try extremes** - Very high/low loads show different behaviors
5. **Power is conserved** - Input ≈ Output + Losses

## Why Reactive Power Matters in Transformers

Even with **no load**, a transformer draws magnetizing current because:

1. **Magnetic field required** - To couple primary to secondary
2. **Inductance** - The windings are big coils
3. **Energy storage** - Magnetic field stores/releases energy each cycle
4. **90° phase shift** - Magnetizing current lags voltage

This reactive power:
- Doesn't do useful work
- Must be supplied by the power source
- Reduces power factor
- Is larger at light loads
- Can be reduced with larger core (more L_mag)

## Troubleshooting

**Secondary voltage too low?**
- Check turns ratio (should be V1/desired V2)
- Check load - heavy loads cause voltage drop
- Increase secondary resistance to see effect

**Low efficiency?**
- Reduce winding resistances
- Increase magnetizing inductance
- Operate at rated load (not too light)

**Poor power factor?**
- Increase load (more current reduces magnetizing current proportion)
- Increase magnetizing inductance

## Learning More

See also:
- `electrical_model.md` - Detailed equations and theory
- `why_reactive_power_increases.md` - Deep dive into reactive power
- `README.md` - Project overview

Happy learning! ⚡🔄⚡
