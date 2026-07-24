#!/bin/bash
# ============================================================
# 物理卡牌对战 — 构建脚本
# 将源代码混淆压缩后输出到 docs/，供 GitHub Pages 部署
# ============================================================
set -e

GAME_DIR="/workspace/physics-card-game"
DOCS_DIR="$GAME_DIR/docs"
JS_DIR="$GAME_DIR/js"
CSS_DIR="$GAME_DIR/css"
ART_DIR="$GAME_DIR/art_samples"

echo "🧹 清理旧构建..."
rm -rf "$DOCS_DIR"
mkdir -p "$DOCS_DIR/js" "$DOCS_DIR/css" "$DOCS_DIR/art_samples/card_art" "$DOCS_DIR/art_samples/qr"

echo "📄 复制静态资源..."
cp "$GAME_DIR/index.html" "$DOCS_DIR/index.html"
cp "$GAME_DIR/approved_cards.json" "$DOCS_DIR/approved_cards.json"
cp "$CSS_DIR"/*.css "$DOCS_DIR/css/" 2>/dev/null || true
cp "$ART_DIR/card_art/"*.png "$DOCS_DIR/art_samples/card_art/" 2>/dev/null || true
cp "$ART_DIR/card_art/"*.jpg "$DOCS_DIR/art_samples/card_art/" 2>/dev/null || true
cp "$ART_DIR/card_art/"*.webp "$DOCS_DIR/art_samples/card_art/" 2>/dev/null || true
cp "$ART_DIR/qr/"* "$DOCS_DIR/art_samples/qr/" 2>/dev/null || true

echo "🔒 混淆压缩 JS..."
for js_file in "$JS_DIR"/*.js; do
  filename=$(basename "$js_file")
  echo "  处理 $filename..."
  NODE_OPTIONS="" terser "$js_file" \
    --module \
    --mangle \
    --compress drop_console=true,drop_debugger=true,passes=2 \
    --output "$DOCS_DIR/js/$filename" \
    2>&1 || { echo "❌ $filename 压缩失败"; exit 1; }
done

# 更新 index.html 的 JS 引用（去掉 ?v=xx 缓存破坏符）
sed -i 's|js/ui.js?v=[0-9]*|js/ui.js|g' "$DOCS_DIR/index.html"

# 统计
SRC_SIZE=$(du -sh "$JS_DIR" | cut -f1)
BUILD_SIZE=$(du -sh "$DOCS_DIR/js" | cut -f1)
echo ""
echo "✅ 构建完成"
echo "  原始 JS: $SRC_SIZE → 混淆后: $BUILD_SIZE"
echo "  输出目录: $DOCS_DIR"
