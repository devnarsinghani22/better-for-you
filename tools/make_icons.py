# tools/make_icons.py
from PIL import Image, ImageDraw
import os

OUT_ICONS = "public/icons"
os.makedirs(OUT_ICONS, exist_ok=True)

# Source geometry in a 64x64 viewBox
PTS = [(14, 34), (26, 46), (50, 22)]
STROKE = 6
CENTER = 32.0

def render(size: int, content_scale: float) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 255))  # full-bleed black
    d = ImageDraw.Draw(img)
    f = size / 64.0
    def tx(p):
        x = CENTER + (p[0] - CENTER) * content_scale
        y = CENTER + (p[1] - CENTER) * content_scale
        return (x * f, y * f)
    pts = [tx(p) for p in PTS]
    w = max(1, round(STROKE * f * content_scale))
    d.line(pts, fill=(255, 255, 255, 255), width=w, joint="curve")
    r = w / 2.0
    for (x, y) in (pts[0], pts[-1]):  # round end caps
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, 255))
    return img

render(192, 1.0).save(f"{OUT_ICONS}/icon-192.png")
render(512, 1.0).save(f"{OUT_ICONS}/icon-512.png")
render(192, 0.66).save(f"{OUT_ICONS}/icon-192-maskable.png")
render(512, 0.66).save(f"{OUT_ICONS}/icon-512-maskable.png")
render(180, 1.0).save("app/apple-icon.png")
print("icons written")
