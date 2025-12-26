#!/bin/bash
set -e

# Check if namespace exists
if ! kubectl get namespace pokemon-app &> /dev/null; then
    echo "Creating namespace..."
    kubectl create namespace pokemon-app
fi

echo "Creating secrets..."

# Prompt for values
read -p "Enter GitHub username: " GITHUB_USER
read -sp "Enter GitHub token (PAT): " GITHUB_TOKEN
echo ""
read -sp "Enter PostgreSQL password: " POSTGRES_PASSWORD
echo ""

# Create postgres secret
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_USER=postgres \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --from-literal=POSTGRES_DB=pokedex \
  -n pokemon-app \
  --dry-run=client -o yaml | kubectl apply -f -

# Create ghcr secret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username="$GITHUB_USER" \
  --docker-password="$GITHUB_TOKEN" \
  --docker-email="${GITHUB_USER}@users.noreply.github.com" \
  -n pokemon-app \
  --dry-run=client -o yaml | kubectl apply -f -

echo ""
echo "✓ Secrets created successfully!"
echo ""
echo "Verify with:"
echo "  kubectl get secrets -n pokemon-app"