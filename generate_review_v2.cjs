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

// ---- Scan batch files for correct mappings ----
const batchFiles = ['batch3.html','batch4.html','batch5.html','batch6.html','batch7.html','batch8.html'];
const batchMap = {}; // cid => latest file
for (const bf of batchFiles) {
  if (!fs.existsSync(bf)) continue;
  const html = fs.readFileSync(bf, 'utf8');
  const cardBlocks = html.match(/<h3>(.*?)<\/h3>[\s\S]*?card_art\/([^"']+\.png)/g);
  if (!cardBlocks) continue;
  for (const block of cardBlocks) {
    const cidMatch = block.match(/<h3>([A-Z]\d+)/);
    const fileMatch = block.match(/card_art\/([^"']+\.png)/);
    if (cidMatch && fileMatch) {
      batchMap[cidMatch[1]] = fileMatch[1];
    }
  }
}

// ---- Build corrected pairings ----
// Priority: batch file > keyword match > cyber file
const prevIds = [];
const approved = JSON.parse(fs.readFileSync('approved_cards.json','utf8'));
for (const [id, val] of Object.entries(approved.prev)) {
  if (val === 'approved') prevIds.push(id);
}
// Also add S01 and S28 (already had files in prev)
prevIds.push('S01','S28');

// Fallback pairings from my previous matching (for cards NOT in batch files)
const fallback = {
  'A01': 'a01_zhonglichuiji_cyber.png',
  'A05': 'A_colossal_boulder_suspended_h_2026-06-13T02-32-35.png',
  'A43': 'A_massive_mechanical_piston_co_2026-06-12T17-38-06.png',
  'D01': 'A_gravitational_field_dome_war_2026-06-13T02-38-12.png',
  'S02': 'A_futuristic_warrior_charging__2026-06-12T17-34-41.png',
  'S03': 'A_needle_thin_concentrated_for_2026-06-13T02-31-39.png',
  'A10': 'Low_frequency_sound_waves_caus_2026-06-12T17-36-07.png',
  'A31': 'A_spherical_resonance_chamber__2026-06-13T14-30-58.png',
  'A32': 'A_massive_pink_sonic_shockwave_2026-06-13T14-28-21.png',
  'S07': 'Anti_noise_soundwaves_in_neon__2026-06-13T02-37-42.png',
  'A15': 'A_precise_laser_beam_cutting_t_2026-06-12T17-36-02.png',
  'S19': 'Infinite_reflections_in_a_hall_2026-06-12T17-38-03.png',
  'A21': 'Intense_flames_burning_and_ero_2026-06-12T17-35-52.png',
  'A24': 'Molten_lava_erupting_from_a_vo_2026-06-12T17-37-05.png',
  'A27': 'a27_gaoyadianji_cyber.png',
  'S01': 's01_zhiliangzengda_cyber.png',
};

const pairings = [];
for (const cid of prevIds) {
  const card = cardsMap[cid];
  if (!card) continue;
  
  let file, note;
  if (batchMap[cid]) {
    file = batchMap[cid];
    note = '✅ 来自早期Batch审核文件';
  } else if (fallback[cid]) {
    file = fallback[cid];
    note = '⚠️ 早期Batch无记录，关键词匹配';
  } else {
    note = '❌ 未找到任何匹配';
    pairings.push({ cid, card, file: null, note });
    continue;
  }
  
  pairings.push({ cid, card, file, note });
}

// ---- Generate HTML ----
const domainColors = { '力': '#ff6600', '声': '#ff00aa', '光': '#ffdd00', '热': '#ff3300', '电': '#00ccff' };
const domainIcons = { '力': '⚡', '声': '🔊', '光': '💡', '热': '🔥', '电': '⚡' };

let cardsHTML = '';
for (const p of pairings) {
  const c = p.card;
  const domain = c.domain.replace(/[\[\]'"]/g, '').split(',')[0].trim();
  const color = domainColors[domain] || '#888';
  const icon = domainIcons[domain] || '?';
  const imgTag = p.file
    ? `<div class="image-container"><img src="art_samples/card_art/${p.file}" alt="${c.name}" onclick="zoomImage(this.src)" loading="lazy"></div>`
    : '<div class="image-container no-img">无匹配图片</div>';

  cardsHTML += `
  <div class="card" id="card-${p.cid}" data-cid="${p.cid}">
    <div class="card-header">
      <span class="cid">${p.cid}</span>
      <span class="name">${icon} ${c.name}</span>
      <span class="domain" style="color:${color}">[${domain}]</span>
    </div>
    <div class="card-body">
      ${imgTag}
      <div class="info">
        <div class="effect">${c.effectDesc || c.desc}</div>
        <div class="match-note">${p.note}</div>
        ${p.file ? '<div class="file-name">📁 ' + p.file + '</div>' : ''}
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
  const d = p.card.domain.replace(/[\[\]'"]/g, '').split(',')[0].trim();
  domainCounts[d] = (domainCounts[d] || 0) + 1;
}
const countStr = Object.entries(domainCounts).map(([d, c]) => `${d}:${c}`).join(' | ');
const batchCount = pairings.filter(p => batchMap[p.cid]).length;
const fallbackCount = pairings.filter(p => !batchMap[p.cid] && p.file).length;

const allCidsJson = JSON.stringify(pairings.map(p => p.cid));

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Prev 卡牌插画配对审核 v2 (Batch修正版)</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0a0a1a; color: #e0e0e0; font-family: 'Segoe UI', system-ui, sans-serif; padding: 20px; }
h1 { text-align: center; color: #fff; margin-bottom: 8px; font-size: 24px; }
.subtitle { text-align: center; color: #888; margin-bottom: 20px; font-size: 14px; }
.stats { text-align: center; color: #aaa; font-size: 13px; margin-bottom: 16px; }
.stats .good { color: #4CAF50; }
.stats .warn { color: #FFA500; }
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
.image-container { flex: 0 0 160px; height: 220px; overflow: hidden; border-radius: 8px; background: #000; cursor: pointer; position: relative; }
.image-container img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.image-container:hover img { transform: scale(1.05); }
.image-container.no-img { display: flex; align-items: center; justify-content: center; color: #f44336; font-size: 14px; }
.info { flex: 1; display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
.effect { color: #ccc; line-height: 1.5; max-height: 80px; overflow-y: auto; background: #1a1a30; padding: 8px; border-radius: 6px; }
.match-note { color: #4caf50; font-weight: bold; }
.match-note.warn { color: #FFA500; }
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
<h1>Prev 卡牌插画配对审核 v2</h1>
<div class="subtitle">从早期Batch审核文件中提取正确映射 | ${countStr} | 总计: ${pairings.length} 张</div>
<div class="stats">
  <span class="good">✅ Batch确认: ${batchCount} 张</span> | 
  <span class="warn">⚠️ 关键词匹配: ${fallbackCount} 张</span>
</div>

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
const allCids = ${allCidsJson};
const totalCards = allCids.length;
const decisions = {};
function accept(cid) {
  decisions[cid] = 'accept';
  var card = document.getElementById('card-' + cid);
  card.classList.add('accepted');
  card.classList.remove('rejected');
  var st = document.getElementById('status-' + cid);
  st.textContent = '✅ 已通过';
  st.style.color = '#4CAF50';
  updateCounts();
}
function reject(cid) {
  decisions[cid] = 'reject';
  var card = document.getElementById('card-' + cid);
  card.classList.add('rejected');
  card.classList.remove('accepted');
  var st = document.getElementById('status-' + cid);
  st.textContent = '❌ 不通过';
  st.style.color = '#f44336';
  updateCounts();
}
function updateCounts() {
  var a = 0, r = 0;
  for (var i = 0; i < allCids.length; i++) {
    var d = decisions[allCids[i]];
    if (d === 'accept') a++;
    else if (d === 'reject') r++;
  }
  var p = totalCards - a - r;
  document.getElementById('accepted-count').textContent = a;
  document.getElementById('rejected-count').textContent = r;
  document.getElementById('pending-count').textContent = p;
}
function zoomImage(src) {
  document.getElementById('zoom-img').src = src;
  document.getElementById('zoom-modal').classList.add('active');
}
function exportResults() {
  var result = { accepted: [], rejected: [], pending: [] };
  for (var i = 0; i < allCids.length; i++) {
    var cid = allCids[i];
    var d = decisions[cid];
    if (d === 'accept') result.accepted.push(cid);
    else if (d === 'reject') result.rejected.push(cid);
    else result.pending.push(cid);
  }
  var json = JSON.stringify(result, null, 2);
  var blob = new Blob([json], {type: 'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'prev_art_review_v2.json';
  a.click();
}
</script>
</body>
</html>`;

fs.writeFileSync('prev_art_review_v2.html', html);
console.log('Generated prev_art_review_v2.html');
console.log('  Batch-confirmed: ' + batchCount);
console.log('  Keyword-matched: ' + fallbackCount);
console.log('  Total: ' + pairings.length);
