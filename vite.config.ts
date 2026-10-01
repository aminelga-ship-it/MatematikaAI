import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { config } from 'dotenv';

config({ path: '.local.env' });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'visit-analytics-dev',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const pathname = (req.url ?? '').split('?')[0];
          if (pathname !== '/api/analytics') {
            next();
            return;
          }

          void (async () => {
            try {
              const { handleAnalytics } = (await server.ssrLoadModule(
                '/api/_lib/analyticsHandler.ts',
              )) as typeof import('./api/_lib/analyticsHandler');
              const chunks: Buffer[] = [];
              for await (const chunk of req) chunks.push(Buffer.from(chunk));
              const raw = Buffer.concat(chunks).toString('utf8');
              let body: unknown = undefined;
              if (raw) {
                try {
                  body = JSON.parse(raw) as unknown;
                } catch {
                  body = null;
                }
              }
              const header = req.headers['x-analytics-key'];
              const origin = req.headers.origin;
              const result = await handleAnalytics({
                method: req.method,
                body,
                key: Array.isArray(header) ? header[0] : header,
                origin: Array.isArray(origin) ? origin[0] : origin,
              });
              res.statusCode = result.status;
              res.setHeader('Cache-Control', 'no-store');
              if (result.body === undefined) {
                res.end();
                return;
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result.body));
            } catch (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'server', message: error instanceof Error ? error.message : 'error' }));
            }
          })();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
