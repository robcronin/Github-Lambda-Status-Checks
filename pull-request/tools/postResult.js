import axios from 'axios';

const postResult = (url, githubToken, context, status, message) => {
  axios.post(
    url,
    {
      state: status,
      description: message,
      context,
    },
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${githubToken}`,
      },
    },
  );
};

export default postResult;
