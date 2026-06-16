#!/usr/bin/env python3
"""Generate complete card HTML for all 109 cards v2"""

import json, re, os, glob

BASE = os.path.dirname(os.path.abspath(__file__))
ART_DIR = os.path.join(BASE, 'art_samples', 'card_art')

# === 1. Parse cards.js ===
with open(os.path.join(BASE, 'js', 'cards.js'), 'r', encoding='utf-8') as f:
    cards_js = f.read()

# Domain mapping: Chinese -> English
DOMAIN_MAP = {'力': 'force', '电': 'electric', '声': 'sound', '光': 'light', '热': 'heat'}

def parse_card(text_block):
    """Parse a card object from JS text"""
    info = {}
    # id
    m = re.search(r'id:\s*"([^"]+)"', text_block)
    if m: info['id'] = m.group(1)
    # name
    m = re.search(r'name:\s*"([^"]*)"', text_block)
    if m: info['name'] = m.group(1)
    # type
    m = re.search(r'type:\s*"([^"]*)"', text_block)
    if m: info['type'] = m.group(1)
    # domain as array ["X"]
    m = re.search(r'domain:\s*\["([^"]*)"', text_block)
    if m:
        info['domain'] = DOMAIN_MAP.get(m.group(1), 'force')
    else:
        info['domain'] = 'force'
    # rarity
    m = re.search(r'rarity:\s*"([^"]*)"', text_block)
    if m: info['rarity'] = m.group(1)
    # desc (cards.js uses "description")
    m = re.search(r'description:\s*"([^"]*)"', text_block)
    if not m:
        m = re.search(r'desc:\s*"([^"]*)"', text_block)
    if m: info['desc'] = m.group(1)
    # principle
    m = re.search(r'principle:\s*"([^"]*)"', text_block)
    if m: 
        info['principle'] = m.group(1)
    else:
        # Try formula as principle
        m = re.search(r'formula:\s*`([^`]*)`', text_block)
        if m:
            info['principle'] = m.group(1).strip()
        else:
            m = re.search(r'formula:\s*"([^"]*)"', text_block)
            if m: info['principle'] = m.group(1)
    # cost
    m = re.search(r'cost:\s*(\d+)', text_block)
    if m: info['cost'] = m.group(1)
    # damage
    m = re.search(r'damage:\s*(\d+)', text_block)
    if m: info['damage'] = m.group(1)
    # hp
    m = re.search(r'hp:\s*(\d+)', text_block)
    if m: info['hp'] = m.group(1)
    
    return info

# Extract all card blocks using brace-counter (handles arbitrary nesting)
blocks = []
depth = 0
start = -1
for i, ch in enumerate(cards_js):
    if ch == '{':
        if depth == 0:
            rest = cards_js[i:i+20]
            if re.match(r'\{\s*id:\s*"[A-Z]\d+"', rest):
                start = i
        depth += 1
    elif ch == '}':
        depth -= 1
        if depth == 0 and start >= 0:
            block = cards_js[start:i+1]
            blocks.append(block)
            start = -1

cards = []
for block in blocks:
    info = parse_card(block)
    if info.get('id'):
        cards.append(info)

print(f"Parsed {len(cards)} cards from cards.js")

# === 2. Scan card_art directory for all images ===
all_art_files = set(os.listdir(ART_DIR))
png_files = {f for f in all_art_files if f.endswith('.png') and not f.startswith('.')}

print(f"Found {len(png_files)} PNG files in card_art/")

# === 3. Parse approved_cards.json ===
with open(os.path.join(BASE, 'approved_cards.json'), 'r', encoding='utf-8') as f:
    approved = json.load(f)

# Build ID -> filename mapping
id_to_file = {}
for batch_name, entries in approved.items():
    for card_id, val in entries.items():
        if val != 'approved':
            id_to_file[card_id] = val

# For "prev" approved cards (val == "approved"), we need to find files
prev_approved = set()
for card_id, val in approved.get('prev', {}).items():
    if val == 'approved':
        prev_approved.add(card_id)

print(f"Explicit file mappings: {len(id_to_file)} cards")
print(f"Prev-only (need file scan): {len(prev_approved)} cards")

# === 4. Build filename matching function ===
def find_card_art(card_id):
    """Find the best art file for a card"""
    # 1. Check explicit mapping
    if card_id in id_to_file:
        fname = id_to_file[card_id]
        if fname in png_files:
            return fname
        # Also check if it exists in art dir
        full = os.path.join(ART_DIR, fname)
        if os.path.exists(full):
            return fname
    
    # 2. Search by ID prefix patterns
    cid_lower = card_id.lower()
    cid_upper = card_id.upper()
    
    # Try exact matches first
    for f in png_files:
        fl = f.lower()
        # Pattern: a01_*
        if fl.startswith(cid_lower + '_') or fl.startswith(cid_lower + '-'):
            return f
        # Pattern: *A01_* or *A01.*
        if f.startswith(cid_upper + '_') or f.startswith(cid_upper + '-'):
            return f
    
    # 3. For scientist cards, try to find the correct one
    # (C01-C14, T01-T03 are special)
    
    return None

# Build final mapping
final_mapping = {}
missing_cards = []
for card in cards:
    cid = card['id']
    art = find_card_art(cid)
    if art:
        final_mapping[cid] = art
    else:
        missing_cards.append(cid)

print(f"\nArt files found: {len(final_mapping)}/{len(cards)}")
if missing_cards:
    print(f"Missing: {missing_cards}")
else:
    print("All cards have art files!")

# === 5. Generate HTML ===
# Get template CSS
with open(os.path.join(BASE, 'art_samples', 'complete_card_design.html'), 'r', encoding='utf-8') as f:
    template_html = f.read()

style_match = re.search(r'<style>(.*?)</style>', template_html, re.DOTALL)
template_css = style_match.group(1) if style_match else ''

# Load per-domain runes
with open(os.path.join(BASE, 'domain_runes.json'), 'r', encoding='utf-8') as f:
    DOMAIN_RUNES = json.load(f)

DOMAIN_CSS = {
    'force': 'force', 'electric': 'electric', 'sound': 'sound',
    'light': 'light-domain', 'heat': 'heat', 'chaos': 'chaos',
}
TYPE_PIP = {'attack': 'attack', 'support': 'support', 'summon': 'summon'}
TYPE_LABEL = {'attack': '攻击', 'support': '辅助', 'summon': '召唤'}
RARITY_CSS = {'common': 'common', 'rare': 'rare', 'epic': 'epic', 'legendary': 'legendary', 'mythic': 'mythic'}

DOMAIN_ORDER = ['force', 'electric', 'sound', 'light', 'heat', 'chaos']
DOMAIN_LABELS = {
    'force': '力 Force', 'electric': '电 Electric', 'sound': '声 Sound',
    'light': '光 Light', 'heat': '热 Heat', 'chaos': '混沌 Chaos',
}

def get_stat_info(card):
    ctype = card.get('type', 'attack')
    if ctype == 'summon':
        hp = card.get('hp', '300')
        bonus = card.get('damage', card.get('cost', '20'))
        return f'+{bonus}', '领域加成', hp
    elif ctype == 'support':
        desc_text = card.get('desc', '')
        dm = re.search(r'([+-]\d+)', desc_text)
        val = dm.group(1) if dm else (card.get('damage', '—'))
        return val, '效果值', None
    else:
        damage = card.get('damage', '')
        if not damage:
            dm = re.search(r'造成\s*(\d+)', card.get('desc', ''))
            damage = dm.group(1) if dm else '—'
        return damage, '伤害', None

def generate_card_html(card):
    cid = card['id']
    name = card.get('name', cid)
    domain = card.get('domain', 'force')
    ctype = card.get('type', 'attack')
    rarity = card.get('rarity', 'common')
    desc = card.get('desc', '')
    principle = card.get('principle', '')
    cost = card.get('cost', '0')
    
    # Remap C01-C04 (四神兽) and T## (相变) to chaos domain
    CHAOS_IDS = {'C01', 'C02', 'C03', 'C04'}
    if cid.startswith('T') or cid in CHAOS_IDS:
        domain = 'chaos'
    
    domain_css = DOMAIN_CSS.get(domain, 'force')
    rarity_css = RARITY_CSS.get(rarity, 'common')
    type_pip = TYPE_PIP.get(ctype, 'attack')
    type_label = TYPE_LABEL.get(ctype, '攻击')
    stat_num, stat_unit, hp = get_stat_info(card)
    
    # Per-domain rune
    rune = DOMAIN_RUNES.get(domain, DOMAIN_RUNES.get('force', ''))
    
    art_file = final_mapping.get(cid, '')
    if art_file:
        art_file = f'art_samples/card_art/{art_file}'
    
    # Truncate desc for 90px box
    if len(desc) > 180:
        desc = desc[:177] + '...'
    
    hp_html = f'<div class="hp-stat"><span>❤</span><span class="hp-num">{hp}</span></div>' if hp else ''
    
    return f'''
    <!-- {cid} {name} -->
    <div class="card-set"><span class="skin-badge cyber">Cyberpunk</span>
    <div class="card {domain_css} cyber {rarity_css}">
      <div class="card-header">
        <div class="cost-gem">{cost}</div>
        <div class="card-title-bar"><div class="card-title">{name}</div></div>
        <div class="domain-rune"><img src="{rune}" class="rune-img"></div>
      </div>
      <div class="type-ribbon"><span class="type-pip {type_pip}">{type_label}</span></div>
      <div class="art-frame" style="position:relative"><img src="{art_file}" alt="{name}"><div class="art-corner tl"></div><div class="art-corner tr"></div><div class="art-corner bl"></div><div class="art-corner br"></div></div>
      <div class="ornate-divider"><span class="line"></span><span class="gem"></span><span class="line"></span></div>
      <div class="card-stats"><div class="main-stat"><span class="stat-num">{stat_num}</span><span class="stat-unit">{stat_unit}</span></div>{hp_html}</div>
      <div class="card-desc-box"><div class="card-desc">{desc}</div><span class="card-principle">{principle}</span></div>
    </div></div>'''

# Group and sort
domain_groups = {d: [] for d in DOMAIN_ORDER}
for card in cards:
    cid = card.get('id', '')
    # Remap C01-C04 (四神兽) and T## (相变) to chaos
    CHAOS_IDS = {'C01', 'C02', 'C03', 'C04'}
    if cid.startswith('T') or cid in CHAOS_IDS:
        d = 'chaos'
    else:
        d = card.get('domain', 'force')
        if d not in DOMAIN_ORDER:
            d = 'force'
    domain_groups[d].append(card)

for d in DOMAIN_ORDER:
    domain_groups[d].sort(key=lambda c: (
        {'attack': 0, 'support': 1, 'summon': 2}.get(c.get('type', 'attack'), 0),
        c['id']
    ))

# Build HTML
tab_css = ''
tab_colors = {
    'force': ('var(--force)', 'var(--force-light)'),
    'electric': ('var(--electric)', 'var(--electric-light)'),
    'sound': ('var(--sound)', 'var(--sound-light)'),
    'light': ('var(--light-color)', '#ffe080'),
    'heat': ('var(--heat)', 'var(--heat-light)'),
    'chaos': ('var(--chaos)', '#c084fc'),
}

tab_buttons = ''
domain_sections = ''

for i, domain in enumerate(DOMAIN_ORDER):
    active = 'active' if i == 0 else ''
    tc = tab_colors[domain]
    tab_css += f'.tab-{domain}.active{{border-color:{tc[0]};color:{tc[1]};box-shadow:0 0 20px {tc[0]}33,inset 0 0 20px {tc[0]}08}}\n'
    tab_buttons += f'<button class="domain-tab tab-{domain} {active}" onclick="switchDomain(\'{domain}\')">{DOMAIN_LABELS[domain][0]}</button>\n'
    
    cards_html = '\n'.join(generate_card_html(c) for c in domain_groups[domain])
    sc = 'active' if i == 0 else ''
    domain_sections += f'''
<div class="domain-section {sc}" id="{domain}-section">
  <h2>{DOMAIN_LABELS[domain]}</h2>
  <div class="cards-grid">
{cards_html}
  </div>
</div>
'''

total = sum(len(v) for v in domain_groups.values())
counts = ', '.join(f'{DOMAIN_LABELS[d][0]}={len(domain_groups[d])}' for d in DOMAIN_ORDER)

html = f'''<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>物理卡牌对战 · 全部{total}张</title>
<style>
  :root{{
    --bg:#0a0a12;--card-inner:#14161e;--text:#e8ecf1;--text-dim:#8890a4;
    --gold:#d4a853;--gold-bright:#f0d070;--gold-dark:#8b6914;
    --force:#E74C3C;--force-light:#f06050;--force-dark:#8b1a1a;
    --electric:#9B59B6;--electric-light:#b870d8;--electric-dark:#4a1d6e;
    --sound:#16A085;--sound-light:#1de0b5;--sound-dark:#0a5c4a;
    --light:#F39C12;--light-color:#ffc04d;--light-dark:#8b5a00;
    --heat:#E67E22;--heat-light:#f0a04d;--heat-dark:#8a3d0a;
    --chaos:#9333ea;--chaos-light:#c084fc;--chaos-dark:#581c87;
    --cyber-accent:#00e5ff;--anime-accent:#ff6b9d;
    --rare-gold:#f0c040;--common-silver:#7eb8da;
    --summon-hp:#4ecdc4;--attack-red:#e06050;--support-green:#3cb371;
  }}
  *{{margin:0;padding:0;box-sizing:border-box}}
  body{{
    background:var(--bg);
    background-image:radial-gradient(ellipse at 20% 0%,rgba(231,76,60,.04),transparent 60%),
      radial-gradient(ellipse at 80% 0%,rgba(155,89,182,.04),transparent 60%);
    color:var(--text);font-family:'Segoe UI','Noto Sans SC',sans-serif;min-height:100vh;
  }}
  .hero{{text-align:center;padding:36px 20px 16px}}
  .hero h1{{font-size:1.8em;letter-spacing:3px;text-transform:uppercase}}
  .hero h1 span{{
    background:linear-gradient(135deg,var(--force),var(--electric));
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  }}
  .hero p{{color:var(--text-dim);font-size:.88em;margin-top:4px}}
  .domain-tabs{{display:flex;justify-content:center;gap:12px;margin:16px 0 28px;
    position:sticky;top:10px;z-index:100;flex-wrap:wrap}}
  .domain-tab{{padding:10px 24px;border-radius:6px;border:1.5px solid #2a2a3a;
    background:#12141c;color:var(--text-dim);cursor:pointer;font-size:.92em;
    font-weight:700;letter-spacing:2px;transition:all .3s;text-transform:uppercase}}
  .domain-tab:hover{{border-color:#444;color:#ccc}}
  {tab_css}
  .domain-section{{display:none;max-width:1500px;margin:0 auto;padding:0 20px 60px}}
  .domain-section.active{{display:block}}
  .domain-section h2{{text-align:center;font-size:1.25em;margin-bottom:28px;
    color:var(--text-dim);letter-spacing:2px;text-transform:uppercase}}
  .cards-grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:50px 36px;justify-items:center}}
  .card-set{{text-align:center}}
  .skin-badge{{display:inline-block;padding:5px 20px;border-radius:20px;font-size:.72em;
    font-weight:700;letter-spacing:2px;margin-bottom:14px;text-transform:uppercase}}
  .skin-badge.cyber{{background:rgba(0,229,255,.1);color:var(--cyber-accent);border:1px solid rgba(0,229,255,.35)}}
  .card{{
    min-width:380px;max-width:380px;border-radius:16px;background:var(--card-inner);
    position:relative;text-align:left;box-shadow:0 16px 48px rgba(0,0,0,.55);
    transition:transform .4s cubic-bezier(.34,1.56,.64,1);
    border:2.5px solid transparent;background-clip:padding-box;
  }}
  .card::before{{content:'';position:absolute;inset:-3px;border-radius:18px;z-index:-1}}
  .card:hover{{transform:translateY(-6px)}}
  .card:active{{transform:translateY(-2px)}}
  .card.force{{border-color:var(--force-dark)}}
  .card.force::before{{background:linear-gradient(135deg,var(--force-dark),var(--force),var(--force-light),var(--force),var(--force-dark));opacity:.3}}
  .card.electric{{border-color:var(--electric-dark)}}
  .card.electric::before{{background:linear-gradient(135deg,var(--electric-dark),var(--electric),var(--electric-light),var(--electric),var(--electric-dark));opacity:.3}}
  .card.sound{{border-color:var(--sound-dark)}}
  .card.sound::before{{background:linear-gradient(135deg,var(--sound-dark),var(--sound),var(--sound-light),var(--sound),var(--sound-dark));opacity:.3}}
  .card.light-domain{{border-color:var(--light-dark)}}
  .card.light-domain::before{{background:linear-gradient(135deg,var(--light-dark),var(--light-color),#fff3a0,var(--light-color),var(--light-dark));opacity:.3}}
  .card.heat{{border-color:var(--heat-dark)}}
  .card.heat::before{{background:linear-gradient(135deg,var(--heat-dark),var(--heat),var(--heat-light),var(--heat),var(--heat-dark));opacity:.3}}
  .card.cyber::after{{content:'';position:absolute;inset:6px;border-radius:12px;border:1px solid rgba(255,255,255,.06);pointer-events:none;z-index:1}}
  .card.common{{border-color:#5a6675;box-shadow:0 0 1px rgba(90,102,117,.15),0 16px 48px rgba(0,0,0,.55)}}
  .card.common::before{{background:#5a6675;opacity:.4}}
  .card.rare{{border-color:#c47a38;box-shadow:0 0 6px rgba(196,122,56,.3),0 16px 48px rgba(0,0,0,.55)}}
  .card.rare::before{{background:linear-gradient(135deg,#6b3a0a,#c47a38,#e0a858,#c47a38,#6b3a0a);opacity:.47}}
  .card.epic{{border-color:#8868a8;box-shadow:0 0 10px rgba(136,104,168,.4),0 16px 48px rgba(0,0,0,.55)}}
  .card.epic::before{{background:linear-gradient(135deg,#3a1a6a,#8868a8,#c8a0e8,#8868a8,#3a1a6a);opacity:.51}}
  .card.legendary{{border-color:#d49030;box-shadow:0 0 14px rgba(212,144,48,.45),0 16px 48px rgba(0,0,0,.55)}}
  .card.legendary::before{{background:linear-gradient(135deg,#5a2a00,#d49030,#ffe080,#d49030,#5a2a00);opacity:.55}}
  @property --m-angle{{syntax:'<angle>';initial-value:0deg;inherits:false}}
  @keyframes mythic-spin{{to{{--m-angle:360deg}}}}
  .card.mythic{{border-color:#ff6bff;box-shadow:0 0 18px rgba(255,160,220,.45),0 16px 48px rgba(0,0,0,.55)}}
  .card.mythic::before{{background:conic-gradient(from var(--m-angle,0deg),#ff6bff,#ffb070,#70d0ff,#90ff90,#ff6bff,#ffb070,#70d0ff,#ff6bff);opacity:.6;animation:mythic-spin 4s linear infinite}}
  .card-header{{display:flex;align-items:center;justify-content:space-between;padding:12px 16px 4px;gap:8px;position:relative;z-index:2}}
  .cost-gem{{width:40px;height:40px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.15em;position:relative;background:radial-gradient(circle at 35% 35%,#1a1a2e,#0a0a14);box-shadow:inset 0 0 8px rgba(0,0,0,.6)}}
  .cost-gem::before{{content:'';position:absolute;inset:-2.5px;border-radius:50%;background:conic-gradient(from 0deg,var(--gold-dark),var(--gold-bright),var(--gold),var(--gold-bright),var(--gold-dark));z-index:-1;-webkit-mask:radial-gradient(circle,transparent 19px,#000 19.5px);mask:radial-gradient(circle,transparent 19px,#000 19.5px)}}
  .card.force .cost-gem{{color:var(--force-light)}}
  .card.electric .cost-gem{{color:var(--electric-light)}}
  .card.sound .cost-gem{{color:var(--sound-light)}}
  .card.light-domain .cost-gem{{color:var(--light-color)}}
  .card.heat .cost-gem{{color:var(--heat-light)}}
  .card-title-bar{{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;min-width:0}}
  .card-title{{font-size:1.05em;font-weight:800;letter-spacing:3px;white-space:nowrap;padding:2px 0;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6)}}
  .card.force .card-title{{color:var(--force-light)}}
  .card.electric .card-title{{color:var(--electric-light)}}
  .card.sound .card-title{{color:var(--sound-light)}}
  .card.light-domain .card-title{{color:#ffe080}}
  .card.heat .card-title{{color:var(--heat-light)}}
  .domain-rune{{width:28px;height:28px;flex-shrink:0;display:flex;align-items:center}}
  .rune-img{{width:100%;height:100%;object-fit:contain;display:block}}
  .type-ribbon{{display:flex;justify-content:center;padding:1px 0 8px;position:relative;z-index:2}}
  .type-pip{{padding:2px 10px;border-radius:3px;font-size:.66em;font-weight:700;letter-spacing:1px;text-transform:uppercase}}
  .type-pip.attack{{background:rgba(224,96,80,.2);color:var(--attack-red);border:1px solid rgba(224,96,80,.3)}}
  .type-pip.support{{background:rgba(60,179,113,.2);color:var(--support-green);border:1px solid rgba(60,179,113,.3)}}
  .type-pip.summon{{background:rgba(240,192,64,.2);color:var(--rare-gold);border:1px solid rgba(240,192,64,.3)}}
  .art-frame{{margin:0;position:relative;z-index:2;height:340px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 40%,#1a1d28 0%,#0d0e16 100%)}}
  .art-frame img{{width:calc(100% - 16px);height:calc(100% - 16px);object-fit:cover;object-position:50% 20%;display:block;border-radius:2px}}
  .art-corner{{position:absolute;width:16px;height:16px;z-index:3;pointer-events:none;border-color:rgba(212,168,83,.45)}}
  .art-corner.tl{{top:8px;left:8px;border-top:2px solid;border-left:2px solid}}
  .art-corner.tr{{top:8px;right:8px;border-top:2px solid;border-right:2px solid}}
  .art-corner.bl{{bottom:8px;left:8px;border-bottom:2px solid;border-left:2px solid}}
  .art-corner.br{{bottom:8px;right:8px;border-bottom:2px solid;border-right:2px solid}}
  .card.cyber .art-frame::after{{content:'';position:absolute;inset:0;pointer-events:none;z-index:4;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,229,255,.04) 2px,rgba(0,229,255,.04) 4px)}}
  .ornate-divider{{display:flex;align-items:center;gap:6px;padding:6px 20px 2px;position:relative;z-index:2}}
  .ornate-divider .line{{flex:1;height:1px}}
  .card.force .ornate-divider .line{{background:linear-gradient(90deg,transparent,var(--force-dark),var(--force),var(--force-dark),transparent)}}
  .card.electric .ornate-divider .line{{background:linear-gradient(90deg,transparent,var(--electric-dark),var(--electric),var(--electric-dark),transparent)}}
  .card.sound .ornate-divider .line{{background:linear-gradient(90deg,transparent,var(--sound-dark),var(--sound),var(--sound-dark),transparent)}}
  .card.light-domain .ornate-divider .line{{background:linear-gradient(90deg,transparent,var(--light-dark),var(--light-color),var(--light-dark),transparent)}}
  .card.heat .ornate-divider .line{{background:linear-gradient(90deg,transparent,var(--heat-dark),var(--heat),var(--heat-dark),transparent)}}
  .ornate-divider .gem{{width:6px;height:6px;border-radius:1px;transform:rotate(45deg)}}
  .card.force .ornate-divider .gem{{background:var(--force);box-shadow:0 0 6px var(--force)}}
  .card.electric .ornate-divider .gem{{background:var(--electric);box-shadow:0 0 6px var(--electric)}}
  .card.sound .ornate-divider .gem{{background:var(--sound);box-shadow:0 0 6px var(--sound)}}
  .card.light-domain .ornate-divider .gem{{background:var(--light-color);box-shadow:0 0 6px var(--light-color)}}
  .card.heat .ornate-divider .gem{{background:var(--heat);box-shadow:0 0 6px var(--heat)}}
  .card-stats{{padding:0 20px 4px;position:relative;z-index:2;display:flex;align-items:center;gap:10px}}
  .main-stat{{display:flex;align-items:baseline;gap:6px}}
  .main-stat .stat-num{{font-size:1.5em;font-weight:900;line-height:1}}
  .card.force .main-stat .stat-num{{color:var(--force);text-shadow:0 0 10px rgba(231,76,60,.4)}}
  .card.electric .main-stat .stat-num{{color:var(--electric);text-shadow:0 0 10px rgba(155,89,182,.4)}}
  .card.sound .main-stat .stat-num{{color:var(--sound);text-shadow:0 0 10px rgba(22,160,133,.4)}}
  .card.light-domain .main-stat .stat-num{{color:var(--light-color);text-shadow:0 0 10px rgba(243,156,18,.4)}}
  .card.heat .main-stat .stat-num{{color:var(--heat);text-shadow:0 0 10px rgba(230,126,34,.4)}}
  .main-stat .stat-unit{{font-size:.68em;color:var(--text-dim)}}
  .hp-stat{{margin-left:auto;display:flex;align-items:center;gap:4px;padding:3px 10px;border-radius:4px;background:rgba(78,205,196,.08);border:1px solid rgba(78,205,196,.2)}}
  .hp-stat .hp-num{{font-weight:800;font-size:.9em;color:var(--summon-hp)}}
  .card-desc-box{{margin:0 20px 14px;padding:10px 10px 8px;position:relative;z-index:2;border-radius:4px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.05);height:90px;overflow:hidden}}
  .card.force .card-desc-box{{border-left:2px solid rgba(231,76,60,.4)}}
  .card.electric .card-desc-box{{border-left:2px solid rgba(155,89,182,.4)}}
  .card.sound .card-desc-box{{border-left:2px solid rgba(22,160,133,.4)}}
  .card.light-domain .card-desc-box{{border-left:2px solid rgba(243,156,18,.4)}}
  .card.heat .card-desc-box{{border-left:2px solid rgba(230,126,34,.4)}}
  .card.chaos{{border-color:var(--chaos-dark)}}
  .card.chaos::before{{background:conic-gradient(from var(--m-angle,0deg),var(--chaos-dark),var(--chaos),var(--chaos-light),var(--chaos),var(--chaos-dark));opacity:.4;animation:mythic-spin 6s linear infinite}}
  .card.chaos .cost-gem{{color:var(--chaos-light)}}
  .card.chaos .card-title{{color:var(--chaos-light)}}
  .card.chaos .ornate-divider .line{{background:linear-gradient(90deg,transparent,var(--chaos-dark),var(--chaos),var(--chaos-dark),transparent)}}
  .card.chaos .ornate-divider .gem{{background:var(--chaos);box-shadow:0 0 6px var(--chaos)}}
  .card.chaos .main-stat .stat-num{{color:var(--chaos);text-shadow:0 0 10px rgba(147,51,234,.4)}}
  .card.chaos .card-desc-box{{border-left:2px solid rgba(147,51,234,.4)}}
  .card.chaos .card-principle{{background:rgba(147,51,234,.12);color:var(--chaos-light);border:1px solid rgba(147,51,234,.2)}}
  .card-desc{{font-size:.72em;color:#e0e0e0;line-height:1.65;margin-bottom:6px;text-shadow:0 1px 2px rgba(0,0,0,.5)}}
  .card-principle{{font-family:'Consolas','Courier New',monospace;font-size:.7em;font-weight:700;letter-spacing:.5px;padding:3px 6px;border-radius:3px;display:inline-block}}
  .card.force .card-principle{{background:rgba(231,76,60,.12);color:var(--force-light);border:1px solid rgba(231,76,60,.2)}}
  .card.electric .card-principle{{background:rgba(155,89,182,.12);color:var(--electric-light);border:1px solid rgba(155,89,182,.2)}}
  .card.sound .card-principle{{background:rgba(22,160,133,.12);color:var(--sound-light);border:1px solid rgba(22,160,133,.2)}}
  .card.light-domain .card-principle{{background:rgba(243,156,18,.12);color:var(--light-color);border:1px solid rgba(243,156,18,.2)}}
  .card.heat .card-principle{{background:rgba(230,126,34,.12);color:var(--heat-light);border:1px solid rgba(230,126,34,.2)}}
  @media(max-width:1300px){{.cards-grid{{grid-template-columns:repeat(2,1fr)}}}}
  @media(max-width:860px){{.cards-grid{{grid-template-columns:1fr}}.card{{width:100%;max-width:380px}}}}
</style>
</head>
<body>
<div class="hero">
  <h1><span>物理卡牌对战</span></h1>
  <p>{total} 张卡牌 · 5领域 · Cyberpunk风格 · {counts}</p>
</div>
<div class="domain-tabs">
{tab_buttons}
</div>
{domain_sections}
<script>
function switchDomain(d) {{
  document.querySelectorAll('.domain-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.domain-section').forEach(s => s.classList.remove('active'));
  document.querySelector('.tab-' + d).classList.add('active');
  document.getElementById(d + '-section').classList.add('active');
}}
</script>
</body>
</html>'''

output = os.path.join(BASE, 'all_cards.html')
with open(output, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"\n✅ Generated: {output}")
print(f"   Size: {os.path.getsize(output):,} bytes")
print(f"   Domains: {counts}")

# Report missing images
still_missing = [c for c in cards if c['id'] not in final_mapping]
if still_missing:
    print(f"\n⚠️  Still missing art: {len(still_missing)} cards")
    for c in still_missing:
        print(f"   {c['id']} {c.get('name','?')}")
