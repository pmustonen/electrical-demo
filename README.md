# AC Transformer & Reactive Power Demonstration

An interactive Python GUI application that demonstrates **real transformer operation** with voltage transformation, current relationships, and reactive power visualization.

## Overview

This educational tool provides hands-on learning about electrical transformers:
- **Voltage transformation** by adjustable turns ratio (step-up, step-down, isolation)
- **Separate primary and secondary sides** with independent measurements
- **Magnetizing inductance** and reactive power visualization
- **Real-time power triangle** showing active, reactive, and apparent power
- **Efficiency and power factor** calculations
- **Interactive experiments** to understand transformer behavior

## Features

### Adjustable Transformer Parameters

**Primary Side:**
- Voltage: 100-400V RMS
- Frequency: 50Hz or 60Hz
- Primary winding resistance: 0.01-10Ω

**Transformer Core:**
- **Turns ratio: 0.5:1 to 20:1** (N1/N2)
  - >1: Step-down transformer
  - <1: Step-up transformer  
  - =1: Isolation transformer
- Magnetizing inductance: 0.5-20H

**Secondary Side:**
- Secondary winding resistance: 0.01-5Ω
- Load resistance: 1-100Ω

### Real-Time Measurements

**Primary Side:**
- Voltage (V1)
- Current (I1) - includes magnetizing + reflected load current
- Apparent power (S1)

**Secondary Side:**
- Voltage ideal (V2 = V1/n)
- Voltage actual (with winding resistance drop)
- Current (I2)
- Apparent power (S2)

**Performance:**
- Power factor
- Efficiency (%)
- Power to load (W)
- Reactive power (VAR)

### Real-Time Visualizations

**Power Triangle Diagram:**
- Vector diagram showing active, reactive, and apparent power
- Active power (P) - blue arrow
- Reactive power (Q) - red arrow
- Apparent power (S) - green arrow
- Color-coded power factor indicator

**Waveform Diagrams:**
- **Primary side waveforms:** Voltage (V1) and current (I1) vs. time
- **Secondary side waveforms:** Voltage (V2) and current (I2) vs. time
- Shows 3-4 complete AC cycles
- Demonstrates phase relationships (current lag due to inductance)
- Dual y-axes for voltage and current
- Updates in real-time as parameters change

## Installation

This project uses [uv](https://docs.astral.sh/uv/) for fast, reliable package management.

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Sync dependencies (creates venv automatically)
uv sync
```

## Usage

```bash
# Quick start - runs everything
./run.sh

# Or manually with uv
uv run python src/main.py
```

## Documentation

- **[User Guide](docs/user_guide.md)** - Complete usage guide with experiments
- **[Electrical Model](docs/electrical_model.md)** - Transformer theory and equations
- **[Why Reactive Power Increases](docs/why_reactive_power_increases.md)** - Deep dive into reactive power
- **[Contributing](CONTRIBUTING.md)** - Development guidelines

## Project Structure

- `src/` - Source code
  - `main.py` - Application entry point
  - `gui/` - Tkinter-based user interface
  - `models/transformer.py` - Real transformer model with voltage transformation
  - `visualization/` - Power triangle and waveform diagrams (matplotlib)
- `tests/` - Comprehensive test suite
- `docs/` - User guide, electrical theory, and examples

## Educational Value

This application teaches fundamental concepts:

1. **Voltage Transformation** - How turns ratio affects voltage (V2 = V1/n)
2. **Current Transformation** - Inverse relationship (I2 = I1 × n)
3. **AC Waveforms** - Sinusoidal voltage and current in time domain
4. **Phase Relationships** - How current lags voltage in inductive circuits
5. **Power Conservation** - Input power = output power + losses
6. **Magnetizing Inductance** - Why transformers draw reactive power
7. **Efficiency** - How losses affect performance
8. **Power Factor** - Relationship between active and reactive power
9. **No-Load vs. Loaded** - How transformers behave under different loads

Perfect for:
- Electrical engineering students
- Professional development
- Understanding power transformers
- Learning about reactive power
- Experimenting with transformer design

## Testing

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src

# Run specific test
uv run pytest tests/test_transformer.py -v
```

The transformer model is validated with tests for:
- Voltage transformation (V2 = V1/n)
- Current relationships
- Power conservation
- Magnetizing inductance calculations
- Efficiency and power factor

## Development

```bash
# Format code
uv run black src/ tests/

# Lint code
uv run pylint src/

# Type check
uv run mypy src/
```

## License

MIT

## Acknowledgments

Built with Python, tkinter, NumPy, and Matplotlib for transformer and AC power education.

Demonstrates real transformer physics including voltage transformation, magnetizing inductance, and reactive power.
