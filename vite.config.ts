import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Puerto FIJO para que VITE_TENANT_APP_URL del broker (puerto 5174)
// siempre apunte aquí. strictPort=true rompe el arranque si 5174 está
// ocupado — preferible un error claro a que la app caiga en otro
// puerto y la liga del broker quede colgada.
export default defineConfig({
  plugins: [react()],
  server: { port: 5174, strictPort: true },
})
