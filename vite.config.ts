import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    // Tenta carregar de várias fontes para garantir compatibilidade com o ambiente compartilhado
    const isValid = (k: any) => k && typeof k === 'string' && k.trim().length >= 20 && k.trim().startsWith('AIza') && k !== 'undefined' && k !== 'null';

    const rawKey = (
      env.GEMINI_API_KEY || 
      env.API_KEY || 
      process.env.GEMINI_API_KEY || 
      process.env.API_KEY || 
      ''
    ).trim();

    const apiKey = isValid(rawKey) ? rawKey : 'AIzaSyD4U_OMgB-1COKd4cI5hC3NxAslwetSsQY';

    console.log(`[Vite Build] Mode: ${mode}`);
    console.log(`[Vite Build] Final API Key detected: ${apiKey ? 'Yes (starts with ' + apiKey.substring(0, 4) + '...)' : 'No'}`);
    
    return {
      server: {
        port: 3000,
        host: true,
      },
      plugins: [
        react(),
        tailwindcss(),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
