import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import WindiCSS from 'vite-plugin-windicss'
import styleImport, {
    AntdResolve,
} from 'vite-plugin-style-import'

// https://vitejs.dev/config/
export default defineConfig({
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            }
        }
    },
    plugins: [react(), WindiCSS(), styleImport({ resolves: [AntdResolve()] })]
})
