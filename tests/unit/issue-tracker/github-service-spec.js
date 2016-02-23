'use strict';

var proxyquire = require('proxyquire')
    .noCallThru()
    .noPreserveCache();
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chai = require('chai');
var expect = chai.expect;

chai.use(sinonChai);

describe('github service', function () {
    var githubServiceFactory;
    var GithubStub;
    var sinonSandbox;
    var getRepoIssueStub;

    beforeEach(function () {
        sinonSandbox = sinon.sandbox.create();
        GithubStub = sinonSandbox.stub();
        getRepoIssueStub = sinonSandbox.stub();
        githubServiceFactory = proxyquire('../../../src/issue-tracker/github-service', {
            'github': GithubStub
        });

        GithubStub.returns({
            issues: {
                getRepoIssue: getRepoIssueStub
            }
        });
    });

    afterEach(function () {
        sinonSandbox.restore();
    });

    describe('construction', function () {
        describe('when we dont pass an user', function () {
            it('should throw an error', function () {
                expect(function () {
                    githubServiceFactory(undefined, 'someRepo');
                }).to.throw('You need a valid user for the github repo.');
            });
        });

        describe('when we dont pass a repo', function () {
            it('should throw an error', function () {
                expect(function () {
                    githubServiceFactory('githubUser');
                }).to.throw('You need a valid repository for the github repo.');
            });
        });

        describe('when we dont pass any options', function () {
            it('should construct a github client with the default options', function () {
                githubServiceFactory('githubUser', 'someRepo');

                expect(GithubStub).to.have.been.calledWith({
                    version: '3.0.0',
                    protocol: 'https',
                    host: 'api.github.com',
                    timeout: 5000
                });
            });
        });

        describe('when we pass an options object', function () {
            var options = {
                version: '2.1.3',
                protocol: 'http',
                host: 'some.github.domain',
                timeout: 2500
            };

            it('should construct a github client with passed options', function () {
                githubServiceFactory('githubUser', 'someRepo', options);

                expect(GithubStub).to.have.been.calledWith(options);
            });
        });
    });

    describe('after construction', function () {
        var githubService;
        var githubUser = 'githubUser';
        var githubRepo = 'someRepo';

        beforeEach(function () {
            githubService = githubServiceFactory(githubUser, githubRepo);
            githubService.getIssue();
        });

        describe('when requesting an issue', function () {
            var issueId = '#12';
            var issueObject = {
                someKey: 'someValue'
            };
            var getIssueResponse;

            beforeEach(function () {
                getRepoIssueStub.callsArgWith(1, undefined, issueObject);
                return githubService.getIssue(issueId)
                    .then(function extractResponse(response) {
                        getIssueResponse = response;
                    });
            });

            it('should call getRepoIssue from githubClient with the right parameters', function () {
                expect(getRepoIssueStub).to.have.been.calledWith({
                    user: githubUser,
                    repo: githubRepo,
                    number: issueId
                });
            });

            it('should return the result from getRepoIssue', function () {
                expect(getIssueResponse).to.equal(issueObject);
            });
        });
    });
});
