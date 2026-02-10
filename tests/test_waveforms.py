"""Tests for waveform generation functionality."""

import pytest
import numpy as np
from src.models.transformer import Transformer


class TestWaveformGeneration:
    """Test waveform data generation."""

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

    def test_waveform_data_structure(self):
        """Test that waveform data has correct structure."""
        data = self.transformer.get_waveform_data(num_cycles=3)

        # Check all keys are present
        assert "time" in data
        assert "v1" in data
        assert "i1" in data
        assert "v2" in data
        assert "i2" in data

        # Check all arrays have same length
        n_points = len(data["time"])
        assert len(data["v1"]) == n_points
        assert len(data["i1"]) == n_points
        assert len(data["v2"]) == n_points
        assert len(data["i2"]) == n_points

    def test_number_of_points(self):
        """Test correct number of data points."""
        data = self.transformer.get_waveform_data(num_cycles=3, points_per_cycle=333)
        expected_points = 3 * 333
        assert len(data["time"]) == expected_points

    def test_time_array(self):
        """Test time array properties."""
        data = self.transformer.get_waveform_data(num_cycles=3)
        time = data["time"]

        # Time starts at zero
        assert time[0] == pytest.approx(0.0, abs=1e-6)

        # Time ends at correct duration (3 cycles at 50 Hz = 0.06 s)
        expected_duration = 3 / 50.0
        assert time[-1] == pytest.approx(expected_duration, rel=1e-3)

        # Time is monotonically increasing
        assert np.all(np.diff(time) > 0)

    def test_voltage_amplitude_primary(self):
        """Test primary voltage amplitude matches RMS × √2."""
        data = self.transformer.get_waveform_data(num_cycles=3)
        values = self.transformer.get_all_values()

        V1_rms = values["voltage_primary"]
        V1_peak_expected = V1_rms * np.sqrt(2)
        V1_peak_actual = np.max(data["v1"])

        assert V1_peak_actual == pytest.approx(V1_peak_expected, rel=0.01)

    def test_current_amplitude_primary(self):
        """Test primary current amplitude matches RMS × √2."""
        data = self.transformer.get_waveform_data(num_cycles=3)
        values = self.transformer.get_all_values()

        I1_rms = values["current_primary"]
        I1_peak_expected = I1_rms * np.sqrt(2)
        I1_peak_actual = np.max(data["i1"])

        assert I1_peak_actual == pytest.approx(I1_peak_expected, rel=0.01)

    def test_voltage_amplitude_secondary(self):
        """Test secondary voltage amplitude matches RMS × √2."""
        data = self.transformer.get_waveform_data(num_cycles=3)
        values = self.transformer.get_all_values()

        V2_rms = values["voltage_secondary_actual"]
        V2_peak_expected = V2_rms * np.sqrt(2)
        V2_peak_actual = np.max(data["v2"])

        assert V2_peak_actual == pytest.approx(V2_peak_expected, rel=0.01)

    def test_current_amplitude_secondary(self):
        """Test secondary current amplitude matches RMS × √2."""
        data = self.transformer.get_waveform_data(num_cycles=3)
        values = self.transformer.get_all_values()

        I2_rms = values["current_secondary"]
        I2_peak_expected = I2_rms * np.sqrt(2)
        I2_peak_actual = np.max(data["i2"])

        assert I2_peak_actual == pytest.approx(I2_peak_expected, rel=0.01)

    def test_phase_relationship(self):
        """Test that current lags voltage (inductive load)."""
        data = self.transformer.get_waveform_data(num_cycles=3)

        # Find zero crossings with positive slope for voltage and current
        v1 = data["v1"]
        i1 = data["i1"]
        time = data["time"]

        # Find first positive zero crossing for V1
        v1_zero_idx = np.where((v1[:-1] <= 0) & (v1[1:] > 0))[0][0]

        # Find first positive zero crossing for I1
        i1_zero_idx = np.where((i1[:-1] <= 0) & (i1[1:] > 0))[0][0]

        # Current should cross zero after voltage (lag)
        assert i1_zero_idx > v1_zero_idx

        # Time lag should be positive
        time_lag = time[i1_zero_idx] - time[v1_zero_idx]
        assert time_lag > 0

    def test_frequency_50hz(self):
        """Test waveform frequency is correct for 50 Hz."""
        self.transformer.set_frequency(50.0)
        data = self.transformer.get_waveform_data(num_cycles=3)

        # Calculate frequency from zero crossings
        v1 = data["v1"]
        time = data["time"]

        # Find all positive zero crossings
        crossings = np.where((v1[:-1] <= 0) & (v1[1:] > 0))[0]

        # Period is time between consecutive crossings
        if len(crossings) >= 2:
            period = time[crossings[1]] - time[crossings[0]]
            frequency = 1.0 / period
            assert frequency == pytest.approx(50.0, rel=0.01)

    def test_frequency_60hz(self):
        """Test waveform frequency is correct for 60 Hz."""
        self.transformer.set_frequency(60.0)
        data = self.transformer.get_waveform_data(num_cycles=3)

        # Calculate frequency from zero crossings
        v1 = data["v1"]
        time = data["time"]

        # Find all positive zero crossings
        crossings = np.where((v1[:-1] <= 0) & (v1[1:] > 0))[0]

        # Period is time between consecutive crossings
        if len(crossings) >= 2:
            period = time[crossings[1]] - time[crossings[0]]
            frequency = 1.0 / period
            assert frequency == pytest.approx(60.0, rel=0.01)

    def test_waveform_with_different_loads(self):
        """Test waveforms update correctly with different loads."""
        # High load (low resistance)
        self.transformer.set_load(10.0)
        data_high_load = self.transformer.get_waveform_data(num_cycles=1)

        # Low load (high resistance)
        self.transformer.set_load(500.0)
        data_low_load = self.transformer.get_waveform_data(num_cycles=1)

        # High load should have higher current
        assert np.max(data_high_load["i2"]) > np.max(data_low_load["i2"])

    def test_step_down_transformer(self):
        """Test waveforms for step-down transformer."""
        self.transformer.set_turns_ratio(10.0)  # 10:1 step-down
        data = self.transformer.get_waveform_data(num_cycles=1)

        # Secondary voltage should be lower than primary
        assert np.max(data["v2"]) < np.max(data["v1"])

    def test_step_up_transformer(self):
        """Test waveforms for step-up transformer."""
        self.transformer.set_turns_ratio(0.5)  # 1:2 step-up
        data = self.transformer.get_waveform_data(num_cycles=1)

        # Secondary voltage should be higher than primary
        assert np.max(data["v2"]) > np.max(data["v1"])
