# Changelog

## [2.1.0] - 2026-02-10 - WAVEFORM VISUALIZATION

### 🌊 New Feature: Time-Domain Waveforms

Added comprehensive voltage and current waveform visualization showing actual AC sinusoidal signals.

### Added

**Waveform Visualization:**
- ✅ **Primary side waveforms**: V1(t) and I1(t) displayed on left subplot
- ✅ **Secondary side waveforms**: V2(t) and I2(t) displayed on right subplot
- ✅ **Time domain display**: Shows 3-4 complete AC cycles
- ✅ **Dual y-axes**: Voltage and current on separate scales
- ✅ **Phase relationships**: Clearly shows current lag due to inductance
- ✅ **Real-time updates**: Waveforms update as parameters change
- ✅ **Accurate physics**: Peak values = RMS × √2, correct frequency (50/60 Hz)

**New Component:**
- `src/visualization/waveform_diagram.py` - WaveformDiagram class with matplotlib

**Model Enhancement:**
- `Transformer.get_waveform_data(num_cycles=3)` - Generates time-domain data
- Calculates instantaneous voltage and current values
- Includes proper phase calculations from power factor

**Tests:**
- 13 new comprehensive waveform tests
- Validates amplitudes, frequencies, phase relationships
- Tests step-up, step-down, and different loads

### Changed

**GUI:**
- Window height increased: 900px → 1200px
- Right panel now shows two visualizations:
  1. Power triangle (top)
  2. Waveform diagrams (bottom)
- Layout automatically adjusts proportions

**Documentation:**
- Updated README with waveform features
- Educational value expanded with AC waveform concepts

### Technical Details

**Physics Implementation:**
- Primary voltage: V1(t) = V1_rms × √2 × sin(2πft)
- Primary current: I1(t) = I1_rms × √2 × sin(2πft - φ)
- Secondary voltage: V2(t) = V2_rms × √2 × sin(2πft)
- Secondary current: I2(t) = I2_rms × √2 × sin(2πft - φ)
- Phase angle φ = arccos(power_factor)

## [2.0.0] - 2026-02-10 - PROPER TRANSFORMER MODEL

### 🎉 Major Rebuild - Now a Real Transformer!

Completely rebuilt the application to model a **proper electrical transformer** with voltage transformation, instead of a simple series RL circuit.

### Added - Transformer Model

**Core Transformer Features:**
- ✅ **Voltage transformation** by turns ratio: V2 = V1/n
- ✅ **Current transformation** (inverse): I1_reflected = I2/n
- ✅ **Separate primary and secondary windings**
- ✅ **Magnetizing inductance** creating magnetic coupling
- ✅ **Primary winding**: V1, I1, R1, S1
- ✅ **Secondary winding**: V2, I2, R2, S2
- ✅ **Turns ratio control**: 0.5:1 to 20:1 (step-up, step-down, isolation)
- ✅ **Voltage regulation**: V2_actual vs V2_ideal under load
- ✅ **Efficiency calculation**: Power out / Power in
- ✅ **Power factor with magnetizing current**

**New Parameters:**
- Turns ratio slider (N1/N2)
- Magnetizing inductance slider
- Secondary winding resistance
- Separate primary/secondary displays

**New Displays:**
- Primary side: V1, I1, S1
- Secondary side: V2 (ideal), V2 (actual), I2, S2
- Performance: Power factor, efficiency, power to load, reactive power

### Changed

**Model:** 
- Replaced `TransformerCircuit` (series RL) with `Transformer` (proper transformer)
- File: `src/models/transformer.py` completely rewritten
- Now models real transformer physics

**GUI:**
- Reorganized into three sections:
  1. Primary Side Parameters
  2. Transformer Parameters (with turns ratio!)
  3. Secondary Side Parameters
- Added separate value displays for primary and secondary
- Window title: "AC Transformer & Reactive Power Demonstration"
- Wider window (1400x900) to accommodate more information

**Documentation:**
- `docs/electrical_model.md` - Complete transformer theory
- `docs/user_guide.md` - Transformer-focused experiments
- `docs/why_reactive_power_increases.md` - Still relevant for magnetizing current
- `README.md` - Updated for transformer model
- `.github/copilot-instructions.md` - Updated architecture and conventions

### Validated

All transformer physics verified:
- ✅ Voltage transformation: V2/V1 = 1/n
- ✅ Current relationships
- ✅ Power conservation
- ✅ Magnetizing inductance calculations
- ✅ Efficiency and power factor formulas

### Migration Notes

**Breaking Changes:**
- Old series RL circuit model removed
- Different parameter ranges (turns ratio instead of inductance emphasis)
- GUI layout completely changed
- Model API changed (`Transformer` vs `TransformerCircuit`)

**What's the Same:**
- Power triangle visualization
- Reactive power concepts
- tkinter + matplotlib architecture
- UV package management
- Testing framework

## [1.0.0] - 2026-02-10 (Earlier today)

### Added - Series RL Circuit Model
- Complete GUI controls for all circuit parameters
- Enhanced display panels
- Circuit model enhancements
- Comprehensive testing (25 tests)
- Full documentation

*Note: This version modeled a series RL circuit, not a transformer. See v2.0.0 for proper transformer model.*

## [0.1.0] - Initial Release
- Basic transformer circuit model
- Simple load control
- Power triangle visualization
- Basic power calculations
