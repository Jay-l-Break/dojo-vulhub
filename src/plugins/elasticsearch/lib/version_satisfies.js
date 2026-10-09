'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

module.exports = function (actual, expected) {
  try {
    var ver = cleanVersion(actual);
    return _semver2['default'].satisfies(ver, expected);
  } catch (err) {
    return false;
  }

  function cleanVersion(version) {
    var match = version.match(/\d+\.\d+\.\d+/);
    if (!match) return version;
    return match[0];
  }
};
