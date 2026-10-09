'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = list;

var _fs = require('fs');

var _path = require('path');

function list(settings, logger) {
  (0, _fs.readdirSync)(settings.pluginDir).forEach(function (filename) {
    var stat = (0, _fs.statSync)((0, _path.join)(settings.pluginDir, filename));

    if (stat.isDirectory() && filename[0] !== '.') {
      logger.log(filename);
    }
  });
  logger.log(''); //intentional blank line for aesthetics
}

module.exports = exports['default'];
