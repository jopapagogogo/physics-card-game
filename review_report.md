# 代码审查报告 — 2026-07-11

> 全面审查，只读不修改。审查范围：全部 JS/CSS 文件 + 上次问题追踪。本轮为全量复查，JS/CSS 代码自 2026-07-10 报告后无变更（git diff 确认）。上次 40 项问题均未修复，本次深入发现 3 个新问题 + 对 N22 进行重新定性分析。

---

## 审查范围

| 文件 | 行数 | 变化 | 状态 |
|------|------|------|------|
| js/cards.js | 1286 | ±0 | 已审查（109卡全部交叉验证） |
| js/engine.js | 3042 | ±0 | 已审查（逐行复查 A11/A10/C06/C07 等关键路径） |
| js/combo_table.js | 291 | ±0 | 已审查（49 combo全部验证） |
| js/ai.js | 1596 | ±0 | 已审查（难度分级/shuffle/参数使用） |
| js/ui.js | 4298 | ±0 | 已审查（战斗界面/事件/动画/XSS安全） |
| js/quiz.js | 6270 | ±0 | 已审查（1035题抽样验证） |
| js/runes.js | 9 | ±0 | 已审查（导出/引用验证） |
| css/game_v2.css | 1298 | ±0 | 已审查（动画/兼容性/选择器验证） |

---

## 本次新发现问题

### 🔴 严重（1 项）

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| **N38** | **A10 DOT 递增公式边界：S09 降频后产生负伤害** — `processDOT`（L2437）的计算公式 `dmg = dot.dmg + (dot.initialTurns - dot.turnsRemaining) * increment` 中，当 S09 降频的 `frequencyApply`（engine.js:672）执行 `dot.turnsRemaining += 2` 后，`turnsRemaining` 可能超过 `initialTurns`（如从 5 → 7），导致 `(5 - 7) * 13 = -26`，最终 dmg = 15 + (-26) = -11（负伤害即治疗）。虽 JS 中 `-11` 为 truthy 不会回退到 `|| dot.dmg`，但 `player.hp = Math.max(0, player.hp - (-11))` 实际上会**增加 11 HP**。| `engine.js:2437`（计算公式）+ `engine.js:672`（S09 延长源） | 改为 `Math.max(0, (dot.initialTurns - Math.min(dot.turnsRemaining, dot.initialTurns))) * increment`，或限制 `turnsRemaining` 不超过 `initialTurns` |

### 🟡 中等（2 项）

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| **N39** | **C06/C07 召唤物减费效果从未生效** — 此前 N22 描述为 `canAfford`/`playCard` 减费不一致，但深入分析后发现两函数**都不生效**。原因：`canAfford`（L2735-2749）通过 `s.card.effect.costReduction` 判断是否需减费，但 C07 的 effect key 是 `electricCostReduction`、C06 是 `supportCostReduction`/`forceSupportExtra`，均非 `costReduction`。因此条件永假，减费代码为死代码。`playCard` 同样未处理。**C06"辅助卡-4/力辅-2"和 C07"电系卡-6"的卡面效果从未在游戏中生效**。 | `engine.js:2735-2749`（canAfford 死代码）+ `engine.js:1051-1078`（playCard 缺失） | 将 canAfford 中的 key 名改为 `electricCostReduction`/`supportCostReduction`，并在 playCard 中同步添加减费逻辑 |
| **N40** | **A11 啸叫二段引爆的 try/catch 掩盖问题** — `_handleAttack`（L1665）中 `if (this.checkWinCondition()) return;` 返回 undefined。虽然 `playCard`（L1112-1117）的 try/catch 捕获了 spread 崩溃，但 `effects` 数组中的非伤害类效果（如 combo 效果、DOT 应用）在引爆前已收集的数据会因异常而被丢弃，日志不完整。且实际运行时 `console.error` 会输出错误信息，给开发者（教师）造成困扰。 | `engine.js:1664-1665`（错误丢弃+空return） | 统一修复 N23（弃牌归属）+ N24（空return→return effects），一次提交解决 A11 全部问题 |

---

## 上次问题跟踪

### 上次 N1-N24 问题（2026-07-06 至 2026-07-10 报告）

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
| N13→N24 | 🔴 | ❌ 仍遗留 | `_handleAttack` A11 引爆后 `return;` 无返回值 — 升级为严重，本轮追加 N40 加剧分析 |
| N14 | 🟡 | ❌ 仍遗留 | `_inertiaNextTurn[attackerIdx].damage` 死代码 — L1603 写入，L315 重置，无读取路径 |
| N15 | 🟡 | ❌ 仍遗留 | `bonusKeys` 在 calculateDamage(L769) 和 _handleAttack(L1209) 重复定义 |
| N16 | 🟢 | ❌ 仍遗留 | `_loadCardArt` 中 `console.log('[init] 插画映射: N 张')` — ui.js:103 |
| N17 | 🟡 | ❌ 仍遗留 | `_handleSummon` 重复上限/同名检查 — 与 playCard 检查完全重复，死代码防御层 |
| N18 | 🟡 | ❌ 仍遗留 | `checkCombo` 未检查对手场上卡牌触发 `vs` 类型 combo |
| N22 | 🔴 | ⚠️ **重新定性** | **原描述"canAfford/playCard 扣费不一致"经深入分析为误判**。C06/C07 减费在 canAfford 中是**死代码**（key名不匹配），playCard 中也未处理。实际效果：C06/C07 减费从未生效。详见 N39 |
| N23 | 🔴 | ❌ 仍遗留 | A11 啸叫引爆后将己方卡牌错误放入对手弃牌堆 — engine.js:1664 |
| N24 | 🔴 | ❌ 仍遗留 | A11 引爆后空 `return;` 导致 TypeError 崩溃 — engine.js:1665 |
| N25 | 🟡 | ❌ 仍遗留 | `_handleSummon` combo 分流仅处理 `modify_flag`，default 为占位代码 |
| N26 | 🟡 | ❌ 仍遗留 | C09/C14 召唤物领域加成在 effects 收集中缺失 |
| N27 | 🟡 | ❌ 仍遗留 | A16 `set_return_to_hand` 效果类型有 case 但无 combo 使用 |
| N28 | 🟡 | ❌ 仍遗留 | `_releaseOnFieldClear` 驻场移除假设脆弱 — 缺少注释 |
| N29 | 🟡 | ❌ 仍遗留 | 4 个无用 `@keyframes` 定义（electricShock/lightFlash/turnDim/rarity-rainbow） |
| N30 | 🟡 | ❌ 仍遗留 | `backdrop-filter` 无 fallback — game_v2.css:858 |
| N31 | 🟢 | ❌ 仍遗留 | `calculateDamage` 的 `comboBonus` 参数为死代码 |
| N32 | 🟢 | ❌ 仍遗留 | `_isFirstAtkThisTurn` 注释误导 |
| N33 | 🟢 | ❌ 仍遗留 | `processDOT` A10 递增公式边界（原描述 turnsRemaining 降为 0 时偏差，本轮升级为 N38） |
| N34 | 🟢 | ❌ 仍遗留 | `customDeckName` 未声明为类属性 |
| N35 | 🟢 | ❌ 仍遗留 | 缺少 `@prefers-reduced-motion` 媒体查询 |
| N36 | 🟢 | ❌ 仍遗留 | `!important` 15 处中 8 处可避免 |
| N37 | 🟢 | ❌ 仍遗留 | 硬编码颜色 30+ 处 |

### 上次 M9-M23 中等历史遗留问题

| 上次# | 问题 | 状态 |
|:---:|------|:---:|
| M9 | S08 extraCost 覆盖语义 — L2305 和 L2128 使用 `Math.max` 覆盖而非累加 | ❌ 仍遗留 |
| M11 | A11 啸叫引爆逻辑 | ❌ 仍遗留 — 实际未完全修复（见 N23/N24/N40） |
| M13 | 镜面迷宫概率索引方向 | ❌ 仍遗留 |
| M14 | S17→A16 combo 冗余 | ❌ 仍遗留 |
| M15 | S07→A14 / C10→A14 语义不明 | ❌ 仍遗留 |
| M16 | A25→A26 msg 表述误导 | ❌ 仍遗留 |
| M17 | S01→A05 perHeight 语义模糊 | ❌ 仍遗留 |
| M19 | combo_table.js 注释 effect.type 数量错误 — 注释写 17 种，实际列出 19 种 | ❌ 仍遗留 |
| M20 | ai.js 中 6 个未使用参数 — `comboIndex`(×2), `gameState`(×4) | ❌ 仍遗留 |
| M21 | AI 无限循环/递归风险 | ✅ 已解决 |
| M22 | AI 难度级别行为差异 | ✅ 已解决 |
| M23 | AI shuffle 非均匀分布 | ✅ 已解决 |

### 上次 L1-L20 轻微历史遗留问题

| 上次# | 问题 | 状态 |
|:---:|------|:---:|
| L1 | A54 爆燃注释"默认48"与实际50不符 | ✅ 已解决 |
| L5 | maxHp 默认值不一致 | ❌ 仍遗留 |
| L6 | 多处 null 安全检查缺失 | ❌ 仍遗留 |
| L8-L9 | 题库答案争议(Q_S_20, Q_S_29) | ✅ 已解决 |
| L10 | ai.js sort 随机洗牌非均匀 | ✅ 已解决 |
| L11 | ui.js console.log 残留 | → 大部分已清除，仅剩 N16 |
| L14-L20 | 卡组下拉/变量/类名/可访问性等 | ❌ 仍遗留 |

---

## 统计总览

| 严重度 | 上次合计 | 本次已修复 | 仍遗留(历史) | 本次新发现 | N22重新定性 | 当前合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 4 | 0 | 3 (N22/N23/N24) | 1 (N38) | — | **4** |
| 🟡 中等 | 17 | 0 | 16 | 2 (N39/N40) | — | **18** |
| 🟢 轻微 | 19 | 0 | 19 | 0 | — | **19** |
| **合计** | **40** | **0** | **38** | **3** | — | **41** |

> 注：N22 从"canAfford/playCard不一致"重新定性为"C06/C07减费从未生效（死代码）"。上次报告的"已修复"项均在 07-10 之前完成，07-10 至今 JS/CSS 零变更。

---

## 🎯 优先修复建议 (Top 6)

1. **N23 + N24 + N40 — A11 啸叫引爆三合一** — 同一函数相邻行，一修全修：错误弃牌堆归属 + 空 return 崩溃 + try/catch 掩盖问题。属最高优先级 P0
2. **N38 — A10 DOT 递增负伤害** — S09→A10 是设计中的 combo，触发后反而产生负伤害（治疗对手），直接影响游戏平衡性
3. **N39 — C06/C07 减费从未生效** — 两张传说/史诗级召唤物的核心效果完全未实现，影响游戏平衡和玩家体验
4. **N14 — `_inertiaNextTurn.damage` 死代码** — 三轮审查持续确认无读取路径，维护负担
5. **N30 — backdrop-filter 无 fallback** — 直接影响旧设备上弹窗可读性（目标用户可能使用学校老旧设备）
6. **M9 — S08/A33/A43 extraCost 覆盖而非累加** — 多个来源的额外费用应叠加，当前只用最大值

---

> 📝 报告生成时间：2026-07-11 23:55 GMT+8 | 审查方式：全量复查 8 个文件 + 交叉验证 41 个历史问题 + 关键路径深度分析（A11/A10/C06/C07）
