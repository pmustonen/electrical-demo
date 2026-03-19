# Copilot Instructions for Electrical Machines Education

Browser-based educational simulator for electrical machines — React + TypeScript + Chart.js. Source lives in `web/`.

## Response style

The person prompting you is Finnish. Don't be overly polite. If he prompts something that does not make sense to you, question him first. Keep responses concise without losing information.

## Web App (`web/`)

```bash
cd web

npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # tsc + vite build
npm run lint      # eslint
npm run preview   # preview production build
```

### Web Architecture

**Plugin-style machine registry** — the core design pattern:

1. Every machine type implements `IMachine` (`src/types/machine.ts`):
   - `calculate() → MachineValues`
   - `getWaveformData() → WaveformData`
   - `getPowerCalculationData() → PowerCalculationData`
   - `getMetadata() → MachineMetadata`

2. Each machine lives in `src/machines/<type>/` and exports a `MachineConfig` (constructor + defaultParams + parameter descriptors + presets). The config is registered in `src/machines/index.ts` via `machineRegistry.register(...)`.

3. `useMachine(machineType)` hook (`src/hooks/useMachine.ts`) is the single state manager — it looks up the registry, creates instances, and returns `params`, `values`, `waveformData`, `powerCalcData`, and update helpers.

4. `App.tsx` calls `useMachine` and fans data out to `<PowerTriangle>`, `<WaveformChart>`, `<PowerCalculation>`, and `<ControlBar>`. All visualization components are machine-agnostic.

5. **UI controls are auto-generated** from `MachineParameter[]` descriptors in the config (label, symbol, min/max/step, unit, category). Set `hidden: true` on a parameter to exclude it from the slider UI while still using it in calculations.

### Adding a New Machine Type

1. Create `src/machines/<type>/config.ts` — define `MachineConfig` with constructor, defaultParams, and `MachineParameter[]`
2. Implement `IMachine` in `src/models/<Type>.ts`
3. Add the machine type to the `MachineType` union in `src/types/machine.ts`
4. Export from `src/machines/<type>/index.ts` and register in `src/machines/index.ts`
5. Add machine-specific types to `src/types/machines/<type>.ts` and re-export from `src/types/index.ts`

### Web Conventions

- `MachineParams` / `MachineValues` use camelCase full words (`voltagePrimary`, `resistanceLoad`, `powerActive`)
- The `voltage` key on `MachineParams` must mirror the primary supply voltage for `IMachine` compatibility (transformers duplicate it as `voltagePrimary`)
- Load disconnect is simulated by overriding `resistanceLoad: 1e9` (1 GΩ = open circuit) via `overrideParams` — never a special boolean flag in the model
- Presets live in the machine config, not in component state; load via `loadPreset(name)`

---

## Electrical Conventions

- SI base units internally: V, A, Ω, H, Hz
- **RMS** values for voltage and current (not peak)
- Angular frequency: ω = 2πf
- Turns ratio n > 1 → step-down; n < 1 → step-up; n = 1 → isolation
- Core equations:
  - V₂ = V₁ / n
  - I₁_reflected = I₂ / n
  - I_mag = V₁ / X_mag,  X_mag = ω × L_mag
  - I₁ = √(I_reflected² + I_mag²)
  - S² = P² + Q²
