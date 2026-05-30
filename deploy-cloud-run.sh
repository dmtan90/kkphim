#!/bin/bash
# Deploy MonPlayer Dual API Proxy to Google Cloud Run

# --- Deployment Configuration ---
PROJECT_ID="your_google_cloud_project_id"
REGION="asia-east1"
REPO_NAME="monplayer-proxy-repo"
IMAGE_NAME="kkphim-nguonc-proxy"
SERVICE_NAME="kkphim-nguonc-proxy"

echo "=========================================="
echo "  MonPlayer Dual API Proxy Deployer"
echo "=========================================="

if [ "$PROJECT_ID" = "your_google_cloud_project_id" ]; then
    echo "ERROR: Please edit this script and configure your actual Google Cloud PROJECT_ID!"
    exit 1
fi

echo "Enabling required Google Cloud APIs..."
gcloud services enable run.googleapis.com artifactregistry.googleapis.com --project="$PROJECT_ID" --quiet

echo "Creating Artifact Registry repository if not exists..."
gcloud artifacts repositories create "$REPO_NAME" --repository-format=docker --location="$REGION" --project="$PROJECT_ID" 2>/dev/null || echo "Repository already exists or skipping creation."

echo "Building container via Google Cloud Build..."
gcloud builds submit --tag "$REGION"-docker.pkg.dev/"$PROJECT_ID"/"$REPO_NAME"/"$IMAGE_NAME":latest --project="$PROJECT_ID"

echo "Deploying to Google Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image="$REGION"-docker.pkg.dev/"$PROJECT_ID"/"$REPO_NAME"/"$IMAGE_NAME":latest \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --max-instances=3 \
  --memory=256Mi \
  --cpu=1 \
  --project="$PROJECT_ID"

echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
