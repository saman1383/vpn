#!/usr/bin/env bash
# Vira front-end installer. Review this script before running as root.
set -Eeuo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PORT=8080
DOMAIN=""
EMAIL=""
NAME=vira
YES=false
DRY_RUN=false
SKIP_DOCKER=false
usage() {
  cat <<'HELP'
Vira website installer (front-end demo only)

Usage: sudo bash install.sh [options]

  --yes                  Accept installation without interactive confirmation
  --domain example.com   Enable Caddy automatic HTTPS (DNS must point here)
  --email you@example.com ACME contact email (required with --domain)
  --port 8080            HTTP port; localhost-only when HTTPS is enabled
  --name vira            Compose project name: lower-case letters/digits/hyphens
  --skip-docker-install  Require existing Docker and Compose; do not install them
  --dry-run              Validate and print the plan without changing anything
  --help                 Show this help

Supported automatic bootstrap: Ubuntu 22.04/24.04 and Debian 12/13, with systemd.
With existing Docker + Compose, other Linux distributions may also work.
Default: HTTP on port 8080. HTTPS requires reachable ports 80 and 443.
This installs the public UI and sample dashboards, NOT a VPN server/backend.
Admin has no authentication. Do not use this demo with sensitive information.
Re-run with the same options to rebuild/redeploy; no git pull is performed.
HELP
}
die() { printf 'Error: %s\n' "$*" >&2; exit 1; }
need_value() { [[ $# -ge 2 && -n "$2" && "$2" != --* ]] || die "Option $1 needs a value."; }
while [[ $# -gt 0 ]]; do
  case "$1" in
    --yes) YES=true; shift ;;
    --dry-run) DRY_RUN=true; shift ;;
    --skip-docker-install) SKIP_DOCKER=true; shift ;;
    --domain) need_value "$@"; DOMAIN="$2"; shift 2 ;;
    --email) need_value "$@"; EMAIL="$2"; shift 2 ;;
    --port) need_value "$@"; PORT="$2"; shift 2 ;;
    --name) need_value "$@"; NAME="$2"; shift 2 ;;
    --help|-h) usage; exit 0 ;;
    *) die "Unknown option: $1 (see --help)" ;;
  esac
done
[[ "$PORT" =~ ^[0-9]{1,5}$ ]] || die 'Port must be an integer between 1 and 65535.'
PORT=$((10#$PORT))
(( PORT >= 1 && PORT <= 65535 )) || die 'Port must be between 1 and 65535.'
[[ "$NAME" =~ ^[a-z][a-z0-9-]{0,39}$ ]] || die 'Invalid project name (use up to 40 lower-case letters/digits/hyphens, starting with a letter).'
if [[ -n "$DOMAIN" ]]; then
  [[ ${#DOMAIN} -le 253 && "$DOMAIN" =~ ^[a-zA-Z0-9.-]+$ && "$DOMAIN" == *.* && "$DOMAIN" != *..* ]] || die 'Use a valid ASCII domain (no scheme, path, or wildcard).'
  IFS='.' read -r -a labels <<< "$DOMAIN"
  for label in "${labels[@]}"; do
    [[ "$label" =~ ^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$ ]] || die 'Invalid domain label.'
  done
  [[ "$DOMAIN" != *. && ! "$DOMAIN" =~ ^[0-9.]+$ ]] || die 'A DNS domain, not an IP address, is required for HTTPS.'
  [[ "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]] || die 'A valid --email is required with --domain.'
  (( PORT != 80 && PORT != 443 )) || die 'For HTTPS, --port must not be 80 or 443 (reserved for Caddy).'
elif [[ -n "$EMAIL" ]]; then
  die '--email requires --domain.'
fi
[[ -f "$ROOT/Dockerfile" && -f "$ROOT/compose.yaml" ]] || die 'Run this installer from a complete Vira checkout.'
printf '\nVIRA / deployment plan\n  Project: %s\n  Source: %s\n  HTTP: %s:%s\n' "$NAME" "$ROOT" "$([[ -n "$DOMAIN" ]] && echo 127.0.0.1 || echo 0.0.0.0)" "$PORT"
[[ -z "$DOMAIN" ]] || printf '  HTTPS: https://%s (Caddy; ports 80/443)\n' "$DOMAIN"
printf '  Storage: browser-local demo data; no production backend/authentication.\n  Host firewall/DNS and existing web servers will NOT be modified.\n'
if $DRY_RUN; then
  printf '\nDry run: no changes made. Real installation will check/install Docker and Compose,\nbuild the React site, start containers, and verify the internal HTTP health check.\n'
  exit 0
fi
[[ "$(uname -s)" == Linux ]] || die 'The server installer supports Linux only.'
[[ $EUID -eq 0 ]] || die 'Run with sudo (or use --dry-run without root).'
if ! $YES; then
  [[ -t 0 ]] || die 'Non-interactive installation requires --yes.'
  read -r -p 'Install this public DEMO and Docker packages if needed? [y/N] ' answer
  [[ "$answer" == y || "$answer" == Y ]] || die 'Cancelled; no changes made.'
fi
trap 'printf "\nInstallation failed at line %s. Existing unrelated services were not removed.\nReview the error above; see docs/INSTALL.fa.md for troubleshooting.\n" "$LINENO" >&2' ERR
command -v flock >/dev/null || die 'flock is required (util-linux package).'
exec 9>"/var/lock/vira-${NAME}-installer.lock"
flock -n 9 || die 'Another installation for this project is running.'
has_compose() { docker compose version >/dev/null 2>&1 || command -v docker-compose >/dev/null 2>&1; }
if ! command -v docker >/dev/null || ! has_compose; then
  $SKIP_DOCKER && die 'Docker and Docker Compose are required (--skip-docker-install was set).'
  [[ -f /etc/os-release ]] || die 'Cannot detect distribution; install Docker/Compose manually.'
  # Read in a subshell: os-release also defines NAME, which must not overwrite the project name.
  OS_ID="$(. /etc/os-release; printf '%s' "$ID")"
  [[ "$OS_ID" == ubuntu || "$OS_ID" == debian ]] || die 'Automatic package installation supports Ubuntu/Debian only. Install Docker and Compose manually.'
  command -v apt-get >/dev/null || die 'apt-get not found.'
  apt-get update
  if ! command -v docker >/dev/null; then
    DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io
  fi
  if ! has_compose; then
    if apt-cache show docker-compose-v2 >/dev/null 2>&1; then
      DEBIAN_FRONTEND=noninteractive apt-get install -y docker-compose-v2
    else
      DEBIAN_FRONTEND=noninteractive apt-get install -y docker-compose
    fi
  fi
fi
if ! docker info >/dev/null 2>&1; then
  command -v systemctl >/dev/null || die 'Docker daemon is not running. Start it and retry.'
  systemctl enable --now docker
fi
docker info >/dev/null 2>&1 || die 'Cannot contact Docker daemon.'
if docker compose version >/dev/null 2>&1; then COMPOSE=(docker compose); else COMPOSE=(docker-compose); fi
# Keep generated deployment settings private and outside source control.
mkdir -p "$ROOT/.deploy"
chmod 700 "$ROOT/.deploy"
ENV_FILE="$ROOT/.deploy/${NAME}.env"
BIND=0.0.0.0
[[ -z "$DOMAIN" ]] || BIND=127.0.0.1
TEMP_ENV="$(mktemp "$ROOT/.deploy/.install.XXXXXX")"
chmod 600 "$TEMP_ENV"
printf 'SITE_PORT=%s\nBIND_ADDRESS=%s\nSITE_ADDRESS=%s\nACME_EMAIL=%s\n' "$PORT" "$BIND" "${DOMAIN:-localhost}" "${EMAIL:-admin@example.com}" > "$TEMP_ENV"
# Refuse to take over an unrelated Compose deployment with the same project name.
while IFS= read -r container; do
  [[ -z "$container" ]] && continue
  managed="$(docker inspect --format '{{ index .Config.Labels "io.vira.installer" }}' "$container")"
  [[ "$managed" == true ]] || die "Project $NAME contains an unrelated container. Choose a different --name."
done < <(docker ps -a --filter "label=com.docker.compose.project=$NAME" --format '{{.ID}}')
ARGS=(-p "$NAME" --project-directory "$ROOT" --env-file "$TEMP_ENV" -f "$ROOT/compose.yaml")
[[ -z "$DOMAIN" ]] || ARGS+=(--profile https)
"${COMPOSE[@]}" "${ARGS[@]}" config --quiet
# Build before modifying the currently running deployment.
"${COMPOSE[@]}" "${ARGS[@]}" build --pull web
if [[ -z "$DOMAIN" ]]; then
  # Explicitly stop an old HTTPS proxy when switching this project back to HTTP.
  "${COMPOSE[@]}" "${ARGS[@]}" --profile https stop proxy
fi
"${COMPOSE[@]}" "${ARGS[@]}" up -d
mv -f "$TEMP_ENV" "$ENV_FILE"
ARGS=(-p "$NAME" --project-directory "$ROOT" --env-file "$ENV_FILE" -f "$ROOT/compose.yaml")
[[ -z "$DOMAIN" ]] || ARGS+=(--profile https)
printf '\nWaiting for web health check...\n'
healthy=false
for attempt in $(seq 1 30); do
  if "${COMPOSE[@]}" "${ARGS[@]}" exec -T web wget -q -O /dev/null http://127.0.0.1:8080/healthz; then healthy=true; break; fi
  sleep 2
done
$healthy || die 'Web health check failed. Inspect container logs; do not assume deployment succeeded.'
printf '\nInstallation complete: web HTTP health check passed.\n'
if [[ -n "$DOMAIN" ]]; then
  printf 'Open https://%s\nTLS issuance is asynchronous and requires correct DNS and reachable ports 80/443.\nCheck proxy logs to confirm certificate issuance; the installer does not verify public HTTPS.\n' "$DOMAIN"
else
  printf 'Open http://YOUR_SERVER_IP:%s (allow this port in your firewall if needed).\n' "$PORT"
fi
printf '\nAdmin: /#admin (public demo, NO authentication)\nConfig: %s\nGuide: docs/INSTALL.fa.md\n' "$ENV_FILE"
