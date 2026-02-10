# AC Transformer & Reactive Power Demonstration

An interactive educational tool demonstrating electrical transformer operation, voltage transformation, and reactive power visualization.

## 📦 Project Versions

This repository contains two complete implementations:

### 🐍 Python Version (`/python`)
Desktop GUI application using Python + tkinter + matplotlib

**Features:**
- Complete transformer model with voltage transformation
- Three visualizations: Power Triangle, Waveforms, Power Calculation
- Real-time parameter adjustment
- Comprehensive physics calculations

[**→ Python Documentation**](./python/README.md)

### 🌐 Web Version (`/web`)
Browser-based application using React + TypeScript + Chart.js

**Features:**
- Same physics engine as Python version
- Modern React UI with interactive charts
- Responsive design (works on mobile/tablet/desktop)
- No installation required - runs in browser

[**→ Web Documentation**](./web/README.md) | [**→ Live Demo**](#) *(coming soon)*

## 🎓 Educational Value

Both versions teach fundamental electrical engineering concepts:

1. **Voltage Transformation** - How turns ratio affects voltage (V2 = V1/n)
2. **Current Transformation** - Inverse relationship (I2 = I1 × n)
3. **AC Waveforms** - Sinusoidal voltage and current in time domain
4. **Phase Relationships** - How current lags voltage in inductive circuits
5. **Power Calculation** - Mathematical visualization of p(t) = v(t) × i(t)
6. **Reactive Power** - Energy oscillation in magnetic fields
7. **Power Factor** - Relationship between active and reactive power
8. **Transformer Efficiency** - Power losses and efficiency calculations

## 🚀 Quick Start

### Python Version
```bash
cd python
./run.sh
```

### Web Version
```bash
cd web
npm install
npm run dev
```

## 📊 Visualizations

Both versions include:

1. **Power Triangle** - Vector diagram showing P, Q, S relationships
2. **Voltage & Current Waveforms** - Time-domain AC signals
3. **Power Calculation** - Instantaneous power with energy flow shading

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](./python/CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - see individual version folders for details.

## 🏗️ Version History

- **v2.2.0** (Python) - Power calculation visualization
- **v2.1.0** (Python) - Waveform visualization
- **v2.0.0** (Python) - Proper transformer model
- **v1.0.0** (Web) - Initial React/TypeScript port *(in progress)*

---

Perfect for electrical engineering students, educators, and anyone curious about AC power systems! ⚡
