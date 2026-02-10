# Contributing to AC Reactive Power Demonstration

## Quick Start

1. **Install UV** (if not already installed)
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. **Setup Environment**
   ```bash
   uv sync
   ```

3. **Run the Application**
   ```bash
   ./run.sh
   # or
   uv run python src/main.py
   ```

4. **Run Tests**
   ```bash
   uv run pytest
   ```

5. **Format Code**
   ```bash
   uv run black src/ tests/
   uv run pylint src/
   ```

## Code Organization

- `src/models/` - Electrical circuit simulation logic
- `src/gui/` - User interface components (tkinter)
- `src/visualization/` - Power diagrams (matplotlib)
- `tests/` - Unit tests (pytest)

## Development Guidelines

### Electrical Calculations
- Use SI units (V, A, Ω, H, Hz)
- Use RMS values for AC quantities
- Follow power triangle: S² = P² + Q²
- Verify calculations with physical relationships

### GUI Development
- Keep model and view separated
- Update visualizations through model changes
- Call `canvas.draw()` after matplotlib updates

### Testing
- Test electrical relationships (power triangle, Ohm's law)
- Use `np.isclose()` for floating-point comparisons
- Cover boundary conditions

## Adding New Features

1. Implement model logic in `src/models/`
2. Add tests in `tests/`
3. Update GUI in `src/gui/`
4. Update visualization in `src/visualization/`
5. Run tests and linters
6. Update documentation if needed

See `.github/copilot-instructions.md` for detailed conventions.
