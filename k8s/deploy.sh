#!/bin/bash
set -e

echo "=== Deploying Pokemon App to Kubernetes ==="

echo ""
echo "Step 1: Creating namespace and secrets..."
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml

echo ""
echo "Step 2: Deploying database..."
kubectl apply -f 02-database/
echo "Waiting for database to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n pokemon-app --timeout=300s

echo ""
echo "Step 3: Deploying ML services..."
kubectl apply -f 03-services/

echo ""
echo "Step 4: Deploying backend..."
kubectl apply -f 04-backend/

echo ""
echo "Step 5: Deploying frontend..."
kubectl apply -f 05-frontend/

echo ""
echo "Step 6: Setting up ingress..."
kubectl apply -f 06-ingress/

echo ""
echo "=== Deployment complete! ==="
echo ""
echo "Check status:"
echo "  kubectl get pods -n pokemon-app"
echo "  kubectl get svc -n pokemon-app"
echo "  kubectl get ingress -n pokemon-app"
