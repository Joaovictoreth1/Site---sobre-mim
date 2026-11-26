.PHONY: install dev lint format test coverage check docker-build docker-run

PORT ?= 8080
IMAGE ?= site-sobre-mim:local

install:
	npm ci

dev:
	python3 -m http.server $(PORT)

lint:
	npm run lint

format:
	npm run format

test:
	npm test

coverage:
	npm run test:coverage

check:
	npm run check

docker-build:
	docker build -t $(IMAGE) .

docker-run: docker-build
	docker run --rm -p $(PORT):8080 --read-only --tmpfs /tmp --tmpfs /var/cache/nginx --security-opt no-new-privileges:true $(IMAGE)
