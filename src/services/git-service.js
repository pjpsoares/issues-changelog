'use strict';

var nodefn = require('when/node');
var execAsPromise = nodefn.lift(require('child_process').exec);
var semverValid = require('semver').valid;
var getTagsCmd = 'git tag --sort version:refname';

function getTags() {
    return execAsPromise(getTagsCmd)
        .then(function(data) {
            return data[0].split('\n')
                .filter(semverValid);
        });
}

function getCommits(fromTag, toTag) {

}

module.exports = {
    getTags: getTags,
    getCommits: getCommits
}
