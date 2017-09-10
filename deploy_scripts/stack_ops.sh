#!/usr/bin/env sh
echo "Operation: (create-stack | update-stack | delete-stack | deploy | deploy-view)"
read OPERATION

if [ "$OPERATION" = "deploy-view" ]; then
  aws s3 sync ../view s3://msgproj.awsplay.net --acl public-read
  exit 0
fi

if [ "$OPERATION" = "deploy" ]; then
  echo "Build & push Docker image"
  ./build_push_docker.sh

  echo "Enter docker image: "
  read DOCKER_IMAGE
  TASK_FAMILY="msg-proj-prod"
  # get current task def & service info
  LATEST_TASK_DEFINITION=$(aws ecs describe-task-definition --task-definition ${TASK_FAMILY} --region us-east-1)
  SERVICE_ARN=$(aws ecs list-services --cluster MsgProj --region us-east-1 | jq -r ".serviceArns[0]")
  SERVICE_NAME=$(echo $SERVICE_ARN | awk '{sub(/.+\//, "")};1')
  PREVIOUS_REVISION=$(echo $LATEST_TASK_DEFINITION | jq -r ".taskDefinition.revision")
  # Create the new task revision
  echo $LATEST_TASK_DEFINITION \
       | jq '{containerDefinitions: .taskDefinition.containerDefinitions, volumes: .taskDefinition.volumes}' \
       | jq '.containerDefinitions[0].image='\"$DOCKER_IMAGE\" \
       > ./task-definition.json
  echo "New task def: "
  cat ./task-definition.json
  # register task
  aws ecs register-task-definition --region us-east-1 --family ${TASK_FAMILY} --cli-input-json file://./task-definition.json
  # Update current task def version, +1
  CURRENT_REVISION=$(expr ${PREVIOUS_REVISION} + 1)
  echo "New task revision: "
  echo $CURRENT_REVISION
  # Use the new task def
  echo "Apple new task definition"
  aws ecs update-service --region us-east-1 --cluster MsgProj --service $SERVICE_NAME --task-definition ${TASK_FAMILY}:${CURRENT_REVISION}

  echo "done"
  exit 0
fi

echo "Stack Name: (ex. msgproj | msgprodecr | msgprodddb)"
read STACK_NAME

if [ "$OPERATION" = "delete-stack" ]; then
  aws cloudformation ${OPERATION} --stack-name ${STACK_NAME} --region us-east-1
  exit 0
fi

echo "Path to template: (ex. cloudformation-template-msg.yml | cloudformation-template-ecr.yml | cloudformation-template-ddb.yml)"
read TEMPLATE

aws cloudformation $OPERATION --stack-name ${STACK_NAME} --template-body file://../cloudformation/${TEMPLATE} --capabilities CAPABILITY_IAM --region us-east-1
