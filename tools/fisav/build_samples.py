import csv,json,pathlib,hashlib,wave,shutil,sys,openpyxl
import numpy as np
root=pathlib.Path(__file__).parent
patient=sys.argv[1] if len(sys.argv)>1 else 'pat002'
out=pathlib.Path(__file__).resolve().parents[2]/'dist/assets/research';out.mkdir(parents=True,exist_ok=True)
rows=[]
with (root/(patient+'.csv')).open(newline='') as f:
    reader=csv.DictReader(f)
    for row in reader:
        time=float(row['Time'])
        if time>24:break
        if time>=8:rows.append([time]+[float(row[k]) for k in ['ECG','raw PZT1','raw PZT2','raw PZT3','Occlusion']])
data=np.array(rows);fs=10000
assert np.allclose(np.diff(data[:,0]),1/fs) and np.all(data[:,5]==0)
clip=(data[:,0]>=10)&(data[:,0]<22)
filtered=[]
for col in [2,3]:
    x=data[:,col];freq=np.fft.rfftfreq(len(x),1/fs)
    # FFT-domain high-pass for listening only, not the paper's component-separation algorithm.
    weight=np.clip((freq-15)/10,0,1)
    weight=.5-.5*np.cos(np.pi*weight)
    y=np.fft.irfft(np.fft.rfft(x-x.mean())*weight,n=len(x))[clip]
    filtered.append(y)
gain=.85/max(np.max(np.abs(y)) for y in filtered)
integrity=root/(patient+'-integrity.json')
if not integrity.exists() and patient=='pat002':integrity=root/'source-integrity.json'
record=next(r for r in openpyxl.load_workbook(root/'patient_information.xlsx',data_only=True).active.values if r[0]==patient)
assert record[52] in ['Y','N']
clinical={'stenosis':record[52]=='Y','distanceMm':record[53],'residualDiameterMm':record[54],'referenceDiameterMm':record[55],'pzt1Position':record[9],'annotationSource':'https://osf.io/download/wd9s5/','annotationFile':'patient_information.xlsx','annotationSheet':'Patient data','rowId':patient}
manifest={'repository':'https://osf.io/hypfr','paper':'https://doi.org/10.1038/s41597-026-08242-8','license':'https://creativecommons.org/licenses/by/4.0/','attribution':'Centracchio et al., Scientific Data (2026); FiSaV dataset: Parlato, Centracchio, Cinotti & Andreozzi.','sourceFile':patient+'.csv','clinical':clinical,'sampleRate':fs,'startSeconds':10,'endSeconds':22,'occlusion':False,'gain':float(gain),'processing':'FFT high-pass with raised-cosine transition 15–25 Hz; DC removed; shared playback gain; 16-bit PCM WAV. Not the original paper’s pulse/thrill/bruit separation.','integrity':json.loads(integrity.read_text()),'samples':[]}
for i,y in enumerate(filtered):
    pcm=np.round(y*gain*32767).astype('<i2');filename=f'fisav-{patient}-pzt{i+1}-10-22s.wav'
    with wave.open(str(out/filename),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(fs);w.writeframes(pcm.tobytes())
    x=pcm.astype(float)/32768
    rms=np.sqrt(np.mean(x*x));n=1024;hop=128;frames=np.array([np.abs(np.fft.rfft(x[j:j+n]*np.hanning(n)))**2 for j in range(0,len(x)-n+1,hop)])
    p=frames.mean(axis=0);p[0]=0;freq=np.fft.rfftfreq(n,1/fs);last=np.searchsorted(freq,1500)
    spec=10*np.log10(np.maximum(frames[:,:last],1e-20)/max(frames[:,:last].max(),1e-20));spec=np.clip((spec+70)/70,0,1)
    # compact heat map, normalized to the maximum of each clip and explicitly labelled relative.
    heat=np.round(spec[::4].T*255).astype(int).tolist()
    manifest['samples'].append({'id':f'FISAV-{patient.upper()}-PZT{i+1}','channel':f'PZT{i+1}','audio':filename,'sha256':hashlib.sha256((out/filename).read_bytes()).hexdigest(),'duration':len(x)/fs,'rmsDb':float(20*np.log10(rms)),'peakDb':float(20*np.log10(np.max(np.abs(x)))),'dominantHz':float(freq[np.argmax(p)]),'centroidHz':float(np.dot(freq,p)/p.sum()),'nearLimitPct':float(np.mean(np.abs(x)>=.98)*100),'fftSize':n,'binHz':fs/n,'heatmap':heat,'rawRms':float(np.sqrt(np.mean((data[clip,i+2]-data[clip,i+2].mean())**2)))})
# Raw traces show original sensor values (not normalized audio); envelope preserves extrema.
trace=data[(data[:,0]>=10)&(data[:,0]<14)]
manifest['rawTraces']=[]
for col,name in [(1,'ECG'),(2,'PZT1'),(3,'PZT2'),(4,'PZT3')]:
    x=trace[:,col];parts=np.array_split(x,700)
    manifest['rawTraces'].append({'name':name,'min':float(x.min()),'max':float(x.max()),'envelope':[[float(p.min()),float(p.max())] for p in parts]})
(out/(patient+'.json')).write_text(json.dumps(manifest,separators=(',',':')),encoding='utf8')
if patient=='pat002':(out/'fisav.json').write_text(json.dumps(manifest,separators=(',',':')),encoding='utf8')
shutil.copyfile(root/'LICENSE_CC_BY.txt',out/'LICENSE_CC_BY.txt')
print('Built',patient,'stenosis',clinical['stenosis'],'PZT1 site',clinical['pzt1Position'])
