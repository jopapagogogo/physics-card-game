const fs = require('fs');

// ---- Scan all batch HTML files for card→image mappings ----
const batchFiles = ['batch3.html', 'batch4.html', 'batch5.html', 'batch6.html', 'batch7.html', 'batch8.html'];
const batchMap = {}; // cid => file

for (const bf of batchFiles) {
  if (!fs.existsSync(bf)) continue;
  const html = fs.readFileSync(bf, 'utf8');
  // Find card <h3>ID NAME</h3> blocks with image references
  const cardBlocks = html.match(/<h3>(.*?)<\/h3>[\s\S]*?card_art\/([^"']+\.png)/g);
  if (!cardBlocks) continue;
  for (const block of cardBlocks) {
    const cidMatch = block.match(/<h3>([A-Z]\d+)/);
    const fileMatch = block.match(/card_art\/([^"']+\.png)/);
    if (cidMatch && fileMatch) {
      const cid = cidMatch[1];
      const file = fileMatch[1];
      if (!batchMap[cid]) batchMap[cid] = [];
      batchMap[cid].push(file);
    }
  }
}

console.log('Batch files card→image mappings:');
for (const [cid, files] of Object.entries(batchMap).sort()) {
  console.log(`  ${cid}: ${files[files.length-1]}`);
}

// ---- Compare with current pairings ----
const pairings = [
  { cid: 'A01', file: 'a01_zhonglichuiji_cyber.png', note: '直接ID匹配 - 重力锤击' },
  { cid: 'A05', file: 'A_colossal_boulder_suspended_h_2026-06-13T02-32-35.png', note: '巨石高悬 - 重力势能' },
  { cid: 'A43', file: 'A_massive_mechanical_piston_co_2026-06-12T17-38-06.png', note: '机械活塞 - 活塞压缩' },
  { cid: 'D01', file: 'A_gravitational_field_dome_war_2026-06-13T02-38-12.png', note: '引力场穹顶 - 力之领域' },
  { cid: 'S02', file: 'A_futuristic_warrior_charging__2026-06-12T17-34-41.png', note: '战士蓄力 - 能量蓄积' },
  { cid: 'S03', file: 'A_needle_thin_concentrated_for_2026-06-13T02-31-39.png', note: '针状集中 - 受力面积缩小' },
  { cid: 'S06', file: 'A_spring_and_rubber_band_stret_2026-06-12T17-36-21.png', note: '弹簧拉伸 - 弹性储能' },
  { cid: 'A09', file: 'Ultrasonic_waves_blasting_dirt_2026-06-12T17-35-42.png', note: '超声波清洁 - 超声清洗' },
  { cid: 'A10', file: 'Low_frequency_sound_waves_caus_2026-06-12T17-36-07.png', note: '低频声波 - 次声震荡' },
  { cid: 'A13', file: 'Standing_wave_pattern_forming__2026-06-12T17-36-32.png', note: '驻波图案 - 驻波共振' },
  { cid: 'A31', file: 'A_spherical_resonance_chamber__2026-06-13T14-30-58.png', note: '球形共振腔 - 共振爆破' },
  { cid: 'A32', file: 'A_massive_pink_sonic_shockwave_2026-06-13T14-28-21.png', note: '粉色冲击波 - 声波推力' },
  { cid: 'A45', file: 'Two_cybernetic_ear_like_sensor_2026-06-13T02-33-40.png', note: '双耳传感器 - 双耳定位' },
  { cid: 'S07', file: 'Anti_noise_soundwaves_in_neon__2026-06-13T02-37-42.png', note: '反噪声波 - 回声消声' },
  { cid: 'S08', file: 'Chaotic_noise_waves_disrupting_2026-06-12T17-37-46.png', note: '混乱噪声 - 噪音干扰' },
  { cid: 'A15', file: 'A_precise_laser_beam_cutting_t_2026-06-12T17-36-02.png', note: '激光切割 - 激光切割' },
  { cid: 'A16', file: 'A_massive_crystal_prism_splitt_2026-06-15T08-34-35.png', note: '水晶棱镜分光 - 色散分解' },
  { cid: 'A17', file: 'Invisible_infrared_heat_rays_b_2026-06-12T17-36-42.png', note: '红外热线 - 红外灼烧' },
  { cid: 'A19', file: 'Light_traveling_through_a_fibe_2026-06-12T17-37-31.png', note: '光纤传输 - 光纤穿透' },
  { cid: 'A20', file: 'Intense_sunlight_amplified_thr_2026-06-13T02-34-45.png', note: '阳光放大 - 日光暴晒' },
  { cid: 'A52', file: 'Light_converting_into_electric_2026-06-12T17-37-38.png', note: '光转电 - 光电信号' },
  { cid: 'S14', file: 'An_optical_filter_separating_w_2026-06-12T17-38-02.png', note: '光学滤镜 - 滤光' },
  { cid: 'S16', file: 'A_beam_of_light_traveling_at_i_2026-06-13T02-34-46.png', note: '光束飞驰 - 光速传播' },
  { cid: 'S17', file: 'Seven_neon_color_beams_overlap_2026-06-13T02-34-46.png', note: '七色光叠加 - 光谱叠加' },
  { cid: 'S19', file: 'Infinite_reflections_in_a_hall_2026-06-12T17-38-03.png', note: '无尽反射 - 镜面迷宫' },
  { cid: 'S20', file: 'A_shadow_taking_physical_form__2026-06-12T17-40-06.png', note: '实体化影子 - 影子束缚' },
  { cid: 'A21', file: 'Intense_flames_burning_and_ero_2026-06-12T17-35-52.png', note: '烈焰灼蚀 - 烈焰灼蚀' },
  { cid: 'A24', file: 'Molten_lava_erupting_from_a_vo_2026-06-12T17-37-05.png', note: '熔岩喷发 - 熔岩喷发' },
  { cid: 'A25', file: 'Water_boiling_away_into_steam__2026-06-12T17-37-20.png', note: '水沸蒸发 - 蒸发消散' },
  { cid: 'A37', file: 'Electricity_leaking_from_a_dam_2026-06-12T17-39-32.png', note: '漏电火花 - 漏电灼伤' },
  { cid: 'A47', file: 'Solid_matter_transforming_dire_2026-06-12T17-37-45.png', note: '固体升华 - 升华爆散' },
  { cid: 'C13', file: 'A_steampunk_cyberpunk_engine_c_2026-06-13T09-48-53.png', note: '蒸汽引擎 - 瓦特' },
  { cid: 'S22', file: 'A_protective_energy_shield_res_2026-06-12T17-38-10.png', note: '能量护盾 - 比热护盾' },
  { cid: 'S25', file: 'Ice_cubes_melting_and_absorbin_2026-06-12T17-40-31.png', note: '冰块融化 - 潜热释放' },
  { cid: 'S26', file: 'Multiple_heat_sources_convergi_2026-06-13T02-35-49.png', note: '多热源汇聚 - 热量聚集' },
  { cid: 'A27', file: 'a27_gaoyadianji_cyber.png', note: '直接ID匹配 - 闪电劈击' },
  { cid: 'A29', file: 'An_electric_arc_burning_throug_2026-06-12T17-40-14.png', note: '电弧灼烧 - 电弧灼烧' },
  { cid: 'A30', file: 'An_EMP_blast_radiating_outward_2026-06-12T17-38-19.png', note: 'EMP冲击波 - 电磁脉冲' },
  { cid: 'A35', file: 'A_short_circuit_melting_wires__2026-06-12T17-38-42.png', note: '短路熔毁 - 短路熔毁' },
  { cid: 'A49', file: 'A_circuit_overloaded_with_too__2026-06-12T17-39-33.png', note: '电路过载 - 过载放电' },
  { cid: 'S27', file: 'A_futuristic_resistor_grid_glo_2026-06-13T02-37-42.png', note: '电阻网格 - 电阻屏障' },
  { cid: 'S29', file: 'Static_electricity_pulling_dus_2026-06-12T17-40-21.png', note: '静电吸附 - 静电吸附' },
  { cid: 'S30', file: 'A_short_circuit_melting_wires__2026-06-12T17-38-42.png', note: '短路熔毁 - 短路开关' },
  { cid: 'S33', file: 'Multiple_parallel_electrical_c_2026-06-13T02-36-52.png', note: '多路并联 - 多路放电' },
  { cid: 'S01', file: 's01_zhiliangzengda_cyber.png', note: '已有文件 - 质量增大' },
  { cid: 'S28', file: 's28_dianciganying_cyber.png', note: '已有文件 - 电磁感应' },
];

console.log('\n=== Cross-reference with batch files ===');
let corrections = 0;
for (const p of pairings) {
  const batchF = batchMap[p.cid];
  if (batchF) {
    // Take the latest version from batch (last in array)
    const correctFile = batchF[batchF.length - 1];
    if (correctFile !== p.file) {
      console.log(`  ${p.cid}: batch="${correctFile}" vs current="${p.file}"`);
      corrections++;
    }
  } else {
    console.log(`  ${p.cid}: NOT in batch files`);
  }
}
console.log(`\nCorrections needed: ${corrections}`);
console.log(`Batch-mapped cards: ${Object.keys(batchMap).length}`);
