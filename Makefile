DOCKER_COMPOSE ?= docker compose
SERVICE ?= front
PNPM_IN_DOCKER = $(DOCKER_COMPOSE) run --rm $(SERVICE) pnpm

.PHONY: help build start lint test ci-test prettier update-snapshot pnpm

help:
	@echo "Available targets:"
	@echo "  make build            # executes the build script"
	@echo "  make start            # executes the start script"
	@echo "  make lint             # executes the lint script"
	@echo "  make test             # executes the test script"
	@echo "  make ci-test          # executes the ci:test script"
	@echo "  make prettier         # executes the prettier script"
	@echo "  make update-snapshot  # executes the update-snapshot script"
	@echo "  make pnpm SCRIPT=<script> [ARGS=\"...\"]"

build:
	$(PNPM_IN_DOCKER) build

start:
	$(PNPM_IN_DOCKER) start

lint:
	$(PNPM_IN_DOCKER) lint

test:
	$(PNPM_IN_DOCKER) test

ci-test:
	$(PNPM_IN_DOCKER) run ci:test

prettier:
	$(PNPM_IN_DOCKER) prettier

update-snapshot:
	$(PNPM_IN_DOCKER) update-snapshot

pnpm:
	@if [ -z "$(SCRIPT)" ]; then \
		echo "Uso: make pnpm SCRIPT=<script-do-package-json> [ARGS=\"...\"]"; \
		exit 1; \
	fi
	$(PNPM_IN_DOCKER) run $(SCRIPT) $(ARGS)
