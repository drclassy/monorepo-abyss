/**
 * PORTAL Sentra — Email Alert Notifier
 * Sends email notifications for critical alerts
 */

import { execa } from 'execa'

export interface EmailConfig {
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPassword?: string
  fromEmail: string
  fromName?: string
}

export interface AlertEmail {
  to: string[]
  subject: string
  html: string
  text?: string
  priority?: 'high' | 'normal' | 'low'
}

export class EmailNotifier {
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  /**
   * Send an email notification
   */
  async sendEmail(email: AlertEmail): Promise<boolean> {
    try {
      // For development/demo purposes, we'll log the email
      // In production, integrate with SendGrid, SES, or similar service

      console.log('[EmailNotifier] Sending alert email:', {
        to: email.to,
        subject: email.subject,
        priority: email.priority || 'normal',
      })

      // Mock email sending - replace with actual email service
      await this.mockEmailSend(email)

      return true
    } catch (error) {
      console.error('[EmailNotifier] Failed to send email:', error)
      return false
    }
  }

  /**
   * Send alert notification via email
   */
  async sendAlertNotification(
    recipients: string[],
    alertTitle: string,
    alertMessage: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    source: string,
    actionUrl?: string
  ): Promise<boolean> {
    const subject = `[${severity.toUpperCase()}] ${alertTitle} - Sentra Portal`
    const priority = severity === 'critical' ? 'high' : 'normal'

    const html = this.generateAlertEmailHTML({
      title: alertTitle,
      message: alertMessage,
      severity,
      source,
      actionUrl,
      timestamp: new Date(),
    })

    return this.sendEmail({
      to: recipients,
      subject,
      html,
      priority,
    })
  }

  /**
   * Generate HTML email content for alerts
   */
  private generateAlertEmailHTML(data: {
    title: string
    message: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    source: string
    actionUrl?: string
    timestamp: Date
  }): string {
    const severityColors = {
      low: '#10b981', // green
      medium: '#f59e0b', // yellow
      high: '#ef4444', // red
      critical: '#dc2626', // dark red
    }

    const severityColor = severityColors[data.severity]

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sentra Portal Alert</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 24px; text-align: center; }
        .content { padding: 32px; }
        .alert-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: white; background-color: ${severityColor}; }
        .message { font-size: 16px; line-height: 1.6; color: #374151; margin: 24px 0; }
        .details { background-color: #f1f5f9; border-radius: 6px; padding: 16px; margin: 24px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .detail-label { font-weight: 600; color: #64748b; }
        .detail-value { color: #1e293b; }
        .action-button { display: inline-block; background-color: ${severityColor}; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 24px 0; }
        .footer { background-color: #f8fafc; padding: 24px; text-align: center; color: #64748b; font-size: 14px; }
        .timestamp { color: #94a3b8; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 Sentra Portal Alert</h1>
            <p>System monitoring notification</p>
        </div>

        <div class="content">
            <div style="text-align: center; margin-bottom: 24px;">
                <span class="alert-badge">${data.severity}</span>
            </div>

            <h2 style="color: #1e293b; margin: 0 0 16px 0;">${data.title}</h2>

            <div class="message">
                ${data.message}
            </div>

            <div class="details">
                <div class="detail-row">
                    <span class="detail-label">Source:</span>
                    <span class="detail-value">${data.source}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Severity:</span>
                    <span class="detail-value">${data.severity}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${data.timestamp.toLocaleString()}</span>
                </div>
            </div>

            ${
              data.actionUrl
                ? `
            <div style="text-align: center;">
                <a href="${data.actionUrl}" class="action-button">
                    View Details →
                </a>
            </div>
            `
                : ''
            }

            <div class="timestamp">
                Alert generated at ${data.timestamp.toLocaleString()}
            </div>
        </div>

        <div class="footer">
            <p>Sentra Healthcare AI Portal</p>
            <p>This is an automated alert from the Sentra monitoring system.</p>
        </div>
    </div>
</body>
</html>`
  }

  /**
   * Mock email sending for development
   */
  private async mockEmailSend(email: AlertEmail): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))

    // Log email content for debugging
    console.log('[EmailNotifier] Mock email sent:', {
      to: email.to.join(', '),
      subject: email.subject,
      contentLength: email.html.length,
      priority: email.priority,
    })

    // In production, replace this with actual email service:
    // - SendGrid: @sendgrid/mail
    // - AWS SES: @aws-sdk/client-ses
    // - NodeMailer: nodemailer
    // - Resend: resend.com

    // Example with SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.send({
      to: email.to,
      from: this.config.fromEmail,
      subject: email.subject,
      html: email.html,
      text: email.text,
      mailSettings: {
        sandboxMode: {
          enable: process.env.NODE_ENV !== 'production'
        }
      }
    });
    */
  }

  /**
   * Test email configuration
   */
  async testConfiguration(): Promise<boolean> {
    try {
      const testEmail: AlertEmail = {
        to: [this.config.fromEmail], // Send to ourselves for testing
        subject: 'Sentra Portal - Email Test',
        html: '<h1>Email configuration test successful!</h1><p>This is a test email from Sentra Portal alert system.</p>',
      }

      return await this.sendEmail(testEmail)
    } catch (error) {
      console.error('[EmailNotifier] Email configuration test failed:', error)
      return false
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const emailNotifier = new EmailNotifier({
  fromEmail: process.env.ALERT_FROM_EMAIL || 'alerts@sentra-portal.local',
  fromName: 'Sentra Portal Alerts',
})
