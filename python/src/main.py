"""Main entry point for the AC Reactive Power Demonstration application."""

import tkinter as tk
from gui.main_window import MainWindow


def main():
    """Initialize and run the application."""
    root = tk.Tk()
    app = MainWindow(root)
    root.mainloop()


if __name__ == "__main__":
    main()
