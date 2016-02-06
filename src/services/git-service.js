'use strict';

var COMMITS_SEPARATOR = '<---/-/-/-/-/-/-/-/--->';
var DEFAULT_FORMAT = '%B';
var nodefn = require('when/node');
var execAsPromise = nodefn.lift(require('child_process').exec);
var semverValid = require('semver').valid;
var _ = require('lodash');
var getTagsCmd = 'git tag --sort version:refname';
var getRepositoryUrlCmd = 'git config --get remote.origin.url';
var getTagsIntervalPartialCmdFromTemplate =
    _.template('"<%- fromTag ? fromTag + ".." : "" %><%= toTag %>"');
var getCommitsCmdFromTemplate =
    _.template('git log --format="<%= format %>' + COMMITS_SEPARATOR + '"' + ' <%= tagsInterval %>');
var GIT_REPO_REGEX = /\/|:([^\/]*)\/([^\/]*).git$/m;

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
        getTagsIntervalPartialCmdFromTemplate({
            fromTag: fromTag,
            toTag: toTag
        }) : '';
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
            return commits.map(_.trim);
        })
        .then(function cleanUpEmptyCommits(commits) {
            return commits.filter(function unity(commit) {
                return commit;
            });
        });
}

function getRepositoryUrl() {
    return execAsPromise(getRepositoryUrlCmd)
        .then(function extractRepositoryUrl(repositoryUrlCmdResponse) {
            return repositoryUrlCmdResponse[0];
        });
}

function extractInfoFromUrl(gitUrl) {
    var splitUrl = gitUrl.match(GIT_REPO_REGEX);

    return splitUrl && {
        user: splitUrl[1],
        repo: splitUrl[2]
    };
}

function getRepositoryInfo() {
    return getRepositoryUrl()
        .then(extractInfoFromUrl);
}

module.exports = {
    getTags: getTags,
    getCommits: getCommits,
    getRepositoryUrl: getRepositoryUrl,
    getRepositoryInfo: getRepositoryInfo
};
