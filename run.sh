#!/usr/bin/env bash
git checkout master && git pull && npm install && screen -d -m -S botto node start.js
