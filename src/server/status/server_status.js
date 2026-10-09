'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _states = require('./states');

var _states2 = _interopRequireDefault(_states);

var _status = require('./status');

var _status2 = _interopRequireDefault(_status);

module.exports = (function () {
  function ServerStatus(server) {
    _classCallCheck(this, ServerStatus);

    this.server = server;
    this._created = {};
  }

  _createClass(ServerStatus, [{
    key: 'create',
    value: function create(name) {
      return this._created[name] = new _status2['default'](name, this.server);
    }
  }, {
    key: 'each',
    value: function each(fn) {
      var self = this;
      _lodash2['default'].forOwn(self._created, function (status, i, list) {
        if (status.state !== 'disabled') {
          fn.call(self, status, i, list);
        }
      });
    }
  }, {
    key: 'get',
    value: function get(name) {
      return this._created[name];
    }
  }, {
    key: 'getState',
    value: function getState(name) {
      return _lodash2['default'].get(this._created, [name, 'state'], 'uninitialized');
    }
  }, {
    key: 'overall',
    value: function overall() {
      var state = (0, _lodash2['default'])(this._created).map(function (status) {
        return _states2['default'].get(status.state);
      }).sortBy('severity').pop();

      var statuses = _lodash2['default'].where(this._created, { state: state.id });
      var since = _lodash2['default'].get(_lodash2['default'].sortBy(statuses, 'since'), [0, 'since']);

      return {
        state: state.id,
        title: state.title,
        nickname: _lodash2['default'].sample(state.nicknames),
        icon: state.icon,
        since: since
      };
    }
  }, {
    key: 'isGreen',
    value: function isGreen() {
      return this.overall().state === 'green';
    }
  }, {
    key: 'notGreen',
    value: function notGreen() {
      return !this.isGreen();
    }
  }, {
    key: 'toString',
    value: function toString() {
      var overall = this.overall();
      return overall.title + ' – ' + overall.nickname;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return {
        overall: this.overall(),
        statuses: _lodash2['default'].values(this._created)
      };
    }
  }]);

  return ServerStatus;
})();
