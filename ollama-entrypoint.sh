#!/bin/sh
# ollama-entrypoint.sh
#
# Sidecar entrypoint script for the Ollama container.
#
# Strategy:
#   1. Start the Ollama server in the background.
#   2. Wait until its HTTP API is ready.
#   3. Pull the model ONLY if it is not already cached in the volume.
#   4. Keep the server in the foreground.
#
# The model files are stored in /root/.ollama/models which is mounted
# as a named Docker volume (ollama-models). This means the pull only
# happens on the very first `docker compose up` — subsequent starts
# detect the cached files and skip the download entirely.

set -e

MODEL="${OLLAMA_MODEL:-llama3.2}"

echo "[Ollama Sidecar] Starting Ollama server..."
ollama serve &
OLLAMA_PID=$!

# Wait for the API to become ready (up to 60 seconds)
echo "[Ollama Sidecar] Waiting for API to be ready..."
for i in $(seq 1 60); do
    if ollama list > /dev/null 2>&1; then
        echo "[Ollama Sidecar] API is ready."
        break
    fi
    if [ "$i" -eq 60 ]; then
        echo "[Ollama Sidecar] ERROR: Ollama API did not become ready in time."
        exit 1
    fi
    sleep 1
done

# Check if the model is already downloaded (look for its manifest in the cache)
MODEL_DIR="/root/.ollama/models/manifests/registry.ollama.ai/library"
MODEL_NAME=$(echo "$MODEL" | cut -d: -f1)

if [ -d "$MODEL_DIR/$MODEL_NAME" ]; then
    echo "[Ollama Sidecar] Model '$MODEL' already cached — skipping download."
else
    echo "[Ollama Sidecar] Pulling model '$MODEL' (first-time download)..."
    ollama pull "$MODEL"
    echo "[Ollama Sidecar] Model '$MODEL' downloaded and ready."
fi

# Hand control back to the Ollama server process
echo "[Ollama Sidecar] ✅ Ollama is ready. Serving model: $MODEL"
wait $OLLAMA_PID
