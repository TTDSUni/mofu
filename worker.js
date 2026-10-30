// MOFU schedule read-only proxy: month -> published Google Sheet tab (gid).
// Admins maintain the monthly index in Google Sheets; no login or write API is exposed.
const PUBLISHED_ID='2PACX-1vTQ_60RGTZ6lUOkukmHeH7vHopLRljD-iFoZHVW-9TlqEydrfaR3Q1De5psmdfMqm_f17OpXl1MaHXC';
const OLD_GID='1214441936';
const csvUrl=gid=>`https://docs.google.com/spreadsheets/d/e/${PUBLISHED_ID}/pub?gid=${gid}&single=true&output=csv`;
const textHeaders={'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'};
const jsonHeaders={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
function csvRows(src){
  const rows=[]; let row=[],cell='',quoted=false;
  src=src.replace(/^\uFEFF/,'');
  for(let i=0;i<src.length;i++){
    const c=src[i];
    if(quoted){ if(c==='"'){ if(src[i+1]==='"'){cell+='"';i++;}else quoted=false; }else cell+=c; }
    else if(c==='"')quoted=true;
    else if(c===','){row.push(cell.trim());cell='';}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&src[i+1]==='\n')i++;row.push(cell.trim());cell='';if(row.some(Boolean))rows.push(row);row=[];}
    else cell+=c;
  }
  if(quoted)throw Error('索引 CSV 引號未結束');
  row.push(cell.trim());if(row.some(Boolean))rows.push(row);
  return rows;
}
async function readCsv(gid){
  if(!/^\d{1,15}$/.test(gid))throw Error('分頁 gid 不合法');
  const res=await fetch(csvUrl(gid),{
    headers:{Accept:'text/csv,text/plain;q=0.9,*/*;q=0.5'},redirect:'follow',cf:{cacheTtl:60,cacheEverything:true}
  });
  if(!res.ok)throw Error('Google Sheet HTTP '+res.status+' (gid '+gid+')');
  const body=await res.text();
  if(/^\s*(?:<!doctype html|<html)/i.test(body))throw Error('Google 返回 HTML，請檢查該分頁是否已「發布到網路」 (gid '+gid+')');
  return body;
}
async function monthMap(env){
  const indexGid=String(env.INDEX_GID||'').trim();
  if(!indexGid)return {mode:'legacy',months:{},hint:'尚未設定 INDEX_GID；暫用原始分頁作為過渡'};
  const raw=await readCsv(indexGid);
  const rows=csvRows(raw);
  if(!rows.length)throw Error('月份索引是空的');
  const heads=rows[0].map(x=>x.toLowerCase().replace(/[\s\uFEFF]/g,''));
  const mIdx=heads.findIndex(x=>['月份','年月','month','yyyy-mm'].includes(x));
  const gIdx=heads.findIndex(x=>['gid','分頁id','分頁gid','工作表id','sheetgid'].includes(x));
  if(mIdx<0||gIdx<0)throw Error('月份索引表頭需要「月份,gid」，實際讀到：'+rows[0].join(','));
  const months={};
  for(let i=1;i<rows.length;i++){
    const month=(rows[i][mIdx]||'').replace(/\//g,'-').trim();
    const gid=(rows[i][gIdx]||'').trim();
    if(!month&&!gid)continue;
    if(!/^20\d\d-(0[1-9]|1[0-2])$/.test(month)||!/^\d{1,15}$/.test(gid))throw Error(`月份索引第 ${i+1} 行需填 YYYY-MM 與數字 gid`);
    if(months[month]&&months[month]!==gid)throw Error('月份索引重複月份：'+month);
    months[month]=gid;
  }
  return {mode:'index',months};
}
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/api/sheet'||url.pathname==='/api/months'){
      if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:textHeaders});
      try{
        const map=await monthMap(env);
        if(url.pathname==='/api/months'){
          return new Response(request.method==='HEAD'?null:JSON.stringify({mode:map.mode,months:Object.keys(map.months).sort(),hint:map.hint||null}),{headers:jsonHeaders});
        }
        const month=url.searchParams.get('month');
        if(month&&!/^20\d\d-(0[1-9]|1[0-2])$/.test(month))return new Response('month must be YYYY-MM',{status:400,headers:textHeaders});
        const currentMonth=new Date(Date.now()+8*3600000).toISOString().slice(0,7);
        const targetMonth=month||currentMonth;
        const gid=map.mode==='legacy'?OLD_GID:map.months[targetMonth];
        if(!gid)return new Response(JSON.stringify({code:'MONTH_NOT_FOUND',month,message:'此月份尚未加入月份索引'}),{status:404,headers:jsonHeaders});
        const csv=await readCsv(gid);
        return new Response(request.method==='HEAD'?null:csv,{status:200,headers:{'Content-Type':'text/csv; charset=utf-8','Cache-Control':'public,max-age=60','X-Sheet-Month':month||'legacy'}});
      }catch(err){
        return new Response('讀取 Google Sheet 失敗：'+String(err.message||err),{status:502,headers:textHeaders});
      }
    }
    return env.ASSETS.fetch(request);
  }
};
