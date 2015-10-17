'use strict';

var gitService = require('git-service');
var commitsParser = require('commits-parser');
var changelog = require('changelog');

function filterCommits(commits) {
    return commits.filter(commitsParser.isCommitValid);
}

function mapCommits(commits) {
    return commits.map(commitsParser.mapCommit);
}

function sortCommits(commits) {
    return commits.sortBy(commitsParser.compareCommits);
}

function groupCommits(commits) {
    return commitsParser.group(commits);
}

function getCommits(tags) {
    return gitService.getCommits(tags && tags.last());
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