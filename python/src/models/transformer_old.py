"""Transformer circuit model for AC power analysis.

This module implements a series RL circuit model representing a transformer
with inductive reactance and resistive components.

Circuit model:
    - Total resistance: R = R_primary + R_load
    - Inductive reactance: X_L = ωL = 2πfL
    - Impedance: Z = √(R² + X_L²) ∠ φ where φ = arctan(X_L/R)
    - Current: I = V/Z
    - Active power: P = I²R = VI cos(φ)
    - Reactive power: Q = I²X_L = VI sin(φ)
    - Apparent power: S = VI
    - Power factor: pf = cos(φ) = P/S
"""

import numpy as np


class TransformerCircuit:
    """Model of a simple inductive AC circuit (transformer with resistive load)."""

    def __init__(self, voltage, frequency, inductance, resistance_primary):
        """Initialize the transformer circuit.

        Args:
            voltage: RMS voltage in volts (must be > 0)
            frequency: Frequency in Hz (must be > 0)
            inductance: Inductance in henries (must be >= 0)
            resistance_primary: Primary winding resistance in ohms (must be >= 0)

        Raises:
            ValueError: If any parameter is invalid
        """
        if voltage <= 0:
            raise ValueError(f"Voltage must be positive, got {voltage}")
        if frequency <= 0:
            raise ValueError(f"Frequency must be positive, got {frequency}")
        if inductance < 0:
            raise ValueError(f"Inductance must be non-negative, got {inductance}")
        if resistance_primary < 0:
            raise ValueError(f"Primary resistance must be non-negative, got {resistance_primary}")

        self.V = voltage
        self.f = frequency
        self.L = inductance
        self.R_primary = resistance_primary
        self.R_load = 100.0  # Default load resistance

        # Calculate angular frequency
        self._update_omega()

    def _update_omega(self):
        """Update angular frequency from current frequency."""
        self.omega = 2 * np.pi * self.f

    def set_voltage(self, voltage):
        """Set the supply voltage.

        Args:
            voltage: RMS voltage in volts (must be > 0)

        Raises:
            ValueError: If voltage is invalid
        """
        if voltage <= 0:
            raise ValueError(f"Voltage must be positive, got {voltage}")
        self.V = voltage

    def set_frequency(self, frequency):
        """Set the supply frequency.

        Args:
            frequency: Frequency in Hz (must be > 0)

        Raises:
            ValueError: If frequency is invalid
        """
        if frequency <= 0:
            raise ValueError(f"Frequency must be positive, got {frequency}")
        self.f = frequency
        self._update_omega()

    def set_inductance(self, inductance):
        """Set the inductance.

        Args:
            inductance: Inductance in henries (must be >= 0)

        Raises:
            ValueError: If inductance is invalid
        """
        if inductance < 0:
            raise ValueError(f"Inductance must be non-negative, got {inductance}")
        self.L = inductance

    def set_primary_resistance(self, resistance):
        """Set the primary winding resistance.

        Args:
            resistance: Primary resistance in ohms (must be >= 0)

        Raises:
            ValueError: If resistance is invalid
        """
        if resistance < 0:
            raise ValueError(f"Primary resistance must be non-negative, got {resistance}")
        self.R_primary = resistance

    def set_load(self, resistance):
        """Set the load resistance.

        Args:
            resistance: Load resistance in ohms (must be > 0)

        Raises:
            ValueError: If resistance is invalid
        """
        if resistance <= 0:
            raise ValueError(f"Load resistance must be positive, got {resistance}")
        self.R_load = resistance

    def get_parameters(self):
        """Get all circuit parameters.

        Returns:
            dict: Dictionary with keys: 'voltage', 'frequency', 'inductance',
                  'resistance_primary', 'resistance_load'
        """
        return {
            "voltage": self.V,
            "frequency": self.f,
            "inductance": self.L,
            "resistance_primary": self.R_primary,
            "resistance_load": self.R_load,
        }

    def calculate_impedance(self):
        """Calculate total impedance of the circuit.

        Returns:
            tuple: (Z_magnitude, phase_angle) where Z_magnitude is in ohms
                   and phase_angle is in radians
        """
        # Inductive reactance
        X_L = self.omega * self.L

        # Total resistance
        R_total = self.R_primary + self.R_load

        # Impedance magnitude
        Z_mag = np.sqrt(R_total**2 + X_L**2)

        # Phase angle
        phi = np.arctan2(X_L, R_total)

        return Z_mag, phi

    def calculate_current(self):
        """Calculate RMS current in the circuit.

        Returns:
            float: RMS current in amperes
        """
        Z_mag, _ = self.calculate_impedance()
        return self.V / Z_mag

    def calculate_power(self):
        """Calculate power values in the circuit.

        Returns:
            tuple: (P, Q, S, pf) where:
                P: Active power in watts
                Q: Reactive power in VAR
                S: Apparent power in VA
                pf: Power factor (dimensionless)
        """
        I = self.calculate_current()
        Z_mag, phi = self.calculate_impedance()

        # Apparent power
        S = self.V * I

        # Active power (consumed in resistances)
        P = S * np.cos(phi)

        # Reactive power (stored in inductance)
        Q = S * np.sin(phi)

        # Power factor
        pf = np.cos(phi)

        return P, Q, S, pf

    def get_all_values(self):
        """Get all calculated circuit values.

        Returns:
            dict: Dictionary containing:
                - impedance_magnitude: Impedance magnitude in ohms
                - phase_angle_rad: Phase angle in radians
                - phase_angle_deg: Phase angle in degrees
                - current: RMS current in amperes
                - active_power: Active power in watts
                - reactive_power: Reactive power in VAR
                - apparent_power: Apparent power in VA
                - power_factor: Power factor (dimensionless)
                - inductive_reactance: Inductive reactance in ohms
                - total_resistance: Total resistance in ohms
        """
        Z_mag, phi = self.calculate_impedance()
        I = self.calculate_current()
        P, Q, S, pf = self.calculate_power()

        X_L = self.omega * self.L
        R_total = self.R_primary + self.R_load

        return {
            "impedance_magnitude": Z_mag,
            "phase_angle_rad": phi,
            "phase_angle_deg": np.degrees(phi),
            "current": I,
            "active_power": P,
            "reactive_power": Q,
            "apparent_power": S,
            "power_factor": pf,
            "inductive_reactance": X_L,
            "total_resistance": R_total,
        }
