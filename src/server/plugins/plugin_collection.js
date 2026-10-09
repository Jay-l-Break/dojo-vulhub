'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _plugin_api = require('./plugin_api');

var _plugin_api2 = _interopRequireDefault(_plugin_api);

var _util = require('util');

var _lodash = require('lodash');

var _utilsCollection = require('../../utils/collection');

var _utilsCollection2 = _interopRequireDefault(_utilsCollection);

var byIdCache = Symbol('byIdCache');
var pluginApis = Symbol('pluginApis');

module.exports = (function (_Collection) {
  _inherits(Plugins, _Collection);

  function Plugins(kbnServer) {
    _classCallCheck(this, Plugins);

    _get(Object.getPrototypeOf(Plugins.prototype), 'constructor', this).call(this);
    this.kbnServer = kbnServer;
    this[pluginApis] = new Set();
  }

  _createClass(Plugins, [{
    key: 'new',
    value: _asyncToGenerator(function* (path) {
      var api = new _plugin_api2['default'](this.kbnServer, path);
      this[pluginApis].add(api);

      var output = [].concat(require(path)(api) || []);
      var config = this.kbnServer.config;

      if (!output.length) return;

      // clear the byIdCache
      this[byIdCache] = null;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = output[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var product = _step.value;

          if (product instanceof api.Plugin) {
            var plugin = product;
            this.add(plugin);

            var enabled = yield plugin.readConfig();
            if (!enabled) this['delete'](plugin);
            continue;
          }

          throw new TypeError('unexpected plugin export ' + (0, _util.inspect)(product));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    })
  }, {
    key: 'getPluginApis',
    value: function getPluginApis() {
      return this[pluginApis];
    }
  }, {
    key: 'byId',
    get: function get() {
      return this[byIdCache] || (this[byIdCache] = (0, _lodash.indexBy)([].concat(_toConsumableArray(this)), 'id'));
    }
  }]);

  return Plugins;
})(_utilsCollection2['default']);
