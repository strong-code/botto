#!/usr/bin/env bash
forever stopall && git checkout master && git pull && npm install --no-optional && screen -d -m -S botto node start.js
