const fs = require('fs');

// ---- Load cards ----
const cardsRaw = fs.readFileSync('js/cards.js', 'utf8');
const cardBlocks = cardsRaw.match(/\{\s*id:\s*["']([A-Z]\d+)["'][^}]*?\}/gs);
const cardsMap = {};
cardBlocks.forEach(block => {
  const id = (block.match(/id:\s*["']([A-Z]\d+)["']/) || [])[1];
  const name = (block.match(/name:\s*["']([^"']+)["']/) || [])[1] || '';
  const domain = (block.match(/domain:\s*\[([^\]]+)\]/) || [])[1] || '';
  const desc = (block.match(/description:\s*["']([^"']+)["']/) || [])[1] || '';
  const effectDesc = (block.match(/effectDesc:\s*["']([^"']+)["']/) || [])[1] || '';
  cardsMap[id] = { id, name, domain, desc, effectDesc };
});

// ---- Build pairing ----
const artDir = 'art_samples/card_art';

// Manual pairings based on v2 script output + fixes
const pairings = [
  // 力 domain
  { cid: 'A01', file: 'a01_zhonglichuiji_cyber.png', note: '直接ID匹配 - 重力锤击' },
  { cid: 'A05', file: 'A_colossal_boulder_suspended_h_2026-06-13T02-32-35.png', note: '巨石高悬 - 重力势能' },
  { cid: 'A43', file: 'A_massive_mechanical_piston_co_2026-06-12T17-38-06.png', note: '机械活塞 - 活塞压缩' },
  { cid: 'D01', file: 'A_gravitational_field_dome_war_2026-06-13T02-38-12.png', note: '引力场穹顶 - 力之领域' },
  { cid: 'S02', file: 'A_futuristic_warrior_charging__2026-06-12T17-34-41.png', note: '战士蓄力 - 能量蓄积' },
  { cid: 'S03', file: 'A_needle_thin_concentrated_for_2026-06-13T02-31-39.png', note: '针状集中 - 受力面积缩小' },
  { cid: 'S06', file: 'A_spring_and_rubber_band_stret_2026-06-12T17-36-21.png', note: '弹簧拉伸 - 弹性储能 (修正)' },

  // 声 domain
  { cid: 'A09', file: 'Ultrasonic_waves_blasting_dirt_2026-06-12T17-35-42.png', note: '超声波清洁 - 超声清洗' },
  { cid: 'A10', file: 'Low_frequency_sound_waves_caus_2026-06-12T17-36-07.png', note: '低频声波 - 次声震荡' },
  { cid: 'A13', file: 'Standing_wave_pattern_forming__2026-06-12T17-36-32.png', note: '驻波图案 - 驻波共振' },
  { cid: 'A31', file: 'A_spherical_resonance_chamber__2026-06-13T14-30-58.png', note: '球形共振腔 - 共振爆破' },
  { cid: 'A32', file: 'A_massive_pink_sonic_shockwave_2026-06-13T14-28-21.png', note: '粉色冲击波 - 声波推力' },
  { cid: 'A45', file: 'Two_cybernetic_ear_like_sensor_2026-06-13T02-33-40.png', note: '双耳传感器 - 双耳定位' },
  { cid: 'S07', file: 'Anti_noise_soundwaves_in_neon__2026-06-13T02-37-42.png', note: '反噪声波 - 回声消声' },
  { cid: 'S08', file: 'Chaotic_noise_waves_disrupting_2026-06-12T17-37-46.png', note: '混乱噪声 - 噪音干扰' },

  // 光 domain
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

  // 热 domain
  { cid: 'A21', file: 'Intense_flames_burning_and_ero_2026-06-12T17-35-52.png', note: '烈焰灼蚀 - 烈焰灼蚀' },
  { cid: 'A24', file: 'Molten_lava_erupting_from_a_vo_2026-06-12T17-37-05.png', note: '熔岩喷发 - 熔岩喷发 (手动修正)' },
  { cid: 'A25', file: 'Water_boiling_away_into_steam__2026-06-12T17-37-20.png', note: '水沸蒸发 - 蒸发消散' },
  { cid: 'A37', file: 'Electricity_leaking_from_a_dam_2026-06-12T17-39-32.png', note: '漏电火花 - 漏电灼伤' },
  { cid: 'A47', file: 'Solid_matter_transforming_dire_2026-06-12T17-37-45.png', note: '固体升华 - 升华爆散' },
  { cid: 'C13', file: 'A_steampunk_cyberpunk_engine_c_2026-06-13T09-48-53.png', note: '蒸汽引擎 - 瓦特' },
  { cid: 'S22', file: 'A_protective_energy_shield_res_2026-06-12T17-38-10.png', note: '能量护盾 - 比热护盾' },
  { cid: 'S25', file: 'Ice_cubes_melting_and_absorbin_2026-06-12T17-40-31.png', note: '冰块融化 - 潜热释放' },
  { cid: 'S26', file: 'Multiple_heat_sources_convergi_2026-06-13T02-35-49.png', note: '多热源汇聚 - 热量聚集' },

  // 电 domain
  { cid: 'A27', file: 'a27_gaoyadianji_cyber.png', note: '直接ID匹配 - 闪电劈击' },
  { cid: 'A29', file: 'An_electric_arc_burning_throug_2026-06-12T17-40-14.png', note: '电弧灼烧 - 电弧灼烧' },
  { cid: 'A30', file: 'An_EMP_blast_radiating_outward_2026-06-12T17-38-19.png', note: 'EMP冲击波 - 电磁脉冲' },
  { cid: 'A35', file: 'A_short_circuit_melting_wires__2026-06-12T17-38-42.png', note: '短路熔毁 - 短路熔毁' },
  { cid: 'A49', file: 'A_circuit_overloaded_with_too__2026-06-12T17-39-33.png', note: '电路过载 - 过载放电 (手动修正)' },
  { cid: 'S27', file: 'A_futuristic_resistor_grid_glo_2026-06-13T02-37-42.png', note: '电阻网格 - 电阻屏障' },
  { cid: 'S29', file: 'Static_electricity_pulling_dus_2026-06-12T17-40-21.png', note: '静电吸附 - 静电吸附' },
  { cid: 'S30', file: 'A_short_circuit_melting_wires__2026-06-12T17-38-42.png', note: '短路熔毁 - 短路开关 (与A35同图)' },
  { cid: 'S33', file: 'Multiple_parallel_electrical_c_2026-06-13T02-36-52.png', note: '多路并联 - 多路放电' },
];

// Also add S01 and S28 which were already in prev with files
pairings.push(
  { cid: 'S01', file: 's01_zhiliangzengda_cyber.png', note: '已有文件 - 质量增大' },
  { cid: 'S28', file: 's28_dianciganying_cyber.png', note: '已有文件 - 电磁感应' },
);

// ---- Verify all 44 + 2 = 46 cards covered ----
const covered = new Set(pairings.map(p => p.cid));
const expected = [];
const approved = JSON.parse(fs.readFileSync('approved_cards.json', 'utf8'));
for (const [id, val] of Object.entries(approved.prev)) {
  if (!covered.has(id)) expected.push(id);
}
if (expected.length > 0) {
  console.log('MISSING:', expected.join(' '));
} else {
  console.log('All 46 cards covered!');
}

// ---- Generate HTML ----
const domainColors = {
  '力': '#ff6600',
  '声': '#ff00aa',
  '光': '#ffdd00',
  '热': '#ff3300',
  '电': '#00ccff'
};

const domainIcons = {
  '力': '⚡',
  '声': '🔊',
  '光': '💡',
  '热': '🔥',
  '电': '⚡'
};

let cardsHTML = '';
for (const p of pairings) {
  const card = cardsMap[p.cid];
  if (!card) continue;
  const domain = card.domain.replace(/[\[\]'"]/g, '').split(',')[0].trim();
  const color = domainColors[domain] || '#888';
  const icon = domainIcons[domain] || '?';

  cardsHTML += `
  <div class="card" id="card-${p.cid}" data-cid="${p.cid}">
    <div class="card-header">
      <span class="cid">${p.cid}</span>
      <span class="name">${icon} ${card.name}</span>
      <span class="domain" style="color:${color}">[${domain}]</span>
    </div>
    <div class="card-body">
      <div class="image-container">
        <img src="art_samples/card_art/${p.file}" alt="${card.name}" onclick="zoomImage(this.src)" loading="lazy">
      </div>
      <div class="info">
        <div class="effect">${card.effectDesc || card.desc}</div>
        <div class="match-note">📎 ${p.note}</div>
        <div class="file-name">📁 ${p.file}</div>
      </div>
    </div>
    <div class="card-footer">
      <button class="btn-accept" onclick="accept('${p.cid}')">✅ 通过</button>
      <button class="btn-reject" onclick="reject('${p.cid}')">❌ 不通过</button>
      <span class="status" id="status-${p.cid}"></span>
    </div>
  </div>`;
}

const domainCounts = {};
for (const p of pairings) {
  const card = cardsMap[p.cid];
  if (!card) continue;
  const d = card.domain.replace(/[\[\]'"]/g, '').split(',')[0].trim();
  domainCounts[d] = (domainCounts[d] || 0) + 1;
}

const countStr = Object.entries(domainCounts).map(([d, c]) => `${d}:${c}`).join(' | ');

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Prev 卡牌插画配对审核 (46张)</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0a0a1a; color: #e0e0e0; font-family: 'Segoe UI', system-ui, sans-serif; padding: 20px; }
h1 { text-align: center; color: #fff; margin-bottom: 8px; font-size: 24px; }
.subtitle { text-align: center; color: #888; margin-bottom: 20px; font-size: 14px; }
.toolbar { position: sticky; top: 0; z-index: 100; background: #111133; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; margin-bottom: 20px; border-radius: 8px; }
.toolbar .counts { color: #aaa; font-size: 14px; }
.toolbar button { padding: 8px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold; }
.btn-export { background: #4CAF50; color: white; }
.btn-export:hover { background: #45a049; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 16px; }
.card { background: #161630; border-radius: 12px; padding: 16px; border: 1px solid #2a2a4a; transition: all 0.3s; }
.card.accepted { border-color: #4CAF50; background: #162016; }
.card.rejected { border-color: #f44336; background: #201616; }
.card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.cid { background: #333; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
.name { font-size: 16px; font-weight: bold; color: #fff; }
.domain { font-size: 13px; font-weight: bold; }
.card-body { display: flex; gap: 12px; }
.image-container { flex: 0 0 160px; height: 220px; overflow: hidden; border-radius: 8px; background: #000; cursor: pointer; }
.image-container img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.image-container:hover img { transform: scale(1.05); }
.info { flex: 1; display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
.effect { color: #ccc; line-height: 1.5; max-height: 80px; overflow-y: auto; background: #1a1a30; padding: 8px; border-radius: 6px; }
.match-note { color: #4CAF50; font-weight: bold; }
.file-name { color: #666; font-size: 11px; word-break: break-all; }
.card-footer { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.card-footer button { padding: 6px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold; }
.btn-accept { background: #4CAF50; color: white; }
.btn-accept:hover { background: #45a049; }
.btn-reject { background: #f44336; color: white; }
.btn-reject:hover { background: #da190b; }
.status { font-size: 12px; font-weight: bold; margin-left: auto; }
.modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 1000; justify-content: center; align-items: center; }
.modal.active { display: flex; }
.modal img { max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 8px; }
.modal .close { position: absolute; top: 20px; right: 30px; font-size: 40px; color: white; cursor: pointer; }
</style>
</head>
<body>
<h1>Prev 卡牌插画配对审核</h1>
<div class="subtitle">从现有图库中自动配对 46 张早期审批卡牌 | ${countStr} | 总计: ${pairings.length} 张</div>

<div class="toolbar">
  <div class="counts">
    通过: <span id="accepted-count" style="color:#4CAF50">0</span> |
    不通过: <span id="rejected-count" style="color:#f44336">0</span> |
    待审核: <span id="pending-count">${pairings.length}</span>
  </div>
  <button class="btn-export" onclick="exportResults()">📋 导出审核结果</button>
</div>

<div class="grid" id="card-grid">
${cardsHTML}
</div>

<div class="modal" id="zoom-modal" onclick="this.classList.remove('active')">
  <span class="close">&times;</span>
  <img id="zoom-img" src="">
</div>

<script>
const decisions = {};
function accept(cid) {
  decisions[cid] = 'accept';
  const card = document.getElementById('card-' + cid);
  card.classList.add('accepted');
  card.classList.remove('rejected');
  document.getElementById('status-' + cid).textContent = '✅ 已通过';
  document.getElementById('status-' + cid).style.color = '#4CAF50';
  updateCounts();
}
function reject(cid) {
  decisions[cid] = 'reject';
  const card = document.getElementById('card-' + cid);
  card.classList.add('rejected');
  card.classList.remove('accepted');
  document.getElementById('status-' + cid).textContent = '❌ 不通过';
  document.getElementById('status-' + cid).style.color = '#f44336';
  updateCounts();
}
function updateCounts() {
  let a = 0, r = 0, p = ${pairings.length};
  for (const [cid, d] of Object.entries(decisions)) {
    if (d === 'accept') a++;
    else if (d === 'reject') r++;
  }
  p = ${pairings.length} - a - r;
  document.getElementById('accepted-count').textContent = a;
  document.getElementById('rejected-count').textContent = r;
  document.getElementById('pending-count').textContent = p;
}
function zoomImage(src) {
  document.getElementById('zoom-img').src = src;
  document.getElementById('zoom-modal').classList.add('active');
}
const allCids = ${JSON.stringify(pairings.map(p => p.cid))};
function exportResults() {
  const result = { accepted: [], rejected: [], pending: [] };
  for (let i = 0; i < allCids.length; i++) {
    const cid = allCids[i];
    const d = decisions[cid];
    if (d === 'accept') result.accepted.push(cid);
    else if (d === 'reject') result.rejected.push(cid);
    else result.pending.push(cid);
  }
  const json = JSON.stringify(result, null, 2);
  const blob = new Blob([json], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'prev_art_review_result.json';
  a.click();
}
</script>
</body>
</html>`;

fs.writeFileSync('prev_art_review.html', html);
console.log('Generated prev_art_review.html with ' + pairings.length + ' cards');
