"""Generate cyberpunk prompts for all 80 Phase-5 card art."""
import json

# ====== Cyberpunk scene descriptions by card ID ======
# Format: card_id -> cyberpunk visual description
SCENES = {
    # === FORCE 力 ===
    "A03": "A needle-thin concentrated force beam piercing through multiple layers of reinforced armor plating, neon blue sparks erupting at impact point, dark industrial corridor",
    "A04": "A massive mechanical lever with glowing neon fulcrum lifting a futuristic structure, neon orange energy lines tracing the force distribution, dark factory backdrop",
    "A05": "A colossal boulder suspended high above a cyberpunk city, glowing neon blue gravity field lines warping around it, dramatic volumetric lighting from below",
    "A06": "A high-speed projectile leaving neon orange motion trails, shattering through concrete pillars in slow motion, debris frozen mid-air in a dark industrial arena",
    "A08": "A massive mechanical piston driving forward with explosive force, neon yellow energy radiating from the impact zone, dark industrial setting with sparks flying",
    "A32": "Concentric shockwave rings glowing with neon cyan pushing outward from a speaker array, visible force ripples distorting the air in a dark futuristic chamber",
    "A43": "A massive cybernetic piston compressing glowing hot gas, neon orange pressure lines converging, steam hissing through vents in a dark engine room",

    # === SUPPORT FORCE ===
    "S01": "A cybernetic figure growing in mass, neon blue energy accumulating around their body, metal floor cracking beneath their weight, dark laboratory",
    "S02": "A capacitor bank surging with stored kinetic energy, neon yellow arcs dancing between terminals, industrial power station at night",
    "S03": "A hydraulic press focusing enormous force onto a single needle point, neon red pressure lines converging, sparks scattering in dark workshop",
    "S04": "Cyberpunk friction brakes glowing red hot against a spinning wheel, neon orange heat radiating, smoke rising in a dark mechanic bay",
    "S05": "Multiple neon force vectors combining into a single massive energy beam, transparent geometric arrow overlays, dark cyberpunk command center",

    # === SOUND 声 ===
    "A09": "Ultrasonic waves visible as concentric neon cyan rings blasting dirt and debris off a cybernetic surface, water droplets suspended mid-air, dark laboratory",
    "A10": "Massive subwoofer arrays emitting low frequency waves that distort the air, neon purple shockwave rings expanding, broken glass floating in a dark arena",
    "A13": "Identical neon sound waves overlapping and amplifying each other in a mirrored chamber, holographic frequency display pulsing violently, dark resonance hall",
    "A14": "A towering soundproof wall reflecting a massive pink neon shockwave backward, echo visualization showing the return path, dark futuristic chamber",
    "A45": "Two cybernetic ear-like sensors triangulating a sound source with neon laser grids, holographic waveform analysis overlay, dark surveillance room",

    # === SUPPORT SOUND ===
    "S08": "Chaotic neon noise waves in red and orange clashing violently, holographic frequency display going haywire, cyberpunk figure clutching their ears in a dark room",
    "S10": "A massive tuning fork glowing with accumulating neon resonance energy, concentric wave rings pulsing outward, dark cyberpunk laboratory",
    "S12": "A parabolic dish focusing neon green sound waves into a devastating beam, energy converging to a single point, dark futuristic arena",
    "S13": "A holographic radar screen pulsing with neon blue sonar rings, wireframe target visualization appearing, dark cyberpunk command center",

    # === LIGHT 光 ===
    "A15": "A precision laser beam in neon red cutting through thick steel plate, molten metal dripping with orange glow, sparks cascading in dark industrial facility",
    "A16": "White light entering a crystal prism and exploding into vibrant neon rainbow beams, holographic spectral analysis overlay, dark optical laboratory",
    "A17": "Invisible infrared heat rays visualized as neon red beams melting through metal, thermal glow map overlay showing temperature distribution",
    "A18": "Ultraviolet neon purple rays destroying a colony of glowing green microorganisms, DNA helix structures disintegrating, dark sterile laboratory",
    "A19": "A beam of neon blue light traveling through a coiled fiber optic cable, total internal reflection shown with glowing bounce points, dark tech chamber",
    "A20": "Intense sunlight amplified through a massive lens array, neon yellow beams converging on a target, heat shimmer distorting the air, dark rooftop",

    # === SUPPORT LIGHT ===
    "S14": "A cyberpunk optical filter splitting a white beam into a single pure neon green wavelength, other colors blocked by geometric barriers, dark lab",
    "S15": "Polarized light passing through a grid of glowing neon filters, only vertical waves remaining, horizontal waves blocked by red barriers",
    "S16": "A beam of light traveling at impossible speed, neon trails leaving afterimages, clock displays frozen in the background, dark cyberpunk city",
    "S17": "Seven neon color beams overlapping and merging into brilliant white light, spectral prism reverse-engineering, dark optical chamber",
    "S18": "X-ray vision scanning through a cyberpunk figure, neon blue skeleton and hidden circuitry revealed, dark medical bay",
    "S19": "Endless reflections of a neon figure trapped in a mirrored hallway, each reflection slightly different, disorienting perspective, dark maze",
    "S20": "A cyberpunk figure casting a solid shadow that takes physical form, neon purple rim light defining the silhouette, dark urban alley",
    "S21": "A holographic lens projecting both an inverted enlarged image and an upright enlarged image simultaneously, neon split visualization, dark optical lab",

    # === HEAT 热 ===
    "A21": "Intense flames burning through a cyberpunk target, neon orange and red fire with heat distortion ripples, dark industrial forge",
    "A22": "Swirling currents of glowing hot and cool blue fluid mixing in a cyberpunk heat exchanger, thermal gradient visualization, dark engineering bay",
    "A23": "Concentric rings of neon orange thermal radiation pulsing outward from a glowing sphere, no medium needed in the vacuum, dark space background",
    "A24": "Molten lava erupting with neon orange glow from a cyberpunk volcano, sparks and embers flying, dark apocalyptic cityscape",
    "A25": "Water flash-boiling into steam on contact with superheated cyberpunk surface, neon transition visualization, dark industrial chamber",
    "A47": "Solid matter instantly sublimating into glowing neon pink gas, explosive expansion of vapor, cold frost forming at the edges, dark laboratory",

    # === SUPPORT HEAT ===
    "S22": "A hexagonal energy shield of neon blue ice crystals deflecting incoming fire attacks, thermal barrier visualization, dark cyberpunk battlefield",
    "S23": "A steampunk-cyberpunk engine converting glowing orange heat energy into mechanical motion, gears turning with neon highlights",
    "S24": "A holographic thermometer showing temperature rapidly climbing into the red zone, neon red glow intensifying, dark industrial furnace backdrop",
    "S25": "Glowing frost forming as latent heat is violently extracted, neon blue ice crystals growing over burning surfaces, dark thermal laboratory",
    "S26": "Multiple heat sources converging into a single intense focal point, neon orange concentration beams, thermal lens array, dark engineering bay",

    # === ELECTRIC 电 ===
    "A27": "A massive lightning bolt in neon purple striking from a dark storm cloud, branching tendrils of electricity, cyberpunk city skyline silhouetted below",
    "A28": "Chain lightning in neon blue jumping between multiple cyberpunk targets, each arc leaving glowing afterimages, dark urban battlefield",
    "A29": "A high-voltage electric arc burning through the air with intense neon white heat, plasma glow illuminating the dark industrial surroundings",
    "A30": "An electromagnetic pulse radiating outward as concentric neon cyan rings, electronic devices sparking and dying in the blast radius, dark control room",
    "A44": "A simple electric spark jumping between two electrodes, neon yellow flash, the most basic discharge in a dark cyberpunk circuit board macro view",
    "A48": "Static electricity building up as neon blue tendrils on a cyberpunk figure's hand, about to discharge violently, dark room with floating dust particles",
    "A49": "A circuit board overloaded with too much current, neon red glow intensifying, components melting and smoking, dramatic failure moment",

    # === SUPPORT ELECTRIC ===
    "S28": "A magnet moving through a coil of neon-lit copper wire, induced current visualized as pulsing blue energy, dark cyberpunk generator room",
    "S29": "Static electricity pulling small glowing particles from a cyberpunk surface, neon blue attraction lines, purification visualization",
    "S30": "A switch being thrown to create a direct short circuit, neon orange current bypassing the intended path, sparks flying, dark electrical room",
    "S31": "High voltage breaking through an insulating barrier, neon purple arc punching through, glowing failure point, dark testing facility",
    "S32": "Low voltage gently powering a single cyberpunk device, soft neon green glow, energy-efficient startup sequence",
    "S33": "Multiple parallel electrical channels opening simultaneously, neon blue current flowing through each path, dark circuit visualization",

    # === CROSS-DOMAIN ===
    "A31": "A massive structure vibrating at its resonant frequency and shattering dramatically, neon orange fracture lines spreading, glass panels exploding, dark futuristic architecture",
    "A33": "A devastating shockwave in concentric neon rings expanding from a central explosion, windows shattering, debris flying, dark cyberpunk street",
    "A34": "Two cyberpunk surfaces violently rubbing together, neon orange friction heat glowing at contact point, smoke rising, dark mechanical bay",
    "A35": "A short circuit melting thick copper wires with intense neon white heat, molten metal dripping, dramatic close-up of destruction",
    "A36": "Joule heating visualized as a wire progressively glowing red to white hot, neon color gradient showing temperature rise, dark laboratory",
    "A37": "Electricity leaking from a damaged cable into a dark puddle, neon blue sparks dancing on the water surface, burn marks spreading",
    "A52": "Light converting into electrical signals through a photoelectric array, neon beams transforming into pulsing circuit lines, dark tech chamber",
    "A40": "A current-carrying wire suspended in a magnetic field experiencing visible force, neon blue energy lines showing the interaction, dark physics lab",
    "A46": "A beam of light bending dramatically as it passes between two different media, neon rainbow refraction at the boundary, dark optics lab",
    "A50": "A mirage shimmering above a hot cyberpunk road, neon city lights reflecting in the illusory water, heat distortion visual effect",

    # === SUPPORT CROSS ===
    "S06": "A massive spring and futuristic elastic band storing potential energy, neon blue energy lines showing the stored force, dark engineering bay",
    "S07": "Anti-noise soundwaves in neon green canceling out incoming red noise waves, destructive interference visualization, dark anechoic chamber",
    "S09": "A futuristic equalizer dial being adjusted, neon frequency spectrum shifting up and down in real time, dark sound studio",
    "S11": "A colossal soundproof barrier wall glowing with neon blue absorption panels, sound waves crashing and dissipating against it, dark arena",

    # === SUMMONS ===
    "C12": "A cyberpunk scientist with neon green frequency rings pulsing around their head, holographic wave displays, 19th century clothing fused with cybernetic implants",
    "C13": "A cyberpunk engineer surrounded by glowing steam engines and neon orange thermal readouts, industrial revolution meets cyberpunk aesthetic",
    "C14": "A cyberpunk figure with electric current flowing through neon-lit cables connected to their body, electromagnetic field visualization, dark laboratory",
    "C09": "A cyberpunk astronomer peering through a neon-lit futuristic telescope, holographic star charts orbiting around them, dark observatory",

    # === MISSING SUPPORT ===
    "S27": "A futuristic resistor grid glowing neon blue as it blocks and absorbs incoming electrical surges, energy dissipating as heat waves, dark cyberpunk power station, cyberpunk style, neon lighting, cinematic composition, dark background, high detail digital art, Full-frame artwork, no borders or text.",

    # === DOMAIN ===
    "D01": "A gravitational field dome warping space itself with neon blue distortion rings, objects being pulled inward, dark cosmic backdrop with cyberpunk elements",
    "D02": "An arena filled with resonant neon green sound waves bouncing off every surface, holographic frequency meters spiking, dark acoustic chamber",
}

# ====== PROMPT TEMPLATE ======
TEMPLATE = "{scene}, cyberpunk style, neon lighting, cinematic composition, dark background, high detail digital art, Full-frame artwork, no borders or text."

# ====== CARD DATA ======
# (from cards.js extraction)
CARDS_RAW = """A03|压强穿刺|attack|力|16|common
A04|杠杆撬击|attack|力|10|common
A05|重力势能|attack|力|14|rare
A06|动能冲击|attack|力|16|common
A08|做功打击|attack|力|15|common
A32|声波推力|attack|声|15|common
A43|活塞压缩|attack|力|13|common
S01|质量增大|support|力|5|common
S02|能量蓄积|support|力|5|common
S03|受力面积缩小|support|力|5|common
S04|摩擦阻碍|support|力|12|common
S05|力的合成|support|力|8|rare
A09|超声清洗|attack|声|15|common
A10|次声震荡|attack|声|20|rare
A13|驻波共振|attack|声|16|common
A14|回声爆破|attack|声|13|common
A45|双耳定位|attack|声|12|common
S08|噪音干扰|support|声|8|common
S10|共振蓄能|support|声|5|common
S12|聚焦声束|support|声|11|common
S13|多普勒探测|support|声|8|common
A15|激光切割|attack|光|25|common
A16|色散分解|attack|光|20|rare
A17|红外灼烧|attack|光|15|common
A18|紫外灭杀|attack|光|16|common
A19|光纤穿透|attack|光|18|common
A20|日光暴晒|attack|光|16|common
S14|滤光|support|光|10|common
S15|偏振过滤|support|光|14|common
S16|光速传播|support|光|14|rare
S17|光谱叠加|support|光|8|common
S18|X射线透视|support|光|14|rare
S19|镜面迷宫|support|光|16|epic
S20|影子束缚|support|光|10|rare
S21|凸透成像|support|光|12|epic
A21|烈焰灼蚀|attack|热|15|rare
A22|热对流|attack|热|14|rare
A23|热辐射|attack|热|20|common
A24|熔岩喷发|attack|热|18|rare
A25|蒸发消散|attack|热|17|rare
A47|升华爆散|attack|热|18|common
S22|比热护盾|support|热|14|rare
S23|热机驱动|support|热|0|common
S24|温度升高|support|热|6|common
S25|潜热释放|support|热|0|epic
S26|热量聚集|support|热|10|common
A27|闪电劈击|attack|电|10|rare
A28|雷暴链击|attack|电|9|rare
A29|电弧灼烧|attack|电|9|common
A30|电磁脉冲|attack|电|10|rare
A44|火花放电|attack|电|8|common
A48|静电爆发|attack|电|8|common
A49|过载放电|attack|电|10|common
S28|电磁感应|support|电|6|common
S29|静电吸附|support|电|8|common
S30|短路开关|support|电|6|rare
S31|高压击穿|support|电|10|common
S32|低压启动|support|电|6|common
S33|多路放电|support|电|6|common
A31|共振爆破|attack|声|20|epic
A33|冲击波|attack|声|19|epic
A34|摩擦生热|attack|热|15|rare
A35|短路熔毁|attack|电|20|epic
A36|焦耳热击|attack|电|18|rare
A37|漏电灼伤|attack|电|14|common
A52|光电信号|attack|光|18|rare
A40|安培力冲击|attack|电|16|rare
A46|折射偏转|attack|光|17|common
A50|海市蜃楼|attack|光|20|rare
S06|弹性储能|support|力|10|rare
S07|回声消声|support|声|10|rare
S09|频率调节|support|声|5|common
S11|隔音屏障|support|声|16|rare
C12|赫兹|summon|声|24|epic
C13|瓦特|summon|热|24|epic
C14|安培|summon|电|24|epic
C09|伽利略|summon|光|26|epic
D01|力之领域·引力场|domain|力|20|rare
D02|声之领域·共鸣场|domain|声|20|rare"""

# Parse cards
cards = []
for line in CARDS_RAW.strip().split('\n'):
    parts = line.split('|')
    cards.append({
        'id': parts[0],
        'name': parts[1],
        'type': parts[2],
        'domain': parts[3],
        'cost': parts[4],
        'rarity': parts[5],
    })

# Generate prompts
print(f"Total cards: {len(cards)}")
print(f"Total scenes: {len(SCENES)}")

missing = []
prompts = []
for c in cards:
    cid = c['id']
    if cid in SCENES:
        prompt = TEMPLATE.format(scene=SCENES[cid])
        prompts.append((cid, c['name'], c['domain'], c['type'], c['rarity'], prompt))
        print(f"  {cid} {c['name']} ✓")
    else:
        missing.append(cid)
        print(f"  {cid} {c['name']} ✗ MISSING SCENE")

if missing:
    print(f"\n⚠ MISSING SCENES FOR: {missing}")

# Save to JSON for generation
import json
output = [{"id": p[0], "name": p[1], "domain": p[2], "type": p[3], "rarity": p[4], "prompt": p[5]} for p in prompts]

with open("cyberpunk_prompts.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\nSaved {len(output)} prompts to cyberpunk_prompts.json")
