# 代码审查报告 — 2026-06-28

> 全面审查，只读不修改。审查范围：所有 JS/CSS 文件。

---

## 审查范围

| 文件 | 行数 | 状态 |
|------|------|------|
| js/cards.js | 1286 | 已审查 |
| js/engine.js | 2647 | 已审查 |
| js/combo_table.js | 221 | 已审查 |
| js/ai.js | 1637 | 已审查 |
| js/ui.js | 3739 | 已审查 |
| js/quiz.js | 1452 | 已审查 |
| js/runes.js | 9 | 已审查 |
| css/game_v2.css | 1297 | 已审查 |
| css/game.css | ~1182 | 已审查（与 v2 对比） |

---

## 发现新问题

### 🔴 严重

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 1 | **A53 镜面回声效果永不生效** — `calculateDamage` 第 777 行搜索 `fieldSupports` 中 `card.type === 'mirror_echo'` 的卡，但 A53 是 attack 类型且出牌后进入 `discardPile`，不会出现在 `fieldSupports`。`card.effect.soundLightBonus` 键值完全未被引擎读取。A53 打出后只记录一条日志(`_applySpecialEffects:1936-1938`)，无任何实际伤害加成 | `engine.js:777-779, 1935-1938` | 在 engine 层添加临时标记（类似 `soundSpeedBuff`），本回合声系/光系攻击+10；出牌阶段结束或回合切换后重置 |
| 2 | **`renderHand()` 调用 `canPlay()` 产生副作用** — 每次渲染手牌时对每张卡调用 `engine.canPlay(0, card)`，而 `canPlay` 内部有 `Math.random()` 调用（镜面迷宫概率检查 line 2453）且会递减 `mirrorMaze[playerIdx]` 计数器。高频渲染等于大量消耗镜面迷宫次数 | `ui.js:1663-1665`, `engine.js:2453` | `canPlay` 应拆分为纯查询（bool check）和带副作用执行（结算时才调），或 renderHand 改用无副作用版本 |

### 🟡 中等

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 3 | **C04 薛定谔的猫：`_c04PlayerChoose` 标记设置后从未读取** — C03↔C04 combo 设置 `_c04PlayerChoose = true` 意图允许玩家选择伤害/治疗，但 `settlePhase:456` 始终用 `Math.random() < 0.5` | `engine.js:456, 473` | settlePhase 中检查 `_c04PlayerChoose`，若为 true 则通过 engine 暴露选择回调供 UI 交互 |
| 4 | **S08→A10 Combo DOT 递增加固使用错误的玩家索引** — combo 触发时 `_dotIncrementBoost[attackerIdx]` 设为 3（攻击方索引），但 `processDOT(playerIdx)` 读取 `_dotIncrementBoost[playerIdx]`（DOT 承受方索引）。攻击方≠承受方，导致加固永不生效 | `engine.js:1085, 2102` | 改为 `_dotIncrementBoost` 按 DOT 承受方索引存储，或在 processDOT 中用 `1-playerIdx` 读取 |
| 5 | **A05 重力势能驻场卡未加入 `fieldSupports`** — `isFieldCard(A05)` 返回 true 阻止了弃牌堆推入，但 `_handleAttack` 未将其加入 `fieldSupports`。A05 仅通过 `hightAtkTrack` / `hightBonus` 引擎级数组追踪，卡牌本身在游戏状态中不可见（UI 无法渲染、无法被清场效果清除） | `engine.js:1145-1148, 982-984, 357` | `_handleAttack` 中增加 `attacker.fieldSupports.push({ card, turnsRemaining: 999 })` |
| 6 | **`_handleSummon` 读取 `card.effect.hp` 而非 `card.hp`** — cards.js 中 C01~C14 的 hp 在顶层 `card.hp`（如 C01=360），effect 对象无 hp 字段。导致所有召唤物 HP 回退到硬编码默认 200 | `engine.js:1747-1748` | 改为 `card.hp \|\| card.effect.hp \|\| 200` |
| 7 | **game.css 与 game_v2.css `@keyframes toastIn` 冲突** — game.css:290 定义 `toastIn` (translateX 水平滑入，供日志气泡)，game.css:509 再次定义 `toastIn` (translateX+translateY，供顶部通知 toast)。两个文件同时加载时 game_v2.css 的 logToastIn 虽已改名，但 game.css 内的二重定义仍然冲突 | `game.css:290,509` | 删除 game.css 中旧的日志动画定义（game_v2.css 已有 `logToastIn`），或将 game.css 声明为废弃 |
| 8 | **S09 频率调节 AI 决策引擎层内嵌** — `_handleSupport` 中硬编码「有 A10 则选 low，无则选 high」的启发式逻辑，违反引擎纯规则层的设计原则 | `engine.js:1589-1610` | 将模式选择作为参数传入（`_handleSupport(card, playerIdx, mode)`），引擎仅执行已确定的模式 |
| 9 | **game.css 与 game_v2.css 同时存在，CSS 权重分裂** — 两个 CSS 文件 `.game-container` 宽度策略矛盾（V1: max-width:480px，V2: width:100%），页面两个都加载时行为不确定 | `game.css:29`, `game_v2.css:29` | 明确权威版本，废弃另一个；或在 index.html 中只加载一个 |

### 🟢 轻微

| # | 问题描述 | 文件:行号 | 建议修复 |
|---|---------|-----------|---------|
| 10 | **`@keyframes rarity-rainbow` 重复定义** — game_v2.css 第 1053 行和 1141 行各定义一次，虽不冲突但冗余 | `game_v2.css:1053,1141` | 合并为一份 |
| 11 | **完整卡牌 `card-v3:hover` 缺设备限制** — 未包裹在 `@media (hover:hover) and (pointer:fine)` 内，移动端触摸可能黏滞 | `game_v2.css:1184-1188` | 移入媒体查询 |
| 12 | **`getQuizBonus` 与 engine `QUIZ_BONUS` 定义不一致** — quiz.js 返回整数百分比(12/8/5/0)，engine.js 使用小数(0.12/0.08/0.05/0.0)。UI 的 `finishQuiz` 调用 `quiz.getQuizBonus` 未将其转为小数，传给引擎的正确值源自 `engine.setQuizResult` 内部查表 | `quiz.js:1397-1401`, `engine.js:29` | 统一 quiz.js `getQuizBonus` 返回小数与 engine 一致，或在 UI 层做转换 |
| 13 | **processBurn 在 D04 存在时双倍扣血** — line 2062: `player.hp -= totalDmg - extraDmg` 当 D04 在场时扣两次（totalDmg 内含基础 burnDmg × layers，extraDmg 再加一次 perBurnBonus）。但 card D04 effect 仅描述热系攻击+4+额外灼烧，不应影响 DOT 灼烧结算 | `engine.js:2057-2065` | processBurn 应移除 D04 对灼烧结算的额外伤害加成，D04 加成应仅限于热系主动攻击 |

---

## 上次问题跟踪（2026-06-27 报告）

> ⚠️ **Git 日志显示自 6/27 以来仍无任何代码修复提交。**

| 上次# | 状态 | 说明 |
|:---:|:---:|------|
| 1 | ❌ 未修复 | C04 仍用 `Math.random()`，`_c04PlayerChoose` 设置后从未读取 → 本报告 #3 |
| 2 | ❌ 未修复 | canPlay 镜面迷宫副作用仍在，且新增 renderHand 放大效应 → 本报告 #2 |
| 3 | ❌ 未修复 | abc-row/d-zone/divider-row 类名引用有效，布局仍狭窄 |
| 4-9 | ❌ 未修复 | 全部 6 项未修复（详见 6/27 报告） |

**累计修复率：0/9 完全修复（6/26 报告的 46 项同样全部未修复）。第八周无任何代码修复。**

---

## 📊 问题统计

| 严重度 | 数量 | 相比上次 (2026-06-27) |
|:---:|:---:|:---:|
| 🔴 严重 | 2 | +1（A53 新增） |
| 🟡 中等 | 7 | +2（A05 驻场缺失 + CSS 双文件分裂） |
| 🟢 轻微 | 4 | +1（D04 灼烧结算） |
| **本次合计** | **13** | +4 新增 |

---

## 🎯 本次优先修复建议 (Top 5)

1. **engine.js:777-779** — A53 镜面回声效果永远不生效（`soundLightBonus` 键未读取，检查 `fieldSupports` 中不存在的 `mirror_echo` 类型）
2. **ui.js:1663 + engine.js:2453** — `renderHand()` 高频调用带副作用的 `canPlay()`，大量消耗镜面迷宫次数
3. **engine.js:1085,2102** — S08→A10 Combo DOT 递增加固存储/读取索引错位，加固永不生效
4. **engine.js:1747-1748** — 召唤物 HP 字段读取错误（`effect.hp` → `card.hp`），所有召唤物 HP=200 而非设计值
5. **engine.js:1145,982** — A05 重力势能驻场卡未加入 fieldSupports，卡牌不可见且无法被清场

---

## 🔍 AI_CONTEXT.md 铁律合规检查

| 铁律 | 状态 | 说明 |
|------|:----:|------|
| cards.js 为唯一权威源 | ✅ | 所有卡牌数据统一从此读取 |
| effect 属性名直接使用 cards.js 字段名 | ⚠️ | `card.effect.hp`（应为 `card.hp`）+ A53 `soundLightBonus` 未使用 → 2 处违规 |
| approved_cards.json 为唯一定插图映射 | ✅ | UI 通过 `_loadCardArt()` 正确加载 |
| serve.cjs 启动服务 | ✅ | 存在且格式正确 |
| git tag 标记版本 | ⚠️ | 最近无 tag |
| 收工 git add/commit/push | ⚠️ | 仅 6/27 一次状态快照，无代码变更 |

---

> 📝 报告生成时间：2026-06-28 12:30 GMT+8 | 审查工具：手动逐行审查 + 模式搜索 + 交叉引用检查
