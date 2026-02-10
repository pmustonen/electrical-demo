#!/bin/bash

# AC Reactive Power Demonstration - Run Script

set -e

echo "=== AC Reactive Power Demonstration ==="
echo ""

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "Error: uv is not installed"
    echo "Install it with: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# Sync dependencies (creates venv if needed)
echo "Syncing dependencies with uv..."
uv sync

# Run the application
echo ""
echo "Starting application..."
echo ""
uv run python src/main.py
