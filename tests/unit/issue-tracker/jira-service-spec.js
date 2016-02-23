'use strict';

var proxyquire = require('proxyquire')
    .noCallThru()
    .noPreserveCache();
var when = require('when');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chai = require('chai');
var expect = chai.expect;

chai.use(sinonChai);

describe('jira service', function () {

    var sinonSandbox;
    var jiraServiceFactory;
    var JiraClientStub;
    var findIssueStub;

    beforeEach(function () {
        sinonSandbox = sinon.sandbox.create();
        JiraClientStub = sinonSandbox.stub();
        findIssueStub = sinonSandbox.stub();

        jiraServiceFactory = proxyquire('../../../src/issue-tracker/jira-service', {
            'jira-client': JiraClientStub
        });
        JiraClientStub.returns({
            findIssue: findIssueStub
        });
    });

    afterEach(function () {
        sinonSandbox.restore();
    });

    describe('construction', function () {
        describe('when we dont pass any options', function () {
            it('should throw an error', function () {
                expect(function () {
                    jiraServiceFactory();
                }).to.throw('options are mandatory for jira issue tracker');
            });
        });

        describe('when we pass an options object', function () {
            var options = {
                host: 'jiraHost',
                username: 'aUserName',
                password: 'aPassword'
            };

            beforeEach(function () {
                jiraServiceFactory(options);
            });

            it('should pass the options to the JiraClient', function () {
                expect(JiraClientStub).to.have.been.calledWith();
            });
        });
    });

    describe('after construction', function () {
        var options = {
            host: 'jiraHost',
            username: 'aUserName',
            password: 'aPassword'
        };
        var jiraService;

        beforeEach(function () {
            jiraService = jiraServiceFactory(options);
        });

        describe('when requesting an issue', function () {
            var issueObject = {
                someKey: 'someValue'
            };
            var issueId = 'ISSUE-123';
            var getIssueResponse;

            beforeEach(function () {
                findIssueStub.returns(when(issueObject));
                return jiraService.getIssue(issueId)
                    .then(function (response) {
                        getIssueResponse = response;
                    });
            });

            it('should call the jira client with the issue id', function () {
                expect(findIssueStub).to.have.been.calledWith(issueId);
            });

            it('should return the jira client result', function () {
                expect(getIssueResponse).to.equal(issueObject);
            });
        });
    });
});
