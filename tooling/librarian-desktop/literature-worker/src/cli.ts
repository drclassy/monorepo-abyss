import { parseArgs } from 'node:util'

import { startLiteratureWorker } from './server.js'

async function checkHealth(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/health`)
    return response.ok
  } catch {
    return false
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      host: { type: 'string' },
      port: { type: 'string' },
    },
  })

  const host = values.host ?? process.env.LITERATURE_WORKER_HOST ?? '127.0.0.1'
  const port = values.port ? Number(values.port) : undefined

  let worker: Awaited<ReturnType<typeof startLiteratureWorker>> | undefined
  try {
    worker = await startLiteratureWorker({ host, port })
  } catch (error) {
    const isAddressInUse = error instanceof Error && (error as NodeJS.ErrnoException).code === 'EADDRINUSE'
    const baseUrl = `http://${host}:${port ?? Number(process.env.LITERATURE_WORKER_PORT ?? 8787)}`

    if (isAddressInUse && (await checkHealth(baseUrl))) {
      console.log(`Literature worker already running at ${baseUrl}`)
      return
    }

    throw error
  }

  console.log(`Literature worker ready at ${worker.url}`)

  process.on('SIGINT', async () => {
    await worker.close()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await worker.close()
    process.exit(0)
  })
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})

