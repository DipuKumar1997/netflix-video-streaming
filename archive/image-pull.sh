#!/usr/bin/env bash
# Pre-pull images into Minikube's container runtime, one image at a time.
# Run from the Netflix project root: ./pull-images-minikube.sh
set -uo pipefail

command -v minikube >/dev/null || { echo "ERROR: minikube is not installed."; exit 1; }
command -v kubectl  >/dev/null || { echo "ERROR: kubectl is not installed."; exit 1; }

if ! minikube status >/dev/null 2>&1; then
  echo "ERROR: Minikube is not running. Start it first with: minikube start"
  exit 1
fi

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
failed=0

# Images currently referenced by running/pending pods, including init containers.
kubectl get pods -A \
  -o jsonpath='{range .items[*]}{range .spec.initContainers[*]}{.image}{"\n"}{end}{range .spec.containers[*]}{.image}{"\n"}{end}{end}' \
  2>/dev/null >> "$tmp" || true

# Images built by the project's startup script. If present in host Docker,
# load them into Minikube; otherwise try pulling them from the registry.
cat >> "$tmp" <<'IMAGES'
apache/kafka:4.0.2
elasticsearch:8.19.23
mongo:latest
dk95074450/netflix-backend:v1
dk95074450/netflix-frontend:v1
dk95074450/netflix-search:v1
IMAGES

# Optional extra image list: one image per line in images-to-pull.txt.
if [[ -f images-to-pull.txt ]]; then
  cat images-to-pull.txt >> "$tmp"
fi

# Remove blanks/comments and duplicates.
mapfile -t images < <(sed 's/#.*//; /^[[:space:]]*$/d; s/^[[:space:]]*//; s/[[:space:]]*$//' "$tmp" | sort -u)

if [[ ${#images[@]} -eq 0 ]]; then
  echo "No images found."
  exit 0
fi

echo "Found ${#images[@]} unique image references."
echo "Images will be loaded/pulled one by one into Minikube."
echo

for image in "${images[@]}"; do
  echo "============================================================"
  echo "IMAGE: $image"

  # Local images built with Docker on the host need to be loaded, not pulled.
  if command -v docker >/dev/null 2>&1 && docker image inspect "$image" >/dev/null 2>&1; then
    if minikube image load "$image"; then
      echo "OK: loaded local Docker image: $image"
      continue
    else
      echo "WARN: local image load failed; trying registry pull..."
    fi
  fi

  if minikube image pull "$image"; then
    echo "OK: pulled into Minikube: $image"
  else
    echo "FAILED: $image"
    echo "  Check the image tag/registry. Missing or retired tags cannot be pulled."
    failed=$((failed + 1))
  fi
done

echo
echo "============================================================"
echo "Image preload finished."
if (( failed > 0 )); then
  echo "$failed image(s) failed. The script attempted every image."
  echo "See the FAILED entries above. A shell script cannot pull tags that do not exist."
  exit 1
else
  echo "All image references were loaded or pulled successfully."
fi
