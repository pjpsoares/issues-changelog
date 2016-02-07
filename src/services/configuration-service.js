'use strict';

var fsp = require('fs-promise');
var DEFAULT_CONFIGURATION_FILE_NAME = '.changelog';

function load(configurationFileName) {
    configurationFileName = configurationFileName || DEFAULT_CONFIGURATION_FILE_NAME;

    return fsp.exists(configurationFileName)
        .then(function (fileExists) {
            return fileExists ? fsp.readFile(configurationFileName) : undefined;
        })
        .then(function extractConfiguration(configuration) {
            return configuration ? JSON.parse(configuration.toString()) : {};
        });
}

module.exports = {
    load: load
};
