"""Tests for power calculation functionality."""

import pytest
import numpy as np
from src.models.transformer import Transformer


class TestPowerCalculation:
    """Test power calculation methods."""

    def setup_method(self):
        """Set up test transformer."""
        self.transformer = Transformer(
            voltage_primary=230.0,
            frequency=50.0,
            turns_ratio=10.0,
            inductance_mag=5.0,
            resistance_primary=1.0,
            resistance_secondary=0.1,
        )
        self.transformer.set_load(100.0)

    def test_power_calculation_data_structure(self):
        """Test that power calculation data has correct structure."""
        data = self.transformer.get_power_calculation_data(side='primary')

        # Check all keys are present
        assert "time" in data
        assert "voltage" in data
        assert "current" in data
        assert "power_instantaneous" in data
        assert "power_active" in data
        assert "power_reactive" in data
        assert "power_apparent" in data
        assert "power_factor" in data
        assert "phase_angle" in data

        # Check arrays have correct length
        n_points = len(data["time"])
        assert len(data["voltage"]) == n_points
        assert len(data["current"]) == n_points
        assert len(data["power_instantaneous"]) == n_points

    def test_instantaneous_power_calculation(self):
        """Test that p(t) = v(t) × i(t) pointwise."""
        data = self.transformer.get_power_calculation_data(side='primary')

        # Calculate p(t) manually
        p_calc = data['voltage'] * data['current']

        # Should match the returned instantaneous power
        assert np.allclose(p_calc, data['power_instantaneous'])

    def test_average_power_equals_p(self):
        """Test that average of p(t) equals active power P."""
        data = self.transformer.get_power_calculation_data(side='primary')

        # Average of instantaneous power
        p_avg = np.mean(data['power_instantaneous'])

        # Should equal reported active power
        assert p_avg == pytest.approx(data['power_active'], rel=0.01)

    def test_power_calculation_primary_side(self):
        """Test power calculation for primary side."""
        data = self.transformer.get_power_calculation_data(side='primary')

        # Should return primary voltage and current
        values = self.transformer.get_all_values()
        V_rms = np.sqrt(np.mean(data['voltage']**2))
        I_rms = np.sqrt(np.mean(data['current']**2))

        assert V_rms == pytest.approx(values['voltage_primary'], rel=0.01)
        assert I_rms == pytest.approx(values['current_primary'], rel=0.01)

    def test_power_calculation_secondary_side(self):
        """Test power calculation for secondary side."""
        data = self.transformer.get_power_calculation_data(side='secondary')

        # Should return secondary voltage and current
        values = self.transformer.get_all_values()
        V_rms = np.sqrt(np.mean(data['voltage']**2))
        I_rms = np.sqrt(np.mean(data['current']**2))

        assert V_rms == pytest.approx(values['voltage_secondary_actual'], rel=0.01)
        assert I_rms == pytest.approx(values['current_secondary'], rel=0.01)

    def test_invalid_side_raises_error(self):
        """Test that invalid side parameter raises ValueError."""
        with pytest.raises(ValueError, match="Invalid side"):
            self.transformer.get_power_calculation_data(side='invalid')

    def test_resistive_load_no_negative_power(self):
        """Test that resistive load has no negative power (φ ≈ 0)."""
        # Set very low inductance to approximate resistive
        self.transformer = Transformer(
            voltage_primary=230.0,
            frequency=50.0,
            turns_ratio=10.0,
            inductance_mag=0.001,  # Very small
            resistance_primary=1.0,
            resistance_secondary=0.1,
        )
        self.transformer.set_load(100.0)

        data = self.transformer.get_power_calculation_data(side='secondary')

        # For mostly resistive load, power should be mostly positive
        # Allow small negative values due to small remaining inductance
        negative_fraction = np.sum(data['power_instantaneous'] < 0) / len(data['power_instantaneous'])
        assert negative_fraction < 0.1  # Less than 10% negative

    def test_inductive_load_has_negative_power(self):
        """Test that inductive load has negative power excursions."""
        # Use significant inductance
        self.transformer.set_load(500.0)  # High load resistance = lower power factor

        data = self.transformer.get_power_calculation_data(side='primary')

        # Should have some negative power (energy returned from inductor)
        min_power = np.min(data['power_instantaneous'])
        assert min_power < 0  # Some negative power

    def test_power_oscillates_at_2f(self):
        """Test that instantaneous power oscillates at 2× line frequency."""
        data = self.transformer.get_power_calculation_data(side='primary', num_cycles=3)

        # Find zero crossings of (p(t) - P)
        p_oscillating = data['power_instantaneous'] - data['power_active']
        
        # Find positive zero crossings
        crossings = np.where((p_oscillating[:-1] <= 0) & (p_oscillating[1:] > 0))[0]

        if len(crossings) >= 2:
            # Period of oscillation
            period = data['time'][crossings[1]] - data['time'][crossings[0]]
            freq_oscillation = 1.0 / period

            # Should be approximately 2× line frequency
            expected_freq = 2 * self.transformer.f
            assert freq_oscillation == pytest.approx(expected_freq, rel=0.05)

    def test_phase_angle_calculation(self):
        """Test that phase angle is calculated correctly from power factor."""
        data = self.transformer.get_power_calculation_data(side='primary')

        pf = data['power_factor']
        phi = data['phase_angle']

        # φ = arccos(pf)
        expected_phi = np.arccos(np.clip(pf, -1.0, 1.0))
        assert phi == pytest.approx(expected_phi, abs=1e-6)

    def test_power_triangle_relationship(self):
        """Test that P² + Q² = S² (power triangle)."""
        data = self.transformer.get_power_calculation_data(side='primary')

        P = data['power_active']
        Q = data['power_reactive']
        S = data['power_apparent']

        # Power triangle: S² = P² + Q²
        assert S**2 == pytest.approx(P**2 + Q**2, rel=0.01)

    def test_different_num_cycles(self):
        """Test power calculation with different number of cycles."""
        data_1 = self.transformer.get_power_calculation_data(side='primary', num_cycles=1)
        data_3 = self.transformer.get_power_calculation_data(side='primary', num_cycles=3)

        # Different lengths
        assert len(data_1['time']) < len(data_3['time'])

        # But same power values
        assert data_1['power_active'] == pytest.approx(data_3['power_active'], rel=0.01)
        assert data_1['power_reactive'] == pytest.approx(data_3['power_reactive'], rel=0.01)

    def test_rms_voltage_from_waveform(self):
        """Test that RMS voltage can be calculated from waveform."""
        data = self.transformer.get_power_calculation_data(side='primary')

        # Calculate RMS from waveform
        V_rms_calc = np.sqrt(np.mean(data['voltage']**2))

        # Get expected RMS value
        values = self.transformer.get_all_values()
        V_rms_expected = values['voltage_primary']

        assert V_rms_calc == pytest.approx(V_rms_expected, rel=0.01)

    def test_rms_current_from_waveform(self):
        """Test that RMS current can be calculated from waveform."""
        data = self.transformer.get_power_calculation_data(side='secondary')

        # Calculate RMS from waveform
        I_rms_calc = np.sqrt(np.mean(data['current']**2))

        # Get expected RMS value
        values = self.transformer.get_all_values()
        I_rms_expected = values['current_secondary']

        assert I_rms_calc == pytest.approx(I_rms_expected, rel=0.01)
