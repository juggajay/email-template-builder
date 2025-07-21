#!/bin/bash

echo "🧪 Running tests in Docker..."

# Run Playwright tests in Docker container
docker run --rm \
  --network tempbuilder_template-builder \
  -v $(pwd):/work \
  -w /work \
  mcr.microsoft.com/playwright:v1.40.0-focal \
  sh -c "npm install && node test-complete.js"