'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _libSchemasResourcesIndex_pattern_schema = require('../../../lib/schemas/resources/index_pattern_schema');

var _libSchemasResourcesIndex_pattern_schema2 = _interopRequireDefault(_libSchemasResourcesIndex_pattern_schema);

var _libHandle_es_error = require('../../../lib/handle_es_error');

var _libHandle_es_error2 = _interopRequireDefault(_libHandle_es_error);

var _libCreate_mappings_from_pattern_fields = require('../../../lib/create_mappings_from_pattern_fields');

var _libCreate_mappings_from_pattern_fields2 = _interopRequireDefault(_libCreate_mappings_from_pattern_fields);

var _libInit_default_field_props = require('../../../lib/init_default_field_props');

var _libInit_default_field_props2 = _interopRequireDefault(_libInit_default_field_props);

var _libConvert_pattern_and_template_name = require('../../../lib/convert_pattern_and_template_name');

var _libCase_conversion = require('../../../lib/case_conversion');

module.exports = function registerPost(server) {
  server.route({
    path: '/api/kibana/ingest',
    method: 'POST',
    config: {
      validate: {
        payload: _libSchemasResourcesIndex_pattern_schema2['default']
      }
    },
    handler: function handler(req, reply) {
      var kibanaIndex = server.config().get('kibana.index');
      var callWithRequest = server.plugins.elasticsearch.callWithRequest;
      var requestDocument = _lodash2['default'].cloneDeep(req.payload);
      var indexPatternId = requestDocument.id;
      var indexPattern = (0, _libCase_conversion.keysToCamelCaseShallow)(requestDocument);
      delete indexPattern.id;

      var mappings = (0, _libCreate_mappings_from_pattern_fields2['default'])(indexPattern.fields);
      indexPattern.fields = (0, _libInit_default_field_props2['default'])(indexPattern.fields);

      indexPattern.fields = JSON.stringify(indexPattern.fields);
      indexPattern.fieldFormatMap = JSON.stringify(indexPattern.fieldFormatMap);

      return callWithRequest(req, 'indices.exists', { index: indexPatternId }).then(function (matchingIndices) {
        if (matchingIndices) {
          throw _boom2['default'].conflict('Cannot create an index pattern via this API if existing indices already match the pattern');
        }

        var patternCreateParams = {
          index: kibanaIndex,
          type: 'index-pattern',
          id: indexPatternId,
          body: indexPattern
        };

        return callWithRequest(req, 'create', patternCreateParams).then(function (patternResponse) {
          var templateParams = {
            order: 0,
            create: true,
            name: (0, _libConvert_pattern_and_template_name.patternToTemplate)(indexPatternId),
            body: {
              template: indexPatternId,
              mappings: {
                _default_: {
                  dynamic_templates: [{
                    string_fields: {
                      match: '*',
                      match_mapping_type: 'string',
                      mapping: {
                        type: 'text',
                        fields: {
                          raw: { type: 'keyword', ignore_above: 256 }
                        }
                      }
                    }
                  }],
                  properties: mappings
                }
              }
            }
          };

          return callWithRequest(req, 'indices.putTemplate', templateParams)['catch'](function (templateError) {
            var deleteParams = {
              index: kibanaIndex,
              type: 'index-pattern',
              id: indexPatternId
            };

            return callWithRequest(req, 'delete', deleteParams).then(function () {
              throw templateError;
            }, function (patternDeletionError) {
              throw new Error('index-pattern ' + indexPatternId + ' created successfully but index template\n                creation failed. Failed to rollback index-pattern creation, must delete manually.\n                ' + patternDeletionError.toString() + '\n                ' + templateError.toString());
            });
          });
        });
      }).then(function () {
        reply().code(204);
      }, function (error) {
        reply((0, _libHandle_es_error2['default'])(error));
      });
    }
  });
};
