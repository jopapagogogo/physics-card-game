# 卡牌速查表

> 由自动化生成，供 AI 快速查阅。数据源：js/cards.js

## 力 (16)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A01 | 重力锤击 | attack | 12费 common | dmg:75 | G=mg |
| A02 | 惯性冲锋 | attack | 14费 common | dmg:50, inertiaCarry:true, carryRatio:0.5, nextCarryRatio:0.5 | 惯性定律 |
| A03 | 压强穿刺 | attack | 16费 common | dmg:80, ignoreDefense:true | P=F/S |
| A04 | 杠杆撬击 | attack | 10费 common | dmg:50, perSupportBonus:30 | F1L1=F2L2 |
| A05 | 重力势能 | attack | 14费 rare | dmg:40, heightBonus:40, maxTurns:4, triggerThreshold:200, isFieldCard:true | Ep=mgh |
| A06 | 动能冲击 | attack | 16费 common | dmg:60, dotDmg:30, dotTurns:2 | Ek=1/2mv² |
| A08 | 做功打击 | attack | 15费 common | dmg:50, hpLossBonus:0.1 | W=Fs |
| S01 | 质量增大 | support | 5费 common | nextForceBonus:10 | G=mg |
| S02 | 能量蓄积 | support | 5费 common | nextForceBonus:18 | Ek=1/2mv² |
| S03 | 受力面积缩小 | support | 5费 common | nextAtkBonus:10 | P=F/S |
| S04 | 摩擦阻碍 | support | 12费 common | forceDefense:25, turns:2 | 摩擦力 |
| S05 | 力的合成 | support | 8费 rare | stackingForceDmg:10, maxStacking:30 | 力的合成 |
| S06 | 弹性储能 | support | 10费 rare | energyStore:0.3, maxStore:300, releaseRatio:0.5, maxTurns:4, isFieldCard:true | Ep=1/2kx² |
| D01 | 力之领域·引力场 | domain | 20费 rare | forceDmgBonus:25, forceDotBonus:5, turns:3 | 引力场 |
| C05 | 牛顿 | summon | 22费 epic | forceDmgBonus:20 | F=ma |
| C06 | 阿基米德 | summon | 22费 legendary | supportCostReduction:4, forceSupportExtra:2 | 杠杆原理 |

## 声 (16)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A09 | 超声清洗 | attack | 15费 common | dmg:55, destroyField:true | 超声波空化 |
| A10 | 次声震荡 | attack | 20费 rare | dmg:45, dotSequence:[15,25,35,45,55], isFieldCard:true | 次声共振 |
| A11 | 啸叫 | attack | 18费 epic | dmg:25, applyOnCast:1, applyPerTurn:1, maxStacks:3, sonicDmgPerStack:10, detonateDmg:60 | 声反馈 |
| A13 | 驻波共振 | attack | 16费 common | dmg:70, perSoundFieldBonus:25 | 驻波叠加 |
| A14 | 回声爆破 | attack | 13费 common | dmg:0, delayedDmg:100, delayTurns:1 | 回声延迟 |
| A45 | 双耳定位 | attack | 12费 common | dmg:50, viewHand:2 | 双耳效应 |
| S07 | 回声消声 | support | 10费 rare | viewHand:2, clearDebuff:1 | 主动降噪 |
| S08 | 噪音干扰 | support | 8费 common | opponentExtraCost:5, turns:1 | 噪声污染 |
| S09 | 频率调节 | support | 5费 common | choice:{"high":{"soundBonus":20},"low":{"allSoundBonus":5,"extendTurns":2}} | 频率调节 |
| S10 | 共振蓄能 | support | 5费 common | spiritRestore:10, soundBonusSpirit:5 | 共振 |
| S11 | 隔音屏障 | support | 16费 rare | soundDefense:35, turns:2 | 隔音 |
| S12 | 聚焦声束 | support | 11费 common | nextSoundBonus:20, antiBarrier:10 | 声波聚焦 |
| S13 | 多普勒探测 | support | 8费 common | scry:5 | 多普勒效应 |
| D02 | 声之领域·共鸣场 | domain | 20费 rare | perSoundFieldBonus:8, turns:4 | 共鸣 |
| C10 | 贝尔 | summon | 26费 legendary | viewHand:1, soundDmgBonus:10 | 电话原理 |
| C12 | 赫兹 | summon | 24费 epic | soundDmgBonus:8, soundSupportExtend:1 | 频率 |

## 光 (18)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A15 | 激光切割 | attack | 25费 common | dmg:120 | 激光特性 |
| A16 | 色散分解 | attack | 20费 rare | dmg:40, dotDmg:40, dotTurns:4, returnOnSurvive:true, isFieldCard:true | 色散 |
| A17 | 红外灼烧 | attack | 15费 common | dmg:48, burn:1 | 红外线热效应 |
| A18 | 紫外灭杀 | attack | 16费 common | dmg:50, destroyField:true | 紫外线杀菌 |
| A19 | 光纤穿透 | attack | 18费 common | dmg:100, ignoreDefense:true | 全反射 |
| A20 | 日光暴晒 | attack | 16费 common | dmg:80, clearDebuff:1, perSupportBonus:20 | 太阳辐射 |
| A46 | 折射偏转 | attack | 17费 common | dmg:70, bounceField:true | 光的折射 |
| S14 | 滤光 | support | 10费 common | filterDomain:true, costReduction:3 | 滤光 |
| S15 | 偏振过滤 | support | 14费 common | polarize:true | 偏振 |
| S16 | 光速传播 | support | 14费 rare | lightSpeed:true, turns:2, extraCost:3 | 光速 |
| S17 | 光谱叠加 | support | 8费 common | spectrum:true, perDomain:10 | 光谱叠加 |
| S18 | X射线透视 | support | 14费 rare | viewHand:"all", discardOpponent:1 | X射线 |
| S19 | 镜面迷宫 | support | 16费 epic | mirrorMaze:true, tries:3, failChance:0.35, isFieldCard:true | 平面镜反射 |
| S20 | 影子束缚 | support | 10费 rare | shadowBind:true, turns:2 | 光的直线传播 |
| S21 | 凸透成像 | support | 12费 epic | convexLens:{"realImage":{"restoreHp":1.5},"virtualImage":{"copyEffect":1.2,"extraCost":0.5}} | 凸透镜成像 |
| D03 | 光之领域·棱镜界 | domain | 20费 rare | opponentFailChance:0.2, turns:3 | 棱镜折射 |
| C09 | 伽利略 | summon | 26费 epic | lightDmgBonus:8, perSupportLightBonus:3 | 望远镜 |
| C11 | 惠更斯 | summon | 22费 legendary | dodgeChance:0.2, lightDmgBonus:10 | 惠更斯原理 |

## 光/热 (3)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A55 | 凸透引燃 | attack | 12费 common | dmg:38, perSupportBurn:1, maxBurn:3 | 凸透镜聚焦 |
| A41 | 太阳能聚变 | attack | 28费 epic | dmg:140, heatDomainBonus:70 | 太阳能 |
| A50 | 海市蜃楼 | attack | 20费 rare | dmg:80, mirageTurns:4, mirageChance:0.3 | 光的折射(热空气) |

## 热 (16)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A21 | 烈焰灼蚀 | attack | 15费 rare | dmg:80, perBurnBonus:15 | 热传导 |
| A22 | 热对流 | attack | 14费 rare | dmg:65, burn:1, bounceHand:1 | 热对流 |
| A23 | 热辐射 | attack | 20费 common | dmg:80, burn:1 | 热辐射 |
| A24 | 熔岩喷发 | attack | 18费 rare | dmg:70, burn:2, spiritDebuff:-3, debuffTurns:2 | 火山喷发 |
| A25 | 蒸发消散 | attack | 17费 rare | dmg:65, burn:1, stealSpirit:15, destroyField:true | 蒸发 |
| A26 | 凝固封锁 | attack | 0费 epic | dmg:60, consumeBurn:2, turnBlock:true | 凝固放热 |
| A47 | 升华爆散 | attack | 18费 common | dmg:63, burn:1, heal:30 | 升华吸热 |
| A54 | 爆燃 | attack | 12费 epic | dmg:40, detonateBurn:true, perBurnDmg:50 | 热膨胀 |
| S22 | 比热护盾 | support | 14费 rare | burnImmune:true, turns:3 | 比热容 |
| S23 | 热机驱动 | support | 0费 common | consumeBurn:2, spiritRestore:15 | 热机 |
| S24 | 温度升高 | support | 6费 common | burnEnhancePerDmg:36, turns:3 | 温度升高 |
| S25 | 潜热释放 | support | 0费 epic | consumeBurn:2, heal:80, clearDebuff:1 | 潜热 |
| S26 | 热量聚集 | support | 10费 common | burn:3 | 热传递 |
| D04 | 热之领域·熵增域 | domain | 20费 rare | perBurnBonus:4, extraBurn:1, turns:3 | 熵增 |
| C08 | 焦耳 | summon | 26费 legendary | heatDmgBonus:12, spiritPerTurn:2 | 焦耳定律 |
| C13 | 瓦特 | summon | 24费 epic | heatDmgBonus:8, perBurnBonus:3 | 功率 |

## 电 (16)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A27 | 闪电劈击 | attack | 10费 rare | dmg:30, triggerElectric2:{"ignoreDefense":20,"bonusDmg":20} | 高压击穿 |
| A28 | 雷暴链击 | attack | 9费 rare | dmg:30, triggerElectric1:{"chainPerSupport":15} | 链式放电 |
| A30 | 电磁脉冲 | attack | 10费 rare | dmg:30, triggerElectric2:{"destroyField":true,"bonusDmg":15} | 电磁脉冲 |
| A44 | 火花放电 | attack | 8费 common | dmg:30 | 放电现象 |
| A48 | 静电爆发 | attack | 8费 common | dmg:30, afterElectricDmg:25 | 静电放电 |
| A49 | 过载放电 | attack | 10费 common | dmg:30, triggerElectric3:{"doubleDmg":true,"destroyElectricSupport":1} | 过载原理 |
| S27 | 电阻屏障 | support | 10费 common | electricDefense:20, turns:3 | 欧姆定律 |
| S28 | 电磁感应 | support | 6费 common | spiritPerTurn:2, perElectricCard:2, turns:3 | 电磁感应 |
| S29 | 静电吸附 | support | 8费 common | discard:1, draw:2, clearDebuff:1 | 静电 |
| S30 | 短路开关 | support | 6费 rare | sacrificeElectricSupport:1, perElectricAtkBonus:20 | 短路 |
| S31 | 高压击穿 | support | 10费 common | ignoreElectricDefense:20, turns:3 | 高压击穿 |
| S32 | 低压启动 | support | 6费 common | reduceElectricCost:3 | 低压启动 |
| S33 | 多路放电 | support | 6费 common | reduceAllElectricCost:2 | 并联电路 |
| D05 | 电之领域·电磁域 | domain | 20费 rare | paralysisBonusDmg:25, turns:3 | 电磁场 |
| C07 | 欧姆 | summon | 26费 legendary | electricCostReduction:6 | 欧姆定律 |
| C14 | 安培 | summon | 24费 epic | electricDmgBonus:8, perParalysisBonus:2 | 电流 |

## 电/热 (2)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A29 | 电弧灼烧 | attack | 9费 common | dmg:30, triggerElectric1:{"bonusDmg":20} | Q=I²Rt |
| A35 | 短路熔毁 | attack | 20费 epic | dmg:80, destroySummon:true | Q=I²Rt短路 |

## 声/力 (3)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A31 | 共振爆破 | attack | 20费 epic | dmg:50, perOppFieldCard:55 | 共振 |
| A32 | 声波推力 | attack | 15费 common | dmg:80, forceDomainBonus:40 | 声波是机械波 |
| A33 | 冲击波 | attack | 19费 epic | dmg:100, opponentExtraCost:3 | 冲击波 |

## 热/力 (1)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A34 | 摩擦生热 | attack | 15费 rare | dmg:60, burn:1, stealSpirit:20 | Q=fs |

## 力/热 (1)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A43 | 活塞压缩 | attack | 13费 common | dmg:41, burn:1, opponentExtraCost:5 | 压缩升温 |

## 热/电 (2)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A36 | 焦耳热击 | attack | 18费 rare | dmg:57, burnPerParalyze:1, bonusDmgPerPair:15 | Q=I²Rt |
| A37 | 漏电灼伤 | attack | 14费 common | dmg:44, burn:1 | 漏电发热 |

## 光/力 (1)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A38 | 光压推击 | attack | 15费 rare | dmg:70, bounceField:true, fallbackBounceHand:true | 光压 |

## 光/电 (2)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A39 | 光电效应 | attack | 18费 rare | dmg:80, dualDomain:{"from":"光","to":"电"} | 光电效应 |
| A52 | 光电信号 | attack | 18费 rare | dmg:60, viewHand:"all" | 光电转换 |

## 力/电 (1)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A40 | 安培力冲击 | attack | 16费 rare | dmg:50, domainBonus:35 | 安培力 |

## 电/声 (1)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A42 | 电声轰鸣 | attack | 16费 rare | dmg:80, halveSpiritRecovery:true | 电声转换 |

## 热/声 (1)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A51 | 声速激增 | attack | 16费 common | dmg:70, perBurnNextSound:6 | v=331+0.6t |

## 声/光 (1)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| A53 | 镜面回声 | attack | 18费 common | dmg:70, soundLightBonus:10 | 波的反射 |

## 混沌 (8)
| ID | 名称 | 类型 | 费用 | 效果 | 公式 |
|----|------|------|------|------|------|
| S34 | 置换卡 | support | 3费 rare | replaceHand:true | 控制变量法 |
| C01 | 芝诺龟 | summon | 22费 mythic | halveFirstAttack:true | 芝诺悖论 |
| C02 | 麦克斯韦妖 | summon | 25费 mythic | spiritPerTurn:9, spiritPerCard:2, overflowHeal:30 | 麦克斯韦妖 |
| C03 | 拉普拉斯妖 | summon | 25费 mythic | scryOpponent:5 | 拉普拉斯妖 |
| C04 | 薛定谔的猫 | summon | 28费 mythic | schrodinger:true, dmg:100, heal:100, overflowSpirit:30 | 量子叠加 |
| T01 | 能量守恒 | phase | 30费 legendary | hpToSpirit:0.3, maxSpiritGain:60 | 能量守恒 |
| T02 | 临界突破 | phase | 25费 legendary | doubleDmg:true | 临界态 |
| T03 | 熵逆转 | phase | 28费 legendary | swapHP:true, selfSpiritZero:true, oppSpiritFull:true | 熵逆转 |
