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
  {id:'worldseed',name:'Worldseed',emoji:'🌱',tier:'Secret',power:205,pack:'meadow'},
  {id:'frostpup',name:'Frostpup',emoji:'🐺',tier:'Normal',power:27,pack:'frost'},
  {id:'snowbell',name:'Snowbell',emoji:'🔔',tier:'Gold',power:44,pack:'frost'},
  {id:'glacierowl',name:'Glacierowl',emoji:'🦉',tier:'Rare',power:65,pack:'frost'},
  {id:'aurorawolf',name:'Aurora Wolf',emoji:'🐺',tier:'Diamond',power:89,pack:'frost'},
  {id:'icecrown',name:'Icecrown',emoji:'👑',tier:'Godlike',power:114,pack:'frost'},
  {id:'polarstar',name:'Polar Star',emoji:'🌠',tier:'Special',power:155,pack:'frost'},
  {id:'winterheart',name:'Winterheart',emoji:'💎',tier:'Secret',power:218,pack:'frost'},
  {id:'stormkit',name:'Stormkit',emoji:'🐈‍⬛',tier:'Normal',power:26,pack:'storm'},
  {id:'zapwing',name:'Zapwing',emoji:'🦇',tier:'Gold',power:47,pack:'storm'},
  {id:'cloudram',name:'Cloudram',emoji:'🐏',tier:'Rare',power:69,pack:'storm'},
  {id:'thunderbird',name:'Thunderbird',emoji:'🦅',tier:'Diamond',power:91,pack:'storm'},
  {id:'tempest',name:'Tempest',emoji:'🌪️',tier:'Godlike',power:118,pack:'storm'},
  {id:'skyempress',name:'Sky Empress',emoji:'🦚',tier:'Special',power:159,pack:'storm'},
  {id:'stormking',name:'Storm King',emoji:'⚡',tier:'Secret',power:224,pack:'storm'},
  {id:'bloomling',name:'Bloomling',emoji:'🌷',tier:'Normal',power:22,pack:'garden'},
  {id:'honeybun',name:'Honeybun',emoji:'🐝',tier:'Gold',power:42,pack:'garden'},
  {id:'petalfox',name:'Petalfox',emoji:'🦊',tier:'Rare',power:63,pack:'garden'},
  {id:'rosedragon',name:'Rosedragon',emoji:'🐉',tier:'Diamond',power:85,pack:'garden'},
  {id:'heartwood',name:'Heartwood',emoji:'🌳',tier:'Godlike',power:112,pack:'garden'},
  {id:'everbloom',name:'Everbloom',emoji:'🌺',tier:'Special',power:153,pack:'garden'},
  {id:'worldflower',name:'Worldflower',emoji:'🌼',tier:'Secret',power:220,pack:'garden'}
];
const PACKS = [
  {id:'meadow',name:'Meadow Friends',subtitle:'Gentle souls & leafy legends',emoji:'🌿',cost:120,caption:'MEADOW SET',className:'meadow'},
  {id:'moon',name:'Moonlit Wonders',subtitle:'Dreamers from another world',emoji:'🌙',cost:160,caption:'MOON SET',className:'moon'},
  {id:'solar',name:'Sunflare Legends',subtitle:'Bright hearts, big power',emoji:'☀️',cost:210,caption:'SOLAR SET',className:'solar'},
  {id:'frost',name:'Frostbound Friends',subtitle:'Snowy spirits & icy legends',emoji:'❄️',cost:180,caption:'FROST SET',className:'frost'},
  {id:'storm',name:'Storm Chasers',subtitle:'Wild winds & electric wonders',emoji:'⛈️',cost:230,caption:'STORM SET',className:'storm'},
  {id:'garden',name:'Wondergarden',subtitle:'Petal pals & blooming magic',emoji:'🌷',cost:145,caption:'GARDEN SET',className:'garden'}
];
const UNLOCKS = [
  {level:2,name:'Collection journal',view:'journal'},
  {level:5,name:'Pack storage',view:'storage'},
  {level:9,name:'Buy multiple packs',view:null},
  {level:12,name:'Card hunting mode',view:'hunting'},
  {level:15,name:'Rebirth',view:'rebirth'}
];
const INITIAL = {coins:600,level:1,xp:0,collection:{},stored:[],rebirths:0,huntTarget:null,welcomeClaimed:false,packCount:0,deliveries:[],activeReview:null};
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
  const names={packs:'Pack shop',collection:'Collection',journal:'Collection journal',storage:'Pack storage',hunting:'Card hunting',rebirth:'Rebirth'};
  document.getElementById('crumbTitle').textContent=names[view]||'Pack shop';
  document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id===`view-${view}`));
  document.querySelectorAll('.nav-link[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
  document.getElementById('sidebar').classList.remove('open');
  if(view==='hunting')renderHunting();
  document.querySelector('.app-shell').scrollIntoView({behavior:'smooth',block:'start'});
}
function render(){
  document.getElementById('coinBalance').textContent=state.coins.toLocaleString();
  document.getElementById('levelNumber').textContent=state.level;
  renderRoom();
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
  document.getElementById('storageCount').textContent=(state.deliveries||[]).reduce((total,delivery)=>total+delivery.packs.length,0);
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
      <button class="pack-buy" data-buy="${p.id}">Order on phone</button>
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
  if(!state.deliveries?.length){list.innerHTML=`<div class="empty-state"><div><span>▤</span><strong>No deliveries are waiting.</strong><p>Pick up your phone and order a card pack to see it arrive on your desk.</p><button class="button button-dark" id="storagePhoneButton">Open Ordermart <span>↗</span></button></div></div>`;return;}
  list.innerHTML=state.deliveries.map((delivery,index)=>{const p=PACKS.find(x=>x.id===delivery.packs[0])||PACKS[0];return `<article class="stored-pack"><div class="mini-pack ${p.className}">${p.emoji}</div><div><strong>${p.name}${delivery.packs.length>1?` × ${delivery.packs.length}`:''}</strong><small>Delivery on your desk · ${delivery.packs.length*3} cards inside</small></div><button data-room-delivery="${index}">Unbox on desk ↗</button></article>`}).join('');
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
  amount=Math.max(1,Math.min(10,Number(amount)||1));
  const cost=pack.cost*amount;
  if(state.coins<cost){roomToast(`You need ${cost.toLocaleString()} coins for that.`);return;}
  state.coins-=cost;
  const delivery={id:Date.now()+Math.random(),packs:Array(amount).fill(packId)};
  state.deliveries=state.deliveries||[];state.deliveries.push(delivery);save();render();closePhone();
  roomToast(`${pack.name}${amount>1?` ×${amount}`:''} ordered! Your delivery is on the desk.`);
}
function renderRoom(){
  const coins=document.getElementById('roomCoins'),level=document.getElementById('roomLevel');
  if(coins)coins.textContent=state.coins.toLocaleString();if(level)level.textContent=state.level;
  const deliveryButton=document.getElementById('deliveryButton');
  if(deliveryButton){const available=(state.deliveries||[]).length;deliveryButton.hidden=!available&&!state.activeReview;deliveryButton.classList.toggle('has-many',available>1);const hint=deliveryButton.querySelector('.object-hint');if(hint)hint.textContent=state.activeReview?'RESUME CARD REVIEW':`YOUR DELIVERY${available>1?` · ${available} WAITING`:''} · CLICK TO UNBOX`;}
  const phone=document.getElementById('phoneButton');if(phone)phone.classList.toggle('phone-picked',document.getElementById('phoneOverlay')?.classList.contains('show'));
}
function renderOrdermart(){
  const content=document.getElementById('phoneContent');if(!content)return;
  content.innerHTML=`<div class="order-welcome"><span>GOOD THINGS, DELIVERED ✦</span><h2>Make room<br>for a new friend.</h2><p>Choose a set and we'll bring it straight to your desk.</p><div class="order-wallet">◉ ${state.coins.toLocaleString()} <small>AVAILABLE COINS</small></div></div><div class="order-section-title"><b>Today's card packs</b><span>3 CARDS EACH</span></div><div class="order-pack-list">${PACKS.map(p=>`<article class="order-pack"><div class="order-pack-icon ${p.className}">${p.emoji}</div><div class="order-pack-copy"><b>${p.name}</b><small>${p.subtitle}</small><strong>◉ ${p.cost}${state.level>=9?' each':''}</strong></div>${state.level>=9?`<select class="order-quantity" aria-label="${p.name} quantity">${[1,5,10].map(n=>`<option value="${n}">${n}×</option>`).join('')}</select>`:''}<button data-phone-order="${p.id}">Order <span>↗</span></button></article>`).join('')}</div><div class="order-footnote">📦 &nbsp; Your Pocket Post delivery appears on the desk.</div>`;
}
function openPhone(){renderOrdermart();const overlay=document.getElementById('phoneOverlay');overlay.classList.add('show');overlay.setAttribute('aria-hidden','false');renderRoom();}
function closePhone(){const overlay=document.getElementById('phoneOverlay');if(!overlay)return;overlay.classList.remove('show');overlay.setAttribute('aria-hidden','true');renderRoom();}
function roomToast(message){const el=document.getElementById('roomToast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2800);}

function sellValue(cardId){const c=CARD_POOL.find(x=>x.id===cardId);return Math.round(({Normal:12,Gold:24,Rare:42,Diamond:75,Godlike:130,Special:220,Secret:400}[c?.tier]||12)*(1+state.rebirths*.1));}
function showReviewCard(){
  const review=state.activeReview;if(!review)return;
  const c=review.cards[review.index],stage=document.getElementById('unboxCardStage');
  document.getElementById('unboxTitle').textContent=`Card ${review.index+1} of ${review.cards.length}`;
  document.getElementById('unboxSubtitle').textContent=state.collection[c.id]?`You already have ${state.collection[c.id]} ${c.name}${state.collection[c.id]===1?'':'s'}. What should happen to this one?`:`A new discovery! Choose its home.`;
  document.getElementById('unboxProgress').style.width=`${((review.index+1)/review.cards.length)*100}%`;
  stage.innerHTML=`<article class="revealed-card ${tierClass(c.tier)}"><div class="revealed-card-top"><span>${c.tier.toUpperCase()} · POCKET POST</span><span>NO. ${String(CARD_POOL.indexOf(c)+1).padStart(3,'0')}</span></div><div class="revealed-card-art">${c.emoji}<span>✦ ${c.power} PWR</span></div><h3>${c.name}</h3><p>${c.tier} · ${state.collection[c.id]?'Duplicate':'New discovery'}</p></article>`;
  document.getElementById('unboxActions').innerHTML=`<button class="review-keep" data-review="keep" data-card="${c.id}"><span>▤</span><b>Collection</b><small>Keep this card</small></button><button class="review-sell" data-review="sell" data-card="${c.id}"><span>◉</span><b>Sell +${sellValue(c.id)}</b><small>Earn coins</small></button><button class="review-trash" data-review="trash" data-card="${c.id}"><span>⌫</span><b>Trash</b><small>Let it go</small></button>`;
  document.getElementById('unboxDone').hidden=true;
}
function resolveReview(button){
  const id=button.dataset.card,action=button.dataset.review;
  if(action==='keep')state.collection[id]=(state.collection[id]||0)+1;
  if(action==='sell')state.coins+=sellValue(id);
  state.activeReview.index++;
  if(state.activeReview.index>=state.activeReview.cards.length){state.activeReview=null;document.getElementById('unboxTitle').textContent='All cards checked!';document.getElementById('unboxSubtitle').textContent='Your collection is updated. Head back to your cozy room.';document.getElementById('unboxCardStage').innerHTML='<div class="review-complete">✦<span>Beautiful discoveries,<br>carefully sorted.</span></div>';document.getElementById('unboxActions').innerHTML='';document.getElementById('unboxProgress').style.width='100%';document.getElementById('unboxDone').hidden=false;}
  else showReviewCard();
  save();render();renderRoom();
}
function startUnbox(index=0){
  if(state.activeReview){
    document.getElementById('unboxOverlay').classList.add('show');document.getElementById('unboxOverlay').setAttribute('aria-hidden','false');showReviewCard();return;
  }
  const delivery=state.deliveries?.splice(index,1)[0];if(!delivery)return;
  const cards=[];delivery.packs.forEach(id=>{for(let i=0;i<3;i++)cards.push(drawCard(id));});
  state.packCount+=delivery.packs.length;
  const levels=addXp(delivery.packs.length*45);notifyLevelUps(levels);
  state.activeReview={cards,index:0};
  if(state.huntTarget)state.huntTarget=null;
  document.getElementById('unboxOverlay').classList.add('show');document.getElementById('unboxOverlay').setAttribute('aria-hidden','false');
  document.getElementById('unboxKicker').textContent=`POCKET POST · ${delivery.packs.length} PACK${delivery.packs.length===1?'':'S'} DELIVERED`;
  document.getElementById('unboxTitle').textContent='Unboxing your delivery…';document.getElementById('unboxSubtitle').textContent='Little wonders are on their way.';document.getElementById('unboxCardStage').innerHTML='<div class="unbox-box-animation">📦<span>✦</span></div>';document.getElementById('unboxActions').innerHTML='';document.getElementById('unboxDone').hidden=true;
  save();render();renderRoom();
  window.setTimeout(()=>{if(state.activeReview&&document.getElementById('unboxOverlay').classList.contains('show'))showReviewCard();},950);
}
function finishUnbox(){document.getElementById('unboxOverlay').classList.remove('show');document.getElementById('unboxOverlay').setAttribute('aria-hidden','true');renderRoom();}
function rebirth(){if(state.level<15)return;const ok=confirm('Rebirth now? Your level, coins, and unopened deliveries reset. Your collection and any cards already being reviewed stay safe, and your luck bonus grows.');if(!ok)return;state.rebirths++;state.level=1;state.xp=0;state.coins=600;state.stored=[];state.deliveries=[];state.huntTarget=null;persistRender();setView('rebirth');toast(`Rebirth ${state.rebirths}! Your card luck is now ${Math.round(state.rebirths*25)}% stronger.`);}

document.addEventListener('click',event=>{
  const nav=event.target.closest('[data-view]');if(nav){setView(nav.dataset.view);return;}
  const goto=event.target.closest('[data-goto]');if(goto){setView(goto.dataset.goto);return;}
  if(event.target.closest('[data-buy],[data-store]')){openPhone();return;}
  const phoneOrder=event.target.closest('[data-phone-order]');if(phoneOrder){const quantity=phoneOrder.parentElement.querySelector('.order-quantity')?.value||1;buyPack(phoneOrder.dataset.phoneOrder,{amount:Number(quantity)});return;}
  const delivery=event.target.closest('[data-room-delivery]');if(delivery){startUnbox(Number(delivery.dataset.roomDelivery));return;}
    const review=event.target.closest('[data-review]');if(review){resolveReview(review);return;}
  const hunt=event.target.closest('[data-hunt]');if(hunt){state.huntTarget=hunt.dataset.hunt;persistRender();toast('Hunt target set! Your next pack has a better chance.');return;}
    if(event.target.id==='heroBuy'){openPhone();return;}
  if(event.target.id==='phoneButton'){openPhone();return;}
  if(event.target.id==='phoneBack'||event.target===document.getElementById('phoneOverlay')){closePhone();return;}
  if(event.target.id==='deliveryButton'){startUnbox();return;}
  if(event.target.id==='unboxDone'){finishUnbox();return;}
  if(event.target.id==='unboxClose'||event.target===document.getElementById('unboxOverlay')){finishUnbox();return;}
  if(event.target.id==='storagePhoneButton'){openPhone();return;}
  if(event.target.id==='rebirthButton'){rebirth();return;}
});
document.getElementById('tierFilters').addEventListener('click',event=>{const button=event.target.closest('[data-tier]');if(!button)return;activeFilter=button.dataset.tier;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===button));renderCollection();});
document.getElementById('clearHunt').addEventListener('click',()=>{state.huntTarget=null;persistRender();toast('Hunt target cleared.');});
document.getElementById('earnCoins').addEventListener('click',()=>{if(state.welcomeClaimed){toast('Your welcome bonus has already been claimed.');return;}state.welcomeClaimed=true;state.coins+=250;persistRender();toast('Welcome bonus claimed: +250 coins!');});
document.getElementById('menuToggle').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
document.getElementById('roomReturn').addEventListener('click',()=>document.getElementById('roomGame').scrollIntoView({behavior:'smooth',block:'start'}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(document.getElementById('phoneOverlay').classList.contains('show'))closePhone();if(document.getElementById('unboxOverlay').classList.contains('show'))finishUnbox();}});
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2500);}
render();