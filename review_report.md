# 代码审查报告 — 2026-06-25

> 全面审查，只读不修改。审查范围：所有 JS/CSS 文件。

---

## 审查范围

| 文件 | 行数 | 状态 |
|------|------|------|
| js/cards.js | ~1350 | 已审查 |
| js/engine.js | ~2750 | 已审查 |
| js/combo_table.js | ~220 | 已审查 |
| js/ai.js | ~1650 | 已审查 |
| js/ui.js | ~3400 | 已审查 |
| js/quiz.js | ~1480 | 已审查 |
| js/runes.js | ~300 | 已审查 |
| css/game_v2.css | ~1180 | 已审查 |

---

## 发现问题

### 🔴 严重

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 1 | **C04 玩家选择待办 `_c04PlayerChoose` 设置后从未使用** — C03↔C04 combo 设置标记为 `true` 但 settlePhase 中 C04 决策仍用 `Math.random() < 0.5`。标记行 473 被重置却从未在决策分支中读取 | `engine.js:456-474`, `engine.js:1068-1070` | 根据标记向 UI 层返回可选项等待玩家选择，或改为 deterministic 逻辑 |
| 2 | **`canPlay` 镜面迷宫概率检查有副作用** — 查询方法中调用 `Math.random()` 判断失败概率且扣减 `this.mirrorMaze[playerIdx]--`。`getPlayableCards` 遍历手牌逐张调用 `canPlay` 会消耗多次迷宫计数 | `engine.js:2445-2451` | 将概率判定和计数扣减移到 `playCard` 中，`canPlay` 仅返回 boolean 查询结果 |
| 3 | **横屏断点过窄且引用不存在类名** — 唯一 landscape 断点 `max-height: 500px` 仅覆盖极小窗口。断点内引用 `.abc-row`、`.d-zone`、`.divider-row` 三个在 CSS/HTML 中不存在的类名（疑似旧 P3 方案遗留） | `game_v2.css:733-738` | 增加通用横屏断点，删除无效类名引用或补充对应结构 |
| 4 | **skin-minimal 引用不存在的 V3 子类** — `.v3-art`→应为 `.v3-art-frame`、`.v3-desc-effect`、`.v3-desc-principle`、`.v3-formula`、`.v3-rarity-bar` 均为无效选择器 | `game_v2.css:1095-1100` | 删除旧版遗留规则，或更新为正确的 V3 子类名 |
| 5 | **`.skin-badge` 引用未定义 CSS 变量 `--dm-bg`** — 该变量从未在任何作用域定义，`background` 将回退为无值 | `game_v2.css:1113` | 在 `.card-v3` 或其父级定义 `--dm-bg` 或使用具体颜色值 |
| 6 | **5 个 `@keyframes` 疑似死代码** — `cardPlay`(472)、`electricShock`(525)、`lightFlash`(526)、`cardFlyInDown`(546)、`cardFlyInUp`(551) 在 CSS 中无选择器引用 | `game_v2.css:472,525-526,546,551` | 确认 JS 是否动态使用，未使用则删除 |
| 7 | **S30 `sacrificeElectricSupport` 不在 EFFECT_TYPE 枚举中** — 引擎 `_applySpecialEffects` 无法识别此 effect 键，S30 卡牌效果可能无法生效 | `cards.js:967` | 将 `sacrificeElectricSupport` 加入 EFFECT_TYPE 的 RESOURCE 分类 |
| 8 | **C12 `soundSupportExtend` 不在 EFFECT_TYPE 枚举中** — C12 声系辅助卡持续回合+1 效果引擎无法读取 | `cards.js:1222` | 将 `soundSupportExtend` 加入 EFFECT_TYPE 的 STATE/DEFENSE 分类 |

### 🟡 中等

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 9 | **`_ignoreDefBonus` 存储后从未读取** — `boost_ignore_defense` 将值存入 `this._ignoreDefBonus[attackerIdx]`，但 `_calcRawDamage` 和 `calculateDamage` 均未读取，属于死数据 | `engine.js:1108-1112` | 若用于跨回合效果需在伤害计算中引用，否则删除 |
| 10 | **`canPlay` 对 A26/S23/S25 的 `consumeBurn` 硬编码阈值 2** — 若 cards.js 中 `consumeBurn` 改为其他值（如 3），`canPlay` 检查会失效 | `engine.js:2488-2503` | 改为读取 `card.effect.consumeBurn` 进行判定 |
| 11 | **`_applySpecialEffects` 中 `clearDebuff` 操作对象错误** — A15（日晒消毒）描述是"清除己方1种负面状态"，但代码中清除的是对手（攻击目标）的灼烧/麻痹/DOT，逻辑与卡牌描述矛盾 | `engine.js:1822-1827` | 增加参数区分"清除己方 debuff"和"清除对方 debuff" |
| 12 | **AI `_estimateAttackDamage` 漏算 14 种加成** — 缺 A11 声压、S05 力的合成、S09 全体声波、perSupportBonus、perOppFieldCard、perBurnBonus(非conditional路径)、光谱叠加 S17、短路开关 S30、nextBonus(S01/S02/S03/S12)、perSoundFieldBonus、forceDomainBonus/domainBonus、临界突破 T02、A53 镜面回声对其他卡的加成、S01/S05 高度加成 | `ai.js:1283-1386` | 逐项补充缺失的加成估算逻辑 |
| 13 | **AI `PARALYSIS_COST` 双重乘法错误** — `paralysis * PARALYSIS_COST * 2` 等价于 `paralysis * 4`，注释"麻痹每张卡额外+2费"与实际行为不符 | `ai.js:366` | 添加变量明确 "2张卡" 乘数，改为 `paralysis * PARALYSIS_COST * EXPECTED_CARDS_PLAYED` |
| 14 | **`s.card.domain.includes()` 在非数组上可能崩溃** — 若 `card.domain` 为字符串（单领域卡），`.includes()` 做子串匹配而非数组方法，不崩但语义不同；若后续有代码直接当数组处理，多处以同样模式使用 | `ai.js:1258-1259,1325,1348,1489` | 统一用 `Array.isArray(card.domain) ? card.domain.includes(x) : card.domain === x` |
| 15 | **`evaluateCardValue` 中 `card.domain.some()` 可能 `TypeError`** — 若 `card.domain` 是字符串，`.some()` 会直接崩溃 | `ai.js:1537` | 添加数组类型检查 |
| 16 | **ComboDetector 缺少多种 combo 模式** — 无 `attack→support`、`summon→support`、`attack→summon`，且 `S15→S19`（support→support）不会被检测到 | `ai.js:562-624` | 添加更通用的检测模式或直接扫描手牌所有两两组合 |
| 17 | **`_findCrossFieldCombos` 可能重复** — 同一 combo 对可被 `forwardIndex` 和 `conflictPair` 双重索引命中 | `ai.js:702-722` | 在 `detectAll` 中对结果去重 |
| 18 | **`SPECIAL_ATTACK_CARDS` 死代码** — 对象从未被引用，相关逻辑在 `_estimateAttackDamage` 中硬编码 `card.id === ...` | `ai.js:60-69` | 删除或将硬编码逻辑迁移至此配置对象 |
| 19 | **ThreatAssessor `handAttack` 因子权重 bug** — `oppAttackCount/MAX_HAND_SIZE*0.1` 导致值极小（最多0.1），几乎不影响威胁评估 | `ai.js:342` | 改为 `oppAttackCount / MAX_HAND_SIZE` 或移除冗余 `*0.1` |
| 20 | **combo_table 头部注释计数错误** — 声明"共18种"但实际列出 20 种，另有 4 行重复声明和 `modify_card_dmg` 半存在类型 | `combo_table.js:7,28-31` | 更新计数为 20，删除重复行，标注未使用类型为 TODO |
| 21 | **3 种 combo effect type 从未使用** — `boost_clear_debuff`、`heal_hp`、`modify_card_dmg` 在 combo_table 中声明但无任何条目使用 | `combo_table.js:20,24,28` | 若是预留功能添加 TODO 标记，若已废弃则移除 |
| 22 | **`viewHand` 字段类型不一致** — A45/S07/C10 使用 `number`，A52/S18 使用 `string "all"`，混用可能引发类型判断 bug | `cards.js:194,569,712,833,1196` | 统一为一种类型，如 `viewHand: -1` 表示"全部" |
| 23 | **弃牌阈值硬编码 7** — `finishPlayerTurn()` 和 `showDiscardScreen()` 中直接写 `7`，未引用 `engine.js` 的 `MAX_HAND_SIZE`，未来不同步风险 | `ui.js:2454,2555` | 导入 `MAX_HAND_SIZE` 常量或定义模块级常量 |
| 24 | **`_escapeAttr` 在 `querySelector` 语境缺 CSS 选择器防护** — 仅转义 HTML 属性字符，未处理 `.`、`#`、`:` 等 CSS 选择器特殊字符。当前卡牌 ID 格式安全，但缺预防性保护 | `ui.js:2070,2869,3081` | 使用 `CSS.escape()` 标准 API 或验证 ID 仅含安全字符 |
| 25 | **Q_E_03 relatedCard 领域严重不匹配** — 题目问"电阻影响因素"，relatedCard 为 S23「热机驱动」(domain=["热"])，与电领域无关。建议改为 S27「电阻屏障」 | `quiz.js:969` | relatedCard 改为 `"S27"` 或 `"C07"` |
| 26 | **领域类名不一致** — V1/V2 卡片用 `domain-electric`（完整拼写），V3 卡片用 `domain-elec`（缩写），若 JS 生成统一类名则一种版本无法命中 | `game_v2.css:121,139,203,217 vs 967` | 统一命名为 `domain-electric` 或 `domain-elec` |
| 27 | **卡牌宽高比偏离 1:1.43 标准** — 默认 1:1.4、平板 1:1.364、桌面 1:1.375，三个断点比例不一致且偏离标准 | `game_v2.css:11,711,722` | 统一各断点，如默认 `--cw:80px; --ch:114px;` |
| 28 | **稀有度边框仅限 mini 尺寸** — common/rare/epic/legendary/mythic 边框样式全部限定在 `.card-v3.mini.rarity-*`，全尺寸卡牌和原始卡牌无对应样式 | `game_v2.css:1049-1060` | 提取为通用规则或为 `.card-v3` 和 `.card` 增加相同定义 |
| 29 | **`card-v3:hover` 未限制设备** — 移动端触摸后 `:hover` 可能黏滞导致卡片异常悬浮 | `game_v2.css:1103-1107` | 移入 `@media (hover: hover) and (pointer: fine)` 块内 |
| 30 | **混沌领域符文格式不一致** — 5 个领域为 `data:image/png;base64`，混沌为 `data:image/svg+xml;base64`，AI_CONTEXT.md 中描述为"base64 PNG" | `runes.js:2-8` | 统一为 PNG 或修正注释注明 SVG |
| 31 | **混沌领域缺 CSS 颜色变量** — CSS `:root` 仅定义力/声/光/热/电的颜色变量，混沌无 `--chaos` 变量 | `game_v2.css:5` | 添加 `--chaos: #7B2FBE;` |

### 🟢 轻微

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 32 | **卡牌 ID 排列顺序混乱** — A45 在 A14 后、A46 在 A20 前、A47/A54 在 A26-A27 间等，维护时易遗漏或重复 | `cards.js:186-628` 多处 | 注释说明或统一按 ID 排序 |
| 33 | **S09 `choice` 子键英文名 vs combo 中文引用** — cards.js 中用 `"high"/"low"`，combo_table 中用 `"S09升"/"S09降"`，存在耦合断裂风险 | `cards.js:734`, `combo_table.js:62,72,77` | 在 S09 choice 中增加 `"升"/"降"` 别名 |
| 34 | **combo 分隔符不一致** — `→`（标准）、`↔`（双向）、`vs`（对抗），解析需额外分支 | `combo_table.js:180,214` | 补充注释说明各分隔符语义 |
| 35 | **A25→A26 combo 语义不明确** — `steal_spirit` type value:25，msg 写"偷取 15→25"，不清楚是增量还是绝对值 | `combo_table.js:143-144` | 注释明确 `steal_spirit` 是追加还是覆盖 |
| 36 | **`discardPhase` 参数可选 fallback 行为不明确** — 未传参时自动随机弃牌，无法区分"玩家选择"和"兜底" | `engine.js:516-521` | 要求显式传入 `{auto: true}` 标记允许自动弃牌 |
| 37 | **`INITIAL_DRAW=5` 不可配置** — 若需支持不同模式，仍需改代码 | `engine.js:18` | 考虑改为构造函数参数 |
| 38 | **D04 灼烧加成注释与代码不一致** — 注释写"每层+3"，代码 fallback 为 `\|\| 4` | `engine.js:2050-2053` | 统一注释与代码值 |
| 39 | **MultiTurnPlanner 精神力估算粗糙** — `estimateNextTurnSpirit` 硬编码 `30 + reserved`，未计算实际引擎恢复值 | `ai.js:413-416` | 通过 engine state 计算准确预期精神力 |
| 40 | **MultiTurnPlanner save 策略空操作** — `shouldPassTurn: false` 时调用方无特殊处理，此分支无实际效果 | `ai.js:869-876` | 在调用方检查 `reason` 字段并缩减出牌 |
| 41 | **对手防御能力未评估** — ThreatAssessor 未考虑对手 S04/S11/S27 防御卡或 A50/S19/S20/C11 特殊防御效果 | `ai.js:290-353` | 增加对手防御值估算因子 |
| 42 | **光领域 alpha 值不一致** — `getDomainStyle()` 光领域 alpha `.2`，其余 `.25` | `ui.js:3039` | 统一为 `.25` 或说明原因 |
| 43 | **混沌领域题库仅 15 题** — 为其他领域（各 35 题）的 43%，选混沌时重复率高 | `quiz.js:1183-1283` | 若设计有意则无问题，否则扩充至持平 |
| 44 | **`checkAnswer` 参数无 nullish 检查** — `answerIndex` 为 null/undefined 时 `Number()` 返回 NaN，行为正确但缺防御性日志 | `quiz.js:1382-1388` | 加入 nullish 检查 |
| 45 | **`.hidden { display:none!important }` 维护风险** — `!important` 迫使后续所有动态 display 修改都需 `!important` | `game_v2.css:689` | 改为 `.hidden { display:none; }` 通过特异性控制 |
| 46 | **多个弹窗层共用相同 z-index** — z-index:200/250/300/350 各有 2-3 个用途，同层同时出现时顺序取决于 DOM 顺序 | `game_v2.css:247,333,271,428,886,1125,416,536,806,1159,561,744` | 建立统一 z-index 层级体系（弹窗500+、通知600+、特效700+） |

---

## 📊 发现问题统计

| 严重度 | 数量 | 相比上次 (2026-06-24) |
|:---:|:---:|:---:|
| 🔴 严重 | 8 | +3 |
| 🟡 中等 | 23 | +9 |
| 🟢 轻微 | 15 | +7 |
| **合计** | **46** | **+19** |

---

## 上次问题跟踪（2026-06-24 报告 36 项）

| 上次# | 状态 | 说明 |
|:---:|:---:|------|
| 1 | ❌ 未修复 | 混沌领域符文仍缺失（本次发现：格式不一致，SVG vs PNG） |
| 2 | ✅ 已修复 | engine P2 新增 `applyOnCast + applyPerTurn` 检测，A11 正确驻场 |
| 3 | ✅ 已修复 | quiz.js 中未再发现 S35/S37 无效引用（详见新问题#25 Q_E_03→S23） |
| 4 | ✅ **已修复** | `BURN_DMG=10` → 已改为 `30`，与 engine 一致 |
| 5 | ❌ 仍存在 | `_estimateAttackDamage` 仍缺 14 种加成（本次详列为问题#12） |
| 6 | ✅ 已修复 | 召唤物 A 区布局已重构 |
| 7 | ✅ 已修复 | hover tooltip 已适配 |
| 8 | ❌ 仍存在 | AI 威胁评估仍漏算手牌攻击卡/精神力储备 |
| 9 | ❌ 仍存在 | relatedCard 领域不匹配（Q_E_03→S23，本次问题#25） |
| 10 | ❌ 仍存在 | `viewHand` 类型仍不一致（本次问题#22） |
| 11 | ❌ 仍存在 | `maxSize=7` 仍硬编码于 ai.js:1572（ai.js:24 已定义局部常量但未统一引用） |
| 12 | ✅ **非 Bug** | `_calcRawDamage` 已委托 `calculateDamage(skipDefense=true)`，P2 加成全覆盖 |
| 13 | ❌ 仍存在 | `_applySpecialEffects` 仍用 `card.id` 硬编码（本次问题#10-11） |
| 14 | ✅ 已修复 | `checkCombo` 已正确处理 S09升/S09降 |
| 15 | ⚠️ 部分修复 | 弃牌阈值已从 5 改为 7，但仍硬编码未引用 MAX_HAND_SIZE（本次问题#23） |
| 16 | ✅ **已修复** | `discardTimer` 已在构造函数声明 |
| 17 | ✅ **已修复** | 弃牌倒计时已改用 `Date.now()` 时间戳基准 |
| 18 | ❌ 仍存在 | 部分渲染方法仍缺 try-catch 保护 |
| 19 | ⚠️ 部分改善 | `renderHand` 已实现局部 DOM diff，非全量 innerHTML |
| 20 | ❌ 仍存在 | CSS 注入与 game_v2.css 潜在冲突未解决 |
| 21 | ❌ 仍存在 | 混沌领域仍仅 15 题（本次问题#43） |
| 22 | ✅ **已修复** | `drawCards` 已使用 `INITIAL_DRAW=5` 常量 |
| 23 | ❌ 仍存在 | `discardPhase` 仍依赖调用方传入索引（本次问题#36） |
| 24 | ❌ 仍存在 | Combo 头部注释仍缺多种类型且计数错误（本次问题#20-21） |
| 25 | ❌ 仍存在 | SpiritBudgetManager 虽新增麻痹逻辑但存在双重乘法 bug（本次问题#13） |
| 26 | ❌ 仍存在 | A07/A12 仍空缺（已标注预留，非 bug） |
| 27 | ❌ 仍存在 | effect 键名仍无规范枚举（本次发现问题#7-8：S30/C12 新键不在枚举中） |
| 28 | ❌ 仍存在 | A26 0 费攻击卡条件仍硬编码（本次问题#10） |
| 29 | ❌ 仍存在 | 卡牌仍未完全按 ID 排序（本次问题#32） |
| 30 | ✅ **非 Bug** | `@keyframes toastIn` 非重复定义，`logToastIn` 和 `toastIn` 是两个不同动画 |
| 31 | ❌ 仍存在 | `.hidden !important` 仍存在（本次问题#45） |
| 32 | ❌ 仍存在 | 仍缺通用横屏响应式断点，且断点内有死代码引用（本次问题#3） |
| 33 | ❌ 仍存在 | `getDomainStyle` 光系对比度/透明度仍不一致（本次问题#42） |
| 34 | ❌ 仍存在 | C04 仍用 `Math.random()` 随机，非玩家选择（本次问题#1） |
| 35 | ❌ 仍存在 | `_escapeAttr`/`_escapeHtml` 方法仍不一致（本次问题#24） |
| 36 | ✅ **已修复** | `getGameState().hand` 已包含 `rarity` 字段 |

**修复率：9/36 已完全修复，2/36 部分修复/改善，3/36 非 Bug，22/36 未修复。**

---

## 🎯 优先修复建议 (Top 5)

1. **engine.js:2445** — `canPlay` 镜面迷宫副作用：多次调用消耗迷宫计数，影响 `getPlayableCards` 正确性
2. **engine.js:456** — C04 玩家选择未实现：标记设置后从未使用，影响游戏可玩性
3. **cards.js:967,1222** — S30/C12 effect 键不在枚举中：引擎无法识别，卡牌效果静默失效
4. **game_v2.css:1095-1113** — skin-minimal/skin-badge 无效选择器和未定义变量：V29 多皮肤架构上线后立即产生渲染问题
5. **ai.js:366** — PARALYSIS_COST 双重乘法：AI 预算计算偏差 2 倍，影响中等以上难度 AI 决策

---

> 📝 报告生成时间：2026-06-25 12:30 GMT+8 | 审查工具：多 agent 并行 + 人工复核
