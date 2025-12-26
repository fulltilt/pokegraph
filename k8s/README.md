# Kubernetes Deployment Manifests

## Structure

- `00-namespace.yaml` - Create the pokemon-app namespace
- `01-secrets.yaml` - Secrets for DB and registry access
- `02-database/` - PostgreSQL StatefulSet and storage
- `03-services/` - ML services (embedding, classifier)
- `04-backend/` - Backend API deployment
- `05-frontend/` - Frontend web app
- `06-ingress/` - Ingress controller for external access

## Deployment Order

1. Namespace and secrets first
2. Database (wait for it to be ready)
3. ML services
4. Backend (depends on DB and ML services)
5. Frontend
6. Ingress

## Quick Deploy
```bash
# Deploy everything
./deploy.sh

# Or manually:
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-database/
kubectl wait --for=condition=ready pod -l app=postgres -n pokemon-app --timeout=300s
kubectl apply -f 03-services/
kubectl apply -f 04-backend/
kubectl apply -f 05-frontend/
kubectl apply -f 06-ingress/
```

## Individual Components
```bash
# Just backend
kubectl apply -f 04-backend/

# Just frontend
kubectl apply -f 05-frontend/

# Restart backend
kubectl rollout restart deployment/backend -n pokemon-app
```
