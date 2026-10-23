export default async function handler(req: any, res: any) {
  try {
    const { default: app } = await import('../server');
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
