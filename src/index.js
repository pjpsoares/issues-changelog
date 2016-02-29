'use strict';

var gitService = require('./services/git-service');
var commitsParser = require('./services/commits-parser');
var changelog = require('./services/changelog');
var commitsDecorator = require('./services/commits-decorator');
var configurationService = require('./services/configuration-service');
var when = require('when');

function mapCommits(mapBy, commits) {
    return commits && commits.map(commitsParser.mapCommit.bind(this, mapBy));
}

function generateCommits(configuration, previousTag) {
    return gitService.getCommits(previousTag)
        .then(mapCommits.bind(this, configuration.mapBy))
        .then(commitsParser.filterCommits.bind(this, configuration.filterBy))
        .then(commitsParser.unique.bind(this, configuration.uniqueBy))
        .then(commitsDecorator.decorateCommits.bind(this, configuration.issueTracker))
        .then(commitsParser.sortCommits.bind(this, configuration.sortBy));
}

function generateChangelogWithInfo(configuration, tags) {
    var currentTag = tags && tags[tags.length - 1];
    var previousTag = tags && tags[tags.length - 2];

    return generateCommits(configuration, previousTag)
        .then(changelog.write.bind(this, configuration.preset, configuration.template, currentTag));
}

function generateChangelog() {
    return when.all([configurationService.load(), gitService.getTags()])
        .spread(generateChangelogWithInfo)
        .catch(function (error) {
            process.stdout.write(error.stack + '\n');
        });
}

module.exports = {
    generateChangelog: generateChangelog
};
