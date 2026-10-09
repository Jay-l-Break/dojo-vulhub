'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _libHandle_es_error = require('../../../lib/handle_es_error');

var _libHandle_es_error2 = _interopRequireDefault(_libHandle_es_error);

var _libConvert_pattern_and_template_name = require('../../../lib/convert_pattern_and_template_name');

module.exports = function registerDelete(server) {
  server.route({
    path: '/api/kibana/ingest/{id}',
    method: 'DELETE',
    handler: function handler(req, reply) {
      var kibanaIndex = server.config().get('kibana.index');
      var callWithRequest = server.plugins.elasticsearch.callWithRequest;
      var deletePatternParams = {
        index: kibanaIndex,
        type: 'index-pattern',
        id: req.params.id
      };

      _bluebird2['default'].all([callWithRequest(req, 'delete', deletePatternParams), callWithRequest(req, 'indices.deleteTemplate', { name: (0, _libConvert_pattern_and_template_name.patternToTemplate)(req.params.id), ignore: [404] })]).then(function (pattern) {
        reply({ success: true });
      }, function (error) {
        reply((0, _libHandle_es_error2['default'])(error));
      });
    }
  });
};
