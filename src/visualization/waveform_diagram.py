"""Waveform diagram visualization using matplotlib."""

import tkinter as tk
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import numpy as np


class WaveformDiagram:
    """Interactive voltage and current waveform display."""

    def __init__(self, parent):
        """Initialize the waveform diagram.

        Args:
            parent: Parent tkinter widget
        """
        self.parent = parent

        # Create matplotlib figure with 2 subplots side-by-side
        self.fig = Figure(figsize=(12, 4), dpi=100)
        self.ax1 = self.fig.add_subplot(121)  # Left: Primary
        self.ax2 = self.fig.add_subplot(122)  # Right: Secondary
        
        # Create twin axes for current (reuse them on each update)
        self.ax1_twin = self.ax1.twinx()
        self.ax2_twin = self.ax2.twinx()

        # Create canvas
        self.canvas = FigureCanvasTkAgg(self.fig, master=parent)
        self.canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

        # Initialize with zero values
        time = np.linspace(0, 0.06, 1000)
        zeros = np.zeros_like(time)
        self.update(time, zeros, zeros, zeros, zeros)

    def update(self, time, v1, i1, v2, i2):
        """Update the waveform diagram with new data.

        Args:
            time: Time array in seconds
            v1: Primary voltage waveform (instantaneous values)
            i1: Primary current waveform (instantaneous values)
            v2: Secondary voltage waveform (instantaneous values)
            i2: Secondary current waveform (instantaneous values)
        """
        # Clear both main axes and their twins
        self.ax1.clear()
        self.ax2.clear()
        self.ax1_twin.clear()
        self.ax2_twin.clear()

        # === PRIMARY SIDE (Left subplot) ===
        # Plot primary voltage on left y-axis
        self.ax1.plot(
            time * 1000,  # Convert to milliseconds
            v1,
            color="blue",
            linewidth=2,
            label="V₁ (Primary Voltage)",
        )

        # Plot primary current on right y-axis
        self.ax1_twin.plot(
            time * 1000,  # Convert to milliseconds
            i1,
            color="red",
            linewidth=2,
            label="I₁ (Primary Current)",
            linestyle="--",
        )

        # Configure left subplot
        self.ax1.set_xlabel("Time (ms)", fontsize=10)
        self.ax1.set_ylabel("Voltage (V)", fontsize=10, color="blue")
        self.ax1_twin.set_ylabel("Current (A)", fontsize=10, color="red")
        self.ax1.set_title("Primary Side Waveforms", fontsize=11, fontweight="bold")
        self.ax1.grid(True, alpha=0.3)
        self.ax1.tick_params(axis="y", labelcolor="blue")
        self.ax1_twin.tick_params(axis="y", labelcolor="red")

        # Add legend
        lines1, labels1 = self.ax1.get_legend_handles_labels()
        lines2, labels2 = self.ax1_twin.get_legend_handles_labels()
        self.ax1.legend(lines1 + lines2, labels1 + labels2, loc="upper right", fontsize=9)

        # === SECONDARY SIDE (Right subplot) ===
        # Plot secondary voltage on left y-axis
        self.ax2.plot(
            time * 1000,  # Convert to milliseconds
            v2,
            color="blue",
            linewidth=2,
            label="V₂ (Secondary Voltage)",
        )

        # Plot secondary current on right y-axis
        self.ax2_twin.plot(
            time * 1000,  # Convert to milliseconds
            i2,
            color="red",
            linewidth=2,
            label="I₂ (Secondary Current)",
            linestyle="--",
        )

        # Configure right subplot
        self.ax2.set_xlabel("Time (ms)", fontsize=10)
        self.ax2.set_ylabel("Voltage (V)", fontsize=10, color="blue")
        self.ax2_twin.set_ylabel("Current (A)", fontsize=10, color="red")
        self.ax2.set_title("Secondary Side Waveforms", fontsize=11, fontweight="bold")
        self.ax2.grid(True, alpha=0.3)
        self.ax2.tick_params(axis="y", labelcolor="blue")
        self.ax2_twin.tick_params(axis="y", labelcolor="red")

        # Add legend
        lines1, labels1 = self.ax2.get_legend_handles_labels()
        lines2, labels2 = self.ax2_twin.get_legend_handles_labels()
        self.ax2.legend(lines1 + lines2, labels1 + labels2, loc="upper right", fontsize=9)

        # Adjust layout to prevent overlap
        self.fig.tight_layout()

        # Redraw canvas
        self.canvas.draw()
