'use strict';

var CHANGELOG_FILE_NAME = 'CHANGELOG.md';
var handlebars = require('handlebars');
var fsp = require('fs-promise');
var path = require('path');
var nodefn = require('when/node');
var prependFile = nodefn.lift(require('prepend-file'));

function readTemplate() {
    return fsp.readFile(path.join(__dirname, '../../templates/default.hbs'))
        .then(function extractTemplateFromFile(data) {
            return data.toString();
        });
}

function write(preset, templateFileName, tag, commits) {
    return readTemplate()
        .then(function writeFile(template) {
            var compiledTemplate = handlebars.compile(template);

            return prependFile(CHANGELOG_FILE_NAME, compiledTemplate({
                commits: commits,
                tag: tag
            }));
        });
}

module.exports = {
    write: write
};
