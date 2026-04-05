/**
 * PORTAL Sentra — Encryption Manager
 * AES-256-GCM encryption for environment variables
 */

import 'server-only'

import { createCipheriv, createDecipheriv, createHash, pbkdf2Sync, randomBytes } from 'crypto'
import type { EncryptedData, EncryptionResult } from '@/types/vault'

// ============================================================================
// Constants
// ============================================================================

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // 128 bits
const TAG_LENGTH = 16 // 128 bits
const SALT_LENGTH = 32 // 256 bits
const KEY_LENGTH = 32 // 256 bits
const ITERATIONS = 100000 // PBKDF2 iterations

// ============================================================================
// Encryption Manager
// ============================================================================

class EncryptionManager {
  private masterKey: Buffer | null = null
  private isInitialized = false

  /**
   * Initialize encryption manager with master password
   */
  initialize(masterPassword: string): void {
    if (!masterPassword || masterPassword.length < 8) {
      throw new Error('Master password must be at least 8 characters')
    }

    // Derive key using PBKDF2
    const { key } = this.deriveKey(masterPassword)
    this.masterKey = key
    this.isInitialized = true
  }

  /**
   * Check if encryption manager is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized
  }

  /**
   * Derive encryption key from password using PBKDF2
   */
  private deriveKey(password: string, salt?: Buffer): { key: Buffer; salt: Buffer } {
    const useSalt = salt || randomBytes(SALT_LENGTH)
    const key = pbkdf2Sync(password, useSalt, ITERATIONS, KEY_LENGTH, 'sha256')
    return { key, salt: useSalt }
  }

  /**
   * Generate master key hash for verification
   */
  generateMasterKeyHash(masterPassword: string): string {
    const hash = createHash('sha256').update(masterPassword).digest('hex')
    return hash
  }

  /**
   * Verify master password against stored hash
   */
  verifyMasterPassword(masterPassword: string, storedHash: string): boolean {
    const hash = this.generateMasterKeyHash(masterPassword)
    return hash === storedHash
  }

  /**
   * Encrypt a string value using AES-256-GCM
   */
  encrypt(plaintext: string): EncryptionResult {
    if (!this.isInitialized || !this.masterKey) {
      return {
        encrypted: {} as EncryptedData,
        success: false,
        error: 'Encryption manager not initialized',
      }
    }

    try {
      // Generate random IV
      const iv = randomBytes(IV_LENGTH)

      // Create cipher
      const cipher = createCipheriv(ALGORITHM, this.masterKey, iv)

      // Encrypt
      let ciphertext = cipher.update(plaintext, 'utf8', 'base64')
      ciphertext += cipher.final('base64')

      // Get authentication tag
      const tag = cipher.getAuthTag()

      return {
        encrypted: {
          ciphertext,
          iv: iv.toString('base64'),
          tag: tag.toString('base64'),
          algorithm: ALGORITHM,
        },
        success: true,
      }
    } catch (error) {
      return {
        encrypted: {} as EncryptedData,
        success: false,
        error: error instanceof Error ? error.message : 'Encryption failed',
      }
    }
  }

  /**
   * Decrypt an encrypted value using AES-256-GCM
   */
  decrypt(encryptedData: EncryptedData): { plaintext: string; success: boolean; error?: string } {
    if (!this.isInitialized || !this.masterKey) {
      return {
        plaintext: '',
        success: false,
        error: 'Encryption manager not initialized',
      }
    }

    try {
      // Decode IV and tag
      const iv = Buffer.from(encryptedData.iv, 'base64')
      const tag = Buffer.from(encryptedData.tag, 'base64')

      // Create decipher
      const decipher = createDecipheriv(ALGORITHM, this.masterKey, iv)
      decipher.setAuthTag(tag)

      // Decrypt
      let plaintext = decipher.update(encryptedData.ciphertext, 'base64', 'utf8')
      plaintext += decipher.final('utf8')

      return {
        plaintext,
        success: true,
      }
    } catch (error) {
      return {
        plaintext: '',
        success: false,
        error: error instanceof Error ? error.message : 'Decryption failed',
      }
    }
  }

  /**
   * Encrypt a value and return JSON string
   */
  encryptToString(plaintext: string): string {
    const result = this.encrypt(plaintext)
    if (!result.success) {
      throw new Error(result.error || 'Encryption failed')
    }
    return JSON.stringify(result.encrypted)
  }

  /**
   * Decrypt from JSON string
   */
  decryptFromString(encryptedString: string): string {
    try {
      const encryptedData = JSON.parse(encryptedString) as EncryptedData
      const result = this.decrypt(encryptedData)
      if (!result.success) {
        throw new Error(result.error || 'Decryption failed')
      }
      return result.plaintext
    } catch (error) {
      throw new Error('Failed to decrypt value')
    }
  }

  /**
   * Check if a string is encrypted (JSON format with our structure)
   */
  isEncrypted(value: string): boolean {
    try {
      const data = JSON.parse(value) as EncryptedData
      return (
        data.algorithm === ALGORITHM &&
        typeof data.ciphertext === 'string' &&
        typeof data.iv === 'string' &&
        typeof data.tag === 'string'
      )
    } catch {
      return false
    }
  }

  /**
   * Generate a secure random password
   */
  generateSecurePassword(length: number = 32): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    const bytes = randomBytes(length)
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset[bytes[i] % charset.length]
    }
    return password
  }

  /**
   * Securely clear master key from memory
   */
  clear(): void {
    if (this.masterKey) {
      // Overwrite with zeros
      this.masterKey.fill(0)
      this.masterKey = null
    }
    this.isInitialized = false
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const encryptionManager = new EncryptionManager()
