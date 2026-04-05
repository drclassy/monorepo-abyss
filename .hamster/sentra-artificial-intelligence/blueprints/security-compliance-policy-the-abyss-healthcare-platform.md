---
id: "0d50048d-5dd2-4ac3-9730-ffa45c20f58e"
entity_type: "blueprint"
entity_id: "0d50048d-5dd2-4ac3-9730-ffa45c20f58e"
title: "Security & Compliance Policy - The Abyss Healthcare Platform"
status: ""
priority: ""
updated_at: "2026-03-31T09:43:32.986307+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Overview & Compliance Framework

This Security & Compliance Policy establishes the technical and administrative controls required to operate The Abyss healthcare platform in compliance with:

- **HIPAA** (Health Insurance Portability and Accountability Act) — Privacy Rule, Security Rule, Breach Notification Rule
- **SOC 2 Type II** — Service Organization Control audit framework (Availability, Processing Integrity, Security, Confidentiality)
- **HITRUST** — Healthcare Information and Management Systems Security (CSF v9.5)

**Scope:** All infrastructure, applications, and data repositories within The Abyss monorepo (Phases 1-7).

**Effective Date:** [Implementation date]

**Policy Owner:** Chief Security Officer

**Review Cycle:** Semi-annual (June 30, December 31)

---

## 1. HIPAA Compliance Technical Safeguards

### 1.1 Access Control

**Requirement:** Only authorized personnel can access Protected Health Information (PHI).

**Implementation:**

```typescript
// packages/auth-core/src/hipaa-access-control.ts
import { IAMClient, ListUsersCommand, UpdateUserCommand } from "@aws-sdk/client-iam";

export class HIPAAAccessControl {
  private iam = new IAMClient({ region: "us-east-1" });

  /**
   * Enforce multi-factor authentication (MFA) for all IAM users with PHI access
   */
  async enforceMFA(userId: string): Promise<void> {
    const mfaDevices = await this.iam.send(
      new ListMFADevicesCommand({ UserName: userId })
    );

    if (mfaDevices.MFADevices.length === 0) {
      console.warn(`User ${userId} does not have MFA enabled`);
      // Disable access for non-compliant users
      await this.suspendUser(userId);
    }
  }

  /**
   * Verify role-based access control (RBAC) — least privilege principle
   */
  async enforceRBAC(userId: string, requiredRole: string): Promise<boolean> {
    const user = await this.getUser(userId);
    const roles = await this.getUserRoles(userId);

    // HIPAA requirement: User must have explicit role assignment
    if (!roles.includes(requiredRole)) {
      await createAuditLog({
        action: "ACCESS_DENIED",
        userId,
        requiredRole,
        reason: "User does not have required role",
        timestamp: new Date(),
      });
      return false;
    }

    return true;
  }

  /**
   * Automatic deprovisioning after role change or termination
   */
  async deprovisionAccess(userId: string): Promise<void> {
    // Remove from all HIPAA-regulated groups
    const groups = ["phi-access", "clinical-team", "admin"];
    
    for (const group of groups) {
      await this.iam.send(
        new RemoveUserFromGroupCommand({
          UserName: userId,
          GroupName: group,
        })
      );
    }

    // Revoke all active sessions
    await this.revokeActiveSessions(userId);

    // Log deprovisioning event
    await createAuditLog({
      action: "USER_DEPROVISIONED",
      userId,
      timestamp: new Date(),
    });
  }

  private async suspendUser(userId: string): Promise<void> {
    // Attach policy that denies all access
    const denyAllPolicy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Deny",
          Action: "*",
          Resource: "*",
        },
      ],
    };

    await this.iam.send(
      new PutUserPolicyCommand({
        UserName: userId,
        PolicyName: "DenyAll",
        PolicyDocument: JSON.stringify(denyAllPolicy),
      })
    );
  }

  private async revokeActiveSessions(userId: string): Promise<void> {
    // Add access key timestamp check
    const keys = await this.iam.send(new ListAccessKeysCommand({ UserName: userId }));
    
    for (const key of keys.AccessKeyMetadata) {
      await this.iam.send(
        new DeleteAccessKeyCommand({
          UserName: userId,
          AccessKeyId: key.AccessKeyId,
        })
      );
    }
  }
}
```

**Controls:**

- Multi-factor authentication (MFA) mandatory for all users
- Role-based access control (RBAC) with principle of least privilege
- Access reviews quarterly with documented approval
- Automatic account lockout after 30 days of inactivity
- Immediate deprovisioning upon role change or termination

### 1.2 Audit Controls & Logging

**Requirement:** Maintain immutable audit logs of all PHI access.

**Implementation:**

```typescript
// packages/audit-logger/src/hipaa-audit-log.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as crypto from "crypto";

export interface HIPAAAuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: "READ" | "WRITE" | "DELETE" | "EXPORT" | "LOGIN" | "LOGOUT";
  resource: string; // Patient ID, document ID, etc.
  resourceType: "Patient" | "Observation" | "Medication" | "Condition" | string;
  outcome: "SUCCESS" | "FAILURE";
  ipAddress: string;
  userAgent?: string;
  description: string;
  hash?: string; // Content hash for integrity verification
}

export class HIPAAAuditLogger {
  private s3 = new S3Client({ region: "us-east-1" });
  private logBucket = "the-abyss-immutable-audit-logs";

  /**
   * Log PHI access with immutable storage (S3 Object Lock)
   */
  async logAccess(log: HIPAAAuditLog): Promise<void> {
    // Add timestamp and unique ID
    const enrichedLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    // Calculate HMAC for integrity
    enrichedLog.hash = this.calculateHMAC(enrichedLog);

    // Store in immutable S3 bucket (S3 Object Lock enabled)
    const logKey = `audit-logs/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${enrichedLog.id}.json`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.logBucket,
        Key: logKey,
        Body: JSON.stringify(enrichedLog, null, 2),
        ServerSideEncryption: "AES256",
        Metadata: {
          "integrity-hash": enrichedLog.hash,
          "user-id": enrichedLog.userId,
          "resource-id": enrichedLog.resource,
        },
        RetentionPeriod: 2555, // 7 years in days (HIPAA requirement)
      })
    );

    // Also write to PostgreSQL for queryable access
    await this.db.auditLog.create(enrichedLog);

    // Alert on suspicious activity
    await this.checkSuspiciousActivity(enrichedLog);
  }

  /**
   * Verify audit log integrity (detect tampering)
   */
  async verifyLogIntegrity(logId: string): Promise<boolean> {
    const log = await this.db.auditLog.findById(logId);
    const storedHash = log.hash;

    // Recalculate HMAC
    const { hash, ...logData } = log;
    const calculatedHash = this.calculateHMAC(logData);

    if (storedHash !== calculatedHash) {
      // Log tamper alert
      await createAuditLog({
        action: "AUDIT_LOG_TAMPERING_DETECTED",
        logId,
        timestamp: new Date(),
      });
      return false;
    }

    return true;
  }

  /**
   * Detect unauthorized access patterns (HIPAA Security Incident)
   */
  private async checkSuspiciousActivity(log: HIPAAAuditLog): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentLogs = await this.db.auditLog.findMany({
      where: {
        userId: log.userId,
        timestamp: { gte: oneHourAgo },
      },
    });

    // Alert if >50 accesses in 1 hour (brute force indicator)
    if (recentLogs.length > 50) {
      await this.sendSecurityAlert({
        severity: "HIGH",
        type: "BRUTE_FORCE_ATTEMPT",
        userId: log.userId,
        accessCount: recentLogs.length,
      });
    }

    // Alert if accessing multiple patients in <5 minutes (data fishing)
    const uniquePatients = new Set(recentLogs.map((l) => l.resource)).size;
    if (uniquePatients > 10 && recentLogs.length > 0) {
      const timespan = (Date.now() - recentLogs[0].timestamp.getTime()) / 1000;
      if (timespan < 300) {
        await this.sendSecurityAlert({
          severity: "HIGH",
          type: "DATA_FISHING_ATTEMPT",
          userId: log.userId,
          patientsAccessed: uniquePatients,
        });
      }
    }
  }

  private calculateHMAC(data: object): string {
    const key = process.env.HIPAA_HMAC_KEY || "default-key";
    return crypto
      .createHmac("sha256", key)
      .update(JSON.stringify(data))
      .digest("hex");
  }
}
```

**Controls:**

- Immutable audit logs stored in S3 with Object Lock (7-year retention)
- All PHI access logged within 5 minutes
- HMAC-based integrity verification
- Real-time alerting on suspicious activity
- Monthly audit log review for completeness

### 1.3 Transmission Security

**Requirement:** Encrypt all PHI in transit using TLS 1.3.

**Terraform Implementation:**

```hcl
# infrastructure/aws/security/tls-enforcement.tf

# 1. API Gateway with TLS 1.3 minimum
resource "aws_apigatewayv2_domain_name" "abyss_api" {
  domain_name              = "api.abyss.healthcare"
  domain_name_certificate_arn = aws_acm_certificate.abyss_api.arn

  mutual_tls_authentication {
    truststore_uri = "s3://${aws_s3_bucket.mTLS_truststore.id}/truststore.pem"
  }
}

resource "aws_acm_certificate" "abyss_api" {
  domain_name       = "api.abyss.healthcare"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# 2. RDS Database Encryption in Transit
resource "aws_db_instance" "postgres_hipaa" {
  identifier = "abyss-hipaa-db"
  engine     = "postgres"
  version    = "15.4"

  # Enforce SSL/TLS connections
  publicly_accessible = false
  storage_encrypted   = true
  kms_key_id          = aws_kms_key.rds_encryption.arn

  # Parameter group enforcing TLS
  parameter_group_name = aws_db_parameter_group.tls_enforcement.name

  # Backup encryption
  backup_retention_period = 35
  copy_tags_to_snapshot   = true
  storage_type            = "gp3"

  deletion_protection = true
  skip_final_snapshot = false

  tags = {
    Name        = "abyss-hipaa-db"
    Compliance  = "HIPAA"
  }
}

resource "aws_db_parameter_group" "tls_enforcement" {
  family = "postgres15"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  parameter {
    name  = "ssl"
    value = "1"
  }
}

# 3. RDS Proxy for Connection Pooling & TLS
resource "aws_db_proxy" "hipaa_db_proxy" {
  name                   = "abyss-hipaa-proxy"
  engine_family          = "POSTGRESQL"
  auth {
    auth_scheme = "SECRETS"
    secret_arn  = aws_secretsmanager_secret.db_credentials.arn
  }

  role_arn               = aws_iam_role.rds_proxy.arn
  vpc_subnet_ids         = aws_subnet.private[*].id
  vpc_security_group_ids = [aws_security_group.rds_proxy.id]

  require_tls = true
  idle_client_timeout = 900

  max_allocated_connections = 100
  max_idle_connections      = 20
}

# 4. ElastiCache Redis with Encryption in Transit
resource "aws_elasticache_replication_group" "hipaa_cache" {
  replication_group_description = "HIPAA-compliant Redis cache"
  engine                        = "redis"
  engine_version                = "7.0"

  # Encryption in transit (TLS)
  transit_encryption_enabled = true
  auth_token                 = random_password.redis_auth_token.result
  auth_token_update_strategy = "ROTATE"

  # Encryption at rest
  at_rest_encryption_enabled = true
  kms_key_id                 = aws_kms_key.redis_encryption.arn

  # Node configuration
  node_type           = "cache.m6g.xlarge"
  num_cache_clusters  = 3
  parameter_group_name = aws_elasticache_parameter_group.tls.name
  port                = 6379
  automatic_failover_enabled = true
  multi_az_enabled    = true

  # Backup configuration
  snapshot_retention_limit = 35
  snapshot_window          = "03:00-05:00"

  tags = {
    Name        = "abyss-hipaa-cache"
    Compliance  = "HIPAA"
  }
}

resource "aws_elasticache_parameter_group" "tls" {
  family = "redis7"

  parameter {
    name  = "tls-port"
    value = "6379"
  }

  parameter {
    name  = "port"
    value = "0" # Disable non-TLS port
  }
}

# 5. VPC Endpoint for AWS Services (no internet exposure)
resource "aws_vpc_endpoint" "s3" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.us-east-1.s3"
  vpc_endpoint_type   = "Gateway"
  route_table_ids     = [aws_route_table.private.id]
  policy              = data.aws_iam_policy_document.s3_endpoint_policy.json
}

# 6. Kubernetes Ingress with TLS Termination
resource "helm_release" "nginx_ingress" {
  name       = "nginx-ingress"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"

  values = [
    yamlencode({
      controller = {
        # TLS configuration
        service = {
          annotations = {
            "service.beta.kubernetes.io/aws-load-balancer-ssl-cert" = aws_acm_certificate.abyss_api.arn
            "service.beta.kubernetes.io/aws-load-balancer-backend-protocol" = "http"
            "service.beta.kubernetes.io/aws-load-balancer-ssl-ports"        = "443"
          }
        }
      }
    })
  ]
}
```

**Controls:**

- TLS 1.3 minimum for all external connections
- TLS 1.2 minimum for internal microservices
- Certificate pinning for critical services
- Perfect Forward Secrecy (PFS) enabled
- Cipher suites restricted to approved list

---

## 2. Encryption at Rest (AES-256)

### 2.1 Data Encryption Standards

**Requirement:** All PHI encrypted with AES-256 encryption key.

**Implementation:**

```hcl
# infrastructure/aws/security/encryption-at-rest.tf

# 1. AWS KMS Key for PHI Encryption
resource "aws_kms_key" "hipaa_master_key" {
  description             = "Master encryption key for HIPAA-regulated PHI"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  # Key rotation automatically enabled
  tags = {
    Name        = "hipaa-master-key"
    Compliance  = "HIPAA"
  }
}

resource "aws_kms_alias" "hipaa_master_key" {
  name          = "alias/hipaa-master-key"
  target_key_id = aws_kms_key.hipaa_master_key.key_id
}

# 2. RDS Encryption at Rest
resource "aws_db_instance" "postgres_hipaa" {
  # ... (see previous section)
  storage_encrypted   = true
  kms_key_id          = aws_kms_key.hipaa_master_key.arn

  # Enable encryption of automated backups
  backup_retention_period = 35
  kms_key_id_backup       = aws_kms_key.hipaa_master_key.arn
}

# 3. S3 Bucket Encryption (Default + Enforce)
resource "aws_s3_bucket" "phi_data" {
  bucket = "abyss-hipaa-phi-data"

  tags = {
    Name        = "PHI Data Bucket"
    Compliance  = "HIPAA"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "phi_data" {
  bucket = aws_s3_bucket.phi_data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.hipaa_master_key.arn
    }
    bucket_key_enabled = true
  }
}

# Deny unencrypted uploads
resource "aws_s3_bucket_policy" "phi_data_deny_unencrypted" {
  bucket = aws_s3_bucket.phi_data.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DenyUnencryptedObjectUploads"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:PutObject"
        Resource = "${aws_s3_bucket.phi_data.arn}/*"
        Condition = {
          StringNotEquals = {
            "s3:x-amz-server-side-encryption" = "aws:kms"
          }
        }
      },
      {
        Sid    = "DenyIncorrectKmsKey"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:PutObject"
        Resource = "${aws_s3_bucket.phi_data.arn}/*"
        Condition = {
          StringNotEquals = {
            "s3:x-amz-server-side-encryption-aws-kms-key-arn" = aws_kms_key.hipaa_master_key.arn
          }
        }
      }
    ]
  })
}

# 4. EBS Volume Encryption
resource "aws_ebs_encryption_by_default" "hipaa" {
  enabled = true
}

resource "aws_ebs_default_kms_key" "hipaa" {
  kms_key_id = aws_kms_key.hipaa_master_key.arn
}

# 5. ElastiCache Encryption at Rest
resource "aws_elasticache_replication_group" "hipaa_cache" {
  # ... (see Transmission Security section)
  at_rest_encryption_enabled = true
  kms_key_id                 = aws_kms_key.hipaa_master_key.arn
}

# 6. Secrets Manager Encryption
resource "aws_secretsmanager_secret" "db_credentials" {
  name = "abyss/db/hipaa/credentials"

  kms_key_id = aws_kms_key.hipaa_master_key.id
}

# 7. DynamoDB Encryption
resource "aws_dynamodb_table" "audit_logs" {
  name           = "abyss-audit-logs"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  sse_specification {
    enabled     = true
    kms_key_arn = aws_kms_key.hipaa_master_key.arn
  }

  ttl {
    attribute_name = "expiration_time"
    enabled        = true
  }

  point_in_time_recovery_specification {
    enabled = true
  }
}

# 8. CloudWatch Logs Encryption
resource "aws_cloudwatch_log_group" "hipaa_logs" {
  name              = "/aws/abyss/hipaa-logs"
  retention_in_days = 2555 # 7 years

  kms_key_id = "${aws_kms_key.hipaa_master_key.arn}:*"
}
```

**Application-Level Encryption:**

```typescript
// packages/encryption/src/aes-256-encryption.ts
import * as crypto from "crypto";

export class AES256Encryption {
  /**
   * Encrypt sensitive field before database storage
   */
  static encrypt(plaintext: string, keyId?: string): string {
    const algorithm = "aes-256-cbc";
    const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // 32 bytes for AES-256
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(plaintext, "utf-8", "hex");
    encrypted += cipher.final("hex");

    // Return IV + ciphertext (IV is not secret)
    return `${iv.toString("hex")}:${encrypted}`;
  }

  static decrypt(ciphertext: string): string {
    const algorithm = "aes-256-cbc";
    const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

    const [ivHex, encryptedHex] = ciphertext.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    return decrypted;
  }

  /**
   * Field-level encryption for FHIR resources before storage
   */
  static encryptFHIRField(fhirResource: any, fieldPath: string): any {
    const value = this.getNestedProperty(fhirResource, fieldPath);
    if (!value) return fhirResource;

    const encrypted = this.encrypt(JSON.stringify(value));
    return this.setNestedProperty(fhirResource, fieldPath, {
      _encrypted: true,
      value: encrypted,
    });
  }

  static decryptFHIRField(fhirResource: any, fieldPath: string): any {
    const field = this.getNestedProperty(fhirResource, fieldPath);
    if (!field?._encrypted) return fhirResource;

    const decrypted = this.decrypt(field.value);
    return this.setNestedProperty(fhirResource, fieldPath, JSON.parse(decrypted));
  }

  private static getNestedProperty(obj: any, path: string): any {
    return path.split(".").reduce((current, prop) => current?.[prop], obj);
  }

  private static setNestedProperty(obj: any, path: string, value: any): any {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    return obj;
  }
}
```

**Controls:**

- AES-256-GCM for all data encryption
- Automatic key rotation every 90 days
- Key escrow for disaster recovery (stored in separate AWS account)
- Field-level encryption for PII/PHI
- Encryption enforced at database, storage, and application layers

---

## 3. Access Management & IAM

### 3.1 Role-Based Access Control (RBAC)

**Implementation:**

```hcl
# infrastructure/aws/iam/hipaa-roles.tf

# 1. Clinical User Role (Read-only patient data)
resource "aws_iam_role" "clinical_user" {
  name = "abyss-clinical-user"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
          AWS     = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action = "sts:AssumeRole"
        Condition = {
          Bool = {
            "aws:MultiFactorAuthPresent" = "true"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "clinical_user_policy" {
  name = "clinical-user-policy"
  role = aws_iam_role.clinical_user.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ReadPatientData"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "rds:DescribeDBInstances",
        ]
        Resource = [
          "arn:aws:s3:::abyss-hipaa-phi-data/patient-records/*",
          "arn:aws:rds:*:*:db/abyss-hipaa-db"
        ]
      },
      {
        Sid    = "DenyDataExport"
        Effect = "Deny"
        Action = [
          "s3:GetObject",
          "rds:CopyDBSnapshot",
        ]
        Resource = "*"
        Condition = {
          StringLike = {
            "aws:RequestedRegion" = "eu-*" # Example: deny exporting to EU
          }
        }
      }
    ]
  })
}

# 2. Administrator Role (Full access with approval)
resource "aws_iam_role" "hipaa_admin" {
  name = "abyss-hipaa-admin"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action = "sts:AssumeRole"
        Condition = {
          Bool = {
            "aws:MultiFactorAuthPresent" = "true"
          }
          IpAddress = {
            "aws:SourceIp" = ["203.0.113.0/24"] # Corporate network only
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "hipaa_admin_policy" {
  name = "hipaa-admin-policy"
  role = aws_iam_role.hipaa_admin.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "FullAccess"
        Effect = "Allow"
        Action = "*"
        Resource = "*"
      },
      {
        Sid    = "RequireApprovalForHighRiskActions"
        Effect = "Deny"
        Action = [
          "kms:ScheduleKeyDeletion",
          "s3:DeleteBucket",
          "rds:DeleteDBInstance",
        ]
        Resource = "*"
        Condition = {
          StringNotLike = {
            "aws:username" = "approved-*"
          }
        }
      }
    ]
  })
}

# 3. Read-only Auditor Role
resource "aws_iam_role" "auditor" {
  name = "abyss-auditor"
}

resource "aws_iam_role_policy" "auditor_policy" {
  name = "auditor-policy"
  role = aws_iam_role.auditor.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ReadAuditLogs"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket",
          "cloudtrail:LookupEvents",
          "cloudwatch:DescribeLogGroups",
          "cloudwatch:GetLogEvents",
        ]
        Resource = [
          "arn:aws:s3:::abyss-immutable-audit-logs",
          "arn:aws:s3:::abyss-immutable-audit-logs/*",
          "arn:aws:cloudtrail:*:*:trail/*",
        ]
      },
      {
        Sid    = "DenyModifications"
        Effect = "Deny"
        Action = [
          "s3:PutObject",
          "s3:DeleteObject",
          "cloudtrail:StopLogging",
        ]
        Resource = "*"
      }
    ]
  })
}
```

### 3.2 Quarterly Access Review Process

**Automated Access Review:**

```python
# packages/compliance/src/access_review_automation.py
import boto3
import json
from datetime import datetime, timedelta
from typing import List, Dict

class AccessReviewAutomation:
    def __init__(self):
        self.iam_client = boto3.client('iam')
        self.s3_client = boto3.client('s3')
        
    def generate_access_review_report(self) -> Dict:
        """
        Generate quarterly access review report
        """
        report = {
            'review_date': datetime.now().isoformat(),
            'users': [],
            'roles_with_excessive_permissions': [],
            'unused_credentials': [],
        }
        
        # 1. List all IAM users and their roles
        users_response = self.iam_client.list_users()
        
        for user in users_response['Users']:
            user_name = user['UserName']
            user_info = {
                'username': user_name,
                'created': user['CreateDate'].isoformat(),
                'last_used': self._get_last_used_time(user_name),
                'mfa_enabled': self._check_mfa_enabled(user_name),
                'roles': [],
                'access_keys': [],
                'recommendations': [],
            }
            
            # Get attached roles
            roles_response = self.iam_client.list_attached_user_policies(
                UserName=user_name
            )
            user_info['roles'] = [r['PolicyName'] for r in roles_response['AttachedUserPolicies']]
            
            # Get access keys and their last used date
            access_keys_response = self.iam_client.list_access_keys(
                UserName=user_name
            )
            
            for access_key in access_keys_response['AccessKeyMetadata']:
                last_used = self._get_access_key_last_used(access_key['AccessKeyId'])
                
                # Alert on inactive keys
                if last_used and (datetime.now() - last_used.replace(tzinfo=None)) > timedelta(days=90):
                    user_info['recommendations'].append(
                        f"Access key {access_key['AccessKeyId']} unused for 90+ days. Recommend deactivation."
                    )
                
                user_info['access_keys'].append({
                    'access_key_id': access_key['AccessKeyId'],
                    'created': access_key['CreateDate'].isoformat(),
                    'last_used': last_used.isoformat() if last_used else 'Never',
                })
            
            # Check for overly permissive roles
            if 'AdministratorAccess' in user_info['roles']:
                user_info['recommendations'].append(
                    "User has AdministratorAccess. Recommend restricting to least-privilege roles."
                )
            
            report['users'].append(user_info)
        
        # 2. Generate approval document
        approval_doc = self._generate_approval_document(report)
        
        # 3. Store report in S3 for audit trail
        self._store_report(report)
        
        return report
    
    def _check_mfa_enabled(self, username: str) -> bool:
        """Check if user has MFA enabled"""
        try:
            response = self.iam_client.list_mfa_devices(UserName=username)
            return len(response['MFADevices']) > 0
        except:
            return False
    
    def _get_last_used_time(self, username: str) -> datetime:
        """Get user's last login time"""
        try:
            response = self.iam_client.get_user(UserName=username)
            # AWS doesn't track login time directly, use access key last used
            return None
        except:
            return None
    
    def _get_access_key_last_used(self, access_key_id: str) -> datetime:
        """Get when access key was last used"""
        try:
            response = self.iam_client.get_access_key_last_used(
                AccessKeyId=access_key_id
            )
            if 'AccessKeyLastUsed' in response and 'LastUsedDate' in response['AccessKeyLastUsed']:
                return response['AccessKeyLastUsed']['LastUsedDate']
        except:
            pass
        return None
    
    def _generate_approval_document(self, report: Dict) -> str:
        """Generate a markdown approval document for management"""
        doc = f"""# Access Review Report - {report['review_date']}

## Summary
- Total Users: {len(report['users'])}
- Users with MFA: {sum(1 for u in report['users'] if u['mfa_enabled'])}/{len(report['users'])}
- Access Keys Requiring Action: {sum(len(u['recommendations']) for u in report['users'])}

## Users Requiring Action

"""
        for user in report['users']:
            if user['recommendations']:
                doc += f"\n### {user['username']}\n"
                for rec in user['recommendations']:
                    doc += f"- ⚠️ {rec}\n"
        
        doc += f"\n## Approval\n\nI have reviewed the above access report and approve the recommended actions.\n\nDate: _______________\n\nApproved By (Print Name): _______________\n\nSignature: _______________\n"
        
        return doc
    
    def _store_report(self, report: Dict):
        """Store report in S3 for audit trail"""
        bucket = 'abyss-compliance-reports'
        key = f"access-reviews/{datetime.now().strftime('%Y-%m')}-access-review.json"
        
        self.s3_client.put_object(
            Bucket=bucket,
            Key=key,
            Body=json.dumps(report, indent=2, default=str),
            ServerSideEncryption='AES256',
        )
```

---

## 4. Network Security

### 4.1 VPC & Network Isolation

**Kubernetes Network Policies:**

```yaml
# infrastructure/k8s/network-security/hipaa-network-policies.yaml

apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: hipaa
spec:
  podSelector: {}
  policyTypes:
    - Ingress

---
# Allow traffic only from API Gateway to clinical services
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-to-clinical
  namespace: hipaa
spec:
  podSelector:
    matchLabels:
      app: clinical-service
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: api-gateway
      ports:
        - protocol: TCP
          port: 8080

---
# Deny egress to internet (no data exfiltration)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: restrict-egress-to-internet
  namespace: hipaa
spec:
  podSelector: {}
  policyTypes:
    - Egress
  egress:
    # Allow DNS
    - to:
        - podSelector: {}
      ports:
        - protocol: UDP
          port: 53
    # Allow to RDS only
    - to:
        - ipBlock:
            cidr: 10.0.0.0/8 # VPC CIDR
    # Allow to Kubernetes API
    - to:
        - podSelector: {}
      ports:
        - protocol: TCP
          port: 443

---
# Pod Security Policy - Restrict container capabilities
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: hipaa-restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  allowedCapabilities:
    - NET_BIND_SERVICE
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  readOnlyRootFilesystem: true
  fsGroup:
    rule: 'RunAsAny'
```

---

## 5. Vulnerability Management

### 5.1 Automated Vulnerability Scanning

**GitHub Actions CI/CD Integration:**

```yaml
# .github/workflows/security-scanning.yml
name: Security & Vulnerability Scanning

on:
  pull_request:
    paths:
      - 'packages/**'
      - 'apps/**'
      - 'infrastructure/**'
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC

jobs:
  sast:
    name: Static Application Security Testing (SAST)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run SonarQube
        uses: SonarSource/sonarqube-scan-action@master
        env:
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          args: >
            -Dsonar.projectKey=the-abyss
            -Dsonar.sources=packages,apps
            -Dsonar.exclusions=**/*.test.ts,**/*.spec.ts
            -Dsonar.coverage.exclusions=**/*.test.ts,**/*.spec.ts
      
      - name: Check Quality Gate
        run: |
          # Fail if quality gate not met
          curl -s "${{ secrets.SONAR_HOST_URL }}/api/qualitygates/project_status?projectKey=the-abyss" \
            -H "Authorization: Bearer ${{ secrets.SONAR_TOKEN }}" | jq '.projectStatus.status' | grep -q 'OK'

  dependencies:
    name: Dependency Vulnerability Scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Run npm audit
        run: pnpm audit --audit-level=moderate
        continue-on-error: true
      
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  container-scanning:
    name: Container Image Vulnerability Scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t the-abyss:${{ github.sha }} .
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: the-abyss:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
      
      - name: Fail if high-severity vulnerabilities found
        run: |
          trivy image --severity HIGH,CRITICAL --exit-code 1 the-abyss:${{ github.sha }}

  infrastructure:
    name: Infrastructure-as-Code Security (Terraform)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Checkov (Terraform scanning)
        uses: bridgecrewio/checkov-action@master
        with:
          directory: infrastructure/
          framework: terraform
          quiet: false
          soft_fail: false
          container_user: 1000
```

---

## 6. Incident Response & Security Events

### 6.1 Security Incident Classification

| Level | Description | Response Time | Examples |
| --- | --- | --- | --- |
| **P1 - Critical** | Confirmed PHI breach or active attack | 15 minutes | Ransomware, data exfiltration |
| **P2 - High** | Potential security vulnerability impacting PHI | 30 minutes | Unpatched critical CVE, unauthorized access |
| **P3 - Medium** | Security issue without immediate PHI impact | 2 hours | Weak configuration, missing MFA |
| **P4 - Low** | Non-urgent security improvement | Next business day | Policy update, documentation |

### 6.2 HIPAA Breach Notification Procedure

```python
# packages/security/src/breach_notification.py
from datetime import datetime, timedelta
import boto3

class HIPAABreachNotification:
    def __init__(self):
        self.sns = boto3.client('sns')
        self.ses = boto3.client('ses')
    
    async def handle_security_incident(self, incident: Dict):
        """
        HIPAA requires notification within 60 days of discovery
        """
        # 1. Classify incident severity
        severity = self._classify_severity(incident)
        
        if severity in ['P1', 'P2']:
            # 2. Immediately escalate to Chief Security Officer & Legal
            await self._escalate_to_leadership(incident, severity)
            
            # 3. Preserve evidence
            await self._preserve_forensic_evidence(incident)
            
            # 4. Notify affected individuals (within 60 days if PHI exposed)
            notification_deadline = datetime.now() + timedelta(days=60)
            affected_count = await self._count_affected_individuals(incident)
            
            if affected_count > 500:
                # Notify media
                await self._notify_media(incident)
            
            # Notify US Department of HHS
            await self._notify_hhs(incident)
```

---

## 7. Compliance Certifications & Audits

### 7.1 SOC 2 Type II Audit Timeline

| Phase | Timeline | Activities |
| --- | --- | --- |
| **Planning** | Month 1-2 | Auditor selection, scope definition, control testing |
| **System Design** | Month 2-4 | Implement controls, document procedures |
| **Testing Period** | Month 4-10 | 6-month observation period for control operation |
| **Fieldwork** | Month 10-11 | Final audit testing, evidence review |
| **Reporting** | Month 11-12 | SOC 2 report issuance |

---

## 8. Policy Review & Updates

**Review Schedule:**

- Security policies: Semi-annual (June 30, December 31)
- Incident response procedures: Annual
- Access control lists: Quarterly
- Vulnerability assessments: Monthly

**Change Control:**
All security policy updates require:

- Chief Security Officer approval
- Chief Medical Officer review (for clinical implications)
- Compliance Officer sign-off
- Engineering team notification

**Document Location:**

- Policy Repository: `https://github.com/the-abyss/security-policies`
- Approval Tracking: GO-Gate system (Phase 2)

---

## 9. Appendix: Security Runbooks

### A. Responding to Unauth Access Attempt

1. **Immediate Actions (0-5 min):**

- Isolate affected user account (disable access keys, revoke sessions)
- Alert SOC team via PagerDuty P1
- Preserve audit logs

1. **Investigation (5-30 min):**

- Review CloudTrail logs for suspicious API calls
- Check audit logs for data access
- Determine scope of exposure

1. **Notification (30-60 min):**

- If PHI accessed: prepare breach notification
- Notify Chief Security Officer & Legal

### B. Responding to Data Encryption Key Compromise

1. **Immediate Actions:**

- Schedule KMS key deletion (7-day window before actual deletion)
- Rotate all databases encrypted with compromised key
- Re-encrypt all S3 objects

1. **Recovery:**

- Restore from encrypted backups using new KMS key
- Verify data integrity post-restoration

---

## Success Metrics

| Metric | Target | Measurement |
| --- | --- | --- |
| **HIPAA Compliance Score** | 100% | Quarterly audit |
| **Encryption Coverage** | 100% | Monthly verification |
| **Vulnerability Remediation Time** | P1: <24h, P2: <7d | Tracking system |
| **Access Review Completion** | 100% quarterly | GO-Gate approval |
| **Incident Response Time (P1)** | <15 minutes | PagerDuty metrics |
| **SOC 2 Audit Pass Rate** | Annual certification | External auditor |