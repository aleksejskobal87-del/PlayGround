const CARD_POOL = [
  {id:'flarefox',name:'Flarefox',emoji:'🦊',tier:'Normal',power:24,pack:'meadow'},
  {id:'mossaur',name:'Mossaur',emoji:'🦕',tier:'Normal',power:28,pack:'meadow'},
  {id:'bubblup',name:'Bubblup',emoji:'🐸',tier:'Normal',power:19,pack:'meadow'},
  {id:'pebblit',name:'Pebblit',emoji:'🐹',tier:'Normal',power:16,pack:'meadow'},
  {id:'cloudkit',name:'Cloudkit',emoji:'🐱',tier:'Normal',power:21,pack:'moon'},
  {id:'sproutowl',name:'Sproutowl',emoji:'🦉',tier:'Normal',power:23,pack:'meadow'},
  {id:'tidefin',name:'Tidefin',emoji:'🐬',tier:'Normal',power:25,pack:'moon'},
  {id:'puffern',name:'Puffern',emoji:'🐡',tier:'Normal',power:18,pack:'solar'},
  {id:'sunhare',name:'Sunhare',emoji:'🐰',tier:'Gold',power:41,pack:'solar'},
  {id:'cinderpup',name:'Cinderpup',emoji:'🐕',tier:'Gold',power:46,pack:'solar'},
  {id:'glimmeray',name:'Glimmeray',emoji:'🪼',tier:'Gold',power:43,pack:'moon'},
  {id:'thornback',name:'Thornback',emoji:'🦔',tier:'Gold',power:39,pack:'meadow'},
  {id:'moonmoth',name:'Moonmoth',emoji:'🦋',tier:'Rare',power:58,pack:'moon'},
  {id:'craggle',name:'Craggle',emoji:'🦏',tier:'Rare',power:62,pack:'meadow'},
  {id:'coralyn',name:'Coralyn',emoji:'🦄',tier:'Rare',power:67,pack:'solar'},
  {id:'voltkit',name:'Voltkit',emoji:'🐈',tier:'Rare',power:55,pack:'solar'},
  {id:'frosthorn',name:'Frosthorn',emoji:'🐏',tier:'Diamond',power:79,pack:'moon'},
  {id:'starwhale',name:'Starwhale',emoji:'🐋',tier:'Diamond',power:86,pack:'moon'},
  {id:'aurorabbit',name:'Aurorabbit',emoji:'🐇',tier:'Diamond',power:82,pack:'solar'},
  {id:'emberwing',name:'Emberwing',emoji:'🦅',tier:'Godlike',power:103,pack:'solar'},
  {id:'dreamstag',name:'Dreamstag',emoji:'🦌',tier:'Godlike',power:110,pack:'meadow'},
  {id:'thunderlynx',name:'Thunderlynx',emoji:'🐆',tier:'Godlike',power:108,pack:'solar'},
  {id:'lunalion',name:'Lunalion',emoji:'🦁',tier:'Special',power:139,pack:'moon'},
  {id:'verdantwyrm',name:'Verdant Wyrm',emoji:'🐉',tier:'Special',power:148,pack:'meadow'},
  {id:'prismphoenix',name:'Prism Phoenix',emoji:'🦚',tier:'Special',power:151,pack:'solar'},
  {id:'eclipse',name:'The Eclipse',emoji:'🌑',tier:'Secret',power:199,pack:'moon'},
  {id:'firstlight',name:'First Light',emoji:'🌟',tier:'Secret',power:210,pack:'solar'},
  {id:'worldseed',name:'Worldseed',emoji:'🌱',tier:'Secret',power:205,pack:'meadow'}
];
const PACKS = [
  {id:'meadow',name:'Meadow Friends',subtitle:'Gentle souls & leafy legends',emoji:'🌿',cost:120,caption:'MEADOW SET',className:'meadow'},
  {id:'moon',name:'Moonlit Wonders',subtitle:'Dreamers from another world',emoji:'🌙',cost:160,caption:'MOON SET',className:'moon'},
  {id:'solar',name:'Sunflare Legends',subtitle:'Bright hearts, big power',emoji:'☀️',cost:210,caption:'SOLAR SET',className:'solar'}
];
const UNLOCKS = [
  {level:2,name:'Collection journal',view:'journal'},
  {level:5,name:'Pack storage',view:'storage'},
  {level:9,name:'Buy multiple packs',view:null},
  {level:12,name:'Card hunting mode',view:'hunting'},
  {level:15,name:'Rebirth',view:'rebirth'}
];
const INITIAL = {coins:600,level:1,xp:0,collection:{},stored:[],rebirths:0,huntTarget:null,welcomeClaimed:false,packCount:0};
let state = loadState();
let activeFilter = 'all';
let toastTimer;

function loadState(){
  try { const saved=JSON.parse(localStorage.getItem('mythic-pocket-save')); if(saved&&saved.collection&&Number.isFinite(saved.level))return {...INITIAL,...saved}; } catch(e){}
  return {...INITIAL};
}
function save(){localStorage.setItem('mythic-pocket-save',JSON.stringify(state));}
function xpFor(level){return 80+(level-1)*58;}
function tierClass(tier){return 'tier-'+tier.toLowerCase();}
function ownedCount(){return Object.keys(state.collection).length;}
function tierWeight(tier,pack){
  let weights={Normal:56,Gold:19,Rare:12,Diamond:7,Godlike:3.3,Special:2,Secret:.7};
  if(pack==='moon'){weights={Normal:47,Gold:20,Rare:15,Diamond:9,Godlike:4.5,Special:3,Secret:1.5};}
  if(pack==='solar'){weights={Normal:39,Gold:21,Rare:17,Diamond:12,Godlike:6,Special:3.5,Secret:1.5};}
  let luck=1+state.rebirths*.25;
  if(tier==='Normal')return weights[tier]/luck;
  return weights[tier]*luck;
}
function drawCard(packId){
  if(state.huntTarget&&Math.random()<Math.min(.3,.15+state.rebirths*.02)){
    const target=CARD_POOL.find(c=>c.id===state.huntTarget);if(target)return target;
  }
  const pack=PACKS.find(p=>p.id===packId)||PACKS[0];
  let pool=CARD_POOL.filter(c=>c.pack===packId);
  if(pool.length<3)pool=CARD_POOL;
  const weighted=pool.map(c=>({card:c,weight:tierWeight(c.tier,packId)}));
  const total=weighted.reduce((a,x)=>a+x.weight,0);let n=Math.random()*total;
  for(const entry of weighted){n-=entry.weight;if(n<=0)return entry.card;}
  return weighted[0].card;
}
function levelUp(){
  let gained=[];
  while(state.xp>=xpFor(state.level)){state.xp-=xpFor(state.level);state.level++;gained.push(state.level);}
  return gained;
}
function addXp(amount){state.xp+=amount;return levelUp();}
function persistRender(){save();render();}
function setView(view){
  const unlocked=UNLOCKS.find(u=>u.view===view);
  if(unlocked&&state.level<unlocked.level){toast(`Unlocks at level ${unlocked.level}. Keep collecting!`);return;}
  document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id===`view-${view}`));
  document.querySelectorAll('.nav-link[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
  const names={packs:'Pack shop',collection:'Collection',journal:'Collection journal',storage:'Pack storage',hunting:'Card hunting',rebirth:'Rebirth'};
  document.getElementById('crumbTitle').textContent=names[view]||'Pack shop';
  document.getElementById('sidebar').classList.remove('open');
  if(view==='hunting')renderHunting();
  window.scrollTo({top:0,behavior:'smooth'});
}
function render(){
  document.getElementById('coinBalance').textContent=state.coins.toLocaleString();
  document.getElementById('levelNumber').textContent=state.level;
  document.getElementById('collectionNavCount').textContent=ownedCount();
  const xpPct=Math.min(100,state.xp/xpFor(state.level)*100);
  document.getElementById('sideProgress').style.width=xpPct+'%';
  document.getElementById('sideLevel').textContent=`Level ${state.level}`;
  const next=UNLOCKS.find(u=>u.level>state.level);
  document.getElementById('sideNext').textContent=next?`Level ${next.level}`:'Max level';
  document.querySelectorAll('.locked-nav').forEach(el=>{
    const needed=Number(el.dataset.unlock);const locked=state.level<needed;
    el.classList.toggle('is-locked',locked);
    el.querySelector('.lock-icon').textContent=locked?'⌑':'✓';
  });
  const unlock=UNLOCKS.find(u=>u.level>state.level);
  document.getElementById('nextUnlockName').textContent=unlock?unlock.name:'All features unlocked';
  document.getElementById('nextUnlockLevel').textContent=unlock?`LVL ${unlock.level}`:'✦';
  document.getElementById('collectionTotal').textContent=ownedCount();
  document.getElementById('allCount').textContent=ownedCount();
  document.getElementById('journalCount').textContent=ownedCount();
  document.getElementById('storageCount').textContent=state.stored.length;
  document.getElementById('rebirthCount').textContent=state.rebirths;
  document.getElementById('rebirthRequirement').textContent=`Level ${Math.min(state.level,15)} / 15`;
  document.getElementById('rebirthProgress').style.width=Math.min(100,state.level/15*100)+'%';
  const rebirthButton=document.getElementById('rebirthButton');rebirthButton.disabled=state.level<15;rebirthButton.innerHTML=state.level>=15?'Rebirth now <span>↗</span>':'Rebirth unavailable <span>↗</span>';
  renderPacks();renderCollection();renderJournal();renderStorage();renderHunting();
}
function renderPacks(){
  const grid=document.getElementById('packGrid');
  grid.innerHTML=PACKS.map((p,i)=>`<article class="pack-card">
    <div class="pack-visual ${p.className}"><span class="pack-no">VOL. 0${i+1}</span><span class="pack-emoji">${p.emoji}</span><span class="pack-caption">${p.caption}</span></div>
    <div class="pack-info"><h3>${p.name}</h3><p>${p.subtitle}</p></div>
    <div class="pack-actions"><span class="pack-cost"><span class="coin-icon">◉</span>${p.cost}</span>
      ${state.level>=9?`<select class="quantity-select" id="qty-${p.id}" aria-label="Packs to buy">${[1,5,10].map(n=>`<option value="${n}">${n}×</option>`).join('')}</select>`:''}
      <button class="pack-buy" data-buy="${p.id}">${state.level>=9?'Buy':'Buy pack'}</button>
      ${state.level>=5?`<button class="pack-store" data-store="${p.id}" title="Buy and store a sealed pack">＋ Store</button>`:''}
    </div></article>`).join('');
}
function renderCollection(){
  const grid=document.getElementById('collectionGrid');
  const cards=CARD_POOL.filter(c=>state.collection[c.id]&&(activeFilter==='all'||activeFilter===c.tier));
  if(!cards.length){grid.innerHTML=`<div class="empty-state"><div><span>✧</span><strong>${ownedCount()?'No cards in this tier yet':'Your collection is waiting.'}</strong><p>${ownedCount()?'Open a few more packs to discover a card in this tier.':'Buy your first pack to meet your new favorite.'}</p><button class="button button-dark" data-goto="packs">Explore packs <span>↗</span></button></div></div>`;return;}
  grid.innerHTML=cards.map(c=>cardMarkup(c,state.collection[c.id])).join('');
}
function cardMarkup(c,copies=1){return `<article class="creature-card"><div class="creature-art ${tierClass(c.tier)} cr-art-bg"><small>${c.tier.toUpperCase()} · No. ${String(CARD_POOL.indexOf(c)+1).padStart(3,'0')}</small>${copies>1?`<span class="copies">×${copies}</span>`:''}<span class="creature-emoji">${c.emoji}</span></div><div class="creature-info"><h3>${c.name}</h3><div class="creature-meta"><span class="tier ${tierClass(c.tier)}">${c.tier}</span><span class="power">✦ ${c.power} PWR</span></div></div></article>`;}
function renderJournal(){
  const grid=document.getElementById('journalGrid');
  const cards=CARD_POOL.map(c=>state.collection[c.id]?cardMarkup(c,state.collection[c.id]):`<article class="creature-card journal-unknown"><div class="creature-art tier-normal cr-art-bg"><small>UNDISCOVERED</small><span class="creature-emoji">${c.emoji}</span></div><div class="creature-info"><h3>???</h3><div class="creature-meta"><span class="tier tier-normal">Unknown</span><span class="power">✦ ???</span></div></div></article>`);
  grid.innerHTML=cards.join('');
}
function renderStorage(){
  const list=document.getElementById('storedList');
  if(!state.stored.length){list.innerHTML=`<div class="empty-state"><div><span>▤</span><strong>No sealed packs just yet.</strong><p>Use the “＋ Store” button in the shop to save packs for later.</p><button class="button button-dark" data-goto="packs">Find a pack <span>↗</span></button></div></div>`;return;}
  list.innerHTML=state.stored.map((id,index)=>{const p=PACKS.find(x=>x.id===id)||PACKS[0];return `<article class="stored-pack"><div class="mini-pack ${p.className}">${p.emoji}</div><div><strong>${p.name}</strong><small>Sealed pack · 3 cards inside</small></div><button data-open-stored="${index}">Open pack ↗</button></article>`}).join('');
}
function renderHunting(){
  const el=document.getElementById('huntOptions');if(!el)return;
  const discovered=CARD_POOL.filter(c=>state.collection[c.id]);
  if(!discovered.length){el.innerHTML='<div class="empty-state"><div><span>⌕</span><strong>Meet a few creatures first.</strong><p>Discover cards in packs, then pick one to focus your search.</p></div></div>';}
  else el.innerHTML=discovered.map(c=>`<button class="hunt-option ${state.huntTarget===c.id?'selected':''}" data-hunt="${c.id}"><span class="hunt-creature ${tierClass(c.tier)} cr-art-bg">${c.emoji}</span><span><strong>${c.name}</strong><small>${c.tier}</small></span></button>`).join('');
  document.getElementById('huntStatus').textContent=state.huntTarget?`Searching for ${CARD_POOL.find(c=>c.id===state.huntTarget)?.name}. Slightly increased chance in your next pack.`:'Select a creature to begin your search.';
}
function notifyLevelUps(levels){if(levels.length){const latest=levels[levels.length-1];toast(`Level up! You're now level ${latest}.`);setTimeout(()=>{const just=UNLOCKS.find(u=>u.level===latest);if(just)toast(`Unlocked: ${just.name}!`);},1600);}}
function buyPack(packId,{store=false,amount=1}={}){
  const pack=PACKS.find(p=>p.id===packId);if(!pack)return;
  if(amount>1&&state.level<9){toast('Buying multiple packs unlocks at level 9.');return;}
  if(store&&state.level<5){toast('Pack storage unlocks at level 5.');return;}
  amount=Math.max(1,Math.min(10,Number(amount)||1));
  if(store)amount=1;
  const cost=pack.cost*amount;
  if(state.coins<cost){toast(`You need ${cost.toLocaleString()} coins for that.`);return;}
  state.coins-=cost;
  if(store){state.stored.push(packId);persistRender();toast(`${pack.name} added to storage.`);return;}
  openPacks(packId,amount);
}
function openPacks(packId,amount=1){
  const results=[];for(let i=0;i<amount*3;i++)results.push(drawCard(packId));
  state.packCount+=amount;
  const levels=addXp(amount*45);
  const newly=[];let duplicateCount=0;
  const cards=results.map(card=>{
    if(state.collection[card.id]){duplicateCount++;return {card,duplicate:true};}
    state.collection[card.id]=1;newly.push(card);return {card,duplicate:false};
  });
  save();render();notifyLevelUps(levels);
  document.getElementById('packModalTitle').textContent=amount===1?'Look what you found!':`${amount} packs opened!`;
  document.getElementById('packModalSubtitle').textContent=`${newly.length} new ${newly.length===1?'discovery':'discoveries'} · ${duplicateCount} duplicate${duplicateCount===1?'':'s'} to decide on`;
  document.getElementById('resultXp').textContent=`✦ +${amount*45} XP earned`;
  const container=document.getElementById('resultCards');
  container.innerHTML=cards.map((entry,i)=>{
    const c=entry.card;
    return `<article class="result-card" data-result="${i}"><div class="creature-art ${tierClass(c.tier)} cr-art-bg"><small>${c.tier.toUpperCase()}</small><span class="creature-emoji">${c.emoji}</span></div><div class="result-details"><h3>${c.name}</h3><span class="tier ${tierClass(c.tier)}">${c.tier}</span><p class="${entry.duplicate?'duplicate-note':'new-card-note'}">${entry.duplicate?'Duplicate · choose what to do':'✦ New to your collection!'}</p>${entry.duplicate?`<div class="duplicate-actions"><button class="action-sell" data-duplicate="sell" data-card="${c.id}">Sell +${sellValue(c)} ◉</button><button class="action-trash" data-duplicate="trash" data-card="${c.id}">Trash</button><button class="action-keep" data-duplicate="keep" data-card="${c.id}">Keep</button></div>`:''}</div></article>`;
  }).join('');
  document.getElementById('packModal').classList.add('show');document.getElementById('packModal').setAttribute('aria-hidden','false');
  if(state.huntTarget){state.huntTarget=null;save();renderHunting();}
}
function sellValue(cardId){const c=CARD_POOL.find(x=>x.id===cardId);return Math.round(({Normal:12,Gold:24,Rare:42,Diamond:75,Godlike:130,Special:220,Secret:400}[c?.tier]||12)*(1+state.rebirths*.1));}
function resolveDuplicate(button){
  const id=button.dataset.card,action=button.dataset.duplicate;const card=CARD_POOL.find(c=>c.id===id);
  if(action==='sell'){state.coins+=sellValue(id);button.closest('.result-card').classList.add('resolved');button.closest('.result-card').querySelector('.duplicate-note').textContent=`Sold for ${sellValue(id)} coins`;}
  if(action==='trash'){button.closest('.result-card').classList.add('resolved');button.closest('.result-card').querySelector('.duplicate-note').textContent='Sent to the trash';}
  if(action==='keep'){state.collection[id]=(state.collection[id]||1)+1;button.closest('.result-card').classList.add('resolved');button.closest('.result-card').querySelector('.duplicate-note').textContent='Added to your collection';}
  button.closest('.duplicate-actions').remove();persistRender();
}
function closeModal(){
  document.querySelectorAll('.result-card:not(.resolved) .action-keep').forEach(btn=>{const id=btn.dataset.card;state.collection[id]=(state.collection[id]||1)+1;});
  document.getElementById('packModal').classList.remove('show');document.getElementById('packModal').setAttribute('aria-hidden','true');persistRender();
}
function rebirth(){if(state.level<15)return;const ok=confirm('Rebirth now? Your level, coins, and stored packs reset. Your card collection and luck bonus stay forever.');if(!ok)return;state.rebirths++;state.level=1;state.xp=0;state.coins=600;state.stored=[];state.huntTarget=null;persistRender();setView('rebirth');toast(`Rebirth ${state.rebirths}! Your card luck is now ${Math.round(state.rebirths*25)}% stronger.`);}

document.addEventListener('click',event=>{
  const nav=event.target.closest('[data-view]');if(nav){setView(nav.dataset.view);return;}
  const goto=event.target.closest('[data-goto]');if(goto){setView(goto.dataset.goto);return;}
  const buy=event.target.closest('[data-buy]');if(buy){const p=buy.dataset.buy;const qty=document.getElementById(`qty-${p}`);buyPack(p,{amount:qty?Number(qty.value):1});return;}
  const store=event.target.closest('[data-store]');if(store){buyPack(store.dataset.store,{store:true});return;}
  const stored=event.target.closest('[data-open-stored]');if(stored){const index=Number(stored.dataset.openStored),pack=state.stored[index];if(pack){state.stored.splice(index,1);save();openPacks(pack,1);}return;}
  const duplicate=event.target.closest('[data-duplicate]');if(duplicate){resolveDuplicate(duplicate);return;}
  const hunt=event.target.closest('[data-hunt]');if(hunt){state.huntTarget=hunt.dataset.hunt;persistRender();toast('Hunt target set! Your next pack has a better chance.');return;}
  if(event.target.closest('[data-close]')){closeModal();return;}
  if(event.target.id==='heroBuy'){buyPack('meadow');return;}
  if(event.target.id==='rebirthButton'){rebirth();return;}
});
document.getElementById('tierFilters').addEventListener('click',event=>{const button=event.target.closest('[data-tier]');if(!button)return;activeFilter=button.dataset.tier;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===button));renderCollection();});
document.getElementById('clearHunt').addEventListener('click',()=>{state.huntTarget=null;persistRender();toast('Hunt target cleared.');});
document.getElementById('earnCoins').addEventListener('click',()=>{if(state.welcomeClaimed){toast('Your welcome bonus has already been claimed.');return;}state.welcomeClaimed=true;state.coins+=250;persistRender();toast('Welcome bonus claimed: +250 coins!');});
document.getElementById('menuToggle').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
document.getElementById('packModal').addEventListener('click',event=>{if(event.target.id==='packModal')closeModal();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.getElementById('packModal').classList.contains('show'))closeModal();});
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2500);}
render();