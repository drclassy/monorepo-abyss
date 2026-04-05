# Deployment Guide

## 1. Overview

This guide covers the deployment of the Claudesy Memory Engine in various environments, from development setups to production deployments. The system is designed to be lightweight and flexible, supporting multiple deployment patterns.

## 2. Prerequisites

### 2.1 System Requirements

**Minimum Requirements:**

- **OS**: Linux, macOS, or Windows
- **Python**: 3.8 or higher
- **RAM**: 512 MB
- **Disk**: 100 MB free space
- **Network**: Internet access for Ollama (optional)

**Recommended Requirements:**

- **OS**: Linux (Ubuntu 20.04+)
- **Python**: 3.10 or higher
- **RAM**: 2 GB
- **Disk**: 1 GB SSD storage
- **CPU**: Multi-core processor

### 2.2 External Dependencies

**Required:**

- SQLite 3 (usually included with Python)

**Optional (for enhanced extraction):**

- Ollama server with models:
  - `nuextract` (primary)
  - `llama3.1:8b` (fallback)

**GUI Console:**

- Node.js 14+ (for Electron app)

## 3. Installation Methods

### 3.1 Source Installation

**Clone repository:**

```bash
git clone <repository-url>
cd claudsy-memory
```

**Install Python package:**

```bash
# Install in development mode
pip install -e .

# Or install with extras
pip install -e .[dev,test]
```

**Verify installation:**

```bash
claudesy-engine --version
claudesy-engine --help
```

### 3.2 Container Installation

**Dockerfile:**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copy source
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -e .

# Create non-root user
RUN useradd --create-home --shell /bin/bash claudesy
USER claudesy

# Set working directory
WORKDIR /home/claudesy

# Expose port for GUI (if needed)
EXPOSE 3000

# Default command
CMD ["claudesy-engine", "health"]
```

**Build and run:**

```bash
# Build image
docker build -t claudesy-memory .

# Run container
docker run -it --rm \
  -v ~/.claudesy:/home/claudesy/.claudesy \
  claudesy-memory \
  claudesy-engine health
```

### 3.3 System Package Installation

**DEB Package (Ubuntu/Debian):**

```bash
# Build package
dpkg-buildpackage -us -uc

# Install package
sudo dpkg -i ../claudesy-memory_1.1.0_all.deb
```

**RPM Package (RHEL/CentOS):**

```bash
# Build package
rpmbuild -ba claudesy-memory.spec

# Install package
sudo rpm -i ~/rpmbuild/RPMS/noarch/claudesy-memory-1.1.0-1.noarch.rpm
```

## 4. Configuration

### 4.1 Environment Variables

**Core Configuration:**

```bash
# Agent and storage
export CLAUDESY_AGENT_NAME=my_agent
export CLAUDESY_BASE_DIR=/var/lib/claudesy

# Ollama settings
export CLAUDESY_OLLAMA_MODEL=nuextract
export CLAUDESY_OLLAMA_URL=http://localhost:11434
export CLAUDESY_OLLAMA_FALLBACK_MODEL=llama3.1:8b
export CLAUDESY_OLLAMA_TIMEOUT_SECONDS=90

# Memory settings
export CLAUDESY_DECAY_HALF_LIFE_DAYS=30
export CLAUDESY_DECAY_ACCESS_BOOST=0.08
export CLAUDESY_BOOT_MAX_TOKENS=4000
```

**Systemd Service Configuration:**

```bash
# /etc/systemd/system/claudesy.env
CLAUDESY_AGENT_NAME=production_agent
CLAUDESY_BASE_DIR=/var/lib/claudesy
CLAUDESY_OLLAMA_URL=http://ollama.service.local:11434
```

### 4.2 Configuration Files

**Global configuration:**

```python
# /etc/claudesy/config.py
from claudesy_memory.config import EngineConfig, OllamaConfig, DecayConfig

config = EngineConfig(
    agent_name="production_agent",
    base_dir="/var/lib/claudesy",
    ollama=OllamaConfig(
        model="nuextract",
        base_url="http://ollama.local:11434",
        timeout_seconds=120
    ),
    decay=DecayConfig(
        half_life_days=45,  # Longer retention for production
        access_boost=0.05,  # Smaller boost
        minimum_threshold=0.25
    )
)
```

**Per-user configuration:**

```bash
# ~/.claudesyrc
agent_name=development_agent
ollama_model=custom-model
```

### 4.3 Directory Structure

**Default layout:**

```
/home/user/.claudesy/
├── agents/
│   └── agent_name/
│       ├── facts/
│       │   ├── semantic.jsonl
│       │   ├── episodic.jsonl
│       │   ├── procedural.jsonl
│       │   └── preference.jsonl
│       ├── sessions/
│       │   ├── 2024-01-01.md
│       │   └── archive/
│       ├── identity/
│       │   ├── SOUL.md
│       │   ├── MEMORY.md
│       │   └── SKILLS.md
│       └── memory.db
├── shared/
└── logs/
    └── claudesy.log
```

**Custom layout:**

```bash
# Use different base directory
export CLAUDESY_BASE_DIR=/var/lib/claudesy

# Create directory structure
mkdir -p /var/lib/claudesy/{agents,shared,logs}
chmod 755 /var/lib/claudesy
```

## 5. Ollama Setup

### 5.1 Local Installation

**Install Ollama:**

```bash
# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# macOS
brew install ollama

# Windows
# Download from https://ollama.ai/download
```

**Start Ollama service:**

```bash
# Start server
ollama serve

# In background
nohup ollama serve > ollama.log 2>&1 &
```

**Pull required models:**

```bash
ollama pull nuextract
ollama pull llama3.1:8b
```

**Verify models:**

```bash
ollama list
# Should show: nuextract, llama3.1:8b
```

### 5.2 Remote Ollama Server

**Server setup:**

```bash
# On Ollama server
ollama serve --host 0.0.0.0 --port 11434

# Configure firewall
sudo ufw allow 11434
```

**Client configuration:**

```bash
export CLAUDESY_OLLAMA_URL=http://ollama-server.example.com:11434
```

### 5.3 Docker Ollama

**Run Ollama in Docker:**

```yaml
# docker-compose.yml
version: "3.8"
services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

volumes:
  ollama_data:
```

**Start services:**

```bash
docker-compose up -d
docker-compose exec ollama ollama pull nuextract
```

## 6. Development Deployment

### 6.1 Local Development Setup

**Clone and install:**

```bash
git clone <repository-url>
cd claudsy-memory
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e .[dev]
```

**Initialize development agent:**

```bash
export CLAUDESY_AGENT_NAME=dev_agent
claudesy-engine log --title "Setup" --description "Development environment initialized."
```

**Start GUI console:**

```bash
cd desktop
npm install
npm start
```

### 6.2 Development with Docker

**Development compose:**

```yaml
version: "3.8"
services:
  claudesy:
    build: .
    volumes:
      - ./:/app
      - ~/.claudesy:/root/.claudesy
    environment:
      - CLAUDESY_AGENT_NAME=dev_agent
    command: sleep infinity
    ports:
      - "3000:3000"

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_dev:/root/.ollama

volumes:
  ollama_dev:
```

**Development workflow:**

```bash
# Start services
docker-compose up -d

# Enter container
docker-compose exec claudesy bash

# Run tests
pytest

# Development commands
claudesy-engine --log-level DEBUG run
```

## 7. Production Deployment

### 7.1 Single Server Deployment

**System user setup:**

```bash
# Create system user
sudo useradd --system --shell /bin/bash --home /var/lib/claudesy --create-home claudesy

# Set permissions
sudo chown -R claudesy:claudesy /var/lib/claudesy
sudo chmod 755 /var/lib/claudesy
```

**Environment configuration:**

```bash
# /etc/profile.d/claudesy.sh
export CLAUDESY_AGENT_NAME=production_agent
export CLAUDESY_BASE_DIR=/var/lib/claudesy
export CLAUDESY_OLLAMA_URL=http://localhost:11434
```

**Systemd service:**

```ini
# /etc/systemd/system/claudesy-daemon.service
[Unit]
Description=Claudesy Memory Engine Daemon
After=network.target ollama.service
Requires=ollama.service

[Service]
Type=simple
User=claudesy
EnvironmentFile=/etc/profile.d/claudesy.sh
ExecStart=/usr/local/bin/claudesy-engine daemon --interval-seconds 300
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Enable and start:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable claudesy-daemon
sudo systemctl start claudesy-daemon
sudo systemctl status claudesy-daemon
```

### 7.2 Multi-Agent Deployment

**Agent-specific services:**

```bash
# Create multiple agents
for agent in agent1 agent2 agent3; do
    sudo useradd --system --shell /bin/bash --home /var/lib/claudesy-${agent} --create-home claudesy-${agent}

    # Create service file
    cat > /etc/systemd/system/claudesy-${agent}.service << EOF
[Unit]
Description=Claudesy Memory Engine - ${agent}
After=network.target

[Service]
Type=simple
User=claudesy-${agent}
Environment=CLAUDESY_AGENT_NAME=${agent}
Environment=CLAUDESY_BASE_DIR=/var/lib/claudesy-${agent}
ExecStart=/usr/local/bin/claudesy-engine daemon
Restart=always

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl enable claudesy-${agent}
    sudo systemctl start claudesy-${agent}
done
```

### 7.3 Load Balancing Deployment

**Nginx configuration:**

```nginx
# /etc/nginx/sites-available/claudesy
upstream claudesy_backend {
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
    server 127.0.0.1:8003;
}

server {
    listen 80;
    server_name memory.example.com;

    location /api/ {
        proxy_pass http://claudesy_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**API server setup:**

```python
# api_server.py
from fastapi import FastAPI
from claudesy_memory import ClaudesyEngine

app = FastAPI()
engine = ClaudesyEngine()

@app.post("/api/log")
async def log_event(event: dict):
    # Log event via engine
    pass

@app.get("/api/search")
async def search_facts(query: str):
    # Search facts
    pass
```

### 7.4 Cloud Deployment

**AWS EC2 Setup:**

```bash
# User data script
#!/bin/bash
yum update -y
yum install -y python3 pip git

# Install Claudesy
cd /home/ec2-user
git clone <repository-url>
cd claudesy-memory
pip3 install -e .

# Configure
echo "export CLAUDESY_AGENT_NAME=aws_agent" >> /home/ec2-user/.bashrc
echo "export CLAUDESY_BASE_DIR=/home/ec2-user/.claudesy" >> /home/ec2-user/.bashrc

# Start daemon
nohup claudesy-engine daemon > daemon.log 2>&1 &
```

**Docker Compose for cloud:**

```yaml
version: "3.8"
services:
  claudesy:
    image: claudesy-memory:latest
    environment:
      - CLAUDESY_AGENT_NAME=cloud_agent
      - CLAUDESY_OLLAMA_URL=http://ollama:11434
    volumes:
      - claudesy_data:/app/data
    depends_on:
      - ollama
    restart: unless-stopped

  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

volumes:
  claudesy_data:
  ollama_data:
```

## 8. GUI Console Deployment

### 8.1 Desktop Application

**Build for distribution:**

```bash
cd desktop
npm install

# Build for current platform
npm run build

# Package for distribution
npm run dist
```

**Install system-wide:**

```bash
# Linux
sudo dpkg -i dist/claudesy-console_1.0.0_amd64.deb

# macOS
# Drag Claudesy Console.app to Applications

# Windows
# Run installer from dist/
```

### 8.2 Web Interface

**Serve via web server:**

```bash
cd desktop
npm run build-web
sudo cp -r dist/* /var/www/html/claudesy/
```

**Nginx configuration:**

```nginx
server {
    listen 80;
    server_name console.example.com;
    root /var/www/html/claudesy;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 9. Monitoring and Maintenance

### 9.1 Health Monitoring

**Nagios check script:**

```bash
#!/bin/bash
# check_claudesy_health.sh
OUTPUT=$(timeout 30 claudesy-engine health 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "OK - Claudesy Memory Engine healthy"
    exit 0
elif [ $EXIT_CODE -eq 1 ]; then
    echo "WARNING - $OUTPUT"
    exit 1
else
    echo "CRITICAL - $OUTPUT"
    exit 2
fi
```

**Prometheus metrics:**

```python
# metrics_exporter.py
from prometheus_client import start_http_server, Gauge
import time
from claudesy_memory import ClaudesyEngine

engine = ClaudesyEngine()

# Define metrics
facts_total = Gauge('claudesy_facts_total', 'Total facts', ['category'])
memory_usage = Gauge('claudesy_memory_usage_bytes', 'Memory usage')

def update_metrics():
    # Update metrics
    pass

if __name__ == '__main__':
    start_http_server(8000)
    while True:
        update_metrics()
        time.sleep(60)
```

### 9.2 Log Management

**Log rotation:**

```bash
# /etc/logrotate.d/claudesy
/var/lib/claudesy/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 claudesy claudesy
    postrotate
        systemctl reload claudesy-daemon
    endscript
}
```

**Centralized logging:**

```bash
# Send logs to syslog
claudesy-engine --log-level INFO run 2>&1 | logger -t claudesy
```

### 9.3 Backup Strategy

**Automated backups:**

```bash
#!/bin/bash
# /usr/local/bin/claudesy-backup.sh
BACKUP_DIR="/backups/claudesy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
tar czf "${BACKUP_DIR}/claudesy_${TIMESTAMP}.tar.gz" /var/lib/claudesy

# Rotate backups (keep 7 days)
find "$BACKUP_DIR" -name "claudesy_*.tar.gz" -mtime +7 -delete

# Verify backup
if tar tf "${BACKUP_DIR}/claudesy_${TIMESTAMP}.tar.gz" > /dev/null 2>&1; then
    echo "Backup successful: claudesy_${TIMESTAMP}.tar.gz"
else
    echo "Backup failed!" >&2
    exit 1
fi
```

**Schedule backups:**

```bash
# Crontab entry
0 2 * * * /usr/local/bin/claudesy-backup.sh
```

### 9.4 Performance Monitoring

**Resource monitoring:**

```bash
# Monitor daemon process
ps aux | grep claudesy-engine

# Check memory usage
pmap $(pgrep claudesy-engine)

# Disk usage
du -sh /var/lib/claudesy
```

**Performance benchmarks:**

```bash
# Run performance tests
pytest tests/performance/ -v --tb=short

# Custom benchmark
time claudesy-engine run
time claudesy-engine search "test" --limit 1000
```

## 10. Security Considerations

### 10.1 File System Security

**Directory permissions:**

```bash
# Secure base directory
chown -R claudesy:claudesy /var/lib/claudesy
chmod 750 /var/lib/claudesy
chmod 700 /var/lib/claudesy/agents/*
```

**Agent isolation:**

```bash
# Each agent runs as separate user
for agent in agent1 agent2; do
    useradd --system --shell /bin/bash claudesy-${agent}
    mkdir -p /var/lib/claudesy-${agent}
    chown claudesy-${agent}:claudesy-${agent} /var/lib/claudesy-${agent}
done
```

### 10.2 Network Security

**Ollama access control:**

```bash
# Restrict Ollama to localhost
# In ollama systemd service
ExecStart=ollama serve --host 127.0.0.1
```

**Firewall rules:**

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 11434  # Ollama (if remote access needed)
```

### 10.3 Data Protection

**Encryption at rest:**

```bash
# Use encrypted filesystem
sudo apt install ecryptfs-utils
sudo ecryptfs-setup-private
```

**Backup encryption:**

```bash
# Encrypt backups
tar cz /var/lib/claudesy | gpg -c > claudesy_backup.tar.gz.gpg
```

## 11. Troubleshooting Deployment

### 11.1 Common Issues

**Service won't start:**

```bash
# Check service status
sudo systemctl status claudesy-daemon

# Check logs
sudo journalctl -u claudesy-daemon -f

# Test manually
sudo -u claudesy claudesy-engine health
```

**Ollama connection fails:**

```bash
# Test Ollama connectivity
curl http://localhost:11434/api/tags

# Check Ollama service
sudo systemctl status ollama

# Restart Ollama
sudo systemctl restart ollama
```

**Permission errors:**

```bash
# Check file ownership
ls -la /var/lib/claudesy

# Fix permissions
sudo chown -R claudesy:claudesy /var/lib/claudesy
```

### 11.2 Recovery Procedures

**Database corruption:**

```bash
# Stop service
sudo systemctl stop claudesy-daemon

# Backup corrupted database
cp memory.db memory.db.corrupt

# Attempt repair
sqlite3 memory.db ".recover" > recovered.sql
sqlite3 new_memory.db < recovered.sql

# Replace and restart
mv new_memory.db memory.db
sudo systemctl start claudesy-daemon
```

**Lost data recovery:**

```bash
# Re-extract from session files
find sessions -name "*.md" -exec claudesy-engine extract --file {} \;

# Re-consolidate
claudesy-engine consolidate
```

### 11.3 Performance Tuning

**Database optimization:**

```bash
# Analyze database
sqlite3 memory.db "ANALYZE;"

# Vacuum database
sqlite3 memory.db "VACUUM;"

# Check fragmentation
sqlite3 memory.db ".dbinfo"
```

**Memory tuning:**

```bash
# Adjust SQLite cache
export CLAUDESY_SQLITE_CACHE_SIZE=-64000  # 64MB

# Monitor memory usage
valgrind --tool=massif claudesy-engine run
```

## 12. Scaling Considerations

### 12.1 Vertical Scaling

**Increase resources:**

```bash
# More RAM for larger datasets
# Faster CPU for intensive operations
# SSD storage for better I/O
```

**Configuration adjustments:**

```bash
# Larger token budgets
export CLAUDESY_BOOT_MAX_TOKENS=8000

# Longer retention
export CLAUDESY_DECAY_HALF_LIFE_DAYS=60
```

### 12.2 Horizontal Scaling

**Multiple instances:**

```bash
# Run multiple agents on different servers
# Use shared storage for session files
# Load balance API requests
```

**Distributed setup:**

```yaml
version: "3.8"
services:
  claudesy-1:
    image: claudesy-memory:latest
    environment:
      - CLAUDESY_AGENT_NAME=agent1
    volumes:
      - shared_sessions:/app/sessions

  claudesy-2:
    image: claudesy-memory:latest
    environment:
      - CLAUDESY_AGENT_NAME=agent2
    volumes:
      - shared_sessions:/app/sessions

volumes:
  shared_sessions:
    driver: nfs # Network file system
```

### 12.3 High Availability

**Redundant setup:**

```bash
# Primary and backup Ollama servers
# Replicated databases
# Load balancer for API endpoints
# Automated failover scripts
```

**Monitoring alerts:**

```bash
# Alert on service down
# Alert on high resource usage
# Alert on data inconsistencies
```

This deployment guide provides comprehensive instructions for deploying the Claudesy Memory Engine in various environments, from simple development setups to complex production clusters.
