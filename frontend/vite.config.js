import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://backend:5001', // Docker servis adını kullanıyoruz
        changeOrigin: true,
      }
    }
  }
}) // <--- BU PARANTEZ VE SÜSLÜ PARANTEZİN EKSİK OLMADIĞINDAN EMİN OL