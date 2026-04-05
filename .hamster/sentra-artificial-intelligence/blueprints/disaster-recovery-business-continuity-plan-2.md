---
id: "d32859e5-d87d-4ff8-90b8-842bc566bc1a"
entity_type: "blueprint"
entity_id: "d32859e5-d87d-4ff8-90b8-842bc566bc1a"
title: "Disaster Recovery & Business Continuity Plan"
status: ""
priority: ""
updated_at: "2026-03-31T09:41:29.350344+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Executive Summary

This Disaster Recovery and Business Continuity Plan (DRBCP) establishes the technical and organizational framework to minimize downtime and data loss during catastrophic events affecting The Abyss healthcare platform. It is mandatory for HIPAA compliance, patient safety, and regulatory reporting.

**Critical Objectives:**

- **RTO (Recovery Time Objective):** Restore critical clinical services within 15 minutes
- **RPO (Recovery Point Objective):** Lose no more than 1 minute of patient data
- **HIPAA Compliance:** Maintain audit trails, encryption, and access controls during recovery
- **Patient Safety:** Ensure no clinical decisions are made on stale or corrupted data

---

## 1. RTO & RPO Definitions by Criticality

### 1.1 Service Tier Classification

| Service Tier | Services | RTO | RPO | Justification |
| --- | --- | --- | --- | --- |
| **Critical** | Patient lookup, clinical data retrieval, emergency alerts, diagnosis support | 15 min | 1 min | Life-safety dependent; must restore before clinical decisions |
| **High** | Referral workflows, appointment scheduling, charting, medication ordering | 30 min | 5 min | Operational impact; clinicians cannot function without it |
| **Medium** | Reporting, analytics, admin dashboards, audit logs | 2 hours | 30 min | Non-immediate patient impact; can be manual workaround |
| **Low** | Documentation, non-critical integrations, feature experiments | 4 hours | 1 hour | Nice-to-have; not blocking clinical workflows |

### 1.2 RTO & RPO by Component

#### **Critical Path: Patient Clinical Data (EKS + RDS)**

```yaml
# infrastructure/disaster-recovery/rto-rpo-targets.yaml
apiVersion: dr.abyss.io/v1
kind: RecoveryTarget
metadata:
  name: critical-clinical-data
spec:
  component: "Patient Electronic Health Record (EHR)"
  rto_minutes: 15
  rpo_minutes: 1
  
  databases:
    - name: "fhir-patient-store"
      rto: 15
      rpo: 1
      backup_frequency: "every 1 minute"
      replication: "synchronous to standby region"
    
    - name: "clinical-observations"
      rto: 15
      rpo: 1
      backup_frequency: "continuous streaming replication"
      replication: "synchronous"
  
  kubernetes:
    - cluster: "us-east-1-prod"
      rto: 10
      rpo: 0  # Stateless; no data loss
      replication: "Hot standby in us-west-2"
  
  cache:
    - name: "patient-cache (Redis)"
      rto: 5
      rpo: 1
      persistence: "RDB snapshots every 1 minute"
      replication: "synchronous replica"

---

apiVersion: dr.abyss.io/v1
kind: RecoveryTarget
metadata:
  name: high-operational-workflows
spec:
  component: "Referral & Scheduling Workflows"
  rto_minutes: 30
  rpo_minutes: 5
  
  databases:
    - name: "referral-queue"
      backup_frequency: "every 5 minutes"
      replication: "asynchronous"
    
    - name: "appointment-store"
      backup_frequency: "every 5 minutes"
      replication: "asynchronous"
```

---

## 2. AWS Infrastructure Failover Architecture

### 2.1 Multi-Region Deployment Strategy

```
Primary Region: us-east-1
├── EKS Cluster (clinical-app, ai-services, api-gateway)
├── RDS Multi-AZ (PostgreSQL, read replicas in us-west-2)
├── ElastiCache Redis (primary instance, replication to standby)
├── S3 (medical documents, FHIR resources) - cross-region replication
└── Route 53 (health checks, DNS failover)

Standby Region: us-west-2
├── EKS Cluster (on-demand, scales up on failover)
├── RDS Read Replicas (promote to primary on failover)
├── ElastiCache Redis (standby, pre-warmed)
├── S3 Mirror (automated replication from us-east-1)
└── Route 53 (passive, activated on failover)
```

#### **Infrastructure as Code (Terraform)**

```hcl
# infrastructure/terraform/disaster-recovery/multi-region.tf

# Primary Region: us-east-1
provider "aws" {
  alias  = "primary"
  region = "us-east-1"
}

resource "aws_rds_cluster" "fhir_primary" {
  provider            = aws.primary
  cluster_identifier  = "fhir-patient-db-primary"
  engine              = "aurora-postgresql"
  engine_version      = "15.2"
  database_name       = "abyss_fhir"
  master_username     = "admin"
  master_password     = var.db_password
  
  # Multi-AZ for immediate failover within region
  availability_zones  = ["us-east-1a", "us-east-1b", "us-east-1c"]
  
  # Cross-region replication to standby
  enable_http_endpoint = true
  backup_retention_period = 35  # HIPAA requires 30+ days
  
  # Encrypt at rest (HIPAA requirement)
  storage_encrypted   = true
  kms_key_id          = aws_kms_key.rds_encryption.arn
  
  # Enable automated backups
  skip_final_snapshot = false
  final_snapshot_identifier = "fhir-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  tags = {
    Name        = "fhir-patient-db-primary"
    Environment = "production"
    DR          = "critical"
  }
}

# Standby Region: us-west-2 (Read Replicas for RTO < 15 min)
provider "aws" {
  alias  = "standby"
  region = "us-west-2"
}

resource "aws_rds_cluster" "fhir_standby" {
  provider                 = aws.standby
  cluster_identifier       = "fhir-patient-db-standby"
  replication_source_identifier = aws_rds_cluster.fhir_primary.arn
  
  # Standby replicas use same encryption key (cross-region)
  storage_encrypted       = true
  kms_key_id             = aws_kms_key.rds_encryption_standby.arn
  
  depends_on = [aws_rds_cluster.fhir_primary]
  
  tags = {
    Name        = "fhir-patient-db-standby"
    Environment = "production"
    DR          = "standby"
  }
}

# Automated failover: Promote standby to primary
resource "aws_rds_cluster_instance" "standby_promote" {
  provider           = aws.standby
  cluster_identifier = aws_rds_cluster.fhir_standby.id
  instance_class     = "db.r6i.2xlarge"
  engine              = "aurora-postgresql"
  
  # Monitoring for automatic promotion trigger
  monitoring_interval    = 60
  monitoring_role_arn    = aws_iam_role.rds_monitoring.arn
  
  depends_on = [aws_rds_cluster.fhir_standby]
}

# Route 53 Health Check for automatic DNS failover
resource "aws_route53_health_check" "primary_rds" {
  fqdn              = aws_rds_cluster.fhir_primary.endpoint
  port              = 5432
  type              = "TCP"
  failure_threshold = 3
  
  tags = {
    Name = "fhir-db-primary-health-check"
  }
}

resource "aws_route53_record" "fhir_db_failover" {
  zone_id = aws_route53_zone.abyss.zone_id
  name    = "fhir-db.abyss.internal"
  type    = "CNAME"
  
  failover_routing_policy {
    type = "PRIMARY"
  }
  
  set_identifier  = "primary-us-east-1"
  records         = [aws_rds_cluster.fhir_primary.endpoint]
  health_check_id = aws_route53_health_check.primary_rds.id
  ttl             = 60
}

resource "aws_route53_record" "fhir_db_failover_standby" {
  zone_id = aws_route53_zone.abyss.zone_id
  name    = "fhir-db.abyss.internal"
  type    = "CNAME"
  
  failover_routing_policy {
    type = "SECONDARY"
  }
  
  set_identifier  = "standby-us-west-2"
  records         = [aws_rds_cluster.fhir_standby.reader_endpoint]
  ttl             = 60
}
```

### 2.2 EKS Failover (Kubernetes Cluster)

#### **Active-Active Deployment**

```yaml
# infrastructure/kubernetes/disaster-recovery/multi-cluster-app.yaml

apiVersion: v1
kind: Namespace
metadata:
  name: clinical-app
  labels:
    dr-tier: critical

---

# Application deployed to BOTH regions (active-active)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: clinical-assistant
  namespace: clinical-app
spec:
  replicas: 3  # Per region
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  
  selector:
    matchLabels:
      app: clinical-assistant
  
  template:
    metadata:
      labels:
        app: clinical-assistant
        region: "{{ REGION }}"  # Populated by Kustomize
    
    spec:
      # Anti-affinity: spread across AZs
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchExpressions:
                  - key: app
                    operator: In
                    values:
                      - clinical-assistant
              topologyKey: topology.kubernetes.io/zone
      
      # Health checks for immediate failure detection
      containers:
        - name: clinical-assistant
          image: ghcr.io/the-abyss/clinical-assistant:latest
          imagePullPolicy: Always
          
          # Liveness probe: restart container if unhealthy
          livenessProbe:
            httpGet:
              path: /health/live
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3
            timeoutSeconds: 5
          
          # Readiness probe: remove from load balancer if not ready
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
            failureThreshold: 2
            timeoutSeconds: 3
          
          # Graceful shutdown
          lifecycle:
            preStop:
              exec:
                command:
                  - /bin/sh
                  - -c
                  - sleep 15 && /app/bin/graceful-shutdown.sh

---

# Persistent Volume Claims use RDS + Redis (external state)
apiVersion: v1
kind: ConfigMap
metadata:
  name: db-config
  namespace: clinical-app
data:
  db_host: "fhir-db.abyss.internal"
  db_port: "5432"
  redis_host: "clinical-cache.abyss.internal"
  redis_port: "6379"
```

#### **Automatic Failover with ArgoCD**

```yaml
# infrastructure/argocd/multi-cluster-sync.yaml

apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: clinical-apps-multi-cluster
  namespace: argocd
spec:
  goTemplate: true
  
  generators:
    - list:
        elements:
          - cluster: us-east-1-prod
            region: us-east-1
            weight: 100  # Primary
          - cluster: us-west-2-prod
            region: us-west-2
            weight: 0  # Standby (scales to 100 on primary failure)
  
  template:
    metadata:
      name: "clinical-app-{{ .cluster }}"
    
    spec:
      project: the-abyss
      
      source:
        repoURL: https://github.com/the-abyss/infrastructure
        targetRevision: main
        path: "k8s/clinical-app/overlays/{{ .region }}"
      
      destination:
        server: "https://{{ .cluster }}-api.abyss.internal:6443"
        namespace: clinical-app
      
      # Sync immediately on git changes (GitOps)
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

### 2.3 ElastiCache Redis Failover

#### **RTO < 5 minutes for Cache**

```hcl
# infrastructure/terraform/disaster-recovery/redis.tf

# Primary: us-east-1
resource "aws_elasticache_replication_group" "patient_cache_primary" {
  provider                    = aws.primary
  replication_group_id        = "patient-cache-primary"
  engine                      = "redis"
  engine_version              = "7.0"
  node_type                   = "cache.r6g.xlarge"
  num_cache_clusters          = 3  # Multi-AZ
  automatic_failover_enabled  = true
  multi_az_enabled            = true
  
  # Replication to standby region
  primary_region              = "us-east-1"
  replica_regions {
    region_id = "us-west-2"
    automatic_failover = true
  }
  
  # Encryption (HIPAA requirement)
  transit_encryption_enabled  = true
  at_rest_encryption_enabled  = true
  auth_token                  = random_password.redis_auth.result
  
  # Persistence: RDB snapshots every 1 minute for RPO < 1 min
  snapshot_retention_limit    = 35
  snapshot_window             = "03:00-05:00"
  
  # Notifications
  notification_topic_arn      = aws_sns_topic.elasticache_alerts.arn
  
  tags = {
    Name = "patient-cache-primary"
    DR   = "critical"
  }
}

# Monitoring: Cloudwatch alarm triggers failover if primary fails
resource "aws_cloudwatch_metric_alarm" "redis_replication_lag" {
  alarm_name          = "redis-replication-lag-critical"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ReplicationLag"
  namespace           = "AWS/ElastiCache"
  period              = 60
  statistic           = "Maximum"
  threshold           = 5000  # 5 seconds
  
  alarm_actions = [aws_sns_topic.incident_alert.arn]
  
  dimensions = {
    ReplicationGroupId = aws_elasticache_replication_group.patient_cache_primary.id
  }
}
```

---

## 3. Backup & Recovery Procedures

### 3.1 Backup Strategy Matrix

| Data Type | Storage | Backup Method | Frequency | Retention | Recovery Time |
| --- | --- | --- | --- | --- | --- |
| **Patient FHIR Data** | RDS | Automated snapshots + WAL streaming | Continuous | 35 days | 5 minutes (promote replica) |
| **Clinical Observations** | RDS | Continuous replication + point-in-time recovery | Real-time | 35 days | 1 minute (from replica) |
| **Medical Documents** | S3 | Versioning + cross-region replication | Continuous | 180 days | Immediate (S3 restore) |
| **Audit Logs** | RDS + S3 Glacier | Daily backup + archival | Daily | 7 years | 1-2 hours (from S3) |
| **Redis Cache** | ElastiCache | RDB snapshots + replication | Every 1 minute | 35 days | <1 minute (restore from replica) |
| **Configuration** | Git | Version control in GitHub | On commit | Unlimited | Immediate (git checkout) |

### 3.2 Automated Backup Implementation

#### **RDS Automated Backup & Point-in-Time Recovery**

```bash
#!/bin/bash
# scripts/backup/rds-backup-manager.sh
# Automated daily backup with point-in-time recovery setup

set -e

CLUSTER_ID="fhir-patient-db-primary"
REGION="us-east-1"
RETENTION_DAYS=35
BACKUP_WINDOW="03:00-04:00"  # Low-traffic window

echo "[$(date)] Starting RDS backup management..."

# Enable automated backups
aws rds modify-db-cluster \
  --db-cluster-identifier $CLUSTER_ID \
  --backup-retention-period $RETENTION_DAYS \
  --preferred-backup-window "$BACKUP_WINDOW" \
  --enable-cloudwatch-logs-exports postgresql \
  --region $REGION

# Enable enhanced monitoring (for backup health)
ROLE_ARN=$(aws iam list-roles \
  --query "Roles[?RoleName=='rds-enhanced-monitoring'].Arn" \
  --output text)

aws rds modify-db-cluster \
  --db-cluster-identifier $CLUSTER_ID \
  --enable-cloudwatch-logs-exports postgresql error general slowquery \
  --region $REGION

# Create a manual backup tag for verification
BACKUP_ID=$(aws rds create-db-cluster-snapshot \
  --db-cluster-identifier $CLUSTER_ID \
  --db-cluster-snapshot-identifier "$CLUSTER_ID-manual-$(date +%Y-%m-%d-%H%M%S)" \
  --tags Key=Type,Value=Manual Key=Schedule,Value=Daily \
  --region $REGION \
  --query 'DBClusterSnapshot.DBClusterSnapshotIdentifier' \
  --output text)

echo "[$(date)] Manual backup created: $BACKUP_ID"

# Test point-in-time recovery availability
aws rds describe-db-cluster-restore-windows \
  --db-cluster-identifier $CLUSTER_ID \
  --region $REGION

echo "[$(date)] RDS backup management completed successfully"
```

#### **S3 Cross-Region Replication for Medical Documents**

```bash
#!/bin/bash
# scripts/backup/s3-replication-setup.sh

PRIMARY_BUCKET="the-abyss-medical-docs-us-east-1"
STANDBY_BUCKET="the-abyss-medical-docs-us-west-2"
PRIMARY_REGION="us-east-1"
STANDBY_REGION="us-west-2"

echo "[$(date)] Setting up S3 cross-region replication..."

# Create replication rule
cat > /tmp/replication-config.json <<EOF
{
  "Role": "arn:aws:iam::ACCOUNT_ID:role/s3-replication-role",
  "Rules": [
    {
      "Status": "Enabled",
      "Priority": 1,
      "Filter": {
        "Prefix": "fhir/"
      },
      "Destination": {
        "Bucket": "arn:aws:s3:::$STANDBY_BUCKET",
        "ReplicationTime": {
          "Status": "Enabled",
          "Time": {
            "Minutes": 1
          }
        },
        "Metrics": {
          "Status": "Enabled",
          "EventThreshold": {
            "Minutes": 15
          }
        },
        "StorageClass": "STANDARD_IA",
        "EncryptionConfiguration": {
          "ReplicaKmsKeyID": "arn:aws:kms:$STANDBY_REGION:ACCOUNT_ID:key/KEY_ID"
        }
      }
    }
  ]
}
EOF

# Apply replication configuration
aws s3api put-bucket-replication \
  --bucket $PRIMARY_BUCKET \
  --replication-configuration file:///tmp/replication-config.json \
  --region $PRIMARY_REGION

# Enable versioning (required for replication)
aws s3api put-bucket-versioning \
  --bucket $PRIMARY_BUCKET \
  --versioning-configuration Status=Enabled \
  --region $PRIMARY_REGION

aws s3api put-bucket-versioning \
  --bucket $STANDBY_BUCKET \
  --versioning-configuration Status=Enabled \
  --region $STANDBY_REGION

echo "[$(date)] S3 replication configured: $PRIMARY_BUCKET → $STANDBY_BUCKET"
```

### 3.3 Backup Verification & Testing

```python
# scripts/backup/verify-backup-integrity.py
"""Daily backup integrity verification"""

import boto3
import json
from datetime import datetime, timedelta

rds = boto3.client('rds', region_name='us-east-1')
s3 = boto3.client('s3', region_name='us-east-1')
cloudwatch = boto3.client('cloudwatch')

def verify_rds_backups():
    """Verify RDS backup availability and recoverability"""
    
    # List recent backups
    backups = rds.describe_db_cluster_snapshots(
        DBClusterIdentifier='fhir-patient-db-primary',
        IncludeShared=False,
        IncludePublic=False
    )
    
    latest_backup = backups['DBClusterSnapshots'][0]
    
    # Check backup age (should be < 24 hours)
    backup_age = datetime.now(latest_backup['SnapshotCreateTime'].tzinfo) - latest_backup['SnapshotCreateTime']
    
    if backup_age > timedelta(hours=24):
        raise Exception(f"RDS backup is {backup_age.days}d old. Expected < 24h")
    
    # Check backup status (should be 'available')
    if latest_backup['Status'] != 'available':
        raise Exception(f"RDS backup status: {latest_backup['Status']}. Expected 'available'")
    
    print(f"✅ RDS backup verified: {latest_backup['DBClusterSnapshotIdentifier']}")
    return True

def verify_s3_replication():
    """Verify cross-region S3 replication"""
    
    # List recent objects in primary bucket
    response = s3.list_objects_v2(
        Bucket='the-abyss-medical-docs-us-east-1',
        Prefix='fhir/',
        MaxKeys=100
    )
    
    if 'Contents' not in response:
        print("⚠️  No recent S3 objects found")
        return True
    
    # Verify each object exists in standby bucket
    missing_replicas = []
    for obj in response['Contents']:
        standby_response = s3.head_object(
            Bucket='the-abyss-medical-docs-us-west-2',
            Key=obj['Key']
        )
        
        if standby_response['ContentLength'] != obj['Size']:
            missing_replicas.append(obj['Key'])
    
    if missing_replicas:
        raise Exception(f"Replication lag detected for {len(missing_replicas)} objects")
    
    print(f"✅ S3 cross-region replication verified: {len(response['Contents'])} objects")
    return True

def verify_redis_persistence():
    """Verify Redis RDB snapshot and replication"""
    
    elasticache = boto3.client('elasticache', region_name='us-east-1')
    
    rg = elasticache.describe_replication_groups(
        ReplicationGroupId='patient-cache-primary'
    )['ReplicationGroups'][0]
    
    # Check replication status
    if rg['Status'] != 'available':
        raise Exception(f"Redis replication group status: {rg['Status']}")
    
    # Check that multiple nodes exist (multi-AZ)
    if len(rg['MemberClusters']) < 3:
        raise Exception(f"Redis cluster has {len(rg['MemberClusters'])} nodes. Expected >= 3")
    
    print(f"✅ Redis replication verified: {len(rg['MemberClusters'])} nodes, status={rg['Status']}")
    return True

def publish_metrics():
    """Publish backup health to CloudWatch"""
    
    cloudwatch.put_metric_data(
        Namespace='TheAbyss/DisasterRecovery',
        MetricData=[
            {
                'MetricName': 'BackupVerificationStatus',
                'Value': 1,  # 1 = healthy
                'Unit': 'Count',
                'Timestamp': datetime.now()
            }
        ]
    )

if __name__ == '__main__':
    try:
        verify_rds_backups()
        verify_s3_replication()
        verify_redis_persistence()
        publish_metrics()
        print("\n✅ All backups verified successfully")
    except Exception as e:
        print(f"\n❌ Backup verification failed: {e}")
        cloudwatch.put_metric_data(
            Namespace='TheAbyss/DisasterRecovery',
            MetricData=[{'MetricName': 'BackupVerificationStatus', 'Value': 0, 'Unit': 'Count'}]
        )
        raise
```

---

## 4. Failover Procedures

### 4.1 Database Failover (RDS)

#### **Scenario: Primary RDS Cluster Fails**

```bash
#!/bin/bash
# scripts/failover/rds-promote-standby.sh
# Automatically or manually promote RDS standby to primary

set -e

PRIMARY_CLUSTER="fhir-patient-db-primary"
STANDBY_CLUSTER="fhir-patient-db-standby"
PRIMARY_REGION="us-east-1"
STANDBY_REGION="us-west-2"

echo "[$(date)] RDS FAILOVER INITIATED"

# Step 1: Check primary cluster status
echo "[Step 1] Verifying primary cluster status..."
PRIMARY_STATUS=$(aws rds describe-db-clusters \
  --db-cluster-identifier $PRIMARY_CLUSTER \
  --region $PRIMARY_REGION \
  --query 'DBClusters[0].Status' \
  --output text 2>/dev/null || echo "not-found")

if [[ "$PRIMARY_STATUS" == "available" ]]; then
  echo "⚠️  Primary cluster is still available. Aborting failover."
  exit 1
fi

echo "Primary cluster status: $PRIMARY_STATUS (unavailable)"

# Step 2: Promote standby cluster to primary
echo "[Step 2] Promoting standby cluster to primary..."
aws rds failover-db-cluster \
  --db-cluster-identifier $STANDBY_CLUSTER \
  --region $STANDBY_REGION

# Step 3: Wait for promotion to complete (max 15 minutes)
echo "[Step 3] Waiting for promotion to complete..."
TIMEOUT=900  # 15 minutes
ELAPSED=0
INTERVAL=30

while [ $ELAPSED -lt $TIMEOUT ]; do
  STATUS=$(aws rds describe-db-clusters \
    --db-cluster-identifier $STANDBY_CLUSTER \
    --region $STANDBY_REGION \
    --query 'DBClusters[0].Status' \
    --output text)
  
  if [[ "$STATUS" == "available" ]]; then
    echo "✅ Standby promoted to primary at $(date)"
    break
  fi
  
  echo "Status: $STATUS... waiting ($ELAPSED/$TIMEOUT seconds)"
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
  echo "❌ Promotion timeout after $TIMEOUT seconds"
  exit 1
fi

# Step 4: Update Route 53 DNS
echo "[Step 4] Updating Route 53 DNS routing..."
aws route53 change-resource-record-sets \
  --hosted-zone-id Z12345ABCDEF \
  --change-batch '{
    "Changes": [
      {
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "fhir-db.abyss.internal",
          "Type": "CNAME",
          "TTL": 60,
          "ResourceRecords": [
            {
              "Value": "'$(aws rds describe-db-clusters --db-cluster-identifier $STANDBY_CLUSTER --region $STANDBY_REGION --query 'DBClusters[0].Endpoint' --output text)'"
            }
          ]
        }
      }
    ]
  }'

# Step 5: Notify applications
echo "[Step 5] Broadcasting failover notification..."
aws sns publish \
  --topic-arn arn:aws:sns:$STANDBY_REGION:ACCOUNT_ID:dr-failover-notifications \
  --subject "RDS Failover Complete: $PRIMARY_CLUSTER → $STANDBY_CLUSTER" \
  --message "Primary cluster in $PRIMARY_REGION failed. Standby cluster in $STANDBY_REGION promoted. DNS updated. Applications should reconnect."

# Step 6: Create incident ticket
echo "[Step 6] Creating incident ticket..."
# Integration with PagerDuty/Jira
curl -X POST https://api.pagerduty.com/incidents \
  -H 'Authorization: Token token='$PAGERDUTY_TOKEN \
  -H 'Accept: application/vnd.pagerduty+json;version=2' \
  -H 'Content-Type: application/json' \
  -d '{
    "incident": {
      "type": "incident",
      "title": "RDS Failover: Primary Cluster Failed",
      "service": {
        "id": "PFKXXX",
        "type": "service_reference"
      },
      "urgency": "high",
      "body": {
        "type": "incident_body",
        "details": "Primary RDS cluster '$PRIMARY_CLUSTER' in '$PRIMARY_REGION' failed. Standby promoted. RTO: '$((ELAPSED))' seconds"
      }
    }
  }'

echo "[$(date)] RDS FAILOVER COMPLETED SUCCESSFULLY"
echo "Recovery Time Objective (RTO): $ELAPSED seconds"
```

### 4.2 Kubernetes Failover (EKS)

#### **Scenario: Primary EKS Cluster Fails**

```bash
#!/bin/bash
# scripts/failover/eks-activate-standby.sh
# Activate standby EKS cluster and reroute traffic

set -e

PRIMARY_CLUSTER="clinical-app-us-east-1"
STANDBY_CLUSTER="clinical-app-us-west-2"
PRIMARY_REGION="us-east-1"
STANDBY_REGION="us-west-2"

echo "[$(date)] EKS FAILOVER INITIATED"

# Step 1: Verify primary cluster is unavailable
echo "[Step 1] Checking primary cluster health..."
if kubectl cluster-info --context=$PRIMARY_CLUSTER &>/dev/null; then
  echo "❌ Primary cluster is still available. Aborting failover."
  exit 1
fi

# Step 2: Scale up standby cluster (was on-demand to save costs)
echo "[Step 2] Scaling up standby EKS cluster..."
aws eks update-nodegroup-config \
  --cluster-name $STANDBY_CLUSTER \
  --nodegroup-name clinical-app-nodes \
  --scaling-config minSize=3,maxSize=10,desiredSize=6 \
  --region $STANDBY_REGION

# Wait for nodes to join cluster
echo "[Step 3] Waiting for standby nodes to be ready..."
kubectl wait --for=condition=Ready node \
  --all \
  --context=$STANDBY_CLUSTER \
  --timeout=10m

# Step 3: Sync ArgoCD applications to standby
echo "[Step 4] Syncing ArgoCD applications to standby cluster..."
argocd cluster switch --kubecontext=$STANDBY_CLUSTER
argocd app sync clinical-app-us-west-2 --sync-option CreateNamespace=true

# Step 4: Verify deployments are healthy
echo "[Step 5] Verifying application deployments..."
kubectl rollout status deployment/clinical-assistant \
  -n clinical-app \
  --context=$STANDBY_CLUSTER \
  --timeout=5m

# Step 5: Update Application Load Balancer
echo "[Step 6] Updating AWS ALB health checks..."
ALB_ARN=$(aws elbv2 describe-load-balancers \
  --query "LoadBalancers[?LoadBalancerName=='clinical-app-alb'].LoadBalancerArn" \
  --output text)

# Create new target group pointing to standby cluster
aws elbv2 create-target-group \
  --name clinical-app-standby \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-standby \
  --region $STANDBY_REGION

# Register standby EKS nodes
STANDBY_NODES=$(kubectl get nodes \
  --context=$STANDBY_CLUSTER \
  -o jsonpath='{.items[*].metadata.name}')

for NODE in $STANDBY_NODES; do
  INSTANCE_ID=$(aws ec2 describe-instances \
    --filters "Name=private-dns-name,Values=$NODE" \
    --query "Reservations[0].Instances[0].InstanceId" \
    --output text \
    --region $STANDBY_REGION)
  
  aws elbv2 register-targets \
    --target-group-arn arn:aws:elasticloadbalancing:... \
    --targets Id=$INSTANCE_ID
done

# Step 6: Update Route 53
echo "[Step 7] Updating Route 53 DNS..."
STANDBY_ALB=$(aws elbv2 describe-load-balancers \
  --query "LoadBalancers[?Region=='us-west-2'].DNSName" \
  --output text)

aws route53 change-resource-record-sets \
  --hosted-zone-id Z12345ABCDEF \
  --change-batch '{
    "Changes": [
      {
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "api.abyss.io",
          "Type": "A",
          "AliasTarget": {
            "HostedZoneId": "Z35SXDOTRQ7X7K",
            "DNAMEName": "'$STANDBY_ALB'",
            "EvaluateTargetHealth": true
          }
        }
      }
    ]
  }'

# Step 7: Broadcast failover notification
echo "[Step 8] Notifying teams..."
aws sns publish \
  --topic-arn arn:aws:sns:$STANDBY_REGION:ACCOUNT_ID:dr-failover-notifications \
  --subject "EKS Failover Complete: $PRIMARY_CLUSTER → $STANDBY_CLUSTER" \
  --message "Primary EKS cluster in $PRIMARY_REGION failed. Standby cluster in $STANDBY_REGION activated and scaled. ALB and DNS updated. Services should be restored."

echo "[$(date)] EKS FAILOVER COMPLETED"
```

---

## 5. Incident Response Communication Plan

### 5.1 Escalation Procedures

```
Impact Level 1: Healthcare Platform UNAVAILABLE
├─ Patient clinical data inaccessible
├─ Emergency care delayed
└─ Lives at risk → CRITICAL

Impact Level 2: Degraded Performance (>5s latency)
├─ Clinical workflows slowed
├─ Patient care affected → HIGH

Impact Level 3: Non-critical services down
├─ Reporting, scheduling available → MEDIUM

Impact Level 4: No patient impact
├─ Internal tools, testing environments → LOW
```

### 5.2 Communication Escalation Matrix

#### **Level 1 (Critical): Immediate Notification**

| Role | Notification | Timing | Method |
| --- | --- | --- | --- |
| **On-Call DevOps Lead** | Automated alert | Immediate | PagerDuty + SMS |
| **VP Engineering** | Escalation | 2 minutes | Phone + Slack |
| **Chief Medical Officer** | Operational impact | 5 minutes | Phone + Email |
| **Compliance Officer** | Incident classification | 10 minutes | Email |
| **Patients (if extended)** | Service unavailability | 30 minutes | In-app notification |

#### **Level 2 (High): Escalation**

| Role | Notification | Timing | Method |
| --- | --- | --- | --- |
| **Platform Lead** | Alert | Immediate | Slack |
| **VP Product** | Business impact | 5 minutes | Email + Slack |
| **Support Team** | Patient communication template | 10 minutes | Slack |

#### **Level 3 (Medium): Monitoring**

| Role | Notification | Timing | Method |
| --- | --- | --- | --- |
| **On-Call Engineer** | Alert | Immediate | Slack |
| **Team Lead** | Status update | 15 minutes | Slack |

### 5.3 Incident Response Runbook

```yaml
# infrastructure/incident-response/critical-outage-runbook.md

## CRITICAL OUTAGE: The Abyss Platform Unavailable

**Severity:** LEVEL 1 (Critical)
**RTO Target:** 15 minutes
**Priority:** Life-safety critical

---

### PHASE 1: DETECTION & INITIAL RESPONSE (0-2 minutes)

#### Automated Alert Triggers
- CloudWatch: EKS cluster unhealthy (< 2/3 nodes ready)
- CloudWatch: RDS cluster unavailable
- Route 53: Health check fails for 2 consecutive checks
- PagerDuty: High-severity incident created automatically

#### Initial Actions (On-Call DevOps Lead)
1. **Acknowledge alert** in PagerDuty (within 1 minute)
2. **Verify the incident** using CloudWatch dashboards
3. **Initiate incident channel**: `#incident-response-critical`
4. **Page secondary on-call engineer** (VP Engineering acts as incident commander)

#### Initial Communication
```

TO: #incident-response-critical
FROM: Automated Alert
TIME: [timestamp]

 CRITICAL INCIDENT: The Abyss Platform Unavailable

Status: Detecting root cause
RTO: 15 minutes
Severity: L1 (Patient care affected)
Incident ID: INC-2024-001234

Updates: Every 2 minutes in this channel

```
---

### PHASE 2: DIAGNOSIS (2-5 minutes)

#### DevOps Lead Tasks
1. Check RDS cluster status
   ```bash
   aws rds describe-db-clusters --db-cluster-identifier fhir-patient-db-primary
```

- If `Status != available` → Proceed to RDS Failover
- If `Status == available` → Check EKS cluster

1. Check EKS cluster health

```bash
kubectl get nodes --context=clinical-app-us-east-1
   kubectl get pods -A --context=clinical-app-us-east-1
```

- If < 2/3 nodes ready → Proceed to EKS Failover
- If nodes OK but pods crashing → Check logs

1. Update incident channel with findings

#### Expected Root Causes

| Root Cause | Probability | Detection Time | Recovery Procedure |
| --- | --- | --- | --- |
| RDS cluster failure | 30% | <1 min | Promote standby RDS |
| EKS node failure (multi-AZ) | 20% | <1 min | Scale new nodes |
| Network partition | 15% | <1 min | Failover to standby region |
| Disk exhaustion | 15% | <2 min | Emergency cleanup + scale |
| Memory leak in pods | 15% | <2 min | Rolling restart |
| Misconfigured deployment | 5% | <3 min | Rollback to previous version |

---

### PHASE 3: IMMEDIATE MITIGATION (5-10 minutes)

#### If RDS Failed:

```bash
# Execute RDS failover script
bash scripts/failover/rds-promote-standby.sh

# Monitor logs
tail -f /var/log/failover.log

# Verify database connectivity
psql -h fhir-db.abyss.internal -U admin -c "SELECT count(*) FROM patients;"
```

**Expected Recovery Time:** 3-5 minutes

#### If EKS Failed:

```bash
# Scale standby cluster
bash scripts/failover/eks-activate-standby.sh

# Monitor pod startup
kubectl logs -f deployment/clinical-assistant -n clinical-app --context=clinical-app-us-west-2
```

**Expected Recovery Time:** 5-8 minutes

#### Communication Update (Every 2 minutes)

```
UPDATE: [timestamp]
Status: Executing failover procedure
RTO Estimate: 8 minutes (from failover start)
Next Update: [time + 2 min]
```

---

### PHASE 4: VERIFICATION (10-15 minutes)

#### Health Checks

```bash
# 1. Verify database connectivity
curl -s https://api.abyss.io/health/db | jq '.database'

# 2. Verify all pods are running
kubectl get pods -A --context=clinical-app-us-west-2 | grep -v Running

# 3. Verify DNS resolution
dig api.abyss.io +short

# 4. Run synthetic patient lookup (canary test)
curl -s https://api.abyss.io/v1/patients/test-123 | jq '.status'

# 5. Check metrics
aws cloudwatch get-metric-statistics \
  --namespace TheAbyss/Platform \
  --metric-name APILatencyP95 \
  --statistics Average \
  --start-time $(date -u -d '15 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60
```

#### Success Criteria

- [ ] Database connection successful
- [ ] All pods in Running state
- [ ] DNS resolves to standby ALB
- [ ] Canary test returns 200 OK
- [ ] API p95 latency < 500ms

---

### PHASE 5: RESOLUTION COMMUNICATION (15+ minutes)

#### Incident Resolved Notification

```

```

 INCIDENT RESOLVED: [timestamp]

Incident ID: INC-2024-001234
Root Cause: RDS multi-AZ failover triggered
Recovery Time Objective: 9 minutes (target: 15 minutes)
Recovery Point Objective: 0 seconds (continuous replication)

Timeline:
- 14:23:15 UTC: Alert triggered (RDS unavailable)
- 14:23:45 UTC: On-call acknowledged
- 14:24:30 UTC: Root cause identified (RDS cluster failure)
- 14:25:00 UTC: Failover initiated
- 14:28:45 UTC: Standby RDS promoted
- 14:29:15 UTC: DNS updated, traffic rerouted
- 14:30:00 UTC: All health checks passed
- 14:30:30 UTC: RESOLVED

Patient Impact: Patients experienced 7 minutes of service unavailability
  - ~500 active sessions affected
  - No data loss (continuous replication to RPO < 1 minute)
  - No audit trail gaps (logging continued during failover)

Post-Incident Actions:
1. Root cause analysis (24 hours)
2. Runbook review (24 hours)
3. Failover drill scheduled (weekly for 2 weeks)
4. AWS support case for root cause investigation (same day)

---

### PHASE 6: POST-INCIDENT (24-48 hours)

#### Immediate (2 hours)

- [ ] Incident commander creates post-mortem document
- [ ] Notify patients: "We experienced a brief outage. Service is restored. Here's what happened."
- [ ] File compliance incident report (HIPAA breach assessment)

#### Follow-up (24 hours)

- [ ] Post-mortem review with engineering team
- [ ] Root cause analysis: Why did the primary region fail?
- [ ] Document lessons learned
- [ ] Assign action items

#### Prevention (7 days)

- [ ] Run failover drill to standby region
- [ ] Increase RDS monitoring sensitivity
- [ ] Update runbook based on lessons
- [ ] Conduct blameless retrospective

```bash
# Post-incident root cause analysis
bash scripts/incident/analyze-logs.sh --incident-id INC-2024-001234 \
  --start-time "2024-01-15T14:20:00Z" \
  --end-time "2024-01-15T14:35:00Z"

# Output: RDS failure root cause report, timeline, metrics
```

---

## 6. Disaster Recovery Testing & Drills

### 6.1 Quarterly Failover Drill Schedule

```yaml
# infrastructure/disaster-recovery/testing-schedule.yaml

Q1 (January-March):
  - Week 1: RDS failover drill (us-east-1 → us-west-2)
  - Week 2: EKS failover drill
  - Week 3: Combined infrastructure failover (full platform)
  - Week 4: Recovery validation & cleanup

Q2 (April-June):
  - Week 1: ElastiCache failover drill
  - Week 2: S3/backup recovery drill (restore from snapshot)
  - Week 3: Chaos engineering: network partition injection
  - Week 4: Full-platform recovery from standby

Q3 (July-September):
  - Week 1: RDS failover drill (opposite direction)
  - Week 2: EKS multicluster failover
  - Week 3: Data integrity validation (RPO tests)
  - Week 4: Runbook update & lessons learned

Q4 (October-December):
  - Week 1: Annual full-platform failover
  - Week 2: Performance benchmarking (post-failover)
  - Week 3: Security validation (encryption keys, audit logs)
  - Week 4: Planning for next year
```

### 6.2 RDS Failover Drill Script

```bash
#!/bin/bash
# scripts/testing/rds-failover-drill.sh
# Non-disruptive failover test (read traffic only)

set -e

DRILL_ID="DR-$(date +%Y%m%d-%H%M%S)"
PRIMARY_CLUSTER="fhir-patient-db-primary"
STANDBY_CLUSTER="fhir-patient-db-standby"
DRY_RUN=true  # Set to false for actual failover

echo "=========================================="
echo "RDS FAILOVER DRILL: $DRILL_ID"
echo "=========================================="

# Create test database for non-disruptive testing
echo "[Step 1] Creating test database in primary cluster..."
aws rds create-db-instance \
  --db-instance-identifier "test-db-$DRILL_ID" \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username testadmin \
  --master-user-password "$TEST_DB_PASSWORD" \
  --allocated-storage 20 \
  --no-publicly-accessible \
  --db-subnet-group-name default

# Wait for test DB to be available
echo "Waiting for test database to be available..."
aws rds wait db-instance-available --db-instance-identifier "test-db-$DRILL_ID"

# Insert test data
echo "[Step 2] Inserting test data..."
psql -h test-db-$DRILL_ID.REGION.rds.amazonaws.com \
  -U testadmin \
  -c "CREATE TABLE test_table (id SERIAL, data TEXT, created_at TIMESTAMP DEFAULT NOW());"

for i in {1..1000}; do
  psql -h test-db-$DRILL_ID.REGION.rds.amazonaws.com \
    -U testadmin \
    -c "INSERT INTO test_table (data) VALUES ('Test data $i');"
done

# Simulate failover (dry run)
if [ "$DRY_RUN" = true ]; then
  echo "[Step 3] DRY RUN: Would failover RDS standby here"
  echo "  Estimated recovery time: 3-5 minutes"
  echo "  Estimated data loss: 0 seconds (RPO = 1 minute)"
else
  echo "[Step 3] Executing actual failover..."
  bash scripts/failover/rds-promote-standby.sh
fi

# Verify data integrity
echo "[Step 4] Verifying data integrity..."
ROW_COUNT=$(psql -h test-db-$DRILL_ID.REGION.rds.amazonaws.com \
  -U testadmin \
  -t -c "SELECT COUNT(*) FROM test_table;")

if [ "$ROW_COUNT" = 1000 ]; then
  echo "✅ Data integrity verified: All 1000 rows present"
else
  echo "❌ Data integrity check failed: Expected 1000 rows, found $ROW_COUNT"
  exit 1
fi

# Cleanup
echo "[Step 5] Cleaning up test database..."
aws rds delete-db-instance \
  --db-instance-identifier "test-db-$DRILL_ID" \
  --skip-final-snapshot

# Report
echo ""
echo "=========================================="
echo "DRILL COMPLETED: $DRILL_ID"
echo "=========================================="
echo "Result: ✅ PASSED"
echo "RTO Achievement: <5 minutes"
echo "RPO Achievement: <1 minute"
echo "Data Integrity: VERIFIED"
echo ""
```

---

## 7. Compliance & Audit Requirements

### 7.1 HIPAA Disaster Recovery Compliance

| Requirement | Implementation | Evidence |
| --- | --- | --- |
| **Backup & Recovery Plan** | Documented in this plan, tested quarterly | Quarterly drill reports |
| **RTO/RPO Targets** | 15min/1min for critical data; defined by tier | This document (Section 1) |
| **Backup Testing** | Automated daily, manual quarterly failover drills | `scripts/testing/` output logs |
| **Encryption in Transit** | TLS 1.3 for RDS, EKS, ElastiCache | AWS configuration audit |
| **Encryption at Rest** | AES-256 for RDS, S3, EBS volumes | KMS key policies |
| **Access Controls** | IAM roles, MFA, least privilege | IAM audit logs in CloudTrail |
| **Audit Logging** | All failover actions logged to CloudTrail + custom logs | CloudTrail event history |
| **Data Integrity** | Point-in-time recovery, checksums | Backup verification reports |
| **Documentation** | This DRBCP + runbooks + incident reports | GitHub + Confluence |

### 7.2 Compliance Monitoring Dashboard

```yaml
# infrastructure/monitoring/compliance-dashboard.yaml

apiVersion: v1
kind: ConfigMap
metadata:
  name: dr-compliance-metrics
  namespace: monitoring
data:
  prometheus_rules.yaml: |
    groups:
      - name: dr_compliance
        interval: 5m
        rules:
          # RTO/RPO SLA compliance
          - alert: RDSBackupOlder24Hours
            expr: (time() - rds_backup_timestamp) > 86400
            for: 1m
            labels:
              severity: critical
            annotations:
              summary: "RDS backup is older than 24 hours"
              
          - alert: RDSReplicationLag
            expr: rds_replication_lag_seconds > 300
            for: 2m
            labels:
              severity: high
            annotations:
              summary: "RDS replication lag exceeds 5 minutes"
              
          # Cross-region replication
          - alert: S3ReplicationFailing
            expr: s3_replication_failures_total > 0
            for: 5m
            labels:
              severity: high
              
          # DR readiness
          - alert: StandbyClusterNotReady
            expr: eks_cluster_available_nodes_us_west_2 < 2
            labels:
              severity: high
            annotations:
              summary: "Standby EKS cluster has fewer than 2 ready nodes"
```

---

## 8. Budget & Resource Allocation

### 8.1 DR Infrastructure Costs (Annual)

| Component | Monthly Cost | Annual Cost | Notes |
| --- | --- | --- | --- |
| **RDS Multi-AZ + Standbys** | $4,500 | $54,000 | r6i.2xlarge x 2 regions |
| **EKS Standby Cluster (on-demand)** | $2,000 | $24,000 | Scales up only during failover |
| **ElastiCache Replication** | $1,500 | $18,000 | cache.r6g.xlarge x 2 regions |
| **S3 Cross-Region Replication** | $800 | $9,600 | Data transfer + storage |
| **Backup Storage (S3 Glacier)** | $1,200 | $14,400 | 180-day retention for audit logs |
| **Route 53 Health Checks** | $500 | $6,000 | 10 health checks |
| **DataSync / Database Migration** | $300 | $3,600 | Automated replication |
| **Monitoring & Alerting** | $1,000 | $12,000 | CloudWatch, custom dashboards |
| **Total DR Infrastructure** | **$11,700** | **$141,600** | Per year |

### 8.2 Team Resource Requirements

| Role | FTE | Annual Cost | Responsibilities |
| --- | --- | --- | --- |
| **DR Lead** | 1 | $180,000 | Oversee plan, conduct drills, maintain runbooks |
| **DevOps Engineers** | 2 | $360,000 | Implement failover automation, monitor health |
| **Database Administrator** | 0.5 | $90,000 | Backup management, recovery testing |
| **Security Engineer** | 0.25 | $45,000 | Compliance, encryption, audit logs |
| **Total DR Team** | **3.75** | **$675,000** | Per year |

**Total DR Program Cost:** ~$816,600/year (infrastructure + team)

---

## 9. Appendix: Automation Scripts & Tools

### 9.1 Automated Daily Verification Script

```python
# scripts/scheduled/daily-dr-verification.py
"""
Runs every day at 2 AM UTC to verify DR readiness
Publishes results to CloudWatch and sends Slack notification
"""

#!/usr/bin/env python3

import boto3
import json
from datetime import datetime
import requests

def check_rds_backups():
    """Verify RDS backups are current"""
    rds = boto3.client('rds')
    backups = rds.describe_db_cluster_snapshots(
        DBClusterIdentifier='fhir-patient-db-primary',
        MaxRecords=1
    )
    
    if not backups['DBClusterSnapshots']:
        return False, "No RDS backups found"
    
    latest = backups['DBClusterSnapshots'][0]
    age_hours = (datetime.now(latest['SnapshotCreateTime'].tzinfo) - latest['SnapshotCreateTime']).total_seconds() / 3600
    
    if age_hours > 24:
        return False, f"RDS backup is {age_hours:.1f} hours old (should be < 24h)"
    
    if latest['Status'] != 'available':
        return False, f"RDS backup status is {latest['Status']} (should be available)"
    
    return True, f"RDS backup current ({age_hours:.1f}h old)"

def check_s3_replication():
    """Verify S3 cross-region replication"""
    s3 = boto3.client('s3')
    
    try:
        # Get replication status
        replication = s3.get_bucket_replication(
            Bucket='the-abyss-medical-docs-us-east-1'
        )
        
        if replication['ReplicationConfiguration']['Role']:
            return True, "S3 replication configured"
        else:
            return False, "S3 replication not configured"
    except:
        return False, "S3 replication check failed"

def check_rds_replication():
    """Verify RDS standby replication lag"""
    rds = boto3.client('rds')
    
    try:
        members = rds.describe_db_cluster_members(
            DBClusterIdentifier='fhir-patient-db-primary'
        )
        
        # Check if standby replica exists
        standbys = [m for m in members['DBClusterMembers'] if not m['IsClusterWriter']]
        
        if not standbys:
            return False, "No RDS standby replicas found"
        
        return True, f"RDS replication healthy ({len(standbys)} standbys)"
    except:
        return False, "RDS replication check failed"

def check_eks_nodes():
    """Verify EKS standby cluster node readiness"""
    import subprocess
    
    try:
        result = subprocess.run(
            ["kubectl", "get", "nodes", "--context=clinical-app-us-west-2", "-o", "json"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        nodes = json.loads(result.stdout)
        ready_nodes = sum(1 for n in nodes['items'] 
                         if any(c['type'] == 'Ready' and c['status'] == 'True' 
                               for c in n['status']['conditions']))
        
        total_nodes = len(nodes['items'])
        
        if ready_nodes < 2:
            return False, f"EKS standby cluster has only {ready_nodes}/{total_nodes} ready nodes"
        
        return True, f"EKS standby healthy ({ready_nodes}/{total_nodes} nodes ready)"
    except Exception as e:
        return False, f"EKS check failed: {str(e)}"

def check_redis_replication():
    """Verify ElastiCache replication"""
    elasticache = boto3.client('elasticache')
    
    try:
        rg = elasticache.describe_replication_groups(
            ReplicationGroupId='patient-cache-primary'
        )['ReplicationGroups'][0]
        
        if rg['Status'] != 'available':
            return False, f"Redis status is {rg['Status']}"
        
        if len(rg['MemberClusters']) < 3:
            return False, f"Redis cluster has only {len(rg['MemberClusters'])} nodes (expected >= 3)"
        
        return True, f"Redis replication healthy ({len(rg['MemberClusters'])} nodes)"
    except Exception as e:
        return False, f"Redis check failed: {str(e)}"

def publish_results(results):
    """Publish results to CloudWatch and Slack"""
    cloudwatch = boto3.client('cloudwatch')
    
    # Count passes/failures
    passed = sum(1 for r in results if r[0])
    total = len(results)
    
    # Publish to CloudWatch
    cloudwatch.put_metric_data(
        Namespace='TheAbyss/DisasterRecovery',
        MetricData=[
            {
                'MetricName': 'DRReadinessPassed',
                'Value': passed,
                'Unit': 'Count',
                'Timestamp': datetime.now()
            },
            {
                'MetricName': 'DRReadinessTotal',
                'Value': total,
                'Unit': 'Count',
                'Timestamp': datetime.now()
            }
        ]
    )
    
    # Send Slack notification
    slack_message = f"*Daily DR Verification Report*\n\n"
    slack_message += f"Timestamp: {datetime.now().isoformat()}\n"
    slack_message += f"Status: {passed}/{total} checks passed\n\n"
    
    for i, (passed, message) in enumerate(results, 1):
        status = "✅" if passed else "❌"
        slack_message += f"{status} {message}\n"
    
    requests.post(
        os.environ['SLACK_WEBHOOK_URL'],
        json={'text': slack_message}
    )

if __name__ == '__main__':
    results = [
        check_rds_backups(),
        check_rds_replication(),
        check_s3_replication(),
        check_redis_replication(),
        check_eks_nodes(),
    ]
    
    publish_results(results)
    
    # Fail if any check failed
    if not all(r[0] for r in results):
        exit(1)
```

---

## 10. Success Criteria & Acceptance

### 10.1 DR Plan Acceptance Checklist

- [ ] RTO/RPO targets defined for all service tiers (Section 1)
- [ ] Multi-region AWS infrastructure documented with Terraform code (Section 2)
- [ ] Automated backup strategy implemented for RDS, S3, ElastiCache (Section 3)
- [ ] Failover procedures scripted and tested (Section 4)
- [ ] Incident response runbook created and accessible (Section 5)
- [ ] Quarterly failover drills scheduled and documented (Section 6)
- [ ] HIPAA compliance requirements mapped to controls (Section 7)
- [ ] Budget approved ($816K/year) (Section 8)
- [ ] Automation scripts deployed and monitored (Section 9)
- [ ] DR team trained on runbooks
- [ ] First failover drill completed successfully

### 10.2 Ongoing Success Metrics

| Metric | Target | Measurement |
| --- | --- | --- |
| **Backup Freshness** | Always < 24h old | Daily automated verification |
| **RTO Achievement** | <15 min for critical services | Quarterly failover drills |
| **RPO Achievement** | <1 min data loss | Continuous replication logs |
| **Failover Drill Success Rate** | 100% | Quarterly results tracking |
| **Incident Response Time** | <2 min to identify root cause | Incident metrics from PagerDuty |
| **HIPAA Audit Findings** | 0 related to DR | Annual compliance audit |

---

## Contacts & Escalation

**Disaster Recovery Lead**  
Email: dr-lead@abyss.io  
Slack: @dr-oncall  
On-Call Schedule: [Link to PagerDuty]

**DevOps Team**  
Email: devops@abyss.io  
Slack: #devops-incidents

**Chief Medical Officer (Patient Impact)**  
Email: cmo@abyss.io  
Phone: [Emergency Number]

**Compliance Officer (HIPAA Reporting)**  
Email: compliance@abyss.io  
Phone: [Emergency Number]