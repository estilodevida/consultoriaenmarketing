#!/bin/sh
set -e

if [ -f /run/secrets/access-key.pem ]; then
  export ACCESS_TOKEN_SECRET=$(cat /run/secrets/access-key.pem)
fi

if [ -f /run/secrets/login-key.pem ]; then
  export LOGIN_TOKEN_SECRET=$(cat /run/secrets/login-key.pem)
fi

if [ -f /run/secrets/refresh-key.pem ]; then
  export REFRESH_TOKEN_SECRET=$(cat /run/secrets/refresh-key.pem)
fi

# Run upgrade for all workspaces (creates metadata objects for new workspaces)
if [ "${DISABLE_DB_MIGRATIONS}" != "true" ]; then
  echo "Running workspace upgrades..."
  node dist/main command:prod upgrade 2>&1 || echo "Warning: Upgrade completed with errors"
  echo "Upgrade done!"
fi

exec node dist/main "$@"
