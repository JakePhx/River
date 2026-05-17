#!/usr/bin/env bash
set -euo pipefail

bucket="${S3_BUCKET:-avatars}"
region="${AWS_DEFAULT_REGION:-us-east-1}"

echo "Creating bucket: ${bucket}"
awslocal s3api create-bucket --bucket "${bucket}" --region "${region}" 2>/dev/null || true
# Same bucket holds `avatars/*` and `posts/*` (browser uploads via PutObject).

echo "Setting bucket CORS"
# Browser hits Vite on many origins (localhost, 127.0.0.1, LAN IP with host: true). Wildcard avoids silent CORS failures before the API is called.
awslocal s3api put-bucket-cors --bucket "${bucket}" --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "HEAD", "POST"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}'

echo "Setting public-read bucket policy (dev only)"
awslocal s3api put-bucket-policy --bucket "${bucket}" --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [
    {
      \"Sid\": \"PublicReadGetObject\",
      \"Effect\": \"Allow\",
      \"Principal\": \"*\",
      \"Action\": \"s3:GetObject\",
      \"Resource\": \"arn:aws:s3:::${bucket}/*\"
    }
  ]
}"

echo "LocalStack S3 ready"

