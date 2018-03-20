


# Setup

## AWS Account

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


## Command Line

- Clone this repo: `git clone git@github.com:robcronin/pr-name-checker.git`
- Install serverless if you haven't already: `npm install -g serverless`
- Run `yarn`
- Add dev dependencies `yarn add -d babel-core babel-loader babel-plugin-transform-runtime babel-preset-env babel-preset-stage-3 serverless-webpack webpack@3.11.0 webpack-node-externals@1.6.0`
- Deploy your lambda with `serverless deploy`
- Copy the endpoint that prints after a successful deployment

## Github Config

- You will need a github token to post on your behalf and to generate a webhook token 

**Github Token**

- Generate a new [personal acess token](https://github.com/settings/tokens)
- You only need to give it `repo:status` permissions
- Save this token somewhere for now

**Github Webhook**

- Generate a [secret for your webhook](https://developer.github.com/webhooks/securing/) and save it somewhere for now
  - `ruby -rsecurerandom -e 'puts SecureRandom.hex(20)'`
- In any repo you wish your lambda to listen to, go to settings and choose `Webhooks`
- Add a webhook with:
  - Payload URL: the endpoint printed after `serverless deploy`
  - Content Type: application/json
  - Events: Choose the events you wish to listen for (`Pull Requests` for this example)


## AWS Config

- Go to [AWS Console](https://aws.amazon.com/console/)
- From `Services` choose `EC2`
- At the bottom of the left hand menu choose `Parameter Store`
- Add `github_token` and `github_webhook_secret` here based on the values noted above (as a Secure String)


## Test it Out

- Create a pull request in a repo you configured the webhook in
- See the status update
- The default rule will only only pass if the PR title has 'ROBC' and a '#' in it
- If it doesn't work, check the logs: `serverless logs -f githubWebhookListener -t`

## Force it to be used

- After it runs once in a repo it can be chosen as a Required status check on any protected branches
- Go to settings in the repo and choose `Branches`
- Choose/Make a protected branch
- Choose `Require status checks to pass before merging` and select this check


## Tweak it

- In [handler.js](./handler.js) add your own rules from line 100 and redeploy


# References

- [Github webhook listner Source](https://github.com/serverless/examples/tree/master/aws-node-github-webhook-listener)
- [Support for ES6/ES7 Javascript](https://serverless-stack.com/chapters/add-support-for-es6-es7-javascript.html)