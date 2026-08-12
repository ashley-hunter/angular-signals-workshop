import { defineConfig } from 'vite'
import { angular } from '@oxc-angular/vite'

export default defineConfig({
  plugins: [angular({ tsconfig: './tsconfig.json' })],
  // Vite's dep hash is stable across restarts, so the browser kept serving stale
  // copies of Slidev's generated setup modules - which silently disabled every
  // client-side setup (shiki theme, monaco, style.css).
  server: { headers: { 'Cache-Control': 'no-store' } },
})
