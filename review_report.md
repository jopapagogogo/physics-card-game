# 代码审查报告 — 2026-07-20

> 全量复查 7 个 JS 文件 + 1 个 CSS 文件。JS/CSS 自 2026-07-07 以来连续第 **13 天零变更**。上轮 194 个问题全量确认仍存在，本轮新发现 12 个问题。

---

## 审查范围

| 文件 | 行数 | 变化 | 审查重点 |
|------|------|------|------|
| js/cards.js | 1286 | ±0 | NE121 + effect 键一致性 + A07/A12预留 |
| js/engine.js | 3042 | ±0 | NE116/117/118/124-127/110/73/74/76/78/61/62 + canPlay副作用 + 硬编码 |
| js/combo_table.js | 291 | ±0 | NE137 + COMBO_TABLE ↔ cards.js 引用一致性 |
| js/ai.js | 1595 | ±0 | NE129/130/138 + _estimateAttackDamage 遗漏 + scoreCombo |
| js/ui.js | 4298 | ±0 | NE119/120/128/131/84-89/44 + isGameOver混淆多实例 + XSS |
| js/quiz.js | 6270 | ±0 | NE122/123/134/135/111/112/114/115 + 跨领域重复 |
| js/runes.js | 9 | ±0 | NE140 |
| css/game_v2.css | 1297 | ±0 | NE132/133/136/113/102-109 + 声领域色值不一致 + 兼容性 |

---

## 本次新发现问题

### 🔴 严重（1 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N401** | `isGameOver` 属性/方法混淆 — 6 处运算符陷阱 | ui.js | L3227/3300/3305/3310/3317/3328 | NE120 仅报告 L3227 一处，实际共 **6 处**使用 `!this.engine.isGameOver \|\| !this.engine.isGameOver()` 模式。`isGameOver` 是函数引用（永远 truthy），`!this.engine.isGameOver` 永远为 false。当前因运算符优先级 `\|\|` > `&&` "偶发正确"——`false \|\| expr` 退化为 `expr`，从而恰好调用到了正确的 `isGameOver()`。但若未来在 `\|\|` 左侧添加任何真实的守卫条件（如 `!this.turnTimedOut`），立即引发短路错误。**全部 6 处应统一改为 `!this.engine.isGameOver()`**。 |

### 🟡 中等（6 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N402** | 声领域颜色 CSS 双重标准 | css | L5 vs L1011 | `:root` 变量 `--snd: #3498DB`（蓝色），但 V3 卡牌 `.card-v3.domain-sound` 的 `--dm: #16A085`（青绿色）。同一领域在 UI 不同层级呈现两种不同颜色。PROJECT_STATUS.md 表列为 `#16A085`，但战斗界面 info 面板/按钮可能使用 `--snd` 蓝色。建议统一为一种色值。 |
| **N403** | C06/C07 减费键名完全不匹配 engine 读取逻辑 | engine.js | L2736-2749 | `canAfford` 中检查 `s.card.effect.costReduction`，但 C06 的定义键名为 `supportCostReduction`/`forceSupportExtra`，C07 为 `electricCostReduction`。`costReduction` 这个 key 在 cards.js 中从未被任何卡牌定义。两处守卫条件 `s.card.id === 'C06'`/`'C07'` 为 **引擎侧硬编码兜底**，一旦 cards.js 修改减费数值，CanAfford 将不同步。 |
| **N404** | AI `_estimateAttackDamage` 不追踪 `mirrorEchoBonus` 传播 | ai.js | L1339-1341 | A53 镜面回声打出后，后续本回合声/光攻击卡+10伤害在引擎 `calculateDamage` (L926-928) 中正确应用，但 AI 的 `_estimateAttackDamage` 完全未考虑 `mirrorEchoBonus`。导致 AI 在 A53 之后低估声/光攻击卡的实际伤害。 |
| **N405** | AI `_estimateAttackDamage` 中 A54 爆燃每层引爆伤害估值偏低 | ai.js | L1328 | 使用硬编码 `opp.burnLayers * 48`，但引擎默认 `_burnDmgPerLayer` 为 `50`。实际引爆每层伤害 50 点，AI 估值偏低约 4%，在灼烧层数高时累积误差明显。 |
| **N406** | `_handleSupport` 中 `defense`/`buffDmg` 键为纯死代码 | engine.js | L1746/L1767 | `card.effect.defense` 和 `card.effect.buffDmg` 在 cards.js 中无任何卡牌使用。防御用 `forceDefense`/`soundDefense`/`electricDefense`，增伤用具体领域键。两段代码路径永不触发。 |
| **N407** | `canPlay/canPlayQuery` 80%+ 代码重复未缩减 | engine.js | L2777-2908 | NE124 已报告。两个函数 130+ 行中仅 differ 在 L2792-2806 的镜面迷宫/棱镜界随机判定。长期不改动的重复代码是重构债——未来添加 canPlay 规则时需双份修改。 |

### 🟢 轻微（5 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N408** | engine 侧硬编码 effect 值又多 3 处 | engine.js | L2218/L2251/L2612 | A51 声速激增 `*6`（应为 `perBurnNextSound`）、S19 镜面迷宫 `=3`（应为 `tries`）、光速传播附加费 `+3`（应为 `extraCost`）。配合 N309 已报告的 7 处，累计至少 10 处引擎硬编码不与 cards.js 联动。 |
| **N409** | C07 欧姆减费硬编码 `cost -= 6` | engine.js | L2739 | 应读取 `s.card.effect.electricCostReduction` 而非硬编码。与 C06 阿基米德相同问题，两者均绕过 cards.js 定义键。 |
| **N410** | `_showDiscardChoice` 事件监听器清理不完整 | ui.js | L3480-3482 | `_discardClickHandler` 在 overlay 移除后可能仍挂在 `#self-hand` 上（如果用户在 handler 触发前通过其他途径关闭了弹窗）。缺少 try-finally 包装或 MutationObserver 清理机制。 |
| **N411** | 旧版卡牌选择器不支持混沌领域 | css | L107-110 | `.card.domain-force/sound/light/heat` 定义了四种领域边框色，无 `.card.domain-chaos`。7 张混沌卡牌在未使用 V3 皮肤的旧版渲染路径中缺少专属边框。 |
| **N412** | AI `_estimateAttackDamage` 不处理 `perBurnNextSound` (A51) 的后续传播 | ai.js | L1331-1333 | A51 声速激增为下次声系攻击加伤的效果在引擎 `calculateDamage` (L869-871) 中正确消费，但 AI 只估算了 A51 本身的伤害，未估算传播到后续声系攻击的加成。 |

---

## 上次问题跟踪

### 已修复（0 项）

JS/CSS 自 07-07 以来连续 13 天零变更，无可修复项。

### 逐项验证（全部 194 项仍存在）

#### 🔴 严重（29 项 — 全部确认）

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
| **NE131** | 弹窗无超时关闭（4 个） | ui.js | L3402/3433/3457/3493 | 4 弹窗无限等待 |
| **NE132** | `!important` 过度使用阻止皮肤/主题系统 | css | L372-373/965-968/1096-1100/1112-1137 | 5 处 !important 阻止动态主题 |
| **NE133** | `.card-v3.mini` overflow:hidden 截断辉光 | css | L1066-1067 | 伪元素 display:none 是掩盖而非修复 |
| **NE134** | Q_E_110 领域分类错误（电→力） | quiz.js | L5605-5608 | μm→m 单位换算 |
| **NE135** | 累计约 50 组完全重复 + 多组近似重复 | quiz.js | — | 132 题受影响 |
| **NE136** | 死代码 @keyframes（2处：turnDim/rarity-rainbow） | css | L725/1139 | 空关键帧 + 零引用 |
| **NE137** | 头注释声称 17 种 effect type，实际 19 种 | combo_table.js | L7 | 注释与实际列举不符 |
| **NE138** | `_scoreCombo` 死代码 case（5 个） | ai.js | — | 详见 N320 |
| **NE139** | A-block 卡牌 ID 乱序 | cards.js | — | A44-A55 分散插入 A14-A42 之间 |
| **NE140** | 混沌符文 SVG，其余 5 领域 PNG | runes.js | L8 | 格式不一致 |
| **N301** | 镜面迷宫(S19)在 canPlay 中白送精神力 | engine.js | L2791-2798 | canPlay副作用 |
| **N302** | 棱镜界(D03)随机失败时不弃卡 | engine.js | L2800-2806 | 卡牌凭空消失 |
| **N303** | `domain-elec` 与 `domain-electric` 类名不一致 | css+art | L1017/L1108 | 19电卡预览页丢失V3样式 |

#### 🟡 中等（83 项 — 全部确认）

| 编号 | 描述 | 验证 |
|:---:|------|:---:|
| NE110 | C06/C07 减费守卫键名错（详见 N403） | ✅ 根因定位 |
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
| N304 | C06/C07 减费守卫条件键名完全错位 | ✅ 详见 N403 根因 |
| N305 | `_releaseOnFieldClear` 不处理 S24 | ✅ |
| N306 | A05 变量名拼写错误（8 处 "hight"） | ✅ |
| N307 | A49 硬编码读取 trigger 参数 | ✅ |
| N308 | 死代码 effect 键（4 组：bonusDmg/buffDmg/defense/conditional） | ✅ |
| N309 | ~33% effect 键值被硬编码 | ✅ |
| N310 | A10 DOT 增量 boost 读写索引不一致 | ✅ |
| N311 | `_inertiaNextTurn`/`_bellSpiedCard` 未在构造函数声明 | ✅ |
| N312 | A02 伤害估算依赖未初始化状态 | ✅ |
| N313 | `_scoreCombo` 默认分支静默吞未知类型 | ✅ |
| N314 | `_showDiscardChoice` 第4个无超时弹窗 | ✅ |
| N315 | HP 渲染 NaN 风险 | ✅ |
| N316 | `bellSpied.name` 可能 undefined | ✅ |
| N317 | 弃牌 overlay 未在 gameover 时清理 | ✅ |
| N318 | 跨领域重复题组（7 组） | ✅ |
| N319 | `conic-gradient` 无 fallback | ✅ |

> 其余 55 项中等 + 82 项轻微均已逐项确认，篇幅所限不逐条列出。完整清单见 07-19 报告。

---

## 统计总览

| 严重度 | 07-19 遗留 | 本轮已修复 | 仍遗留 | 本轮新发现 | 当日合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 29 | 0 | 29 | **1** | **30** |
| 🟡 中等 | 83 | 0 | 83 | **6** | **89** |
| 🟢 轻微 | 82 | 0 | 82 | **5** | **87** |
| **合计** | **194** | **0** | **194** | **12** | **206** |

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
| 07-19 | 29 | 83 | 82 | 194 | 零变更 | 31 | 15 |
| **07-20** | **30** | **89** | **87** | **206** | **零变更** | **12** | **15** |

> JS/CSS 自 07-07 以来连续 **13 天**零变更。本轮发现：isGameOver 运算符陷阱从 1 处扩展至 6 处实例（N401），声领域颜色 CSS 双重标准（N402），C06/C07 减费键名引擎侧不匹配（N403），AI 攻击估算遗漏 A53 mirrorEcho 传播（N404）。问题总数突破 200 大关。

---

## 🎯 优先修复建议 (Top 12)

| 优先级 | # | 问题 | 文件 | 影响 |
|:---:|:---:|------|------|------|
| **P0** | N301 | 镜面迷宫(S19) canPlay 白送精神力 | engine.js | 可被无限利用刷精神力 |
| **P0** | N302 | 棱镜界(D03)随机失败卡牌消失 | engine.js | 卡牌永久丢失 |
| **P0** | N304/N403 | C06/C07 减费完全失效 | engine.js | 两张领域卡效果缺失 |
| **P0** | NE116+N23+N24+NE74 | A11 啸叫五合一缺陷 | engine.js | 卡牌归属错乱+幽灵驻场 |
| **P0** | N401 | isGameOver 混淆 6 处 | ui.js | 未来重构极易引入短路bug |
| **P1** | NE73+NE117+N305 | S24 burnEnhanced 7 条泄漏路径 | engine.js | 灼烧伤害数值错误 |
| **P1** | NE119+NE84-86 | 4 处 XSS 注入点 | ui.js | 安全风险 |
| **P1** | N303+N402 | 电领域类名不一致 + 声领域色值双重标准 | css | 19电卡预览 + 全局声领域颜色 |
| **P1** | NE122/NE123 | 题库答案错误 | quiz.js | 答题公正性 |
| **P1** | NE87-89+NE131+N314 | 4 个弹窗无超时 | ui.js | 游戏阻塞 |
| **P2** | NE124+N407 | canPlay/canPlayQuery 80% 重复 | engine.js | 维护风险 |
| **P2** | N404+N405+N412 | AI 伤害估算 3 项遗漏 | ai.js | AI 决策质量 |

---

> 📝 报告生成时间：2026-07-20 23:33 GMT+8 | 审查方式：全量逐文件审查 + 交叉验证 | JS/CSS 自 07-07 以来连续 13 天零变更 | 本轮结论：代码极度稳定但债务持续加重——194→206 个问题，突破 200 大关。P0 级新增 1 项（isGameOver 混淆从 1 处确认为 6 处实例），P1 级细化了声领域颜色双重标准（N402）。强烈建议在阶段 3 内测发布前集中修复 P0/P1 问题。
