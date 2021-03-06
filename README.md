# msgproj
The msgproj allows user to post messages, retrieve messages, and delete messages.

## Design & Architecture
The Project is separated into 4 components:
- #### Frontend: React hosted on S3 Webhosting.
  The reason of separating frontend from service is because it is a client of the API. Logically it should be on a different layer. An advantage of using S3 webhosting is it's easy to deploy, and scaling is automatically handled.
- #### API: Node.js on AWS ECS cluster.
  Node.js is fast, cost less hardware ($$$). ECS has very good supports on docker.
- #### Docker Repo: ECR
  ECR is AWS native Docker repo, automatically compatable with ECS.
- #### DataStore: AWS hosted DynamoDB
  DynamoBD has autoscaling on read/write capacity. It's NoSQL, search is fast. Key-pair structure fits the requirement well.

![Alt text](./diagrams/msgproj.png?raw=true "Architecture Graph")

## User Interaction Sequence Diagrams
###### Post/Create Message:
![Alt text](./diagrams/CreateUserInteraction.png?raw=true "Post Message Sequence")

###### Get Message
![Alt text](./diagrams/GetUserInteraction.png?raw=true "Get Message Sequence")

###### Delete Message
![Alt text](./diagrams/DeleteUserInteraction.png?raw=true "Delete Message Sequence")

## How To Run:
Before start, we need to get AWS authentication.
- Get aws authenication by `aws configure`.
- run `aws ecr get-login`. The output is a docker login command with temporary credentials. Remove `-e none` in the output, and run the command.

Now we can start :)
The Service should be deployed and run on AWS. Currently it can only be deployed to Lu's personal AWS account because there will be too many parameters passing and configs in the building process, which is beyond the scope of this project.

First go the the root directory of the project.
- Build Stack (If the service has never been deployed on aws before):
  - `cd deploy_scripts`
  - Give all .sh files exec permission. (ex. chmod 755 * ). Then we can build/deploy using `stack_ops.sh`.
  - DynamoDB Stack:
    ```
    $ ./stack_ops.sh
    Operation: (create-stack | update-stack | delete-stack | deploy | deploy-view)
    create-stack
    Stack Name: (ex. msgproj | msgprodecr | msgprodddb)
    msgprojddb
    ```
    Replace create-stack with update-stack or delete-stack to update or delete the stack.

  - ECR (Docker Repo) Stack:
    ```
    $ ./stack_ops.sh
    Operation: (create-stack | update-stack | delete-stack | deploy | deploy-view)
    create-stack
    Stack Name: (ex. msgproj | msgprodecr | msgprodddb)
    msgprodecr
    ```  
    Replace create-stack with update-stack or delete-stack to update or delete the stack.

  - Service Stack:
    ```
    $ ./stack_ops.sh
    Operation: (create-stack | update-stack | delete-stack | deploy | deploy-view)
    create-stack
    Stack Name: (ex. msgproj | msgprodecr | msgprodddb)
    msgproj
    ```  
    Replace create-stack with update-stack or delete-stack to update or delete the stack.   

  - Deploy Service:
    ```
    $ ./stack_ops.sh
    Operation: (create-stack | update-stack | delete-stack | deploy | deploy-view)
    deploy
    ... OUT PUT OF DOCKER BUILD & PUSH ...
    Images:
    ACCOUNT_NUMBER.dkr.ecr.us-east-1.amazonaws.com/msg.proj:1.0.0
    ACCOUNT_NUMBER.dkr.ecr.us-east-1.amazonaws.com/msg.proj:latest
    Enter docker image:
    ACCOUNT_NUMBER.dkr.ecr.us-east-1.amazonaws.com/msg.proj:latest
    ```
    The deploy process will build and push the same image with 2 tags. In the example above, 1.0.0 is the version image.
    Lastest is always the latest images. Then use one of the two images as the input.

  - Deploy UI:
    ```
    $ ./stack_ops.sh
    Operation: (create-stack | update-stack | delete-stack | deploy | deploy-view)
    deploy-view
    ```
    UI Deployment is a upload process to the S3 bucket.

## Access Service:
  - Access UI: http://msgproj.awsplay.net
  - Access API: http://msg-proj-prod.awsplay.net
  - API Documentation (Swagger): http://msg-proj-prod.awsplay.net/documentation
