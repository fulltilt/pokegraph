#!/bin/bash
set -e

read -p "Are you sure you want to delete everything in pokemon-app namespace? (yes/no): " confirm

if [ "$confirm" = "yes" ]; then
    echo "Deleting all resources..."
    kubectl delete namespace pokemon-app
    echo "Namespace deleted. All resources removed."
else
    echo "Aborted."
fi