[Github webhook listner Source](https://github.com/serverless/examples/tree/master/aws-node-github-webhook-listener)
[Support for ES6/ES7 Javascript](https://serverless-stack.com/chapters/add-support-for-es6-es7-javascript.html)

# Yarn dependencies

- `yarn add -d babel-core babel-loader babel-plugin-transform-runtime babel-preset-env babel-preset-stage-3 serverless-webpack webpack@3.11.0 webpack-node-externals@1.6.0`

#Steps

**Command Line**

- Clone `github.com/robcronin/pr-name-checker`
- Install serverless if you haven't already `npm install -g serverless`
- Copy [package.json](./package.json) and [webpack.config.js](./webpack.config.js) to your repo
- Run `yarn`
- Add dev dependencies `yarn add -d babel-core babel-loader babel-plugin-transform-runtime babel-preset-env babel-preset-stage-3 serverless-webpack webpack@3.11.0 webpack-node-externals@1.6.0`
- Ensure you have your `~/.aws/credentials` set up with
    [YOUR_EMAIL]
    aws_access_key_id = YOUR_AWS_ACCESS_KEY
    aws_secret_access_key = YOUR AWS_SECRET_KEY
- Deploy your lambda with `serverless deploy`
- Copy the endpoint that prints after a successful deployment

**Github Config**

- You will need a github token to post on your behalf and to generate a webhook token 

*Github Token*

- Generate a new [personal acess token](https://github.com/settings/tokens)
- You only need to give it `repo:status` permissions
- Save this token somewhere for now

*Github Webhook*

- Generate a [secret for your webhook](https://developer.github.com/webhooks/securing/) and save it somewhere for now
  - `ruby -rsecurerandom -e 'puts SecureRandom.hex(20)'`
- In the repo you wish to set this up go to settings and choose `Webhooks`
- Add a webhook with:
  - Payload URL: the endpoint printed after `serverless deploy`
  - Content Type: application/json
  - Events: Choose the events you wish to listen for (`Pull Requests` for this example)


  **AWS Config**

  - Go to [AWS Console](https://aws.amazon.com/console/)
  - From `Services` choose `EC2`
  - At the bottom of the left hand menu choose `Parameter Store`
  - Add `github_token` and `github_webhook_secret` here based on the values noted above