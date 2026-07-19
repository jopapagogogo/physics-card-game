# 物理卡牌对战 — 全量测试结果

> 测试员：独立测试（自动化流程）
> 测试日期：2026-07-20（北京时间）
> 测试环境：Node.js 22.13.0 / Ubuntu 22.04
> 仓库分支：`master`（本地检出，commit 基线 `a9e696c` 全量测试结果 2026-07-19）

## 总览

| 测试套件 | 通过 | 失败 | 告警 | 结果 |
|---|---|---|---|---|
| 全量卡牌测试（test_all_cards.cjs） | 109 | 0 | 4 | ✅ 全部通过 |
| Combo 有效性检查（test_combo_validity.cjs） | 49 | 0 | 0 | ✅ 全部通过 |
| 场景测试（test_scenarios.cjs） | 38 | 0 | 0 | ✅ 全部通过 |

**结论：三大测试套件共 196 项断言，0 失败。代码当前状态健康。**

---

## 1. 全量卡牌测试

- 命令：`NODE_OPTIONS="" node test_all_cards.cjs`
- 总卡牌数：**109 张**
- ✅ 通过：**109 张（100.0%）**
- ❌ 失败：**0 张**
- ⚠️ 跳过：0 张（条件不满足）

### 特殊关注（success=true 但 effects 为空，记为告警而非失败）

以下 4 张 **support** 卡在隔离测试中 `result.success=true` 但未返回任何 effect。在测试框架中仍计为通过，但建议开发侧确认其效果是否需要前置条件（如对位卡牌 / 特定场地状态）才触发：

| 卡牌 | 类型 | 费用 | 备注 |
|---|---|---|---|
| S13 多普勒探测 | support | 8 | 无 effects 返回 |
| S14 滤光 | support | 10 | 无 effects 返回 |
| S32 低压启动 | support | 6 | 无 effects 返回 |
| S34 置换卡 | support | 3 | 无 effects 返回 |

> 说明：上述 4 项均为 **告警（warning）**，不影响总通过率。若产品定义要求这些卡必须显式产出 effect，则需开发侧补充触发条件。

---

## 2. Combo 有效性检查

- 命令：`NODE_OPTIONS="" node test_combo_validity.cjs`
- 总 combo 数：**49**
- ✅ 全部通过（49/49）
- ❌ 失败：0

所有已登记的 combo 在有效性校验下均无冲突、无非法引用、触发条件自洽。

---

## 3. 场景测试

- 命令：`NODE_OPTIONS="" node test_scenarios.cjs`
- ✅ 通过：**38**
- ❌ 失败：**0**

覆盖场景包括但不限于：
- 储能/能量类（S06 弹性储能、S25 潜热释放、T01 能量守恒）
- 高度/势能（A05 重力势能 4 回合释放伤害 ≥160）
- 惯性/做功（A02 惯性冲锋、A08 做功打击）
- 回声/声波联动（A14 回声爆破、S09 频率调节、A11 声压叠加）
- 电系驻场联动（A27/A28/A29/A30/A49 与电辅卡联动、S30 牺牲电辅）
- 光/热/镜面/召唤联动（A50 海市蜃楼、S19 镜面迷宫、A25 蒸发灭驻场、C04/C06 召唤）
- 阶段技（T02 临界突破、T03 熵逆转 HP 互换）

---

## 4. 结果推送状态

> ⚠️ **推送失败（阻塞项）：提供的 SSH 私钥无法被 OpenSSH / OpenSSL 加载。**

| 步骤 | 状态 | 说明 |
|---|---|---|
| 环境初始化（写入 SSH key） | ⚠️ 异常 | 写入的私钥 `~/.ssh/id_ed25519_gitee` 经 `ssh-keygen -y` 解析报 `Load key "...id_ed25519_gitee": error in libcrypto` |
| git clone / pull | ❌ 失败 | `Permission denied (publickey)`，无法向 `git@gitee.com:jopapa/physics-card-game.git` 认证 |
| 运行三个测试 | ✅ 成功 | 使用本地已检出的仓库代码完成（见上方结果） |
| git commit / push | ❌ 未完成 | 因私钥损坏，无法认证，推送受阻 |

### 根因分析

- 私钥 base64 主体可正常解码（共 249 字节），但其内部 OPENSSH 私钥结构在头部类型字段处解析异常，`ssh-keygen` 与 `libcrypto` 均拒绝加载。
- 该密钥非有效可加载的 ed25519 私钥，因此无法用于 gitee.com 的 publickey 认证。

### 处置建议（需用户/管理员操作）

1. **更换有效密钥**：提供一份由 `ssh-keygen -t ed25519` 生成的、且对应 gitee 账户已添加公钥的私钥。
2. 或在本地环境中预置已验证可用的部署密钥。
3. 修复密钥后，重新执行：`git pull && node test_all_cards.cjs && node test_combo_validity.cjs && node test_scenarios.cjs`，再将本 `test_result.md` 提交并推送。

> 注：本次三个测试已在**本地现有检出代码**上完整运行并产出结果；因密钥问题导致无法从远端拉取最新代码，测试结果基于本地 `master@a9e696c`。若远端自上次提交后有更新，建议修复密钥后重新拉取并复测，以确保结果反映最新代码。

---

## 附录：本文件为本次测试唯一新增/修改的产物

- 新增：`test_result.md`（本文件，汇总报告）
- 测试脚本自动生成的产物：`test_all_cards_result.txt`（由 `test_all_cards.cjs` 写入，非本次测试员手动编辑）
- 游戏源码（*.js / *.json / *.html 等）**未做任何修改**。
