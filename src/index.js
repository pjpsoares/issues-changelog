'use strict';

var gitService = require('./services/git-service');
var commitsParser = require('./services/commits-parser');
var changelog = require('./services/changelog');
var when = require('when');
var commitsDecoratorFactory = require('./services/commits-decorator');
var configurationService = require('./services/configuration-service');

function mapCommits(mapBy, commits) {
    return commits && commits.map(commitsParser.mapCommit);
}

function filterCommits(filterBy, commits) {
    return commits && commits.filter(commitsParser.isCommitValid);
}

function sortCommits(sortBy, commits) {
    return commits && commits.sort(commitsParser.compareCommits);
}

function decorateCommits(issueTracker, commits) {
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

function groupCommits(groupBy, commits) {
    return commits && commitsParser.group(commits);
}

function writeChangelog(preset, templateFileName, commits) {
    return commits && changelog.write(commits);
}

function getCommits(tags) {
    return gitService.getCommits(tags && tags[tags.length - 1]);
}

function generateChangelog() {
    return configurationService.load()
        .then(function (configuration) {
            return gitService.getTags()
                .then(getCommits)
                .then(mapCommits.bind(this, configuration.mapBy))
                .then(filterCommits.bind(this, configuration.filterBy))
                .then(groupCommits.bind(this, configuration.groupBy))
                .then(decorateCommits.bind(this, configuration.issueTracker))
                .then(sortCommits.bind(this, configuration.sortBy))
                .then(writeChangelog.bind(this, configuration.preset, configuration.template));
        })
        .catch(function (error) {
            process.stdout.write(error.stack + '\n');
        });
}

module.exports = {
    generateChangelog: generateChangelog
};
