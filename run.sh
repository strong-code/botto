#!/usr/bin/env bash

git checkout master && git pull && npm install --no-optional && screen -d -m -S botto node --use_strict botto.js && echo Bot started

#forever stopall && git checkout master && git pull && npm install --no-optional && screen -d -m -S botto forever start botto.js --use_strict && echo Bot started
