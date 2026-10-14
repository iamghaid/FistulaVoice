import json,urllib.request,struct,zlib,hashlib,pathlib,sys
root=pathlib.Path(__file__).parent
patient=sys.argv[1] if len(sys.argv)>1 else 'pat002'
entry=next(x for x in json.loads((root/'entries.json').read_text()) if x[0].endswith(patient+'.csv'))
name,compressed,size,offset,method,crc=entry
req=urllib.request.Request('https://osf.io/download/m6syv/',headers={'Range':f'bytes={offset}-{offset+compressed+2048}'})
with urllib.request.urlopen(req,timeout=90) as response:
    if response.status!=206:raise RuntimeError('Range response required')
    data=response.read()
header=struct.unpack_from('<4s5H3I2H',data,0)
start=30+header[-2]+header[-1]
raw=zlib.decompress(data[start:start+compressed],-15)
assert len(raw)==size and zlib.crc32(raw)==crc,'ZIP integrity failed'
(root/(patient+'.csv')).write_bytes(raw)
(root/(patient+'-integrity.json')).write_text(json.dumps({'file':name,'crc32':f'{crc:08x}','sha256':hashlib.sha256(raw).hexdigest(),'repository':'https://osf.io/hypfr','download':'https://osf.io/download/m6syv/'}))
print('Verified',name,'bytes',len(raw));print(raw[:650].decode())
