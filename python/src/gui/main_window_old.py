"""Main application window for AC Reactive Power Demonstration."""

import tkinter as tk
from tkinter import ttk
from models.transformer import TransformerCircuit
from visualization.power_diagram import PowerDiagram


class MainWindow:
    """Main window for the AC reactive power demonstration."""

    def __init__(self, root):
        """Initialize the main window.

        Args:
            root: The tkinter root window
        """
        self.root = root
        self.root.title("AC Reactive Power Demonstration")
        self.root.geometry("1200x800")

        # Initialize the transformer model
        self.circuit = TransformerCircuit(
            voltage=230.0,  # V
            frequency=50.0,  # Hz
            inductance=0.5,  # H
            resistance_primary=0.1,  # Ω
        )

        self._create_widgets()
        self._update_display()

    def _create_widgets(self):
        """Create and layout all widgets."""
        # Main container with two columns
        main_container = ttk.Frame(self.root)
        main_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Left panel for controls
        left_panel = ttk.Frame(main_container)
        left_panel.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))

        # Right panel for visualization
        right_panel = ttk.Frame(main_container)
        right_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        # === LEFT PANEL: Circuit Parameters ===

        # Circuit parameters
        circuit_frame = ttk.LabelFrame(left_panel, text="Circuit Parameters", padding=10)
        circuit_frame.pack(fill=tk.X, pady=(0, 10))

        # Voltage control
        ttk.Label(circuit_frame, text="Voltage (V):").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.voltage_var = tk.DoubleVar(value=230.0)
        voltage_slider = ttk.Scale(
            circuit_frame,
            from_=100.0,
            to=400.0,
            orient=tk.HORIZONTAL,
            variable=self.voltage_var,
            command=self._on_voltage_change,
            length=200,
        )
        voltage_slider.grid(row=0, column=1, padx=5, pady=5)
        self.voltage_label = ttk.Label(circuit_frame, text="230.0 V")
        self.voltage_label.grid(row=0, column=2, sticky=tk.W, pady=5)

        # Frequency control (50Hz/60Hz selector)
        ttk.Label(circuit_frame, text="Frequency:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.frequency_var = tk.DoubleVar(value=50.0)
        freq_frame = ttk.Frame(circuit_frame)
        freq_frame.grid(row=1, column=1, columnspan=2, sticky=tk.W, pady=5)
        ttk.Radiobutton(
            freq_frame,
            text="50 Hz",
            variable=self.frequency_var,
            value=50.0,
            command=self._on_frequency_change,
        ).pack(side=tk.LEFT, padx=5)
        ttk.Radiobutton(
            freq_frame,
            text="60 Hz",
            variable=self.frequency_var,
            value=60.0,
            command=self._on_frequency_change,
        ).pack(side=tk.LEFT, padx=5)

        # Inductance control
        ttk.Label(circuit_frame, text="Inductance (H):").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.inductance_var = tk.DoubleVar(value=0.5)
        inductance_slider = ttk.Scale(
            circuit_frame,
            from_=0.1,
            to=2.0,
            orient=tk.HORIZONTAL,
            variable=self.inductance_var,
            command=self._on_inductance_change,
            length=200,
        )
        inductance_slider.grid(row=2, column=1, padx=5, pady=5)
        self.inductance_label = ttk.Label(circuit_frame, text="0.50 H")
        self.inductance_label.grid(row=2, column=2, sticky=tk.W, pady=5)

        # Primary resistance control
        ttk.Label(circuit_frame, text="Primary R (Ω):").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.r_primary_var = tk.DoubleVar(value=0.1)
        r_primary_slider = ttk.Scale(
            circuit_frame,
            from_=0.01,
            to=10.0,
            orient=tk.HORIZONTAL,
            variable=self.r_primary_var,
            command=self._on_r_primary_change,
            length=200,
        )
        r_primary_slider.grid(row=3, column=1, padx=5, pady=5)
        self.r_primary_label = ttk.Label(circuit_frame, text="0.10 Ω")
        self.r_primary_label.grid(row=3, column=2, sticky=tk.W, pady=5)

        # Load resistance control
        load_frame = ttk.LabelFrame(left_panel, text="Load Control", padding=10)
        load_frame.pack(fill=tk.X, pady=(0, 10))

        ttk.Label(load_frame, text="Load R (Ω):").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.load_var = tk.DoubleVar(value=100.0)
        load_slider = ttk.Scale(
            load_frame,
            from_=10.0,
            to=500.0,
            orient=tk.HORIZONTAL,
            variable=self.load_var,
            command=self._on_load_change,
            length=200,
        )
        load_slider.grid(row=0, column=1, padx=5, pady=5)
        self.load_label = ttk.Label(load_frame, text="100.0 Ω")
        self.load_label.grid(row=0, column=2, sticky=tk.W, pady=5)

        # === Calculated Values Display ===

        # Circuit values
        circuit_values_frame = ttk.LabelFrame(left_panel, text="Circuit Values", padding=10)
        circuit_values_frame.pack(fill=tk.X, pady=(0, 10))

        self.current_label = ttk.Label(circuit_values_frame, text="Current (I): 0.00 A")
        self.current_label.grid(row=0, column=0, sticky=tk.W, padx=5, pady=2)

        self.impedance_label = ttk.Label(circuit_values_frame, text="Impedance (Z): 0.00 Ω")
        self.impedance_label.grid(row=1, column=0, sticky=tk.W, padx=5, pady=2)

        self.phase_label = ttk.Label(circuit_values_frame, text="Phase angle (φ): 0.0°")
        self.phase_label.grid(row=2, column=0, sticky=tk.W, padx=5, pady=2)

        self.reactance_label = ttk.Label(circuit_values_frame, text="Reactance (X_L): 0.00 Ω")
        self.reactance_label.grid(row=3, column=0, sticky=tk.W, padx=5, pady=2)

        # Power values
        power_values_frame = ttk.LabelFrame(left_panel, text="Power Values", padding=10)
        power_values_frame.pack(fill=tk.X)

        self.active_power_label = ttk.Label(power_values_frame, text="Active Power (P): 0.00 W")
        self.active_power_label.grid(row=0, column=0, sticky=tk.W, padx=5, pady=2)

        self.reactive_power_label = ttk.Label(
            power_values_frame, text="Reactive Power (Q): 0.00 VAR"
        )
        self.reactive_power_label.grid(row=1, column=0, sticky=tk.W, padx=5, pady=2)

        self.apparent_power_label = ttk.Label(
            power_values_frame, text="Apparent Power (S): 0.00 VA"
        )
        self.apparent_power_label.grid(row=2, column=0, sticky=tk.W, padx=5, pady=2)

        self.power_factor_label = ttk.Label(power_values_frame, text="Power Factor (cos φ): 0.00")
        self.power_factor_label.grid(row=3, column=0, sticky=tk.W, padx=5, pady=2)

        # === RIGHT PANEL: Power Diagram ===
        self.power_diagram = PowerDiagram(right_panel)

    def _on_voltage_change(self, value):
        """Handle voltage slider change."""
        voltage = float(value)
        self.voltage_label.config(text=f"{voltage:.1f} V")
        self.circuit.set_voltage(voltage)
        self._update_display()

    def _on_frequency_change(self):
        """Handle frequency radio button change."""
        frequency = self.frequency_var.get()
        self.circuit.set_frequency(frequency)
        self._update_display()

    def _on_inductance_change(self, value):
        """Handle inductance slider change."""
        inductance = float(value)
        self.inductance_label.config(text=f"{inductance:.2f} H")
        self.circuit.set_inductance(inductance)
        self._update_display()

    def _on_r_primary_change(self, value):
        """Handle primary resistance slider change."""
        r_primary = float(value)
        self.r_primary_label.config(text=f"{r_primary:.2f} Ω")
        self.circuit.set_primary_resistance(r_primary)
        self._update_display()

    def _on_load_change(self, value):
        """Handle load slider change.

        Args:
            value: New load resistance value
        """
        load_resistance = float(value)
        self.load_label.config(text=f"{load_resistance:.1f} Ω")
        self.circuit.set_load(load_resistance)
        self._update_display()

    def _update_display(self):
        """Update all display elements with current values."""
        # Get all calculated values
        values = self.circuit.get_all_values()
        P = values["active_power"]
        Q = values["reactive_power"]
        S = values["apparent_power"]
        pf = values["power_factor"]
        I = values["current"]
        Z = values["impedance_magnitude"]
        phi_deg = values["phase_angle_deg"]
        X_L = values["inductive_reactance"]

        # Update circuit values
        self.current_label.config(text=f"Current (I): {I:.3f} A")
        self.impedance_label.config(text=f"Impedance (Z): {Z:.2f} Ω")
        self.phase_label.config(text=f"Phase angle (φ): {phi_deg:.1f}°")
        self.reactance_label.config(text=f"Reactance (X_L): {X_L:.2f} Ω")

        # Update power values
        self.active_power_label.config(text=f"Active Power (P): {P:.2f} W")
        self.reactive_power_label.config(text=f"Reactive Power (Q): {Q:.2f} VAR")
        self.apparent_power_label.config(text=f"Apparent Power (S): {S:.2f} VA")
        self.power_factor_label.config(text=f"Power Factor (cos φ): {pf:.3f}")

        # Update power diagram
        self.power_diagram.update(P, Q, S, pf)
