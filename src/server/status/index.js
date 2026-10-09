'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _server_status = require('./server_status');

var _server_status2 = _interopRequireDefault(_server_status);

var _path = require('path');

module.exports = function (kbnServer, server, config) {

  kbnServer.status = new _server_status2['default'](kbnServer.server);

  if (server.plugins.good) {
    kbnServer.mixin(require('./metrics'));
  }

  server.route({
    method: 'GET',
    path: '/api/status',
    handler: function handler(request, reply) {
      return reply({
        name: config.get('server.name'),
        uuid: config.get('uuid'),
        status: kbnServer.status.toJSON(),
        metrics: kbnServer.metrics
      });
    }
  });

  server.decorate('reply', 'renderStatusPage', function () {
    var app = kbnServer.uiExports.getHiddenApp('status_page');
    var resp = app ? this.renderApp(app) : this(kbnServer.status.toString());
    resp.code(kbnServer.status.isGreen() ? 200 : 503);
    return resp;
  });

  server.route({
    method: 'GET',
    path: '/status',
    handler: function handler(request, reply) {
      return reply.renderStatusPage();
    }
  });
};
