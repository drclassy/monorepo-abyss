# Hermes Maximus — Operations Runbook

**Last updated:** 2026-04-13

---

## Daily Operations

### Start the stack
```powershell
.\scripts\up.ps1
```

### Stop the stack
```powershell
.\scripts\down.ps1
```

### View logs for a service
```powershell
docker compose -f docker-compose.base.yml logs -f hermes-core
```

### Check container health
```powershell
docker compose -f docker-compose.base.yml ps
```

---

## Smoke Testing

```powershell
.\scripts\smoke.ps1
```

This runs `tests/smoke/test_base_profile.py`, verifying:
- hindsight Postgres is accepting connections
- hermes-core CLI returns a version
- gateway HTTP port responds
- mission-control and workspace-ui serve their landing pages

---

## Backup & Restore

### hermes-core state
Data lives in the named volume `hermes-home` (mounted at `/opt/data` in the container).

```powershell
# Backup
docker run --rm -v hermes_maximus_hermes-home:/data -v ${PWD}:/backup alpine tar czf /backup/hermes-home-backup.tar.gz -C /data .

# Restore (stack must be down)
docker run --rm -v hermes_maximus_hermes-home:/data -v ${PWD}:/backup alpine tar xzf /backup/hermes-home-backup.tar.gz -C /data
```

### hindsight database
```powershell
# Backup
docker exec hindsight pg_dumpall -U postgres > hindsight-backup.sql

# Restore
docker exec -i hindsight psql -U postgres < hindsight-backup.sql
```

### mission-control SQLite
```powershell
# Backup
docker cp mission-control:/app/.data ./mc-data-backup

# Restore (stack down)
docker cp ./mc-data-backup mission-control:/app/.data
```

---

## Secret Rotation

1. Edit `.env` with the new key.
2. Re-create the affected container so it picks up the new env:
   ```powershell
   docker compose -f docker-compose.base.yml up -d --force-recreate hermes-core
   ```
3. Verify with smoke tests.

---

## Submodule Bumps

```powershell
# Fetch latest for a submodule
cd vendor/hermes-core
git fetch origin
git checkout v2026.4.9   # or desired tag

cd ../..
git add vendor/hermes-core
git commit -m "chore(agent-hermes): bump hermes-core to v2026.4.9"
```

Always update [`docs/VERSION-MANIFEST.md`](VERSION-MANIFEST.md) when bumping.

---

## Chaos Drills

### Kill hindsight → verify hermes-core degrades gracefully
```powershell
docker stop hindsight
# Wait 30s, then check hermes-core logs for memory-degradation messages.
docker start hindsight
```

### Kill hermes-gateway → verify UIs reconnect
```powershell
docker stop hermes-core
# Workspace UI should show a disconnection banner.
docker start hermes-core
# UI should reconnect automatically.
```

---

## Known Gaps & Workarounds

| Gap | Workaround |
|-----|------------|
| Mission Control cannot drive Hermes directly | Use **Workspace UI** for agent tasks |
| Hindsight not yet wired into hermes-core memory | Both services run, but hermes-core still uses built-in `honcho` memory backend. Edit `config/hermes/config.yaml` to switch when ready. |
