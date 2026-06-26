# 代码审查报告 — 2026-06-26

> 全面审查，只读不修改。审查范围：所有 JS/CSS 文件。

---

## 审查范围

| 文件 | 行数 | 状态 |
|------|------|------|
| js/cards.js | 1286 | 已审查 |
| js/engine.js | 2643 | 已审查 |
| js/combo_table.js | 221 | 已审查 |
| js/ai.js | 1637 | 已审查 |
| js/ui.js | 3525 | 已审查 |
| js/quiz.js | 1452 | 已审查 |
| js/runes.js | 9 | 已审查 |
| css/game_v2.css | 1287 | 已审查 |
| css/game.css | 1182 | 已审查 |

---

## 发现问题

### 🔴 严重

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 1 | **C04 薛定谔的猫仍用随机决策** — `_c04PlayerChoose` 标记在 `settlePhase` 设置后从未在分支中读取，C03↔C04 combo 标记无效 | `engine.js:457,473` | 根据 `_c04PlayerChoose` 标记返回可选项给 UI，让玩家选择伤害或治疗 |
| 2 | **`canPlay` 镜面迷宫概率检查仍有副作用** — 查询方法中 `Math.random()` + `this.mirrorMaze[playerIdx]--` 会消耗迷宫计数。`getPlayableCards` 遍历手牌逐张调用 `canPlay`，多张卡消耗多次 | `engine.js:2450-2457` | 将概率判定和计数扣减移到 `playCard`，`canPlay` 仅做 boolean 查询 |
| 3 | **`calculateDamage` 中 `card.effect.conditional` 全段死代码** — 引擎处理 `conditional` 结构但 cards.js 无任何卡牌使用此字段（所有条件效果均为平铺键名如 `perSupportBonus`/`triggerElectric1` 等） | `engine.js:660-721` | 删除或标注为废弃，避免误导维护者 |
| 4 | **AI `_estimateAttackDamage` 中 `card.effect.conditional` 全段死代码** — 与引擎存在相同问题，且 AI 估伤逻辑与引擎实际计算已严重不同步 | `ai.js:1331-1355` | 删除 conditional 处理块，统一用平铺 effect 键名估算 |
| 5 | **AI `getBestAttack` 引用不存在的 `card.effect.burnLayers`** — 无法命中任何卡牌（卡牌灼烧用 `burn: N`，非 `burnLayers`），该分支永为 false | `ai.js:1245-1247` | 改为检查 `card.effect.burn` |
| 6 | **AI `evaluateCardValue` 同样引用不存在的 `card.effect.burnLayers`** — 与 #5 相同 | `ai.js:1512` | 改为检查 `card.effect.burn` |
| 7 | **`_estimateAttackDamage` 中 A54 爆燃每层伤害硬编码 48** — 实际 cards.js 中 `perBurnDmg: 50`，S24→A54 combo 可提升至 65。AI 估伤固定 48 导致低估 A54 伤害 | `ai.js:1365-1368` | 读取 `card.effect.perBurnDmg || 50` |
| 8 | **S30 `sacrificeElectricSupport` 不在 EFFECT_TYPE 枚举中** — 引擎 `_applySpecialEffects` 无法识别此键，但因 engine 通过 `card.id === 'S30'` 硬编码处理故尚未暴露 | `cards.js:967` | 将 `sacrificeElectricSupport` 列入 EFFECT_TYPE 的 RESOURCE 类 |
| 9 | **C12 `soundSupportExtend` 不在 EFFECT_TYPE 枚举中** — 枚举缺失，但引擎通过直接读取 `c12Field.card.effect.soundSupportExtend` 绕过 | `cards.js:1222` | 将 `soundSupportExtend` 加入 EFFECT_TYPE 的 STATE 类 |

### 🟡 中等

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 10 | **S29 静电吸附丢弃步骤未实现** — 卡牌效果"弃1张手牌，抽2张牌"，引擎中调用 `drawCards()` 直接抽牌，`eff.discard: 1` 仅在 effects 数组加了 `need_discard` 标记但未阻止抽牌 | `engine.js:2013-2022` | 先通过 UI 让玩家弃牌，再抽牌；或引擎层先判断手牌数再执行 |
| 11 | **AI `_pickBestSupport` S18/S20 灼烧条件错误** — S18（X射线透视）和 S20（影子束缚）的出牌条件与灼烧无关，但代码在 `self.burnLayers < 2` 时将其价值乘以 0.3 | `ai.js:1485-1486` | 删除此灼烧条件判断，或改为正确的条件（S20 需要对手场上有卡） |
| 12 | **`_ignoreDefBonus` 存储后从未读取** — `boost_ignore_defense` 将值存入 `this._ignoreDefBonus[attackerIdx]`，但 `_calcRawDamage` 和 `calculateDamage` 均未读取 | `engine.js:1114-1117` | 若为跨回合效果需在伤害计算中引用，否则删除 |
| 13 | **`canPlay` 对 A26/S23/S25 的 `consumeBurn` 硬编码阈值 2** — 若 cards.js 中改为其他值则检查失效 | `engine.js:2493-2509` | 改为 `card.effect.consumeBurn` 判定 |
| 14 | **`_applySpecialEffects` 中 `clearDebuff` 操作对象错误** — A15（日光暴晒）描述"清除己方1种负面状态"，但通用 handler 清除的是对手灼烧/麻痹/DOT | `engine.js:1827-1832` | 兼容"清除己方"和"清除对方"两种语义 |
| 15 | **AI `_estimateAttackDamage` 漏算多种加成** — 缺 A11 声压、S05 力的合成、S09 全体声波、perSupportBonus、perOppFieldCard、perSoundFieldBonus、光谱叠加 S17、短路开关 S30、nextBonus(S01/S02/S03/S12)、forceDomainBonus/domainBonus、临界突破 T02、A53 镜面回声、A48 静电爆发 | `ai.js:1283-1386` | 逐项补充缺失加成 |
| 16 | **AI `PARALYSIS_COST` 双重乘法** — `paralysis * PARALYSIS_COST * 2` 等价于 `paralysis * 4`，注释"每张卡额外+2费"与行为不符 | `ai.js:366` | 明确变量语义，如 `paralysis * PARALYSIS_COST * EXPECTED_CARDS_PLAYED` |
| 17 | **`card.domain.includes()` 在非数组上可能语义错误** — 若 `card.domain` 为字符串（单领域卡），`.includes()` 做子串匹配；AI 中多处使用但 cards.js 中所有卡 domain 均为数组，暂未暴露 | `ai.js:1258-1259,1325,1348,1489` | 统一用 `Array.isArray(x) ? x.includes(y) : x === y` |
| 18 | **`evaluateCardValue` 中 `card.domain.some()` 可能 TypeError** — 若 `card.domain` 为字符串则崩溃，同上 | `ai.js:1537` | 添加数组类型检查 |
| 19 | **ComboDetector 缺少多种匹配模式** — 无 `attack→support`、`summon→support`、`attack→summon`。但有 `summon→attack` 和 `summon↔summon` | `ai.js:562-624` | 若 combo_table 未来增加这些方向，补充模式 |
| 20 | **`_findCrossFieldCombos` 可能重复** — 同一 combo 对可被 `forwardIndex` 和 `conflictPair` 双重命中 | `ai.js:702-722` | 在 `detectAll` 中对结果去重 |
| 21 | **`SPECIAL_ATTACK_CARDS` 死代码** — 对象从未引用，_estimateAttackDamage 中相关逻辑以 `card.id === ...` 硬编码 | `ai.js:60-69` | 删除或将硬编码逻辑迁移至配置对象 |
| 22 | **ThreatAssessor `handAttack` 因子系数过小** — `oppAttackCount / MAX_HAND_SIZE * 0.1` 导致值 ≤ 0.1，几乎不影响威胁评估 | `ai.js:342` | 改为 `oppAttackCount / MAX_HAND_SIZE` |
| 23 | **combo_table 头部注释计数错误** — 声明"共18种"但实际列出 20+ 种。另有 4 行重复声明和 `modify_card_dmg` 半存在类型 | `combo_table.js:7,28-31` | 更新计数，删除重复行，标注未使用类型为 TODO |
| 24 | **3 种 combo effect type 从未使用** — `boost_clear_debuff`、`heal_hp`、`modify_card_dmg` 在注释中声明但无条目使用 | `combo_table.js:20,24,28` | 标注 TODO 或移除 |
| 25 | **`viewHand` 字段类型不一致** — A45 用 `number` 2，A52 用 `string "all"`，S07 用 `number` 2，S18 用 `string "all"`，C10 用 `number` 1 | `cards.js:194,569,712,833,1196` | 统一为一种类型如 `viewHand: -1` 表示全部 |
| 26 | **弃牌阈值硬编码 7** — `finishPlayerTurn()` 和 `showDiscardScreen()` 中硬编码 `7`，未引用 `engine.MAX_HAND_SIZE` | `ui.js:2454,2555` | 导入或定义模块级常量 |
| 27 | **`_escapeAttr` 缺 CSS 选择器防护** — 仅转义 HTML 属性字符，未处理 `.` `#` `:` 等 CSS 选择器特殊字符 | `ui.js:2070,2869,3081` | 使用 `CSS.escape()` 或验证 ID 仅含安全字符 |
| 28 | **Q_E_03 relatedCard 领域不匹配** — 题目问"电阻影响因素"（电领域），relatedCard 为 S23「热机驱动」（domain:["热"]） | `quiz.js:966-969` | 改为 S27「电阻屏障」或 C07「欧姆」 |
| 29 | **领域类名不一致** — V1/V2 用 `domain-electric`（完整拼写），V3 用 `domain-elec`（缩写） | `game_v2.css:121,139,203,217 vs 1030` | 统一为一种命名 |
| 30 | **卡牌宽高比偏离 1:1.43 标准** — 默认 `--cw:80px; --ch:112px`（1:1.4），平板 88:120（1:1.364），桌面 96:132（1:1.375） | `game_v2.css:11,764,775` | 统一为如 `--cw:80px; --ch:114px` |
| 31 | **稀有度边框仅限 mini 尺寸** — common/rare/epic/legendary/mythic 边框样式限定 `.card-v3.mini`，全尺寸卡牌无对应样式 | `game_v2.css:1115-1151` | 提取为通用规则或为全尺寸卡增加 |
| 32 | **`card-v3:hover` 未限制设备** — 移动端触摸后 `:hover` 可能黏滞 | `game_v2.css:1194-1198` | 移入 `@media (hover: hover) and (pointer: fine)` |
| 33 | **混沌领域 CSS 颜色变量缺失** — `:root` 仅有 `--frc/--snd/--lgt/--het/--elc`，无 `--chaos`。V3 卡片通过 `--dm` 局部补救但全局仍无 | `game_v2.css:5-6` | 添加 `--chaos: #7B2FBE` |
| 34 | **混沌领域符文格式不一致** — 其余 5 域为 `data:image/png;base64`，混沌为 `data:image/svg+xml;base64` | `runes.js:2-8` | 统一为 PNG 或更新 AI_CONTEXT.md 注明 SVG |
| 35 | **横屏断点 `max-height:500px` 过窄** — 唯一 landscape 断点仅覆盖极小窗口，实际横屏（如 1024×600）不被覆盖 | `game_v2.css:786` | 提高至 `max-height: 700px` 或增加通用横屏断点 |

### 🟢 轻微

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 36 | **5 个 `@keyframes` 死代码** — `cardPlay`(484)、`electricShock`(537)、`lightFlash`(538)、`cardFlyInDown`(558)、`cardFlyInUp`(563) 在 JS/HTML 中无引用 | `game_v2.css:484,537-538,558,563` | 确认后删除 |
| 37 | **`.skin-badge` 引用未定义 CSS 变量 `--dm-bg`** — 该变量从未定义，`background` 回退为空值 | `game_v2.css:1204` | 定义 `--dm-bg` 或使用具体颜色值 |
| 38 | **`skin-minimal` 引用不存在 V3 子类** — `.v3-art`→应为 `.v3-art-frame`、`.v3-desc-effect`、`.v3-desc-principle`、`.v3-formula`、`.v3-rarity-bar` 均为无效选择器 | `game_v2.css:1186-1191` | 更新为正确的 V3 子类名 |
| 39 | **`.hidden { display:none!important }` 维护风险** — `!important` 迫使后续 display 修改都需 `!important` | `game_v2.css:742` | 通过选择器特异性控制，避免 `!important` |
| 40 | **多个弹窗共用相同 z-index** — 200/250/300/350 各有 2-3 用途，同层同时出现时顺序依赖 DOM | `game_v2.css:247,333,271,428,886,1125,416,536,806,1159,561,744` | 建立层级体系（弹窗500+、通知600+、特效700+） |
| 41 | **卡牌 ID 排列顺序混乱** — A45 在 A14 后、A46 在 A20 前等，维护易遗漏 | `cards.js:186-628` | 按 ID 排序或添加注释说明 |
| 42 | **弃牌参数可选 fallback 行为不明确** — `discardPhase` 未传参时自动随机弃牌，无法区分"玩家选择"和"兜底" | `engine.js:516-521` | 要求显式传入 `{auto: true}` 标记 |
| 43 | **`INITIAL_DRAW=5` 不可配置** — 硬编码为 5 | `engine.js:18` | 考虑改为构造函数参数 |
| 44 | **D04 灼烧加成注释与代码不一致** — 注释写"每层+3"，代码 perBurnBonus 为 4 | `engine.js:2056-2061` | 统一注释与卡片数据 |
| 45 | **MultiTurnPlanner 精神力估算粗糙** — `estimateNextTurnSpirit` 硬编码 30 + reserved，未计算实际引擎恢复值 | `ai.js:413-416` | 通过 engine state 计算准确预期精神力 |
| 46 | **MultiTurnPlanner save 策略空操作** — `shouldPassTurn: false` 时调用方无特殊处理 | `ai.js:869-876` | 在调用方检查 `reason` 字段并缩减出牌量 |
| 47 | **光领域 alpha 值不一致** — `getDomainStyle()` 光领域 alpha `.2`，其余 `.25` | `ui.js:3039` | 统一 |
| 48 | **混沌领域题库仅 15 题** — 为其他领域（各 35 题）的 43%，重复率高 | `quiz.js:1183-1283` | 若为设计意图则无问题 |
| 49 | **`checkAnswer` 参数缺 nullish 检查** — `answerIndex` 为 null/undefined 时 `Number()` 返回 NaN，行为正确但缺防御性日志 | `quiz.js:1382-1388` | 加入 nullish 检查 |
| 50 | **combo 分隔符不一致** — `→`（标准）、`↔`（双向）、`vs`（对抗），解析需额外分支 | `combo_table.js:180,214` | 补充注释说明各分隔符语义 |
| 51 | **A25→A26 combo 语义不明确** — `steal_spirit` type value:25，msg 写"偷取 15→25"，不清楚是增量还是绝对值 | `combo_table.js:143-144` | 注释明确 |
| 52 | **`.card-v3.mini .v3-desc-box` 高度过小而强制 overflow hidden** — `height:16px; overflow:hidden` 导致描述完全不可读 | `game_v2.css:1104` | 仅在接受 mini 卡无法显示描述的约束下保持 |

---

## 📊 发现问题统计

| 严重度 | 数量 | 相比上次 (2026-06-25) |
|:---:|:---:|:---:|
| 🔴 严重 | 9 | +1 |
| 🟡 中等 | 26 | +3 |
| 🟢 轻微 | 17 | +2 |
| **合计** | **52** | **+6** |

---

## 上次问题跟踪（2026-06-25 报告 46 项）

| 上次# | 状态 | 说明 |
|:---:|:---:|------|
| 1 | ❌ 未修复 | C04 仍用 Math.random()，_c04PlayerChoose 标记设置后从未读取（本次 #1） |
| 2 | ❌ 未修复 | canPlay 镜面迷宫副作用仍在（本次 #2） |
| 3 | ⚠️ 部分改善 | abc-row/d-zone/divider-row 类名已在 JS 注入样式表中定义，断点引用有效，但 `max-height:500px` 仍过窄（本次 #35） |
| 4 | ❌ 未修复 | skin-minimal 无效选择器仍在（本次 #38） |
| 5 | ❌ 未修复 | --dm-bg 仍未定义（本次 #37） |
| 6 | ❌ 未修复 | 5 个 @keyframes 仍无引用（本次 #36） |
| 7 | ❌ 未修复 | sacrificeElectricSupport 不在 EFFECT_TYPE 中（本次 #8） |
| 8 | ❌ 未修复 | soundSupportExtend 不在 EFFECT_TYPE 中（本次 #9） |
| 9 | ❌ 未修复 | _ignoreDefBonus 仍未被读取（本次 #12） |
| 10 | ❌ 未修复 | consumeBurn 仍硬编码 2（本次 #13） |
| 11 | ❌ 未修复 | clearDebuff 仍清除对手而非己方（本次 #14） |
| 12 | ❌ 未修复 | AI 估伤仍缺多种加成（本次 #15） |
| 13 | ❌ 未修复 | PARALYSIS_COST 双重乘法仍在（本次 #16） |
| 14 | ❌ 未修复 | card.domain.includes() 风险仍在（本次 #17） |
| 15 | ❌ 未修复 | evaluateCardValue .some() 崩溃风险仍在（本次 #18） |
| 16 | ❌ 未修复 | ComboDetector 仍缺多种模式（本次 #19） |
| 17 | ❌ 未修复 | _findCrossFieldCombos 重复风险仍在（本次 #20） |
| 18 | ❌ 未修复 | SPECIAL_ATTACK_CARDS 死代码仍在（本次 #21） |
| 19 | ❌ 未修复 | handAttack 权重 bug 仍在（本次 #22） |
| 20 | ❌ 未修复 | combo_table 注释计数仍错误（本次 #23） |
| 21 | ❌ 未修复 | 3 种 combo effect type 仍未使用（本次 #24） |
| 22 | ❌ 未修复 | viewHand 类型仍不一致（本次 #25） |
| 23 | ❌ 未修复 | 弃牌阈值仍硬编码（本次 #26） |
| 24 | ❌ 未修复 | _escapeAttr 缺 CSS 防护（本次 #27） |
| 25 | ❌ 未修复 | Q_E_03 relatedCard 仍为 S23（本次 #28） |
| 26 | ❌ 未修复 | domain-electric vs domain-elec 不一致（本次 #29） |
| 27 | ❌ 未修复 | 卡牌宽高比仍偏离 1:1.43（本次 #30） |
| 28 | ❌ 未修复 | 稀有度边框仍仅限 mini（本次 #31） |
| 29 | ❌ 未修复 | hover 未限制设备（本次 #32） |
| 30 | ❌ 未修复 | 混沌符文仍为 SVG 格式（本次 #34） |
| 31 | ❌ 未修复 | 混沌域仍缺 :root CSS 变量（本次 #33） |
| 32 | ❌ 未修复 | 卡牌 ID 排序仍混乱（本次 #41） |
| 33 | ❌ 未修复 | S09 choice 兼容性问题仍在（本次 #50） |
| 34 | ❌ 未修复 | combo 分隔符不一致（本次 #50） |
| 35 | ❌ 未修复 | A25→A26 steal_spirit 语义不明确（本次 #51） |
| 36 | ❌ 未修复 | discardPhase 参数 fallback 行为不明确（本次 #42） |
| 37 | ❌ 未修复 | INITIAL_DRAW 不可配置（本次 #43） |
| 38 | ❌ 未修复 | D04 注释与代码不一致（本次 #44） |
| 39 | ❌ 未修复 | MultiTurnPlanner 精神力估算粗糙（本次 #45） |
| 40 | ❌ 未修复 | MultiTurnPlanner save 策略空操作（本次 #46） |
| 41 | ❌ 未修复 | 对手防御能力未评估 |
| 42 | ❌ 未修复 | 光领域 alpha 不一致（本次 #47） |
| 43 | ❌ 未修复 | 混沌题库仅 15 题（本次 #48） |
| 44 | ❌ 未修复 | checkAnswer 缺 nullish 检查（本次 #49） |
| 45 | ❌ 未修复 | .hidden !important 仍在（本次 #39） |
| 46 | ❌ 未修复 | z-index 共用仍在（本次 #40） |

**修复率：0/46 完全修复，1/46 部分改善（#3 类名引用修复但断点仍过窄），45/46 未修复。**

> ⚠️ **两周内无任何修复进展**。上次报告中 46 项问题无一完全修复，且本次新增 6 项问题。代码库处于"审查频繁、修复停滞"状态。

---

## 🎯 本次新增优先修复建议 (Top 5)

1. **engine.js:660-721 / ai.js:1331-1355** — `conditional` 全段死代码：引擎和 AI 双双包含无用的 conditional 处理块，增加维护复杂度且可能误导新开发者
2. **ai.js:1245-1247,1512** — `card.effect.burnLayers` 不存在：两处 AI 核心评估方法引用不存在的 effect 字段，导致评估永远遗漏灼烧卡
3. **engine.js:2013-2022** — S29 静电吸附丢弃步骤缺失：玩家可跳过弃牌直接抽 2 张，等价于免费抽牌
4. **ai.js:1365-1368** — A54 爆燃每层伤害硬编码 48：AI 低估爆燃卡伤害（实际 50-65），hard 难度下 AI 可能错误决策
5. **engine.js:2445-2457** — canPlay 镜面迷宫副作用：`getPlayableCards` 多次消耗迷宫计数，影响 UI 显示正确性

---

> 📝 报告生成时间：2026-06-26 12:30 GMT+8 | 审查工具：手动逐行审查 + 模式搜索
