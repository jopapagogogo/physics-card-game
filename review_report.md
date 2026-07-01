# 代码审查报告 — 2026-07-01

> 全面审查，只读不修改。审查范围：全部 JS/CSS 文件 + 上次问题追踪 + AI_CONTEXT 铁律检查。

---

## 审查范围

| 文件 | 行数 | 状态 |
|------|------|------|
| js/cards.js | 1287 | 已审查 |
| js/engine.js | ~2700 | 已审查（逐行） |
| js/combo_table.js | 222 | 已审查 |
| js/ai.js | ~1640 | 已审查（逐行） |
| js/ui.js | ~4000 | 已审查（逐行） |
| js/quiz.js | ~1430 | 已审查 |
| js/runes.js | 10 | 已审查 |
| css/game_v2.css | ~1300 | 已审查（全量） |
| css/game.css | 1180 | 已确认：废弃标记存在，但含完整旧副本 |

---

## 🔴 严重问题（23 项）

### 引擎逻辑错误

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| E1 | **S19 镜面迷宫 settlePhase 双重递减** — `canPlay` 每次出牌失败 `mirrorMaze[playerIdx]--`（line 2634），`settlePhase` 回合结束时再次 `mirrorMaze[currentPlayer]--`（line 504）。对手即使未出牌迷宫也被消耗，S19 效果大打折扣。 **之前曾报告但未修复。** | `engine.js:504, 2634` | 移除 settlePhase 中的 `mirrorMaze[currentPlayer]--`，仅由 canPlay 在出牌时递减 |
| E2 | **pendingCombo 不清理致 combo 效果对后续攻击重复生效** — `_handleAttack`(line 1082) 读取 `pendingCombo[attackerIdx]` 后未置 null，`_handleSummon`(line 1866) 同理。pendingCombo 仅在 `startTurn`(line 262) 重置，同一个出牌阶段内多张攻击卡分享同一 combo 加成。 | `engine.js:1082, 1866` | 在 `_handleAttack` 和 `_handleSummon` 消费 pendingCombo 后追加 `this.pendingCombo[playerIdx] = null` |
| E3 | **processFieldEffects 双重调用，驻场卡回合数双倍递减** — `startTurn`(line 219) 和 `settlePhase`(line 490 via `_tickFieldCards`) 各调一次 `processFieldEffects(currentPlayer)`，所有驻场/领域卡持续回合提前一回合消失。line 587-588 注释声称已修但实际未修。 | `engine.js:219, 490` | 从 startTurn 或 settlePhase 中移除一次调用 |
| E4 | **A36 焦耳热击配对加成伤害未扣除 HP** — `damage += bonus`(line 1547) 在 `opponent.hp -= damage`(line 1428) 之后执行，bonusDmgPerPair 加成被计算但从未施加给对手。 | `engine.js:1428, 1547` | 将 bonusDmgPerPair 计算移至 HP 扣除之前 |
| E5 | **攻击卡 stealSpirit 双重应用** — `_handleAttack` 和 `_applySpecialEffects` 两处各自推送 stealSpirit 效果（A25/A34 等），精神力被偷取两次。 | `engine.js:1508-1513, 1973-1978` | 合并到一个位置处理，另一个位置跳过 |
| E6 | **攻击卡 halveSpiritRecovery 双重应用** — 同上模式，A42 等恢复减半效果重复应用。 | `engine.js:1502-1505, 2044-2047` | 同 E5 |
| E7 | **攻击卡 opponentExtraCost 不一致双重应用** — `_handleAttack` 用 `Math.max` 取大值，`_applySpecialEffects` 用直接赋值覆盖。两段逻辑冲突。 | `engine.js:1496-1499, 1967-1970` | 统一为 `Math.max` 语义 |
| E8 | **clearDebuff 清除的是对手负面状态而非自身** — `_applySpecialEffects` 通用 clearDebuff(line 1953-1958) 清除 `opponent.burnLayers`/`opponent.paralysis`/`opponent.dotEffects`，等于帮对手清负面。对比 S07(line 2159-2166) 正确清除自身。 | `engine.js:1953-1958` | 改为清除 `player`（出牌方）的负面状态 |
| E9 | **S07 回声消声双重清除 + 双重视牌** — 通用 clearDebuff 清对手，S07 专用块清自身，两段都执行导致 S07 清两次负面 + 看两次牌。 | `engine.js:1953-1958, 2159-2166` | S07 块使用 `else if` 与通用块互斥 |
| E10 | **召唤物上限/同名检查在扣费之后** — `_handleSummon`(line 1850-1857) 检查上限和同名在 `playCard` 扣费(988)和移除手牌(991)之后。玩家打召唤物被拒时白白损失费用和卡牌。 | `engine.js:988, 1850-1857` | 将上限和同名检查前移至 canPlay/playCard 中 |
| E11 | **S34 置换卡 push 到牌库顶后立即 pop 回同一张** — `attacker.deck.push(returned)` 放末尾(顶)，`drawCards` 用 `pop` 从末尾抽(顶)，置换无效。 | `engine.js:1797, 1799` | 改用 `unshift` 放底部或洗入随机位置 |
| E12 | **S29 静电吸附声称"先弃1张"但无条件抽牌** — 推送 `need_discard` 提示后紧跟 `drawCards` 无条件执行，未要求弃牌。 | `engine.js:2170-2171` | 等待玩家选择弃牌再抽牌，或改为 cost 中包含弃牌条件 |
| E13 | **C05 牛顿 forceDmgBonus 被重复加算** — bonusKeys 循环已为力系加 forceDmgBonus(line 695-698)，C05 专用判断又加一次(line 700-702)。力系攻击伤害多+20。 | `engine.js:695-702` | 移除 C05 专用判断，bonusKeys 循环已覆盖 |
| E14 | **A16 色散分解永久修改卡牌定义 cost** — `removed.card.effect.cost = 0`(line 2338) 直接修改静态 CARDS 数组。此后 A16 在任何场景下都是 0 费。 | `engine.js:2338` | 使用临时标记(如 _tempCost0)而非修改原始对象 |
| E15 | **A39 光电效应永久修改卡牌 domain** — `lightField.card.domain = [...lightField.card.domain, '电']`(line 1558) 直接修改静态卡牌定义。离场再回手仍是电系卡。 | `engine.js:1558` | 创建副本或使用临时标记 |
| E16 | **S15 偏振过滤意外清零对手 extraCost** — `opponent.extraCost = 0`(line 2074) 会取消 A33/A43/S08 等已施加的加费效果。 | `engine.js:2074` | 不应修改 opponent.extraCost |

### canPlay 副作用

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| E17 | **canPlay 查询函数存在副作用** — `canPlay` 在镜面迷宫判定失败时直接 `player.spirit += refund` 和 `mirrorMaze[playerIdx]--`。`getPlayableCards`(line 2819-2827) 每卡调用两次 canPlay，导致每次 UI 查询都改变游戏状态。**之前曾报告但未修复。** | `engine.js:2633-2634, 2819-2827` | `getPlayableCards` 使用 `canPlayQuery`(line 2723) 替代 canPlay |
| E18 | **canPlayQuery 与 canPlay 对 A26 检查条件不一致** — canPlay(line 2673) 有 `playerIdx === this.currentPlayer` 判断，canPlayQuery(line 2723) 无。查询结果与实际出牌结果可能不符。 | `engine.js:2673, 2723` | 统一条件 |

### UI 严重问题

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| E19 | **XSS 漏洞：卡组名未转义直接插入 innerHTML** — `select.innerHTML` 拼接用户通过 `prompt()` 输入的名称，未使用 `_escapeHtml`。 | `ui.js:70-71` | 使用 `_escapeHtml(n)` |
| E20 | **CSS 选择器错误导致光速传播卡牌飞行动画永远不执行** — 选择器 `.card[data-card-id=...]` 匹配的是同时有 `card` 和 `data-card-id` 的元素，但手牌卡 class 为 `card-v3 mini`，不包含 `card` 类。`_lsCardEl` 永远为 null。 | `ui.js:3452` | 改为 `.card-v3[data-card-id=...]` |
| E21 | **召唤物高亮选择器与 DOM 不匹配，targetable-summon 类永远不添加** — `_showTargetingVisuals` 查询 `#opp-field .summon-card.enemy`，但召唤物实际在 A 区(`#opp-summons`) 渲染，class 为 `summon-mini enemy`。 | `ui.js:3992-3996` | 改为查询 `#opp-summons .summon-mini.enemy` |
| E22 | **summon.maxHp \|\| summon.maxHp 冗余笔误** — 两个位置都是 `cardData.maxHp = summon.maxHp \|\| summon.maxHp`，`\|\|` 两侧相同表达式，无实际默认值效果。 | `ui.js:2176, 2214` | 改为 `summon.maxHp \|\| 300` |
| E23 | **`--dm-bg` CSS 变量未定义** — `.skin-badge{background:var(--dm-bg)}` 引用未定义的变量，background 回退为空。 | `game_v2.css:1196` | 定义 `--dm-bg` 或改用 `var(--dm)` |

---

## 🟡 中等问题（25 项）

### 引擎逻辑

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| M1 | **A53 镜面回声 effects 数组重复推送** — 两个 if 块分别 push mirror_echo(1950-1952, 1956-1958)，两段都执行导致 UI 双日志。**之前曾报告但未修复。** | `engine.js:1950-1958` | 合并为一个 if 块 |
| M2 | **_ignoreDefBonus 被赋值但从未在伤害计算中读取（死变量）** — Combo 效果设置(line 1189/1283)，calculateDamage 从未读取。 | `engine.js:1189, 1283` | 在 calculateDamage 中使用该值 |
| M3 | **buffDmg 驻场效果无效（死效果）** — 辅助卡被加入 fieldSupports(line 1632-1640)，但 calculateDamage 从不读取 buffDmg。增伤完全无效(仅 ai.js 估值引用)。 | `engine.js:1632-1640` | 在 calculateDamage 中读取 buffDmg |
| M4 | **lightSubFirstCard 定义但从不调用（死代码）** — line 2425-2437 定义的"每回合首个光攻+10%"从未在项目中被调用。 | `engine.js:2425-2437` | 在 playCard 流程中调用或删除 |
| M5 | **_inertiaNextTurn 为死代码** — `_inertiaNextTurn` 被设置但 `.damage`/`.ratio` 从未被读取。 | `engine.js:1206-1207, 1447-1450` | 清理或在 endTurn 中消费 |
| M6 | **S31 高压击穿无视全部电防而非"20点"** — 代码(line 907-909) `if (hvpActive && domain === '电') continue` 跳过所有电防。描述称仅"无视20点"。 | `engine.js:907-909` | 改为扣除20点后继续计算剩余防御 |
| M7 | **A55 凸透引燃添加灼烧未检查上限** — line 1331 `opponent.burnLayers = ... + extraBurn` 没封顶，其他位置均 `Math.min(maxBurn)`。 | `engine.js:1331` | 加上 `Math.min(maxBurn)` |
| M8 | **支援卡灼烧效果未检查上限** — `_applySpecialEffects` 中 `eff.burn`(line 2007) 直接叠加无封顶。 | `engine.js:2007` | 加上 `Math.min(maxBurn)` |
| M9 | **S08 噪音干扰覆盖而非取最大值设置 extraCost** — line 2150 `opponent.extraCost = eff.opponentExtraCost \|\| 5` vs line 1497 `Math.max`。不一致语义。 | `engine.js:2150` | 统一使用 `Math.max` |
| M10 | **_pendingScry 多窥牌效果互相覆盖** — 单值变量，C03(窥对手)和 S13(窥自己)同回合触发时后者覆盖前者。 | `engine.js:331, 2198` | 使用数组或区分 self/opp |
| M11 | **A11 啸叫引爆逻辑在出牌时与回合开始时不一致** — 出牌引爆不移除 A11(line 1522-1528)，回合开始引爆移除(line 307-317)。A11 可重复引爆。 | `engine.js:1522-1528` | 统一移除逻辑 |
| M12 | **S20 影子束缚/S30 短路开关在无目标时仍消耗卡牌** — canPlay 未前置检查条件是否满足。 | `engine.js:2101-2119` | 在 canPlay 中前置检查 |
| M13 | **镜面迷宫概率读取索引方向疑有误** — line 2630 `Math.max(0.35, this._mirrorMazeBoost[1 - playerIdx] \|\| 0.35)`，但 boost 存储在攻击方索引(line 1161 `attackerIdx`)，此处读取防守方。 | `engine.js:2630, 1161` | 确认索引方向是否与设计意图一致 |

### Combo 相关问题

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| M14 | **S17→A16 的 combo 效果与 A16 原有 effect 完全冗余** — A16 已有 `returnOnSurvive:true`，combo 的 `set_return_to_hand` 描述同一效果，无额外增益。 | `combo_table.js:114-118` | 重新设计 combo 效果或移除该 combo |
| M15 | **S07→A14 与 C10→A14 的 extra_damage 对延迟伤害卡语义不明** — A14 即时 dmg=0，延迟为 100。+30/+25 是加到即时伤害(0→30)还是延迟伤害(100→130)？ | `combo_table.js:82-86, 192-196` | 在 msg 中注明"即时伤害"或"延迟伤害" |
| M16 | **A25→A26 的 msg 表述误导** — "偷取精神力15→25"暗示 A26 有基值15，实际 A26 无 stealSpirit 字段，15 是 A25 的值。 | `combo_table.js:143-144` | 改为"A26获得偷取精神力10" |
| M17 | **S01→A05 的 perHeight:15 语义模糊** — "每点蓄能高度+15"是增量(+40→55)还是设值(设15)？若引擎误解为设值会降低伤害(40→15)。 | `combo_table.js:47-49` | 在代码注释中明确增量语义 |
| M18 | **combo 键格式不统一** — "S09升"/"S09降"/"A32vsS11"/"C03↔C04" 四种非标准格式，需确认引擎各格式均有专门解析。 | `combo_table.js:72, 76, 180, 213` | 统一定义 parseKey 处理四种格式 |
| M19 | **顶部注释 effect.type 数量错误且有重复项** — "共18种"实际21种；modify_height/steal_spirit/heal_hp 重复列出。 | `combo_table.js:7-32` | 清理注释至准确数量 |

### AI 问题

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| M20 | **shouldHoldCard 循环逻辑无效** — `for (const comboKey of combos)` 内调用 `getCurCardsForPrev(card.id)` 不依赖 comboKey，每次迭代结果相同。for 循环等同单次判断。 | `ai.js:1610-1617` | 根据 comboKey 查询对应配对卡(如取 comboKey 中另一张卡的 ID) |
| M21 | **queryCombo 包含死代码** — `_build()` 已将所有 ↔/vs 双向加入 forwardIndex(line 117-123)，回退扫描(line 188-205)永远不会找到新结果。 | `ai.js:188-205` | 删除死代码 |
| M22 | **estimateNextTurnSpirit 参数 self 未使用且硬编码魔法数字** — `Math.min(100, 30 + reserved)` 硬编码精神力上限100和恢复30，未读取引擎实际值。 | `ai.js:413-416` | 使用引擎常量或从 engine 获取实际恢复率 |
| M23 | **COMBO_POTENTIAL_WEIGHT 和 SPECIAL_ATTACK_CARDS 定义但从未使用** — 死常量。 | `ai.js:49, 60-69` | 删除或投入使用 |

### CSS 问题

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| M24 | **`@keyframes badgePulse` 缺失** — `.log-drawer-toggle.has-new{animation:badgePulse ...}` 引用不存在的动画。 | `game_v2.css:309` | 定义 @keyframes badgePulse |
| M25 | **game.css 非仅废弃标记，含 1180 行完整旧样式** — 与 game_v2.css 存在直接冲突（playable 边框策略相反、动画不同、hover 规则不同）。 | `game.css:1-1180` | 裁剪为仅保留首行注释或删除 |

---

## 🟢 轻微问题（20 项）

| # | 问题描述 | 文件:行号 |
|---|---------|-----------|
| L1 | **A54 爆燃注释与代码不一致** — 注释"默认48"，实际代码初始值和重置值均为 50 | `engine.js:1314` |
| L2 | **A51 声速激增基于自身灼烧而非对手灼烧** — `player.burnLayers * 6` 基于施放者灼烧，需确认设计意图 | `engine.js:2057` |
| L3 | **getCardById 每次线性搜索 O(n)** — 高频调用场景下有性能隐患，建议 Map 缓存 | `engine.js:2558-2560` |
| L4 | **viewHand 取手牌末尾而非随机** — `slice(-shown)` 行为预测，建议随机选取 | `engine.js:1935` |
| L5 | **合召唤物 maxHp 默认值两处不一致** — `_handleSummon`(200) vs `getGameState`(300) | `engine.js:1861, 2763` |
| L6 | **多处缺少 null 安全检查** — `card.effect.dmg`/`s.card.domain` 等直接访问 | `engine.js:670, 686, 693` |
| L7 | **A54 爆燃注释"默认48"与实际 50 不符** | `engine.js:1314` (同 L1) |
| L8 | **Q_S_20 答案错误(quiz.js)** — "音乐厅不同位置听到声音不同"答案为D(以上都是)，但C"音色在不同位置不同"是错误物理陈述，正确答案应为B(声波干涉) | `quiz.js:381` |
| L9 | **Q_S_29 存在两个正确答案** — "液体可以传播声音"的B(钓鱼轻声)和D(潜水员听声)都正确 | `quiz.js:442-443` |
| L10 | **ai.js 中使用 `sort(() => Math.random() - 0.5)` 洗牌** — 非均匀，应使用 Fisher-Yates | `ai.js:820, 1203` |
| L11 | **生产代码中残留 `console.log` 调试输出** — 每回合多次调用时大量输出 | `ui.js:1894, 1969` |
| L12 | **ui.js gameOver 检查方式不一致** — 一处用属性 `.gameOver`(line 3138)，一处用方法 `.isGameOver()`(line 3185) | `ui.js:3138, 3185` |
| L13 | **ui.js `_escapeHtml` 高频创建临时 DOM** — 每次调用 new div，应复用 | `ui.js:3678-3686` |
| L14 | **ui.js 卡组下拉默认文案与模板不一致** — 模板"使用自定义卡组" vs JS 覆盖"使用默认卡组" | `ui.js:70, 161` |
| L15 | **ui.js `this.playTimerSeconds` 赋值后从未使用** — 实际用局部变量 | `ui.js:1118` |
| L16 | **ui.js `_showCardDetail` 多个变量定义后未使用** — emoji/formula/emojiMap2 | `ui.js:3886, 3906, 3915` |
| L17 | **领域CSS类命名不统一** — `domain-electric`(旧) vs `domain-elec`(V3) | `game_v2.css` 多处 |
| L18 | **`--rot` CSS 变量无默认值** — 依赖 JS 设置，若 JS 未执行则 transform 失效 | `game_v2.css:1099, 1102` |
| L19 | **`user-scalable=no` 可访问性扣分** — 禁用 pinch-zoom 违反 WCAG 建议 | `index.html:5` |
| L20 | **engine.js 自定义 effect 别名违反铁律#1** — 读取 `effect.dmgBonus`/`buffDmg`/`defense`/`drawCards` 等在 cards.js 中不存在的字段名 | `engine.js:684, 689, 1611-1644, 2342` |

---

## 上次问题跟踪（2026-06-30 报告）

| 上次# | 状态 | 说明 |
|:---:|:---:|------|
| 1 (🔴) | ❌ 未修复 | S19 mirrorMaze settlePhase 双重递减 — 代码未做任何修改 |
| 2 (🟡) | ❌ 未修复 | getPlayableCards 重复调用 canPlay — 仍两次调用带副作用函数 |
| 3 (🟡) | ❌ 未修复 | A53 effects 双重推送 — 两个 if 块均存在 |
| 4 (🟢) | ❌ 未修复 | .card-v3.mini:hover 未包裹媒体查询 — 且 index.html 内联样式加重 |
| 5 (🟢) | ❌ 未修复 | 领域色不一致 — 声=#3498db vs #16A085, 光=#f1c40f vs #F39C12 仍并存 |
| 6 (🟢) | ⚠️ 部分修复 | C04 薛定谔的猫玩家选择 — 仍为引擎自动决策，未暴露 UI 交互 |

**累计修复率：0/6。6/30 报告中的所有 6 个问题均未修复。**

---

## 🔍 AI_CONTEXT.md 铁律合规检查

| 铁律 | 状态 | 说明 |
|------|:----:|------|
| cards.js 为唯一权威源 | ✅ | 109 张卡数据统一来源 |
| effect 属性名直接使用 cards.js 字段名 | ❌ | engine.js 有 4 个自定义别名(dmgBonus/buffDmg/defense/drawCards)不在 cards.js 中 |
| approved_cards.json 唯一插图映射 | ✅ | 109 卡→109 文件，0 缺失 0 多余 |
| serve.cjs 启动服务 | ✅ | 存在且格式正确 |
| git tag 标记版本 | ❌ | 仓库零标签，从未打 tag |
| 收工 git add/commit/push | ✅ | 工作树干净，有 19+ 次提交 |
| 先 Mock 后游戏 | ⚠️ | CSS 中皮肤系统(skin-anime/skin-minimal)未在独立模板验证 |
| 改引擎跑全量 | ⚠️ | 铁律#12 已记录但最近 4 个 commit 未见 test_all_cards 结果 |

---

## 📊 问题统计

| 严重度 | 本次新发现 | 上次遗留 | 合计 |
|:---:|:---:|:---:|:---:|
| 🔴 严重 | 17 | 6 | 23 |
| 🟡 中等 | 25 | 0 | 25 |
| 🟢 轻微 | 20 | 0 | 20 |
| **合计** | **62** | **6** | **68** |

---

## 🎯 本次优先修复建议 (Top 10)

1. **E2 — pendingCombo 不清理** — combo 效果对同回合后续攻击重复生效，严重影响游戏平衡
2. **E3 — processFieldEffects 双重调用** — 所有驻场/领域卡持续回合减半，全局影响
3. **E1 — S19 mirrorMaze 双重递减** — 迷宫效果大打折扣，已累积两期未修
4. **E5/E6/E7 — stealSpirit/halveSpirit/extraCost 双重应用** — 三张卡资源效果翻倍
5. **E19 — XSS 漏洞** — 卡组名未转义，安全风险
6. **E20 — CSS 选择器错误** — 光速传播动画永远不执行
7. **E8 — clearDebuff 清错对象** — 帮对手清负面状态
8. **E11 — S34 置换卡无效** — 放回后立即抽回，核心功能失效
9. **E12 — S29 不弃牌就抽牌** — 静电吸附代价形同虚设
10. **E17 — canPlay 副作用** — 查询操作改变游戏状态，累积两期未修

---

> 📝 报告生成时间：2026-07-01 12:30 GMT+8 | 审查方式：4 个并行 Agent 逐行审查全部 JS/CSS + 双文件交叉校验
