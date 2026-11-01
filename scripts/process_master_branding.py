import os
import shutil
import base64
from PIL import Image

master_path = r'C:\Users\raman\.gemini\antigravity\brain\b22b2ca4-171e-445c-bdca-b69c5f4821bf\.user_uploaded\media_1793557754236_6f29ce33.jpg'
brand_dir = r'C:\Users\raman\AI farma\frontend\public\brand'
public_dir = r'C:\Users\raman\AI farma\frontend\public'
backend_brand_dir = r'C:\Users\raman\AI farma\backend\src\assets\brand'

os.makedirs(brand_dir, exist_ok=True)
os.makedirs(backend_brand_dir, exist_ok=True)

# 1. Copy exact master file unmodified
dest_master = os.path.join(brand_dir, 'the-khedut-master.jpg')
shutil.copy2(master_path, dest_master)
print('Saved master to:', dest_master)

# Load master
img = Image.open(master_path)
img.save(os.path.join(brand_dir, 'the-khedut-full.png'), format='PNG', optimize=True)

# Optimized PDF logo (width 400px)
img_pdf_logo = img.copy()
img_pdf_logo.thumbnail((450, 450), Image.Resampling.LANCZOS)
img_pdf_logo.save(os.path.join(backend_brand_dir, 'the-khedut-pdf-logo.png'), format='PNG', optimize=True)

# Optimized PDF watermark (width 600px)
img_pdf_wm = img.copy()
img_pdf_wm.thumbnail((650, 650), Image.Resampling.LANCZOS)
img_pdf_wm.save(os.path.join(backend_brand_dir, 'the-khedut-pdf-watermark.png'), format='PNG', optimize=True)

# Copy to backend assets
for fname in ['the-khedut-master.jpg', 'the-khedut-full.png', 'the-khedut-full-transparent.png', 'the-khedut-symbol.png', 'the-khedut-full-dark-theme.png']:
    src = os.path.join(brand_dir, fname)
    if os.path.exists(src):
        dst = os.path.join(backend_brand_dir, fname)
        shutil.copy2(src, dst)
print('Copied to backend/src/assets/brand/')

# Favicon .ico and .png
fav_png = os.path.join(brand_dir, 'the-khedut-favicon.png')
img_fav = Image.open(fav_png)
img_fav.save(os.path.join(public_dir, 'favicon.ico'), format='ICO', sizes=[(16,16), (32,32), (48,48), (64,64)])
img_fav.save(os.path.join(public_dir, 'favicon.png'), format='PNG')

# Generate SVG wrapper with embedded base64 of the master symbol for favicon.svg
with open(fav_png, 'rb') as f:
    b64_fav = base64.b64encode(f.read()).decode('utf-8')

svg_fav = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <clipPath id="circle-clip">
      <rect width="64" height="64" rx="16" fill="#245B38"/>
    </clipPath>
  </defs>
  <rect width="64" height="64" rx="16" fill="#245B38"/>
  <image href="data:image/png;base64,{b64_fav}" x="2" y="2" width="60" height="60" clip-path="url(#circle-clip)" preserveAspectRatio="xMidYMid meet"/>
</svg>'''
with open(os.path.join(public_dir, 'favicon.svg'), 'w', encoding='utf-8') as f:
    f.write(svg_fav)

# Generate pwa-icon-192.svg and pwa-icon-512.svg with embedded base64
pwa192_png = os.path.join(brand_dir, 'the-khedut-pwa-192.png')
with open(pwa192_png, 'rb') as f:
    b64_pwa192 = base64.b64encode(f.read()).decode('utf-8')
svg_pwa192 = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192">
  <rect width="192" height="192" rx="42" fill="#245B38"/>
  <image href="data:image/png;base64,{b64_pwa192}" x="8" y="8" width="176" height="176" preserveAspectRatio="xMidYMid meet"/>
</svg>'''
with open(os.path.join(public_dir, 'pwa-icon-192.svg'), 'w', encoding='utf-8') as f:
    f.write(svg_pwa192)

pwa512_png = os.path.join(brand_dir, 'the-khedut-pwa-512.png')
with open(pwa512_png, 'rb') as f:
    b64_pwa512 = base64.b64encode(f.read()).decode('utf-8')
svg_pwa512 = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="#245B38"/>
  <image href="data:image/png;base64,{b64_pwa512}" x="20" y="20" width="472" height="472" preserveAspectRatio="xMidYMid meet"/>
</svg>'''
with open(os.path.join(public_dir, 'pwa-icon-512.svg'), 'w', encoding='utf-8') as f:
    f.write(svg_pwa512)

# Copy pwa pngs to public
shutil.copy2(pwa192_png, os.path.join(public_dir, 'pwa-icon-192.png'))
shutil.copy2(pwa512_png, os.path.join(public_dir, 'pwa-icon-512.png'))

# Standalone symbol svg
svg_symbol = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#245B38"/>
  <image href="data:image/png;base64,{b64_fav}" x="2" y="2" width="60" height="60" preserveAspectRatio="xMidYMid meet"/>
</svg>'''
with open(os.path.join(public_dir, 'khedut-symbol.svg'), 'w', encoding='utf-8') as f:
    f.write(svg_symbol)

# Copy full logo base64 for khedut-logo-horizontal.svg
full_png = os.path.join(brand_dir, 'the-khedut-full-transparent.png')
with open(full_png, 'rb') as f:
    b64_full = base64.b64encode(f.read()).decode('utf-8')

svg_horizontal = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 180" width="340" height="180">
  <image href="data:image/png;base64,{b64_full}" x="0" y="0" width="340" height="180" preserveAspectRatio="xMidYMid meet"/>
</svg>'''
with open(os.path.join(public_dir, 'khedut-logo-horizontal.svg'), 'w', encoding='utf-8') as f:
    f.write(svg_horizontal)
with open(os.path.join(public_dir, 'khedut-logo-horizontal-dark.svg'), 'w', encoding='utf-8') as f:
    f.write(svg_horizontal)

print('Generated all web icons and PDF image assets successfully!')
