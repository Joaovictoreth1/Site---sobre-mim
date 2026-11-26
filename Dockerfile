FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY --chown=nginx:nginx deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx deploy/security-headers.conf /etc/nginx/conf.d/security-headers.inc
COPY --chown=nginx:nginx index.html robots.txt manifest.webmanifest /usr/share/nginx/html/
COPY --chown=nginx:nginx styles /usr/share/nginx/html/styles
COPY --chown=nginx:nginx scripts /usr/share/nginx/html/scripts
COPY --chown=nginx:nginx assets /usr/share/nginx/html/assets

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

USER 101
