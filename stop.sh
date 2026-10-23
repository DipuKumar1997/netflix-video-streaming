#!/bin/bash

echo "=== 1. Stopping Background Port Forwarding ==="
pkill -f "port-forward.*5173:80" || true

echo "=== 2. Stopping Minikube Cluster ==="
minikube stop

echo "========================================================="
echo " Minikube stopped successfully."
echo " All cluster state, data, and built images are preserved."
echo " Run ./start.sh to resume your environment anytime."
echo "========================================================="