import type {
  HarvestRunResult,
  HarvesterConfig,
  LiteratureSearchOptions,
} from '@the-abyss/literature-harvester'

export interface HarvestJobRequest extends LiteratureSearchOptions {
  query: string
}

export interface LiteratureWorkerConfig {
  host?: string
  port?: number
  harvesterConfig?: HarvesterConfig
}

export interface LiteratureWorkerHandle {
  host: string
  port: number
  url: string
  close: () => Promise<void>
}

export interface LiteratureWorkerHealth {
  status: 'ok'
  service: 'literature-worker'
}

export type LiteratureWorkerHarvestResponse = HarvestRunResult

export interface LiteratureWorkerErrorResponse {
  error: string
}
