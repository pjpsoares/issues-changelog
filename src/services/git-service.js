'use strict';

var COMMITS_SEPARATOR = '<---/-/-/-/-/-/-/-/--->';
var DEFAULT_FORMAT = '%B';
var nodefn = require('when/node');
var execAsPromise = nodefn.lift(require('child_process').exec);
var semverValid = require('semver').valid;
var template = require('lodash/string/template');
var trim = require('lodash/string/trim');
var getTagsCmd = 'git tag --sort version:refname';
var getTagsIntervalPartialCmdFromTemplate =
    template('"<%- fromTag ? fromTag + ".." : "" %><%= toTag %>"');
var getCommitsCmdFromTemplate =
    template('git log --format="<%= format %>' + COMMITS_SEPARATOR + '"' +
        ' <%= tagsInterval %>');

function processExecResponse(data) {
    return data[0];
}

function getTags() {
    return execAsPromise(getTagsCmd)
        .then(processExecResponse)
        .then(function splitTagsString(tagsString) {
            return tagsString.split('\n');
        })
        .then(function filterInvalidTags(tags) {
            return tags.filter(semverValid);
        });
}

function getCommits(fromTag, toTag) {
    var tagsInterval = fromTag || toTag ?
        getTagsIntervalPartialCmdFromTemplate(fromTag, toTag) : '';
    var getCommitsCmd = getCommitsCmdFromTemplate({
        tagsInterval: tagsInterval,
        format: DEFAULT_FORMAT
    });

    return execAsPromise(getCommitsCmd)
        .then(processExecResponse)
        .then(function splitCommitsString(commitsString) {
            return commitsString.split(COMMITS_SEPARATOR);
        })
        .then(function trimDownCommits(commits) {
            return commits.map(trim);
        })
        .then(function cleanUpEmptyCommits(commits) {
            return commits.filter(function unity(commit) {
                return commit;
            });
        });
}

module.exports = {
    getTags: getTags,
    getCommits: getCommits
};
