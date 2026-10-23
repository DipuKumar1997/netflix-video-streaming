# Set your Docker Hub username
export DOCKER_USER="dk95074450"

# 1. Build and Push Backend
docker build -t $DOCKER_USER/netflix-backend:v1 -f netflix/Dockerfile .
docker push $DOCKER_USER/netflix-backend:v1

# 2. Build and Push Search Service
docker build -t $DOCKER_USER/netflix-search:v1 -f search-service/Dockerfile .
docker push $DOCKER_USER/netflix-search:v1

# 3. Build and Push Frontend
docker build -t $DOCKER_USER/netflix-frontend:v1 ./netflix-frontendV0.2
docker push $DOCKER_USER/netflix-frontend:v1


docker build -t dk95074450/netflix-backend:v1 ./netflix
docker build -t dk95074450/netflix-frontend:v1 ./netflix-frontendV0.2
docker build -t dk95074450/netflix-search:v1 ./search-service

docker build -t dk95074450/netflix-backend:v1 -f netflix/Dockerfile .
docker build -t dk95074450/netflix-frontend:v1 -f netflix-frontendV0.2/Dockerfile ./netflix-frontendV0.2
docker build -t dk95074450/netflix-search:v1 -f search-service/Dockerfile .


minikube image load dk95074450/netflix-search:v1
minikube image load dk95074450/netflix-frontend:v1
minikube image load dk95074450/netflix-backend:v1

kubectl logs my-netflix-app-backend-68847b8c9c-xmchh --all-containers=true --tail=200
kubectl logs elasticsearch-master-0 --all-containers=true --tail=200
kubectl logs elasticsearch-master-0 --all-containers=true --tail=500 2>&1 \
  | grep -iE 'error|exception|failed|fatal|denied|refused|memory|OOM|bootstrap'

kubectl logs my-netflix-app-backend-5664c4dbb5-bn8zn --all-containers=true --tail=200

#restart the netflix-app-search
kubectl rollout restart deployment/netflix-app-search

#open the mongodb compass and enter the "-----------------------------mongodb://lkubectl port-forward svc/mongodb 27018:27017ocalhost:27018/netflix-------------------------------"
kubectl port-forward svc/mongodb 27018:27017
sudo lsof -i :27017
sudo kill -9 <PID>

kubectl exec kafka-0 -- /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server kafka:9092 \
  --list


kubectl logs -f deployment/
 my-netflix-app-backend
kubectl port-forward svc/my-netflix-app-frontend-service 5173:80

# When you executed helm install my-netflix-app .,
# Helm replaced {{ .Release.Name }} with my-netflix-app,
# producing the final service name: my-netflix-app-backend-service.