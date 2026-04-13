# Local wrapper over vendor/hermes-core/Dockerfile
# Adds PIP retries + timeout to survive flaky PyPI downloads.

FROM debian:13.4

# Install system dependencies in one layer, clear APT cache
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential nodejs npm python3 python3-pip ripgrep ffmpeg gcc python3-dev libffi-dev && \
    rm -rf /var/lib/apt/lists/*

COPY vendor/hermes-core /opt/hermes
WORKDIR /opt/hermes

# Increase pip resilience for large wheels (av, onnxruntime, etc.)
ENV PIP_DEFAULT_TIMEOUT=300
ENV UV_HTTP_TIMEOUT=300

# Install Python and Node dependencies in one layer, no cache
RUN pip install --no-cache-dir --retries 5 -e ".[all]" --break-system-packages && \
    npm install --prefer-offline --no-audit && \
    npx playwright install --with-deps chromium --only-shell && \
    cd /opt/hermes/scripts/whatsapp-bridge && \
    npm install --prefer-offline --no-audit && \
    npm cache clean --force

WORKDIR /opt/hermes
RUN chmod +x /opt/hermes/docker/entrypoint.sh

ENV HERMES_HOME=/opt/data
VOLUME [ "/opt/data" ]
ENTRYPOINT [ "/opt/hermes/docker/entrypoint.sh" ]
