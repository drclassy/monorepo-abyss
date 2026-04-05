# Maintenance Instructions

## 1. Overview

This document provides comprehensive maintenance procedures for the Claudesy Memory Engine, including routine tasks, monitoring, backup and recovery, performance tuning, and troubleshooting procedures.

## 2. Routine Maintenance Tasks

### 2.1 Daily Maintenance

**Health Check:**

```bash
# Check system status
claudesy-engine health

# Verify daemon is running
ps aux | grep "claudesy-engine daemon"

# Check recent logs
tail -20 ~/.claudesy/logs/claudesy.log
```

**Memory Cycle:**

```bash
# Run full memory maintenance cycle
claudesy-engine run

# Verify operation completed successfully
echo "Last run: $(date)" >> maintenance.log
```

**Storage Cleanup:**

```bash
# Check disk usage
du -sh ~/.claudesy

# Archive old sessions (if not automated)
claudesy-engine run  # Includes archiving

# Clean temporary files
find ~/.claudesy -name "*.tmp" -mtime +1 -delete
```

### 2.2 Weekly Maintenance

**Database Maintenance:**

```bash
# SQLite optimization
sqlite3 ~/.claudesy/agents/*/memory.db << 'EOF'
VACUUM;
ANALYZE;
PRAGMA optimize;
EOF

# Check database integrity
for db in ~/.claudesy/agents/*/memory.db; do
    echo "Checking $db..."
    sqlite3 "$db" "PRAGMA integrity_check;" | grep -v ok || echo "Integrity check failed for $db"
done
```

**Log Rotation:**

```bash
# Rotate application logs
logrotate -f /etc/logrotate.d/claudesy 2>/dev/null || {
    # Manual rotation if logrotate not configured
    for log in ~/.claudesy/logs/*.log; do
        [ -f "$log" ] && mv "$log" "${log}.old"
    done
    kill -HUP $(pgrep -f "claudesy-engine daemon") 2>/dev/null || true
}
```

**Performance Monitoring:**

```bash
# Check memory usage trends
claudesy-engine health | grep -E "(facts|memory|performance)"

# Monitor extraction times
time claudesy-engine extract

# Check for slow queries
sqlite3 ~/.claudesy/agents/*/memory.db ".timer on" "SELECT COUNT(*) FROM facts;"
```

### 2.3 Monthly Maintenance

**Archive Verification:**

```bash
# Verify archive integrity
for archive in ~/.claudesy/agents/*/sessions/archive/*.zip; do
    echo "Verifying $archive..."
    unzip -t "$archive" > /dev/null 2>&1 && echo "OK" || echo "FAILED: $archive"
done
```

**Fact Quality Review:**

```bash
# Check for facts with very low importance
claudesy-engine inspect --category semantic --limit 100 | grep -E "importance.*0\.[0-2]"

# Review old facts that haven't been accessed
claudesy-engine search "" --limit 50 | grep -E "accessed.*202[0-3]"
```

**Dependency Updates:**

```bash
# Check for Python package updates
pip list --outdated | grep -E "(claudesy|ollama|sqlite)"

# Update if safe
pip install --upgrade claudesy-memory
```

### 2.4 Quarterly Maintenance

**Full System Audit:**

```bash
# Complete health assessment
claudesy-engine health

# Check all agent directories
find ~/.claudesy/agents -type d -name "*" | while read dir; do
    echo "Agent: $(basename "$dir")"
    du -sh "$dir"
    find "$dir" -name "*.db" -exec sqlite3 {} "SELECT COUNT(*) FROM facts;" \; 2>/dev/null || echo "No database"
done
```

**Performance Benchmarking:**

```bash
# Run performance tests
pytest tests/performance/ -v --tb=line

# Benchmark current system
echo "Boot context time:"
time claudesy-engine boot > /dev/null

echo "Search performance:"
time claudesy-engine search "test" --limit 1000 > /dev/null
```

**Security Review:**

```bash
# Check file permissions
find ~/.claudesy -type f -exec ls -l {} \; | awk '$1 !~ /^-r--------/'

# Verify agent isolation
for agent_dir in ~/.claudesy/agents/*/; do
    agent=$(basename "$agent_dir")
    echo "Agent $agent permissions:"
    ls -ld "$agent_dir"
    # Check if other agents can access
    sudo -u $(whoami) test -r "$agent_dir/identity/SOUL.md" && echo "WARNING: Cross-agent access possible" || echo "OK"
done
```

## 3. Backup and Recovery

### 3.1 Backup Procedures

**Automated Daily Backup:**

```bash
#!/bin/bash
# daily_backup.sh
BACKUP_DIR="/backups/claudesy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BASE_DIR="${CLAUDESY_BASE_DIR:-$HOME/.claudesy}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Stop daemon to ensure consistency
DAEMON_PID=$(pgrep -f "claudesy-engine daemon")
[ -n "$DAEMON_PID" ] && kill -STOP $DAEMON_PID

# Create backup
tar czf "${BACKUP_DIR}/claudesy_${TIMESTAMP}.tar.gz" -C / "$BASE_DIR"

# Resume daemon
[ -n "$DAEMON_PID" ] && kill -CONT $DAEMON_PID

# Verify backup
if tar tf "${BACKUP_DIR}/claudesy_${TIMESTAMP}.tar.gz" > /dev/null 2>&1; then
    echo "Backup successful: claudesy_${TIMESTAMP}.tar.gz"

    # Clean old backups (keep 30 days)
    find "$BACKUP_DIR" -name "claudesy_*.tar.gz" -mtime +30 -delete

    # Send notification
    echo "Claudesy backup completed successfully" | mail -s "Backup Success" admin@example.com 2>/dev/null || true
else
    echo "Backup failed!" >&2
    echo "Claudesy backup failed" | mail -s "Backup Failed" admin@example.com
    exit 1
fi
```

**Selective Backup:**

```bash
# Backup specific agent
AGENT="production_agent"
tar czf "${AGENT}_$(date +%Y%m%d).tar.gz" ~/.claudesy/agents/$AGENT

# Backup only facts (lightweight)
tar czf "facts_$(date +%Y%m%d).tar.gz" ~/.claudesy/agents/*/facts/
```

**Offsite Backup:**

```bash
# Upload to cloud storage
aws s3 cp "${BACKUP_DIR}/claudesy_${TIMESTAMP}.tar.gz" s3://my-backups/claudesy/

# Or use rsync
rsync -avz "${BACKUP_DIR}/" user@backup-server:/backups/claudesy/
```

### 3.2 Recovery Procedures

**Full System Recovery:**

```bash
#!/bin/bash
# restore_backup.sh
BACKUP_FILE="$1"
BASE_DIR="${CLAUDESY_BASE_DIR:-$HOME/.claudesy}"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Stop daemon
pkill -f "claudesy-engine daemon" || true

# Create backup of current state
[ -d "$BASE_DIR" ] && mv "$BASE_DIR" "${BASE_DIR}.pre_restore_$(date +%Y%m%d_%H%M%S)"

# Extract backup
mkdir -p "$BASE_DIR"
tar xzf "$BACKUP_FILE" -C /

# Verify restoration
claudesy-engine health

# Restart daemon
claudesy-engine daemon &

echo "Restoration completed from $BACKUP_FILE"
```

**Partial Recovery:**

```bash
# Restore specific agent
AGENT="production_agent"
tar xzf "${AGENT}_backup.tar.gz" -C /

# Restore only facts
tar xzf "facts_backup.tar.gz" -C /
claudesy-engine consolidate  # Rebuild indexes
```

**Point-in-Time Recovery:**

```bash
# Restore to specific date
BACKUP_DATE="2024-01-15"
tar xzf "claudesy_${BACKUP_DATE}.tar.gz" -C /

# Roll forward from session logs if needed
find ~/.claudesy/agents/*/sessions -name "*.md" -newer "$BACKUP_DATE" \
    -exec claudesy-engine extract --file {} \;
```

### 3.3 Backup Verification

**Integrity Checks:**

```bash
#!/bin/bash
# verify_backup.sh
BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Verifying backup: $BACKUP_FILE"

# Check archive integrity
if ! tar tf "$BACKUP_FILE" > /dev/null 2>&1; then
    echo "ERROR: Archive is corrupted"
    exit 1
fi

# Extract to temporary location for verification
TEMP_DIR=$(mktemp -d)
tar xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Check database integrity
find "$TEMP_DIR" -name "*.db" -exec sqlite3 {} "PRAGMA integrity_check;" \; | grep -v "ok" | wc -l

# Check fact files
find "$TEMP_DIR" -name "*.jsonl" -exec sh -c 'echo "$1: $(wc -l < "$1") lines"' _ {} \;

# Cleanup
rm -rf "$TEMP_DIR"

echo "Backup verification completed"
```

**Automated Verification:**

```bash
# Add to cron for daily verification
0 3 * * * /usr/local/bin/verify_backup.sh /backups/claudesy/$(ls -t /backups/claudesy/claudesy_*.tar.gz | head -1)
```

## 4. Monitoring and Alerting

### 4.1 System Monitoring

**Resource Monitoring:**

```bash
# CPU usage
ps aux | grep claudesy-engine | grep -v grep | awk '{print $3 "% CPU"}'

# Memory usage
ps aux | grep claudesy-engine | grep -v grep | awk '{print $4 "% MEM"}'

# Disk usage
df -h ~/.claudesy

# Network (if applicable)
netstat -tlnp | grep :11434  # Ollama port
```

**Application Metrics:**

```bash
# Fact counts by category
for category in semantic episodic procedural preference; do
    count=$(claudesy-engine search "" --category $category --limit 10000 | wc -l)
    echo "$category: $count facts"
done

# Session file count
find ~/.claudesy/agents/*/sessions -name "*.md" | wc -l

# Archive statistics
ls -la ~/.claudesy/agents/*/sessions/archive/ | grep "\.zip$" | wc -l
```

### 4.2 Log Monitoring

**Log Analysis:**

```bash
# Error count
grep -c "ERROR" ~/.claudesy/logs/claudesy.log

# Warning count
grep -c "WARNING" ~/.claudesy/logs/claudesy.log

# Recent errors
tail -50 ~/.claudesy/logs/claudesy.log | grep "ERROR\|WARNING"

# Operation timing
grep "completed in" ~/.claudesy/logs/claudesy.log | tail -10
```

**Log Alerting:**

```bash
#!/bin/bash
# check_logs.sh
LOG_FILE="$HOME/.claudesy/logs/claudesy.log"
ERROR_COUNT=$(grep -c "ERROR" "$LOG_FILE" 2>/dev/null || echo "0")

if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "CRITICAL: $ERROR_COUNT errors found in Claudesy logs"
    tail -20 "$LOG_FILE" | grep "ERROR"
    exit 2
fi

WARNING_COUNT=$(grep -c "WARNING" "$LOG_FILE" 2>/dev/null || echo "0")
if [ "$WARNING_COUNT" -gt 10 ]; then
    echo "WARNING: $WARNING_COUNT warnings found in Claudesy logs"
    exit 1
fi

echo "OK: Logs clean"
exit 0
```

### 4.3 Performance Monitoring

**Performance Benchmarks:**

```bash
#!/bin/bash
# performance_check.sh
echo "=== Claudesy Performance Check ==="

# Boot context timing
echo "Boot context generation:"
START=$(date +%s.%3N)
claudesy-engine boot > /dev/null 2>&1
END=$(date +%s.%3N)
BOOT_TIME=$(echo "$END - $START" | bc)
echo "Time: ${BOOT_TIME}s (should be < 5.0s)"

# Search performance
echo "Search performance (1000 results):"
START=$(date +%s.%3N)
claudesy-engine search "" --limit 1000 > /dev/null 2>&1
END=$(date +%s.%3N)
SEARCH_TIME=$(echo "$END - $START" | bc)
echo "Time: ${SEARCH_TIME}s (should be < 2.0s)"

# Memory usage
echo "Memory usage:"
ps aux | grep "claudesy-engine" | grep -v grep | awk '{print $4 "% of total memory"}' || echo "No daemon running"

# Database size
echo "Database sizes:"
find ~/.claudesy/agents -name "*.db" -exec ls -lh {} \; | awk '{print $5 "\t" $9}'
```

**Trend Analysis:**

```bash
# Track performance over time
performance_check.sh >> performance_history.log

# Analyze trends
echo "=== Performance Trends ==="
tail -30 performance_history.log | grep "Boot context" | awk '{print $3}' | \
    awk '{sum+=$1; count++} END {print "Avg boot time:", sum/count "s"}'

tail -30 performance_history.log | grep "Search performance" | awk '{print $3}' | \
    awk '{sum+=$1; count++} END {print "Avg search time:", sum/count "s"}'
```

### 4.4 Alerting Setup

**Email Alerts:**

```bash
# Install mail utilities
sudo apt-get install mailutils  # Ubuntu/Debian
# or
sudo yum install mailx          # RHEL/CentOS

# Configure email
# /etc/mail.rc or ~/.mailrc
set smtp=smtp.example.com
set from=claudesy@example.com
```

**Nagios/Icinga Integration:**

```bash
#!/bin/bash
# nagios_check_claudesy
# Place in /usr/local/nagios/libexec/

OUTPUT=$(claudesy-engine health 2>&1)
EXIT_CODE=$?

echo "$OUTPUT"
exit $EXIT_CODE
```

**Prometheus Metrics:**

```python
# prometheus_exporter.py
from prometheus_client import start_http_server, Gauge, Counter
import time
import subprocess
import json

# Define metrics
health_status = Gauge('claudesy_health_status', 'Health check status')
facts_total = Gauge('claudesy_facts_total', 'Total facts', ['category'])
memory_usage = Gauge('claudesy_memory_usage_bytes', 'Memory usage')
operation_duration = Gauge('claudesy_operation_duration_seconds', 'Operation duration', ['operation'])

def collect_metrics():
    try:
        # Health check
        result = subprocess.run(['claudesy-engine', 'health'],
                              capture_output=True, text=True, timeout=30)
        health_status.set(1 if result.returncode == 0 else 0)

        # Fact counts (simplified)
        # In real implementation, query database directly
        facts_total.labels(category='total').set(1000)  # Placeholder

    except Exception as e:
        print(f"Error collecting metrics: {e}")

if __name__ == '__main__':
    start_http_server(8000)
    while True:
        collect_metrics()
        time.sleep(60)
```

## 5. Performance Tuning

### 5.1 Database Optimization

**SQLite Tuning:**

```bash
# Optimize database settings
sqlite3 ~/.claudesy/agents/*/memory.db << 'EOF'
PRAGMA cache_size = -64000;  -- 64MB cache
PRAGMA synchronous = NORMAL;  -- Balance safety/speed
PRAGMA wal_autocheckpoint = 1000;  -- Auto-checkpoint WAL
PRAGMA temp_store = memory;  -- Temp tables in memory
PRAGMA mmap_size = 268435456;  -- 256MB memory map
EOF
```

**Index Optimization:**

```bash
# Rebuild indexes
sqlite3 ~/.claudesy/agents/*/memory.db << 'EOF'
REINDEX;
ANALYZE;
EOF

# Check index usage
sqlite3 ~/.claudesy/agents/*/memory.db ".schema" | grep "CREATE INDEX"
```

**Query Optimization:**

```bash
# Analyze slow queries
sqlite3 ~/.claudesy/agents/*/memory.db ".timer on" << 'EOF'
EXPLAIN QUERY PLAN SELECT * FROM facts WHERE category = 'semantic' ORDER BY importance DESC LIMIT 10;
EOF
```

### 5.2 Memory Tuning

**Python Memory Optimization:**

```bash
# Monitor memory usage
python -c "
import psutil
import os
process = psutil.Process(os.getpid())
print(f'Memory usage: {process.memory_info().rss / 1024 / 1024:.1f} MB')
"
```

**Configuration Tuning:**

```bash
# Adjust token budget based on needs
export CLAUDESY_BOOT_MAX_TOKENS=4000  # Default
# Increase for larger contexts
export CLAUDESY_BOOT_MAX_TOKENS=8000

# Adjust decay parameters
export CLAUDESY_DECAY_HALF_LIFE_DAYS=30  # Default
# Longer retention
export CLAUDESY_DECAY_HALF_LIFE_DAYS=60
```

### 5.3 I/O Optimization

**File System Tuning:**

```bash
# Use faster storage if possible
# SSD vs HDD, NVMe vs SATA

# Adjust file system mount options
# /etc/fstab: add noatime for better performance
# UUID=... / ext4 noatime,errors=remount-ro 0 1
```

**Concurrent Access:**

```bash
# Test concurrent operations
for i in {1..5}; do
    claudesy-engine search "test" --limit 100 > /dev/null &
done
wait

# Monitor lock contention
sqlite3 ~/.claudesy/agents/*/memory.db "PRAGMA lock_status;"
```

### 5.4 Ollama Optimization

**Model Selection:**

```bash
# Use faster model for better performance
export CLAUDESY_OLLAMA_MODEL=llama3.1:8b  # Faster than nuextract
# Or keep nuextract for better accuracy

# Adjust temperature for speed vs quality
export CLAUDESY_OLLAMA_TEMPERATURE=0.0  # Deterministic, faster
```

**Ollama Server Tuning:**

```bash
# Increase Ollama threads
export OLLAMA_NUM_THREAD=8  # Match CPU cores

# Adjust context window
export OLLAMA_MAX_LOADED_MODELS=1  # Reduce memory usage
```

## 6. Troubleshooting Procedures

### 6.1 Startup Issues

**Daemon Won't Start:**

```bash
# Check for existing processes
ps aux | grep claudesy-engine

# Kill zombie processes
pkill -9 -f "claudesy-engine daemon"

# Check permissions
ls -la ~/.claudesy
ls -la $(which claudesy-engine)

# Test manual execution
claudesy-engine health
```

**Import Errors:**

```bash
# Check Python path
python -c "import claudesy_memory; print('Import OK')"

# Reinstall package
pip uninstall claudesy-memory
pip install -e .

# Check dependencies
pip check
```

### 6.2 Runtime Issues

**Database Locked:**

```bash
# Find locking process
lsof ~/.claudesy/agents/*/memory.db

# Kill conflicting process
kill -9 <pid>

# Check for WAL file issues
ls -la ~/.claudesy/agents/*/*.db*

# Recover WAL
sqlite3 memory.db "PRAGMA wal_checkpoint(TRUNCATE);"
```

**Ollama Connection Issues:**

```bash
# Test Ollama service
curl http://localhost:11434/api/tags

# Restart Ollama
sudo systemctl restart ollama

# Check Ollama logs
journalctl -u ollama -f

# Test with different model
export CLAUDESY_OLLAMA_MODEL=llama3.1:8b
claudesy-engine extract
```

**Memory Issues:**

```bash
# Check system memory
free -h

# Check process memory
ps aux | grep claudesy-engine | grep -v grep | awk '{print $4 "% MEM, " $5 " VSZ, " $6 " RSS"}'

# Kill and restart daemon
pkill -f "claudesy-engine daemon"
sleep 2
claudesy-engine daemon &
```

### 6.3 Data Issues

**Corrupted Facts:**

```bash
# Validate JSONL files
for file in ~/.claudesy/agents/*/facts/*.jsonl; do
    echo "Checking $file..."
    python -c "
import json
with open('$file', 'r') as f:
    for i, line in enumerate(f, 1):
        try:
            json.loads(line.strip())
        except json.JSONDecodeError as e:
            print(f'Line {i}: {e}')
    "
done
```

**Missing Facts:**

```bash
# Re-extract from sessions
find ~/.claudesy/agents/*/sessions -name "*.md" -exec claudesy-engine extract --file {} \;

# Check extraction logs
grep "extract" ~/.claudesy/logs/claudesy.log | tail -20
```

**Inconsistent Data:**

```bash
# Rebuild from scratch
mv ~/.claudesy/agents/agent_name/facts ~/.claudesy/agents/agent_name/facts.backup
claudesy-engine extract  # Re-extract all
claudesy-engine consolidate  # Rebuild
```

### 6.4 Performance Issues

**Slow Operations:**

```bash
# Profile operations
python -m cProfile -s time $(which claudesy-engine) run

# Check database performance
sqlite3 ~/.claudesy/agents/*/memory.db ".timer on" "SELECT COUNT(*) FROM facts;"

# Test with smaller dataset
claudesy-engine search "" --limit 100
```

**High Resource Usage:**

```bash
# Monitor with top/htop
# Check for memory leaks
valgrind --leak-check=full claudesy-engine run 2>&1 | grep "definitely lost\|indirectly lost"

# Profile memory usage
python -m memory_profiler $(which claudesy-engine) run
```

## 7. Upgrade Procedures

### 7.1 Version Upgrades

**Minor Version Upgrade:**

```bash
# Backup first
./daily_backup.sh

# Update package
pip install --upgrade claudesy-memory

# Test functionality
claudesy-engine health
claudesy-engine run

# Monitor for issues
tail -f ~/.claudesy/logs/claudesy.log
```

**Major Version Upgrade:**

```bash
# Full backup
./daily_backup.sh

# Stop daemon
pkill -f "claudesy-engine daemon"

# Update package
pip install --upgrade claudesy-memory

# Check for configuration changes
claudesy-engine --help | head -20

# Test with new version
claudesy-engine health

# Migrate data if needed
# (Check release notes for migration scripts)

# Restart daemon
claudesy-engine daemon &
```

### 7.2 Dependency Updates

**Python Package Updates:**

```bash
# Check for updates
pip list --outdated

# Update specific packages
pip install --upgrade sqlite3 ollama

# Test after update
claudesy-engine run
```

**System Updates:**

```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade

# Restart services if needed
sudo systemctl restart ollama
sudo systemctl restart claudesy-daemon
```

### 7.3 Rollback Procedures

**Package Rollback:**

```bash
# Downgrade package
pip install claudesy-memory==1.0.0  # Specific version

# Or reinstall from backup
pip uninstall claudesy-memory
pip install -e .  # If local source
```

**Data Rollback:**

```bash
# Stop daemon
pkill -f "claudesy-engine daemon"

# Restore from backup
./restore_backup.sh /backups/claudesy/claudesy_20240115.tar.gz

# Restart daemon
claudesy-engine daemon &
```

## 8. Security Maintenance

### 8.1 Access Control

**File Permissions:**

```bash
# Secure memory files
find ~/.claudesy -type f -exec chmod 600 {} \;
find ~/.claudesy -type d -exec chmod 700 {} \;

# Set ownership
chown -R $(whoami):$(whoami) ~/.claudesy
```

**Agent Isolation:**

```bash
# Verify agent separation
for agent_dir in ~/.claudesy/agents/*/; do
    agent=$(basename "$agent_dir")
    echo "Checking agent: $agent"

    # Test access from other agents
    ls -la "$agent_dir/identity/"

    # Check for cross-agent symlinks
    find "$agent_dir" -type l
done
```

### 8.2 Data Encryption

**Enable Encryption:**

```bash
# Use encrypted home directory
ecryptfs-setup-private

# Or encrypt specific directory
encfs ~/.claudesy_encrypted ~/.claudesy
```

**Backup Encryption:**

```bash
# Encrypt backups
tar cz ~/.claudesy | gpg -c > claudesy_backup.tar.gz.gpg

# Decrypt for restore
gpg -d claudesy_backup.tar.gz.gpg | tar xz
```

### 8.3 Network Security

**Ollama Security:**

```bash
# Bind Ollama to localhost only
# Edit Ollama service to use --host 127.0.0.1

# Test access restriction
curl http://localhost:11434/api/tags  # Should work
curl http://external-ip:11434/api/tags  # Should fail
```

**Firewall Configuration:**

```bash
# Allow only necessary ports
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 11434  # Only if Ollama needs external access
sudo ufw default deny incoming
```

## 9. Capacity Planning

### 9.1 Resource Planning

**Storage Requirements:**

```bash
# Estimate storage needs
echo "Current usage:"
du -sh ~/.claudesy

echo "Growth rate (facts per day):"
# Calculate from logs
grep "extracted" ~/.claudesy/logs/claudesy.log | \
    awk '{sum += $2} END {print sum/NR " facts/day"}'

echo "Session file growth:"
find ~/.claudesy/agents/*/sessions -name "*.md" -mtime -30 | wc -l
```

**Memory Requirements:**

```bash
# Monitor memory patterns
echo "Peak memory usage:"
ps aux --sort=-%mem | head -10

echo "Database cache size:"
sqlite3 ~/.claudesy/agents/*/memory.db "PRAGMA cache_size;"
```

### 9.2 Scaling Projections

**Performance Scaling:**

```bash
# Test with different data sizes
for size in 1000 5000 10000; do
    echo "Testing with $size facts..."
    time claudesy-engine search "" --limit $size > /dev/null
done
```

**Concurrent User Scaling:**

```bash
# Test concurrent access
for i in {1..10}; do
    claudesy-engine search "test" --limit 100 > /dev/null &
done
wait
echo "Concurrent test completed"
```

### 9.3 Maintenance Scheduling

**Automated Maintenance:**

```bash
# Add to crontab
# Daily
@daily /usr/local/bin/claudesy_backup.sh
@daily /usr/local/bin/health_check.sh

# Weekly
@weekly /usr/local/bin/database_maintenance.sh
@weekly /usr/local/bin/log_rotation.sh

# Monthly
@monthly /usr/local/bin/archive_verification.sh
@monthly /usr/local/bin/performance_audit.sh
```

**Maintenance Windows:**

```bash
# Schedule maintenance during low-usage periods
# Example: 2 AM daily
0 2 * * * /usr/local/bin/maintenance.sh

# With service interruption warning
/usr/local/bin/maintenance.sh << 'EOF'
#!/bin/bash
echo "Starting maintenance - services may be unavailable"

# Send notification
curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"Starting Claudesy maintenance"}' \
    https://hooks.slack.com/services/... 2>/dev/null || true

# Perform maintenance
# ...

echo "Maintenance completed"
EOF
```

This maintenance guide ensures the Claudesy Memory Engine remains reliable, performant, and secure throughout its operational life.
