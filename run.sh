#!/usr/bin/env bash
forever stop && git checkout master && git pull && npm install && screen -d -m -S botto node start.js
