'use strict';

var nodefn = require('when/node');
var GitHubApi = require('github');

function createGitHubClient(user, repository) {
    var github = new GitHubApi({
        version: '3.0.0',
        protocol: 'https',
        host: 'api.github.com',
        timeout: 5000
    });
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
