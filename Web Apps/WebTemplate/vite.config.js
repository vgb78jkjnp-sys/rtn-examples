/**
 * Vite configuration for the WebTemplate project
 * The base path follows the application ID configured in application.config.js.
 */
import { appConfig } from './src/config/application.config.js'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: `/apps/${appConfig.applicationId}/`
})
