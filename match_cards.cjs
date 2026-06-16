const fs = require('fs');

// ---- Load cards ----
const cardsRaw = fs.readFileSync('js/cards.js', 'utf8');
const cardBlocks = cardsRaw.match(/\{\s*id:\s*["']([A-Z]\d+)["'][^}]*?\}/gs);
const cards = cardBlocks.map(block => {
  const id = (block.match(/id:\s*["']([A-Z]\d+)["']/) || [])[1];
  const name = (block.match(/name:\s*["']([^"']+)["']/) || [])[1] || '';
  const domain = (block.match(/domain:\s*\[([^\]]+)\]/) || [])[1] || '';
  const desc = (block.match(/description:\s*["']([^"']+)["']/) || [])[1] || '';
  const effectDesc = (block.match(/effectDesc:\s*["']([^"']+)["']/) || [])[1] || '';
  return { id, name, domain, desc, effectDesc };
});

// ---- Unmatched cards ----
const approved = JSON.parse(fs.readFileSync('approved_cards.json', 'utf8'));
const prev = approved.prev;
const unmatched = [];
for (const [id, val] of Object.entries(prev)) {
  if (val === 'approved') unmatched.push(id);
}

// ---- Available files ----
const artDir = 'art_samples/card_art';
const usedFiles = new Set();
for (const [batch, entries] of Object.entries(approved)) {
  if (batch === 'prev') continue;
  for (const file of Object.values(entries)) usedFiles.add(file);
}
const skipPatterns = /^(icon_|rune_|rarity_|[A-Z]_common|[A-Z]_epic|[A-Z]_legendary|[A-Z]_mythic|[A-Z]_rare|S05_|S10_|S12_|S15_)/;
const available = fs.readdirSync(artDir).filter(f => f.endsWith('.png') && !usedFiles.has(f) && !skipPatterns.test(f));

// ---- Card-specific keyword builder ----
function getKeywords(card) {
  const text = (card.name + ' ' + card.desc + ' ' + card.effectDesc).toLowerCase();
  const kw = new Set();

  // Domain base keywords
  if (card.domain.includes('力')) { ['force','mechanical','impact','punch','push','strike','lever','weight','gravity','hammer','smash','collision','kinetic','bullet','projectile','momentum','fist','warrior','vehicle','chariot'].forEach(k => kw.add(k)); }
  if (card.domain.includes('电')) { ['electric','lightning','spark','current','voltage','circuit','wire','arc','battery','capacitor','emp','electromagnetic','magnet','coil','short','overload','leak','static'].forEach(k => kw.add(k)); }
  if (card.domain.includes('声')) { ['sound','wave','echo','resonance','vibration','tuning','ultrasonic','frequency','speaker','noise','pulse','radar','sonar','shockwave','sonic','amplitude','subwoofer'].forEach(k => kw.add(k)); }
  if (card.domain.includes('光')) { ['light','beam','laser','lens','prism','mirror','reflection','refraction','ultraviolet','infrared','xray','optical','photon','polarize','spectrum','rainbow','fiber','sun','visible','filter'].forEach(k => kw.add(k)); }
  if (card.domain.includes('热')) { ['heat','thermal','fire','flame','burn','lava','molten','melt','ice','frost','freeze','temperature','thermometer','steam','boil','evaporate','sublimate','entropy','cold','hot','sun'].forEach(k => kw.add(k)); }

  // Card-specific
  if (text.includes('重力') || text.includes('势能')) { ['gravity','boulder','suspended','height'].forEach(k => kw.add(k)); }
  if (text.includes('压强') || text.includes('液压') || text.includes('活塞')) { ['press','piston','hydraulic','needle'].forEach(k => kw.add(k)); }
  if (text.includes('杠杆')) { ['lever','pivot'].forEach(k => kw.add(k)); }
  if (text.includes('做功') || text.includes('打击')) { ['strike','impact','push'].forEach(k => kw.add(k)); }
  if (text.includes('弹簧') || text.includes('弹性')) { ['spring','stretch'].forEach(k => kw.add(k)); }
  if (text.includes('摩擦') || text.includes('刹车')) { ['friction','brake','grind'].forEach(k => kw.add(k)); }
  if (text.includes('子弹') || text.includes('贯穿') || text.includes('穿透')) { ['bullet','projectile','pierce','spear'].forEach(k => kw.add(k)); }
  if (text.includes('撞击') || text.includes('碰撞')) { ['impact','collision','smash'].forEach(k => kw.add(k)); }
  if (text.includes('共振') || text.includes('频率')) { ['resonance','frequency','tuning'].forEach(k => kw.add(k)); }
  if (text.includes('超声')) { ['ultrasonic','clean'].forEach(k => kw.add(k)); }
  if (text.includes('次声')) { ['low','frequency','infrasound'].forEach(k => kw.add(k)); }
  if (text.includes('驻波')) { ['standing','wave'].forEach(k => kw.add(k)); }
  if (text.includes('回声') || text.includes('反射')) { ['echo','reflect','bounce'].forEach(k => kw.add(k)); }
  if (text.includes('吸收') || text.includes('隔音')) { ['absorb','barrier','damp'].forEach(k => kw.add(k)); }
  if (text.includes('多普勒') || text.includes('雷达')) { ['radar','pulse','doppler'].forEach(k => kw.add(k)); }
  if (text.includes('定位')) { ['locate','radar','sensor','ear'].forEach(k => kw.add(k)); }
  if (text.includes('激光')) { ['laser','beam','cut'].forEach(k => kw.add(k)); }
  if (text.includes('色散') || text.includes('棱镜')) { ['prism','spectrum','rainbow','crystal','split','white'].forEach(k => kw.add(k)); }
  if (text.includes('红外')) { ['infrared','heat','invisible'].forEach(k => kw.add(k)); }
  if (text.includes('紫外')) { ['ultraviolet','purple'].forEach(k => kw.add(k)); }
  if (text.includes('光纤')) { ['fiber','optic'].forEach(k => kw.add(k)); }
  if (text.includes('透镜') || text.includes('凸透') || text.includes('放大')) { ['lens','convex','magnify','project'].forEach(k => kw.add(k)); }
  if (text.includes('反射') || text.includes('镜')) { ['mirror','reflect'].forEach(k => kw.add(k)); }
  if (text.includes('偏振')) { ['polarize','filter','grid'].forEach(k => kw.add(k)); }
  if (text.includes('X光') || text.includes('透视')) { ['xray','x-ray','scan','penetrat'].forEach(k => kw.add(k)); }
  if (text.includes('日光') || text.includes('太阳')) { ['sun','solar','sunlight'].forEach(k => kw.add(k)); }
  if (text.includes('烈焰') || text.includes('燃烧')) { ['flame','fire','burn'].forEach(k => kw.add(k)); }
  if (text.includes('熔岩')) { ['lava','molten','erupt'].forEach(k => kw.add(k)); }
  if (text.includes('蒸发') || text.includes('汽化')) { ['evaporate','boil','steam','water','vapor'].forEach(k => kw.add(k)); }
  if (text.includes('升华')) { ['sublimate','solid','gas','transform'].forEach(k => kw.add(k)); }
  if (text.includes('熵') || text.includes('混乱')) { ['entropy','chaos','order','demon'].forEach(k => kw.add(k)); }
  if (text.includes('降温') || text.includes('冻结')) { ['frost','ice','freeze','cold'].forEach(k => kw.add(k)); }
  if (text.includes('短路') || text.includes('熔毁')) { ['short','circuit','melt','overload'].forEach(k => kw.add(k)); }
  if (text.includes('漏电')) { ['leak','electric','spark','damage'].forEach(k => kw.add(k)); }
  if (text.includes('感应') || text.includes('电磁')) { ['induction','magnet','coil','electromagnetic'].forEach(k => kw.add(k)); }
  if (text.includes('静电')) { ['static','electric'].forEach(k => kw.add(k)); }
  if (text.includes('电弧')) { ['arc','lightning'].forEach(k => kw.add(k)); }
  if (text.includes('高压') || text.includes('击穿')) { ['high','voltage','break','lightning'].forEach(k => kw.add(k)); }
  if (text.includes('光电')) { ['light','electric','photoelectric','convert','solar'].forEach(k => kw.add(k)); }
  if (text.includes('并联')) { ['parallel','circuit','current','device','multiple'].forEach(k => kw.add(k)); }
  if (text.includes('串联')) { ['series','circuit','resistor','ohmic'].forEach(k => kw.add(k)); }
  if (text.includes('焦耳') || text.includes('热效应')) { ['joule','heating','wire','glow','red'].forEach(k => kw.add(k)); }
  if (text.includes('欧姆')) { ['ohm','resistor','resistance','grid'].forEach(k => kw.add(k)); }
  if (text.includes('电流')) { ['current','electric','flow'].forEach(k => kw.add(k)); }
  if (text.includes('电压')) { ['voltage','high','low'].forEach(k => kw.add(k)); }
  if (text.includes('电阻')) { ['resistor','resistance','grid'].forEach(k => kw.add(k)); }
  if (text.includes('牛顿')) { ['newton','apple','gravity','portrait','scientist'].forEach(k => kw.add(k)); }
  if (text.includes('瓦特') || text.includes('蒸汽')) { ['steam','engine','watt','inventor'].forEach(k => kw.add(k)); }
  if (text.includes('贝尔') || text.includes('电话')) { ['bell','telephone','inventor'].forEach(k => kw.add(k)); }
  if (text.includes('焦耳')) { ['joule','scientist','energy'].forEach(k => kw.add(k)); }
  if (text.includes('惠更斯')) { ['huygens','light','wave','scientist'].forEach(k => kw.add(k)); }
  if (text.includes('阿基米德')) { ['archimedes','lever','ancient','greek','scholar'].forEach(k => kw.add(k)); }
  if (text.includes('欧姆')) { ['ohm','scientist','cyberpunk'].forEach(k => kw.add(k)); }
  if (text.includes('赫兹') || text.includes('赫')) { ['hertz','frequency','scientist'].forEach(k => kw.add(k)); }
  if (text.includes('普朗克') || text.includes('量子')) { ['quantum','planck','scientist','cosmic'].forEach(k => kw.add(k)); }
  if (text.includes('伽利略')) { ['galileo','astronomer','renaissance'].forEach(k => kw.add(k)); }
  if (text.includes('马克士威') || text.includes('麦克斯韦')) { ['maxwell','electromagnetic','scientist','field'].forEach(k => kw.add(k)); }
  if (text.includes('领域')) { kw.add('realm'); kw.add('crystalline').toString(); kw.add('dimension'); }

  return [...kw];
}

// Score each available file against each unmatched card
const matches = [];
for (const cid of unmatched) {
  const card = cards.find(c => c.id === cid);
  if (!card) continue;
  
  const keywords = getKeywords(card);
  if (keywords.length === 0) continue;
  
  const scored = available.map(file => {
    const fname = file.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (fname.includes(kw)) score += 1;
    }
    return { file, score };
  }).filter(s => s.score >= 2).sort((a, b) => b.score - a.score);
  
  matches.push({ cid, card, keywords, candidates: scored.slice(0, 3) });
}

// Print results sorted by domain
const domainOrder = { '力': 0, '电': 1, '声': 2, '光': 3, '热': 4 };
matches.sort((a, b) => {
  const da = domainOrder[a.card.domain] ?? 5;
  const db = domainOrder[b.card.domain] ?? 5;
  return da - db || a.cid.localeCompare(b.cid);
});

let matchedCount = 0;
let noMatchCount = 0;
for (const m of matches) {
  console.log(m.cid + ' ' + m.card.name + ' [' + m.card.domain + ']');
  console.log('  Effect: ' + (m.card.effectDesc || m.card.desc));
  if (m.candidates.length === 0) {
    console.log('  NO MATCH');
    noMatchCount++;
  } else {
    m.candidates.forEach((c, i) => {
      console.log('  ' + (i + 1) + '. [' + c.score + '] ' + c.file.substring(0, 80));
    });
    matchedCount++;
  }
  console.log('');
}
console.log('=== Summary ===');
console.log('Matched (>=1 candidate): ' + matchedCount);
console.log('No match: ' + noMatchCount);
