#!/usr/bin/env sh

VERSION=`cat ../package.json | jq -r ".version"`

# Tag Latest for easier deployment
# Tag Version for rollback
docker build -t 918544260695.dkr.ecr.us-east-1.amazonaws.com/msg.proj:latest ..
docker build -t 918544260695.dkr.ecr.us-east-1.amazonaws.com/msg.proj:${VERSION} ..
docker push 918544260695.dkr.ecr.us-east-1.amazonaws.com/msg.proj:latest
docker push 918544260695.dkr.ecr.us-east-1.amazonaws.com/msg.proj:${VERSION}

echo "Images:"
echo "918544260695.dkr.ecr.us-east-1.amazonaws.com/msg.proj:${VERSION}"
echo "918544260695.dkr.ecr.us-east-1.amazonaws.com/msg.proj:latest"
