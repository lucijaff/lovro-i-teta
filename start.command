#!/bin/zsh
# Pokreće igru: server + preglednik. Dvoklik u Finderu radi.
cd "$(dirname "$0")"
( sleep 1 && open "http://localhost:8123" ) &
python3 -m http.server 8123
