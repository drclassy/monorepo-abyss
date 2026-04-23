/**
 * Vertex AI Embedding Provider
 *
 * Auth   : GCP IAM via Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS)
 * Model  : text-embedding-004 (768 dimensions)
 * Endpoint: Vertex AI Prediction Service — NOT the Gemini REST API
 * Compliance: HIPAA-eligible via Google Cloud Data Processing Addendum
 *
 * @see https://cloud.google.com/vertex-ai/generative-ai/docs/embeddings/get-text-embeddings
 */
// ─── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-004'
export const DEFAULT_EMBEDDING_DIMENSIONS = 768
export const DEFAULT_GCP_LOCATION = 'us-central1'

// ─── Types ────────────────────────────────────────────────────────────────────

export type EmbeddingTaskType =
  | 'RETRIEVAL_DOCUMENT'
  | 'RETRIEVAL_QUERY'
  | 'SEMANTIC_SIMILARITY'
  | 'CLASSIFICATION'


interface GoogleAccessTokenResponse {
  token?: string | null
}

interface GoogleAuthClient {
  getAccessToken(): Promise<GoogleAccessTokenResponse | string | null>
}

interface GoogleAuthInstance {
  getClient(): Promise<GoogleAuthClient>
}

type GoogleAuthConstructor = new (options: { scopes: string[] }) => GoogleAuthInstance

let authPromise: Promise<GoogleAuthInstance> | null = null

async function getAuth(): Promise<GoogleAuthInstance> {
  authPromise ??= loadGoogleAuth()
  return authPromise
}

async function loadGoogleAuth(): Promise<GoogleAuthInstance> {
  const dynamicImport = new Function('specifier', 'return import(specifier)') as (
    specifier: string,
  ) => Promise<{ GoogleAuth: GoogleAuthConstructor }>
  const { GoogleAuth } = await dynamicImport('google-auth-library')

  return new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  })
}

function accessTokenValue(tokenResponse: GoogleAccessTokenResponse | string | null): string | null {
  if (typeof tokenResponse === 'string') return tokenResponse
  return tokenResponse?.token ?? null
}

// ─── Auth (singleton — reuses token cache across requests) ────────────────────

export interface EmbeddingOptions {
  model?: string
  taskType?: EmbeddingTaskType
  gcpProjectId?: string
  gcpLocation?: string
}

// ─── Core function ────────────────────────────────────────────────────────────

/**
 * Generates a dense embedding vector via Vertex AI.
 * Authentication is resolved automatically from GOOGLE_APPLICATION_CREDENTIALS.
 *
 * @param text     - Input text to embed (max ~3072 tokens for text-embedding-004)
 * @param options  - Optional overrides for model, taskType, project, location
 * @returns        - Float array of length 768
 */
export async function getEmbedding(
  text: string,
  options: EmbeddingOptions = {},
): Promise<number[]> {
  const projectId = options.gcpProjectId ?? process.env.GCP_PROJECT_ID
  const location = options.gcpLocation ?? process.env.GCP_LOCATION ?? DEFAULT_GCP_LOCATION
  const model = options.model ?? DEFAULT_EMBEDDING_MODEL
  const taskType: EmbeddingTaskType = options.taskType ?? 'RETRIEVAL_DOCUMENT'

  if (!projectId) {
    throw new Error(
      '[vertex-provider] GCP_PROJECT_ID is not set. ' +
        'Add it to your .env file or pass gcpProjectId in options.',
    )
  }

  const endpoint =
    `https://${location}-aiplatform.googleapis.com/v1` +
    `/projects/${projectId}/locations/${location}` +
    `/publishers/google/models/${model}:predict`

  // Retrieve a short-lived bearer token via the Service Account credential
  const auth = await getAuth()
  const client = await auth.getClient()
  const token = accessTokenValue(await client.getAccessToken())

  if (!token) {
    throw new Error(
      '[vertex-provider] Failed to retrieve GCP access token. ' +
        'Check that GOOGLE_APPLICATION_CREDENTIALS points to a valid Service Account key.',
    )
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instances: [{ content: text, task_type: taskType }],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `[vertex-provider] Vertex AI request failed (${response.status}): ${errorBody}`,
    )
  }

  const data = await response.json()
  const values: number[] | undefined = data?.predictions?.[0]?.embeddings?.values

  if (!values || values.length === 0) {
    throw new Error(
      `[vertex-provider] Unexpected response shape: ${JSON.stringify(data)}`,
    )
  }

  return values
}
