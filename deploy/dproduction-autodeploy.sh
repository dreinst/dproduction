#!/usr/bin/env bash
# Auto deploy D'Production ke Coolify: hanya SHA main yang check "ci"-nya hijau di GitHub Actions.
#
# Pasang di VPS (sebagai root), menimpa skrip lama yang dipanggil timer systemd tiap 2 menit:
#   install -m 755 deploy/dproduction-autodeploy.sh /usr/local/bin/dproduction-autodeploy.sh
#   install -m 600 /dev/null /etc/dproduction-autodeploy.env   (lalu isi, contoh di bawah)
#
# Isi /etc/dproduction-autodeploy.env:
#   COOLIFY_URL=http://127.0.0.1:8000
#   COOLIFY_TOKEN=<token API Coolify dengan izin deploy dan write>
#   APP_UUID=c7ezyfbcfz1buariz99ktals
#   GITHUB_REPO=dreinst/dproduction
#   GITHUB_TOKEN=<opsional, token baca saja supaya tidak kena batas 60 request per jam>
#   STATE_DIR=/var/lib/dproduction-autodeploy   (opsional, ini nilai bawaannya)
#
# Prasyarat: app Coolify memakai sumber repo Git dreinst/dproduction dengan build pack Dockerfile
# (Dockerfile di root repo) dan auto deploy bawaan Coolify dimatikan, supaya git_commit_sha dipakai
# saat build dan hanya skrip ini yang men-deploy.
#
# Nama field dan endpoint Coolify (PATCH /api/v1/applications/{uuid} field git_commit_sha,
# GET /api/v1/deploy?uuid=, GET /api/v1/deployments/{uuid} field status) harus dicek dulu
# terhadap versi Coolify yang terpasang di VPS sebelum skrip ini dipakai.
#
# Mode:
#   DRY_RUN=1   hanya mencetak SHA main, status check ci, dan langkah yang akan dijalankan.
#               Tidak memanggil Coolify dan tidak menulis state.
#   ROLLBACK_SHA=<sha 40 karakter>   men-deploy SHA itu tanpa cek main dan CI. SHA main saat itu
#               ditahan (tidak di-deploy otomatis) sampai ada commit baru di main; hapus
#               $STATE_DIR/hold untuk melepasnya. Migrasi jalan saat container start dan SHA lama
#               tidak membatalkannya. Kalau skema sudah berubah, perbaiki dengan migrasi maju.
#
# State di $STATE_DIR: last_success (hanya ditulis kalau deployment finished), last_attempt dan
# attempts (maksimal 3 percobaan per SHA; hapus attempts untuk mencoba lagi), hold, lock.

set -euo pipefail

if [[ -r /etc/dproduction-autodeploy.env ]]; then
  set -a
  # shellcheck disable=SC1091
  . /etc/dproduction-autodeploy.env
  set +a
fi

: "${GITHUB_REPO:?GITHUB_REPO belum diisi}"
STATE_DIR=${STATE_DIR:-/var/lib/dproduction-autodeploy}
DRY_RUN=${DRY_RUN:-0}
ROLLBACK_SHA=${ROLLBACK_SHA:-}
MAX_ATTEMPTS=3
DEPLOY_TIMEOUT=1200

log() { echo "dproduction-autodeploy: $*" >&2; }
state() { cat "$STATE_DIR/$1" 2>/dev/null || true; }
save() { printf '%s\n' "$2" > "$STATE_DIR/$1.tmp" && mv "$STATE_DIR/$1.tmp" "$STATE_DIR/$1"; }

# Token dikirim ke curl lewat stdin (-K -) supaya tidak terlihat di daftar proses (ps).
github() {
  local auth=""
  [[ -z ${GITHUB_TOKEN:-} ]] || auth="header = \"Authorization: Bearer $GITHUB_TOKEN\""
  curl -fsS --max-time 30 -K - -H "Accept: application/vnd.github+json" "$@" <<<"$auth"
}

# coolify METHOD PATH [JSON]
coolify() {
  local method=$1 path=$2
  shift 2
  if [[ $# -gt 0 ]]; then
    set -- -H "Content-Type: application/json" --data "$1"
  fi
  curl -sS --fail-with-body --max-time 30 -X "$method" -K - -H "Accept: application/json" \
    "$@" "$COOLIFY_URL/api/v1$path" <<<"header = \"Authorization: Bearer $COOLIFY_TOKEN\""
}

if [[ $DRY_RUN != 1 ]]; then
  : "${COOLIFY_URL:?COOLIFY_URL belum diisi}" "${COOLIFY_TOKEN:?COOLIFY_TOKEN belum diisi}" "${APP_UUID:?APP_UUID belum diisi}"
  mkdir -p "$STATE_DIR"
  exec 9>"$STATE_DIR/lock"
  flock -n 9 || { log "Proses lain masih berjalan, putaran ini dilewati."; exit 0; }
fi

main_sha=$(github "https://api.github.com/repos/$GITHUB_REPO/branches/main" | jq -r '.commit.sha')
[[ $main_sha =~ ^[0-9a-f]{40}$ ]] || { log "SHA main tidak terbaca: $main_sha"; exit 1; }
log "SHA main: $main_sha"

if [[ -n $ROLLBACK_SHA ]]; then
  [[ $ROLLBACK_SHA =~ ^[0-9a-f]{40}$ ]] || { log "ROLLBACK_SHA harus SHA lengkap 40 karakter huruf kecil."; exit 1; }
  sha=$ROLLBACK_SHA
  log "Rollback ke $sha. SHA main $main_sha ditahan sampai ada commit baru di main."
  [[ $DRY_RUN == 1 ]] || save hold "$main_sha"
else
  sha=$main_sha
  if [[ $sha == "$(state last_success)" ]]; then
    log "SHA $sha sudah live."
    exit 0
  fi
  if [[ $sha == "$(state hold)" ]]; then
    log "SHA $sha ditahan setelah rollback, menunggu commit baru di main."
    exit 0
  fi

  run=$(github "https://api.github.com/repos/$GITHUB_REPO/commits/$sha/check-runs?check_name=ci" |
    jq -c '.check_runs | max_by(.id) // {}')
  ci_status=$(jq -r '.status // "belum ada"' <<<"$run")
  ci_conclusion=$(jq -r '.conclusion // "belum ada"' <<<"$run")
  log "Check ci untuk $sha: status $ci_status, hasil $ci_conclusion."
  if [[ $ci_status != completed ]]; then
    log "CI belum selesai, tunggu putaran berikutnya."
    exit 0
  fi
  if [[ $ci_conclusion != success ]]; then
    log "CI tidak hijau, SHA ini tidak di-deploy."
    exit 0
  fi

  attempts=0
  if [[ $sha == "$(state last_attempt)" ]]; then
    attempts=$(state attempts)
    attempts=${attempts:-0}
  fi
  if ((attempts >= MAX_ATTEMPTS)); then
    log "SHA $sha sudah dicoba $attempts kali dan gagal, berhenti. Hapus $STATE_DIR/attempts untuk mencoba lagi."
    exit 0
  fi
fi

if [[ $DRY_RUN == 1 ]]; then
  log "DRY_RUN: PATCH /api/v1/applications/${APP_UUID:-<APP_UUID>} git_commit_sha=$sha, GET /api/v1/deploy?uuid=${APP_UUID:-<APP_UUID>}, lalu cek status deployment sampai finished, failed, atau cancelled (maksimal 20 menit)."
  exit 0
fi

if [[ -z $ROLLBACK_SHA ]]; then
  save last_attempt "$sha"
  save attempts $((attempts + 1))
fi

coolify PATCH "/applications/$APP_UUID" "$(jq -nc --arg sha "$sha" '{git_commit_sha: $sha}')" >/dev/null
deployment=$(coolify GET "/deploy?uuid=$APP_UUID" | jq -r '.deployments[0].deployment_uuid // empty')
[[ -n $deployment ]] || { log "Coolify tidak mengembalikan deployment_uuid."; exit 1; }
log "Deployment $deployment untuk $sha dimulai."

deadline=$((SECONDS + DEPLOY_TIMEOUT))
while ((SECONDS < deadline)); do
  sleep 15
  status=$(coolify GET "/deployments/$deployment" | jq -r '.status') || status="tidak terbaca"
  case $status in
    finished)
      save last_success "$sha"
      log "Deployment $sha selesai."
      exit 0
      ;;
    failed | cancelled*)
      log "Deployment $sha berstatus $status."
      exit 1
      ;;
  esac
done
log "Deployment $sha belum selesai setelah 20 menit."
exit 1
