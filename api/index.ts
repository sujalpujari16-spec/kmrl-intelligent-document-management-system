import app from '../server';

export default function handler(req: any, res: any) {
  // Ensure req.url preserves the /api prefix for Express router
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
