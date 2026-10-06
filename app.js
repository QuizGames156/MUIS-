
const C=window.NILO_CONFIG,S=supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY);let selected=[];
const pages=['landing','register','pending','login','home','profile'];
function go(id){pages.forEach(x=>document.getElementById(x).classList.toggle('hide',x!==id));nav.classList.toggle('hide',!['home','profile'].includes(id));if(id==='home')loadHome();if(id==='profile')loadMe();scrollTo(0,0)}
photos.onchange=()=>{selected=[...photos.files].slice(0,5);photoGrid.innerHTML=selected.map(f=>`<div class="slot"><img src="${URL.createObjectURL(f)}"></div>`).join('')};
async function submitRequest(){
 regMsg.textContent='';let major=rMajor.value.trim();
 if(+rAge.value<18)return regMsg.textContent='NILO зөвхөн 18+ хэрэглэгчид зориулагдана.';
 if(/[A-Za-z]/.test(major))return regMsg.textContent='Мэргэжлийн нэрээ монгол хэлээр бичнэ үү.';
 if(!rName.value.trim()||!rSisi.value.trim()||!rEmail.value||rPass.value.length<8||!major||!selected.length)return regMsg.textContent='Бүх шаардлагатай мэдээлэл болон дор хаяж 1 зураг оруулна уу.';
 const {data,error}=await S.auth.signUp({email:rEmail.value.trim(),password:rPass.value});
 if(error)return regMsg.textContent=error.message;
 let urls=[];
 for(let i=0;i<selected.length;i++){let f=selected[i],path=`${data.user.id}/${Date.now()}-${i}-${f.name.replace(/[^a-zA-Z0-9._-]/g,'')}`;let up=await S.storage.from('profile-photos').upload(path,f);if(up.error)return regMsg.textContent=up.error.message;urls.push(path)}
 const payload={id:data.user.id,email:rEmail.value.trim(),name:rName.value.trim(),sisi_id:rSisi.value.trim().toUpperCase(),age:+rAge.value,gender:rGender.value,major,course:+rCourse.value,bio:rBio.value.trim(),interests:rInterests.value.split(',').map(x=>x.trim()).filter(Boolean),photo_paths:urls,status:'pending',rank:'F'};
 const q=await S.from('profiles').insert(payload);if(q.error)return regMsg.textContent=q.error.message;go('pending')
}
async function login(){loginMsg.textContent='';let a=await S.auth.signInWithPassword({email:lEmail.value.trim(),password:lPass.value});if(a.error)return loginMsg.textContent=a.error.message;let p=await S.from('profiles').select('status').eq('id',a.data.user.id).single();if(p.error)return loginMsg.textContent=p.error.message;if(p.data.status!=='approved'){await S.auth.signOut();return loginMsg.textContent='Таны хүсэлт хараахан зөвшөөрөгдөөгүй байна.'}go('home')}
async function signed(path){let x=await S.storage.from('profile-photos').createSignedUrl(path,3600);return x.data?.signedUrl||''}
async function loadHome(){let u=(await S.auth.getUser()).data.user;if(!u)return go('login');let me=await S.from('profiles').select('*').eq('id',u.id).single();if(!me.data||me.data.status!=='approved')return go('login');meBadge.textContent=`${me.data.rank||'F'} · МУИС ✓`;let q=await S.from('profiles').select('id,name,age,major,course,bio,interests,photo_paths,rank').eq('status','approved').neq('id',u.id).order('approved_at',{ascending:false});people.innerHTML='';if(!q.data?.length){people.innerHTML='<div class="glass empty"><h3>Одоогоор шинэ гишүүн алга</h3><p class="muted">Шинэ хэрэглэгч NILO-д зөвшөөрөгдөхөд энд автоматаар гарч ирнэ.</p></div>';return}for(const p of q.data){let url=p.photo_paths?.[0]?await signed(p.photo_paths[0]):'';people.innerHTML+=`<article class="glass person">${url?`<img src="${url}">`:''}<div class="info"><div class="top"><h2>${esc(p.name)} · ${p.age}</h2><span class="pill">${p.rank||'F'}</span></div><p>${esc(p.major)} · ${p.course}-р курс</p><p class="muted">${esc(p.bio||'')}</p><div class="tags">${(p.interests||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div></article>`}}
async function loadMe(){let u=(await S.auth.getUser()).data.user;if(!u)return go('login');let q=await S.from('profiles').select('*').eq('id',u.id).single();if(!q.data)return;let p=q.data,url=p.photo_paths?.[0]?await signed(p.photo_paths[0]):'';myProfile.innerHTML=`<div class="glass person">${url?`<img src="${url}">`:''}<div class="info"><h1>${esc(p.name)} · ${p.age}</h1><span class="pill">${p.rank} · МУИС Verified</span><p>${esc(p.major)} · ${p.course}-р курс</p><p class="muted">${esc(p.bio||'')}</p></div></div>`}
async function logout(){await S.auth.signOut();go('landing')}
function esc(x=''){return String(x).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
(async()=>{if(C.SUPABASE_URL.startsWith('PASTE_'))return;let u=(await S.auth.getUser()).data.user;if(u){let p=await S.from('profiles').select('status').eq('id',u.id).maybeSingle();if(p.data?.status==='approved')go('home')}})();
