'use strict';

var _ = require('lodash');
var when = require('when');
var githubServiceFactory = require('../issue-tracker/github-service');
var jiraServiceFactory = require('../issue-tracker/jira-service');
var gitService = require('./git-service');
var DEFAULT_ISSUE_TRACKER = 'github';
var ISSUE_TRACKER_FACTORY = {
    'github': createCommitsDecoratorForGithub,
    'jira': createCommitsDecoratorForJira
};

function createCommitsDecoratorForGithub() {
    return gitService.getRepositoryInfo()
        .then(function createCommitsDecoratorWithRepoInfo(repoInfo) {
            var githubService = githubServiceFactory(repoInfo.user, repoInfo.repo);

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
        });
}

function createCommitsDecoratorForJira(options) {
    var jiraService = jiraServiceFactory(options);

    function decorateCommit(commit) {
        return jiraService.getIssue(commit.issueId)
            .then(function decorateWithGithubIssue(jiraIssue) {
                return _.assign({}, commit, {
                    title: jiraIssue.fields.summary,
                    link: 'https://' + options.host + '/browse/' + jiraIssue.key
                });
            });
    }

    return when({
        decorateCommit: decorateCommit
    });
}

function decorateCommits(issueTrackerConfig, commits) {
    var type;
    var issueTrackerFactory;

    if (!commits || !commits.length) {
        return;
    }
    issueTrackerConfig = issueTrackerConfig || {};

    type = issueTrackerConfig.type || DEFAULT_ISSUE_TRACKER;
    issueTrackerFactory = ISSUE_TRACKER_FACTORY[type];
    if (!issueTrackerFactory) {
        throw new Error('invalid type: ', type);
    }

    return issueTrackerFactory(issueTrackerConfig.options)
        .then(function decorateWithIssueTracker(issueTracker) {
            return when.all(commits.map(issueTracker.decorateCommit));
        });
}

module.exports = {
    decorateCommits: decorateCommits
};
