import numpy as np, wave
from pathlib import Path
sr=44100
out=Path('public/audio')
def save(name,a):
 a=a/(max(1e-8,np.max(np.abs(a))))*.78
 with wave.open(str(out/(name+'.wav')),'wb') as w:
  w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((a*32767).astype('<i2').tobytes())
t=np.arange(sr*12)/sr
b=sum((1-np.exp(-t/0.003))*np.exp(-t/(2.5-i*.4))*np.sin(2*np.pi*174.61*r*t)*(1+.08*np.sin(2*np.pi*(3+i)*t))/(i+1) for i,r in enumerate([1,2.71,4.08,5.43]))
b*=np.minimum(1,(12-t)/.2);save('bowl',b)
for name,duration,spacing,freqs in [('light',24,1.5,[261.63,329.63,392,440,392,329.63,293.66,261.63]),('rest',24,4,[130.81,164.81,196])]:
 a=np.zeros(sr*duration)
 for i,start in enumerate(np.arange(0,duration,spacing)):
  length=min(duration-start,8);t=np.arange(int(length*sr))/sr;f=freqs[i%len(freqs)]
  env=(1-np.exp(-t/(.018 if name=='light' else .7)))*np.exp(-t/(1.4 if name=='light' else 3.2))
  wavelet=(np.sin(2*np.pi*f*t)+.22*np.sin(2*np.pi*f*2*t)+.1*np.sin(2*np.pi*f*3*t))*env
  pos=int(start*sr);a[pos:pos+len(wavelet)]+=wavelet
 ramp=np.minimum(np.arange(len(a))/sr/.05,1)*np.minimum((len(a)-np.arange(len(a)))/sr/.5,1)
 save(name,a*ramp)
