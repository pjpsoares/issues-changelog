'use strict';

var gitService = require('./services/git-service');
var commitsParser = require('./services/commits-parser');
var changelog = require('./services/changelog');
var when = require('when');
var commitsDecoratorFactory = require('./services/commits-decorator');
var configurationService = require('./services/configuration-service');

function mapCommits(mapBy, commits) {
    return commits && commits.map(commitsParser.mapCommit.bind(this, mapBy));
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

function getCommits(tags) {
    return gitService.getCommits(tags && tags[tags.length - 1]);
}

function generateChangelog() {
    return configurationService.load()
        .then(function (configuration) {
            return gitService.getTags()
                .then(getCommits)
                .then(mapCommits.bind(this, configuration.mapBy))
                .then(commitsParser.filterCommits.bind(this, configuration.filterBy))
                .then(commitsParser.unique.bind(this, configuration.uniqueBy))
                .then(decorateCommits.bind(this, configuration.issueTracker))
                .then(commitsParser.sortCommits.bind(this, configuration.sortBy))
                .then(changelog.write.bind(this, configuration.preset, configuration.template));
        })
        .catch(function (error) {
            process.stdout.write(error.stack + '\n');
        });
}

module.exports = {
    generateChangelog: generateChangelog
};
