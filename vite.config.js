import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Custom plugin to handle inventory updates
const inventoryUpdaterPlugin = () => ({
  name: 'inventory-updater',
  configureServer(server) {
    server.middlewares.use('/update-inventory', async (req, res, next) => {
      if (req.method === 'POST') {
        console.log('🔄 Triggering inventory update...');
        const { spawn } = await import('child_process');
        
        const child = spawn('node', ['scripts/download-inventory.js'], {
          stdio: 'inherit',
          shell: true
        });

        child.on('close', (code) => {
          if (code === 0) {
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
          } else {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Update failed' }));
          }
        });
      } else {
        next();
      }
    });
  },
});

export default defineConfig({
  plugins: [react(), inventoryUpdaterPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.easybroker.com/v1',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
