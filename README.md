# msgproj
The msgproj allows user to post messages, retrieve messages, and delete messages.

## How To Run:
Before start, we need to get AWS authentication.
- Get aws authenication by `aws configure`.
- run `aws ecr get-login`. The output is a docker login command with temporary credentials. Remove `-e none` in the output, and run the command. 

Now we can start :)
The Service should be deployed and run on AWS. First go the the root directory of the project. 
- Build Stack (If the service has never been deployed on aws before):
  1. `cd deploy_scripts`
  2. Give all .sh files exec permission. (ex. chmod 755 * ) 
  3. ./stack_op.sh
  4. Follow the steps


