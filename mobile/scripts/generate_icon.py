"""Premium app icon — radial gradient flame on deep matte background.

Layered approach:
1. Black background with subtle warm vignette
2. Outer glow halo (large blur)
3. Outer flame (deep red-orange) with smooth bezier-like curves
4. Mid flame (orange) layered above
5. Core flame (gold-yellow)
6. Hot center (white-yellow)
7. Highlight specular at tip
"""
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import math
import os

SIZE = 1024
BG = (8, 8, 16, 255)  # nearly black, slight blue


def catmull_rom(points, samples=32, closed=True):
    if closed:
        ctrl = points[-1:] + list(points) + points[:2]
    else:
        ctrl = [points[0]] + list(points) + [points[-1]]
    out = []
    for i in range(1, len(ctrl) - 2):
        p0, p1, p2, p3 = ctrl[i - 1], ctrl[i], ctrl[i + 1], ctrl[i + 2]
        for s in range(samples):
            t = s / samples
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t +
                       (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
                       (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t +
                       (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
                       (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((x, y))
    return out


def transform(pts, scale, dx, dy, sway=0):
    """Apply scale + offset + slight horizontal sway for licking-flame look."""
    out = []
    for p in pts:
        # Sway: more sway near top (small y), less at base
        height_factor = max(0, (-p[1] + 200) / 400) if sway else 0
        x_swayed = p[0] + sway * height_factor
        out.append((x_swayed * scale + dx, p[1] * scale + dy))
    return out


# Asymmetric flame shapes for depth
OUTER = [
    (0, -360), (45, -310), (110, -220), (160, -130), (190, -40),
    (200, 50), (180, 130), (130, 200), (70, 245), (10, 270),
    (-40, 260), (-100, 230), (-160, 180), (-195, 110), (-200, 30),
    (-185, -50), (-160, -130), (-115, -220), (-50, -310),
]

MID = [
    (5, -270), (45, -210), (90, -130), (125, -50), (140, 30),
    (125, 105), (90, 165), (45, 200), (0, 215),
    (-45, 200), (-90, 165), (-125, 105), (-140, 30),
    (-125, -50), (-90, -130), (-45, -210),
]

CORE = [
    (8, -180), (35, -130), (65, -65), (80, 0), (78, 60),
    (55, 115), (25, 145), (0, 155), (-25, 145), (-55, 115),
    (-78, 60), (-80, 0), (-65, -65), (-35, -130),
]

HOT = [
    (5, -110), (20, -65), (32, -10), (35, 35), (25, 80),
    (5, 100), (-15, 90), (-30, 60), (-38, 20), (-35, -20),
    (-25, -65), (-10, -110),
]


def radial_gradient(size, center, max_r, color_inner, color_outer, blur=0):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    cx, cy = center
    steps = 80
    for i in range(steps, 0, -1):
        t = i / steps
        r = int(max_r * t)
        if r <= 0:
            continue
        alpha = int(color_outer[3] + (color_inner[3] - color_outer[3]) * (1 - t))
        rgb = tuple(int(color_outer[k] + (color_inner[k] - color_outer[k]) * (1 - t)) for k in range(3))
        d = ImageDraw.Draw(img)
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*rgb, alpha))
    if blur:
        img = img.filter(ImageFilter.GaussianBlur(radius=blur))
    return img


def render_icon(size=SIZE):
    img = Image.new('RGBA', (size, size), BG)
    cx = size // 2
    cy = int(size * 0.55)  # bias down slightly
    s = size / 1024.0

    # 1. Background warm vignette (subtle)
    bg_glow = radial_gradient(
        size, (cx, cy - int(40 * s)),
        int(620 * s),
        color_inner=(245, 140, 30, 80),
        color_outer=(245, 140, 30, 0),
        blur=int(120 * s),
    )
    img.alpha_composite(bg_glow)

    # 2. Outer halo behind flame
    halo = radial_gradient(
        size, (cx, cy),
        int(400 * s),
        color_inner=(255, 100, 30, 140),
        color_outer=(255, 100, 30, 0),
        blur=int(80 * s),
    )
    img.alpha_composite(halo)

    # 3. Outer flame — deep red-orange #DC2626
    outer_pts = catmull_rom(transform(OUTER, 1.05 * s, cx, cy, sway=15))
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(layer).polygon(outer_pts, fill=(220, 38, 38, 255))
    layer = layer.filter(ImageFilter.GaussianBlur(radius=3 * s))
    img.alpha_composite(layer)

    # 4. Mid flame — orange #F97316
    mid_pts = catmull_rom(transform(MID, 1.0 * s, cx, cy + int(30 * s), sway=10))
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(layer).polygon(mid_pts, fill=(249, 115, 22, 255))
    layer = layer.filter(ImageFilter.GaussianBlur(radius=2.5 * s))
    img.alpha_composite(layer)

    # 5. Core flame — gold #FACC15
    core_pts = catmull_rom(transform(CORE, 1.0 * s, cx, cy + int(60 * s), sway=5))
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(layer).polygon(core_pts, fill=(250, 204, 21, 255))
    layer = layer.filter(ImageFilter.GaussianBlur(radius=2 * s))
    img.alpha_composite(layer)

    # 6. Hot center — pale yellow-white #FEF3C7
    hot_pts = catmull_rom(transform(HOT, 1.0 * s, cx, cy + int(75 * s)))
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(layer).polygon(hot_pts, fill=(254, 243, 199, 240))
    layer = layer.filter(ImageFilter.GaussianBlur(radius=4 * s))
    img.alpha_composite(layer)

    # 7. Tip highlight (small white halo at flame tip for depth)
    tip_glow = radial_gradient(
        size, (cx + int(8 * s), cy - int(310 * s)),
        int(70 * s),
        color_inner=(255, 250, 220, 150),
        color_outer=(255, 250, 220, 0),
        blur=int(15 * s),
    )
    img.alpha_composite(tip_glow)

    # 8. Bottom shadow grounding
    base_shadow = radial_gradient(
        size, (cx, cy + int(290 * s)),
        int(180 * s),
        color_inner=(0, 0, 0, 100),
        color_outer=(0, 0, 0, 0),
        blur=int(40 * s),
    )
    img = Image.alpha_composite(img, base_shadow)

    return img


def main():
    out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets')
    os.makedirs(out_dir, exist_ok=True)

    icon = render_icon(SIZE)
    icon.save(os.path.join(out_dir, 'icon.png'))
    print(f'Saved: assets/icon.png ({SIZE}x{SIZE})')

    icon.save(os.path.join(out_dir, 'adaptive-icon.png'))
    print(f'Saved: assets/adaptive-icon.png')

    notif = render_icon(256)
    notif.save(os.path.join(out_dir, 'notification-icon.png'))
    print(f'Saved: assets/notification-icon.png (256x256)')


if __name__ == '__main__':
    main()
