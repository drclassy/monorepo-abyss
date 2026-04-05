# Setup Guide

## Prerequisites

- Python 3.10 or higher
- Ollama installed and running locally
- Git

## Installing Ollama

1. Download Ollama from https://ollama.ai
2. Install and start the Ollama service
3. Pull the required model:

```bash
ollama pull nuextract
ollama pull llama3.1:8b
```

## Installing Claudsy Memory

1. Clone the repository:

```bash
git clone https://github.com/claudsy/claudsy-memory.git
cd claudsy-memory
```

2. Install desktop dependencies:

```bash
cd desktop
npm install
cd ..
```

## Configuration

Create a `.env` file in the project root:

```env
CLAUDESY_OLLAMA_URL=http://localhost:11434
CLAUDESY_BASE_DIR=~/.claudesy
```

For smoke or manual verification runs, prefer a temp or home-based workspace outside the repository tree so generated SQLite, JSONL, and archive artifacts do not mix with source files.

## Running the System

### CLI

```bash
claudesy-memory --help
```

### Web Dashboard

```bash
npm install
npm run dev
```

## Testing Installation

Run the executable regression suite:

```bash
python -m unittest test_claudesy_engine.py -v
```

## Troubleshooting

See [Troubleshooting](TROUBLESHOOTING.md) for common issues.
