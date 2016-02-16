'use strict';

var fsp = require('fs-promise');
var DEFAULT_CONFIGURATION_FILE_NAME = 'changelog.json';
var DEFAULT_CONFIGURATION = {
    mapBy: '',
    filterBy: undefined,
    groupBy: 'issueId',
    issueTracker: 'github',
    sortBy: undefined,
    templatePreset: 'default',
    templateFile: undefined
};
var _ = require('lodash');

function extendDefaultConfiguration(configuration) {
    return _.assign({}, DEFAULT_CONFIGURATION,
        configuration && JSON.parse(configuration.toString()));
}

function load(configurationFileName) {
    configurationFileName = configurationFileName || DEFAULT_CONFIGURATION_FILE_NAME;

    return fsp.exists(configurationFileName)
        .then(function (fileExists) {
            return fileExists ? fsp.readFile(configurationFileName) : undefined;
        })
        .then(extendDefaultConfiguration);
}

module.exports = {
    load: load
};
