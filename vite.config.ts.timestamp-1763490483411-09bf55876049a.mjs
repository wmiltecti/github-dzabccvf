// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src")
      // <-- habilita import '@/...'
    }
  },
  optimizeDeps: {
    // manter seu exclude
    exclude: ["lucide-react"],
    // turf modular pré-empacotado p/ dev
    include: ["@turf/buffer", "@turf/helpers", "@turf/difference", "@turf/area", "@turf/length"]
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: void 0
        // Desabilita chunking manual que pode causar problemas
      }
    },
    // Gera sourcemaps para debug em produção
    sourcemap: false,
    // Aumenta o limite de warning para chunks grandes
    chunkSizeWarningLimit: 1e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgYmFzZTogJy4vJyxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjJyksIC8vIDwtLSBoYWJpbGl0YSBpbXBvcnQgJ0AvLi4uJ1xuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIC8vIG1hbnRlciBzZXUgZXhjbHVkZVxuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gICAgLy8gdHVyZiBtb2R1bGFyIHByXHUwMEU5LWVtcGFjb3RhZG8gcC8gZGV2XG4gICAgaW5jbHVkZTogWydAdHVyZi9idWZmZXInLCAnQHR1cmYvaGVscGVycycsICdAdHVyZi9kaWZmZXJlbmNlJywgJ0B0dXJmL2FyZWEnLCAnQHR1cmYvbGVuZ3RoJ10sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHVuZGVmaW5lZCwgLy8gRGVzYWJpbGl0YSBjaHVua2luZyBtYW51YWwgcXVlIHBvZGUgY2F1c2FyIHByb2JsZW1hc1xuICAgICAgfSxcbiAgICB9LFxuICAgIC8vIEdlcmEgc291cmNlbWFwcyBwYXJhIGRlYnVnIGVtIHByb2R1XHUwMEU3XHUwMEUzb1xuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgLy8gQXVtZW50YSBvIGxpbWl0ZSBkZSB3YXJuaW5nIHBhcmEgY2h1bmtzIGdyYW5kZXNcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBR2pCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxRQUFRLElBQUksR0FBRyxLQUFLO0FBQUE7QUFBQSxJQUN4QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWM7QUFBQTtBQUFBLElBRVosU0FBUyxDQUFDLGNBQWM7QUFBQTtBQUFBLElBRXhCLFNBQVMsQ0FBQyxnQkFBZ0IsaUJBQWlCLG9CQUFvQixjQUFjLGNBQWM7QUFBQSxFQUM3RjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLFdBQVc7QUFBQTtBQUFBLElBRVgsdUJBQXVCO0FBQUEsRUFDekI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
