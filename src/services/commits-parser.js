'use strict';

var _ = require('lodash');
var ISSUE_ID_FIELD = 'issueId';
var MAP_BY_DEFAULT = {
    regex: '^#(\\d+)',
    mapTo: [ISSUE_ID_FIELD]
};

function mapCommit(mapBy, commit) {
    mapBy = mapBy || MAP_BY_DEFAULT;

    var parsedCommit = commit.match(new RegExp(mapBy.regex, 'm'));
    var mappedCommit = {};

    if (!parsedCommit) {
        return mappedCommit;
    }

    _.forEach(mapBy.mapTo, function mapToResult(value, index) {
        mappedCommit[value] = parsedCommit[index+1]; // +1 as the first occurrence is for the complete match
    });

    return mappedCommit;
}

function sortCommits(sortByField, commits) {
    return sortByField ? commits : _.sortBy(commits, sortByField);
}

function filterCommits(filterBy, commits) {
    filterBy = filterBy || ISSUE_ID_FIELD;
    return _.filter(commits, filterBy);
}

function unique(uniqueBy, commits) {
    uniqueBy = uniqueBy || ISSUE_ID_FIELD;

    return _.uniqBy(commits, uniqueBy);
}

module.exports = {
    mapCommit: mapCommit,
    sortCommits: sortCommits,
    filterCommits: filterCommits,
    unique: unique
};
