# Troubleshooting

## Common Issues

### Ollama Connection Failed

**Symptoms:** Extraction fails with connection errors

**Solutions:**

1. Ensure Ollama is running: `ollama serve`
2. Check model is loaded: `ollama pull nuextract`
3. Verify base URL in config: `OLLAMA_BASE_URL=http://localhost:11434`

### No Facts Extracted

**Symptoms:** Extraction returns empty list

**Causes:**

- Session text too short
- Regex rules not matching
- Ollama model unavailable

**Solutions:**

- Check session text format
- Verify Ollama fallback model loaded
- Review extraction logs

### Database Locked

**Symptoms:** SQLite errors about locking

**Cause:** Concurrent access without WAL

**Solution:** Ensure WAL mode is enabled (default)

### Memory Not Consolidating

**Symptoms:** Facts not decaying over time

**Cause:** Consolidator not running

**Solution:** Run manual consolidation or start daemon

## Logs and Debugging

Enable debug logging:

```bash
export CLAUDSY_LOG_LEVEL=DEBUG
```

Check health status:

```python
from claudesy_memory import ClaudesyEngine
engine = ClaudesyEngine()
print(engine.health())
```

## Getting Help

- Check existing issues on GitHub
- Review AGENTS.md for non-obvious patterns
- Email support@claudsy.com for assistance
