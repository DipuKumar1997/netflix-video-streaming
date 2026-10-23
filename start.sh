##!/bin/bash
#set -e
#
#echo "=== 1. Starting Minikube ==="
#minikube status > /dev/null 2>&1 || minikube start --memory=3918 --cpus=2 --driver=docker
#
#echo "=== 2. Applying Infrastructure Manifests ==="
#kubectl apply -f k8s/elasticsearch.yaml
#kubectl apply -f k8s/kafka.yaml
#kubectl apply -f k8s/mongodb.yaml
#
#echo "=== 3. Waiting for Elasticsearch Health Gate ==="
#kubectl rollout status deployment/elasticsearch --timeout=180s
#
#ES_POD=$(kubectl get pods -l app=elasticsearch -o jsonpath="{.items[0].metadata.name}")
#COUNT=0
#
#until kubectl exec "$ES_POD" -- curl -s http://localhost:9200/_cluster/health | grep -E '"status":"(green|yellow)"' > /dev/null; do
#    COUNT=$((COUNT + 1))
#    if [ $COUNT -ge 30 ]; then
#        echo "ERROR: Elasticsearch health check timed out."
#        exit 1
#    fi
#    sleep 5
#done
#
#echo "Elasticsearch Cluster Health:"
#kubectl exec "$ES_POD" -- curl -s http://localhost:9200/_cluster/health?pretty
#
#echo "=== 4. Building Docker Images (Root Context) ==="
#docker build -t dk95074450/netflix-backend:v1 -f backend-service/Dockerfile .
#docker build -t dk95074450/netflix-frontend:v1 -f frontend-service/Dockerfile frontend-service
#docker build -t dk95074450/netflix-search:v1 -f search-service/Dockerfile .
#
#echo "=== 5. Loading Images into Minikube ==="
#minikube image load dk95074450/netflix-backend:v1
#minikube image load dk95074450/netflix-frontend:v1
#minikube image load dk95074450/netflix-search:v1
#
#echo "=== 6. Deploying Application via Helm ==="
#helm upgrade --install my-netflix-app ./helm/netflix-app
#
#echo "=== 7. Status Check & Auto Port-Forwarding ==="
#kubectl get pods
#
#pkill -f "port-forward.*5173:80" || true
#nohup kubectl port-forward svc/my-netflix-app-frontend-service 5173:80 > /dev/null 2>&1 &
#
#echo "========================================================="
#echo " App ready! Access Frontend at: http://localhost:5173"
#echo "========================================================="


#!/bin/bash
set -e

echo "=== 1. Building Maven Artifacts on Host ==="
mvn clean package -DskipTests

echo "=== 2. Starting Minikube ==="
minikube status > /dev/null 2>&1 || minikube start --memory=3918 --cpus=2 --driver=docker

echo "=== 3. Applying Infrastructure Manifests ==="
kubectl apply -f k8s/elasticsearch.yaml
kubectl apply -f k8s/kafka.yaml
kubectl apply -f k8s/mongodb.yaml

echo "=== 4. Waiting for Elasticsearch Health Gate ==="
kubectl rollout status deployment/elasticsearch --timeout=180s

ES_POD=$(kubectl get pods -l app=elasticsearch -o jsonpath="{.items[0].metadata.name}")
COUNT=0

until kubectl exec "$ES_POD" -- curl -s http://localhost:9200/_cluster/health | grep -E '"status":"(green|yellow)"' > /dev/null; do
    COUNT=$((COUNT + 1))
    if [ $COUNT -ge 30 ]; then
        echo "ERROR: Elasticsearch health check timed out."
        exit 1
    fi
    sleep 5
done

echo "Elasticsearch Cluster Health:"
kubectl exec "$ES_POD" -- curl -s http://localhost:9200/_cluster/health?pretty

echo "=== 5. Building Runtime Docker Images ==="
docker build -t dk95074450/netflix-backend:v1 -f backend-service/Dockerfile .
docker build -t dk95074450/netflix-search:v1 -f search-service/Dockerfile .
docker build -t dk95074450/netflix-frontend:v1 -f frontend-service/Dockerfile frontend-service

echo "=== 6. Loading Images into Minikube ==="
minikube image load dk95074450/netflix-backend:v1
minikube image load dk95074450/netflix-search:v1
minikube image load dk95074450/netflix-frontend:v1

echo "=== 7. Deploying Application via Helm ==="
helm upgrade --install my-netflix-app ./helm/netflix-app

echo "=== 8. Status Check & Auto Port-Forwarding ==="
kubectl get pods

pkill -f "port-forward.*5173:80" || true
nohup kubectl port-forward svc/my-netflix-app-frontend-service 5173:80 > /dev/null 2>&1 &

echo "========================================================="
echo " App ready! Access Frontend at: http://localhost:5173"
echo "========================================================="