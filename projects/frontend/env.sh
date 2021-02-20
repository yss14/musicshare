#!/bin/bash

# Recreate config file
rm -rf ./env-config.js
touch ./env-config.js

env_config=$(printenv | grep -e "^REACT_APP" | sed -e 's/^\([^=]*\)=\(.*\)/\1:"\2",/')
echo "window._env_ = {$env_config}" > /usr/share/nginx/html/env-config.js