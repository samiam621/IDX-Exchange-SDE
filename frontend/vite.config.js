import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  envPrefix: ['VITE_', 'REACT_APP_'], // Vite only exposes VITE_ by default
  server: {
  port: 3000,
  proxy:{
    '/api': 'http://localhost:5000',

  },
},
})

