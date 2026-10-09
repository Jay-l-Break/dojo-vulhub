'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = manageUuid;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _os = require('os');

var serverHostname = (0, _os.hostname)();

/* Handle different scenarios:
 *  - config uuid exists, data uuid exists and matches
 *      - nothing to do
 *  - config uuid missing, data uuid exists
 *      - set uuid from data as config uuid
 *  - config uuid exists, data uuid exists but mismatches
 *      - update data uuid with config uuid
 *  - config uuid missing, data uuid missing
 *      - generate new uuid, set in config and insert in data
 * ("config uuid" = uuid in server.config,
 *   "data uuid" = uuid in .kibana index)
 */

function manageUuid(server) {
  var TYPE = 'server';
  var config = server.config();
  var serverPort = server.info.port;
  var client = server.plugins.elasticsearch.client;

  return function uuidManagement() {
    var fieldId = serverHostname + '-' + serverPort;
    var kibanaIndex = config.get('kibana.index');
    var kibanaUuid = config.get('uuid');

    function logToServer(msg) {
      server.log(['server', 'uuid', fieldId], msg);
    }

    return client.get({
      index: kibanaIndex,
      ignore: [404],
      type: TYPE,
      id: fieldId
    }).then(function (result) {
      if (result.found) {
        if (kibanaUuid === result._source.uuid) {
          // config uuid exists, data uuid exists and matches
          logToServer('Kibana instance UUID: ' + kibanaUuid);
          return;
        }

        if (!kibanaUuid) {
          // config uuid missing, data uuid exists
          kibanaUuid = result._source.uuid;
          logToServer('Resuming persistent Kibana instance UUID: ' + kibanaUuid);
          config.set('uuid', kibanaUuid);
          return;
        }

        if (kibanaUuid !== result._source.uuid) {
          // config uuid exists, data uuid exists but mismatches
          logToServer('Updating Kibana instance UUID to: ' + kibanaUuid + ' (was: ' + result._source.uuid + ')');
          return client.update({
            index: kibanaIndex,
            type: TYPE,
            id: fieldId,
            body: { doc: { uuid: kibanaUuid } }
          });
        }
      }

      // data uuid missing
      if (!kibanaUuid) {
        // config uuid missing
        kibanaUuid = _nodeUuid2['default'].v4();
        config.set('uuid', kibanaUuid);
      }

      logToServer('Setting new Kibana instance UUID: ' + kibanaUuid);
      return client.index({
        index: kibanaIndex,
        type: TYPE,
        id: fieldId,
        body: { uuid: kibanaUuid }
      });
    });
  };
}

module.exports = exports['default'];
