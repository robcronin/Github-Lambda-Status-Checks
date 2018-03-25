import axios from 'axios';
import crypto from 'crypto';
import getSSMParameters from '../tools/ssm';

function signRequestBody(key, body) {
  return `sha1=${crypto
    .createHmac('sha1', key)
    .update(body, 'utf-8')
    .digest('hex')}`;
}

const postResult = (url, githubToken, status, message) => {
  axios.post(
    url,
    {
      state: status,
      description: message,
      context: 'Pull Request Name Check'
    },
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${githubToken}`
      }
    }
  );
};

module.exports.githubWebhookListener = (event, context, callback) => {
  var errMsg; // eslint-disable-line
  const headers = event.headers;
  const sig = headers['X-Hub-Signature'];
  const githubEvent = headers['X-GitHub-Event'];
  const id = headers['X-GitHub-Delivery'];
  return getSSMParameters(['github_token', 'github_webhook_secret']).then(
    tokens => {
      const githubToken = tokens[0];
      const webhookToken = tokens[1];

      const calculatedSig = signRequestBody(webhookToken, event.body);

      if (typeof webhookToken !== 'string') {
        errMsg = 'Must provide a \'GITHUB_WEBHOOK_SECRET\' env variable';
        return callback(null, {
          statusCode: 401,
          headers: { 'Content-Type': 'text/plain' },
          body: errMsg
        });
      }

      if (!sig) {
        errMsg = 'No X-Hub-Signature found on request';
        return callback(null, {
          statusCode: 401,
          headers: { 'Content-Type': 'text/plain' },
          body: errMsg
        });
      }

      if (!githubEvent) {
        errMsg = 'No X-Github-Event found on request';
        return callback(null, {
          statusCode: 422,
          headers: { 'Content-Type': 'text/plain' },
          body: errMsg
        });
      }

      if (!id) {
        errMsg = 'No X-Github-Delivery found on request';
        return callback(null, {
          statusCode: 401,
          headers: { 'Content-Type': 'text/plain' },
          body: errMsg
        });
      }

      if (sig !== calculatedSig) {
        errMsg =
          'X-Hub-Signature incorrect. Github webhook token doesn\'t match';
        return callback(null, {
          statusCode: 401,
          headers: { 'Content-Type': 'text/plain' },
          body: errMsg
        });
      }

      // Do custom stuff here with github event data
      // For more on events see https://developer.github.com/v3/activity/events/types/

      const jsonBody = JSON.parse(event.body);

      const owner = jsonBody.pull_request.head.repo.owner.login;
      const repo = jsonBody.pull_request.head.repo.name;
      const sha = jsonBody.pull_request.head.sha;
      const url = 'https://api.github.com/repos/' + owner + '/' + repo + '/statuses/' + sha;

      const prName = jsonBody.pull_request.title;

      // checks PR name is of correct format
      const prValid =
        prName.includes('ROBC') &&
        prName.includes('#')


      if (prValid) {
        postResult(
          url,
          githubToken,
          'success',
          'Your PR title is of the correct format!'
        );
      } else {
        postResult(
          url,
          githubToken,
          'failure',
          'PR Title format: (ROBC #123) AAC I love this site'
        );
      }

      const response = {
        statusCode: 200,
        body: JSON.stringify({
          input: event
        })
      };

      return callback(null, response);
    }
  );
};
