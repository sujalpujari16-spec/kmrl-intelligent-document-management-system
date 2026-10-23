import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const appModule = require('./server.cjs');
const app = appModule.default || appModule;

export default function handler(req, res) {
  try {
    let resolvedUrl = req.url || '/';

    // 1. Recover original path when Vercel rewrites to /api/index
    const matchedPath = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'];
    if (matchedPath && matchedPath.startsWith('/api')) {
      resolvedUrl = matchedPath;
    } else if (req.query && req.query.__path) {
      resolvedUrl = '/api/' + req.query.__path;
    } else if (resolvedUrl === '/api/index' || resolvedUrl.startsWith('/api/index?') || resolvedUrl === '/api' || resolvedUrl.startsWith('/api?')) {
      if (req.headers['x-now-route-matches']) {
        const match = req.headers['x-now-route-matches'].match(/1=([^&]+)/);
        if (match) {
          resolvedUrl = '/api/' + decodeURIComponent(match[1]);
        }
      }
    }

    // 2. Ensure /api prefix is preserved for Express routes
    if (!resolvedUrl.startsWith('/api')) {
      resolvedUrl = '/api' + (resolvedUrl.startsWith('/') ? resolvedUrl : '/' + resolvedUrl);
    }
    req.url = resolvedUrl;

    return app(req, res);
  } catch (err) {
    console.error('[KMRL Vercel Function Exception]:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'KMRL Serverless Execution Error',
        message: err?.message || String(err),
      });
    }
  }
}
