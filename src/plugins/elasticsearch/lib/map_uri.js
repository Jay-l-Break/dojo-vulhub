'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _url = require('url');

var _filter_headers = require('./filter_headers');

var _filter_headers2 = _interopRequireDefault(_filter_headers);

module.exports = function mapUri(server, prefix) {

  var config = server.config();
  return function (request, done) {
    var path = request.path.replace('/elasticsearch', '');
    var url = config.get('elasticsearch.url');
    if (path) {
      if (/\/$/.test(url)) url = url.substring(0, url.length - 1);
      url += path;
    }
    var query = _querystring2['default'].stringify(request.query);
    if (query) url += '?' + query;
    var filteredHeaders = (0, _filter_headers2['default'])(request.headers, server.config().get('elasticsearch.requestHeadersWhitelist'));
    done(null, url, filteredHeaders);
  };
};
