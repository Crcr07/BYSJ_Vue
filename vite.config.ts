import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 🌟 新增下面这段 server 配置，用来代理请求到你的 Spring Boot 后端
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 你的 Spring Boot 地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // 把 /api 替换为空
      }
    }
  }
})