#!/usr/bin/env bash
# scripts/test-proposal-flow.sh
# Smoke test del flujo CON-191: genera una propuesta de prueba
# y verifica que el HTML/texto cumplen los criterios de aceptación.
#
# Uso:
#   WEB=https://consultoriaenmarketing.com ./scripts/test-proposal-flow.sh
#   WEB=http://localhost:3000 ./scripts/test-proposal-flow.sh
#   TOKEN=tu_token_admin ./scripts/test-proposal-flow.sh
#
# Variables de entorno:
#   WEB              base URL de la web (default: https://consultoriaenmarketing.com)
#   TOKEN            X-Internal-Token o X-Admin-Token (default: lee .env del proyecto)
#   EMAIL            email del lead de prueba (default: test+con191@consultoriaenmarketing.com)
#   SECTOR           sector (default: plataformas_elevadoras)
#   SERVICIO         servicio (default: MATILSA PARMA 9)
#   ZONA             zona (default: Sevilla y provincia)
#   DRY_RUN          si =1, no espera envío real (default: 0)

set -euo pipefail

WEB="${WEB:-https://consultoriaenmarketing.com}"
EMAIL="${EMAIL:-test+con191+$(date +%s)@consultoriaenmarketing.com}"
SECTOR="${SECTOR:-plataformas_elevadoras}"
SERVICIO="${SERVICIO:-MATILSA PARMA 9}"
ZONA="${ZONA:-Sevilla y provincia}"
DRY_RUN="${DRY_RUN:-0}"

# Si no nos pasan TOKEN, intenta leer .env
if [[ -z "${TOKEN:-}" ]]; then
  ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"
  if [[ -f "$ENV_FILE" ]]; then
    TOKEN="$(grep -E '^(INTERNAL_API_TOKEN|ADMIN_TOKEN)' "$ENV_FILE" | head -1 | cut -d= -f2- || true)"
  fi
fi
TOKEN="${TOKEN:-admin123}"

echo "== CON-191 · Test del flujo de propuestas =="
echo "WEB      = $WEB"
echo "EMAIL    = $EMAIL"
echo "SECTOR   = $SECTOR"
echo "SERVICIO = $SERVICIO"
echo "ZONA     = $ZONA"
echo "DRY_RUN  = $DRY_RUN"
echo

# 1) Crear la propuesta
PAYLOAD=$(cat <<JSON
{
  "nombre": "Lead de prueba CON-191",
  "email":   "$EMAIL",
  "telefono": "+34600000000",
  "empresa":  "Pruebas S.L.",
  "sector":   "$SECTOR",
  "servicio": "$SERVICIO",
  "zona":     "$ZONA",
  "motivo":   "Cliente fundador del sector (test)"
}
JSON
)

echo "== 1) POST /api/proposals/generate =="
RESP=$(curl -sS -X POST "$WEB/api/proposals/generate" \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: $TOKEN" \
  -d "$PAYLOAD")
echo "$RESP" | python3 -m json.tool | head -40
echo

PROPOSAL_ID=$(echo "$RESP" | python3 -c 'import json,sys;d=json.loads(sys.stdin.read());print(d.get("proposal_id",""))')
STATUS=$(echo "$RESP" | python3 -c 'import json,sys;d=json.loads(sys.stdin.read());print(d.get("status",""))')
REVIEW_REQUIRED=$(echo "$RESP" | python3 -c 'import json,sys;d=json.loads(sys.stdin.read());print(d.get("review_required",""))')

if [[ -z "$PROPOSAL_ID" ]]; then
  echo "❌ No se obtuvo proposal_id"
  exit 1
fi
echo "  proposal_id      = $PROPOSAL_ID"
echo "  status           = $STATUS"
echo "  review_required  = $REVIEW_REQUIRED"
echo

# 2) Verificación del HTML/texto
HTML=$(echo "$RESP" | python3 -c 'import json,sys;d=json.loads(sys.stdin.read());print(d.get("html_preview",""))')
TEXTO=$(echo "$RESP" | python3 -c 'import json,sys;d=json.loads(sys.stdin.read());print(d.get("texto",""))')
ENLACE=$(echo "$RESP" | python3 -c 'import json,sys;d=json.loads(sys.stdin.read());print(d.get("enlace_llamada",""))')

echo "== 2) Verificación de criterios de aceptación =="
ERRORS=0

check() {
  local label="$1"; local needle="$2"; local haystack="$3"
  if echo "$haystack" | grep -qF "$needle"; then
    echo "  ✅ $label contiene '$needle'"
  else
    echo "  ❌ $label NO contiene '$needle'"
    ERRORS=$((ERRORS+1))
  fi
}

check "HTML"  "https://consultoriaenmarketing.com" "$HTML"
check "HTML"  "900"      "$HTML"
check "HTML"  "350"      "$HTML"
check "HTML"  "Lead de prueba CON-191"  "$HTML"  # el nombre sí, el email no (PII)
check "HTML"  "$SERVICIO" "$HTML"
check "HTML"  "$ZONA"    "$HTML"
check "HTML"  "Reservar llamada" "$HTML"
check "Texto" "https://consultoriaenmarketing.com" "$TEXTO"
check "Texto" "900"      "$TEXTO"
check "Texto" "350"      "$TEXTO"
check "Texto" "$SERVICIO" "$TEXTO"
check "Texto" "$ZONA"    "$TEXTO"
check "Enlace" "/agendar?lead=" "$ENLACE"

# 3) Verificar en Supabase (status)
echo
echo "== 3) GET /api/proposals/$PROPOSAL_ID =="
sleep 2
GET=$(curl -sS -X GET "$WEB/api/proposals/$PROPOSAL_ID" \
  -H "X-Internal-Token: $TOKEN")
echo "$GET" | python3 -m json.tool | head -25
GET_STATUS=$(echo "$GET" | python3 -c 'import json,sys;d=json.loads(sys.stdin.read());print(d.get("proposal",{}).get("status",""))' 2>/dev/null || echo "")
echo "  status en BD = $GET_STATUS"
echo

# 4) Verificación en n8n (si está disponible)
echo "== 4) Log de ejecuciones n8n (si local) =="
if [[ -f /home/n8n/database.sqlite ]]; then
  sqlite3 /home/n8n/database.sqlite "SELECT id, workflowId, status, startedAt FROM execution_entity ORDER BY startedAt DESC LIMIT 5;" 2>/dev/null | head -10 || echo "  no se pudo consultar la BD de n8n"
else
  echo "  /home/n8n/database.sqlite no accesible (no estamos en el VPS)"
fi

echo
if [[ $ERRORS -gt 0 ]]; then
  echo "❌ $ERRORS comprobaciones fallaron"
  exit 2
fi
echo "✅ Smoke test CON-191 OK (status=$STATUS, review_required=$REVIEW_REQUIRED)"
