'use strict';

var _ = require('lodash');
var githubServiceFactory = require('./github-service');

function createCommitsDecorator(repoUser, repoProject) {
    var githubService = githubServiceFactory(repoUser, repoProject);

    function decorateCommit(commit) {
        return githubService.getIssue(commit.issueId)
            .then(function decorateWithGithubIssue(githubIssue) {
                return _.assign({}, commit, {
                    title: githubIssue.title,
                    link: githubIssue.html_url
                });
            });
    }

    return {
        decorateCommit: decorateCommit
    };
}

module.exports = createCommitsDecorator;
