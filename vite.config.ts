import { defineConfig } from "vite";
// import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger"; // Descomentado
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "0.0.0.0", // Alterado para 0.0.0.0
    port: 8080,
  },
  plugins: [/* dyadComponentTagger(), */ react()], // dyadComponentTagger() desativado temporariamente
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));