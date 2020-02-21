const core = require("@actions/core");
const github = require("@actions/github");

function parseAuthors(input) {
  if (!input) {
    return [];
  }

  return input.split(",").map(login => login.toLowerCase().trim())
}

async function run() {
  try {
    const respondableId = core.getInput("respondableId", { required: true });
    // const response = core.getInput("response", { required: true });

    const response = 'We want to say ![welcome to our community](https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2F4.bp.blogspot.com%2F-llh6c4dYACc%2FT7qnnu8xI7I%2FAAAAAAAACHA%2Foi4dzQ-TInI%2Fs1600%2Fyay.png&f=1&nofb=1 "Welcome to our community")'

    const author = core.getInput("author", { required: true });
    const token = process.env.GITHUB_TOKEN;
    const exemptedAuthors = parseAuthors(core.getInput("exemptedAuthors"));

    if (!token) {
      core.setFailed("GITHUB_TOKEN is not available");
      return;
    }

    if (exemptedAuthors.includes(author.toLowerCase())) {
      console.debug(`${author} is exempt from autoresponse`);
      return;
    }

    const octokit = new github.GitHub(token);

    await octokit.graphql(`
      mutation($respondableId: ID!, $response: String!) {
        addComment(input: { subjectId: $respondableId, body: $response}) {
          clientMutationId
        }
      }
    `, { respondableId, response });
  } catch(error) {
    core.setFailed(`Error adding autoresponse: ${error.message}`);
  }
}

run();
