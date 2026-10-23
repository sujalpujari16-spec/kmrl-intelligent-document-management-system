export default async function handler(req: any, res: any) {
  try {
    let appModule: any;
    try {
      appModule = await import('../server.ts');
    } catch {
      try {
        appModule = await import('../server.js');
      } catch {
        appModule = await import('../dist/server.cjs');
      }
    }
    const app = appModule.default || appModule;

    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }
    return app(req, res);
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || String(err),
      stack: err?.stack,
      name: err?.name,
    });
  }
}
