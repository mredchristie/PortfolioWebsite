#!/bin/bash

echo "Formatting files..."
npm run format

echo "Deploying to Cloudflare R2..."
mc mirror --overwrite . r2/website

echo "Deploy complete!"
