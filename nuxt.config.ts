// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["@/assets/css/main.css"],

  // Enable auto-import of components without path prefix, so
  // components like components/form/payment/AddPayment.vue
  // can be used as <AddPayment /> in templates.
  components: {
    dirs: [
      {
        path: "@/components",
        pathPrefix: false,
      },
    ],
  },

  runtimeConfig: {
    exnestApiKey: process.env.API_KEY},

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["xlsx"],
    },
  },

  nitro: {
    preset: "vercel",
    experimental: {
      wasm: true,
    },
    rollupConfig: {
      external: ["xlsx"],
    },
  },

  modules: ["shadcn-nuxt"],

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "@/components/ui",
  },
});
