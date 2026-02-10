"""Main application window for AC Transformer Demonstration."""

import tkinter as tk
from tkinter import ttk
from models.transformer import Transformer
from visualization.power_diagram import PowerDiagram
from visualization.waveform_diagram import WaveformDiagram
from visualization.power_calculation_diagram import PowerCalculationDiagram


class MainWindow:
    """Main window for the transformer demonstration."""

    def __init__(self, root):
        """Initialize the main window."""
        self.root = root
        self.root.title("AC Transformer & Reactive Power Demonstration")
        self.root.geometry("1400x1400")  # Reduced to fit most screens
        
        # Initialize the transformer (230V:23V, 10:1 ratio)
        self.transformer = Transformer(
            voltage_primary=230.0,  # V
            frequency=50.0,  # Hz
            turns_ratio=10.0,  # N1/N2 (step-down)
            inductance_mag=5.0,  # H (magnetizing)
            resistance_primary=1.0,  # Ω
            resistance_secondary=0.1  # Ω
        )
        
        self._create_widgets()
        self._update_display()
    
    def _create_widgets(self):
        """Create and layout all widgets."""
        # Main container
        main_container = ttk.Frame(self.root)
        main_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Left panel for controls
        left_panel = ttk.Frame(main_container, width=400)
        left_panel.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))
        left_panel.pack_propagate(False)
        
        # Right panel for visualization
        right_panel = ttk.Frame(main_container)
        right_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # === LEFT PANEL ===
        
        # Primary parameters
        primary_frame = ttk.LabelFrame(left_panel, text="Primary Side Parameters", padding=10)
        primary_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Primary voltage
        ttk.Label(primary_frame, text="Primary Voltage (V):").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.v1_var = tk.DoubleVar(value=230.0)
        v1_slider = ttk.Scale(primary_frame, from_=100.0, to=400.0, orient=tk.HORIZONTAL,
                             variable=self.v1_var, command=self._on_v1_change, length=200)
        v1_slider.grid(row=0, column=1, padx=5, pady=5)
        self.v1_label = ttk.Label(primary_frame, text="230.0 V")
        self.v1_label.grid(row=0, column=2, sticky=tk.W, pady=5)
        
        # Frequency
        ttk.Label(primary_frame, text="Frequency:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.freq_var = tk.DoubleVar(value=50.0)
        freq_frame = ttk.Frame(primary_frame)
        freq_frame.grid(row=1, column=1, columnspan=2, sticky=tk.W, pady=5)
        ttk.Radiobutton(freq_frame, text="50 Hz", variable=self.freq_var, 
                       value=50.0, command=self._on_freq_change).pack(side=tk.LEFT, padx=5)
        ttk.Radiobutton(freq_frame, text="60 Hz", variable=self.freq_var,
                       value=60.0, command=self._on_freq_change).pack(side=tk.LEFT, padx=5)
        
        # Primary resistance
        ttk.Label(primary_frame, text="Primary R (Ω):").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.r1_var = tk.DoubleVar(value=1.0)
        r1_slider = ttk.Scale(primary_frame, from_=0.01, to=10.0, orient=tk.HORIZONTAL,
                             variable=self.r1_var, command=self._on_r1_change, length=200)
        r1_slider.grid(row=2, column=1, padx=5, pady=5)
        self.r1_label = ttk.Label(primary_frame, text="1.00 Ω")
        self.r1_label.grid(row=2, column=2, sticky=tk.W, pady=5)
        
        # Transformer parameters
        transformer_frame = ttk.LabelFrame(left_panel, text="Transformer Parameters", padding=10)
        transformer_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Turns ratio
        ttk.Label(transformer_frame, text="Turns Ratio (N1/N2):").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.turns_var = tk.DoubleVar(value=10.0)
        turns_slider = ttk.Scale(transformer_frame, from_=0.5, to=20.0, orient=tk.HORIZONTAL,
                                variable=self.turns_var, command=self._on_turns_change, length=200)
        turns_slider.grid(row=0, column=1, padx=5, pady=5)
        self.turns_label = ttk.Label(transformer_frame, text="10.0:1")
        self.turns_label.grid(row=0, column=2, sticky=tk.W, pady=5)
        
        # Magnetizing inductance
        ttk.Label(transformer_frame, text="Mag. Inductance (H):").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.lm_var = tk.DoubleVar(value=5.0)
        lm_slider = ttk.Scale(transformer_frame, from_=0.5, to=20.0, orient=tk.HORIZONTAL,
                             variable=self.lm_var, command=self._on_lm_change, length=200)
        lm_slider.grid(row=1, column=1, padx=5, pady=5)
        self.lm_label = ttk.Label(transformer_frame, text="5.00 H")
        self.lm_label.grid(row=1, column=2, sticky=tk.W, pady=5)
        
        # Secondary parameters
        secondary_frame = ttk.LabelFrame(left_panel, text="Secondary Side Parameters", padding=10)
        secondary_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Secondary resistance
        ttk.Label(secondary_frame, text="Secondary R (Ω):").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.r2_var = tk.DoubleVar(value=0.1)
        r2_slider = ttk.Scale(secondary_frame, from_=0.01, to=5.0, orient=tk.HORIZONTAL,
                             variable=self.r2_var, command=self._on_r2_change, length=200)
        r2_slider.grid(row=0, column=1, padx=5, pady=5)
        self.r2_label = ttk.Label(secondary_frame, text="0.10 Ω")
        self.r2_label.grid(row=0, column=2, sticky=tk.W, pady=5)
        
        # Load resistance
        ttk.Label(secondary_frame, text="Load R (Ω):").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.load_var = tk.DoubleVar(value=10.0)
        load_slider = ttk.Scale(secondary_frame, from_=1.0, to=100.0, orient=tk.HORIZONTAL,
                               variable=self.load_var, command=self._on_load_change, length=200)
        load_slider.grid(row=1, column=1, padx=5, pady=5)
        self.load_label = ttk.Label(secondary_frame, text="10.0 Ω")
        self.load_label.grid(row=1, column=2, sticky=tk.W, pady=5)
        
        # Primary values display
        primary_values = ttk.LabelFrame(left_panel, text="Primary Side Values", padding=10)
        primary_values.pack(fill=tk.X, pady=(0, 10))
        
        self.v1_display = ttk.Label(primary_values, text="Voltage: 230.0 V")
        self.v1_display.grid(row=0, column=0, sticky=tk.W, padx=5, pady=2)
        
        self.i1_display = ttk.Label(primary_values, text="Current: 0.000 A")
        self.i1_display.grid(row=1, column=0, sticky=tk.W, padx=5, pady=2)
        
        self.s1_display = ttk.Label(primary_values, text="Apparent Power: 0.00 VA")
        self.s1_display.grid(row=2, column=0, sticky=tk.W, padx=5, pady=2)
        
        # Secondary values display
        secondary_values = ttk.LabelFrame(left_panel, text="Secondary Side Values", padding=10)
        secondary_values.pack(fill=tk.X, pady=(0, 10))
        
        self.v2_ideal_display = ttk.Label(secondary_values, text="Voltage (ideal): 23.0 V")
        self.v2_ideal_display.grid(row=0, column=0, sticky=tk.W, padx=5, pady=2)
        
        self.v2_actual_display = ttk.Label(secondary_values, text="Voltage (actual): 23.0 V")
        self.v2_actual_display.grid(row=1, column=0, sticky=tk.W, padx=5, pady=2)
        
        self.i2_display = ttk.Label(secondary_values, text="Current: 0.000 A")
        self.i2_display.grid(row=2, column=0, sticky=tk.W, padx=5, pady=2)
        
        self.s2_display = ttk.Label(secondary_values, text="Apparent Power: 0.00 VA")
        self.s2_display.grid(row=3, column=0, sticky=tk.W, padx=5, pady=2)
        
        # Performance
        performance_frame = ttk.LabelFrame(left_panel, text="Performance", padding=10)
        performance_frame.pack(fill=tk.X)
        
        self.pf_display = ttk.Label(performance_frame, text="Power Factor: 0.000")
        self.pf_display.grid(row=0, column=0, sticky=tk.W, padx=5, pady=2)
        
        self.eff_display = ttk.Label(performance_frame, text="Efficiency: 0.0%")
        self.eff_display.grid(row=1, column=0, sticky=tk.W, padx=5, pady=2)
        
        self.pload_display = ttk.Label(performance_frame, text="Power to Load: 0.00 W")
        self.pload_display.grid(row=2, column=0, sticky=tk.W, padx=5, pady=2)
        
        self.q_display = ttk.Label(performance_frame, text="Reactive Power: 0.00 VAR")
        self.q_display.grid(row=3, column=0, sticky=tk.W, padx=5, pady=2)
        
        # === RIGHT PANEL ===
        # Power diagram on top - compact
        power_frame = ttk.Frame(right_panel, height=280)
        power_frame.pack(fill=tk.BOTH, expand=False, pady=(0, 10))
        power_frame.pack_propagate(False)
        self.power_diagram = PowerDiagram(power_frame)
        
        # Waveform diagram in middle - compact
        waveform_frame = ttk.Frame(right_panel, height=250)
        waveform_frame.pack(fill=tk.BOTH, expand=False, pady=(0, 10))
        waveform_frame.pack_propagate(False)
        self.waveform_diagram = WaveformDiagram(waveform_frame)
        
        # Power calculation diagram on bottom - gets most space!
        power_calc_container = ttk.Frame(right_panel, height=750)
        power_calc_container.pack(fill=tk.BOTH, expand=False)
        power_calc_container.pack_propagate(False)
        
        # Add selector for Primary/Secondary at top of power calculation
        selector_frame = ttk.Frame(power_calc_container)
        selector_frame.pack(fill=tk.X, pady=(0, 5))
        
        ttk.Label(selector_frame, text="Show power calculation for:", font=("", 10, "bold")).pack(side=tk.LEFT, padx=5)
        
        self.power_side_var = tk.StringVar(value="primary")
        side_selector = ttk.Combobox(
            selector_frame,
            textvariable=self.power_side_var,
            values=["primary", "secondary"],
            state="readonly",
            width=12
        )
        side_selector.pack(side=tk.LEFT, padx=5)
        side_selector.bind("<<ComboboxSelected>>", self._on_power_side_change)
        
        # Power calculation diagram - let it use all the container space
        power_calc_frame = ttk.Frame(power_calc_container)
        power_calc_frame.pack(fill=tk.BOTH, expand=True)
        self.power_calc_diagram = PowerCalculationDiagram(power_calc_frame)
    
    def _on_v1_change(self, value):
        """Handle primary voltage change."""
        v = float(value)
        self.v1_label.config(text=f"{v:.1f} V")
        self.transformer.set_primary_voltage(v)
        self._update_display()
    
    def _on_freq_change(self):
        """Handle frequency change."""
        self.transformer.set_frequency(self.freq_var.get())
        self._update_display()
    
    def _on_r1_change(self, value):
        """Handle primary resistance change."""
        r = float(value)
        self.r1_label.config(text=f"{r:.2f} Ω")
        self.transformer.set_primary_resistance(r)
        self._update_display()
    
    def _on_turns_change(self, value):
        """Handle turns ratio change."""
        n = float(value)
        self.turns_label.config(text=f"{n:.1f}:1")
        self.transformer.set_turns_ratio(n)
        self._update_display()
    
    def _on_lm_change(self, value):
        """Handle magnetizing inductance change."""
        lm = float(value)
        self.lm_label.config(text=f"{lm:.2f} H")
        self.transformer.set_magnetizing_inductance(lm)
        self._update_display()
    
    def _on_r2_change(self, value):
        """Handle secondary resistance change."""
        r = float(value)
        self.r2_label.config(text=f"{r:.2f} Ω")
        self.transformer.set_secondary_resistance(r)
        self._update_display()
    
    def _on_load_change(self, value):
        """Handle load resistance change."""
        r = float(value)
        self.load_label.config(text=f"{r:.1f} Ω")
        self.transformer.set_load(r)
        self._update_display()
    
    def _update_display(self):
        """Update all display elements."""
        values = self.transformer.get_all_values()
        
        # Primary side
        self.v1_display.config(text=f"Voltage: {values['voltage_primary']:.1f} V")
        self.i1_display.config(text=f"Current: {values['current_primary']:.3f} A")
        self.s1_display.config(text=f"Apparent Power: {values['apparent_power_primary']:.2f} VA")
        
        # Secondary side
        self.v2_ideal_display.config(text=f"Voltage (ideal): {values['voltage_secondary_ideal']:.2f} V")
        self.v2_actual_display.config(text=f"Voltage (actual): {values['voltage_secondary_actual']:.2f} V")
        self.i2_display.config(text=f"Current: {values['current_secondary']:.3f} A")
        self.s2_display.config(text=f"Apparent Power: {values['apparent_power_secondary']:.2f} VA")
        
        # Performance
        self.pf_display.config(text=f"Power Factor: {values['power_factor']:.3f}")
        self.eff_display.config(text=f"Efficiency: {values['efficiency']*100:.1f}%")
        self.pload_display.config(text=f"Power to Load: {values['power_load']:.2f} W")
        self.q_display.config(text=f"Reactive Power: {values['reactive_power_magnetizing']:.2f} VAR")
        
        # Update power diagram - use PRIMARY side values to match power calculation
        # Calculate P and Q from primary side for consistency
        V1 = values['voltage_primary']
        I1 = values['current_primary']
        S1 = values['apparent_power_primary']
        pf = values['power_factor']
        
        # Calculate P and Q from S and power factor
        import math
        phi = math.acos(max(-1.0, min(1.0, pf)))  # Clip to avoid numerical errors
        P = S1 * pf  # Active power
        Q = S1 * math.sin(phi)  # Reactive power
        
        self.power_diagram.update(P, Q, S1, pf)
        
        # Update waveform diagram
        waveform_data = self.transformer.get_waveform_data(num_cycles=3)
        self.waveform_diagram.update(
            waveform_data['time'],
            waveform_data['v1'],
            waveform_data['i1'],
            waveform_data['v2'],
            waveform_data['i2']
        )
        
        # Update power calculation diagram
        self._update_power_calculation()
    
    def _on_power_side_change(self, event=None):
        """Handle power calculation side selection change."""
        self._update_power_calculation()
    
    def _update_power_calculation(self):
        """Update the power calculation diagram based on selected side."""
        side = self.power_side_var.get()
        side_name = side.capitalize()
        
        # Get power calculation data
        power_data = self.transformer.get_power_calculation_data(side=side, num_cycles=3)
        
        # Update diagram
        self.power_calc_diagram.update(
            power_data['time'],
            power_data['voltage'],
            power_data['current'],
            power_data['power_instantaneous'],
            power_data['power_active'],
            power_data['power_reactive'],
            power_data['power_apparent'],
            side_name
        )
