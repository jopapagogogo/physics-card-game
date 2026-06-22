# AI_CONTEXT.md — 给新 AI 助手的完整上下文

> ⚠️ 开工前必须读完本文档全部内容。这是项目的「宪法」，所有规则必须严格遵守。

---

## 一、项目铁律（违反 = 重做）

### 1. 卡牌数据铁律
- **`js/cards.js` 是唯一的卡牌数据权威源**。任何关于卡牌效果、数值、属性的讨论或决策，必须先读该文件原文。
- 涉及多张卡时，用脚本从 cards.js 提取数据，禁止凭印象/记忆/脑补描述卡牌效果。
- `RARITY_CLASSIFICATION.md` 通过脚本从 cards.js 自动生成，不得手动编辑。
- **引擎实现卡牌效果时，effect 属性名必须直接使用 cards.js 中的字段名**，禁止自行定义别名。
- 改动 cards.js 后必须检查 engine.js 是否同步对应。

### 2. 测试隔离铁律
- `baseline/`：只读快照，永远不改文件。
- `test_v2/`：新改动在这里做，用户确认后合并到游戏根目录。
- 合并后立刻 `git tag` 打语义化版本号。

### 3. 模板先确认铁律
- 任何涉及**卡牌外观/布局/颜色/字体**的决策，必须先做模板 → 用户确认 → 再写游戏代码。
- 模板 CSS 类名（`.card`/`.cost-gem`）和游戏 CSS 类名（`.card-v3`/`.v3-cost`）是一一对应的，改模板的同时必须同步游戏。
- 跳过任一步骤不改代码。

### 4. 服务启动铁律
- 所有目录放一个 `serve.cjs` 用 CommonJS，永远 `node serve.cjs` 启服务。
- 不依赖 `package.json` 的 `"type": "module"`。

### 5. 提交标记铁律
- 每完成一个阶段，打 `vX.Y-描述` 格式的 git tag。
- 先 `git tag` 再 `git push --tags`。

### 6. 持续改进规则
- 每次发现错误后，必须追问根因，新增一条规则写入 PROJECT_STATUS.md，防止同类错误再次发生。

### 7. 工作流程规则
- 开工前 `git pull`，收工后 `git add -A && git commit && git push`。
- 先更新 PROJECT_STATUS.md，再 commit + push。

---

## 二、游戏规则（详见 GAME_RULES.md）

| 属性 | 数值 |
|------|------|
| 初始 HP | 1200 |
| 初始精神力 | 50 |
| 每回合精神力恢复 | 10 |
| 每回合抽牌 | 3 |
| 手牌上限 | 7（超过要弃牌）|
| 召唤物上限 | 2 |

**回合流程**：开始阶段（灼烧/麻痹/DOT 结算）→ 答题阶段（3 道物理题）→ 出牌阶段 → 弃牌阶段

**领域**：力(红)/声(绿)/光(橙)/热(暖橙)/电(紫)/混沌(紫)，主副领域各选一。

---

## 三、引擎 API（engine.js）

### 构造函数
```js
new GameEngine(playerDeckIds, aiDeckIds, playerMainDomain, playerSubDomain, aiMainDomain, aiSubDomain)
// deckIds 是 30 个卡牌 ID 的数组
// domain 是中文字符串 '力'/'声'/'光'/'热'/'电'
```

### 回合流程
```js
engine.startTurn()        // 开始回合（处理灼烧/麻痹/DOT，恢复精神力，抽 3 张牌）
engine.startQuizPhase()   // 进入答题阶段
engine.setQuizResult(correct, total)  // 设置答题结果
engine.startPlayPhase()   // 进入出牌阶段
engine.canPlay(playerIdx, card)       // → { can: boolean, reason: string }
engine.playCard(playerIdx, cardId, target)  // → { success, msg, effects }
engine.settlePhase()      // 结算阶段
engine.discardPhase(indices)  // 弃牌（传入手牌 index 数组）
engine.endTurn()          // 结束回合（切换 currentPlayer）
engine.isGameOver()       // → boolean
engine.getGameState()     // → 见下方状态结构
```

### getGameState() 返回结构
```js
{
  players: [{
    hp: 1200, maxHp: 1200,
    spirit: 50,
    hand: [{ id, name, type, domain, cost, description, effect, rarity }],
    handSize: 7, deckSize: 25, discardSize: 0,
    fieldSummons: [{ card, hp }],
    fieldDomain: { card, turnsRemaining } | null,
    fieldSupports: [{ card, turnsRemaining }],
    burnLayers: 0, paralysis: 0, dotEffects: [],
    domain: { main: '力', sub: '电' },
    turnBlocked: false, extraCost: 0
  }, { /* 同上，当前对手 */ }],
  currentPlayer: 0,  // 0=玩家, 1=AI
  turnNumber: 1,
  phase: 'draw'|'quiz'|'play'|'settle'|'discard',
  quizResult: { correct, total, bonus },
  gameOver: false, winner: null
}
```

### 卡牌数据结构（cards.js）
```js
{
  id: 'A01', name: '重力锤击', type: 'attack',
  domain: ['力'], cost: 12, rarity: 'common',
  description: '...',
  effect: { dmg: 75 }  // 攻击卡的伤害在 effect.dmg
}
```

### QuizSystem API
```js
const quiz = new QuizSystem();
const questions = quiz.generateRound(mainDomain, subDomain);  // → [3 questions]
// question: { id, question, options:['A...','B...','C...','D...'], answer: 0-3, difficulty, relatedCard }
const result = quiz.checkAnswer(questionId, answerIndex);  // → { correct, knowledge }
const bonus = quiz.getQuizBonus(correctCount);  // → 精神力奖励值
```

### AIEngine API
```js
const ai = new AIEngine(engine, difficulty);  // difficulty: 'easy'|'normal'|'hard'
const decisions = ai.makePlayDecision(playerIdx);  // → [{ cardId, target }, ...]
const quiz = ai.simulateQuiz();  // → { correct, total }
```

### DOMAIN_RUNES (runes.js)
```js
DOMAIN_RUNES = { '力': 'data:image/png;base64,...', '声': '...', '光': '...', '热': '...', '电': '...', '混沌': '...' }
// 6 个领域的符文图标（base64 PNG/SVG），直接作为 <img src>
```

### COMBO_TABLE (combo_table.js)
```js
COMBO_TABLE = [
  { aid: 'S01', bid: 'A01', type: 'extra_damage', value: 20, ... },
  // 35 个 combo
]
```

---

## 四、卡牌视觉设计规范

### 完整卡牌尺寸（来自 card_template.html）
- 宽度：**380px**（`min-width:380px; max-width:380px`）
- 高宽比：**1:1.43**（对齐万智牌/炉石标准）
- art-frame 高度：340px
- card-desc-box 高度：90px

### DOM 结构
```
card-set > card > header(cost-gem + title-bar + domain-rune) + type-ribbon + art-frame(4 corners) + ornate-divider + card-stats + card-desc-box(card-desc + card-principle)
```

### 稀有度配色（用 ::before 渐变边框实现）
| 稀有度 | 边框色 |
|--------|--------|
| common | 灰蓝 #5a6675 |
| rare | 铜橙 #c47a38 |
| epic | 紫 #8868a8 |
| legendary | 金 #d49030 |
| mythic | 彩虹动效 conic-gradient |

### 领域颜色（仅用于费用宝石和符文区，不影响主边框）
| 领域 | 颜色 |
|------|------|
| 力 | #E74C3C |
| 声 | #16A085 |
| 光 | #F39C12 |
| 热 | #E67E22 |
| 电 | #9B59B6 |
| 混沌 | #7B2FBE |

---

## 五、卡牌插画

- `approved_cards.json` 是卡牌 ID → 插画文件名的唯一映射
- 插画文件名在 `approved_cards.json` 中，实际图片可能在 `art_samples/card_art/` 目录
- 未在 approved_cards.json 中确认的图片不可使用

---

## 六、当前待解决的需求（优先级从高到低）

### P0：手牌卡牌比例修复
- 当前 mini 卡宽度 128px，内联高度 200px（高宽比 ≈ 1:1.56）
- **要求**：mini 卡应为 1:1.43 高宽比，hover 后（scale 1.15）也保持 1:1.43
- 之前的 AI 尝试了 aspect-ratio、固定高度、移除 inline height 等方案均失败
- 根本原因可能是 flex 容器或子元素内容撑开了高度

### P1：稀有度边框替换领域色边框
- 当前手牌卡边框按领域颜色（力=红、声=绿等）显示
- **要求**：边框按稀有度显示不同颜色
- 需要给手牌卡 DOM 添加 `card.rarity` 类名（common/rare/epic/legendary/mythic）
- CSS 中需添加对应的 `::before` 渐变边框

### P2：hover 卡牌被遮挡
- 手牌 hover 放大时被上方战场区域裁剪
- 根因是 `.battle-grid` 的 `overflow:hidden`
- 改 `overflow-x:hidden; overflow-y:visible` 且手牌区需 `z-index` 高于战场区

### P3：界面布局重构（用户新需求）
```
┌──────────────────────────────────────┐
│  AI 对手区（ABC三区等高）              │
│  [墓地] [手牌+角色+召唤物] [牌组]      │
├──────────────────────────────────────┤
│  对手 D区（驻场卡+领域卡）              │
├──────────────────────────────────────┤
│  ═══ 倒计时条 → ═══ [结束回合]         │
├──────────────────────────────────────┤
│  己方 D区（驻场卡+领域卡）              │
├──────────────────────────────────────┤
│  己方 玩家区（ABC三区等高）            │
│  [墓地] [角色(圆)+召唤物(右) 手牌(下)] [牌组] │
└──────────────────────────────────────┘
```
- A区：手牌扇形成圆形下方，圆形玩家角色在左，召唤物（≤2）在角色右侧
- B区（墓地）：只显示最上方一张卡
- C区（牌组）：显示卡牌背面
- D区：领域卡在最左，驻场卡从左到右排列
- 三个区域等高
- 对手区与己方区镜像对称

### 其他待解决
- 完整的 Combo 效果类型（7 种，推迟到 Phase 4）
- 召唤物/领域卡被动效果
- UI 高亮和动画优化

---

## 七、开发原则

1. **先读懂所有代码再动手**——不要凭猜测写 API 调用
2. **一次只改一个文件的一个功能**——不要批量修改
3. **改完立刻跑 node -c 验证**——语法不对不能继续
4. **用户确认一个功能后再做下一个**——不要一口气改多个
5. **做 template/visual mock 先给用户看**——设计决策不能自作主张
6. **不要盲目自信**——不确定就问，不要猜
