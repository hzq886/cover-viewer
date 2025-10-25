#!/usr/bin/env bash
set -euo pipefail

NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi

# shellcheck disable=SC1090
source "$NVM_DIR/nvm.sh"

nvm install node
nvm use node

npm install
npm install -g pnpm

echo "Setup complete. You can now run:"
echo "  npm run type-check"
echo "  npm run lint"
echo "and, after fixes,  npm run format"
