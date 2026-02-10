"""Tests for enhanced transformer circuit model features."""

import pytest
import numpy as np
from src.models.transformer import TransformerCircuit


class TestTransformerParameterValidation:
    """Test parameter validation in TransformerCircuit."""

    def test_invalid_voltage_initialization(self):
        """Test that invalid voltage raises ValueError."""
        with pytest.raises(ValueError, match="Voltage must be positive"):
            TransformerCircuit(voltage=0, frequency=50, inductance=0.5, resistance_primary=0.1)

        with pytest.raises(ValueError, match="Voltage must be positive"):
            TransformerCircuit(voltage=-230, frequency=50, inductance=0.5, resistance_primary=0.1)

    def test_invalid_frequency_initialization(self):
        """Test that invalid frequency raises ValueError."""
        with pytest.raises(ValueError, match="Frequency must be positive"):
            TransformerCircuit(voltage=230, frequency=0, inductance=0.5, resistance_primary=0.1)

        with pytest.raises(ValueError, match="Frequency must be positive"):
            TransformerCircuit(voltage=230, frequency=-50, inductance=0.5, resistance_primary=0.1)

    def test_invalid_inductance_initialization(self):
        """Test that invalid inductance raises ValueError."""
        with pytest.raises(ValueError, match="Inductance must be non-negative"):
            TransformerCircuit(voltage=230, frequency=50, inductance=-0.5, resistance_primary=0.1)

    def test_invalid_resistance_initialization(self):
        """Test that invalid primary resistance raises ValueError."""
        with pytest.raises(ValueError, match="Primary resistance must be non-negative"):
            TransformerCircuit(voltage=230, frequency=50, inductance=0.5, resistance_primary=-0.1)

    def test_set_invalid_voltage(self):
        """Test setting invalid voltage."""
        circuit = TransformerCircuit(230, 50, 0.5, 0.1)
        with pytest.raises(ValueError):
            circuit.set_voltage(-100)

    def test_set_invalid_load(self):
        """Test setting invalid load resistance."""
        circuit = TransformerCircuit(230, 50, 0.5, 0.1)
        with pytest.raises(ValueError):
            circuit.set_load(0)
        with pytest.raises(ValueError):
            circuit.set_load(-50)


class TestTransformerSetters:
    """Test parameter setter methods."""

    def test_set_voltage(self):
        """Test voltage setter."""
        circuit = TransformerCircuit(230, 50, 0.5, 0.1)
        circuit.set_voltage(400)
        assert circuit.V == 400

        # Verify power changes with voltage
        P1, _, S1, _ = circuit.calculate_power()
        circuit.set_voltage(200)
        P2, _, S2, _ = circuit.calculate_power()
        assert S2 < S1  # Lower voltage means lower apparent power

    def test_set_frequency(self):
        """Test frequency setter and omega update."""
        circuit = TransformerCircuit(230, 50, 0.5, 0.1)
        omega_50 = circuit.omega

        circuit.set_frequency(60)
        assert circuit.f == 60
        assert circuit.omega > omega_50  # Higher frequency means higher omega

        # Verify reactance changes
        values = circuit.get_all_values()
        X_L_60 = values["inductive_reactance"]

        circuit.set_frequency(50)
        values = circuit.get_all_values()
        X_L_50 = values["inductive_reactance"]

        assert X_L_60 > X_L_50  # Higher frequency means higher reactance

    def test_set_inductance(self):
        """Test inductance setter."""
        circuit = TransformerCircuit(230, 50, 0.5, 0.1)

        circuit.set_inductance(1.0)
        assert circuit.L == 1.0

        # Verify reactance doubles when inductance doubles
        values_1H = circuit.get_all_values()
        circuit.set_inductance(0.5)
        values_05H = circuit.get_all_values()

        assert np.isclose(values_1H["inductive_reactance"], 2 * values_05H["inductive_reactance"])

    def test_set_primary_resistance(self):
        """Test primary resistance setter."""
        circuit = TransformerCircuit(230, 50, 0.5, 0.1)
        circuit.set_primary_resistance(1.0)
        assert circuit.R_primary == 1.0


class TestGetAllValues:
    """Test get_all_values method."""

    def test_get_all_values_structure(self):
        """Test that get_all_values returns correct structure."""
        circuit = TransformerCircuit(230, 50, 0.5, 0.1)
        values = circuit.get_all_values()

        expected_keys = {
            "impedance_magnitude",
            "phase_angle_rad",
            "phase_angle_deg",
            "current",
            "active_power",
            "reactive_power",
            "apparent_power",
            "power_factor",
            "inductive_reactance",
            "total_resistance",
        }

        assert set(values.keys()) == expected_keys

    def test_get_all_values_types(self):
        """Test that all values are numeric."""
        circuit = TransformerCircuit(230, 50, 0.5, 0.1)
        values = circuit.get_all_values()

        for key, value in values.items():
            assert isinstance(
                value, (int, float, np.number)
            ), f"{key} should be numeric, got {type(value)}"

    def test_phase_angle_conversion(self):
        """Test that phase angle conversion is correct."""
        circuit = TransformerCircuit(230, 50, 0.5, 0.1)
        values = circuit.get_all_values()

        # Verify radian to degree conversion
        expected_deg = np.degrees(values["phase_angle_rad"])
        assert np.isclose(values["phase_angle_deg"], expected_deg)


class TestElectricalScenarios:
    """Test with realistic electrical scenarios."""

    def test_european_residential(self):
        """Test with European residential power (230V, 50Hz)."""
        circuit = TransformerCircuit(230, 50, 0.5, 0.1)
        circuit.set_load(100)

        values = circuit.get_all_values()

        # Current should be reasonable for residential
        assert 0.5 < values["current"] < 3.0

        # Power factor should be between 0 and 1
        assert 0 < values["power_factor"] < 1

        # Verify power triangle
        P, Q, S = values["active_power"], values["reactive_power"], values["apparent_power"]
        assert np.isclose(P**2 + Q**2, S**2, rtol=1e-5)

    def test_us_residential(self):
        """Test with US residential power (120V, 60Hz)."""
        circuit = TransformerCircuit(120, 60, 0.3, 0.05)
        circuit.set_load(50)

        values = circuit.get_all_values()

        # Verify calculations are consistent
        assert values["current"] > 0
        assert values["apparent_power"] > 0
        assert np.isclose(values["apparent_power"], 120 * values["current"], rtol=1e-5)

    def test_high_load_low_inductance(self):
        """Test with high load (low resistance) and low inductance."""
        circuit = TransformerCircuit(230, 50, 0.1, 0.1)
        circuit.set_load(10)  # Low resistance = high load

        values = circuit.get_all_values()

        # With low load resistance, total resistance is low
        # X_L = 2π * 50 * 0.1 = 31.4 Ω, R_total = 10.1 Ω
        # So reactance still dominates, power factor will be low
        # Let's verify the calculation is consistent
        assert values["power_factor"] > 0.2
        assert values["reactive_power"] > values["active_power"]

    def test_low_load_high_inductance(self):
        """Test with low load (high resistance) and high inductance."""
        circuit = TransformerCircuit(230, 50, 2.0, 0.1)
        circuit.set_load(500)  # High resistance = low load

        values = circuit.get_all_values()

        # With high inductance, reactive power should be significant
        assert values["reactive_power"] > values["active_power"] / 2

    def test_frequency_effect_on_power_factor(self):
        """Test that frequency affects power factor through reactance."""
        circuit = TransformerCircuit(230, 50, 0.5, 0.1)
        circuit.set_load(100)

        values_50Hz = circuit.get_all_values()

        circuit.set_frequency(60)
        values_60Hz = circuit.get_all_values()

        # Higher frequency increases reactance, decreases power factor
        assert values_60Hz["inductive_reactance"] > values_50Hz["inductive_reactance"]
        assert values_60Hz["power_factor"] < values_50Hz["power_factor"]


class TestGetParameters:
    """Test get_parameters method."""

    def test_get_parameters(self):
        """Test that get_parameters returns all circuit parameters."""
        circuit = TransformerCircuit(230, 50, 0.5, 0.1)
        circuit.set_load(150)

        params = circuit.get_parameters()

        assert params["voltage"] == 230
        assert params["frequency"] == 50
        assert params["inductance"] == 0.5
        assert params["resistance_primary"] == 0.1
        assert params["resistance_load"] == 150
