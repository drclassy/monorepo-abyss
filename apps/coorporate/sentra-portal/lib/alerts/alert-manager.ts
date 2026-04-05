/**
 * PORTAL Sentra — Alert Manager
 * Manages alert detection, notifications, and persistence
 */

import 'server-only'

// ============================================================================
// Types
// ============================================================================

export interface AlertRule {
  id: string
  name: string
  description: string
  type: 'threshold' | 'pattern' | 'health'
  source: 'system' | 'railway' | 'sentry' | 'docker'
  enabled: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  conditions: AlertCondition[]
  cooldownMinutes: number // Prevent alert spam
  notificationChannels: NotificationChannel[]
}

export interface AlertCondition {
  metric: string
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne'
  threshold: number
  duration?: number // seconds - must be sustained
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook'
  enabled: boolean
  config: Record<string, any>
}

export interface Alert {
  id: string
  ruleId: string
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  status: 'active' | 'acknowledged' | 'resolved'
  createdAt: Date
  acknowledgedAt?: Date
  resolvedAt?: Date
  acknowledgedBy?: string
  metadata: Record<string, any>
  lastNotification?: Date
}

export interface AlertSummary {
  total: number
  active: number
  acknowledged: number
  resolved: number
  bySeverity: Record<string, number>
  bySource: Record<string, number>
  recent: Alert[]
}

// ============================================================================
// Alert Manager Class
// ============================================================================

export class AlertManager {
  private rules: AlertRule[] = []
  private activeAlerts: Map<string, Alert> = new Map()
  private lastCheck: Date = new Date()

  constructor() {
    this.initializeDefaultRules()
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    this.rules = [
      // System alerts
      {
        id: 'system-high-cpu',
        name: 'High CPU Usage',
        description: 'System CPU usage exceeds threshold',
        type: 'threshold',
        source: 'system',
        enabled: true,
        severity: 'high',
        conditions: [
          {
            metric: 'cpu.usage',
            operator: 'gte',
            threshold: 80,
            duration: 300,
          },
        ],
        cooldownMinutes: 15,
        notificationChannels: [
          {
            type: 'email',
            enabled: true,
            config: { recipients: ['admin@sentra.ai'] },
          },
        ],
      },
      {
        id: 'system-high-memory',
        name: 'High Memory Usage',
        description: 'System memory usage exceeds threshold',
        type: 'threshold',
        source: 'system',
        enabled: true,
        severity: 'high',
        conditions: [
          {
            metric: 'memory.usage',
            operator: 'gte',
            threshold: 85,
            duration: 300,
          },
        ],
        cooldownMinutes: 15,
        notificationChannels: [
          {
            type: 'email',
            enabled: true,
            config: { recipients: ['admin@sentra.ai'] },
          },
        ],
      },
      // Railway alerts
      {
        id: 'railway-service-down',
        name: 'Railway Service Down',
        description: 'Railway service health is unhealthy',
        type: 'health',
        source: 'railway',
        enabled: true,
        severity: 'critical',
        conditions: [
          { metric: 'service.health', operator: 'eq', threshold: 0 }, // 0 = unhealthy
        ],
        cooldownMinutes: 5,
        notificationChannels: [
          {
            type: 'email',
            enabled: true,
            config: { recipients: ['admin@sentra.ai', 'devops@sentra.ai'] },
          },
        ],
      },
      // Sentry alerts
      {
        id: 'sentry-high-error-rate',
        name: 'High Error Rate',
        description: 'Application error rate exceeds threshold',
        type: 'threshold',
        source: 'sentry',
        enabled: true,
        severity: 'high',
        conditions: [{ metric: 'errorRate', operator: 'gte', threshold: 5, duration: 600 }],
        cooldownMinutes: 10,
        notificationChannels: [
          {
            type: 'email',
            enabled: true,
            config: { recipients: ['admin@sentra.ai'] },
          },
        ],
      },
      {
        id: 'sentry-low-uptime',
        name: 'Low Uptime',
        description: 'Application uptime below threshold',
        type: 'threshold',
        source: 'sentry',
        enabled: true,
        severity: 'critical',
        conditions: [{ metric: 'uptime', operator: 'lt', threshold: 95, duration: 3600 }],
        cooldownMinutes: 30,
        notificationChannels: [
          {
            type: 'email',
            enabled: true,
            config: { recipients: ['admin@sentra.ai', 'devops@sentra.ai'] },
          },
        ],
      },
    ]
  }

  /**
   * Evaluate metrics against alert rules
   */
  async evaluateMetrics(metrics: Record<string, any>): Promise<Alert[]> {
    const newAlerts: Alert[] = []
    const now = new Date()

    for (const rule of this.rules) {
      if (!rule.enabled) continue

      try {
        const shouldTrigger = this.evaluateRule(rule, metrics)
        const existingAlert = this.activeAlerts.get(rule.id)

        if (shouldTrigger) {
          if (!existingAlert) {
            // Create new alert
            const alert: Alert = {
              id: `${rule.id}-${Date.now()}`,
              ruleId: rule.id,
              title: rule.name,
              message: this.generateAlertMessage(rule, metrics),
              severity: rule.severity,
              source: rule.source,
              status: 'active',
              createdAt: now,
              metadata: { metrics, rule },
            }

            this.activeAlerts.set(rule.id, alert)
            newAlerts.push(alert)

            // Send notifications
            await this.sendNotifications(alert, rule.notificationChannels)
          }
          // If alert already exists, don't create duplicate
        } else if (existingAlert) {
          // Alert condition no longer met, resolve it
          existingAlert.status = 'resolved'
          existingAlert.resolvedAt = now
          await this.persistAlert(existingAlert)
          this.activeAlerts.delete(rule.id)
        }
      } catch (error) {
        console.error(`[AlertManager] Error evaluating rule ${rule.id}:`, error)
      }
    }

    // Persist new alerts
    for (const alert of newAlerts) {
      await this.persistAlert(alert)
    }

    this.lastCheck = now
    return newAlerts
  }

  /**
   * Evaluate a single alert rule against metrics
   */
  private evaluateRule(rule: AlertRule, metrics: Record<string, any>): boolean {
    for (const condition of rule.conditions) {
      const metricValue = this.getMetricValue(metrics, condition.metric)
      const threshold = condition.threshold

      if (metricValue === undefined) continue

      const conditionMet = this.evaluateCondition(metricValue, condition.operator, threshold)

      if (conditionMet) {
        // Check cooldown period
        const existingAlert = this.activeAlerts.get(rule.id)
        if (existingAlert) {
          const timeSinceLast = Date.now() - existingAlert.createdAt.getTime()
          if (timeSinceLast < rule.cooldownMinutes * 60 * 1000) {
            return false // Still in cooldown
          }
        }
        return true
      }
    }

    return false
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt':
        return value > threshold
      case 'gte':
        return value >= threshold
      case 'lt':
        return value < threshold
      case 'lte':
        return value <= threshold
      case 'eq':
        return value === threshold
      case 'ne':
        return value !== threshold
      default:
        return false
    }
  }

  /**
   * Get metric value from nested metrics object
   */
  private getMetricValue(metrics: Record<string, any>, path: string): number | undefined {
    const keys = path.split('.')
    let value: any = metrics

    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key]
      } else {
        return undefined
      }
    }

    return typeof value === 'number' ? value : undefined
  }

  /**
   * Generate alert message based on rule and metrics
   */
  private generateAlertMessage(rule: AlertRule, metrics: Record<string, any>): string {
    // Simple message generation - could be made more sophisticated
    switch (rule.id) {
      case 'system-high-cpu':
        return `System CPU usage is at ${metrics.cpu?.usage?.toFixed(1)}%`
      case 'system-high-memory':
        return `System memory usage is at ${metrics.memory?.usage?.toFixed(1)}%`
      case 'railway-service-down':
        return `Railway service is reporting unhealthy status`
      case 'sentry-high-error-rate':
        return `Error rate is ${metrics.errorRate?.toFixed(2)} per minute`
      case 'sentry-low-uptime':
        return `Uptime is below ${rule.conditions[0].threshold}%`
      default:
        return rule.description
    }
  }

  /**
   * Send notifications for an alert
   */
  private async sendNotifications(alert: Alert, channels: NotificationChannel[]): Promise<void> {
    for (const channel of channels) {
      if (!channel.enabled) continue

      try {
        switch (channel.type) {
          case 'email':
            await this.sendEmailNotification(alert, channel.config)
            break
          case 'slack':
            await this.sendSlackNotification(alert, channel.config)
            break
          case 'webhook':
            await this.sendWebhookNotification(alert, channel.config)
            break
        }
      } catch (error) {
        console.error(`[AlertManager] Failed to send ${channel.type} notification:`, error)
      }
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(alert: Alert, config: any): Promise<void> {
    const recipients = config.recipients || []
    if (recipients.length === 0) return

    await emailNotifier.sendAlertNotification(
      recipients,
      alert.title,
      alert.message,
      alert.severity,
      alert.source,
      alert.metadata?.actionUrl
    )
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(alert: Alert, config: any): Promise<void> {
    console.log(`[AlertManager] Sending Slack alert: ${alert.title} to ${config.webhookUrl}`)

    // Here you would send to Slack webhook
    // Example: await fetch(config.webhookUrl, { method: 'POST', body: JSON.stringify({ text: alert.title }) });
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(alert: Alert, config: any): Promise<void> {
    console.log(`[AlertManager] Sending webhook alert: ${alert.title} to ${config.url}`)

    // Here you would send to webhook URL
    // Example: await fetch(config.url, { method: 'POST', body: JSON.stringify(alert) });
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId?: string): Promise<boolean> {
    const alert = Array.from(this.activeAlerts.values()).find(a => a.id === alertId)
    if (!alert) return false

    alert.status = 'acknowledged'
    alert.acknowledgedAt = new Date()
    alert.acknowledgedBy = userId

    await this.persistAlert(alert)
    return true
  }

  /**
   * Get alert summary
   */
  async getAlertSummary(): Promise<AlertSummary> {
    const allAlerts = await this.getAllAlerts()
    const active = allAlerts.filter(a => a.status === 'active')
    const acknowledged = allAlerts.filter(a => a.status === 'acknowledged')
    const resolved = allAlerts.filter(a => a.status === 'resolved')

    const bySeverity: Record<string, number> = {}
    const bySource: Record<string, number> = {}

    for (const alert of active) {
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1
      bySource[alert.source] = (bySource[alert.source] || 0) + 1
    }

    const recent = allAlerts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)

    return {
      total: allAlerts.length,
      active: active.length,
      acknowledged: acknowledged.length,
      resolved: resolved.length,
      bySeverity,
      bySource,
      recent,
    }
  }

  /**
   * Get all alerts (mock implementation - in real app, fetch from database)
   */
  private async getAllAlerts(): Promise<Alert[]> {
    // Mock data - in real implementation, fetch from database
    return Array.from(this.activeAlerts.values())
  }

  /**
   * Persist alert to database (mock implementation)
   */
  private async persistAlert(alert: Alert): Promise<void> {
    // Mock persistence - in real implementation, save to database
    console.log(`[AlertManager] Persisted alert: ${alert.id} - ${alert.title}`)
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values())
  }

  /**
   * Get alert rules
   */
  getRules(): AlertRule[] {
    return this.rules
  }

  /**
   * Update alert rule
   */
  updateRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const ruleIndex = this.rules.findIndex(r => r.id === ruleId)
    if (ruleIndex === -1) return false

    this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates }
    return true
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const alertManager = new AlertManager()
