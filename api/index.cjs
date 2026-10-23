const path = require('path');
const appModule = require(path.join(__dirname, 'server.cjs'));
const app = appModule.default || appModule;

module.exports = (req, res) => {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};
