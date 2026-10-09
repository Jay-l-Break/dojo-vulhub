'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _es_bool = require('./es_bool');

var _es_bool2 = _interopRequireDefault(_es_bool);

var _version_satisfies = require('./version_satisfies');

var _version_satisfies2 = _interopRequireDefault(_version_satisfies);

var _setup_error = require('./setup_error');

var _setup_error2 = _interopRequireDefault(_setup_error);

module.exports = function (server) {
  server.log(['plugin', 'debug'], 'Checking Elasticsearch version');

  var client = server.plugins.elasticsearch.client;
  var engineVersion = server.config().get('elasticsearch.engineVersion');

  return client.nodes.info().then(function (info) {
    var badNodes = _lodash2['default'].filter(info.nodes, function (node) {
      // remove nodes that satify required engine version
      return !(0, _version_satisfies2['default'])(node.version, engineVersion);
    });

    if (!badNodes.length) return true;

    var badNodeNames = badNodes.map(function (node) {
      return 'Elasticsearch v' + node.version + ' @ ' + node.http_address + ' (' + node.ip + ')';
    });

    var message = 'This version of Kibana requires Elasticsearch ' + (engineVersion + ' on all nodes. I found ') + ('the following incompatible nodes in your cluster: ' + badNodeNames.join(','));

    throw new _setup_error2['default'](server, message);
  });
};
