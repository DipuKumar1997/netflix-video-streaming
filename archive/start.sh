#!/bin/bash
set -e

echo "🚀 Starting Netflix Environment..."

# 1. Start Minikube
if ! minikube status | grep -q "host: Running"; then
    minikube start
fi

# 2. Deploy Kafka
echo "📦 Deploying Kafka..."
kubectl apply -f k8s/kafka.yaml
kubectl rollout status statefulset/kafka --timeout=5m

# 3. Deploy Elasticsearch (official image, single node)
echo "📦 Deploying Elasticsearch..."
ES_IMAGE="docker.elastic.co/elasticsearch/elasticsearch:8.19.23"

if ! docker image inspect "$ES_IMAGE" >/dev/null 2>&1; then
    docker pull "$ES_IMAGE"
fi

minikube image load "$ES_IMAGE"
kubectl apply -f k8s/elasticsearch.yaml
kubectl rollout status deployment/elasticsearch --timeout=5m

# 4. Deploy MongoDB if its pod does not exist
if ! kubectl get pod mongodb >/dev/null 2>&1; then
    echo "📦 Deploying MongoDB..."
    kubectl run mongodb \
        --image=mongo:latest \
        --port=27017 \
        --restart=Always

    kubectl wait --for=condition=Ready pod/mongodb --timeout=5m
fi

# Ensure MongoDB Service exists
if ! kubectl get service mongodb >/dev/null 2>&1; then
    kubectl expose pod mongodb --port=27017 --target-port=27017
fi

# 5. Build application images
echo "🏗️ Building application images..."

docker build -t dk95074450/netflix-backend:v1 \
    -f netflix/Dockerfile .

docker build -t dk95074450/netflix-frontend:v1 \
    -f netflix-frontendV0.2/Dockerfile \
    ./netflix-frontendV0.2

docker build -t dk95074450/netflix-search:v1 \
    -f search-service/Dockerfile .

# 6. Load application images into Minikube
echo "📥 Loading application images..."

minikube image load dk95074450/netflix-backend:v1
minikube image load dk95074450/netflix-frontend:v1
minikube image load dk95074450/netflix-search:v1

# 7. Deploy application
echo "⛵ Deploying Netflix application..."

helm upgrade --install netflix-app helm/netflix-app \
    --set images.backend=dk95074450/netflix-backend:v1 \
    --set images.frontend=dk95074450/netflix-frontend:v1 \
    --set images.search=dk95074450/netflix-search:v1

# 8. Wait for application deployments
kubectl rollout status deployment/netflix-app-backend --timeout=5m || true
kubectl get pods

# 9. Set up port forwarding
echo "🔌 Starting port forwarding..."

for port in 8080 5173; do
    pkill -f "^kubectl port-forward svc/.* ${port}:" 2>/dev/null || true
done

kubectl port-forward svc/netflix-backend-service 8080:8080 >/dev/null 2>&1 &
kubectl port-forward svc/netflix-app-frontend-service 5173:5173 >/dev/null 2>&1 &
#netflix-app-frontend-57879cfb-cfhbq

echo
echo " Setup finished!"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8080"

