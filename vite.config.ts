import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Style-diary-app/',
  plugins: [react()],
})
// This is a comment to force a sync
