#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

echo "[INFO] Killing current screen session..."
screen -S "botto" -X quit

nvm use 4

echo "[INFO] Pulling latest changes..."
git checkout master && git pull

echo "[INFO] Installing dependencies..."
npm install --no-optional

echo "[INFO] Starting bot in screen 'botto'"
screen -d -m -S botto node --use_strict botto.js

echo "[INFO] Bot started"

