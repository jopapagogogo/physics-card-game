---
name: physics-card-game
description: 物理卡牌对战游戏项目铁律和开发规范。当进入本项目进行任何开发、审查、代码修改时必须先读取此技能。包含工作规则、卡牌数据规范、验证流程、项目架构和阶段规划。
---

# 物理卡牌对战 — 项目铁律

## 项目定位

初中物理五大领域（力/声/光/热/电）卡牌对战游戏。开发者为零技术基础的物理教师，所有代码由 AI agent 生成。技术栈：原生 HTML/CSS/JS，无框架。

## 仓库

- 仓库：git@gitee.com:jopapa/physics-card-game.git
- 分支：master
- SSH 密钥：~/.ssh/id_ed25519_gitee

## 工作规则（铁律）

1. `js/cards.js` 是唯一的卡牌数据权威源，任何卡牌效果/数值/属性必须从该文件读取原文
2. 引擎实现效果时，effect 属性名必须直接使用 cards.js 中的字段名，禁止自行定义别名
3. `approved_cards.json` 是卡牌→插画的唯一映射，未审核确认不得写入
4. 插画配对唯一依据是 approved_cards.json，不允许根据文件名自动猜测
5. 工作资料三级分区：Confirmed / Pending / Deprecated
6. 开工前 `git pull`，收工后 `git add -A && git commit && git push`
7. pull 后必须读 PROJECT_STATUS.md「当前待办」区域，为空时不自行推断任务
8. 「先 Mock 后游戏」：任何 CSS/视觉改动，先在独立 HTML 页面验证通过，再应用到游戏代码
9. 「单文件单功能」：每次只改一个文件的一个功能，改完立刻测试
10. 「API 先验证」：调用任何引擎/库方法前，用 `node -e` 脚本确认方法存在且参数正确
11. 「失败必追问」：测试失败后不立即改代码，先分析根因，记录后再动手

## 关键文件

| 文件 | 用途 |
|------|------|
| js/cards.js | 109 张卡牌数据（唯一权威源） |
| js/engine.js | 核心战斗引擎 |
| js/combo_table.js | 35 个 combo 查找表 |
| js/ai.js | AI 对手逻辑 v2.0 |
| js/ui.js | 界面控制器 |
| js/quiz.js | 物理题库 190 题 |
| js/runes.js | 6 领域符文 |
| css/game.css | 游戏主样式 |
| approved_cards.json | 卡牌→插画映射 |
| PROJECT_STATUS.md | 项目进度和待办 |
| GAME_RULES.md | 游戏规则 |
| AI_CONTEXT.md | 完整上下文参考 |

## 游戏核心数值

| 属性 | 数值 |
|------|------|
| 初始/最大 HP | 1200 |
| 初始/最大精神力 | 50 / 100 |
| 每回合精神力恢复 | 10 |
| 手牌上限 | 7 |
| 每回合抽牌 | 3 |
| 召唤物上限 | 2 |

## 领域颜色

| 领域 | 颜色 |
|------|------|
| 力 | #E74C3C |
| 声 | #16A085 |
| 光 | #F39C12 |
| 热 | #E67E22 |
| 电 | #9B59B6 |
| 混沌 | #7B2FBE |

## 稀有度配色

| 稀有度 | 边框色 |
|--------|--------|
| common | 灰蓝 #5a6675 |
| rare | 铜橙 #c47a38 |
| epic | 紫 #8868a8 |
| legendary | 金 #d49030 |
| mythic | 彩虹动效 conic-gradient |

## 验证流程

| 改了什么 | 必跑验证 |
|------|------|
| engine.js | `node -c` + `node verify/check-api.cjs` + `node verify/check-gameplay.mjs` |
| cards.js | `node -c` + `node verify/check-cards.cjs` + `node verify/check-gameplay.mjs` |
| ui.js / CSS | `node -c` + 浏览器实测 `node serve.cjs` |
| 任何 .js | `node -c` 语法检查 |
| 提交前 | `node verify/check-all.cjs` 必须全绿 |

## 本地启动

```bash
node serve.cjs   # 启动服务器 → http://localhost:8080
```

## 项目阶段

当前处于 **阶段 1：视觉打磨**（P0-P3 四个 UI 遗留问题）。

详细阶段规划见 PROJECT_STATUS.md 的「项目阶段规划」表格。
