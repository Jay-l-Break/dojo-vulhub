'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _serverRoutesApiIngest = require('./server/routes/api/ingest');

var _serverRoutesApiIngest2 = _interopRequireDefault(_serverRoutesApiIngest);

var _serverRoutesApiSearch = require('./server/routes/api/search');

var _serverRoutesApiSearch2 = _interopRequireDefault(_serverRoutesApiSearch);

module.exports = function (kibana) {
  return new kibana.Plugin({
    id: 'kibana',
    config: function config(Joi) {
      return Joi.object({
        enabled: Joi.boolean()['default'](true),
        defaultAppId: Joi.string()['default']('discover'),
        index: Joi.string()['default']('.kibana')
      })['default']();
    },

    uiExports: {
      app: {
        id: 'kibana',
        title: 'Kibana',
        listed: false,
        description: 'the kibana you know and love',
        //icon: 'plugins/kibana/settings/sections/about/barcode.svg',
        main: 'plugins/kibana/kibana',
        uses: ['visTypes', 'spyModes', 'fieldFormats', 'navbarExtensions', 'settingsSections', 'docViews'],

        injectVars: function injectVars(server, options) {
          var config = server.config();

          return {
            kbnDefaultAppId: config.get('kibana.defaultAppId')
          };
        }
      },

      links: [{
        title: 'Discover',
        order: -1003,
        url: '/app/kibana#/discover',
        description: 'interactively explore your data',
        icon: 'plugins/kibana/assets/discover.svg'
      }, {
        title: 'Visualize',
        order: -1002,
        url: '/app/kibana#/visualize',
        description: 'design data visualizations',
        icon: 'plugins/kibana/assets/visualize.svg'
      }, {
        title: 'Dashboard',
        order: -1001,
        url: '/app/kibana#/dashboard',
        description: 'compose visualizations for much win',
        icon: 'plugins/kibana/assets/dashboard.svg'
      }, {
        title: 'Settings',
        order: 1000,
        url: '/app/kibana#/settings',
        description: 'define index patterns, change config, and more',
        icon: 'plugins/kibana/assets/settings.svg'
      }],
      injectDefaultVars: function injectDefaultVars(server, options) {
        return {
          kbnIndex: options.index
        };
      }
    },

    init: function init(server, options) {
      (0, _serverRoutesApiIngest2['default'])(server);
      (0, _serverRoutesApiSearch2['default'])(server);
    }
  });
};
