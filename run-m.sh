#!/bin/bash

# Update dingfang-m-dev
echo "Updating dingfang-m-dev..."
cd /var/dingfang/docker/dingfang-m-dev
git pull

# Update deployment configuration
echo "Updating deployment configuration..."
cd /var/dingfang/docker/dingfang-m
git pull

# Go to deployment folder and run docker-compose
echo "Deploying..."
cd /var/dingfang/docker/deployment
docker-compose up -d --build
docker-compose restart
