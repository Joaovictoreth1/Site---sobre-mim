# Site — Sobre Mim

Production-hardened personal developer portfolio for **João Victor Barros das Merces** (Análise e Desenvolvimento de Sistemas — UNICID).

## Architecture Overview

Zero-runtime-dependency static web application structured for strict Content Security Policy (CSP), accessibility, and fast delivery:

```text
.
├── index.html                  # Semantic HTML5 entrypoint with strict CSP & SEO metadata
├── manifest.webmanifest        # Web App Manifest
├── robots.txt                  # Crawler directives
├── styles/
│   └── main.css                # Design tokens, responsive layout, reduced-motion support
├── scripts/
│   ├── main.js                 # Application bootstrap
│   ├── title-animator.js       # Accessible progressive-enhancement title reveal
│   ├── email-modal.js          # Focus-trapped ARIA dialog controller
│   └── clipboard.js            # Async Clipboard API with safe legacy fallback
├── assets/
│   ├── avatar.svg              # Self-hosted monogram avatar (easily replaced with a local photo)
│   ├── favicon.svg             # Vector favicon
│   └── icons/                  # Self-hosted SVG skill badges (JS, Python, C#, HTML5, Java)
├── tests/                      # Vitest + jsdom unit, integration, and security contract tests
├── deploy/
│   └── nginx.conf              # Unprivileged Nginx config with security headers & /healthz
├── Dockerfile                  # Non-root nginxinc/nginx-unprivileged:1.27-alpine container
├── docker-compose.yml          # Hardened read-only container runtime
├── Makefile                    # Developer workflow commands
└── .github/workflows/ci.yml    # Automated lint, test, coverage, audit, and Docker build gates
```

## Tech Stack

- **Runtime:** HTML5, CSS3, Vanilla ES Modules (zero runtime dependencies)
- **Serving:** `nginxinc/nginx-unprivileged:1.27-alpine` (port `8080`, non-root user `101`, `/healthz` health check)
- **Quality & Testing:** Vitest + jsdom (`@vitest/coverage-v8`), ESLint, Stylelint, html-validate, Prettier
- **CI/CD:** GitHub Actions

## Security & Accessibility Highlights

- **Strict CSP without `unsafe-inline`:** All CSS and JS are served from external same-origin files; `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, and `frame-ancestors 'none'` (via Nginx).
- **Hardened HTTP Headers (`deploy/nginx.conf`):** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `Cross-Origin-Opener-Policy: same-origin`.
- **Safe External Links:** Every `target="_blank"` link enforces `rel="noopener noreferrer"`.
- **Zero Fragile Asset Hotlinks:** Replaces expired WhatsApp CDN URLs, Giphy GIFs, and Wikimedia hotlinks with self-hosted SVGs and a GPU-composited CSS background.
- **Accessible UX:** Skip-to-content link, `aria-label` + `aria-hidden` title animation, `prefers-reduced-motion` support, focus-trapped email modal with `Escape`/backdrop dismissal, `aria-live="polite"` clipboard announcements, and visible mobile navigation.

## Getting Started

### Prerequisites

- Node.js `>= 20` (for linting and automated tests)
- Python 3 (for quick local preview) or Docker

### Local Development

```bash
# Install dev/test tooling
make install

# Serve locally on http://localhost:8080
make dev
```

### Environment Variables

See `.env.example`:

| Variable | Default | Description                     |
| -------- | ------- | ------------------------------- |
| `PORT`   | `8080`  | Local server / Docker host port |

### Running Quality Gates

```bash
# Run HTML, CSS, JS, and Prettier checks
make lint

# Run unit, DOM integration, and security contract tests
make test

# Run tests with V8 coverage thresholds (>= 95% statements/functions/lines, >= 90% branches)
make coverage

# Run all checks together
make check
```

## Production Deployment (Docker)

```bash
# Build and run the hardened non-root read-only container
make docker-run

# Or with Docker Compose
docker compose up --build
```

Verify health:

```bash
curl -i http://localhost:8080/healthz
```

## Customizing the Profile Photo

The default avatar uses `assets/avatar.svg` so the site never breaks on expiring CDN links. To use a personal photo, save an optimized image at `assets/profile.webp` (or `.jpg`) and update the `src` attribute on the `<img>` inside `.profile-image-container` in `index.html`.
