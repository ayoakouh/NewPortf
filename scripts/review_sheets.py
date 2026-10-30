"""Assemble the captured viewport screenshots for visual review."""
from pathlib import Path
from PIL import Image, ImageDraw
root = Path(__file__).resolve().parents[1]
shots, out = root / 'qa/screenshots', root / 'qa/contact-sheets'
out.mkdir(parents=True, exist_ok=True)
def sheet(viewport, names, w, h, cols, filename):
    canvas = Image.new('RGB', (w*cols, h*((len(names)+cols-1)//cols)), '#ddd')
    draw = ImageDraw.Draw(canvas)
    for i, name in enumerate(names):
        im = Image.open(shots / f'{viewport}-{name}.png')
        im.thumbnail((w,h))
        x,y=(i%cols)*w,(i//cols)*h
        canvas.paste(im,(x,y))
        draw.text((x+6,y+h-18),name,fill='#888')
    canvas.save(out / filename,quality=95)
for viewport,w,h,cols in [('desktop',800,450,2),('mobile',390,844,4)]:
    names=['intro','hero-50','about-50','work-50','journey-50','skills-50','awards-50','contact-50']
    sheet(viewport,names,w,h,cols,f'{viewport}-sections.jpg')
for group, scenes in enumerate([['hero','about','work'],['journey','skills','awards'],['contact']],1):
    names=[f'{scene}-{p}' for scene in scenes for p in [15,50,85]]
    for viewport,w,h in [('desktop',533,300),('mobile',390,844)]:
        sheet(viewport,names,w,h,3,f'{viewport}-review-{group}.jpg')
for viewport,w,h in [('desktop',800,450),('mobile',390,844)]:
    names=[f'blade-{scene}' for scene in ['about','work','journey','skills','awards','contact']]
    sheet(viewport,names,w,h,3,f'{viewport}-blades.jpg')
print('Updated all review sheets.')
