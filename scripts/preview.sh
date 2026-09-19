#!/bin/sh
# VMH SMR full-stack dev preview:
#   1. Express API backend on port 5000 (Vite proxy target)
#   2. Vite React client on $PORT (injected by Freebuff, default 3000), bound to 0.0.0.0
SERVER_PORT=5000

PORT="$SERVER_PORT" node server/src/server.js &
SERVER_PID=$!

cd client || exit 1

# Forward TERM/INT to the backend so everything shuts down cleanly
trap 'kill "$SERVER_PID" 2>/dev/null' EXIT INT TERM

exec ./node_modules/.bin/vite --host 0.0.0.0 --port "${PORT:-3000}"
