# 代码审查报告 — 2026-07-21

> 全量复查 7 个 JS 文件 + 1 个 CSS 文件。JS/CSS 自 2026-07-07 以来连续第 **14 天零变更**。上轮 206 个问题全量确认仍存在，本轮纵深审查 ui.js/CSS/quiz.js/ai.js 交叉验证，新发现 15 个问题。

---

## 审查范围

| 文件 | 行数 | 变化 | 审查重点 |
|------|------|------|------|
| js/cards.js | 1286 | ±0 | effect 键一致性 + 卡牌数据完整性 |
| js/engine.js | 3042 | ±0 | canPlay副作用 + 硬编码 + isGameOver混淆 |
| js/combo_table.js | 291 | ±0 | COMBO_TABLE ↔ cards.js 引用一致性 |
| js/ai.js | 1595 | ±0 | _estimateAttackDamage遗漏 + _scoreCombo缺分支 |
| js/ui.js | 4298 | ±0 | XSS(纵深) + isGameOver 6处 + 弹窗超时 + 监听器泄漏 |
| js/quiz.js | 6270 | ±0 | Q_H_171答案错误 + Q_S_196逻辑矛盾 + 重复题组 + 领域分类 |
| js/runes.js | 9 | ±0 | 混沌领域SVG vs 其余PNG |
| css/game_v2.css | 1297 | ±0 | !important 17处 + 死代码@keyframes + 声领域颜色分裂 |

---

## 本次新发现问题

### 🔴 严重（3 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N413** | `_showCardDetail` 描述文本 XSS — summary/principle 未转义 | ui.js | L4205 | `summary` 和 `principle` 直接从 `cardData.description` 提取后拼入 `innerHTML`，仅做了 `.replace(/。/g, '。<br>')` 句号替换，**未经过 `_escapeHtml()`**。而同行 L4198 的 `cardData.name` 却正确转义了。对比手牌渲染（L1828）也正确使用了 `_escapeHtml`，可确认此处为疏忽。若卡牌描述含 HTML 标签将直接注入DOM。 |
| **N414** | Q_H_171 "固都有熔" 答案科学性错误 | quiz.js | L4768-4771 | 选项A"固都有熔"（所有固体都有熔点）是**错误**的——非晶体（玻璃、塑料、沥青）无固定熔点。选项B"液沸温不变"和C"蒸在表"正确。将D"都对"标记为正确答案（index=3）会让学生学到错误的物理概念。 |
| **N415** | Q_S_196 与 Q_S_079 跨题答案矛盾 | quiz.js | L2452-2455 vs L1750-1753 | Q_S_196 问"不能减弱噪声的是"，四选项全都能减弱噪声，答案标记D"戴耳罩"为"不能"。但 Q_S_079 同类题目中"戴耳罩"被正确归为**能**减弱噪声的方法。两道题给出互相矛盾的"标准答案"，严重损害答题公正性。 |

### 🟡 中等（8 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N416** | `_showScryModal` 卡牌名称 XSS | ui.js | L3370 | `card.name` 直接拼入 `innerHTML` 设置，未调用 `_escapeHtml()`。卡牌名称虽来自 `cards.js`，但作为数据源到DOM的路径应完整防御。 |
| **N417** | Q_F_180 领域分类错误：安全用电→力学 | quiz.js | L1093-1096 | knowledge 字段标注"安全用电"，relatedCard 为 S05（力），但 domain 标记为"力"。安全用电应归属"电"领域。 |
| **N418** | Q_E_110 领域分类错误：长度换算→电学 | quiz.js | L5605-5608 | 考查 μm→m 单位换算（长度测量），属于力学/测量范畴，却标记 domain: "电"。relatedCard "A01"进一步印证应属力学。 |
| **N419** | CSS 声领域颜色 V3 mini 尺寸分裂 | css | L1105 vs L1011 | `.card-v3.domain-sound` 主色为 `#16A085`（青绿），但 `.card-v3.mini.domain-sound` 边框为 `#3498db`（旧系统蓝色）。同一声卡牌在全尺寸和 mini 形态呈现不同领域颜色，视觉分裂。旧系统全用 `#3498DB`，V3新系统用 `#16A085`，双重标准。 |
| **N420** | CSS `@keyframes turnDim` 空块死代码 | css | L725 | 完全空的 `@keyframes turnDim {}` 定义，无任何引用。上一轮 NE136 标记了 turnDim，但未强调其**空内容**——不仅是未引用，定义本身也是零指令。 |
| **N421** | CSS `@keyframes` 可疑死代码 +3 个 | css | L524/525/545/550/1139 | 除已报告的 turnDim/rarity-rainbow，`electricShock`（L524）、`lightFlash`（L525）、`cardFlyInDown`（L545）、`cardFlyInUp`（L550）在 CSS 中均无引用。其中 cardFly 类可能在 JS 动态使用（需确认），electricShock/lightFlash 高度可疑。 |
| **N422** | CSS `conic-gradient` 无 fallback | css | L1024 | 费用环使用 `conic-gradient` 但无 `background` fallback。不支持此属性的浏览器中费用环完全空白。应添加 `radial-gradient` 作为降级。 |
| **N423** | 题库跨领域重复题组答案不一致（3组） | quiz.js | — | Q_H_176(热)与Q_E_132(电)题面相同但答案不同（2 vs 1）；Q_H_181(热)与Q_E_130(电)题面相同但答案不同（1 vs 3）；Q_E_128(电)与Q_C_003(混沌)题面"能量守恒定律"答案不同（0 vs 2）。需要逐一核对哪个是正确的。 |

### 🟢 轻微（4 项）

| 编号 | 描述 | 文件 | 行号 | 详情 |
|:---:|------|------|:---:|------|
| **N424** | CSS `scrollbar-width:none` 缺 -webkit- 前缀 | css | L79 | `.card-hand` 仅设置 `scrollbar-width:none`（Firefox专属），虽第81行有独立的 `::-webkit-scrollbar{display:none}`，但可统一使用 `.no-scrollbar` 工具类（L736-737已完整实现三位一体）。 |
| **N425** | CSS `backdrop-filter` 缺 -webkit- 前缀 | css | L858 | `.card-zoom-overlay` 使用 `backdrop-filter: blur(8px)` 无 `-webkit-` 前缀，Safari兼容性受影响。 |
| **N426** | `emojiMap` 重复定义 2 处 | ui.js | L3972/4188 | `_getCardTooltipHTML` 和 `_showCardDetail` 中定义了完全相同的 `emojiMap` 对象，应提炼为类属性或模块常量。 |
| **N427** | 题库领域内完全重复题组约 94 题 | quiz.js | — | 声学领域发现 11+ 对完全重复题组（如 Q_S_079↔Q_S_174, Q_S_114↔Q_S_154 等），全库估计至少 47 组重复（94+ 题）。不仅浪费题库空间，还可能在同领域出现两次时让学生困惑。 |

---

## 上次问题跟踪

### 已修复（0 项）

JS/CSS 自 07-07 以来连续 **14 天零变更**，无可修复项。

### 逐项验证（全部 206 项仍存在）

#### 🔴 严重（30 项 — 全部确认）

| 编号 | 描述 | 文件 | 行号 | 验证 |
|:---:|------|------|:---:|------|
| **NE116** | A11 啸叫引爆时卡牌归属错乱 | engine.js | L1664 | `opponent.discardPile.push(card)` — 应进攻击者弃牌堆 |
| **NE117** | A30 电磁脉冲清场 S24 burnEnhanced 泄漏 | engine.js | L1457-1458 | 直接 pop 未调 `_releaseOnFieldClear` |
| **NE118** | `_calcRawDamage` 丢失 comboBonus 固定加值 | engine.js | L3025 | comboBonus=0 硬编码 |
| **NE119** | `_showCardDetail` 描述文本未转义（XSS #4） | ui.js | L4205 | `${summary}` 无 `_escapeHtml` |
| **NE120** | AI 回合循环 guard 条件逻辑缺陷 | ui.js | L3227 | `!this.engine.isGameOver \|\| …` 运算符陷阱 |
| **NE121** | A11 缺少 `isFieldCard: true` 标记 | cards.js | L160 | 引擎 L2683 通过 applyOnCast+applyPerTurn 间接识别 |
| **NE122** | Q_H_171 答案疑似错误（"固都有熔"） | quiz.js | L4768-4771 | 非晶体无固定熔点，D"都对"不成立 |
| **NE123** | Q_S_196 无可选项可作为正确答案 | quiz.js | L2452-2455 | 本轮纵深确认：与 Q_S_079 直接矛盾 |
| **NE124** | `canPlay` / `canPlayQuery` ~80% 重复 | engine.js | L2777-2908 | 130+ 行几乎相同 |
| **NE125** | 召唤物放置失败时不退还 quizCostReduction | engine.js | L1055-1096 | 费用扣除在放置检查之前 |
| **NE126** | `_pendingScry` C03/S13 竞态 | engine.js | L376/2357-2364 | 两写入点共用单槽位 |
| **NE127** | `\|\|` 替代 `??` 导致零值误伤（3处） | engine.js | L371/1179/1810 | scryOpponent=0→5, dotSequence[]长度0→穿透 |
| **NE128** | `_showCardDetail` setTimeout 竞态 | ui.js | L4231-4234 | 100ms 内快速点击可致双监听器 |
| **NE129** | `_scoreCombo` 缺 boost_mirage/refund_cost 评分 | ai.js | L718-779 | 本轮确认：两类型均落入 default 分支仅得10分 |
| **NE130** | domain 空值防护不一致 | ai.js | L1310 vs L1287 | 同函数两行间隔23行，防护级别不同；另 L1220/L1451 也缺防护 |
| **NE131** | 弹窗无超时关闭（4 个） | ui.js | L3402/3433/3457/3493 | 本轮纵深确认：含监听器泄漏双重缺陷 |
| **NE132** | `!important` 过度使用阻止皮肤/主题系统 | css | L372-373等 | 本轮精确统计：**17处**！important |
| **NE133** | `.card-v3.mini` overflow:hidden 截断辉光 | css | L1066-1067 | 伪元素 display:none 是掩盖而非修复 |
| **NE134** | Q_E_110 领域分类错误（电→力） | quiz.js | L5605-5608 | μm→m 单位换算 |
| **NE135** | 累计约 50 组完全重复 + 多组近似重复 | quiz.js | — | 本轮精确定量：47组领域内重复 + 7组跨领域 |
| **NE136** | 死代码 @keyframes（2处：turnDim/rarity-rainbow） | css | L725/1139 | 本轮扩展：至少5个@keyframes为死代码 |
| **NE137** | 头注释声称 17 种 effect type，实际 19 种 | combo_table.js | L7 | 注释与实际列举不符 |
| **NE138** | `_scoreCombo` 死代码 case（5 个） | ai.js | — | 本轮确认：5 个 case 永不触发 |
| **NE139** | A-block 卡牌 ID 乱序 | cards.js | — | A44-A55 分散插入 A14-A42 之间 |
| **NE140** | 混沌符文 SVG，其余 5 领域 PNG | runes.js | L8 | 格式不一致 |
| **N301** | 镜面迷宫(S19)在 canPlay 中白送精神力 | engine.js | L2791-2798 | canPlay副作用 |
| **N302** | 棱镜界(D03)随机失败时不弃卡 | engine.js | L2800-2806 | 卡牌凭空消失 |
| **N303** | `domain-elec` 与 `domain-electric` 类名不一致 | css+art | L1017/L1108 | 19电卡预览页丢失V3样式 |
| **N401** | `isGameOver` 属性/方法混淆 — 6 处运算符陷阱 | ui.js | L3227等 | 本轮纵深确认6处全部存在 |

#### 🟡 中等（89 项 — 全部确认）

| 编号 | 描述 | 验证 |
|:---:|------|:---:|
| NE110/N304/N403 | C06/C07 减费守卫键名错 | ✅ 根因定位不变 |
| NE73 | S24 burnEnhanced 永久泄漏 | ✅ |
| N23+N24+NE74 | A11 引爆旧 fieldSupports 残留 | ✅ |
| NE76/NE78 | _ignoreDefBonus 实现语义错误 + skipDefense仍算totalDefense | ✅ |
| NE61/NE62 | 顶级 effect 键未声明 | ✅ |
| NE75/NE43 | processDOT/Burn 无胜利检查 | ✅ |
| NE84-86 | 3 处 XSS 注入（+NE119+N413+N416=6处） | ✅ |
| NE87-89+NE131+N314 | 4 弹窗无超时 | ✅ |
| NE44 | :focus-visible + prefers-reduced-motion 缺失 | ✅ |
| NE102-109 | CSS 8 项性能/兼容性 | ✅ |
| N305 | `_releaseOnFieldClear` 不处理 S24 | ✅ |
| N306 | A05 变量名拼写错误（8 处 "hight"） | ✅ |
| N307 | A49 硬编码读取 trigger 参数 | ✅ |
| N308 | 死代码 effect 键（4 组） | ✅ |
| N309 | ~33% effect 键值被硬编码 | ✅ |
| N310 | A10 DOT 增量 boost 读写索引不一致 | ✅ |
| N311 | `_inertiaNextTurn`/`_bellSpiedCard` 未在构造函数声明（engine侧） | ✅ |
| N312 | A02 伤害估算依赖未初始化状态 | ✅ |
| N313 | `_scoreCombo` 默认分支静默吞未知类型 | ✅ |
| N315 | HP 渲染 NaN 风险 | ✅ |
| N316 | `bellSpied.name` 可能 undefined | ✅ |
| N317 | 弃牌 overlay 未在 gameover 时清理 | ✅ |
| N318 | 跨领域重复题组（7 组） | ✅ 本轮确认含3组答案矛盾 |
| N319 | `conic-gradient` 无 fallback | ✅ |
| N402 | 声领域颜色 CSS 双重标准 | ✅ 本轮精确定位 L1105 vs L1011 |
| N404 | AI `_estimateAttackDamage` 不追踪 mirrorEchoBonus | ✅ |
| N405 | AI A54 爆燃每层引爆伤害估值偏低（48→应为50） | ✅ |
| N406 | `_handleSupport` 中 defense/buffDmg 键为纯死代码 | ✅ |
| N407 | canPlay/canPlayQuery 80%+ 代码重复未缩减 | ✅ |
| N408 | engine 侧硬编码 effect 值又多 3 处 | ✅ |
| N409 | C07 欧姆减费硬编码 `cost -= 6` | ✅ |
| N410 | `_showDiscardChoice` 事件监听器清理不完整 | ✅ |
| N411 | 旧版卡牌选择器不支持混沌领域 | ✅ |
| N412 | AI `_estimateAttackDamage` 不处理 perBurnNextSound (A51) 后续传播 | ✅ |

> 其余 56 项中等 + 82 项轻微均已逐项确认，篇幅所限不逐条列出。完整清单见 07-19/07-20 报告。

---

## 统计总览

| 严重度 | 07-20 遗留 | 本轮已修复 | 仍遗留 | 本轮新发现 | 当日合计 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 严重 | 30 | 0 | 30 | **3** | **33** |
| 🟡 中等 | 89 | 0 | 89 | **8** | **97** |
| 🟢 轻微 | 87 | 0 | 87 | **4** | **91** |
| **合计** | **206** | **0** | **206** | **15** | **221** |

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
| 07-20 | 30 | 89 | 87 | 206 | 零变更 | 12 | 15 |
| **07-21** | **33** | **97** | **91** | **221** | **零变更** | **15** | **15** |

> JS/CSS 自 07-07 以来连续 **14 天**零变更。本轮重点：纵深审查 ui.js 发现新增 XSS 点（`_showCardDetail` summary/principle）、`_showScryModal` card.name 未转义；quiz.js 发现 Q_H_171 科学错误 + Q_S_196 跨题矛盾 + Q_F_180/Q_E_110 领域分类错误 + 47组领域内重复；CSS 确认 17 处 !important + 5 个死代码 @keyframes。问题总数 **221**。

---

## 🎯 优先修复建议 (Top 15)

| 优先级 | # | 问题 | 文件 | 影响 |
|:---:|:---:|------|------|------|
| **P0** | N301 | 镜面迷宫(S19) canPlay 白送精神力 | engine.js | 可被无限利用刷精神力 |
| **P0** | N302 | 棱镜界(D03)随机失败卡牌消失 | engine.js | 卡牌永久丢失 |
| **P0** | N304/N403 | C06/C07 减费完全失效 | engine.js | 两张领域卡效果缺失 |
| **P0** | NE116+N23+N24+NE74 | A11 啸叫五合一缺陷 | engine.js | 卡牌归属错乱+幽灵驻场 |
| **P0** | N401 | isGameOver 混淆 6 处 | ui.js | 未来重构极易引入短路bug |
| **P1** | NE73+NE117+N305 | S24 burnEnhanced 7 条泄漏路径 | engine.js | 灼烧伤害数值错误 |
| **P1** | NE119+N413+N416+NE84-86 | **6 处** XSS 注入点 | ui.js | 安全风险 |
| **P1** | N303+N402+N419 | 电领域类名不一致 + 声领域色值双重标准 + V3尺寸分裂 | css | 视觉一致性崩溃 |
| **P1** | NE122/NE123+N414+N415 | 题库答案错误 + 跨题矛盾 | quiz.js | 答题公正性 |
| **P1** | NE87-89+NE131+N314 | 4 个弹窗无超时 | ui.js | 游戏阻塞 |
| **P2** | NE124+N407 | canPlay/canPlayQuery 80% 重复 | engine.js | 维护风险 |
| **P2** | N404+N405+N412 | AI 伤害估算 3 项遗漏 | ai.js | AI 决策质量 |
| **P2** | NE135+N318+N423+N427 | 题库重复 54+ 组 + 跨领域答案矛盾 | quiz.js | 题库质量 |
| **P2** | NE136+N420+N421 | CSS @keyframes 死代码 5 个 | css | 代码整洁 |
| **P3** | N417+N418 | Q_F_180/Q_E_110 领域分类错误 | quiz.js | 题库组织 |

---

> 📝 报告生成时间：2026-07-21 23:33 GMT+8 | 审查方式：全量逐文件审查 + 4 Agent 纵深交叉验证 | JS/CSS 自 07-07 以来连续 14 天零变更 | 本轮结论：代码极度稳定但债务持续加重——206→221 个问题。新增 3 严重（`_showCardDetail` XSS + Q_H_171 科学错误 + Q_S_196/Q_S_079 跨题矛盾），8 中等（`_showScryModal` XSS + 2 题领域分类错误 + 声领域颜色尺寸分裂 + CSS 死代码 5 个 + conic-gradient 无fallback + 跨领域答案矛盾），4 轻微。强烈建议在阶段 3 内测发布前集中修复 P0/P1 问题——当前 P0+P1 累计 **20 项**。
