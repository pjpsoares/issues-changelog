'use strict';

var CHANGELOG_FILE_NAME = 'CHANGELOG.md';
var handlebars = require('handlebars');
var fsp = require('fs-promise');
var path = require('path');

function readTemplate() {
    return fsp.readFile(path.join(__dirname, '../../templates/default.hbs'))
        .then(function extractTemplateFromFile(data) {
            return data.toString();
        });
}

function write(preset, templateFileName, commits) {
    return readTemplate()
        .then(function writeFile(template) {
            var compiledTemplate = handlebars.compile(template);

            return fsp.appendFile(CHANGELOG_FILE_NAME, compiledTemplate({
                commits: commits
            }));
        });
}

module.exports = {
    write: write
};
