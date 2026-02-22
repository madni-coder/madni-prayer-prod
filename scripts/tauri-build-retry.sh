#!/usr/bin/env bash
set -euo pipefail

MAX_ATTEMPTS=3
DELAY_SECONDS=5

attempt=0
while [ $attempt -lt $MAX_ATTEMPTS ]; do
  attempt=$((attempt + 1))
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] Attempt $attempt of $MAX_ATTEMPTS: npm run tauri build"
  if npm run tauri build; then
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Build succeeded on attempt $attempt"
    exit 0
  else
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Build failed on attempt $attempt"
    if [ $attempt -lt $MAX_ATTEMPTS ]; then
      echo "Retrying in $DELAY_SECONDS seconds..."
      sleep $DELAY_SECONDS
    else
      echo "All $MAX_ATTEMPTS attempts failed. Exiting with failure."
      exit 1
    fi
  fi
done
