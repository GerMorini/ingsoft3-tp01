#!/bin/sh

set -u

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$script_dir/.."

output_dir="${COVERAGE_DIR:-coverage}"
threshold="${BACKEND_COVERAGE_THRESHOLD:-25}"
profile="$output_dir/coverage.out"
unit_log="$output_dir/tests.txt"
coverage_log="$output_dir/coverage-tests.txt"
function_report="$output_dir/functions.txt"
summary="$output_dir/summary.md"

mkdir -p "$output_dir/html"

test_status=0
go test ./... >"$unit_log" 2>&1 || test_status=$?
cat "$unit_log"

coverage_status=0
go test \
  ./internal/identity/controller \
  ./internal/identity/service \
  ./internal/platform/config \
  ./internal/routines/controller \
  ./internal/routines/service \
  -coverprofile="$profile" >"$coverage_log" 2>&1 || coverage_status=$?
cat "$coverage_log"

report_status=0
total="0"
if [ -s "$profile" ]; then
  go tool cover -func="$profile" >"$function_report" || report_status=$?
  if [ "$report_status" -eq 0 ]; then
    cat "$function_report"
    total="$(awk '/^total:/ { value=$3; sub(/%$/, "", value); print value }' "$function_report")"
    go tool cover -html="$profile" -o "$output_dir/html/index.html" || report_status=$?
  fi
else
  report_status=1
fi

cat >"$summary" <<EOF
### Coverage del backend

| Métrica | Resultado |
|---|---:|
| Statements | ${total}% |
| Branches | No disponible en \`go test\` |
| Umbral de statements | ${threshold}% |
EOF

gate_status=0
if [ "$report_status" -ne 0 ]; then
  echo "No se pudo generar el reporte de cobertura." >&2
  gate_status=1
elif awk -v total="$total" -v threshold="$threshold" 'BEGIN { exit !(total < threshold) }'; then
  echo "Coverage de statements ${total}% menor al umbral ${threshold}%." >&2
  gate_status=1
fi

if [ "$test_status" -ne 0 ] || [ "$coverage_status" -ne 0 ] || [ "$report_status" -ne 0 ] || [ "$gate_status" -ne 0 ]; then
  exit 1
fi
