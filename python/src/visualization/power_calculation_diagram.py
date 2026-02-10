"""Power calculation diagram visualization using matplotlib."""

import tkinter as tk
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import numpy as np


class PowerCalculationDiagram:
    """Interactive power calculation visualization showing p(t) = v(t) × i(t)."""

    def __init__(self, parent):
        """Initialize the power calculation diagram.

        Args:
            parent: Parent tkinter widget
        """
        self.parent = parent

        # Create matplotlib figure with 2 subplots stacked vertically
        self.fig = Figure(figsize=(12, 5), dpi=100)
        self.ax_waveforms = self.fig.add_subplot(211)  # Top: v(t) and i(t)
        self.ax_power = self.fig.add_subplot(212)  # Bottom: p(t)

        # Create twin axis for current in waveform plot
        self.ax_current = self.ax_waveforms.twinx()

        # Create canvas
        self.canvas = FigureCanvasTkAgg(self.fig, master=parent)
        self.canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

        # Initialize with zero values
        time = np.linspace(0, 0.06, 1000)
        zeros = np.zeros_like(time)
        self.update(time, zeros, zeros, zeros, 0, 0, 0, "Primary")

    def update(self, time, voltage, current, power_inst, power_active, 
               power_reactive, power_apparent, side_name="Primary"):
        """Update the power calculation diagram with new data.

        Args:
            time: Time array in seconds
            voltage: Voltage waveform v(t)
            current: Current waveform i(t)
            power_inst: Instantaneous power p(t) = v(t) × i(t)
            power_active: Average power P (real power) in watts
            power_reactive: Reactive power Q in VAR
            power_apparent: Apparent power S in VA
            side_name: Name of side being displayed ("Primary" or "Secondary")
        """
        # Clear both subplots
        self.ax_waveforms.clear()
        self.ax_current.clear()
        self.ax_power.clear()

        # Convert time to milliseconds for display
        time_ms = time * 1000

        # === TOP SUBPLOT: Voltage and Current Waveforms ===
        # Plot voltage on left y-axis
        self.ax_waveforms.plot(
            time_ms,
            voltage,
            color="blue",
            linewidth=2,
            label="v(t) Voltage",
        )

        # Plot current on right y-axis
        self.ax_current.plot(
            time_ms,
            current,
            color="red",
            linewidth=2,
            label="i(t) Current",
            linestyle="--",
        )

        # Configure waveform subplot
        self.ax_waveforms.set_ylabel("Voltage (V)", fontsize=10, color="blue")
        self.ax_current.set_ylabel("Current (A)", fontsize=10, color="red")
        self.ax_waveforms.set_title(
            f"{side_name} Side: Voltage & Current Waveforms",
            fontsize=11,
            fontweight="bold",
        )
        self.ax_waveforms.grid(True, alpha=0.3)
        self.ax_waveforms.tick_params(axis="y", labelcolor="blue")
        self.ax_current.tick_params(axis="y", labelcolor="red")
        self.ax_waveforms.set_xticklabels([])  # Hide x-labels (shared with bottom)

        # Add legend
        lines1, labels1 = self.ax_waveforms.get_legend_handles_labels()
        lines2, labels2 = self.ax_current.get_legend_handles_labels()
        self.ax_waveforms.legend(
            lines1 + lines2, labels1 + labels2, loc="upper right", fontsize=9
        )

        # === BOTTOM SUBPLOT: Instantaneous Power p(t) ===
        # Plot instantaneous power
        self.ax_power.plot(
            time_ms,
            power_inst,
            color="purple",
            linewidth=2,
            label="p(t) = v(t) × i(t)",
        )

        # Draw average power line (P)
        self.ax_power.axhline(
            y=power_active,
            color="green",
            linewidth=2,
            linestyle="-",
            label=f"P (Active) = {power_active:.2f} W",
        )

        # Shade positive power areas (energy to load) in green
        self.ax_power.fill_between(
            time_ms,
            0,
            power_inst,
            where=(power_inst >= 0),
            color="green",
            alpha=0.2,
            label="Energy to load",
        )

        # Shade negative power areas (energy returned) in orange/red
        self.ax_power.fill_between(
            time_ms,
            0,
            power_inst,
            where=(power_inst < 0),
            color="orange",
            alpha=0.3,
            label="Energy returned",
        )

        # Add zero line
        self.ax_power.axhline(y=0, color="black", linewidth=0.5, linestyle="--", alpha=0.5)

        # Configure power subplot
        self.ax_power.set_xlabel("Time (ms)", fontsize=10)
        self.ax_power.set_ylabel("Power (W)", fontsize=10)
        self.ax_power.set_title(
            "Instantaneous Power: p(t) = v(t) × i(t)",
            fontsize=11,
            fontweight="bold",
        )
        self.ax_power.grid(True, alpha=0.3)
        self.ax_power.legend(loc="upper right", fontsize=9)

        # Add text annotation with power values
        annotation_text = (
            f"Active Power: P = {power_active:.2f} W\n"
            f"Reactive Power: Q = {power_reactive:.2f} VAR\n"
            f"Apparent Power: S = {power_apparent:.2f} VA\n"
            f"Average[p(t)] = P"
        )
        self.ax_power.text(
            0.02,
            0.98,
            annotation_text,
            transform=self.ax_power.transAxes,
            fontsize=9,
            verticalalignment="top",
            bbox=dict(boxstyle="round", facecolor="wheat", alpha=0.8),
        )

        # Adjust layout to prevent overlap
        self.fig.tight_layout()

        # Redraw canvas
        self.canvas.draw()
