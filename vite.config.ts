import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves project sites from /repo-name/
const base = process.env.GITHUB_PAGES === 'true' ? '/kids-learning/' : '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
