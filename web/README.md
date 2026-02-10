# AC Transformer Education - Web Version

Interactive browser-based visualization of AC transformer behavior using React and TypeScript.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🎯 Features

### Three Interactive Visualizations:

1. **Power Triangle**
   - Vector representation of P, Q, S
   - Real-time updates as parameters change
   - Color-coded for clarity

2. **Voltage & Current Waveforms**
   - Primary and secondary side waveforms
   - Dual y-axes (voltage/current)
   - Shows 3-4 AC cycles
   - Phase relationship visualization

3. **Power Calculation Diagram**
   - Instantaneous power p(t) = v(t) × i(t)
   - Shaded areas showing energy flow
   - Demonstrates P, Q, S derivation
   - Selectable primary/secondary side

### Control Panel:
- 7 adjustable parameters via sliders
- Real-time visualization updates
- Default values matching educational scenarios

## 🛠️ Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Chart.js** - Interactive charts
- **Tailwind CSS** - Styling

## 📐 Physics Model

The transformer model implements:
- Voltage transformation: V₂ = V₁/n
- Current calculations with magnetizing current
- Power analysis (active, reactive, apparent)
- Time-domain waveform generation
- Instantaneous power calculations

All calculations match the Python desktop version exactly.

## 🎓 Educational Value

Perfect for:
- Electrical engineering students
- Understanding AC power concepts
- Visualizing transformer behavior
- Learning about reactive power
- Phase relationships in AC circuits

## 📁 Project Structure

```
web/
├── src/
│   ├── models/          # Transformer physics
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript definitions
│   ├── App.tsx          # Main application
│   └── main.tsx         # Entry point
├── public/              # Static assets
└── package.json         # Dependencies
```

## 🔗 Related

- [Python Desktop Version](../python/) - tkinter GUI with matplotlib
- [Main Repository](../) - Overview of both versions

## 📄 License

MIT - Educational use encouraged!
