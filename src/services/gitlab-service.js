'use strict';

var when = require('when');

function createGitlabClient() {
    var gitlab = require('gitlab')({
        url:   'https://gitlab.app.betfair',
        token: 'yrDp9zMRZniyhKiuG6C7'
    });

    function getIssue(projectId, issueId) {
        var deferred = when.defer();

        gitlab.projects.issues.list (projectId, {iid: issueId}, function (data) {
            deferred.resolve(data && data[0]);
        });

        return deferred.promise;
    }

    return {
        getIssue: getIssue
    };
}

module.exports = createGitlabClient();
