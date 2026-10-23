#!/bin/bash
set -e

echo "=============================================="
echo "🚀 Starting Full Netflix Environment (One-Click)"
echo "=============================================="

# 1. Start Minikube
if ! minikube status | grep -q "Running"; then
    echo "▶️ Starting Minikube..."
    minikube start
else
    echo "✅ Minikube is already running."
fi

# 2. Deploy Infrastructure (Kafka & Elasticsearch with open values)
echo "=============================================="
echo "📦 Deploying Infrastructure Services..."
echo "=============================================="

# Clean up any stale infrastructure causing immutable field errors
#helm uninstall kafka elasticsearch netflix-app 2>/dev/null || true
helm uninstall elasticsearch 2>/dev/null || true

echo "Installing Kafka..."
#helm upgrade --install kafka oci://registry-1.docker.io/bitnamicharts/kafka -f helm/netflix-app/kafka-values.yaml --wait --timeout 5m

kubectl apply -f k8s/kafka.yaml
kubectl rollout status statefulset/kafka --timeout=5m


helm upgrade --install elasticsearch oci://registry-1.docker.io/bitnamicharts/elasticsearch -f helm/netflix-app/es-values.yaml --wait --timeout 5m


# Deploy open MongoDB pod if not present
if ! kubectl get deployment mongodb &>/dev/null && ! kubectl get pod mongodb &>/dev/null; then
    echo "Deploying MongoDB..."
    kubectl run mongodb --image=mongo:latest --port=27017
    kubectl expose pod mongodb --port=27017 --type=ClusterIP --dry-run=client -o yaml | kubectl apply -f -
fi

# 3. Build Application Docker Images
echo "=============================================="
echo "🏗️ Building Application Docker Images..."
echo "=============================================="
docker build -t dk95074450/netflix-backend:v1 -f netflix/Dockerfile .
docker build -t dk95074450/netflix-frontend:v1 -f netflix-frontendV0.2/Dockerfile ./netflix-frontendV0.2
docker build -t dk95074450/netflix-search:v1 -f search-service/Dockerfile .

# 4. Load into Minikube
echo "📥 Loading Images into Minikube..."
minikube image load dk95074450/netflix-backend:v1
minikube image load dk95074450/netflix-frontend:v1
minikube image load dk95074450/netflix-search:v1

# 5. Deploy App Helm Chart
echo "⛵ Deploying Netflix Application Helm Chart..."
helm upgrade --install netflix-app helm/netflix-app \
  --set images.backend=dk95074450/netflix-backend:v1 \
  --set images.frontend=dk95074450/netflix-frontend:v1 \
  --set images.search=dk95074450/netflix-search:v1 \
  --force

# 6. Port Forwarding
echo "=============================================="
echo "🔌 Setting up Port Forwarding..."
echo "=============================================="
pkill -f "kubectl port-forward" || true

kubectl port-forward svc/netflix-backend-service 8080:8080 > /dev/null 2>&1 &
kubectl port-forward svc/netflix-app-frontend-service 5173:5173 > /dev/null 2>&1 &

echo "=============================================="
echo "✨ Setup Complete!"
echo "   Frontend:    http://localhost:5173"
echo "   Backend API: http://localhost:8080"
echo "=============================================="