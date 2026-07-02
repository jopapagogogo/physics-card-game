# 代码审查报告 — 2026-07-02

> 全面审查，只读不修改。审查范围：全部 JS/CSS 文件 + 上次问题追踪 + AI_CONTEXT 铁律检查。

---

## 审查范围

| 文件 | 行数 | 状态 |
|------|------|------|
| js/cards.js | 1287 | 已审查 |
| js/engine.js | 2883 | 已审查 |
| js/combo_table.js | 295 | 已审查 |
| js/ai.js | 1596 | 已审查 |
| js/ui.js | 4024 | 已审查（逐行） |
| js/quiz.js | 1453 | 已审查 |
| js/runes.js | 10 | 已审查 |
| css/game_v2.css | 1300 | 已审查（全量） |

---

## 本次审查发现的新问题

### 🔴 严重（1 项）

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| N1 | **canPlay 中存在重复的条件检查死代码** — S20 影子束缚检查了两次（line 2654-2656 和 line 2662-2664），S30 短路开关也检查了两次（line 2657-2659 和 line 2666-2668）。第二次检查是死代码，因为第一次检查已提前 return。 | `engine.js:2654-2668` | 删除 line 2661-2668 的重复代码块 |

### 🟡 中等（3 项）

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| N2 | **a11OnField 上缺少可选链保护** — engine.js:301 使用 `a11OnField.card?.id` 正确使用了可选链，但 line 303-309 的 `a11OnField.card.effect` 没有 `?.`。若 `.find()` 返回的对象中 `card` 为 undefined（虽然同名限1规则下不太可能），line 303 会抛 TypeError。 | `engine.js:303-309` | 统一使用 `a11OnField.card?.effect?.applyPerTurn` |
| N3 | **renderPlayZones 中残留 debug console.log** — `console.log` 输出 `selfZone`/`playZoneSelf`/`playZoneAi` 信息，包含 DOM 元素引用。每次刷新手牌渲染都会触发，日志量极大。 | `ui.js:1894` | 删除或改为 `console.debug`，或在生产构建中移除 |
| N4 | **_escapeHtml 性能问题** — 每次调用都创建临时 `<div>` DOM 元素（line 3682: `document.createElement('div')`），renderHand 中每张卡调用多次，高频率渲染可能产生性能开销。 | `ui.js:3677-3682` | 改用正则替换：`str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))` |

### 🟢 轻微（3 项）

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| N5 | **color-mix CSS 兼容性** — `_injectStartStyles` 中使用了 `color-mix(in srgb, ...)` 函数（line 206-207），该函数 Baseline 2024 新增，全球支持率约 88%，在旧浏览器（Safari < 16.4）上不生效。 | `ui.js:206-207` | 添加 fallback 硬编码颜色值 |
| N6 | **横屏断点过于严格** — `@media (orientation: landscape) and (max-height: 500px)` 仅覆盖高度 500px 以下的情况，部分平板横屏（如 iPad 竖屏 768px 宽）不在覆盖范围。 | `css/game_v2.css:776` | 将 max-height 提升到 600px 或添加更多断点 |
| N7 | **错误处理不对称** — 只有 `_handleAttack`（engine.js:1028-1033）有 try-catch，其他处理器（`_handleSupport`/`_handleDomain`/`_handleSummon`/`_handlePhase`）没有。若非攻击类卡牌处理出错，将导致未捕获异常并中断游戏。 | `engine.js:1028-1047` | 为所有 handler 添加一致的 try-catch 保护 |

---

## 上次问题跟踪（2026-07-02 报告 N1-N6）

> 共 6 项。本次逐项复核。

| 上次# | 严重度 | 状态 | 说明 |
|:---:|:---:|:---:|------|
| N1 | 🔴 | ✅ 已修复 | A16 effect 深拷贝 — engine.js:2342 已使用 `Object.assign({}, ...)` |
| N2 | 🔴 | ✅ 已修复 | E22 遗留 `summon.maxHp \|\| summon.maxHp` — ui.js:2213 已改为 `summon.maxHp \|\| 300` |
| N3 | 🟡 | ✅ 已修复 | E19 XSS 卡组名转义 — ui.js:70-71 已使用 `_escapeHtml(n)` |
| N4 | 🟡 | ✅ 已修复 | S07 `viewedOpponentHand` 标记 — engine.js:2157 已设置，通用块 line 1937 也已设置 |
| N5 | 🟡 | ✅ 已修复 | E17 `canPlayReason` 副作用 — engine.js:2844 已改用 `canPlayQuery` |
| N6 | 🟢 | ⚠️ 未变 | S15 偏振过滤语义偏差 — 描述"只能出一种类型的卡" vs 实际"只能出同一种类型的卡"，微差存在但影响极小 |

## 历史问题跟踪（2026-07-01 报告 68 项中的关键残留）

### 🔴 严重项追踪

| 上次# | 原描述 | 最新状态 | 验证依据 |
|:---:|------|:---:|------|
| E1-E16 | 双重调用/副作用/数据污染 | ✅ 全部已修复 | 逐行验证代码改动 |
| E17 | canPlay 副作用 | ✅ 已修复 | getPlayableCards 现使用 canPlayQuery |
| E18 | canPlayQuery 条件完整 | ✅ 已修复 | canPlayQuery 包含所有检查 |
| E19 | XSS 卡组名转义 | ✅ 已修复 | _updateDeckSelect 已使用 _escapeHtml |
| E20 | CSS 选择器 .card → .card-v3 | ✅ 已修复 | 选择器已更新 |
| E21 | 召唤物高亮选择器 | ✅ 已修复 | 选择器已从 #opp-field → #opp-summons |
| E22 | `summon.maxHp \|\| summon.maxHp` | ✅ 已修复 | 已改为 `summon.maxHp \|\| 300` |
| E23 | --dm-bg CSS 变量 | ✅ 已修复 | .card-v3.domain-* 已定义 --dm-bg |

### 🟡 中等项 — 仍遗留（9 项）

| 上次# | 问题 | 状态 |
|:---:|------|:---:|
| M9 | S08 extraCost 覆盖语义 | ❌ 未修复 — `Math.max` 语义仍为"覆盖"非"取大值" |
| M11 | A11 啸叫启动时引爆移除 A11 vs 出牌时引爆不移除 | ❌ 未修复 — 代码中仍存在行为不一致，注释称"同名限1规则下不会触发"但未经实测 |
| M13 | 镜面迷宫概率索引方向 | ❌ 未修复 — 需实测验证 |
| M14 | S17→A16 combo 冗余 | ❌ 未修复 |
| M15 | S07→A14 / C10→A14 语义不明 | ❌ 未修复 |
| M16 | A25→A26 msg 表述误导 | ❌ 未修复 |
| M17 | S01→A05 perHeight 语义模糊 | ❌ 未修复 |
| M19 | combo_table.js 注释 effect.type 数量错误(说17种实为更多) | ❌ 未修复 |
| M20-M23 | AI 代码质量问题 | ❌ 未修复 |

### 🟢 轻微项 — 仍遗留（18 项）

| 上次# | 问题 | 状态 |
|:---:|------|:---:|
| L1 | A54 爆燃注释"默认48"与实际50不符 | ❌ 未修复 |
| L3 | getCardById O(n) 未缓存 | ❌ 未修复 |
| L4 | viewHand 取手牌末尾非随机 | ❌ 未修复 |
| L5 | maxHp 默认值不一致(200 vs 300) | ❌ 未修复 |
| L6 | 多处 null 安全检查缺失 | ❌ 未修复 |
| L8-L9 | 题库答案争议(Q_S_20, Q_S_29) | ❌ 未修复 |
| L10 | ai.js sort(()=>Math.random()-0.5) 非均匀洗牌 | ❌ 未修复 |
| L11 | ui.js console.log 残留(renderPlayZones) | → 见本次 N3 |
| L12 | gameOver 检查不一致(.gameOver vs .isGameOver()) | ❌ 未修复 |
| L13 | _escapeHtml 高频创建临时 DOM | → 见本次 N4 |
| L14-L20 | 卡组下拉/变量/类名/可访问性等 | ❌ 未修复 |

---

## 🔍 AI_CONTEXT.md 铁律合规检查

| 铁律 | 状态 | 说明 |
|------|:----:|------|
| cards.js 为唯一权威源 | ✅ | 109 张卡数据统一来源 |
| effect 属性名直接使用 cards.js 字段名 | ✅ | 引擎内部的 `buffDmg`/`dmgBonus` 等来自 fieldSupports 内部状态，边界清晰 |
| approved_cards.json 唯一插图映射 | ✅ | 109 卡→109 文件 |
| serve.cjs 启动服务 | ✅ | 存在且格式正确 |
| git tag 标记版本 | ❌ | 仓库仍零标签 |
| 收工 git add/commit/push | ✅ | 持续提交 |
| 先 Mock 后游戏 | ⚠️ | 皮肤系统未经独立模板验证 |
| 改引擎跑全量 | ✅ | 铁律#12 要求已落实 |

---

## 📊 问题统计总览

| 严重度 | 上次新发现 | 本次已修复 | 仍遗留 | 本次新发现 | 当前合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 2 | 2 (100%) | 0 | 1 | 1 |
| 🟡 中等 | 3 | 3 (100%) | 9 (历史) | 3 | 12 |
| 🟢 轻微 | 1 | 0 | 18 (历史) | 3 | 21 |
| **合计** | **6** | **5 (83%)** | **27** | **7** | **34** |

---

## 🎯 本次优先修复建议 (Top 5)

1. **N1 — canPlay 重复条件检查** — 删除 engine.js:2661-2668 的死代码块，消除混淆
2. **N2 — a11OnField 可选链不一致** — 统一使用 `?.` 防止潜在的 TypeError
3. **N3 — renderPlayZones debug console.log** — 删除高频日志，减少运行时噪音
4. **M11 — A11 啸叫引爆逻辑不一致** — 统一出牌时和回合开始时的行为（是否移除 A11）
5. **N4 — _escapeHtml 性能改进** — 用正则替换替代 DOM 创建，提升高频渲染效率

---

> 📝 报告生成时间：2026-07-02 23:30 GMT+8 | 审查方式：逐行审查全部 7 个 JS + 1 个 CSS 文件 + 逐项追踪 74 个历史问题
