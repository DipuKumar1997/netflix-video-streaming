#!/bin/bash

echo "=== 1. Killing Port Forwarding Processes ==="
pkill -f "port-forward.*5173:80" || true

echo "=== 2. Uninstalling Helm Releases ==="
helm uninstall my-netflix-app || true

echo "=== 3. Deleting Static Kubernetes Resources ==="
kubectl delete -f k8s/ --ignore-not-found=true

echo "=== 4. Deleting Minikube Cluster & Reclaiming Disk/RAM ==="
minikube delete

echo "========================================================="
echo " All resources, clusters, and containers completely deleted."
echo " System memory and disk space fully reclaimed."
echo "========================================================="