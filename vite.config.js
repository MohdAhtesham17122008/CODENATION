import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleChatRequest } from './api/chat.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'api-chat-dev-middleware',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            let bodyStr = ''
            req.on('data', (chunk) => {
              bodyStr += chunk
            })
            req.on('end', async () => {
              try {
                const body = bodyStr ? JSON.parse(bodyStr) : {}
                const mergedEnv = { ...process.env, ...env }
                const result = await handleChatRequest(body, mergedEnv)
                const statusCode = result.status || 200
                delete result.status
                res.statusCode = statusCode
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(result))
              } catch (err) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(
                  JSON.stringify({
                    error: 'Internal server error processing AI request',
                  })
                )
              }
            })
          })
        },
      },
    ],
    server: {
      port: 5173,
      open: true,
    },
  }
})

