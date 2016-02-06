'use strict';

var gitService = require('./services/git-service');
var commitsParser = require('./services/commits-parser');
var changelog = require('./services/changelog');

function mapCommits(commits) {
    return commits && commits.map(commitsParser.mapCommit);
}

function filterCommits(commits) {
    return commits && commits.filter(commitsParser.isCommitValid);
}

function sortCommits(commits) {
    return commits && commits.sort(commitsParser.compareCommits);
}

function groupCommits(commits) {
    return commits && commitsParser.group(commits);
}

function getCommits(tags) {
    return gitService.getCommits(tags && tags[tags.length - 1]);
}

function generateChangelog() {
    return gitService.getTags()
        .then(getCommits)
        .then(mapCommits)
        .then(filterCommits)
        .then(groupCommits)
        .then(sortCommits)
        .then(changelog.write);
}

module.exports = {
    generateChangelog: generateChangelog
};
