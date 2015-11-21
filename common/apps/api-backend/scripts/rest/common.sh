#!/bin/bash

arch=`uname`;
[ "$arch" == 'Darwin' ] && { export JQ='./bin/jq'; return;}
[ "$arch" == 'Linux' ] && { export JQ='./bin/jq-linux64'; return;}
