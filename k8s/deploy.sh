#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Deploying Pokemon App to Kubernetes ===${NC}"

# Check if kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: Cannot connect to Kubernetes cluster"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 1: Creating namespace and secrets...${NC}"
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml

echo ""
echo -e "${YELLOW}Step 2: Deploying database storage and StatefulSet...${NC}"
kubectl apply -f 02-database/
echo "Waiting for database to be ready (this may take 1-2 minutes)..."
kubectl wait --for=condition=ready pod -l app=postgres -n pokemon-app --timeout=300s || {
    echo "Database failed to start. Checking logs:"
    kubectl logs -l app=postgres -n pokemon-app --tail=50
    exit 1
}
echo -e "${GREEN}✓ Database is ready${NC}"

echo ""
echo -e "${YELLOW}Step 3: Deploying ML services...${NC}"
kubectl apply -f 03-services/embedding-service/
kubectl apply -f 03-services/sealed-classifier/
echo "Waiting for ML services to be ready..."
sleep 10
kubectl wait --for=condition=ready pod -l app=embedding-service -n pokemon-app --timeout=300s || echo "Warning: Embedding service may still be starting"
kubectl wait --for=condition=ready pod -l app=sealed-classifier -n pokemon-app --timeout=300s || echo "Warning: Classifier service may still be starting"

echo ""
echo -e "${YELLOW}Step 4: Deploying backend API...${NC}"
kubectl apply -f 04-backend/
echo "Waiting for backend to be ready..."
sleep 5
kubectl wait --for=condition=ready pod -l app=backend -n pokemon-app --timeout=300s || echo "Warning: Backend may still be starting"

echo ""
echo -e "${YELLOW}Step 5: Deploying frontend...${NC}"
kubectl apply -f 05-frontend/

echo ""
echo -e "${YELLOW}Step 6: Setting up ingress...${NC}"
kubectl apply -f 06-ingress/

echo ""
echo -e "${GREEN}=== Deployment complete! ===${NC}"
echo ""
echo "Check status with:"
echo "  kubectl get pods -n pokemon-app"
echo "  kubectl get svc -n pokemon-app"
echo "  kubectl get ingress -n pokemon-app"
echo ""
echo "View logs:"
echo "  kubectl logs -f deployment/backend -n pokemon-app"
echo "  kubectl logs -f deployment/frontend -n pokemon-app"
echo ""
echo "Get ingress IP:"
echo "  kubectl get ingress -n pokemon-app"