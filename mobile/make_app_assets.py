# Generates Capacitor source assets from the brand mark:
#   assets/icon.png        1024x1024  (full-bleed black square + white check)
#   assets/splash.png      2732x2732  (white bg, centered black-square check logo)
#   assets/splash-dark.png 2732x2732  (black bg, centered white check)
# Run, then `npx @capacitor/assets generate` turns these into all native sizes.
from PIL import Image, ImageDraw
import os

os.makedirs("assets", exist_ok=True)
PTS = [(14, 34), (26, 46), (50, 22)]  # checkmark in a 64x64 viewBox
STROKE = 6
CENTER = 32.0

def draw_check(img, size, content_scale, color):
    d = ImageDraw.Draw(img)
    f = size / 64.0
    def tx(p):
        x = CENTER + (p[0] - CENTER) * content_scale
        y = CENTER + (p[1] - CENTER) * content_scale
        return (x * f, y * f)
    pts = [tx(p) for p in PTS]
    w = max(1, round(STROKE * f * content_scale))
    d.line(pts, fill=color, width=w, joint="curve")
    r = w / 2.0
    for (x, y) in (pts[0], pts[-1]):
        d.ellipse([x - r, y - r, x + r, y + r], fill=color)

# Launcher icon: full-bleed black, white check
icon = Image.new("RGBA", (1024, 1024), (0, 0, 0, 255))
draw_check(icon, 1024, 1.0, (255, 255, 255, 255))
icon.save("assets/icon.png")

# Light splash: white bg, centered black-square logo (~34% of canvas) with white check
def make_splash(bg, square, check):
    S = 2732
    img = Image.new("RGBA", (S, S), bg)
    logo = 940  # logo square edge
    sq = Image.new("RGBA", (logo, logo), square)
    draw_check(sq, logo, 1.0, check)
    img.paste(sq, ((S - logo) // 2, (S - logo) // 2))
    return img

make_splash((255, 255, 255, 255), (0, 0, 0, 255), (255, 255, 255, 255)).save("assets/splash.png")
make_splash((0, 0, 0, 255), (0, 0, 0, 255), (255, 255, 255, 255)).save("assets/splash-dark.png")
print("app assets written:", os.listdir("assets"))
