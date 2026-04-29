"""Ascend Monk Mode app icon generator.

Stylized flame on deep matte black with warm radial glow.
Uses Catmull-Rom spline interpolation for smooth curves + multi-layer composition.
"""
from PIL import Image, ImageDraw, ImageFilter
import math
import os

SIZE = 1024
BG_COLOR = (11, 11, 20, 255)  # #0B0B14


def catmull_rom(points, samples_per_segment=24, closed=True):
    """Smooth a polyline through control points using Catmull-Rom splines."""
    if closed:
        ctrl = points[-1:] + list(points) + points[:2]
    else:
        ctrl = [points[0]] + list(points) + [points[-1]]

    out = []
    for i in range(1, len(ctrl) - 2):
        p0, p1, p2, p3 = ctrl[i - 1], ctrl[i], ctrl[i + 1], ctrl[i + 2]
        for t_step in range(samples_per_segment):
            t = t_step / samples_per_segment
            t2, t3 = t * t, t * t * t
            x = 0.5 * (
                (2 * p1[0]) +
                (-p0[0] + p2[0]) * t +
                (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
                (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3
            )
            y = 0.5 * (
                (2 * p1[1]) +
                (-p0[1] + p2[1]) * t +
                (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
                (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3
            )
            out.append((x, y))
    return out


def transform(pts, scale, dx, dy):
    return [(p[0] * scale + dx, p[1] * scale + dy) for p in pts]


# Asymmetric flame outline (slightly leaning, pointed top, rounded base).
# Y axis points down. Origin at flame center.
OUTER_FLAME = [
    (0, -340),       # tip
    (50, -280),      # right shoulder of tip
    (115, -200),
    (160, -100),
    (185, -10),
    (195, 70),
    (170, 145),
    (115, 200),
    (45, 240),
    (0, 260),        # base center
    (-45, 240),
    (-115, 200),
    (-170, 145),
    (-195, 70),
    (-185, -10),
    (-160, -100),
    (-115, -200),
    (-50, -280),
]

MID_FLAME = [
    (0, -240),
    (35, -190),
    (85, -120),
    (120, -40),
    (135, 35),
    (115, 110),
    (75, 160),
    (30, 195),
    (0, 210),
    (-30, 195),
    (-75, 160),
    (-115, 110),
    (-135, 35),
    (-120, -40),
    (-85, -120),
    (-35, -190),
]

CORE_FLAME = [
    (0, -150),
    (22, -110),
    (55, -55),
    (75, 5),
    (75, 70),
    (50, 120),
    (20, 145),
    (0, 155),
    (-20, 145),
    (-50, 120),
    (-75, 70),
    (-75, 5),
    (-55, -55),
    (-22, -110),
]

HOT_SPOT = [
    (0, -85),
    (15, -50),
    (28, -10),
    (32, 35),
    (20, 75),
    (0, 90),
    (-20, 75),
    (-32, 35),
    (-28, -10),
    (-15, -50),
]


def draw_radial_glow(size, center, max_radius, color_inner, color_outer, blur_radius=60):
    """Soft radial gradient glow."""
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    cx, cy = center
    steps = 60
    for i in range(steps, 0, -1):
        t = i / steps
        r = int(max_radius * t)
        if r <= 0:
            continue
        alpha = int(color_outer[3] + (color_inner[3] - color_outer[3]) * (1 - t))
        rgb = tuple(int(color_outer[k] + (color_inner[k] - color_outer[k]) * (1 - t)) for k in range(3))
        d = ImageDraw.Draw(glow)
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*rgb, alpha))
    return glow.filter(ImageFilter.GaussianBlur(radius=blur_radius))


def render_icon(size=SIZE, bg=BG_COLOR):
    img = Image.new('RGBA', (size, size), bg)
    cx = size // 2
    cy = int(size * 0.54)  # bias slightly down for visual balance

    scale_unit = size / 1024.0

    # Background subtle vignette warm-up
    bg_glow = draw_radial_glow(
        size,
        (cx, cy - int(20 * scale_unit)),
        int(520 * scale_unit),
        color_inner=(245, 158, 11, 60),
        color_outer=(245, 158, 11, 0),
        blur_radius=int(80 * scale_unit),
    )
    img.alpha_composite(bg_glow)

    # Outer flame — deep orange, smooth Catmull-Rom curve
    outer_pts = catmull_rom(transform(OUTER_FLAME, 1.05 * scale_unit, cx, cy), samples_per_segment=24)
    outer_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(outer_layer).polygon(outer_pts, fill=(245, 90, 31, 255))  # #F55A1F
    outer_layer = outer_layer.filter(ImageFilter.GaussianBlur(radius=2.5))
    img.alpha_composite(outer_layer)

    # Mid flame — orange (#FB923C), nudged down for licking-flame feel
    mid_pts = catmull_rom(
        transform(MID_FLAME, 1.0 * scale_unit, cx, cy + int(35 * scale_unit)),
        samples_per_segment=24,
    )
    mid_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(mid_layer).polygon(mid_pts, fill=(251, 146, 60, 255))
    mid_layer = mid_layer.filter(ImageFilter.GaussianBlur(radius=2))
    img.alpha_composite(mid_layer)

    # Core flame — gold (#FDE047)
    core_pts = catmull_rom(
        transform(CORE_FLAME, 1.0 * scale_unit, cx, cy + int(55 * scale_unit)),
        samples_per_segment=24,
    )
    core_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(core_layer).polygon(core_pts, fill=(253, 224, 71, 255))
    core_layer = core_layer.filter(ImageFilter.GaussianBlur(radius=1.8))
    img.alpha_composite(core_layer)

    # Hot core — bright white-yellow center
    hot_pts = catmull_rom(
        transform(HOT_SPOT, 1.0 * scale_unit, cx, cy + int(60 * scale_unit)),
        samples_per_segment=24,
    )
    hot_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(hot_layer).polygon(hot_pts, fill=(255, 246, 200, 235))
    hot_layer = hot_layer.filter(ImageFilter.GaussianBlur(radius=4))
    img.alpha_composite(hot_layer)

    # Highlight glow at top of flame (small white halo at tip)
    tip_glow = draw_radial_glow(
        size,
        (cx, cy - int(280 * scale_unit)),
        int(80 * scale_unit),
        color_inner=(255, 230, 150, 80),
        color_outer=(255, 230, 150, 0),
        blur_radius=int(20 * scale_unit),
    )
    img.alpha_composite(tip_glow)

    return img


def main():
    out_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'assets',
    )
    os.makedirs(out_dir, exist_ok=True)

    # Main 1024×1024 app icon
    icon = render_icon(SIZE)
    icon_path = os.path.join(out_dir, 'icon.png')
    icon.save(icon_path)
    print(f'Saved: {icon_path}')

    # Adaptive icon (Android)
    adaptive_path = os.path.join(out_dir, 'adaptive-icon.png')
    icon.save(adaptive_path)
    print(f'Saved: {adaptive_path}')

    # Notification icon (smaller). Render at 256 then downscale gives crisper result
    notif = render_icon(256)
    notif_path = os.path.join(out_dir, 'notification-icon.png')
    notif.save(notif_path)
    print(f'Saved: {notif_path}')


if __name__ == '__main__':
    main()
