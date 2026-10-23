#!/usr/bin/env bash
set -euo pipefail

echo " Checking Netflix port forwarding..."

# Format: local_port:service:service_port
FORWARDS=(
  "8080:netflix-backend-service:8080"
  "5173:netflix-app-frontend-service:5173"
)

for entry in "${FORWARDS[@]}"; do
  IFS=':' read -r LOCAL_PORT SERVICE SERVICE_PORT <<< "$entry"

  # Skip ports that are already listening, when ss is available.
  if command -v ss >/dev/null 2>&1 &&
     ss -ltnH | awk '{print $4}' | grep -Eq "[:.]${LOCAL_PORT}$"; then
    echo " Port $LOCAL_PORT is already listening; skipping."
    continue
  fi

  echo " Forwarding $LOCAL_PORT -> $SERVICE:$SERVICE_PORT"

  LOG_FILE="/tmp/netflix-port-forward-${LOCAL_PORT}.log"
  nohup kubectl port-forward \
    --address 127.0.0.1 \
    "svc/${SERVICE}" \
    "${LOCAL_PORT}:${SERVICE_PORT}" \
    >"$LOG_FILE" 2>&1 &

  PID=$!
  sleep 1

  if kill -0 "$PID" 2>/dev/null; then
    echo " Port-forward process started for port $LOCAL_PORT (PID $PID)"
  else
    echo " Failed to start port forwarding on port $LOCAL_PORT"
    cat "$LOG_FILE"
  fi
done

echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8080"
