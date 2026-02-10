# Copilot Instructions for AC Transformer Demonstration

This project is an educational Python GUI application that demonstrates **real transformer operation** with voltage transformation, magnetizing inductance, and reactive power visualization.

## Build, Test, and Lint Commands

This project uses **[uv](https://docs.astral.sh/uv/)** for package management - a fast, modern Python package manager.

### Environment Setup
```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Sync all dependencies (creates/updates venv automatically)
uv sync
```

### Running the Application
```bash
# Quick start with script
./run.sh

# Or run directly with uv
uv run python src/main.py
```

### Testing
```bash
# Run all tests
uv run pytest

# Run specific test file
uv run pytest tests/test_transformer.py

# Run specific test
uv run pytest tests/test_transformer.py::TestTransformerCircuit::test_calculate_power

# Run with coverage
uv run pytest --cov=src --cov-report=term-missing

# Run with verbose output
uv run pytest -v
```

### Code Quality
```bash
# Format code with Black
uv run black src/ tests/

# Check formatting without changes
uv run black --check src/ tests/

# Lint with pylint
uv run pylint src/

# Type check with mypy
uv run mypy src/
```

### Adding Dependencies
```bash
# Add runtime dependency
uv add package-name

# Add dev dependency
uv add --dev package-name

# Update all dependencies
uv sync --upgrade
```

## Architecture Overview

### Core Components

The application follows a three-layer architecture:

1. **Models Layer** (`src/models/`)
   - `Transformer`: Real transformer model with primary/secondary windings
   - Implements voltage transformation: V2 = V1/n
   - Implements current transformation: I1_reflected = I2/n
   - Magnetizing inductance for reactive power
   - Calculates primary and secondary values separately
   - Uses numpy for electrical calculations

2. **Visualization Layer** (`src/visualization/`)
   - Handles matplotlib-based power diagrams
   - `PowerDiagram`: Renders power triangle (P, Q, S vectors)
   - Embeds matplotlib figures in tkinter
   - Updates in real-time as parameters change

3. **GUI Layer** (`src/gui/`)
   - tkinter-based user interface
   - `MainWindow`: Coordinates transformer model and visualization
   - Separate panels for primary/secondary sides
   - Links user controls to transformer parameters
   - Displays both primary and secondary values

### Data Flow
1. User adjusts parameter (e.g., turns ratio, load) via GUI
2. MainWindow updates Transformer model
3. Transformer recalculates all values (primary, secondary, magnetizing)
4. MainWindow retrieves calculated values via `get_all_values()`
5. MainWindow updates displays and PowerDiagram
6. PowerDiagram redraws power triangle

## Key Conventions

### Electrical Variable Naming
- Use electrical engineering conventions for variable names:
  - `V1` = Primary voltage (volts RMS)
  - `V2` = Secondary voltage (volts RMS)
  - `I1` = Primary current (amperes RMS)
  - `I2` = Secondary current (amperes RMS)
  - `n` = Turns ratio (N1/N2, dimensionless)
  - `L_mag` = Magnetizing inductance (henries)
  - `R1` = Primary resistance (ohms)
  - `R2` = Secondary resistance (ohms)
  - `R_load` = Load resistance (ohms)
  - `I_mag` = Magnetizing current (amperes)
  - `X_mag` = Magnetizing reactance (ohms)
  - `S1`, `S2` = Apparent power primary/secondary (VA)
  - `P` = Active power (watts)
  - `Q` = Reactive power (VAR)
  - `pf` = Power factor (dimensionless)
  - `omega` = Angular frequency (rad/s)
- Short variable names are ALLOWED and PREFERRED for electrical quantities (pylint C0103 disabled)

### Transformer Equations
- **Voltage transformation**: V2_ideal = V1 / n
- **Current transformation**: I1_reflected = I2 / n
- **Power conservation**: V1 × I1 ≈ V2 × I2 + losses
- **Magnetizing current**: I_mag = V1 / X_mag
- **Total primary current**: I1 = √(I_reflected² + I_mag²)
- **Reactive power**: Q = I_mag² × X_mag

### Units and Calculations
- Always use SI base units internally (volts, amperes, ohms, henries, hertz)
- RMS values for voltage and current, not peak values
- Angular frequency in radians: ω = 2πf
- Turns ratio: n > 1 is step-down, n < 1 is step-up, n = 1 is isolation

### GUI Updates
- Use the observer pattern: model changes trigger view updates
- All matplotlib updates must call `canvas.draw()` to refresh
- Power diagram automatically scales based on maximum power values

### Testing
- Test transformer calculations with known values and verify physical relationships
- Use `np.isclose()` for floating-point comparisons with tolerance
- Verify voltage transformation: V2 = V1/n
- Verify power conservation within numerical tolerance
- Test with different turns ratios (step-up, step-down, isolation)

### Code Style
- Line length: 100 characters (configured in pyproject.toml)
- Use docstrings with Args/Returns sections for all public methods
- Type hints optional but encouraged for complex functions
- Black formatting required before commits
