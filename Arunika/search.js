/* Lightweight browser-local similarity helpers: normalized color histogram + dHash. */
const PhotoSearch = (() => {
  async function imageData(blob,size=32){
    const img=await createImageBitmap(blob);
    const canvas=document.createElement("canvas");canvas.width=size;canvas.height=size;
    const ctx=canvas.getContext("2d",{willReadFrequently:true});ctx.drawImage(img,0,0,size,size);
    const data=ctx.getImageData(0,0,size,size).data;img.close?.();return {data,size};
  }
  async function histogram(blob){
    const {data}=await imageData(blob,24);const bins=8, hist=new Float32Array(bins*3);
    for(let i=0;i<data.length;i+=4){hist[Math.min(bins-1,Math.floor(data[i]/32))]++;hist[bins+Math.min(bins-1,Math.floor(data[i+1]/32))]++;hist[2*bins+Math.min(bins-1,Math.floor(data[i+2]/32))]++;}
    let sum=0;for(const v of hist)sum+=v;for(let i=0;i<hist.length;i++)hist[i]/=sum||1;return hist;
  }
  async function dhash(blob){
    const {data}=await imageData(blob,9);const gray=[];
    for(let y=0;y<8;y++)for(let x=0;x<9;x++){let i=(y*9+x)*4;gray.push(data[i]*.299+data[i+1]*.587+data[i+2]*.114);}
    let bits=[];for(let y=0;y<8;y++)for(let x=0;x<8;x++)bits.push(gray[y*9+x]>gray[y*9+x+1]?1:0);return bits;
  }
  function histScore(a,b){let d=0;for(let i=0;i<a.length;i++)d+=Math.abs(a[i]-b[i]);return Math.max(0,1-d/2);}
  function hashScore(a,b){let n=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])n++;return 1-n/a.length;}
  async function compare(reference,blob){const [h1,h2,d1,d2]=await Promise.all([histogram(reference),histogram(blob),dhash(reference),dhash(blob)]);return Math.round((histScore(h1,h2)*.65+hashScore(d1,d2)*.35)*100);}
  return {compare};
})();