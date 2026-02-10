# Electrical Model Documentation - Proper Transformer

## Overview

This application models a **real transformer** with primary and secondary windings, voltage transformation, and magnetizing inductance.

## Transformer Circuit Model

### Schematic Representation

```
PRIMARY SIDE                         SECONDARY SIDE
                    ╭──────────╮
    V1 ──[R1]───────┤          ├────[R2]───[R_load]
                    │  Ideal   │
    |       L_mag   │Transformer│              |
    |               │   n:1    │              |
    └───────────────┤          ├──────────────┘
                    ╰──────────╯

Where:
    V1        = Primary voltage (RMS)
    R1        = Primary winding resistance
    L_mag     = Magnetizing inductance
    n         = Turns ratio (N1/N2)
    R2        = Secondary winding resistance
    R_load    = Load resistance
```

## Mathematical Model

### Core Parameters

- **V1**: Primary voltage (volts RMS)
- **f**: Frequency (Hz)
- **n**: Turns ratio = N1/N2 (primary turns / secondary turns)
- **L_mag**: Magnetizing inductance (henries)
- **R1**: Primary winding resistance (ohms)
- **R2**: Secondary winding resistance (ohms)
- **R_load**: Load resistance on secondary (ohms)

### Voltage Transformation

The fundamental transformer relationship:

```
V2 = V1 / n

Where:
    V2 = Secondary voltage (ideal, no-load)
    V1 = Primary voltage
    n  = Turns ratio
```

**Examples:**
- n = 10:1 (step-down): 230V → 23V
- n = 1:10 (step-up): 23V → 230V
- n = 1:1 (isolation): 230V → 230V

### Current Transformation

Currents transform inversely to voltages:

```
I1_reflected = I2 / n

Where:
    I1_reflected = Secondary current reflected to primary
    I2 = Secondary current
```

**Power conservation** (ideal transformer):
```
V1 × I1 = V2 × I2
```

### Magnetizing Inductance

The magnetizing inductance creates the magnetic field:

```
X_mag = ωL_mag = 2πfL_mag  (magnetizing reactance)
I_mag = V1 / X_mag          (magnetizing current)
Q_mag = I_mag² × X_mag      (reactive power)
```

**Physical meaning:**
- I_mag creates the magnetic flux
- This current is always present, even at no-load
- Causes reactive power consumption
- Lags voltage by 90°

### Total Primary Current

The primary current has two components:

```
I1 = √(I_reflected² + I_mag²)

Where:
    I_reflected = I2 / n  (load current transformed to primary)
    I_mag = V1 / X_mag    (magnetizing current)
```

These currents add as **phasors** (vectors), not simple addition.

### Secondary Circuit

The secondary side is a simple resistive circuit:

```
I2 = V2_ideal / (R2 + R_load)
V2_actual = V2_ideal - (I2 × R2)
V_load = I2 × R_load
```

### Power Distribution

**Primary Side:**
```
S1 = V1 × I1                    (Apparent power input)
P1_loss = I1² × R1              (Copper losses in primary)
```

**Secondary Side:**
```
S2 = V2_actual × I2             (Apparent power output)
P_load = I2² × R_load           (Power delivered to load)
P2_loss = I2² × R2              (Copper losses in secondary)
```

**Magnetizing:**
```
Q_mag = I_mag² × X_mag          (Reactive power for magnetization)
```

**Power Balance:**
```
P_input = P_load + P1_loss + P2_loss
```

### Performance Metrics

**Power Factor:**
```
pf = P_total / S1 = (P_load + P1_loss + P2_loss) / (V1 × I1)
```

**Efficiency:**
```
η = P_load / S1 = P_load / (P_load + P1_loss + P2_loss + Q_mag)
```

## Physical Interpretation

### 1. Voltage Transformation
- **Turns ratio** determines voltage transformation
- More turns on primary → step-down transformer
- More turns on secondary → step-up transformer
- Voltage ratio = turns ratio

### 2. Current Transformation
- **Current transforms inversely** to voltage
- Step-down voltage → step-up current
- This maintains power balance: V↓ but I↑

### 3. Magnetizing Inductance
- **Creates the magnetic field** linking primary and secondary
- Always draws reactive power (even at no-load)
- Larger L_mag → smaller magnetizing current → better efficiency
- Critical for transformer operation

### 4. Winding Resistances
- **Copper losses** in windings
- Cause voltage drops
- Reduce efficiency
- Generate heat

### 5. No-Load vs. Loaded Operation

**No-Load (R_load → ∞):**
- I2 ≈ 0
- I1 ≈ I_mag (only magnetizing current)
- V2_actual ≈ V2_ideal
- Low power factor (mostly reactive)

**Full Load (R_load low):**
- I2 large
- I1 ≈ I2/n (reflected current dominates)
- V2_actual < V2_ideal (voltage regulation)
- Higher power factor

## Key Relationships

### Effect of Turns Ratio
- **Higher n** (more primary turns):
  - Lower secondary voltage: V2 = V1/n ↓
  - Higher secondary current: I2 = I1×n ↑
  - Step-down transformer
  
- **Lower n** (fewer primary turns):
  - Higher secondary voltage: V2 = V1/n ↑
  - Lower secondary current: I2 = I1×n ↓
  - Step-up transformer

### Effect of Load
- **Light load** (high R_load):
  - Low secondary current
  - Magnetizing current significant portion of I1
  - Low power factor
  - High voltage regulation (V2 close to ideal)

- **Heavy load** (low R_load):
  - High secondary current
  - Reflected current dominates I1
  - Better power factor
  - Voltage drop more significant

### Effect of Magnetizing Inductance
- **High L_mag**:
  - Low magnetizing current
  - Low reactive power
  - Better power factor
  - Better efficiency

- **Low L_mag**:
  - High magnetizing current
  - High reactive power
  - Poor power factor
  - Lower efficiency

### Effect of Frequency
- **Higher frequency**:
  - Higher X_mag = 2πfL_mag
  - Lower magnetizing current
  - Less reactive power
  - (This is why aircraft use 400Hz!)

## Assumptions and Simplifications

### Included in Model:
✅ Voltage transformation by turns ratio
✅ Current transformation
✅ Magnetizing inductance
✅ Primary and secondary winding resistances
✅ Copper losses
✅ Reactive power from magnetization
✅ Power factor and efficiency calculations

### Simplified/Omitted:
- **Leakage inductances**: Assumed small
- **Core losses**: Hysteresis and eddy currents not modeled
- **Magnetic saturation**: Assumed linear operation
- **Capacitance**: Winding capacitance neglected
- **Harmonics**: Sinusoidal waveforms assumed
- **Temperature effects**: Resistance assumed constant

These simplifications are reasonable for educational purposes and don't affect the core concepts of reactive power and voltage transformation.

## Typical Values

### Small Power Transformer (230V:24V, 50VA)
- Primary voltage: 230V
- Turns ratio: ~10:1
- Magnetizing inductance: 5-10H
- Primary resistance: 20-50Ω
- Secondary resistance: 0.2-0.5Ω
- Efficiency: 85-95%

### Isolation Transformer (230V:230V, 1kVA)
- Primary voltage: 230V
- Turns ratio: 1:1
- Magnetizing inductance: 10-20H
- Primary resistance: 1-5Ω
- Secondary resistance: 1-5Ω
- Efficiency: 90-98%

## Code Implementation

The model is implemented in `src/models/transformer.py` with:
- Full voltage and current transformation
- Magnetizing inductance with reactive power
- Primary and secondary winding resistances
- Input validation
- All calculations return separate primary/secondary values

All physics is tested in `tests/test_transformer.py` to verify:
- Voltage transformation: V2 = V1/n
- Current relationships
- Power conservation
- Efficiency calculations
