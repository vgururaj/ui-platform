#!/bin/sh
# Write ALL env vars with CONFIG_PREFIX (default VITE_) into config.js.
# No hardcoded application keys — empty env yields empty __ENV__ (app may apply its own defaults).
set -eu

OUT="${CONFIG_JS_PATH:-/usr/share/nginx/html/config.js}"
PREFIX="${CONFIG_PREFIX:-VITE_}"

env | sort | awk -v prefix="$PREFIX" '
function esc(s,  t) {
  t = s
  gsub(/\\/, "\\\\", t)
  gsub(/"/, "\\\"", t)
  gsub(/\r/, " ", t)
  gsub(/\n/, " ", t)
  return t
}
BEGIN { first = 1; count = 0 }
{
  eq = index($0, "=")
  if (eq < 1) next
  key = substr($0, 1, eq - 1)
  if (index(key, prefix) != 1) next
  val = substr($0, eq + 1)
  if (!first) printf ",\n"
  else printf "window.__ENV__ = {\n"
  printf "  %s: \"%s\"", key, esc(val)
  first = 0
  count++
}
END {
  if (count == 0) {
    printf "window.__ENV__ = {};\n"
  } else {
    printf "\n};\n"
  }
}
' >"$OUT"

echo "runtime-env: wrote ${OUT} (prefix=${PREFIX})"
