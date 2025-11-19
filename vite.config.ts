import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/sh/',
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // chunkSizeWarningLimit: 1000, // 打包文件大小限制
    rollupOptions: { // 打包配置
      output: { // 
        manualChunks(id) { // 手动分包
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString(); // 根据node_modules中的包名进行分包
          }
        }
      }
    }
  },
})
