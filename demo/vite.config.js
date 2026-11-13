import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Every `dayjs` import (ours and MUI's AdapterDayjs) is redirected to the vendored source tree.
const variant = process.env.DAYJS_VARIANT || 'before'
const root = resolve(__dirname, 'vendor', variant, 'src')
const meta = JSON.parse(readFileSync(resolve(__dirname, 'vendor', variant, 'meta.json'), 'utf8'))

export default defineConfig({
  base: './',
  plugins: [react()],
  define: { __DAYJS_BUILD__: JSON.stringify(meta) },
  resolve: {
    alias: [
      { find: /^dayjs$/, replacement: `${root}/index.js` },
      { find: /^dayjs\/plugin\/([^/.]+)(\.js)?$/, replacement: `${root}/plugin/$1/index.js` },
      { find: /^dayjs\/locale\/([^/.]+)(\.js)?$/, replacement: `${root}/locale/$1.js` }
    ]
  }
})
