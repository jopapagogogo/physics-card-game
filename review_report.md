# 代码审查报告 — 2026-06-24

> 全面审查，只读不修改。审查范围：所有 JS/CSS 文件。

---

## 审查范围

| 文件 | 行数 | 审查人 |
|------|------|--------|
| js/ui.js | ~3300 | Agent-1 |
| css/game_v2.css | ~1150 | Agent-1 |
| js/engine.js | ~2700 | Agent-2 |
| js/ai.js | ~1700 | Agent-2 |
| js/combo_table.js | ~200 | Agent-2 |
| js/cards.js | ~1240 | Agent-3 |
| js/quiz.js | ~1453 | Agent-3 |
| js/runes.js | ~8 | Agent-3 |

---

## 🔴 严重问题 (8项)

| # | 问题 | 文件:行号 |
|---|------|-----------|
| 1 | **混沌领域符文缺失** — DOMAIN_RUNES 只有5个领域，缺"混沌" | `runes.js:8` |
| 2 | **A11 缺少 isFieldCard** — 描述明确是驻场卡但 effect 中没有声明 | `cards.js:113` |
| 3 | **13处无效 relatedCard** — quiz.js 引用了不存在的 S35(11次)、S37(2次) | `quiz.js` (Q_L_系列) |
| 4 | **AI 灼烧估值错3倍** — `BURN_DMG=10` 实际 `BURN_BASE_DMG=30` | `ai.js:15` vs `engine.js:20` |
| 5 | **AI 伤害估算漏算大量加成** — 缺光谱叠加、短路开关、声速激增等 | `ai.js:1260` |
| 6 | **召唤物A区后视觉高亮未更新** — `_showTargetingVisuals` 仍查 D 区旧选择器 | `ui.js:3309` |
| 7 | **召唤物A区后 hover tooltip 缺失** — 匹配 `.summon-card` 未匹配 `.summon-mini` | `ui.js:1859` |
| 8 | **AI 威胁评估漏算** — 未考虑对手手牌攻击卡、攻击 buff、精神力储备 | `ai.js:281` |

---

## 🟡 中等问题 (17项)

| # | 问题 | 文件:行号 |
|---|------|-----------|
| 9 | **10处逻辑错误 relatedCard** — quiz 引用卡牌领域不匹配（如弹性势能→电系卡） | `quiz.js` |
| 10 | `viewHand` 字段类型不一致 — 同字段混用 integer/string | `cards.js` (A45,C10,S07,S18) |
| 11 | AI 硬编码 maxSize=7 未引用 MAX_HAND_SIZE | `ai.js:1549` |
| 12 | `_calcRawDamage` 漏算 8 种加成 — ignoreDefense 卡伤害偏低 | `engine.js:2648` |
| 13 | `_applySpecialEffects` 用字符串匹配检测效果 — 描述微调就失效 | `engine.js:1804` |
| 14 | Combo key 匹配 bug — AI 无法通过 S09 找到 combo (S09升/S09降后缀) | `combo_table.js:47` / `ai.js:141` |
| 15 | 弃牌阈值残留 `hand.length > 5` 与提示 7 不一致 | `ui.js:2487` |
| 16 | `discardTimer` 未在构造函数声明 | `ui.js:11` |
| 17 | 弃牌倒计时用递减而非时间戳 — 后台标签页暂停时不准 | `ui.js:2458` |
| 18 | key 渲染路径缺 try-catch — showDiscardScreen 等 4 方法裸奔 | `ui.js` 多处 |
| 19 | `renderHand` 高频 innerHTML 重绘 — 3-7张 V3 卡片全部重建 | `ui.js:1446` |
| 20 | CSS 注入样式与 game_v2.css 冲突 — log-drawer 布局依赖加载顺序 | `ui.js:1231` vs `game_v2.css:309` |
| 21 | 混沌领域题目仅 15 题 — 为其他领域的 43% | `quiz.js` |
| 22 | 初始抽牌 5 硬编码 | `engine.js:157` |
| 23 | discardPhase 不强制弃牌 — 依赖调用方传入索引，若忘记则溢出 | `engine.js:506` |
| 24 | Combo effect type 注释缺 12 种 | `combo_table.js:7` |
| 25 | AI 精神预算未考虑麻痹加费 | `ai.js:338` |

---

## 🟢 轻微问题 (11项)

| # | 问题 | 文件:行号 |
|---|------|-----------|
| 26 | ID 缺口 A07、A12 | `cards.js` |
| 27 | effect 字段 150+ 键名无规范 — 建议引入 type 枚举 | `cards.js` |
| 28 | 0 费攻击卡 A26 需特殊处理 | `cards.js` |
| 29 | 卡牌未完全按 ID 排序 | `cards.js` |
| 30 | `@keyframes toastIn` 被后定义版本覆盖 — log-toast 动画错误 | `game_v2.css:508 vs 293` |
| 31 | `.hidden { display:none!important }` 风格不一致 | `game_v2.css:689` |
| 32 | 缺少横屏响应式断点 | `game_v2.css` 整体 |
| 33 | `getDomainStyle` bg 色值无透明度 — 光系字体对比度低 | `ui.js:2968` |
| 34 | C04 玩家选择功能未实现 — 仍为随机 | `engine.js:456` |
| 35 | `_escapeAttr` vs `_escapeHtml` 使用不一致 | `ui.js:3012` |
| 36 | `getGameState().handSize` 字段存在但未使用 | `ui.js` |

---

## 📊 发现问题统计

| 严重度 | 数量 |
|:---:|:---:|
| 🔴 严重 | 8 |
| 🟡 中等 | 17 |
| 🟢 轻微 | 11 |
| **合计** | **36** |

---

## 🎯 优先修复建议 (Top 5)

1. **runes.js** — 补充混沌领域符文（运行时可能报错）
2. **ai.js:15** — `BURN_DMG` 从 10 改为 30（数值低估 3 倍）
3. **cards.js:113** — A11 添加 `isFieldCard: true`
4. **quiz.js** — 修正 23 处 relatedCard（13 无效 ID + 10 逻辑错误）
5. **ui.js:3309/1859** — 召唤物A区后更新视觉高亮和 hover tooltip
