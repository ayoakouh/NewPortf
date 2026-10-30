"""Extract, matte and crop the supplied performance. Run from portfolio/.
The source is gray: robust background-field estimation replaces white=247.
"""
from pathlib import Path
import argparse, json, os, subprocess, re
os.environ.setdefault('OMP_NUM_THREADS', '2')
os.environ.setdefault('OPENBLAS_NUM_THREADS', '2')
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy.ndimage import binary_opening, binary_dilation, label
import imageio_ffmpeg
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser()
p.add_argument('--source', type=Path, default=ROOT.parent / 'Create_one_continuous_10-second,_16_9_d769fe99_1080p.mp4')
p.add_argument('--calibrate', action='store_true')
p.add_argument('--precache-from', type=int, default=None, help='Optional second CPU worker; cache masks from this frame onward')
a = p.parse_args()
full, cache, out = ROOT/'full', ROOT/'.cache/masks', ROOT/'public/frames'
for folder in [full, cache, out/'lg', out/'sm', ROOT/'qa/contact-sheets']:
    folder.mkdir(parents=True, exist_ok=True)
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
probe = subprocess.run([ffmpeg,'-i',str(a.source)], capture_output=True, text=True).stderr
fps = float(re.search(r'(\d+(?:\.\d+)?) fps',probe).group(1))
if not (full/'f000.png').exists():
    subprocess.run([ffmpeg,'-y','-i',str(a.source),'-start_number','0',str(full/'f%03d.png')], check=True, stderr=subprocess.DEVNULL)
files = sorted(full.glob('f*.png'))
score = subprocess.run([ffmpeg,'-i',str(a.source),'-vf',"select='gte(scene,0)',metadata=print",'-an','-f','null','-'],capture_output=True,text=True).stderr
(ROOT/'.cache/scene-scores.txt').write_text(score)
scene_scores = [float(s) for s in re.findall(r'lavfi.scene_score=([\d.]+)',score)]
count = len(files)
bounds = [0, round(2.5*fps), round(5*fps), round(7.5*fps), count]
print(json.dumps({'fps':fps,'count':count,'bounds':bounds,'max_scene_score':max(scene_scores,default=0)}), flush=True)
session = new_session('u2net_human_seg')
# Fit a gray studio surface from the unobstructed side margins, rejecting equipment.
def background(rgb):
    h,w,_ = rgb.shape
    yy,xx = np.mgrid[0:h:10,0:w:10]
    sample = rgb[::10,::10].astype(float)
    x,y=xx/w,yy/h
    design=np.stack([x*0+1,x,y,x*x,x*y,y*y],axis=-1)
    gray=(sample.max(2)-sample.min(2))<18
    keep=((x<.28)|(x>.72))&gray&(sample.mean(2)>85)
    for _ in range(3):
        coef=np.linalg.lstsq(design[keep],sample[keep],rcond=None)[0]
        residual=np.max(np.abs(design@coef-sample),axis=-1)
        keep=keep&(residual<max(7,float(np.percentile(residual[keep],85))))
    Y,X=np.mgrid[0:h,0:w]; X=X/w;Y=Y/h
    return np.clip(np.stack([X*0+1,X,Y,X*X,X*Y,Y*Y],axis=-1)@coef,0,255)

def matte(index):
    dest=cache/f'f{index:03d}.png'; centerpath=cache/f'f{index:03d}.json'
    if dest.exists() and centerpath.exists():
        return Image.open(dest).convert('RGBA'), json.loads(centerpath.read_text())['cx']
    source=Image.open(files[index]).convert('RGB')
    # Work in the requested virtual coordinate system for predictable morphology.
    im=source.resize((1600,900),Image.Resampling.LANCZOS)
    rgb=np.array(im).astype(np.float32)
    person=np.array(remove(im,session=session,only_mask=True)).astype(np.float32)/255
    bg=background(rgb)
    dist=np.max(np.abs(rgb-bg),axis=2)
    props=np.clip((dist-14)/26,0,1)
    # Reject disconnected studio rigging outside the performance area.
    roi=np.zeros((900,1600),bool);roi[:,int(1600*.30):int(1600*.70)]=True
    blobs=binary_opening((props>.25)&roi,structure=np.ones((3,3)))
    labels,n=label(blobs); areas=np.bincount(labels.ravel()); areas[0]=0
    retain=areas[labels]>4000
    retain=binary_dilation(retain,iterations=4)
    props=props*retain
    # Floor shadows are gray midtones, unlike dark furniture and bright shoes.
    neutral=(rgb.max(2)-rgb.min(2))<18
    floor=(np.arange(900)[:,None]>900*.80)&neutral&(rgb.mean(2)>80)&(rgb.mean(2)<195)
    props[floor]=0
    alpha=np.maximum(person,props)
    alpha=np.array(Image.fromarray((alpha*255).astype('uint8')).filter(ImageFilter.GaussianBlur(.8)),dtype=float)/255
    clean=rgb.copy(); valid=alpha>.05
    clean[valid]=(rgb[valid]-(1-alpha[valid,None])*bg[valid])/alpha[valid,None]
    clean=np.clip(clean,0,255)
    eroded=np.array(Image.fromarray((alpha*255).astype('uint8')).filter(ImageFilter.MinFilter(3)),dtype=float)/255
    alpha=.35*alpha+.65*eroded
    alpha=np.clip((alpha-.14)/.86,0,1)**1.4
    lum=clean@np.array([.2126,.7152,.0722])
    alpha*=np.where(alpha<.95,1-.8*np.clip((lum-150)/70,0,1),1)
    upper=person[:405]
    cx=float((upper*np.arange(1600)[None,:]).sum()/max(upper.sum(),1)/1600)
    rgba=np.dstack([clean,(alpha*255)]).astype('uint8')
    result=Image.fromarray(rgba)
    result.save(dest)
    centerpath.write_text(json.dumps({'cx':cx}))
    return result,cx

if a.precache_from is not None:
    for i in range(a.precache_from,count):
        matte(i)
        if i%10==0: print(f'Precached {i+1}/{count}',flush=True)
    raise SystemExit(0)

samples=[max(0,min(count-1,(bounds[i]+bounds[i+1])//2)) for i in range(4)]
contact=Image.new('RGB',(1600,900),'#ff1f1f')
for i,index in enumerate(samples):
    im,_=matte(index); im=im.resize((800,450))
    contact.paste(im,((i%2)*800,(i//2)*450),im.getchannel('A'))
contact.save(ROOT/'qa/contact-sheets/matte-red.jpg',quality=95)
print('Calibration image ready: qa/contact-sheets/matte-red.jpg',flush=True)
if a.calibrate: raise SystemExit(0)
shots=[]
for s in range(4):
    box=[1600,900,0,0]; centers=[]
    for i in range(bounds[s],bounds[s+1]):
        im,cx=matte(i); centers.append(cx)
        mask=np.array(im.getchannel('A')); ys,xs=np.where(mask>6)
        if len(xs): box=[min(box[0],int(xs.min())),min(box[1],int(ys.min())),max(box[2],int(xs.max())+1),max(box[3],int(ys.max())+1)]
        if i%10==0: print(f'Matted {i+1}/{count}',flush=True)
    x,y,right,bottom=box
    # Include a 3px safety border without changing frame-to-frame alignment.
    box=(max(0,x-3),max(0,y-3),min(1600,right+3),min(900,bottom+3))
    x,y,r,b=box; w,h=r-x,b-y
    for i in range(bounds[s],bounds[s+1]):
        crop=Image.open(cache/f'f{i:03d}.png').crop(box)
        crop.save(out/'lg'/f'f{i:03d}.webp',quality=80,alpha_quality=90,method=4)
        crop.resize((max(1,round(w/2)),max(1,round(h/2))),Image.Resampling.LANCZOS).save(out/'sm'/f'f{i:03d}.webp',quality=78,alpha_quality=90,method=4)
    shots.append({'from':bounds[s],'to':bounds[s+1]-1,'box':[x,y,w,h],'cx':round(float(np.median(centers)),6)})
manifest={'w':1600,'h':900,'count':count,'shots':shots}
(out/'manifest.json').write_text(json.dumps(manifest,separators=(',',':')))
(ROOT/'.cache/source.json').write_text(json.dumps({'fps':fps,'source':str(a.source),'logical_boundaries_seconds':[0,2.5,5,7.5,count/fps],'highest_scene_scores':sorted(scene_scores,reverse=True)[:10]}))
print(json.dumps(manifest),flush=True)
