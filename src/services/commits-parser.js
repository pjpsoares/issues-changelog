'use strict';

function mapCommit(commit) {
    return commit;
}

function compareCommits(commit1, commit2) {
    return 0;
}

function isCommitValid(commit) {
    return commit;
}

function group(commits) {
    return commits;
}

module.exports = {
    mapCommit: mapCommit,
    compareCommits: compareCommits,
    isCommitValid: isCommitValid,
    group: group
}
