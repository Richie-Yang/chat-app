#!/bin/sh

COMMIT_HASH=$(git log --pretty=tformat:'%h' -n1 . | tr -d '\n')
export CLOUD_RUN_REVISION="v-${COMMIT_HASH}-$(date +%Y%m%d%M%S)"
echo "GCP_PROJECT: $GCP_PROJECT"
echo "CLOUD_RUN_SERVICE: $CLOUD_RUN_SERVICE"
echo "CLOUD_RUN_REVISION: $CLOUD_RUN_REVISION"

gcloud config set project "$GCP_PROJECT"
gcloud run deploy "$CLOUD_RUN_SERVICE" --region=asia-east1 --revision-suffix="$CLOUD_RUN_REVISION"