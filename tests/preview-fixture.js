// Loaded only by preview-server.cjs --fixture, never by production pages.
(() => {
  let dolls = ['그로자','콜펜','토로로','샤크리'].map((name,i)=>({id:'fixture-'+i,slug:'doll-00'+(i+1),name,weapon_type:i===1?'권총':'돌격소총',attribute:i===2?'탁류':'물리',recommended_sets:i===1?['응급 회복']:['실탄 증폭','위상 타격'],recommended_muzzle:['공격','공격 보너스','치명타','치명타 피해'],recommended_parts:i===1?['체력','체력 보너스','치명타']:['공격','공격 보너스','치명타'],default_note:'',is_active:true,display_order:i+1,updated_at:'2026-11-22T00:00:00Z'}));
  const session={user:{id:'fixture-admin',email:'preview@example.test'}};
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session}}),onAuthStateChange:()=>{},signOut:async()=>({error:null})},from:table=>{
    const filters=[];let payload,operation;
    const q={select(){return q;},eq(k,v){filters.push([k,v]);return q;},order(){return q;},limit(){return q;},update(p){payload=p;operation='update';return q;},insert(p){payload=p;operation='insert';return q;},delete(){operation='delete';return q;},async maybeSingle(){
      let row=dolls.find(d=>filters.every(([k,v])=>d[k]===v));
      if(operation==='insert'){row={id:'fixture-'+Date.now(),...payload};dolls.push(row);}
      if(row&&operation==='update')Object.assign(row,payload,{updated_at:new Date().toISOString()});
      if(row&&operation==='delete')dolls=dolls.filter(d=>d!==row);
      return {data:row||null,error:null};
    },then(resolve,reject){return Promise.resolve({data:table==='app_admins'?[{user_id:session.user.id}]:dolls.filter(d=>filters.every(([k,v])=>d[k]===v)),error:null}).then(resolve,reject);}};return q;
  }})};
})();
