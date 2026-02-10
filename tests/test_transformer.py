"""Tests for the transformer circuit model."""

import pytest
import numpy as np
from src.models.transformer import TransformerCircuit


class TestTransformerCircuit:
    """Test suite for TransformerCircuit class."""

    def test_initialization(self):
        """Test circuit initialization with default parameters."""
        circuit = TransformerCircuit(
            voltage=230.0, frequency=50.0, inductance=0.5, resistance_primary=0.1
        )

        assert circuit.V == 230.0
        assert circuit.f == 50.0
        assert circuit.L == 0.5
        assert circuit.R_primary == 0.1
        assert circuit.R_load == 100.0

    def test_set_load(self):
        """Test setting load resistance."""
        circuit = TransformerCircuit(230.0, 50.0, 0.5, 0.1)
        circuit.set_load(200.0)
        assert circuit.R_load == 200.0

    def test_calculate_impedance(self):
        """Test impedance calculation."""
        circuit = TransformerCircuit(230.0, 50.0, 0.5, 0.1)
        circuit.set_load(100.0)

        Z_mag, phi = circuit.calculate_impedance()

        # Verify impedance magnitude is positive
        assert Z_mag > 0

        # Verify phase angle is between 0 and π/2 (inductive)
        assert 0 < phi < np.pi / 2

    def test_calculate_current(self):
        """Test current calculation."""
        circuit = TransformerCircuit(230.0, 50.0, 0.5, 0.1)
        current = circuit.calculate_current()

        # Current should be positive and less than voltage (given impedance > 1)
        assert current > 0
        assert current < 230.0

    def test_calculate_power(self):
        """Test power calculations."""
        circuit = TransformerCircuit(230.0, 50.0, 0.5, 0.1)
        P, Q, S, pf = circuit.calculate_power()

        # All power values should be positive
        assert P > 0
        assert Q > 0
        assert S > 0

        # Power factor should be between 0 and 1
        assert 0 < pf < 1

        # Power triangle relationship: S² = P² + Q²
        assert np.isclose(S**2, P**2 + Q**2, rtol=1e-5)

        # Power factor relationship: pf = P/S
        assert np.isclose(pf, P / S, rtol=1e-5)

    def test_power_with_different_loads(self):
        """Test that power changes appropriately with load."""
        circuit = TransformerCircuit(230.0, 50.0, 0.5, 0.1)

        # Low load (high resistance)
        circuit.set_load(500.0)
        P1, Q1, S1, pf1 = circuit.calculate_power()

        # High load (low resistance)
        circuit.set_load(50.0)
        P2, Q2, S2, pf2 = circuit.calculate_power()

        # Higher load should result in more active power
        assert P2 > P1

        # Higher load should result in higher apparent power
        assert S2 > S1
