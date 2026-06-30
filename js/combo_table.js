/**
 * 物理卡牌对战 v4.0 —— Combo 查找表
 * 
 * 键值格式："此前打出的卡ID→刚才打出的卡ID"
 * 方向重要：S01→A01（先出辅助，再出攻击）才能触发
 * 
 * effect.type 列表（共18种）：
 *   extra_damage              — 追加固定伤害
 *   extra_damage_per_burn     — 每层灼烧追加伤害
 *   extra_damage_per_force_card — 每张力系卡追加伤害
 *   extra_damage_ignore_block — 追加无视防御伤害
 *   extra_burn                — 追加灼烧层数
 *   extra_burn_after_detonate — 引爆后追加灼烧
 *   extra_dot                 — 追加DOT（{dmg, turns}）
 *   extend_dot_turns          — 延长DOT持续回合
 *   boost_dot_increment       — 提升DOT递增幅度
 *   boost_burn_cap            — 提升灼烧上限
 *   boost_burn_dmg            — 提升单层灼烧伤害
 *   boost_mirror_maze         — 提升镜面迷宫概率
 *   boost_clear_debuff        — 清除己方DOT
 *   boost_ignore_defense      — 追加无视防御值
 *   view_hand                 — 查看对方手牌
 *   steal_spirit              — 偷取精神力
 *   heal_hp                   — 恢复HP
 *   modify_flag               — 设置特殊标记
 *   modify_height             — 修改高度加成
 *   set_return_to_hand        — 弹回手牌
 *   modify_card_dmg   — 修改本次卡牌的伤害
 *   modify_height     — 影响A05重力势能蓄能高度
 *   steal_spirit      — 偷取精神力
 *   heal_hp           — 恢复HP
 */
const COMBO_TABLE = {
  // ============ 力领域 (5) ============
  "S01→A01": {
    type: "combo_s01_a01",
    msg: "质量增大→重力锤击：+65伤害",
    effects: [{ type: "extra_damage", value: 65 }]
  },
  "S01→A02": {
    type: "combo_s01_a02",
    msg: "质量增大→惯性冲锋：+40伤害",
    effects: [{ type: "extra_damage", value: 40 }]
  },
  "S01→A05": {
    type: "combo_s01_a05",
    msg: "质量增大→重力势能：每点蓄能高度+15伤害",
    effects: [{ type: "modify_height", perHeight: 15 }]
  },
  "S03→A03": {
    type: "combo_s03_a03",
    msg: "受力面积缩小→压强穿刺：+65伤害",
    effects: [{ type: "extra_damage", value: 65 }]
  },
  "S05→A04": {
    type: "combo_s05_a04",
    msg: "力的合成→杠杆撬击：每张力系攻击+15伤害",
    effects: [{ type: "extra_damage_per_force_card", value: 15, cap: 30 }]
  },

  // ============ 声领域 (6) ============
  "S09升→A09": {
    type: "combo_s09_up_a09",
    msg: "频率调节(升高)→超声清洗：+15伤害",
    effects: [{ type: "extra_damage", value: 15 }]
  },
  "S10→A45": {
    type: "combo_s10_a45",
    msg: "共振蓄能→双耳定位：查看对方全部手牌",
    effects: [{ type: "view_hand", count: "all" }]
  },
  "S09降→A10": {
    type: "combo_s09_down_a10",
    msg: "频率调节(降低)→次声震荡：持续回合+2",
    effects: [{ type: "extend_dot_turns", value: 2 }]
  },
  "S09升→A13": {
    type: "combo_s09_up_a13",
    msg: "频率调节(升高)→驻波共振：+30伤害",
    effects: [{ type: "extra_damage", value: 30 }]
  },
  "S07→A14": {
    type: "combo_s07_a14",
    msg: "回声消声→回声爆破：+30伤害",
    effects: [{ type: "extra_damage", value: 30 }]
  },
  "S08→A10": {
    type: "combo_s08_a10",
    msg: "噪音干扰→次声震荡：每回合递增伤害+3",
    effects: [{ type: "boost_dot_increment", value: 3 }]
  },

  // ============ 光领域 (5) ============
  "S16→A19": {
    type: "combo_s16_a19",
    msg: "光速传播→光纤穿透：+25伤害",
    effects: [{ type: "extra_damage", value: 25 }]
  },
  "A17→A23": {
    type: "combo_a17_a23",
    msg: "红外灼烧→热辐射：灼烧层数+1",
    effects: [{ type: "extra_burn", layers: 1 }]
  },
  "S15→S19": {
    type: "combo_s15_s19",
    msg: "偏振过滤→镜面迷宫：失败概率35%→65%",
    effects: [{ type: "boost_mirror_maze", value: 0.65 }]
  },
  "S14→A55": {
    type: "combo_s14_a55",
    msg: "滤光→凸透引燃：灼烧上限3→5层",
    effects: [{ type: "boost_burn_cap", value: 5 }]
  },
  "S17→A16": {
    type: "combo_s17_a16",
    msg: "光谱叠加→色散分解：A16驻场4回合，未被清场则回手0费重打",
    effects: [{ type: "set_return_to_hand", cardId: "A16" }]
  },

  // ============ 热领域 (5) ============
  "S24→A54": {
    type: "combo_s24_a54",
    msg: "温度升高→爆燃：引爆每层伤害50→65",
    effects: [{ type: "boost_burn_dmg", value: 65 }]
  },
  "S26→A21": {
    type: "combo_s26_a21",
    msg: "热量聚集→烈焰灼蚀：每层灼烧额外+15→+25",
    effects: [{ type: "extra_damage_per_burn", perLayer: 10 }]
  },
  "A22→A24": {
    type: "combo_a22_a24",
    msg: "热对流→熔岩喷发：额外+1层灼烧",
    effects: [{ type: "extra_burn", layers: 1 }]
  },
  "S26→A54": {
    type: "combo_s26_a54",
    msg: "热量聚集→爆燃：引爆后额外+2层灼烧",
    effects: [{ type: "extra_burn_after_detonate", layers: 2 }]
  },
  "A25→A26": {
    type: "combo_a25_a26",
    msg: "蒸发消散→凝固封锁：偷取精神力15→25",
    effects: [{ type: "steal_spirit", value: 10 }]  // A25基值15 + combo增量10 = 总25
  },

  // ============ 电领域 (5) ============
  "S27→A36": {
    type: "combo_s27_a36",
    msg: "电阻屏障→焦耳热击：+25伤害",
    effects: [{ type: "extra_damage", value: 25 }]
  },
  "S28→A40": {
    type: "combo_s28_a40",
    msg: "电磁感应→安培力冲击：+20伤害",
    effects: [{ type: "extra_damage", value: 20 }]
  },
  "S29→A27": {
    type: "combo_s29_a27",
    msg: "静电吸附→闪电劈击：+10伤害",
    effects: [{ type: "extra_damage", value: 10 }]
  },
  "S31→A27": {
    type: "combo_s31_a27",
    msg: "高压击穿→闪电劈击：无视防御20→30",
    effects: [{ type: "boost_ignore_defense", value: 30 }]
  },
  "S33→A49": {
    type: "combo_s33_a49",
    msg: "多路放电→过载放电：触发后不摧毁辅助卡",
    effects: [{ type: "modify_flag", flag: "a49_no_destroy", value: true }]
  },

  // ============ 跨领域 (2) ============
  "A39→A52": {
    type: "combo_a39_a52",
    msg: "光电效应→光电信号：A52伤害+20",
    effects: [{ type: "extra_damage", value: 20 }]
  },
  "A32vsS11": {
    type: "combo_a32_vs_s11",
    msg: "声波推力vs隔音屏障：力系额外40伤害仍生效",
    effects: [{ type: "extra_damage_ignore_block", value: 40 }]
  },

  // ============ 召唤→攻击/辅助 (5) ============
  "C05→A02": {
    type: "combo_c05_a02",
    msg: "牛顿→惯性冲锋：延续伤害+15",
    effects: [{ type: "extra_dot", dmg: 15, turns: 1 }]
  },
  "C10→A14": {
    type: "combo_c10_a14",
    msg: "贝尔→回声爆破：+25伤害",
    effects: [{ type: "extra_damage", value: 25 }]
  },
  "C08→A36": {
    type: "combo_c08_a36",
    msg: "焦耳→焦耳热击：+20伤害",
    effects: [{ type: "extra_damage", value: 20 }]
  },
  "C01→A02": {
    type: "combo_c01_a02",
    msg: "芝诺龟→惯性冲锋：延续回合+1",
    effects: [{ type: "extend_dot_turns", value: 1 }]
  },
  "C03→A45": {
    type: "combo_c03_a45",
    msg: "拉普拉斯妖→双耳定位：查看对方全部手牌",
    effects: [{ type: "view_hand", count: "all" }]
  },

  // ============ 召唤对冲 (1) ============
  "C03↔C04": {
    type: "combo_c03_c04",
    msg: "拉普拉斯妖↔薛定谔的猫：猫不再掷硬币，由玩家选择",
    effects: [{ type: "modify_flag", flag: "c04_choose", value: true }]
  }
};

export { COMBO_TABLE };
