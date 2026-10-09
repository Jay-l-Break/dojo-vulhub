module.exports = {
  mongodb: {
    server: process.env.ME_CONFIG_MONGODB_SERVER || 'localhost',
    port: 27017,
    autoReconnect: true,
    poolSize: 4,
    admin: false,
    auth: [{ database: 'test' }],
    whitelist: [],
    blacklist: [],
  },
  site: {
    baseUrl: '/',
    port: Number(process.env.VCAP_APP_PORT || 80),
    cookieSecret: 'demo-cookie-secret',
    sessionSecret: 'demo-session-secret',
  },
  options: {
    documentsPerPage: 10,
    editorTheme: 'rubyblue',
    cmdType: 'eval',
    subprocessTimeout: 300,
  },
};
