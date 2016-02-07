'use strict';

var gitService = require('./services/git-service');
var commitsParser = require('./services/commits-parser');
var changelog = require('./services/changelog');
var when = require('when');
var commitsDecoratorFactory = require('./services/commits-decorator');

function mapCommits(commits) {
    return commits && commits.map(commitsParser.mapCommit);
}

function filterCommits(commits) {
    return commits && commits.filter(commitsParser.isCommitValid);
}

function sortCommits(commits) {
    return commits && commits.sort(commitsParser.compareCommits);
}

function decorateCommits(commits) {
    if (!commits || !commits.length) {
        return;
    }

    return gitService.getRepositoryInfo()
        .then(function decorateWithRepoInfo(repoInfo) {
            var commitsDecorator = commitsDecoratorFactory(
                repoInfo.user, repoInfo.repo
            );

            return when.all(commits.map(commitsDecorator.decorateCommit));
        });
}

function groupCommits(commits) {
    return commits && commitsParser.group(commits);
}

function getCommits(tags) {
    return gitService.getCommits(tags && tags[tags.length - 1]);
}

function writeChangelog(commits) {
    return commits && changelog.write(commits);
}

function generateChangelog() {
    return gitService.getTags()
        .then(getCommits)
        .then(mapCommits)
        .then(filterCommits)
        .then(groupCommits)
        .then(decorateCommits)
        .then(sortCommits)
        .then(writeChangelog);
}

module.exports = {
    generateChangelog: generateChangelog
};
