"""Validate exported frame coverage, geometry, transparency and the résumé copy."""
from pathlib import Path
import hashlib,json
from PIL import Image
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'public/frames/manifest.json').read_text())
assert (m['w'],m['h'])==(1600,900)
assert m['count']==239 and len(m['shots'])==4
covered=[]
for shot in m['shots']:
 x,y,w,h=shot['box'];assert 0<=x<x+w<=1600 and 0<=y<y+h<=900
 assert 0<shot['cx']<1
 for i in range(shot['from'],shot['to']+1):
  covered.append(i)
  for variant,size in [('lg',(w,h)),('sm',(max(1,round(w/2)),max(1,round(h/2))))]:
   image=Image.open(root/f'public/frames/{variant}/f{i:03d}.webp')
   assert image.size==size,(i,variant,image.size,size)
   assert image.mode=='RGBA',(i,variant,image.mode)
   alpha=image.getchannel('A');assert alpha.getextrema()[0]==0 and alpha.getextrema()[1]>200
assert covered==list(range(m['count']))
source=root.parent/'flow-animation/AyoubAkouharResume-1.pdf'
if source.exists():assert hashlib.sha256(source.read_bytes()).digest()==hashlib.sha256((root/'public/resume.pdf').read_bytes()).digest()
result={'frames':m['count'],'variants':2,'files':m['count']*2,'geometry':'passed','transparency':'passed','resumeCopy':'identical' if source.exists() else 'source unavailable for comparison'}
(root/'qa/assets.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
