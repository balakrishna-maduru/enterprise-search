#!/bin/bash
# Quick conda environment activation script

CONDA_ENV_NAME="enterprise-search"

# Function to activate conda environment
activate_env() {
    if command -v conda >/dev/null 2>&1; then
        echo "Activating conda environment: $CONDA_ENV_NAME"
        source "$(conda info --base)/etc/profile.d/conda.sh"
        conda activate "$CONDA_ENV_NAME" 2>/dev/null || {
            echo "Environment '$CONDA_ENV_NAME' not found. Creating from environment.yml..."
            conda env create -f environment.yml
            conda activate "$CONDA_ENV_NAME"
        }
        echo "✅ Conda environment '$CONDA_ENV_NAME' activated"
        echo "Python: $(python --version)"
        echo "Node.js: $(node --version)"
    else
        echo "❌ Conda not found. Please install Miniconda or Anaconda."
        exit 1
    fi
}

# If script is sourced, just activate
if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
    activate_env
else
    echo "Usage: source activate.sh"
    echo "This will activate the enterprise-search conda environment"
fi
