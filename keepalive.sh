#!/bin/bash
# 物理卡牌游戏 - 服务器保活脚本
# 每分钟检查8000端口，挂了自动拉起

PORT=8000
GAME_DIR="/workspace/physics-card-game"
LOG_FILE="/tmp/game-keepalive.log"

while true; do
    if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/index.html | grep -q 200; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 端口$PORT 无响应，重启服务器..." >> "$LOG_FILE"
        lsof -ti:$PORT | xargs kill -9 2>/dev/null
        sleep 1
        cd "$GAME_DIR" && nohup python3 -m http.server $PORT --bind 0.0.0.0 > /tmp/game-server.log 2>&1 &
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 服务器已重启，PID=$!" >> "$LOG_FILE"
    fi
    sleep 60
done
