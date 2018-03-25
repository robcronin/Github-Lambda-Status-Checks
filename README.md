# Description

This repo is set up to deploy 3 lambdas which will run 2 checks on your pull requests:


**Title Checker**

Checks if your Pull Request Titles match a given format

**Time Checker**

For any Pull Request merging into a given branch it will check that the time is ok i.e. prevents merging into production after certain hours 


# Setup

## AWS Account

You will need an AWS account to deploy lambdas

- Go to [AWS Console](https://aws.amazon.com/console/) and sign in or sign up
- In order to deploy your lambda from the command line you will need acess keys:
  - Sign in to [AWS Console](https://aws.amazon.com/console/)
  - Click your profile in the top right corner and choose `My Security Credentials`
  - Click Access Tokens and generate
- Create/edit the following in your home directory `~/.aws/credentials` with:
```
    [YOUR_AWS_EMAIL]
    aws_access_key_id = YOUR_AWS_ACCESS_KEY
    aws_secret_access_key = YOUR AWS_SECRET_KEY
```


## Github Config


**Github Token**

You will need a GitHub token to post status updates. You can use your own account or you can create a separate account to post status updates (if a shared repo for example).

- On the account you choose generate a new [personal acess token](https://github.com/settings/tokens)
- You only need to give it `repo:status` permissions
- Save this token somewhere for now

**Github Webhook Secret**

You will need to generate a password for use with your webhook

- Generate a [secret for your webhook](https://developer.github.com/webhooks/securing/) and save it somewhere for now
  - `ruby -rsecurerandom -e 'puts SecureRandom.hex(20)'`
  - Keep a note of this for now



## AWS Config

Your lambda will need to know the token and webhook secret you have just generated

- Go to [AWS Console](https://aws.amazon.com/console/)
- From `Services` choose `EC2`
- At the bottom of the left hand menu choose `Parameter Store`
- Add `github_token` and `github_webhook_secret` here based on the values noted above (as a Secure String)



## Deploy Lambdas

Setup this repo to deploy the lambdas

- Clone this repo: `git clone git@github.com:robcronin/github-lambda-status-checks.git`
- `cd github-lambda-status-checks/pull-request`
- Run `yarn`
- In [githubTimeStatus.js](./pull-request/functions/githubTimeStatus.js) edit:
  - `REPOS`: `owner/repo-name` for any repos you wish the time checker to act on
  - `BASE_BRANCH`: `branch` you wish the time check to apply to
- Deploy the lambdas with `serverless deploy` or `yarn deploy`
- Copy the endpoint that prints after a successful deployment


## GitHub Webhook

Anytime you create or modify a pull request we want to activate the lambda. Github webhooks allow you specify to an endpoint to hit when certain events occur.

- In any repo you wish your lambda to respond to, go to settings and choose `Webhooks`
- Add a webhook with:
  - Payload URL: the endpoint printed after `serverless deploy`
  - Content Type: application/json
  - Secret: webhook secret you have generated and stored in AWS
  - Events: Choose the events you wish to listen for (`Pull Requests` for this example)

## Test it Out

- Create a pull request in a repo you configured the webhook in
- See the status update
- The default rules:
  - Name Check will only only pass if the PR title has 'ROBC' and a '#' in it
  - Time Check will only be active for pull requests into production and will pass between 8am-4pm GMT+1
- If it doesn't work, check the logs: `serverless logs -f githubWebhookListener -t`

## Force it to be used

- After it runs once in a repo it can be chosen as a Required status check on any protected branches
- Go to settings in the repo and choose `Branches`
- Choose/Make a protected branch
- Choose `Require status checks to pass before merging` and select these checks


## Tweak it

**GitHub Name Checker**
- In [githubWebhookListener.js](./pull-request/functions/githubWebhookListener.js#95) add your own rules from line 95 and redeploy
- To see all the information that the GitHub response provides:
  - add a `console.log(event.body)` to [githubWebhookListener.js](./pull-request/functions/githubWebhookListener.js)
  - trigger an event and see the logs by running `serverless logs -f githubWebhookListener -t`

**GitHub Time Status**

- In [githubWebhookListener.js](./pull-request/functions/githubWebhookListener.js#104) change to your desired times
- Also in [serverless.yml](./pull-request/serverless.yml#34) change the times that the block/unblock times to your desired times


# Gotchas

- Generally when you redeploy, the endpoint will remain the same. However, I noticed on the odd occassion it will change and you will have to update your repo webhooks. I haven't figured out under what circumstances this occurs for yet
- Statuses are tied to given commits, not given pull requests. Therefore if you have multiple pull requests open for the same branch (e.g. staging and production) then the status will apply to both


# References

- [Github Webhook Listener](https://github.com/serverless/examples/tree/master/aws-node-github-webhook-listener)
- [Support for ES6/ES7 Javascript](https://serverless-stack.com/chapters/add-support-for-es6-es7-javascript.html)