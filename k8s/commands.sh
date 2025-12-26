# Useful Kubernetes Commands

## Deployment
```bash
# Deploy everything
./deploy.sh

# Deploy specific component
kubectl apply -f 04-backend/
```

## Monitoring
```bash
# Get all resources
kubectl get all -n pokemon-app

# Watch pods
kubectl get pods -n pokemon-app -w

# View logs
kubectl logs -f deployment/backend -n pokemon-app
kubectl logs -f deployment/frontend -n pokemon-app

# Describe pod (for troubleshooting)
kubectl describe pod <pod-name> -n pokemon-app
```

## Updates
```bash
# Update all images
./update-images.sh all

# Update specific service
./update-images.sh backend

# Restart without updating image
kubectl rollout restart deployment/backend -n pokemon-app

# Check rollout status
kubectl rollout status deployment/backend -n pokemon-app

# Rollback if needed
kubectl rollout undo deployment/backend -n pokemon-app
```

## Scaling
```bash
# Scale up
kubectl scale deployment/backend --replicas=3 -n pokemon-app

# Scale down
kubectl scale deployment/frontend --replicas=1 -n pokemon-app
```

## Debugging
```bash
# Execute command in pod
kubectl exec -it <pod-name> -n pokemon-app -- /bin/bash

# Port forward for local testing
kubectl port-forward svc/backend 3457:3457 -n pokemon-app

# Get events
kubectl get events -n pokemon-app --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods -n pokemon-app
kubectl top nodes
```

## Cleanup
```bash
# Delete everything
./delete-all.sh

# Delete specific deployment
kubectl delete deployment backend -n pokemon-app
```