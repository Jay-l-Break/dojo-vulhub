'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

module.exports = function initDefaultFieldProps(fields) {
  if (fields === undefined || !_lodash2['default'].isArray(fields)) {
    throw new Error('requires an array argument');
  }

  var results = [];

  _lodash2['default'].forEach(fields, function (field) {
    var newField = _lodash2['default'].cloneDeep(field);
    results.push(newField);

    if (newField.type === 'string') {
      _lodash2['default'].defaults(newField, {
        indexed: true,
        analyzed: true,
        doc_values: false,
        scripted: false,
        count: 0
      });

      results.push({
        name: newField.name + '.raw',
        type: 'string',
        indexed: true,
        analyzed: false,
        doc_values: true,
        scripted: false,
        count: 0
      });
    } else {
      _lodash2['default'].defaults(newField, {
        indexed: true,
        analyzed: false,
        doc_values: true,
        scripted: false,
        count: 0
      });
    }
  });

  return results;
};
