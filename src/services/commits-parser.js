'use strict';

var COMMIT_REGEX = /^#(\d+)/m;
var _ = require('lodash');

function mapCommit(commit) {
    // We extract the issue id as it's the only thing relevant for us
    var parsedCommit = commit.match(COMMIT_REGEX);

    return parsedCommit && {
        issueId: parsedCommit[1]
    };
}

function compareCommits() {
    // We just want to maintain the order
    return 0;
}

function isCommitValid(commit) {
    // Ignore everything that's not on the expected format
    return commit && commit.issueId;
}

function group(commits) {
    return _.uniqBy(commits, 'issueId');
}

module.exports = {
    mapCommit: mapCommit,
    compareCommits: compareCommits,
    isCommitValid: isCommitValid,
    group: group
};
