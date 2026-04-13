BASE_COMPOSE = -f docker-compose.base.yml
META_COMPOSE = $(BASE_COMPOSE) -f docker-compose.meta.yml
SKILLS_COMPOSE = $(BASE_COMPOSE) -f docker-compose.skills.yml

# Detect optional compose files for full stack
FULL_COMPOSE = $(BASE_COMPOSE)
ifneq (,$(wildcard docker-compose.meta.yml))
	FULL_COMPOSE += -f docker-compose.meta.yml
endif
ifneq (,$(wildcard docker-compose.skills.yml))
	FULL_COMPOSE += -f docker-compose.skills.yml
endif

.PHONY: help up up-meta up-skills up-full down logs ps smoke smoke-all

help:
	@echo "Hermes Maximus operator targets:"
	@echo "  up          — base profile"
	@echo "  up-meta     — base + meta (if meta.yml exists)"
	@echo "  up-skills   — base + skills (if skills.yml exists)"
	@echo "  up-full     — everything available"
	@echo "  down        — stop all"
	@echo "  logs SVC=x  — follow service logs"
	@echo "  ps          — container status"
	@echo "  smoke       — base smoke tests"
	@echo "  smoke-all   — every test"

up:
	docker compose $(BASE_COMPOSE) up -d

up-meta:
	@if [ -f docker-compose.meta.yml ]; then docker compose $(META_COMPOSE) up -d; else echo "docker-compose.meta.yml not found"; exit 1; fi

up-skills:
	@if [ -f docker-compose.skills.yml ]; then docker compose $(SKILLS_COMPOSE) up -d; else echo "docker-compose.skills.yml not found"; exit 1; fi

up-full:
	docker compose $(FULL_COMPOSE) up -d

down:
	docker compose $(FULL_COMPOSE) down

logs:
	docker compose $(BASE_COMPOSE) logs -f $(SVC)

ps:
	docker compose $(BASE_COMPOSE) ps

smoke:
	python -m pytest tests/smoke/test_base_profile.py -v

smoke-all:
	python -m pytest tests/ -v
