import { createUnicomHttpServer } from '../src/server.js'

function parsePort(args: string[]): number {
  const flagIdx = args.indexOf('--port')
  if (flagIdx !== -1) {
    const val = args[flagIdx + 1]
    if (val) return parseInt(val, 10)
  }
  const inline = args.find((a) => a.startsWith('--port='))
  if (inline) {
    const val = inline.split('=')[1]
    if (val) return parseInt(val, 10)
  }
  return 59849
}

const port = parsePort(process.argv.slice(2))
createUnicomHttpServer(port)

console.log(`🛰️  UNICOM Hub running on http://localhost:${port}`)
console.log(`   MCP endpoint : http://localhost:${port}/mcp`)
console.log(`   Health check : http://localhost:${port}/health`)
console.log(`   Agent list   : http://localhost:${port}/agents`)
console.log(`   Send (HTTP)  : POST http://localhost:${port}/send`)
console.log(`\nPress Ctrl+C to stop.\n`)

process.on('SIGINT', () => {
  console.log('\nUNICOM Hub stopped.')
  process.exit(0)
})
