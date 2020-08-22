import axios from 'axios';
import getSSMParameters from '../tools/ssm';
import postResult from '../tools/postResult';

const REPOS = [
  'robcronin/github-lambda-status-checks',
];
const BASE_BRANCH = 'production';


const statusCheckRepo = (repo, githubToken, status, message) => {
  const url = `https://api.github.com/repos/${repo}/pulls?state=open&base=${BASE_BRANCH}`;
  axios.get(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${githubToken}`,
    },
  })
    .then((response) => {
      for (let i = 0; i < response.data.length; i += 1) {
        postResult(
          response.data[i].statuses_url,
          githubToken,
          'Time of Day Check',
          status,
          message,
        );
      }
    });
};

const statusCheckAllRepos = (event, context, callback, status, message) => {
  getSSMParameters(['github_token'])
    .then((githubToken) => {
      const repos = Object.values(REPOS);
      for (let i = 0; i < repos.length; i += 1) {
        statusCheckRepo(repos[i], githubToken, status, message);
      }

      const response = {
        statusCode: 200,
        body: JSON.stringify({
          input: event,
        }),
      };

      return callback(null, response);
    });
};

const githubBlockedStatus = (event, context, callback) => {
  statusCheckAllRepos(event, context, callback, 'pending', 'You can\'t merge to production between 4pm-8am');
};

const githubUnblockedStatus = (event, context, callback) => {
  statusCheckAllRepos(event, context, callback, 'success', 'You can merge at this time');
};

export { githubBlockedStatus, githubUnblockedStatus };
