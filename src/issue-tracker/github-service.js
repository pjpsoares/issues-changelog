'use strict';

var nodefn = require('when/node');
var GitHubApi = require('github');
var DEFAULT_GITHUB_OPTIONS = {
    version: '3.0.0',
    protocol: 'https',
    host: 'api.github.com',
    timeout: 5000
};

function createGitHubClient(user, repository, options) {
    if (!user) {
        throw new Error('You need a valid user for the github repo.');
    }
    if (!repository) {
        throw new Error('You need a valid repository for the github repo.');
    }

    var github = new GitHubApi(options || DEFAULT_GITHUB_OPTIONS);
    var getRepoIssue = nodefn.lift(github.issues.getRepoIssue);

    function getIssue(issueId) {
        return getRepoIssue({
            user: user,
            repo: repository,
            number: issueId
        });
    }

    return {
        getIssue: getIssue
    };
}

module.exports = createGitHubClient;
