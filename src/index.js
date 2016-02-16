'use strict';

var gitService = require('./services/git-service');
var commitsParser = require('./services/commits-parser');
var changelog = require('./services/changelog');
var commitsDecorator = require('./services/commits-decorator');
var configurationService = require('./services/configuration-service');

function mapCommits(mapBy, commits) {
    return commits && commits.map(commitsParser.mapCommit.bind(this, mapBy));
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
                .then(commitsDecorator.decorateCommits.bind(this, configuration.issueTracker))
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
