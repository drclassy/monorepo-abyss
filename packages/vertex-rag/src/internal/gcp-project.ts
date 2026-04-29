export const TARGET_GCP_PROJECT_ID = 'abyss-monorepo'

const PROJECT_ENV_KEYS = ['GCP_PROJECT_ID', 'GOOGLE_PROJECT_ID', 'GOOGLE_CLOUD_PROJECT'] as const

export function resolveProjectId(explicitProjectId?: string): string {
  if (explicitProjectId) {
    return explicitProjectId
  }

  for (const key of PROJECT_ENV_KEYS) {
    const value = process.env[key]
    if (value) {
      return value
    }
  }

  throw new Error(
    `GCP Project ID is not set. Define one of: ${PROJECT_ENV_KEYS.join(', ')}. Expected active project: ${TARGET_GCP_PROJECT_ID}.`,
  )
}
