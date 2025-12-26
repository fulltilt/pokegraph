#!/bin/bash
set -e

NAMESPACE="pokemon-app"
GITHUB_USER="fulltilt"

echo "=== Updating Docker Images ==="

if [ "$1" = "all" ]; then
    echo "Updating all services..."
    kubectl set image deployment/backend backend=ghcr.io/$GITHUB_USER/pokemon-backend:latest -n $NAMESPACE
    kubectl set image deployment/frontend frontend=ghcr.io/$GITHUB_USER/pokemon-frontend:latest -n $NAMESPACE
    kubectl set image deployment/embedding-service embedding-service=ghcr.io/$GITHUB_USER/pokemon-embedding-service:latest -n $NAMESPACE
    kubectl set image deployment/sealed-classifier-service sealed-classifier=ghcr.io/$GITHUB_USER/pokemon-sealed-classifier:latest -n $NAMESPACE
elif [ "$1" = "backend" ]; then
    kubectl set image deployment/backend backend=ghcr.io/$GITHUB_USER/pokemon-backend:latest -n $NAMESPACE
elif [ "$1" = "frontend" ]; then
    kubectl set image deployment/frontend frontend=ghcr.io/$GITHUB_USER/pokemon-frontend:latest -n $NAMESPACE
elif [ "$1" = "embedding" ]; then
    kubectl set image deployment/embedding-service embedding-service=ghcr.io/$GITHUB_USER/pokemon-embedding-service:latest -n $NAMESPACE
elif [ "$1" = "classifier" ]; then
    kubectl set image deployment/sealed-classifier-service sealed-classifier=ghcr.io/$GITHUB_USER/pokemon-sealed-classifier:latest -n $NAMESPACE
else
    echo "Usage: ./update-images.sh [all|backend|frontend|embedding|classifier]"
    exit 1
fi

echo "Rollout status:"
kubectl rollout status deployment/$1 -n $NAMESPACE 2>/dev/null || kubectl get pods -n $NAMESPACE