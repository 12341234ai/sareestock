/* IndexedDB data layer. Legacy records store keys "groups" and "offers" are retained. */
const DB_NAME="ArunikaDB", DB_VERSION=1, STORE="records";
const DB = (() => {
  let dbPromise;
  function open(){
    if(dbPromise) return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:"key"});};
      req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
    });
    return dbPromise;
  }
  async function get(key){const d=await open();return new Promise((res,rej)=>{const r=d.transaction(STORE,"readonly").objectStore(STORE).get(key);r.onsuccess=()=>res(r.result?.value);r.onerror=()=>rej(r.error);});}
  async function put(key,value){const d=await open();return new Promise((res,rej)=>{const r=d.transaction(STORE,"readwrite").objectStore(STORE).put({key,value});r.onsuccess=()=>res();r.onerror=()=>rej(r.error);});}
  async function del(key){const d=await open();return new Promise((res,rej)=>{const r=d.transaction(STORE,"readwrite").objectStore(STORE).delete(key);r.onsuccess=()=>res();r.onerror=()=>rej(r.error);});}
  async function all(){return {groups:(await get("groups"))||[],offers:(await get("offers"))||[]};}
  async function replaceAll(groups,offers){const d=await open();return new Promise((res,rej)=>{const tx=d.transaction(STORE,"readwrite"),s=tx.objectStore(STORE);s.put({key:"groups",value:groups});s.put({key:"offers",value:offers});tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error);});}
  async function init(){const d=await open();let g=await get("groups"),o=await get("offers");if(!Array.isArray(g))await put("groups",[]);if(!Array.isArray(o))await put("offers",[]);return all();}
  return {open, get,put,del,all,replaceAll,init};
})();