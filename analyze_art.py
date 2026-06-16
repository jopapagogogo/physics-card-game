"""Compare template art vs batch art quality objectively."""
from PIL import Image
import os, statistics

ART_DIR = "art_samples/card_art"

# --- "Good" template art (early, user-satisfied) ---
GOOD = [
    "a01_zhonglichuiji_cyber.png",
    "a01_zhonglichuiji_anime.png",
    "a27_gaoyadianji_cyber.png",
    "a27_gaoyadianji_anime.png",
    "c05_niudun_cyber.png",
    "c05_niudun_anime.png",
    "s01_zhiliangzengda_cyber.png",
    "s01_zhiliangzengda_anime.png",
]

# --- "Bad" batch art (June 12, user dissatisfied) ---
BAD = [
    "A_massive_golden_hammer_crushi_2026-06-12T17-34-13.png",
    "A_needle_thin_energy_spike_pie_2026-06-12T17-35-37.png",
    "A_boulder_suspended_high_above_2026-06-12T17-36-29.png",
    "A_glowing_human_figure_dissolv_2026-06-12T17-20-47.png",
    "A_futuristic_warrior_charging__2026-06-12T17-34-41.png",
    "A_single_red_apple_falling_dow_2026-06-12T05-44-52.png",
    "A_cat_split_between_two_quantu_2026-06-12T17-18-33.png",
    "A_massive_lightning_bolt_strik_2026-06-12T17-39-24.png",
    "A_precise_laser_beam_cutting_t_2026-06-12T17-36-02.png",
    "Intense_flames_burning_and_ero_2026-06-12T17-35-52.png",
    "Ultrasonic_waves_blasting_dirt_2026-06-12T17-35-42.png",
    "A_projectile_mid_flight__kinet_2026-06-12T17-36-53.png",
    "An_engineer_surrounded_by_stea_2026-06-12T17-36-40.png",
    "White_light_splitting_into_rai_2026-06-12T17-36-17.png",
    "Sound_waves_bouncing_off_a_mas_2026-06-12T17-36-56.png",
    "A_giant_lever_lifting_a_massiv_2026-06-12T17-36-03.png",
    "Low_frequency_sound_waves_caus_2026-06-12T17-36-07.png",
    "Swirling_currents_of_hot_and_c_2026-06-12T17-36-17.png",
    "A_scientist_measuring_wave_fre_2026-06-12T17-36-15.png",
    "Scientist_James_Joule_surround_2026-06-12T17-08-34.png",
]


def analyze_image(path):
    """Return dict of image metrics."""
    im = Image.open(path).convert("RGB")
    w, h = im.size
    size_kb = os.path.getsize(path) / 1024

    # Sample pixels for color analysis
    pixels = list(im.getdata())
    n = len(pixels)
    
    # Average RGB
    avg_r = sum(p[0] for p in pixels) / n
    avg_g = sum(p[1] for p in pixels) / n
    avg_b = sum(p[2] for p in pixels) / n
    
    # Brightness (perceived)
    brightness = 0.299 * avg_r + 0.587 * avg_g + 0.114 * avg_b
    
    # Saturation (std dev of R,G,B per pixel, averaged)
    saturations = []
    for p in pixels[:5000]:  # sample
        mean = (p[0] + p[1] + p[2]) / 3
        s = ((p[0]-mean)**2 + (p[1]-mean)**2 + (p[2]-mean)**2) / 3
        saturations.append(s ** 0.5)
    avg_saturation = statistics.mean(saturations)
    
    # Contrast (std dev of brightness)
    brightnesses = [0.299*p[0] + 0.587*p[1] + 0.114*p[2] for p in pixels[:5000]]
    contrast = statistics.stdev(brightnesses) if len(brightnesses) > 1 else 0
    
    # Check for white border (top-left 10px strip)
    top_strip = [im.getpixel((x, 0)) for x in range(min(50, w))]
    white_pixels_top = sum(1 for p in top_strip if p[0] > 240 and p[1] > 240 and p[2] > 240)
    
    # Check for text watermark at bottom
    bottom_strip = [im.getpixel((x, h-5)) for x in range(0, w, 5)]
    white_pixels_bottom = sum(1 for p in bottom_strip if p[0] > 240 and p[1] > 240 and p[2] > 240)
    
    # Dark pixel ratio (dark background check)
    dark_pixels = sum(1 for p in pixels[:5000] if p[0] < 30 and p[1] < 30 and p[2] < 30)
    dark_ratio = dark_pixels / min(n, 5000)
    
    im.close()
    return {
        "file": os.path.basename(path),
        "dim": f"{w}x{h}",
        "aspect": f"{w/h:.2f}",
        "size_kb": f"{size_kb:.0f}",
        "brightness": f"{brightness:.1f}",
        "saturation": f"{avg_saturation:.1f}",
        "contrast": f"{contrast:.1f}",
        "white_top": f"{white_pixels_top}",
        "white_bottom": f"{white_pixels_bottom}",
        "dark_ratio": f"{dark_ratio:.2%}",
    }


print("=" * 100)
print("GOOD ART (Template / Early generation)")
print("=" * 100)
good_results = []
for f in GOOD:
    path = os.path.join(ART_DIR, f)
    if os.path.exists(path):
        good_results.append(analyze_image(path))
    else:
        print(f"  MISSING: {f}")

header = ["file", "dim", "aspect", "size_kb", "brightness", "saturation", "contrast", "white_top", "white_bottom", "dark_ratio"]
col_widths = {k: max(len(k), max(len(r[k]) for r in good_results)) for k in header}
fmt = "  ".join(f"{{:<{col_widths[k]}}}" for k in header)
print(fmt.format(*header))
print("-" * 100)
for r in good_results:
    print(fmt.format(*[r[k] for k in header]))

print()
print("=" * 100)
print("BAD ART (Batch generation June 12)")
print("=" * 100)
bad_results = []
for f in BAD:
    path = os.path.join(ART_DIR, f)
    if os.path.exists(path):
        bad_results.append(analyze_image(path))
    else:
        print(f"  MISSING: {f}")

col_widths = {k: max(len(k), max(len(r[k]) for r in bad_results)) for k in header}
fmt = "  ".join(f"{{:<{col_widths[k]}}}" for k in header)
print(fmt.format(*header))
print("-" * 100)
for r in bad_results:
    print(fmt.format(*[r[k] for k in header]))

print()
print("=" * 100)
print("SUMMARY STATISTICS")
print("=" * 100)

for metric in ["brightness", "saturation", "contrast", "dark_ratio"]:
    g_vals = [float(r[metric].rstrip('%')) / 100 if '%' in r[metric] else float(r[metric]) for r in good_results]
    b_vals = [float(r[metric].rstrip('%')) / 100 if '%' in r[metric] else float(r[metric]) for r in bad_results]
    
    if '%' in good_results[0][metric]:
        g_vals = [v * 100 for v in g_vals]
        b_vals = [v * 100 for v in b_vals]
    
    g_mean = statistics.mean(g_vals)
    b_mean = statistics.mean(b_vals)
    g_std = statistics.stdev(g_vals) if len(g_vals) > 1 else 0
    b_std = statistics.stdev(b_vals) if len(b_vals) > 1 else 0
    
    unit = "%" if "%" in good_results[0][metric] else ""
    print(f"  {metric:15s}:  GOOD avg={g_mean:.1f}{unit} (std={g_std:.1f})  |  BAD avg={b_mean:.1f}{unit} (std={b_std:.1f})  |  diff={b_mean-g_mean:+.1f}{unit}")

# Dimension comparison
g_dims = [r["dim"] for r in good_results]
b_dims = [r["dim"] for r in bad_results]
print(f"\n  Good dimensions: {set(g_dims)}")
print(f"  Bad dimensions:  {set(b_dims)}")

# File size comparison
g_sizes = [float(r["size_kb"]) for r in good_results]
b_sizes = [float(r["size_kb"]) for r in bad_results]
print(f"\n  Good avg file size: {statistics.mean(g_sizes):.0f} KB")
print(f"  Bad avg file size:  {statistics.mean(b_sizes):.0f} KB")
