# Documentation

## Available Documentation

- **[User Guide](user_guide.md)** - Complete usage guide with transformer experiments
- **[Electrical Model](electrical_model.md)** - Transformer theory, equations, and physics
- **[Why Reactive Power Increases](why_reactive_power_increases.md)** - Deep dive into reactive power concepts

## Quick Reference

### Transformer Fundamentals
```
Voltage Transformation:  V2 = V1 / n
Current Transformation:  I1_reflected = I2 / n
Power Conservation:      V1 × I1 ≈ V2 × I2
Turns Ratio:            n = N1 / N2
```

### Step-Down vs Step-Up
```
Step-Down (n > 1):  230V → 23V   (voltage ↓, current ↑)
Step-Up (n < 1):    23V → 230V   (voltage ↑, current ↓)
Isolation (n = 1):  230V → 230V  (same voltage)
```

### Reactive Power
```
Magnetizing Current: I_mag = V1 / X_mag
Reactive Power:      Q = I_mag² × X_mag
Occurs even at no-load!
```

### Performance
```
Power Factor:  pf = P_total / S1
Efficiency:    η = P_load / S1
```

## Learning Path

1. **Start with User Guide** - Understand the interface
2. **Try Basic Experiments** - See voltage transformation in action
3. **Read Electrical Model** - Learn the theory
4. **Explore Reactive Power** - Understand why it matters
5. **Experiment!** - Adjust parameters and observe

## Examples

See user_guide.md for:
- Basic voltage transformation
- Step-up transformer setup
- Efficiency optimization
- No-load operation
- Voltage regulation
- And more!
