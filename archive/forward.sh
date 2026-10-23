# 9. Set up port forwarding
echo "🔌 Starting port forwarding..."

for port in 8080 5173; do
    pkill -f "^kubectl port-forward svc/.* ${port}:" 2>/dev/null || true
done

kubectl port-forward svc/netflix-backend-service 8080:8080 >/dev/null 2>&1 &
# Map local port 5173 to service port 80
kubectl port-forward svc/netflix-app-frontend-service 5173:80 >/dev/null 2>&1 &

echo
echo " Setup finished!"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8080"