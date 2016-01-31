#!/usr/bin/env bash
echo "starting mongodb"
echo | mongod --config mongod.conf & sleep 2 && echo | mongo localhost/feelathome createMongo.js