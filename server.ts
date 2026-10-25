import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory cache for Wallhaven API responses to avoid rate limits (45 req/min)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

// Proxy endpoint for Wallhaven anime wallpapers search
app.get('/api/wallpapers/search', async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const userKeyword = ((req.query.q as string) || '').trim();
    const sorting = (req.query.sorting as string) || '';

    // Always enforce base query: +'anime boys' -'anime girls'
    const BASE_ANIME_BOYS_QUERY = '+"anime boys" -"anime girls"';
    const fullQuery = userKeyword
      ? `${BASE_ANIME_BOYS_QUERY} ${userKeyword}`
      : BASE_ANIME_BOYS_QUERY;

    // STRICT SFW, Anime & Anime Boys enforcement:
    // categories=010 (Anime only)
    // purity=100 (SFW only)
    // ratios=portrait
    const url = new URL('https://wallhaven.cc/api/v1/search');
    url.searchParams.set('categories', '010');
    url.searchParams.set('purity', '100');
    url.searchParams.set('ratios', 'portrait');
    url.searchParams.set('q', fullQuery);
    url.searchParams.set('page', page.toString());

    if (sorting) {
      url.searchParams.set('sorting', sorting);
      if (sorting === 'toplist' && !req.query.topRange) {
        url.searchParams.set('topRange', '1y');
      }
    } else if (!userKeyword) {
      // Default to favorites for rich variety and multiple pages of infinite scroll
      url.searchParams.set('sorting', 'favorites');
    }

    const cacheKey = url.toString();
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json(cached.data);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'DepthWallpaper-Android/1.0 (JetpackCompose-Client)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `Wallhaven API error: ${response.statusText}`,
        details: errText,
      });
    }

    const data = await response.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });

    // Clean old cache entries
    if (cache.size > 100) {
      const now = Date.now();
      for (const [key, val] of cache.entries()) {
        if (now - val.timestamp > CACHE_TTL_MS) {
          cache.delete(key);
        }
      }
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching wallpapers:', error);
    res.status(500).json({
      error: 'Failed to fetch wallpapers from Wallhaven',
      message: error.message || 'Unknown network error',
    });
  }
});

// Proxy download endpoint to save full-size wallpapers directly to the gallery/device
app.get('/api/wallpapers/download', async (req: Request, res: Response) => {
  try {
    const fileUrl = req.query.url as string;
    const filename = (req.query.filename as string) || 'depth_wallpaper.jpg';

    if (!fileUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    // SSRF validation: only permit wallhaven media CDN domains
    const parsed = new URL(fileUrl);
    if (!parsed.hostname.endsWith('wallhaven.cc')) {
      return res.status(403).json({ error: 'Untrusted domain' });
    }

    const response = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'DepthWallpaper-Android/1.0 (JetpackCompose-Client)',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch wallpaper image');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('Download proxy error:', error);
    res.status(500).send('Failed to download image');
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Depth Wallpaper server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
