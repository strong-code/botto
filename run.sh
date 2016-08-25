#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

nvm use 4 && git checkout master && git pull && npm install --no-optional && screen -d -m -S botto node --use_strict botto.js && echo Bot started

#forever stopall && git checkout master && git pull && npm install --no-optional && screen -d -m -S botto forever start botto.js --use_strict && echo Bot started
