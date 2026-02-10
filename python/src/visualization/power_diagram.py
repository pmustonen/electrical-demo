"""Power diagram visualization using matplotlib."""

import tkinter as tk
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import numpy as np


class PowerDiagram:
    """Interactive power vector diagram display."""

    def __init__(self, parent):
        """Initialize the power diagram.

        Args:
            parent: Parent tkinter widget
        """
        self.parent = parent

        # Create matplotlib figure
        self.fig = Figure(figsize=(8, 6), dpi=100)
        self.ax = self.fig.add_subplot(111)

        # Create canvas
        self.canvas = FigureCanvasTkAgg(self.fig, master=parent)
        self.canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

        # Initialize with zero values
        self.update(0, 0, 0, 1.0)

    def update(self, P, Q, S, pf):
        """Update the power diagram with new values.

        Args:
            P: Active power in watts
            Q: Reactive power in VAR
            S: Apparent power in VA
            pf: Power factor
        """
        self.ax.clear()

        # Set up the plot
        self.ax.set_xlim(-50, max(P * 1.2, 100))
        self.ax.set_ylim(-50, max(Q * 1.2, 100))
        self.ax.set_aspect("equal", adjustable="box")
        self.ax.grid(True, alpha=0.3)
        self.ax.set_xlabel("Active Power (W)", fontsize=11)
        self.ax.set_ylabel("Reactive Power (VAR)", fontsize=11)
        self.ax.set_title("Power Triangle", fontsize=13, fontweight="bold")

        # Draw power vectors
        if S > 0:
            # Active power vector (horizontal)
            self.ax.arrow(
                0,
                0,
                P,
                0,
                head_width=S * 0.05,
                head_length=S * 0.03,
                fc="blue",
                ec="blue",
                linewidth=2,
                label="Active Power (P)",
            )

            # Reactive power vector (vertical)
            self.ax.arrow(
                0,
                0,
                0,
                Q,
                head_width=S * 0.05,
                head_length=S * 0.03,
                fc="red",
                ec="red",
                linewidth=2,
                label="Reactive Power (Q)",
            )

            # Apparent power vector (diagonal)
            self.ax.arrow(
                0,
                0,
                P,
                Q,
                head_width=S * 0.05,
                head_length=S * 0.03,
                fc="green",
                ec="green",
                linewidth=2.5,
                label="Apparent Power (S)",
            )

            # Draw the right angle
            corner_size = min(P, Q) * 0.1
            if corner_size > 0:
                self.ax.plot(
                    [P - corner_size, P - corner_size, P],
                    [0, corner_size, corner_size],
                    "k-",
                    linewidth=0.5,
                )

            # Calculate angle phi
            phi = np.arctan2(Q, P)

            # Draw arc for phase angle
            if phi > 0.01:  # Only draw if angle is significant
                arc_radius = min(P, Q) * 0.2
                angles = np.linspace(0, phi, 50)
                arc_x = arc_radius * np.cos(angles)
                arc_y = arc_radius * np.sin(angles)
                self.ax.plot(arc_x, arc_y, "k--", linewidth=1)

                # Add phi label
                label_angle = phi / 2
                label_radius = arc_radius * 1.5
                self.ax.text(
                    label_radius * np.cos(label_angle),
                    label_radius * np.sin(label_angle),
                    f"φ = {np.degrees(phi):.1f}°",
                    fontsize=9,
                    ha="left",
                )

            # Add value annotations
            self.ax.text(
                P / 2,
                -S * 0.08,
                f"P = {P:.1f} W",
                fontsize=9,
                ha="center",
                color="blue",
                fontweight="bold",
            )
            self.ax.text(
                -S * 0.08,
                Q / 2,
                f"Q = {Q:.1f} VAR",
                fontsize=9,
                ha="right",
                va="center",
                color="red",
                fontweight="bold",
            )
            self.ax.text(
                P / 2,
                Q / 2 + S * 0.08,
                f"S = {S:.1f} VA",
                fontsize=9,
                ha="center",
                color="green",
                fontweight="bold",
            )

            # Add power factor box
            pf_text = f"Power Factor:\ncos φ = {pf:.3f}"
            if pf >= 0.95:
                pf_color = "green"
            elif pf >= 0.85:
                pf_color = "orange"
            else:
                pf_color = "red"

            self.ax.text(
                0.98,
                0.98,
                pf_text,
                transform=self.ax.transAxes,
                fontsize=10,
                verticalalignment="top",
                horizontalalignment="right",
                bbox=dict(boxstyle="round", facecolor=pf_color, alpha=0.3),
            )

        self.ax.legend(loc="upper left", fontsize=9)
        self.canvas.draw()
