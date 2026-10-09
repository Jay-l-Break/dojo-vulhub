'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

module.exports = function (kbnServer, server, config) {
  // prevent relying on kbnServer so this can be used with other hapi servers
  kbnServer = null;

  return (0, _bluebird.fromNode)(function (cb) {
    var events = config.get('logging.events');

    if (config.get('logging.silent')) {
      _lodash2['default'].defaults(events, {});
    } else if (config.get('logging.quiet')) {
      _lodash2['default'].defaults(events, {
        log: ['listening', 'error', 'fatal'],
        request: ['error'],
        error: '*'
      });
    } else if (config.get('logging.verbose')) {
      _lodash2['default'].defaults(events, {
        log: '*',
        ops: '*',
        request: '*',
        response: '*',
        error: '*'
      });
    } else {
      _lodash2['default'].defaults(events, {
        log: ['info', 'warning', 'error', 'fatal'],
        response: config.get('logging.json') ? '*' : '!',
        request: ['info', 'warning', 'error', 'fatal'],
        error: '*'
      });
    }

    server.register({
      register: require('good'),
      options: {
        opsInterval: config.get('ops.interval'),
        requestHeaders: true,
        requestPayload: true,
        reporters: [{
          reporter: require('./log_reporter'),
          config: {
            json: config.get('logging.json'),
            dest: config.get('logging.dest'),
            // I'm adding the default here because if you add another filter
            // using the commandline it will remove authorization. I want users
            // to have to explicitly set --logging.filter.authorization=none to
            // have it show up int he logs.
            filter: _lodash2['default'].defaults(config.get('logging.filter'), {
              authorization: 'remove'
            })
          },
          events: _lodash2['default'].transform(events, function (filtered, val, key) {
            // provide a string compatible way to remove events
            if (val !== '!') filtered[key] = val;
          }, {})
        }]
      }
    }, cb);
  });
};
