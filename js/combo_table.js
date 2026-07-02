/**
 * 物理卡牌对战 v4.0 —— Combo 查找表
 * 
 * 键值格式："此前打出的卡ID→刚才打出的卡ID"
 * 方向重要：S01→A01（先出辅助，再出攻击）才能触发
 * 
 * effect.type 列表（实际使用 17 种）：
 *   extra_damage              — 追加固定伤害
 *   extra_damage_per_burn     — 每层灼烧追加伤害
 *   extra_damage_per_force_card — 每张力系卡追加伤害
 *   extra_damage_ignore_block — 追加无视防御伤害
 *   extra_burn                — 追加灼烧层数
 *   extra_burn_after_detonate — 引爆后追加灼烧
 *   extra_dot                 — 追加DOT
 *   extend_dot_turns          — 延长DOT持续回合
 *   boost_dot_increment       — 提升DOT递增幅度
 *   boost_burn_cap            — 提升灼烧上限
 *   boost_burn_dmg            — 提升单层灼烧伤害
 *   boost_mirror_maze         — 提升镜面迷宫概率
 *   boost_ignore_defense      — 追加无视防御值
 *   view_hand                 — 查看对方手牌
 *   steal_spirit              — 偷取精神力
 *   modify_flag               — 设置特殊标记
 *   modify_height             — 修改高度加成
 */
const COMBO_TABLE = {
  // ============ 力领域 (8) ============
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
    msg: "质量增大→重力势能：每层高度蓄能额外+15伤害",
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
  "S02→A08": {
    type: "combo_s02_a08",
    msg: "能量蓄积→做功打击：储存动能释放，W=Fs，+25伤害",
    effects: [{ type: "extra_damage", value: 25 }]
  },
  "S02→A06": {
    type: "combo_s02_a06",
    msg: "能量蓄积→动能冲击：蓄力后冲击释放，+20伤害",
    effects: [{ type: "extra_damage", value: 20 }]
  },
  "S06→A04": {
    type: "combo_s06_a04",
    msg: "弹性储能→杠杆撬击：弹力势能释放经杠杆放大，+25伤害",
    effects: [{ type: "extra_damage", value: 25 }]
  },

  // ============ 声领域 (7) ============
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
  "S08→A10": {
    type: "combo_s08_a10",
    msg: "噪音干扰→次声震荡：每回合递增伤害+3",
    effects: [{ type: "boost_dot_increment", value: 3 }]
  },
  "S12→A13": {
    type: "combo_s12_a13",
    msg: "聚焦声束→驻波共振：聚焦能量形成强驻波干涉，+30伤害",
    effects: [{ type: "extra_damage", value: 30 }]
  },
  "A32→A31": {
    type: "combo_a32_a31",
    msg: "声波推力→共振爆破：先推后震，共振放大振幅，+15伤害",
    effects: [{ type: "extra_damage", value: 15 }]
  },

  // ============ 光领域 (7) ============
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
  "S18→A18": {
    type: "combo_s18_a18",
    msg: "X射线透视→紫外灭杀：电磁波短波段连续打击，+20伤害",
    effects: [{ type: "extra_damage", value: 20 }]
  },
  "A50→A19": {
    type: "combo_a50_a19",
    msg: "海市蜃楼→光纤穿透：折射→全反射，光传播控制升级，+25伤害",
    effects: [{ type: "extra_damage", value: 25 }]
  },
  "S17→A20": {
    type: "combo_s17_a20",
    msg: "光谱叠加→日光暴晒：各色光合成全光谱辐射，+20伤害",
    effects: [{ type: "extra_damage", value: 20 }]
  },

  // ============ 热领域 (9) ============
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
    msg: "蒸发消散→凝固封锁：偷取精神力+10(总25)",
    effects: [{ type: "steal_spirit", value: 10 }]
  },
  "S25→A47": {
    type: "combo_s25_a47",
    msg: "潜热释放→升华爆散：相变潜热驱动升华，+20伤害",
    effects: [{ type: "extra_damage", value: 20 }]
  },
  "S23→A47": {
    type: "combo_s23_a47",
    msg: "热机驱动→升华爆散：热机做功驱动相变，+25伤害",
    effects: [{ type: "extra_damage", value: 25 }]
  },
  "A21→A23": {
    type: "combo_a21_a23",
    msg: "烈焰灼蚀→热辐射：热传导转为热辐射，额外+1灼烧",
    effects: [{ type: "extra_burn", layers: 1 }]
  },
  "S22→A25": {
    type: "combo_s22_a25",
    msg: "比热护盾→蒸发消散：热容量防御后汽化反击，+20伤害",
    effects: [{ type: "extra_damage", value: 20 }]
  },

  // ============ 电领域 (8) ============
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
  "S30→A35": {
    type: "combo_s30_a35",
    msg: "短路开关→短路熔毁：主动短路触发熔毁，+30伤害",
    effects: [{ type: "extra_damage", value: 30 }]
  },
  "S32→A44": {
    type: "combo_s32_a44",
    msg: "低压启动→火花放电：低压回路击穿空气，+15伤害",
    effects: [{ type: "extra_damage", value: 15 }]
  },
  "A27→A28": {
    type: "combo_a27_a28",
    msg: "闪电劈击→雷暴链击：高电压击穿触发链式放电，+20伤害",
    effects: [{ type: "extra_damage", value: 20 }]
  },

  // ============ 跨领域 (3) ============
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
  "S28→A42": {
    type: "combo_s28_a42",
    msg: "电磁感应→电声轰鸣：感应电流驱动电声转换，+25伤害",
    effects: [{ type: "extra_damage", value: 25 }]
  },

  // ============ 召唤→攻击 (7) ============
  "C05→A02": {
    type: "combo_c05_a02",
    msg: "牛顿→惯性冲锋：延续伤害+15",
    effects: [{ type: "extra_dot", dmg: 15, turns: 1 }]
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
  "C06→A04": {
    type: "combo_c06_a04",
    msg: "阿基米德→杠杆撬击：给我一个支点，+25伤害",
    effects: [{ type: "extra_damage", value: 25 }]
  },
  "C12→A13": {
    type: "combo_c12_a13",
    msg: "赫兹→驻波共振：频率发现者应用驻波，+20伤害",
    effects: [{ type: "extra_damage", value: 20 }]
  },
  "C09→A46": {
    type: "combo_c09_a46",
    msg: "伽利略→折射偏转：望远镜光学先驱，+20伤害",
    effects: [{ type: "extra_damage", value: 20 }]
  },

  // ============ 召唤对冲 (1) ============
  "C03↔C04": {
    type: "combo_c03_c04",
    msg: "拉普拉斯妖↔薛定谔的猫：猫不再掷硬币，由玩家选择",
    effects: [{ type: "modify_flag", flag: "c04_choose", value: true }]
  }
};

export { COMBO_TABLE };
