import { createUnicomHttpServer } from './server.js'

const argPort = process.argv.find((value) => value.startsWith('--port='))?.split('=')[1]
const port = Number(argPort ?? process.env.UNICOM_SERVER_PORT ?? 4318)

createUnicomHttpServer({ port, seedDemo: true })
console.log(`UNICOM server listening on http://127.0.0.1:${port}`)
