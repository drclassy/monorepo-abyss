/**
 * Copyright 2026 Google LLC
 *
 * Sentra AI Hybrid Brain - Vertex AI Search (Discovery Engine) Connector
 * Project: abyss-monorepo
 * Managed by Jen (Sentra Adjutant)
 */

import { SearchServiceClient } from '@google-cloud/discoveryengine'
import * as dotenv from 'dotenv'

import { resolveProjectId } from './internal/gcp-project'
import {
  mapMedicalKnowledgeResults,
  type MedicalKnowledgeSearchResponse,
} from './internal/medical-knowledge-map'

dotenv.config()

export interface SearchConfig {
  projectId: string
  location: string
  dataStoreId: string
  servingConfigId?: string
  pageSize?: number
}

export class VertexSearchConnector {
  private client: SearchServiceClient
  private projectId: string
  private location: string
  private dataStoreId: string
  private servingConfigId: string
  private pageSize: number

  constructor(config?: Partial<SearchConfig>) {
    this.projectId = resolveProjectId(config?.projectId)
    this.location = config?.location || process.env.GCP_LOCATION || 'global'
    this.dataStoreId =
      config?.dataStoreId ||
      process.env.VERTEX_SEARCH_DATASTORE_ID ||
      'gcs-medical-vault-connector_1776770095927_gcs_store'
    this.servingConfigId = config?.servingConfigId || 'default_search'
    this.pageSize = Math.max(1, Math.min(config?.pageSize ?? 5, 20))

    const apiEndpoint =
      this.location === 'global'
        ? 'discoveryengine.googleapis.com'
        : `${this.location}-discoveryengine.googleapis.com`

    this.client = new SearchServiceClient({ apiEndpoint })
  }

  /**
   * Melakukan query ke Vertex AI Search (Discovery Engine)
   */
  async search(query: string): Promise<MedicalKnowledgeSearchResponse> {
    const timestamp = new Date().toISOString()
    const trimmed = query.trim()

    if (!trimmed) {
      return {
        status: 'ERROR',
        query: '',
        answer: 'Query kosong.',
        hits: [],
        citations: [],
        timestamp,
        error: 'query_required',
      }
    }

    const servingConfig = `projects/${this.projectId}/locations/${this.location}/collections/default_collection/dataStores/${this.dataStoreId}/servingConfigs/${this.servingConfigId}`

    console.log(`[Jen] Searching Medical Knowledge Base for: "${trimmed.substring(0, 50)}..."`)

    try {
      const request: any = {
        servingConfig,
        query: trimmed,
        pageSize: this.pageSize,
        contentSearchSpec: {
          snippetSpec: {
            returnSnippet: true,
          },
        },
      }

      const [results] = await this.client.search(request, { autoPaginate: false })
      const mapped = mapMedicalKnowledgeResults(results as any[], {
        query: trimmed,
        maxHits: this.pageSize,
      })

      return mapped
    } catch (error) {
      console.error('[Jen] Vertex Search Failed:', error)
      return {
        status: 'ERROR',
        query: trimmed,
        answer: 'Maaf Chief, saya gagal mengakses database jurnal medis.',
        hits: [],
        citations: [],
        timestamp,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }
}
