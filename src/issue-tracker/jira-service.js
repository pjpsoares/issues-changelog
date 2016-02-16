'use strict';

var JiraApi = require('jira-client');

function createJiraClient(options) {
    if (!options) {
        throw new Error('options are mandatory for jira issue tracker');
    }
    var jira = new JiraApi(options);

    function getIssue(issueId) {
        return jira.findIssue(issueId);
    }

    return {
        getIssue: getIssue
    };
}

module.exports = createJiraClient;
