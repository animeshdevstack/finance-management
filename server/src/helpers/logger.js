const configuration = require("../config/configuration");

function log(...args) {
    if (configuration.isLog) {
        console.log(...args);
    }
}

function error(...args) {
    if (configuration.isLog) {
        console.error(...args);
    }
}

function warn(...args) {
    if (configuration.isLog) {
        console.warn(...args);
    }
}

function info(...args) {
    if (configuration.isLog) {
        console.info(...args);
    }
}

module.exports = {
    log,
    error,
    warn,
    info,
};
