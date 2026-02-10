"""Proper transformer circuit model with primary and secondary windings.

This model represents a real transformer with:
- Primary winding (input side)
- Secondary winding (output side)
- Turns ratio for voltage transformation
- Magnetizing inductance
- Leakage inductances
- Winding resistances
"""

import numpy as np


class Transformer:
    """Real transformer model with primary/secondary windings and voltage transformation."""
    
    def __init__(self, voltage_primary, frequency, turns_ratio, 
                 inductance_mag, resistance_primary, resistance_secondary):
        """Initialize the transformer.
        
        Args:
            voltage_primary: Primary RMS voltage in volts
            frequency: Frequency in Hz
            turns_ratio: N1/N2 (primary turns / secondary turns)
            inductance_mag: Magnetizing inductance in henries
            resistance_primary: Primary winding resistance in ohms
            resistance_secondary: Secondary winding resistance in ohms
        """
        if voltage_primary <= 0:
            raise ValueError(f"Primary voltage must be positive, got {voltage_primary}")
        if frequency <= 0:
            raise ValueError(f"Frequency must be positive, got {frequency}")
        if turns_ratio <= 0:
            raise ValueError(f"Turns ratio must be positive, got {turns_ratio}")
        if inductance_mag < 0:
            raise ValueError(f"Magnetizing inductance must be non-negative, got {inductance_mag}")
        if resistance_primary < 0:
            raise ValueError(f"Primary resistance must be non-negative, got {resistance_primary}")
        if resistance_secondary < 0:
            raise ValueError(f"Secondary resistance must be non-negative, got {resistance_secondary}")
        
        self.V1 = voltage_primary
        self.f = frequency
        self.n = turns_ratio  # N1/N2
        self.L_mag = inductance_mag
        self.R1 = resistance_primary
        self.R2 = resistance_secondary
        self.R_load = 100.0  # Default load on secondary
        
        self._update_omega()
    
    def _update_omega(self):
        """Update angular frequency."""
        self.omega = 2 * np.pi * self.f
    
    def set_primary_voltage(self, voltage):
        """Set primary voltage."""
        if voltage <= 0:
            raise ValueError(f"Primary voltage must be positive, got {voltage}")
        self.V1 = voltage
    
    def set_frequency(self, frequency):
        """Set frequency."""
        if frequency <= 0:
            raise ValueError(f"Frequency must be positive, got {frequency}")
        self.f = frequency
        self._update_omega()
    
    def set_turns_ratio(self, ratio):
        """Set turns ratio (N1/N2)."""
        if ratio <= 0:
            raise ValueError(f"Turns ratio must be positive, got {ratio}")
        self.n = ratio
    
    def set_magnetizing_inductance(self, inductance):
        """Set magnetizing inductance."""
        if inductance < 0:
            raise ValueError(f"Magnetizing inductance must be non-negative, got {inductance}")
        self.L_mag = inductance
    
    def set_primary_resistance(self, resistance):
        """Set primary winding resistance."""
        if resistance < 0:
            raise ValueError(f"Primary resistance must be non-negative, got {resistance}")
        self.R1 = resistance
    
    def set_secondary_resistance(self, resistance):
        """Set secondary winding resistance."""
        if resistance < 0:
            raise ValueError(f"Secondary resistance must be non-negative, got {resistance}")
        self.R2 = resistance
    
    def set_load(self, resistance):
        """Set load resistance on secondary."""
        if resistance <= 0:
            raise ValueError(f"Load resistance must be positive, got {resistance}")
        self.R_load = resistance
    
    def calculate_secondary_voltage_ideal(self):
        """Calculate ideal secondary voltage (no-load).
        
        Returns:
            float: Secondary voltage assuming ideal transformer
        """
        return self.V1 / self.n
    
    def calculate_magnetizing_current(self):
        """Calculate magnetizing current in primary.
        
        Returns:
            float: Magnetizing current in amperes
        """
        X_mag = self.omega * self.L_mag
        if X_mag == 0:
            return 0
        return self.V1 / X_mag
    
    def calculate_secondary_current(self):
        """Calculate secondary current.
        
        Returns:
            float: Secondary current in amperes
        """
        # Secondary voltage (ideal transformation minus secondary resistance drop)
        V2_ideal = self.V1 / self.n
        
        # Total secondary resistance
        R_sec_total = self.R2 + self.R_load
        
        # Secondary current (simplified - ignoring reflected impedance for now)
        I2 = V2_ideal / R_sec_total
        
        return I2
    
    def calculate_primary_current(self):
        """Calculate primary current.
        
        Returns:
            float: Primary current in amperes
        """
        # Secondary current
        I2 = self.calculate_secondary_current()
        
        # Reflected current from secondary (transformed)
        I_reflected = I2 / self.n
        
        # Magnetizing current
        I_mag = self.calculate_magnetizing_current()
        
        # Total primary current (vectorial sum - simplified as scalar for now)
        # In reality these add as phasors, but for educational purposes:
        I1 = np.sqrt(I_reflected**2 + I_mag**2)
        
        return I1
    
    def calculate_actual_secondary_voltage(self):
        """Calculate actual secondary voltage under load.
        
        Returns:
            float: Actual secondary voltage in volts
        """
        V2_ideal = self.V1 / self.n
        I2 = self.calculate_secondary_current()
        
        # Voltage drop in secondary winding
        V_drop_sec = I2 * self.R2
        
        # Actual voltage at load
        V2_actual = V2_ideal - V_drop_sec
        
        return V2_actual
    
    def get_all_values(self):
        """Calculate all transformer values.
        
        Returns:
            dict: Dictionary with all calculated values
        """
        # Voltages
        V1 = self.V1
        V2_ideal = self.calculate_secondary_voltage_ideal()
        V2_actual = self.calculate_actual_secondary_voltage()
        V_load = self.calculate_secondary_current() * self.R_load
        
        # Currents
        I1 = self.calculate_primary_current()
        I2 = self.calculate_secondary_current()
        I_mag = self.calculate_magnetizing_current()
        
        # Magnetizing reactance
        X_mag = self.omega * self.L_mag
        
        # Powers - Primary side
        S1 = V1 * I1  # Apparent power input
        
        # Powers - Secondary side (at load)
        P_load = I2**2 * self.R_load  # Active power to load
        P_loss_primary = I1**2 * self.R1  # Copper losses in primary
        P_loss_secondary = I2**2 * self.R2  # Copper losses in secondary
        
        # Reactive power (magnetizing)
        Q_mag = I_mag**2 * X_mag if X_mag > 0 else 0
        
        # Total apparent power on secondary
        S2 = V2_actual * I2
        
        # Power factor
        P_total = P_load + P_loss_primary + P_loss_secondary
        pf = P_total / S1 if S1 > 0 else 0
        
        # Efficiency
        efficiency = P_load / S1 if S1 > 0 else 0
        
        return {
            # Primary side
            'voltage_primary': V1,
            'current_primary': I1,
            'apparent_power_primary': S1,
            
            # Secondary side
            'voltage_secondary_ideal': V2_ideal,
            'voltage_secondary_actual': V2_actual,
            'voltage_load': V_load,
            'current_secondary': I2,
            'apparent_power_secondary': S2,
            
            # Magnetizing
            'current_magnetizing': I_mag,
            'reactance_magnetizing': X_mag,
            'reactive_power_magnetizing': Q_mag,
            
            # Power distribution
            'power_load': P_load,
            'power_loss_primary': P_loss_primary,
            'power_loss_secondary': P_loss_secondary,
            'power_total_input': P_total,
            
            # Performance
            'power_factor': pf,
            'efficiency': efficiency,
            'turns_ratio': self.n,
        }
    
    def get_parameters(self):
        """Get all transformer parameters.
        
        Returns:
            dict: Dictionary with all parameters
        """
        return {
            'voltage_primary': self.V1,
            'frequency': self.f,
            'turns_ratio': self.n,
            'inductance_magnetizing': self.L_mag,
            'resistance_primary': self.R1,
            'resistance_secondary': self.R2,
            'resistance_load': self.R_load,
        }
    
    def get_waveform_data(self, num_cycles=3, points_per_cycle=333):
        """Generate time-domain waveform data for voltage and current.
        
        Args:
            num_cycles: Number of AC cycles to generate (default: 3)
            points_per_cycle: Number of data points per cycle (default: 333, ~1000 total)
        
        Returns:
            dict: Dictionary containing:
                - 'time': Time array in seconds
                - 'v1': Primary voltage waveform (instantaneous values)
                - 'i1': Primary current waveform (instantaneous values)
                - 'v2': Secondary voltage waveform (instantaneous values)
                - 'i2': Secondary current waveform (instantaneous values)
        """
        # Get RMS values from existing calculations
        values = self.get_all_values()
        V1_rms = values['voltage_primary']
        I1_rms = values['current_primary']
        V2_rms = values['voltage_secondary_actual']
        I2_rms = values['current_secondary']
        pf = values['power_factor']
        
        # Calculate phase angle from power factor
        # For inductive load, current lags voltage
        # φ = arccos(pf), where pf = cos(φ)
        phi = np.arccos(np.clip(pf, -1.0, 1.0))  # Clip to avoid numerical errors
        
        # Generate time array
        period = 1.0 / self.f  # Period of one cycle
        t_end = num_cycles * period
        num_points = num_cycles * points_per_cycle
        time = np.linspace(0, t_end, num_points)
        
        # Angular frequency
        omega = 2 * np.pi * self.f
        
        # Generate waveforms (peak values = RMS × √2)
        # Primary voltage is the reference (0° phase)
        v1 = V1_rms * np.sqrt(2) * np.sin(omega * time)
        
        # Primary current lags voltage by phase angle φ
        i1 = I1_rms * np.sqrt(2) * np.sin(omega * time - phi)
        
        # Secondary voltage is in phase with primary (ideal transformer)
        # Uses actual secondary voltage (includes resistive drop)
        v2 = V2_rms * np.sqrt(2) * np.sin(omega * time)
        
        # Secondary current lags secondary voltage by same phase angle
        # (assuming load is resistive - same power factor on both sides)
        i2 = I2_rms * np.sqrt(2) * np.sin(omega * time - phi)
        
        return {
            'time': time,
            'v1': v1,
            'i1': i1,
            'v2': v2,
            'i2': i2,
        }
    
    def get_power_calculation_data(self, side='primary', num_cycles=3, points_per_cycle=333):
        """Generate power calculation data showing p(t) = v(t) × i(t).
        
        This method calculates instantaneous power and shows how integration
        produces real power P and reactive power Q.
        
        Args:
            side: Which side to calculate ('primary' or 'secondary')
            num_cycles: Number of AC cycles to generate (default: 3)
            points_per_cycle: Number of data points per cycle (default: 333)
        
        Returns:
            dict: Dictionary containing:
                - 'time': Time array in seconds
                - 'voltage': Voltage waveform v(t)
                - 'current': Current waveform i(t)
                - 'power_instantaneous': Instantaneous power p(t) = v(t) × i(t)
                - 'power_active': Average power P (real power)
                - 'power_reactive': Reactive power Q
                - 'power_apparent': Apparent power S
                - 'power_factor': Power factor cos(φ)
                - 'phase_angle': Phase angle φ in radians
        """
        # Get waveform data
        waveform_data = self.get_waveform_data(num_cycles, points_per_cycle)
        time = waveform_data['time']
        
        # Select voltage and current based on side
        if side.lower() == 'primary':
            voltage = waveform_data['v1']
            current = waveform_data['i1']
        elif side.lower() == 'secondary':
            voltage = waveform_data['v2']
            current = waveform_data['i2']
        else:
            raise ValueError(f"Invalid side '{side}'. Must be 'primary' or 'secondary'")
        
        # Calculate instantaneous power: p(t) = v(t) × i(t)
        power_instantaneous = voltage * current
        
        # Get RMS values and power metrics from transformer calculations
        values = self.get_all_values()
        pf = values['power_factor']
        
        if side.lower() == 'primary':
            V_rms = values['voltage_primary']
            I_rms = values['current_primary']
            S = values['apparent_power_primary']
        else:  # secondary
            V_rms = values['voltage_secondary_actual']
            I_rms = values['current_secondary']
            S = values['apparent_power_secondary']
        
        # Calculate powers
        # Active power (average of instantaneous power)
        P = np.mean(power_instantaneous)
        
        # From power triangle: P = S × cos(φ), Q = S × sin(φ)
        phi = np.arccos(np.clip(pf, -1.0, 1.0))
        Q = S * np.sin(phi)
        
        return {
            'time': time,
            'voltage': voltage,
            'current': current,
            'power_instantaneous': power_instantaneous,
            'power_active': P,
            'power_reactive': Q,
            'power_apparent': S,
            'power_factor': pf,
            'phase_angle': phi,
        }
