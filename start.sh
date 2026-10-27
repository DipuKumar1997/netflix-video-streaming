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

COUNT=0
until
    ES_POD=$(kubectl get pods -l app=elasticsearch --field-selector=status.phase=Running -o jsonpath="{.items[0].metadata.name}" 2>/dev/null)
    [ -n "$ES_POD" ] && kubectl exec "$ES_POD" -- curl -s http://localhost:9200/_cluster/health | grep -E '"status":"(green|yellow)"' > /dev/null
do
    COUNT=$((COUNT + 1))
    if [ $COUNT -ge 30 ]; then
        echo "ERROR: Elasticsearch health check timed out or pod kept crashing."
        exit 1
    fi
    echo "Waiting for Elasticsearch to report Green/Yellow health... (Attempt $COUNT/30)"
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

:'

helm uninstall my-netflix-app
helm upgrade --install netflix-app ./helm/netflix-app

cd frontend-service/
npm run build
cd ..
docker build -t dk95074450/netflix-frontend:v1 -f frontend-service/Dockerfile frontend-service
minikube image load dk95074450/netflix-frontend:v1
kubectl rollout restart deployment/my-netflix-app-frontend
kubectl port-forward svc/my-netflix-app-frontend-service 5173:80 > /dev/null 2>&1 &

mvn clean package -DskipTests
docker build -t dk95074450/netflix-backend:v1 -f backend-service/Dockerfile .
minikube image load dk95074450/netflix-backend:v1
kubectl rollout restart deployment/my-netflix-app-backend

kubectl logs -l app=netflix-backend -f --tail=100
kubectl logs -f deployment/my-netflix-app-backend

kubectl port-forward svc/postgres-service 5432:5432

export AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)
export AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)
kubectl create secret generic aws-credentials \
  --from-literal=AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  --from-literal=AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY

'

##open the mongodb compass and enter the "-----------------------------mongodb://localhost:27018/netflix-------------------------------"
#kubectl port-forward svc/mongodb 27018:27017
#sudo lsof -i :27017
#kubectl port-forward svc/mongodb 27018:27017
#sudo kill -9 <PID>

###