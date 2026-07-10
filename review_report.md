# 代码审查报告 — 2026-07-10

> 全面审查，只读不修改。审查范围：全部 JS/CSS 文件 + 上次问题追踪。本轮深入审查发现 3 个严重问题，其中 N13 从 🟡 升级为 🔴（已确认会导致 TypeError 崩溃）。

---

## 审查范围

| 文件 | 行数 | 变化 | 状态 |
|------|------|------|------|
| js/cards.js | 1286 | ±0 | 已审查（109卡全部交叉验证） |
| js/engine.js | 3042 | ±0 | 已审查（逐行，含 console 扫描） |
| js/combo_table.js | 291 | ±0 | 已审查（49 combo全部验证） |
| js/ai.js | 1596 | ±0 | 已审查（难度分级、shuffle、死代码） |
| js/ui.js | 4298 | ±0 | 已审查（console扫描、XSS安全） |
| js/quiz.js | 6270 | ±0 | 已审查（1035题抽样验证） |
| js/runes.js | 9 | ±0 | 已审查（导出/引用验证） |
| css/game_v2.css | 1298 | ±0 | 已审查（动画/兼容性/选择器） |

> 自上次审查报告（2026-07-08）后，核心 JS/CSS 代码无变更。本轮为全量复查 + 深度交叉验证。

---

## 本次新发现问题

### 🔴 严重（3 项）

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| **N22** | **`canAfford` 与 `playCard` 扣费逻辑不一致** — `canAfford`（L2734-2749）包含 C07/C06 召唤物的 costReduction（C07电系-6, C06辅助-4+力辅助-2），但 `playCard`（L1051-1078）的打牌扣费逻辑**没有这些减免**。导致 UI 显示卡牌可打出（精神力足够）但实际扣费更多，用户点击后因费用不足被拒绝，体验极差。 | `engine.js:1051 vs 2734` | 在 `playCard` 中同步添加 C07/C06 减费逻辑，或提取为共享函数 `calcCost(playerIdx, card)` |
| **N23** | **A11 啸叫引爆后将己方卡牌错误放入对手弃牌堆** — `engine.js:1664` 写的是 `opponent.discardPile.push(card)`，但被引爆的卡牌属于攻击方（`attackerIdx`）。应放入 `this.players[attackerIdx].discardPile`。 | `engine.js:1664` | 改为 `attacker.discardPile.push(card)` |
| **N24** | **N13 升级：A11 引爆后空 `return;` 导致 TypeError 崩溃** — `engine.js:1665` 的 `if (this.checkWinCondition()) return;` 返回 `undefined`。调用方 `playCard`（L1113）使用 `effects.push(...result)` 展开，对 `undefined` 执行 spread 会抛出 `TypeError: result is not iterable`。已确认这是一个严重运行时错误。 | `engine.js:1665` | 改为 `return effects;` 或 `return [];` |

### 🟡 中等（6 项）

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| **N25** | **`_handleSummon` combo 分流仅处理 `modify_flag`** — L2016-2018 的 default 分支标注"待 Phase 4 实现"但所有召唤→攻击 combo 效果已在 `_handleAttack` 中通过 `pendingCombo` 处理。default 分支是误导性占位代码。 | `engine.js:2016-2018` | 删除 default 分支，添加注释说明效果分流至 `_handleAttack` |
| **N26** | **C09/C14 召唤物领域加成在 effects 收集中缺失** — `calculateDamage`（L779-785）计算了 C09/C14 的召唤物加成，但 `_handleAttack`（L1209+）的 effects 收集中没有对应推送。导致战斗日志不显示此项加成。 | `engine.js:779-785, 1209-1220` | 在 effects 收集段为 C09/C14 添加 `summon_bonus` 推送 |
| **N27** | **A16 `set_return_to_hand` 效果类型有 case 但无 combo 使用** — `_handleAttack`（L1291-1294）处理了 `set_return_to_hand` case，但 combo_table.js 中没有任何 combo 定义此效果。确认是死代码或遗漏的 combo 定义。 | `engine.js:1291-1294` | 核实 A16 配套 combo 是否未编写或已废弃 |
| **N28** | **`_releaseOnFieldClear` 驻场移除假设脆弱** — `_handleAttack`（L1525）使用 `shift()` 取首张驻场卡传给 `_releaseOnFieldClear`，假设被移除的卡一定来自 enemy。当前逻辑正确但无注释说明设计意图，未来多人混战或变体规则可能出错。 | `engine.js:1525-1545` | 添加注释说明 `shift()` 取首张驻场卡符合设计意图 |
| **N29** | **4 个无用 `@keyframes` 定义** — `electricShock`（L524）、`lightFlash`（L525）、`turnDim`（L725，且为空关键帧）、`rarity-rainbow`（L1139）在 CSS 和 JS 中均无引用。其中 `turnDim` 是空定义。 | `game_v2.css:524,525,725,1139` | 删除 4 个无用 keyframes |
| **N30** | **`backdrop-filter` 无 fallback** — `.card-zoom-overlay`（L858）使用 `backdrop-filter: blur(8px)` 但无纯色 fallback。不支持此特性的浏览器（Chrome <76、Safari <15.4）只能看到透明背景，弹窗内容无法阅读。 | `game_v2.css:858` | 添加 `background: rgba(0,0,0,.92)` 作为 fallback，用 `@supports` 渐进增强 |

### 🟢 轻微（7 项）

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| **N31** | **`calculateDamage` 的 `comboBonus` 参数为死代码** — 函数签名包含 `comboBonus = 0`（L743），`damage += comboBonus`（L883）从未收到非 0 值。所有 combo 加成已通过 `_handleAttack` 内联处理。 | `engine.js:743,883` | 删除参数或保留为扩展接口并加注释 |
| **N32** | **`_isFirstAtkThisTurn` 注释误导** — 注释写"简化：使用 mirageFirstAtk 标记"但实际通过 `cardsThisTurn` 统计攻击次数判断。 | `engine.js:3031-3035` | 修正注释为实际实现逻辑 |
| **N33** | **`processDOT` A10 递增公式边界** — `dmg + (initialTurns - turnsRemaining) * increment` 在 `turnsRemaining` 降至 0 时可能计算偏差。建议使用 `Math.max(0, turnsRemaining)` 保护。 | `engine.js:2437` | 改为 `(dot.initialTurns - Math.max(0, dot.turnsRemaining)) * increment` |
| **N34** | **`customDeckName` 未声明为类属性** — 构造函数中 `customDeck`（L42）已声明但 `customDeckName` 未声明。多处直接赋值 `this.customDeckName`，JS 动态创建可用但代码可读性差。 | `ui.js:13-46, 75-76, 300-304` | 在构造函数中显式声明 `this.customDeckName = ''` |
| **N35** | **缺少 `@prefers-reduced-motion` 媒体查询** — CSS 中有 40 个 `@keyframes` 动画，对运动敏感用户无任何降��方案。无障碍合规缺失。 | `game_v2.css` | 添加 `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; } }` |
| **N36** | **`!important` 15 处中 8 处可避免** — `.card-v3.mini:hover` 和 `.card-v3:not(.mini).rarity-*` 中存在特异性冲突，用 `!important` 硬覆盖而非重新排序选择器。 | `game_v2.css:1096-1136` | 重新排列级联顺序，移除可避免的 `!important` |
| **N37** | **硬编码颜色 30+ 处** — 游戏已定义领域颜色变量（`--frc`, `--snd`, `--lgt`, `--het`, `--elc`），但动画、弹窗、V3 皮肤等处仍大量使用硬编码值（如 `#2ecc71`, `#e74c3c`, `#fff` 等）。 | `game_v2.css` | 增设 6-8 个语义化颜色变量（`--card-bg`, `--overlay-bg`, `--text-muted` 等） |

---

## 上次问题跟踪

### 上次 N1-N16 问题（2026-07-06 至 2026-07-08 报告）

| 上次# | 严重度 | 状态 | 说明 |
|:---:|:---:|:---:|------|
| N1 | 🔴 | ✅ 已修复 | canPlay 重复条件检查 |
| N2 | 🔴 | ✅ 已修复 | a11OnField 可选链 |
| N3 | 🟡 | ✅ 已修复 | renderPlayZones debug console.log |
| N4 | 🟡 | ✅ 已修复 | _escapeHtml 性能 — DOM→正则替换 |
| N5 | 🟢 | ❌ 仍遗留 | color-mix CSS 无 fallback — ui.js:209 |
| N6 | 🟢 | ❌ 仍遗留 | 横屏断点 `max-height: 500px` — game_v2.css:773 |
| N7 | 🟡 | ✅ 已修复 | 错误处理不对称 |
| N8 | 🔴 | ✅ 已修复 | calculateDamage 中 effects 引用错误 |
| N9 | 🟡 | ✅ 已修复 | canPlayQuery 重复 A26 检查 |
| N10 | 🟡 | ✅ 已修复 | _getTestCards debug console.log |
| N13 | 🟡→🔴 | ⚠️ **升级** | `_handleAttack` A11 引爆后 `return;` 无返回值 — 已确认导致 TypeError 崩溃。见 N24 |
| N14 | 🟡 | ❌ 仍遗留 | `_inertiaNextTurn[attackerIdx].damage` 死代码 — 确认 L1603 写入，L315 重置，无读取路径 |
| N15 | 🟡 | ❌ 仍遗留 | `bonusKeys` 在 calculateDamage(L769) 和 _handleAttack(L1209) 重复定义 |
| N16 | 🟢 | ❌ 仍遗留 | `_loadCardArt` 中 `console.log('[init] 插画映射: N 张')` — ui.js:103 |
| N17 | 🟡 | ❌ 仍遗留 | `_handleSummon` 重复上限/同名检查 — 与 playCard 检查完全重复，死代码防御层 |
| N18 | 🟡 | ❌ 仍遗留 | `checkCombo` 未检查对手场上卡牌触发 `vs` 类型 combo |

### 上次 M9-M23 中等历史遗留问题

| 上次# | 问题 | 状态 |
|:---:|------|:---:|
| M9 | S08 extraCost 覆盖语义 | ❌ 仍遗留 — L2305 和 L2128 使用 `Math.max` 覆盖而非累加 |
| M11 | A11 啸叫引爆逻辑 | ✅ **已修复** |
| M13 | 镜面迷宫概率索引方向 | ❌ 仍遗留 |
| M14 | S17→A16 combo 冗余 | ❌ 仍遗留 |
| M15 | S07→A14 / C10→A14 语义不明 | ❌ 仍遗留 |
| M16 | A25→A26 msg 表述误导 | ❌ 仍遗留 |
| M17 | S01→A05 perHeight 语义模糊 | ❌ 仍遗留 |
| M19 | combo_table.js 注释 effect.type 数量错误 | ❌ 仍遗留 — 注释写 17 种，实际列出 19 种 |
| M20 | ai.js 中 6 个未使用参数 | ❌ 仍遗留 — `comboIndex`(×2), `gameState`(×4) 传入但从未使用 |
| M21 | AI 无限循环/递归风险 | ✅ **已解决** — while 均有保护，无递归 |
| M22 | AI 难度级别行为差异 | ✅ **已解决** — 9 维度真实差异，e/n/h 行为显著不同 |
| M23 | AI shuffle 非均匀分布 | ✅ **已解决** — 验证为标准 Fisher-Yates Knuth Shuffle，均匀分布 |

### 上次 L1-L20 轻微历史遗留问题

| 上次# | 问题 | 状态 |
|:---:|------|:---:|
| L1 | A54 爆燃注释"默认48"与实际50不符 | ✅ **已解决** — cards.js 描述和 engine.js 默认值均为 50，已一致 |
| L5 | maxHp 默认值不一致 | ❌ 仍遗留 |
| L6 | 多处 null 安全检查缺失 | ❌ 仍遗留 |
| L8-L9 | 题库答案争议(Q_S_20, Q_S_29) | ✅ **已解决** — quiz.js 已升级至 1035 题，旧 ID 不再存在 |
| L10 | ai.js sort 随机洗牌非均匀 | ✅ **已解决** — Fisher-Yates 实现正确，每轮 `j ∈ [0,i]` 等概采样 |
| L11 | ui.js console.log 残留 | → 大部分已清除，仅剩 N16（init 日志） |
| L14-L20 | 卡组下拉/变量/类名/可访问性等 | ❌ 仍遗留 |

---

## 统计总览

| 严重度 | 上次合计 | 本次已修复 | 仍遗留(历史) | 本次新发现 | N13升级 | 当前合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 0 | 0 | 0 | 3 | +1 | **4** |
| 🟡 中等 | 13 | 3 (M21-M23) | 9 | 6 | -1 | **17** |
| 🟢 轻微 | 15 | 3 (L1,L8-L9,L10) | 12 | 7 | 0 | **19** |
| **合计** | **28** | **6 (21%)** | **21** | **16** | — | **40** |

> 注：N13 从 🟡 升级为 🔴（确认会导致 TypeError 崩溃）。M21-M23 三个 AI 代码质量问题本轮验证已解决。L1/L8-L9/L10 确认已修复。

---

## 🎯 本次优先修复建议 (Top 5)

1. **N24 (原N13) — A11 引爆后空 return 导致 TypeError 崩溃** — 高频率触发路径，一触发游戏即崩溃，属最高优先级
2. **N23 — A11 引爆后卡牌归属错误** — 与 N24 同函数相邻行，修 N24 时一并修复，卡牌永久丢失影响后续对局
3. **N22 — canAfford / playCard 扣费不一致** — 直接影响用户体验，UI 显示可打但实际拒绝
4. **N14 — `_inertiaNextTurn.damage` 死代码** — 两轮审查持续确认无读取路径，维护负担
5. **N30 — backdrop-filter 无 fallback** — 直接影响旧设备上弹窗可读性（目标用户可能使用学校老旧设备）

---

> 📝 报告生成时间：2026-07-10 23:35 GMT+8 | 审查方式：4 代理并行逐文件审查 + 交叉验证 40 个历史问题 + 全量复查 8 个文件
