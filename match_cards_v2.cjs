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
const allFiles = fs.readdirSync(artDir).filter(f => f.endsWith('.png') && !skipPatterns.test(f));
const available = allFiles.filter(f => !usedFiles.has(f));

// ---- SMART MATCHING ----
const results = [];

for (const cid of unmatched) {
  const card = cardsMap[cid];
  if (!card) continue;

  const cidLower = cid.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  const candidates = [];

  for (const file of available) {
    const fname = file.toLowerCase();
    let score = 0;

    // Tier 1: Direct ID match (e.g. a01_ -> A01)
    if (fname.startsWith(cidLower + '_') || fname.startsWith(cidLower + '.')) {
      score = 1000;
    }

    // Tier 2: Named card match - extract Chinese name from filename
    // e.g. "zhonglichuiji" could match 重力锤击
    // This requires looking at the old naming convention files

    // Tier 3: Keyword matching with much stricter criteria
    if (score < 100) {
      const nameLower = card.name.toLowerCase();
      const descLower = (card.effectDesc + ' ' + card.desc).toLowerCase();

      // Card-specific strict keywords
      const strictChecks = [];

      // --- 力 domain ---
      if (card.domain.includes('力')) {
        if (descLower.includes('重力') || nameLower.includes('重力')) strictChecks.push(['gravity', 'boulder', 'weight', 'height', 'heavy', 'colossal']);
        if (descLower.includes('势能')) strictChecks.push(['gravity', 'boulder', 'suspended', 'height', 'potential']);
        if (descLower.includes('压强') || descLower.includes('液压') || nameLower.includes('受力面积')) strictChecks.push(['press', 'piston', 'hydraulic', 'needle', 'spike', 'thin', 'concentrated']);
        if (descLower.includes('活塞')) strictChecks.push(['piston', 'compress', 'hydraulic', 'mechanical']);
        if (descLower.includes('锤击') || nameLower.includes('锤')) strictChecks.push(['hammer', 'smash', 'strike', 'crush', 'heavy']);
        if (descLower.includes('弹性') || descLower.includes('储能')) strictChecks.push(['spring', 'stretch', 'elastic', 'energy', 'storage']);
        if (nameLower.includes('能量蓄积') || descLower.includes('动能')) strictChecks.push(['kinetic', 'energy', 'charge', 'futuristic', 'warrior']);
        if (nameLower.includes('领域') && card.id === 'D01') strictChecks.push(['gravitational', 'field', 'dome', 'warp', 'gravity']);
      }

      // --- 声 domain ---
      if (card.domain.includes('声')) {
        if (descLower.includes('超声')) strictChecks.push(['ultrasonic', 'clean', 'blast', 'dirt']);
        if (descLower.includes('次声')) strictChecks.push(['low', 'frequency', 'infrasound', 'subwoofer']);
        if (descLower.includes('驻波')) strictChecks.push(['standing', 'wave', 'pattern']);
        if (descLower.includes('共振')) strictChecks.push(['resonance', 'structure', 'vibrat', 'arena', 'amphitheater', 'chamber']);
        if (descLower.includes('回声') || nameLower.includes('回声')) strictChecks.push(['echo', 'anti', 'noise', 'cancel', 'reflect']);
        if (descLower.includes('噪音') || nameLower.includes('噪音')) strictChecks.push(['noise', 'chaotic', 'disrupt', 'interference']);
        if (descLower.includes('定位') || descLower.includes('双耳')) strictChecks.push(['ear', 'sensor', 'locate', 'radar', 'cybernetic']);
        if (descLower.includes('推力') || descLower.includes('声波')) strictChecks.push(['sound', 'wave', 'push', 'thrust', 'shockwave', 'sonic']);
      }

      // --- 光 domain ---
      if (card.domain.includes('光')) {
        if (descLower.includes('激光')) strictChecks.push(['laser', 'beam', 'cut', 'precise', 'precision']);
        if (descLower.includes('色散') || descLower.includes('棱镜') || nameLower.includes('色散')) strictChecks.push(['prism', 'spectrum', 'rainbow', 'crystal', 'white', 'split', 'color']);
        if (descLower.includes('红外')) strictChecks.push(['infrared', 'invisible', 'heat', 'thermal']);
        if (descLower.includes('光纤')) strictChecks.push(['fiber', 'optic', 'light', 'travel', 'through']);
        if (descLower.includes('日光') || nameLower.includes('日光')) strictChecks.push(['sunlight', 'sun', 'solar', 'intense', 'amplif']);
        if (descLower.includes('滤光') || nameLower.includes('滤光')) strictChecks.push(['filter', 'optical', 'wavelength', 'specific']);
        if (descLower.includes('光速')) strictChecks.push(['light', 'beam', 'speed', 'travel', 'fast']);
        if (descLower.includes('光谱') || nameLower.includes('光谱')) strictChecks.push(['spectrum', 'color', 'rainbow', 'overlap', 'beam']);
        if (descLower.includes('镜面') || nameLower.includes('迷宫') || nameLower.includes('镜面')) strictChecks.push(['mirror', 'reflect', 'infinite', 'endless', 'hall']);
        if (descLower.includes('影子') || nameLower.includes('影子')) strictChecks.push(['shadow', 'dark', 'figure', 'physical', 'form']);
        if (descLower.includes('信号') || nameLower.includes('光电')) strictChecks.push(['light', 'electric', 'convert', 'signal', 'photoelectric']);
      }

      // --- 热 domain ---
      if (card.domain.includes('热')) {
        if (descLower.includes('烈焰') || nameLower.includes('烈焰')) strictChecks.push(['flame', 'fire', 'intense', 'burn', 'erode']);
        if (descLower.includes('熔岩')) strictChecks.push(['lava', 'molten', 'erupt', 'volcano']);
        if (descLower.includes('蒸发') || nameLower.includes('蒸发')) strictChecks.push(['water', 'boil', 'steam', 'evaporate', 'vapor']);
        if (descLower.includes('升华')) strictChecks.push(['sublimate', 'solid', 'gas', 'transform', 'direct']);
        if (descLower.includes('比热')) strictChecks.push(['shield', 'protect', 'heat', 'resist']);
        if (descLower.includes('潜热')) strictChecks.push(['ice', 'melt', 'absorb', 'phase', 'latent']);
        if (descLower.includes('热量') && nameLower.includes('聚集')) strictChecks.push(['heat', 'concentrat', 'thermal', 'converge', 'multiple', 'source']);
        if (card.id === 'C13') strictChecks.push(['steam', 'engine', 'watt', 'inventor', 'steampunk', 'convert']);
        if (descLower.includes('过载')) strictChecks.push(['overload', 'high', 'voltage', 'arc', 'break']);
      }

      // --- 电 domain ---
      if (card.domain.includes('电')) {
        if (descLower.includes('短路')) strictChecks.push(['short', 'circuit', 'melt', 'wire', 'overload', 'burn']);
        if (descLower.includes('漏电')) strictChecks.push(['leak', 'electric', 'spark', 'damage', 'wire']);
        if (descLower.includes('电阻')) strictChecks.push(['resistor', 'resistance', 'grid', 'barrier', 'shield']);
        if (descLower.includes('静电')) strictChecks.push(['static', 'electric', 'pull', 'dust', 'spark', 'crackl']);
        if (descLower.includes('多路')) strictChecks.push(['parallel', 'circuit', 'multiple', 'device', 'current']);
        if (descLower.includes('闪电') || nameLower.includes('闪电')) strictChecks.push(['lightning', 'bolt', 'high', 'voltage', 'strike', 'massive']);
        if (descLower.includes('电弧')) strictChecks.push(['arc', 'electric', 'burn', 'lightning', 'spark']);
        if (descLower.includes('电磁') || descLower.includes('脉冲') || nameLower.includes('电磁')) strictChecks.push(['emp', 'electromagnetic', 'pulse', 'blast', 'radiat']);
        if (descLower.includes('信号') || nameLower.includes('光电')) strictChecks.push(['light', 'electric', 'convert', 'signal']);
      }

      // Score based on strict checks
      for (const checks of strictChecks) {
        let matchCount = 0;
        for (const ck of checks) {
          if (fname.includes(ck)) matchCount++;
        }
        if (matchCount >= 2) score += matchCount * 20;
      }

      // Penalize domain mismatch
      const forceKws = ['force', 'mechanical', 'impact', 'punch', 'push', 'strike', 'lever', 'gravity', 'hammer', 'smash', 'collision', 'kinetic', 'bullet', 'projectile', 'momentum', 'fist', 'warrior', 'vehicle', 'chariot', 'friction', 'brake', 'grind', 'spring', 'stretch', 'spear', 'pierce'];
      const elecKws = ['electric', 'lightning', 'spark', 'current', 'voltage', 'circuit', 'wire', 'arc', 'battery', 'capacitor', 'emp', 'electromagnetic', 'magnet', 'coil', 'short', 'overload', 'leak', 'static'];
      const soundKws = ['sound', 'wave', 'echo', 'resonance', 'vibration', 'tuning', 'ultrasonic', 'frequency', 'speaker', 'noise', 'pulse', 'radar', 'shockwave', 'sonic', 'subwoofer'];
      const lightKws = ['light', 'beam', 'laser', 'lens', 'prism', 'mirror', 'reflection', 'refraction', 'ultraviolet', 'infrared', 'xray', 'optical', 'photon', 'polarize', 'spectrum', 'rainbow', 'fiber', 'sun', 'visible', 'filter'];
      const heatKws = ['heat', 'thermal', 'fire', 'flame', 'burn', 'lava', 'molten', 'melt', 'ice', 'frost', 'freeze', 'temperature', 'thermometer', 'steam', 'boil', 'evaporate', 'sublimate', 'entropy', 'cold', 'hot'];

      const domainKws = { '力': forceKws, '电': elecKws, '声': soundKws, '光': lightKws, '热': heatKws };
      const cardDomain = card.domain.replace(/[\[\]'"]/g, '').split(',')[0].trim();

      let otherDomainScore = 0;
      for (const [dom, kws] of Object.entries(domainKws)) {
        if (dom === cardDomain) continue;
        for (const kw of kws) {
          if (fname.includes(kw)) otherDomainScore++;
        }
      }
      // If the file strongly matches a different domain, penalize
      if (otherDomainScore > 2 && score < 30) score = Math.max(0, score - otherDomainScore * 5);
    }

    if (score > 0) {
      candidates.push({ file, score });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  results.push({
    cid,
    card,
    candidates: candidates.slice(0, 3),
    bestMatch: candidates.length > 0 ? candidates[0] : null
  });
}

// Sort by domain then ID
const domainOrder = { '力': 0, '声': 1, '光': 2, '热': 3, '电': 4 };
results.sort((a, b) => {
  const da = domainOrder[a.card.domain.replace(/[\[\]'"]/g, '').split(',')[0].trim()] ?? 5;
  const db = domainOrder[b.card.domain.replace(/[\[\]'"]/g, '').split(',')[0].trim()] ?? 5;
  return da - db || a.cid.localeCompare(b.cid);
});

// Output for review
let noGood = 0;
for (const r of results) {
  console.log(r.cid + ' ' + r.card.name + ' [' + r.card.domain + ']');
  if (r.candidates.length === 0) {
    console.log('  ⚠ NO MATCH');
    noGood++;
  } else {
    r.candidates.forEach((c, i) => {
      const marker = c.score >= 1000 ? '🔗DIRECT' : c.score >= 40 ? '⭐GOOD' : c.score >= 20 ? '🤔WEAK' : '❌POOR';
      console.log('  ' + (i + 1) + '. [' + c.score + ' ' + marker + '] ' + c.file.substring(0, 80));
    });
    if (r.candidates[0].score < 20) noGood++;
  }
  console.log('');
}
console.log('=== Summary ===');
console.log('Total unmatched: ' + unmatched.length);
console.log('Poor/No match: ' + noGood);
console.log('Good matches: ' + (unmatched.length - noGood));
