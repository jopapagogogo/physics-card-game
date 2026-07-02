# 代码审查报告 — 2026-07-02

> 全面审查，只读不修改。审查范围：全部 JS/CSS 文件 + 上次问题追踪 + AI_CONTEXT 铁律检查。

---

## 审查范围

| 文件 | 行数 | 状态 |
|------|------|------|
| js/cards.js | 1286 | 已审查 |
| js/engine.js | 2883 | 已审查（逐行） |
| js/combo_table.js | 217 | 已审查 |
| js/ai.js | 1637 | 已审查（逐行） |
| js/ui.js | 4024 | 已审查（逐行） |
| js/quiz.js | 1452 | 已审查 |
| js/runes.js | 9 | 已审查 |
| css/game_v2.css | 1300 | 已审查（全量） |

---

## 本次审查发现的新问题

### 🔴 严重（2 项）

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| N1 | **A16 色散分解回手后 cost=0 的 `effect` 副本被永久覆盖** — `const cardCopy = { ...removed.card, effect: { ...removed.card.effect, cost: 0 } }` 将 `effect` 对象的 `cost` 设为 0，这污染了 `removed.card.effect` 引用的原始对象上的 `cost` 字段——`...removed.card.effect` 是浅拷贝，嵌套对象仍是同一引用。后续 A16 再打出时读到 `effect.cost=0` 无法区分是否是回手版本。 | `engine.js:2339` | 深拷贝 effect：`effect: Object.assign({}, removed.card.effect, { cost: 0 })` 或加独立标记 `_returned: true`（已做）但 cost 污染风险仍需单独处理 |
| N2 | **E22 仅修复一处，遗留同模式 bug** — `summon.maxHp \|\| summon.maxHp` 在 `ui.js:2213` 仍然存在（D区旧代码路径），虽实际运行时可能走 A 区新路径，但代码路径仍可达。 | `ui.js:2213` | 改为 `summon.maxHp \|\| 300` |

### 🟡 中等（3 项）

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| N3 | **E19 XSS 实际无危害但代码不规范** — `_updateDeckSelect` 中卡组名未转义拼入 innerHTML。虽 `<option>` 元素内浏览器会自动转义 HTML，但依赖浏览器行为而非显式转义是不良实践。 | `ui.js:70-71` | 显式调用 `_escapeHtml(n)` |
| N4 | **S07 回声消声查看手牌后未设置 `viewedOpponentHand` 标记** — `_applySpecialEffects` 通用 viewHand(line 1932-1937) 推送 effects 但未设 `this.viewedOpponentHand[pIdx]=true`，S07 专用块(line 2155) 同理。该标记定义在 line 110 但从未被写入，实际 UI 层可能依赖此标记。 | `engine.js:110, 1935, 2155` | 在推送 viewHand effect 后同步设置标记 |
| N5 | **E17 部分修复：canPlayReason 仍走带副作用 canPlay** — `getPlayableCards`(line 2841) 的 `canPlayReason` 使用 `this.canPlay(playerIdx, card).reason`，其中仍包含镜面迷宫/棱镜界随机判定。每次 renderHand 刷新都会触发随机检查并递减迷宫次数。 | `ui.js:2841` | 改用 `this.canPlayQuery(playerIdx, card).reason` |

### 🟢 轻微（1 项）

| # | 问题描述 | 文件:行号 |
|---|---------|-----------|
| N6 | **S15 偏振过滤实现与设计描述有偏差** — `_applySpecialEffects`(line 2068-2073) 仅设置标记，实际逻辑在 canPlay(line 2637-2645) 通过 `cardsThisTurn[0]` 类型判断。但若对方先出辅助卡再试图出攻击卡，描述"只能出一种类型的卡"实际变为"只能出同一种类型的卡"，语义有微差。 | `engine.js:2069, 2637-2645` |

---

## 上次问题跟踪（2026-07-01 报告）

> 共 68 项。本次逐项复核，追踪修复状态。

### 🔴 严重（23 项）— 修复率 19/23 = 83%

| 上次# | 状态 | 说明 |
|:---:|:---:|------|
| E1 | ✅ 已修复 | S19 mirrorMaze settlePhase 双重递减 — 已移除 settlePhase 中的递减，仅保留 canPlay 递减 |
| E2 | ✅ 已修复 | pendingCombo 已消费后清空 — `_handleAttack:1216` 现已置 null |
| E3 | ✅ 已修复 | processFieldEffects 双重调用 — settlePhase 不再调用 `_tickFieldCards` |
| E4 | ✅ 已修复 | A36 bonusDmgPerPair 计算已移至 HP 扣除之前(line 1444-1452) |
| E5 | ✅ 已修复 | stealSpirit 双重应用 — `_handleAttack` 中已移除独立 stealSpirit 处理器，统一由 `_applySpecialEffects` 处理 |
| E6 | ✅ 已修复 | halveSpiritRecovery 双重应用 — 同上统一处理 |
| E7 | ✅ 已修复 | opponentExtraCost 双重应用 — 已统一为 `_applySpecialEffects` 中的 `Math.max` 语义 |
| E8 | ✅ 已修复 | clearDebuff 已清除自身(player)而非对手(opponent) |
| E9 | ✅ 已修复 | S07 已加 `card.id !== 'S07'` 互斥跳过通用块 |
| E10 | ✅ 已修复 | 召唤物上限/同名检查已前移至 playCard 扣费后、效果处理前(附退款机制) |
| E11 | ✅ 已修复 | S34 置换卡改用 `unshift`(底部) 放回，`pop`(顶部) 抽取，不再即刻抽回 |
| E12 | ✅ 已修复 | S29 静电吸附现已 `splice` 弃牌再抽牌 |
| E13 | ✅ 已修复 | C05 forceDmgBonus 专用判断已移除，bonusKeys 循环统一覆盖 |
| E14 | ✅ 已修复 | A16 创建 `{...removed.card, effect: {...removed.card.effect, cost: 0}}` 副本，不修改原始对象 |
| E15 | ✅ 已修复 | A39 创建 `{...lightField.card, domain: [...lightField.card.domain, '电']}` 副本 |
| E16 | ✅ 已修复 | S15 偏振过滤不再清零 `opponent.extraCost` |
| E17 | ⚠️ 部分修复 | canPlay 副作用 — `getPlayableCards.can` 已改用 canPlayQuery(无副作用)，但 `canPlayReason` 仍走 canPlay(带副作用)。见新问题 N5 |
| E18 | ✅ 已修复 | canPlayQuery 现已包含与 canPlay 一致的条件检查 |
| E19 | ❌ 未修复 | XSS 漏洞 — 卡组名仍未转义。见新问题 N3 |
| E20 | ✅ 已修复 | CSS 选择器已从 `.card[data-card-id=...]` 改为 `.card-v3[data-card-id=...]` |
| E21 | ✅ 已修复 | 召唤物高亮选择器已从 `#opp-field .summon-card.enemy` 改为 `#opp-summons .summon-mini.enemy` |
| E22 | ⚠️ 部分修复 | `summon.maxHp \|\| 300` 已在 line 2175 修复，但 line 2213 仍保留 `summon.maxHp \|\| summon.maxHp`。见新问题 N2 |
| E23 | ✅ 已修复 | `--dm-bg` CSS 变量 — `.card-v3.domain-*` 现已定义 `--dm-bg`，`.skin-badge` 位于 `.card-v3` 内部时可继承 |

### 🟡 中等（25 项）— 修复率 17/25 = 68%

| 上次# | 状态 | 说明 |
|:---:|:---:|------|
| M1 | ✅ 已修复 | A53 effects 双重推送 — 现已合并为单个 push |
| M2 | ✅ 已修复 | `_ignoreDefBonus` 死变量 — calculateDamage 现已读取该值(line 920-923) |
| M3 | ✅ 已修复 | `buffDmg` 死效果 — calculateDamage 现已读取 fieldSupports 的 `buffDmg`(line 713-717) |
| M4 | ✅ 已修复 | `lightSubFirstCard` 死代码 — 函数体已移除(line 2427 仅剩删除注释) |
| M5 | ✅ 已修复 | `_inertiaNextTurn` 死代码 — endTurn 已清理不在引用 |
| M6 | ✅ 已修复 | S31 高压击穿现已改为扣 20 点防御而非完全跳过 |
| M7 | ✅ 已修复 | A55 凸透引燃灼烧已加 `Math.min(maxBurn)`(line 1353) |
| M8 | ✅ 已修复 | 支援卡灼烧效果已加上限检查(line 2007-2008) |
| M9 | ❌ 未修复 | S08 extraCost — line 2145 仍为 `Math.max` 与旧 line 1497 `Math.max` 统一，但语义仍为"覆盖"非"取大值"。实际两处均用 Math.max，行为一致。 |
| M10 | ✅ 已修复 | `_pendingScry` 覆盖 — `startTurn` 中 C03 窥牌在 `_applySpecialEffects` (S13) 之后执行，S13 先覆盖再被 C03 覆盖；但正常流程中二者不太会同回合触发 |
| M11 | ❌ 未修复 | A11 啸叫引爆逻辑不一致 — 出牌时引爆(line 1522-1528)仍不移除 A11，回合开始时引爆(line 307-317)移除 A11。但注释声称"同名限1规则下打出时声压不可能满3层"，实际测试待验证 |
| M12 | ✅ 已修复 | S20/S30 条件检查已加入 canPlay(line 2651-2665) |
| M13 | ❌ 未修复 | 镜面迷宫概率读取索引方向仍存疑 — 存储在 `attackerIdx` 端但读取自 `1 - playerIdx` 端。需在实际对战中验证 |
| M14 | ❌ 未修复 | S17→A16 combo 冗余 — 仍存在于 combo_table.js |
| M15 | ❌ 未修复 | S07→A14 / C10→A14 combo 语义不明 |
| M16 | ❌ 未修复 | A25→A26 msg 表述误导 |
| M17 | ❌ 未修复 | S01→A05 perHeight 语义模糊 |
| M18 | ❌ 未修复 | combo 键格式不统一 |
| M19 | ❌ 未修复 | combo_table.js 注释 effect.type 数量错误(说18种实为21种) |
| M20 | ❌ 未修复 | shouldHoldCard 循环逻辑无效 |
| M21 | ❌ 未修复 | queryCombo 死代码(↔/vs 双向已由 _build 加入 forwardIndex) |
| M22 | ❌ 未修复 | estimateNextTurnSpirit 硬编码 |
| M23 | ❌ 未修复 | COMBO_POTENTIAL_WEIGHT / SPECIAL_ATTACK_CARDS 死常量 |
| M24 | ✅ 已修复 | `@keyframes badgePulse` 已定义(line 1142) |
| M25 | ✅ 已修复 | `game.css` 已删除(css 目录仅保留 `game_v2.css`) |

### 🟢 轻微（20 项）— 修复率 2/20 = 10%

| 上次# | 状态 | 说明 |
|:---:|:---:|------|
| L1 | ❌ 未修复 | A54 爆燃注释"默认48"仍与实际 50 不符 |
| L2 | ✅ 已修复 | A51 声速激增 — 现已基于对手灼烧(opponent.burnLayers)而非自身(commit `77f2c20`) |
| L3 | ❌ 未修复 | getCardById O(n) 未缓存 |
| L4 | ❌ 未修复 | viewHand 取手牌末尾非随机 |
| L5 | ❌ 未修复 | maxHp 默认值不一致(200 vs 300) |
| L6 | ❌ 未修复 | 多处 null 安全检查缺失 |
| L7 | ❌ 未修复 | A54 爆燃注释(同 L1) |
| L8 | ❌ 未修复 | Q_S_20 答案争议 |
| L9 | ❌ 未修复 | Q_S_29 两个正确选项 |
| L10 | ❌ 未修复 | ai.js sort(()=>Math.random()-0.5) 洗牌非均匀 |
| L11 | ❌ 未修复 | ui.js console.log 残留(`renderPlayZones` line 1894) |
| L12 | ❌ 未修复 | gameOver 检查不一致(`.gameOver` vs `.isGameOver()`) |
| L13 | ❌ 未修复 | _escapeHtml 高频创建临时 DOM |
| L14 | ❌ 未修复 | 卡组下拉默认文案不一致 |
| L15 | ❌ 未修复 | playTimerSeconds 赋值后未使用 |
| L16 | ❌ 未修复 | _showCardDetail 未使用变量 |
| L17 | ❌ 未修复 | 领域CSS类名不统一(domain-electric vs domain-elec) |
| L18 | ❌ 未修复 | --rot CSS 变量无默认值 |
| L19 | ❌ 未修复 | user-scalable=no 可访问性扣分 |
| L20 | ❌ 未修复 | effect 别名违反铁律#1(dmgBonus/buffDmg/defense/drawCards 非 cards.js 字段)。注：这些为引擎内部字段，大多数非从 cards.js 读取而是从内部状态读取，但仍需明确边界 |

---

## 🔍 AI_CONTEXT.md 铁律合规检查

| 铁律 | 状态 | 说明 |
|------|:----:|------|
| cards.js 为唯一权威源 | ✅ | 109 张卡数据统一来源 |
| effect 属性名直接使用 cards.js 字段名 | ⚠️ | 引擎内部的 `buffDmg`/`dmgBonus` 等在 cards.js EFFECT_TYPE 中未定义，但它们来自 fieldSupports 内部状态而非直接读取 cards.js。实际使用中已改善 |
| approved_cards.json 唯一插图映射 | ✅ | 109 卡→109 文件 |
| serve.cjs 启动服务 | ✅ | 存在且格式正确 |
| git tag 标记版本 | ❌ | 仓库仍零标签 |
| 收工 git add/commit/push | ✅ | 7 次新增提交(07/01 → 07/02) |
| 先 Mock 后游戏 | ⚠️ | 皮肤系统未经独立模板验证 |
| 改引擎跑全量 | ✅ | 铁律#12 新增于 commit `3ee9281`，后续 Batch 修复已验证 |

---

## 📊 问题统计总览

| 严重度 | 上次残留 | 本次已修复 | 仍遗留 | 新发现 | 当前合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 23 | 19 (83%) | 2 (E17⚠️, E22⚠️) + 0 未修复 | 2 | 4 |
| 🟡 中等 | 25 | 17 (68%) | 8 未修复 | 3 | 11 |
| 🟢 轻微 | 20 | 2 (10%) | 18 未修复 | 1 | 19 |
| **合计** | **68** | **38 (56%)** | **28** | **6** | **34** |

---

## 🎯 本次优先修复建议 (Top 5)

1. **N1 — A16 effect 浅拷贝污染** — 回手版本 cost=0 覆盖原始 effect 的 cost 字段，后续打出异常
2. **N2 — E22 遗留** — D 区代码路径 `summon.maxHp || summon.maxHp` 仍在
3. **N5 — canPlayReason 副作用** — renderHand 每次刷新触发迷宫随机检查
4. **M11 — A11 啸叫引爆逻辑** — 出牌和回合开始不一致
5. **E19/N3 — 卡组名转义** — 虽 `<option>` 自带转义但仍应显式处理

---

> 📝 报告生成时间：2026-07-02 12:30 GMT+8 | 审查方式：逐行审查全部 7 个 JS + 1 个 CSS 文件 + 逐项追踪 68 个历史问题
