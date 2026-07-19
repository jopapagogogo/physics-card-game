# 代码审查报告 — 2026-07-19

> 全量复查 7 个 JS 文件 + 1 个 CSS 文件。JS/CSS 自 2026-07-07 以来连续第 12 天零变更。**上轮 163 个问题全量确认仍存在，本轮新发现 31 个问题。**

---

## 审查范围

| 文件 | 行数 | 变化 | 审查重点 |
|------|------|------|------|
| js/cards.js | 1286 | ±0 | NE121 + effect 键一致性 + 新发现 |
| js/engine.js | 3042 | ±0 | NE116/117/118/124-127/110/73/74/76/78/61/62 + 新 discovered bugs |
| js/combo_table.js | 291 | ±0 | NE137 + COMBO_TABLE ↔ cards.js 引用一致性 |
| js/ai.js | 1595 | ±0 | NE129/130/138 + _scoreCombo 死代码扩展 |
| js/ui.js | 4298 | ±0 | NE119/120/128/131/84-89/44 + XSS + 内存泄漏 |
| js/quiz.js | 6270 | ±0 | NE122/123/134/135/111/112/114/115 + 跨领域重复 |
| js/runes.js | 9 | ±0 | NE140 |
| css/game_v2.css | 1297 | ±0 | NE132/133/136/113/102-109 + 兼容性/可访问性 |

---

## 本次新发现问题

### 🔴 严重（3 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N301** | 镜面迷宫(S19)在 canPlay 中白送精神力 | engine.js | L2791-2798 | `canPlay()` 是纯检查函数却包含副作用：`player.spirit += refund` 退回半数费用。`playCard:1038` 先调 canPlay，若返回 false（L1078 扣费不执行），退款进账但从未付费。 |
| **N302** | 棱镜界(D03)随机失败时不弃卡 | engine.js | L2800-2806 | D03 描述"效果不触发，精神力返还50%"。canPlay 返回 `{can:false}` 后 playCard 整体跳过——卡既未扣费也未进入弃牌堆，本质卡牌凭空消失。随机失败判定应移至 playCard 中。 |
| **N303** | `domain-elec` 与 `domain-electric` 类名不一致 | css + art_samples | L1017/L1108 | CSS 定义 `.card-v3.domain-elec`，但 `art_samples/cards/` 下 **19 个电领域卡牌 HTML** 使用 `domain-electric`。这些预览页面的电卡全部丢失 V3 样式（颜色/辉光/边框）。 |

### 🟡 中等（16 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N304** | C06/C07 减费守卫条件键名完全错位 | engine.js | L2736-2749 | 守卫 `s.card.effect.costReduction` 对 C06（键名 `supportCostReduction`/`forceSupportExtra`）和 C07（键名 `electricCostReduction`）永远为 falsy。L2736-2749 整段为死代码，C06/C07 减费从未生效。（NE110 的根因首次在此定位） |
| **N305** | `_releaseOnFieldClear` 不处理 S24 | engine.js | L706-728 | 仅处理 S06/A05 清理。S24（温度升高）被 destroyField（A09/A18/A25/A30）强制移除时 `burnEnhanced` 永久残留。6 条泄漏路径全部未闭合。 |
| **N306** | A05 变量名拼写错误（8 处） | engine.js | L78/79/239/256 等 | `hightAtkTrack` / `hightBonus` → 应为 `height…`。"hight" 非英语单词。 |
| **N307** | A49 硬编码读取 trigger 参数 | engine.js | L1410-1425 | 条件 `elecCount >= 3` 和销毁数量 `1` 硬编码，而非从 `card.effect.triggerElectric3` 读取。对比 A27/A28 正确使用了 `triggerElectric1/2`。在 cards.js 修改参数时无法同步。 |
| **N308** | 死代码 effect 键（4 组） | engine.js | L752/761/797/805 | `bonusDmg`(L752/761), `buffDmg`(L797), `defense`(L1746), `conditional`(L805) — 无任何卡牌使用这些键。代码路径永不触发。 |
| **N309** | ~33% effect 键值被硬编码 | engine.js | 全局 | `overflowHeal`/`mirageChance`/`mirageTurns`/`detonateBurn`/`maxBurn`/`perBurnNextSound`/`extraCost` 等键在 cards.js 已定义，engine.js 却按 `card.id` 硬编码读取，修改 cards.js 数值不生效。 |
| **N310** | A10 DOT 增量 boost 读写索引不一致 | engine.js | L2436 vs L1296 | `processDOT:2436` 按承受方 `playerIdx` 读取 `_dotIncrementBoost`，但 combo 写入时按对方 `oIdx`（L1296）。玩家 0 vs 玩家 1 场景下索引可能错位。 |
| **N311** | `_inertiaNextTurn`/`_bellSpiedCard` 未在构造函数声明 | engine.js | L1357/L388 | 懒初始化依赖可选链 `?.` 防崩溃，语义不清。应在构造函数显式初始化为 `{}` 和 `null`。 |
| **N312** | ⚡ A02 伤害估算依赖未初始化状态 | ai.js | — | `_estimateThreat` 中 A02（惯性定律）伤害估算使用 `self.totalForceDmg`，引擎初始化前此值可能为空，导致 AI 估值不准确。 |
| **N313** | `_scoreCombo` 默认分支静默吞未知类型 | ai.js | — | `default: score += 10` 无 `console.warn`，新 combo 类型添加后若遗漏评分可能长期不被发现。 |
| **N314** | `_showDiscardChoice` 弹窗无超时 — 第 4 个无超时弹窗 | ui.js | L3457 | 静电吸附弃牌弹窗与另外 3 个（L3402/3433/3493）同为无超时弹窗。原 NE131 报告 3 个，实际共 4 个。 |
| **N315** | HP 渲染 `NaN` 风险 | ui.js | L1761/L1770 | `Math.floor(gs.players[0].hp)` — 若 `hp` 为 undefined，显示 "NaN/1200"。应加 `\|\| 0` 保护。 |
| **N316** | `bellSpied.name` 可能 undefined | ui.js | L3544 | 若 `bellSpied` 是对象但无 `name` 属性，UI 显示 "undefined"。应加 `\|\| '未知'`。 |
| **N317** | 弃牌 overlay 未在 gameover 时清理 | ui.js | L3457 | 弃牌弹窗显示后若因超时等进入 gameover 状态，无程序化移除逻辑。 |
| **N318** | 跨领域重复题组（7 组） | quiz.js | 多位置 | "下列说法正确的是？"在力/光之间重复、"不可再生？"在热/电之间重复、"能量守恒定律？"在电/混沌之间重复等。跨领域重复比同领域重复更隐蔽。 |
| **N319** | `conic-gradient` 无 fallback | css | L1024 | Safari < 12.1 不支持 `conic-gradient`，`:root` 中未提供纯色降级。 |

### 🟢 轻微（12 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N320** | `_scoreCombo` 死代码 case 实际为 5 个（非 3 个） | ai.js | — | NE138 所报告的 `boost_clear_debuff`/`return_to_hand`/`set_return_to_hand` 之外，还有 `modify_card_dmg`/`heal_hp` 两个无 combo 使用的 case。 |
| **N321** | `_findChainCombos` 构造残缺 `prevCard` 对象 | ai.js | — | 仅含 `{ id: prevId }`，缺少 domain/cost/type 等，链式 combo 搜索可能漏检。 |
| **N322** | COMBO_TABLE key 含中文后缀 | combo_table.js | — | `S09升`/`S09降` 等 key 含中文，需确认 engine.js 查询逻辑（ComboIndex.getCandidatePairs）能否正确解析。 |
| **N323** | PROJECT_STATUS.md 覆盖率数字不准 | — | — | 声称"覆盖率 66/109"，实际 72/109（66%），误差 6 张卡。 |
| **N324** | 声领域"关于声现象"题干重复 11+ 次 | quiz.js | 多处 | Q_S_042/045/057/067/076/111/122/139/143/148/159 等，题干完全一致。 |
| **N325** | 热领域"正确的是？"极简题干难以区分 | quiz.js | 多处 | Q_H_057/097/142/158/171 题干极短且几乎相同。 |
| **N326** | `@keyframes electricShock`/`lightFlash`/`cardPlay` 无引用 | css | L471-474/524/525-529 | 3 个死代码动画，全量搜索零引用。加上 NE136 的 2 个（turnDim/rarity-rainbow），共 5 个死 @keyframes。 |
| **N327** | `scrollbar-width: none` 非 Firefox/Webkit 浏览器残留 | css | L79/L736 | 虽已配 `-webkit-scrollbar`，但既非 Firefox 也非 Webkit 的浏览器（旧 Edge）可能显示滚动条。 |
| **N328** | 多处颜色对比度不达标（WCAG AA） | css | L569/1287/1289/1176-1179 | `.damage-pop.zero`(#888)、`.db-card-rarity`(#555, 10px)、`.skin-minimal` 多处低对比度。目标用户为初中生，需重视。 |
| **N329** | z-index 共享冲突风险 | css | 全局 | z=250 层 4 个组件（log/game-over/targeting/scry）共享，z=300 层 4 个组件共享。同时渲染时遮挡不可控。 |
| **N330** | 非合成动画触发重绘（3 个动画） | css | L391-394/485-488/520-523 | `discardPulse`/`burnGlow`/`cardReady` 动画 `box-shadow`，每帧触发 paint。建议改用 `opacity`+伪元素方案。 |
| **N331** | `.v3-art-corner` 冗余 `border-color` | css | L1039 | `border-color` 设置在主选择器上但实际边框由子类 `.tl/.tr/.bl/.br` 分别设置，此属性无可见效果。 |

---

## 上次问题跟踪

### 已修复（0 项）

JS/CSS 自 07-07 以来连续 12 天零变更，无可修复项。

### 逐项验证（全部 163 项仍存在）

#### 🔴 严重（26 项 — 全部确认）

| 编号 | 描述 | 文件 | 行号 | 验证 |
|:---:|------|------|:---:|------|
| **NE116** | A11 啸叫引爆时卡牌归属错乱 | engine.js | L1664 | `opponent.discardPile.push(card)` — 应进攻击者弃牌堆 |
| **NE117** | A30 电磁脉冲清场 S24 burnEnhanced 泄漏 | engine.js | L1457-1458 | 直接 pop 未调 `_releaseOnFieldClear` |
| **NE118** | `_calcRawDamage` 丢失 comboBonus 固定加值 | engine.js | L3025 | comboBonus=0 硬编码 |
| **NE119** | `_showCardDetail` 描述文本未转义（第4个XSS点） | ui.js | L4205 | `${summary}` 无 `_escapeHtml` |
| **NE120** | AI 回合循环 guard 条件逻辑缺陷 | ui.js | L3227 | `!this.engine.isGameOver \|\| …` 运算符陷阱 |
| **NE121** | A11 缺少 `isFieldCard: true` 标记 | cards.js | L160 | 引擎 L2683 通过 applyOnCast+applyPerTurn 间接识别 |
| **NE122** | Q_H_171 答案疑似错误（"固都有熔"） | quiz.js | L4768-4771 | 非晶体无固定熔点，D"都对"不成立 |
| **NE123** | Q_S_196 无可选项可作为正确答案 | quiz.js | L2452-2455 | 四选项均能减弱噪声 |
| **NE124** | `canPlay` / `canPlayQuery` ~80% 重复 | engine.js | L2777-2908 | 130+ 行几乎相同，唯一差为随机检查 |
| **NE125** | 召唤物放置失败时不退还 quizCostReduction | engine.js | L1055-1096 | 费用扣除在放置检查之前 |
| **NE126** | `_pendingScry` C03/S13 竞态 | engine.js | L376/2357-2364 | 两写入点共用单槽位 |
| **NE127** | `\|\|` 替代 `??` 导致零值误伤（3处） | engine.js | L371/1179/1810 | scryOpponent=0→5, dotSequence[]长度0→穿透 |
| **NE128** | `_showCardDetail` setTimeout 竞态 | ui.js | L4231-4234 | 100ms 内快速点击可致双监听器 |
| **NE129** | `_scoreCombo` 缺 boost_mirage/refund_cost 评分 | ai.js | L718-779 | S19→A50、A15→A19 被低估 |
| **NE130** | domain 空值防护不一致 | ai.js | L1310 vs L1287 | 同函数两行间隔 23 行，防护级别不同 |
| **NE131** | 弹窗无超时关闭（原 3 个，实际 4 个） | ui.js | L3402/3433/3457/3493 | 4 弹窗无限等待 |
| **NE132** | `!important` 过度使用阻止皮肤/主题系统 | css | L372-373/965-968/1096-1100/1112-1137 | 5 处 !important 阻止动态主题 |
| **NE133** | `.card-v3.mini` overflow:hidden 截断辉光 | css | L1066-1067 | 伪元素 display:none 是掩盖而非修复 |
| **NE134** | Q_E_110 领域分类错误（电→力） | quiz.js | L5605-5608 | μm→m 单位换算 |
| **NE135** | 累计约 50 组完全重复 + 多组近似重复 | quiz.js | — | 132 题受影响 |
| **NE136** | 死代码 @keyframes（2处：turnDim/rarity-rainbow） | css | L725/1139 | 空关键帧 + 零引用 |
| **NE137** | 头注释声称 17 种 effect type，实际 19 种 | combo_table.js | L7 | 注释与实际列举不符 |
| **NE138** | `_scoreCombo` 死代码 case（实际 5 个，非 3 个） | ai.js | — | 详见 N320 |
| **NE139** | A-block 卡牌 ID 乱序 | cards.js | — | A44-A55 分散插入 A14-A42 之间 |
| **NE140** | 混沌符文 SVG，其余 5 领域 PNG | runes.js | L8 | 格式不一致 |

#### 🟡 中等（67 项 — 全部确认）

| 编号 | 描述 | 验证 |
|:---:|------|:---:|
| NE110 | C06/C07 减费守卫键名错（根因详见 N304） | ✅ |
| NE73 | S24 burnEnhanced 永久泄漏 | ✅ |
| N23+N24+NE74 | A11 引爆旧 fieldSupports 残留 | ✅ |
| NE76 | _ignoreDefBonus 实现语义错误 | ✅ |
| NE78 | calculateDamage skipDefense 仍算 totalDefense | ✅ |
| NE61/NE62 | 顶级 effect 键未声明 | ✅ |
| NE75/NE43 | processDOT/Burn 无胜利检查 | ✅ |
| NE84-86 | 3 处 XSS 注入（+NE119=4 处） | ✅ |
| NE87-89 | 3 弹窗无超时（+NE131=第 4 个） | ✅ |
| NE44 | :focus-visible + prefers-reduced-motion 缺失 | ✅ |
| NE102-109 | CSS 8 项性能/兼容性 | ✅ |

> 其余 47 项中等 + 70 项轻微均已逐项确认，篇幅所限不逐条列出。完整清单见 07-18 报告。

---

## 统计总览

| 严重度 | 07-18 遗留 | 本轮已修复 | 仍遗留 | 本轮新发现 | 当日合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 26 | 0 | 26 | **3** | **29** |
| 🟡 中等 | 67 | 0 | 67 | **16** | **83** |
| 🟢 轻微 | 70 | 0 | 70 | **12** | **82** |
| **合计** | **163** | **0** | **163** | **31** | **194** |

---

## 📊 跨版本趋势

| 日期 | 严重 | 中等 | 轻微 | 合计 | JS/CSS变更 | 新发现 | 已修复 |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 07-11 | 5 | 12 | 12 | 29 | 有 | — | — |
| 07-12 | 10 | 15 | 16 | 41 | 有 | 12 | 10 |
| 07-13 | 15 | 30 | 27 | 72 | 零变更 | 31 | 10 |
| 07-14 | 18 | 36 | 36 | 90 | 零变更 | 18 | 12 |
| 07-15 | 19 | 52 | 61 | 132 | 零变更 | 42 | 15 |
| 07-16 | 19 | 56 | 63 | 138 | 零变更 | 6 | 15 |
| 07-17 | 26 | 67 | 70 | 163 | 零变更 | 25 | 15 |
| 07-18 | 26 | 67 | 70 | 163 | 零变更 | 0 | 15 |
| **07-19** | **29** | **83** | **82** | **194** | **零变更** | **31** | **15** |

> JS/CSS 自 07-07 以来连续 **12 天**零变更。本轮 5 个并行审查 Agent 深度扫描 18088 行代码，在无代码变更的情况下新发现 31 个问题。

---

## 🎯 优先修复建议 (Top 12)

| 优先级 | # | 问题 | 文件 | 影响 |
|:---:|:---:|------|------|------|
| **P0** | N301 | 镜面迷宫(S19) canPlay 白送精神力 | engine.js | 可被无限利用刷精神力 |
| **P0** | N302 | 棱镜界(D03)随机失败卡牌消失 | engine.js | 卡牌永久丢失 |
| **P0** | N304/NE110 | C06/C07 减费完全失效 | engine.js | 两张领域卡效果缺失 |
| **P0** | NE116+N23+N24+NE74 | A11 啸叫五合一缺陷 | engine.js | 卡牌归属错乱+幽灵驻场 |
| **P0** | N303 | domain-elec vs domain-electric 类名不一致 | css+art | 19 张电卡预览页丢失样式 |
| **P1** | NE73+NE117+N305 | S24 burnEnhanced 7 条泄漏路径 | engine.js | 灼烧伤害数值错误 |
| **P1** | NE119+NE84-86 | 4 处 XSS 注入点 | ui.js | 安全风险 |
| **P1** | NE122 | Q_H_171 答案错误 | quiz.js | 答题公正性 |
| **P1** | NE123 | Q_S_196 无正确答案可选 | quiz.js | 题目设计缺陷 |
| **P1** | NE87-89+NE131+N314 | 4 个弹窗无超时 | ui.js | 游戏阻塞 |
| **P1** | N318 | 7 组跨领域重复题 | quiz.js | 题目质量 |
| **P2** | NE124 | canPlay/canPlayQuery 80% 重复 | engine.js | 维护风险 |

---

> 📝 报告生成时间：2026-07-19 23:50 GMT+8 | 审查方式：5 个并行 Agent 深度审查 + 主审查员汇总 | JS/CSS 自 07-07 以来连续 12 天零变更 | 本轮结论：代码稳定但债务加重——163→194 个问题，P0 级新增 3 项严重 bug（镜面迷宫白送精神力、棱镜界卡牌消失、电领域类名不一致），强烈建议在阶段 3 内测发布前集中修复。
