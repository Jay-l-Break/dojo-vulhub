'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (server) {
  require('./register_post')(server);
  require('./register_delete')(server);
};

module.exports = exports['default'];
