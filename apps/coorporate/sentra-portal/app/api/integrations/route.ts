// Architected and built by Claudesy.

import { type NextRequest, NextResponse } from 'next/server'
import {
  addIntegration,
  deleteIntegration,
  findIntegrationById,
  getIntegrations,
  type Integration,
  updateIntegration,
} from '@/lib/integrations-store'

// GET /api/integrations - List all integrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    let filteredIntegrations = [...getIntegrations()]

    if (type) {
      filteredIntegrations = filteredIntegrations.filter(i => i.type === type)
    }

    if (status) {
      filteredIntegrations = filteredIntegrations.filter(i => i.status === status)
    }

    return NextResponse.json({
      success: true,
      data: filteredIntegrations,
      meta: {
        total: filteredIntegrations.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}

// POST /api/integrations - Create a new integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, provider, description, config } = body

    // Validation
    if (!name || !type || !provider) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, type, provider',
        },
        { status: 400 }
      )
    }

    const validTypes = ['vector-db', 'ai-provider', 'storage', 'messaging', 'monitoring']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      )
    }

    const newIntegration: Integration = {
      id: crypto.randomUUID(),
      name,
      type,
      provider,
      description: description || '',
      config: config || {},
      status: 'disconnected',
      lastSync: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addIntegration(newIntegration)

    return NextResponse.json({ success: true, data: newIntegration }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create integration' },
      { status: 500 }
    )
  }
}

// PATCH /api/integrations - Update an integration
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Integration ID is required' },
        { status: 400 }
      )
    }

    const updated = updateIntegration(id, updates)
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Integration not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update integration' },
      { status: 500 }
    )
  }
}

// DELETE /api/integrations - Delete an integration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Integration ID is required' },
        { status: 400 }
      )
    }

    const deleted = deleteIntegration(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Integration not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: deleted,
      message: 'Integration deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete integration' },
      { status: 500 }
    )
  }
}

// POST /api/integrations/test - Test an integration connection
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action } = body

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: 'Integration ID and action are required' },
        { status: 400 }
      )
    }

    const integration = findIntegrationById(id)
    if (!integration) {
      return NextResponse.json({ success: false, error: 'Integration not found' }, { status: 404 })
    }

    switch (action) {
      case 'test': {
        // Simulate connection test
        const isSuccess = Math.random() > 0.2 // 80% success rate for demo
        return NextResponse.json({
          success: isSuccess,
          data: {
            integrationId: id,
            status: isSuccess ? 'connected' : 'error',
            latency: Math.floor(Math.random() * 200) + 50,
            message: isSuccess ? 'Connection test successful' : 'Connection test failed',
            timestamp: new Date().toISOString(),
          },
        })
      }

      case 'connect':
        integration.status = 'connected'
        integration.lastSync = new Date().toISOString()
        integration.updatedAt = new Date().toISOString()
        return NextResponse.json({
          success: true,
          data: integration,
          message: 'Integration connected successfully',
        })

      case 'disconnect':
        integration.status = 'disconnected'
        integration.lastSync = null
        integration.updatedAt = new Date().toISOString()
        return NextResponse.json({
          success: true,
          data: integration,
          message: 'Integration disconnected successfully',
        })

      case 'sync':
        integration.status = 'syncing'
        integration.updatedAt = new Date().toISOString()
        // Simulate sync completion after delay would happen in real implementation
        return NextResponse.json({
          success: true,
          data: integration,
          message: 'Sync initiated',
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action. Must be: test, connect, disconnect, sync',
          },
          { status: 400 }
        )
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to perform action' }, { status: 500 })
  }
}
