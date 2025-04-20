import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://aumoashaknqprxoacpaj.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bW9hc2hha25xcHJ4b2FjcGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMzk1NjQsImV4cCI6MjA1ODcxNTU2NH0.YbyomV0gdU0YocqwXRGS3IFxVUFdmhEaL9AexAvcHmc')
  }
})