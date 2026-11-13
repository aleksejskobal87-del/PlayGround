(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = 1000, H = 600, TILE = 70, BX = 220, BY = 20, BOARD = TILE * 8;
  const $ = id => document.getElementById(id);
  const overlay = $('overlay');
  const keys = new Set();
  let mode = 'ready', lastTime = 0, time = 0, score = 0, bossHp = 100;
  let player, boss, pellets = [], enemyShots = [], particles = [], attack = null;
  let fireClock = 0, reloadClock = 0, bossClock = 1.2, invuln = 0, screenShake = 0, audioOn = true, audioCtx = null;
  let parryWindow = 0, parryCooldown = 0, bossStun = 0, bossTrail = [], trailClock = 0;
  let pointer = {x: 0, y: 0, down: false, touch: false, moveId: null, fireId: null, moveOrigin: null, moveVec: {x:0,y:0}};
  const clamp = (v,a,b) => Math.max(a, Math.min(b,v));
  const rand = (a,b) => a + Math.random()*(b-a);
  const boardLimit = {left: BX+10,right:BX+BOARD-10,top:BY+10,bottom:BY+BOARD-10};

  function resize(){
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width*dpr); canvas.height = Math.round(r.height*dpr);
    ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
  }
  new ResizeObserver(resize).observe(canvas); resize();
  function reset(){
    player={x:BX+BOARD*.28,y:BY+BOARD*.69,r:17,speed:225,lives:3,ammo:6,angle:-.55};
    boss={x:BX+BOARD*.66,y:BY+BOARD*.34,r:30,angle:0};
    pellets=[]; enemyShots=[]; particles=[]; bossTrail=[]; bossHp=100; score=0; time=0; invuln=0; fireClock=0; reloadClock=0; bossClock=1.1; attack=null; screenShake=0; parryWindow=0; parryCooldown=0; bossStun=0; trailClock=0; updateUI();
    const knob=$('stickKnob');if(knob)knob.style.transform='translate(0,0)';
  }
  function start(){if(mode==='playing')return;reset();mode='playing';overlay.classList.add('hidden');canvas.focus();lastTime=performance.now();}
  $('startButton').addEventListener('click',start);
  $('pauseButton').addEventListener('click',togglePause);
  function togglePause(){if(mode==='playing'){mode='paused';$('pauseButton').textContent='▶';$('playerState').textContent='PAUSED';overlay.classList.remove('hidden');$('overlayEmblem').textContent='Ⅱ';$('overlayEyebrow').textContent='THE BOARD IS HOLDING ITS BREATH';$('overlayTitle').innerHTML='TAKE A<br><em>BREATHER.</em>';$('overlayText').innerHTML='The Omni Rook can wait. Probably.';$('startButton').innerHTML='RESUME GAME <span>→</span>';$('overlayHint').textContent='PRESS P TO RESUME';}else if(mode==='paused'){mode='playing';$('pauseButton').textContent='Ⅱ';overlay.classList.add('hidden');$('playerState').textContent='STANDING';lastTime=performance.now();}}
  function endGame(won){mode=won?'won':'lost';overlay.classList.remove('hidden');$('overlayEmblem').textContent=won?'♔':'♜';$('overlayEyebrow').textContent=won?'A KING-SIZED VICTORY':'CHECK. AND... CHECK.';$('overlayTitle').innerHTML=won?'ROOK<br><em>AND ROLL.</em>':'THE KING<br><em>IS DOWN.</em>';$('overlayText').innerHTML=won?`The Omni Rook has been dethroned.<br>Final score: ${String(score).padStart(5,'0')}`:'The board claims another monarch.<br>Fancy a rematch?';$('startButton').innerHTML=(won?'PLAY AGAIN':'TRY AGAIN')+' <span>→</span>';$('overlayHint').textContent=won?'THE CROWN IS YOURS.':'THE ROOK IS STILL SMUG.';$('playerState').textContent=won?'VICTORIOUS':'CHECKMATED';$('pauseButton').textContent='Ⅱ';}
  function updateUI(){
    $('bossHealth').style.width=`${Math.max(0,bossHp)}%`; $('bossHpText').textContent=Math.ceil(bossHp);
    $('ammoPips').querySelectorAll('i').forEach((el,i)=>el.classList.toggle('empty',i>=player.ammo));
    $('lives').textContent=Array.from({length:3},(_,i)=>i<player.lives?'♥':'♡').join(' ');
    $('score').textContent=String(score).padStart(5,'0');
    $('phaseLabel').textContent=bossHp>65?'I · WAKING':bossHp>30?'II · ENRAGED':'III · DESPERATE';
    $('reloadNote').textContent=reloadClock>0?'RELOADING…':'PUMP ACTION';
  }
  function beep(freq=160,duration=.06,type='square',vol=.025){if(!audioOn)return;try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.value=vol;g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration);}catch{}}
  $('soundToggle').addEventListener('click',()=>{audioOn=!audioOn;$('soundIcon').textContent=audioOn?'♫':'×';$('soundToggle').querySelector('.sound-label').textContent=audioOn?'SOUND ON':'SOUND OFF';});
  function coords(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};}
  canvas.addEventListener('pointerdown',e=>{if(mode!=='playing')return;canvas.setPointerCapture(e.pointerId);const p=coords(e);pointer.x=p.x;pointer.y=p.y;pointer.down=true;pointer.touch=e.pointerType==='touch';if(pointer.touch&&p.x<W*.46){pointer.moveId=e.pointerId;pointer.moveOrigin=p;pointer.moveVec={x:0,y:0};}else{pointer.fireId=e.pointerId;shoot();}});
  canvas.addEventListener('pointermove',e=>{const p=coords(e);pointer.x=p.x;pointer.y=p.y;if(pointer.moveId===e.pointerId&&pointer.moveOrigin){let dx=p.x-pointer.moveOrigin.x,dy=p.y-pointer.moveOrigin.y;const d=Math.hypot(dx,dy),max=48;if(d>max){dx*=max/d;dy*=max/d;}pointer.moveVec={x:dx/max,y:dy/max};}});
  function pointerUp(e){if(pointer.moveId===e.pointerId){pointer.moveId=null;pointer.moveOrigin=null;pointer.moveVec={x:0,y:0};}if(pointer.fireId===e.pointerId)pointer.fireId=null;if(pointer.touch){pointer.down=false;pointer.touch=false;}}
  canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);
  const stickZone=$('stickZone'),stickKnob=$('stickKnob');let stickPointer=null;
  stickZone.addEventListener('pointerdown',e=>{if(mode!=='playing')return;e.preventDefault();stickPointer=e.pointerId;stickZone.setPointerCapture(e.pointerId);pointer.moveOrigin={x:e.clientX,y:e.clientY};pointer.moveVec={x:0,y:0};});
  stickZone.addEventListener('pointermove',e=>{if(stickPointer!==e.pointerId)return;const r=stickZone.querySelector('.stick-base').getBoundingClientRect();let dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),d=Math.hypot(dx,dy),max=r.width*.36;if(d>max){dx*=max/d;dy*=max/d;}pointer.moveVec={x:dx/max,y:dy/max};stickKnob.style.transform=`translate(${dx}px,${dy}px)`;});
  const releaseStick=e=>{if(stickPointer!==e.pointerId)return;stickPointer=null;pointer.moveVec={x:0,y:0};stickKnob.style.transform='translate(0,0)';};stickZone.addEventListener('pointerup',releaseStick);stickZone.addEventListener('pointercancel',releaseStick);
  const shootButton=$('shootButton');shootButton.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(mode!=='playing')return;shootButton.setPointerCapture(e.pointerId);pointer.x=boss.x;pointer.y=boss.y;pointer.down=true;pointer.fireId=e.pointerId;shoot();});shootButton.addEventListener('pointerup',e=>{pointer.down=false;pointer.fireId=null;});shootButton.addEventListener('pointercancel',e=>{pointer.down=false;pointer.fireId=null;});
  const parryButton=$('parryButton');parryButton.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();parry();});
  window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Shift'].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='p')togglePause();if(e.key===' '&&mode==='playing')shoot();if(e.key==='Shift'&&mode==='playing')parry();});
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur',()=>{keys.clear();pointer.down=false;pointer.moveVec={x:0,y:0};});
  function shoot(){if(mode!=='playing'||fireClock>0||reloadClock>0)return;if(player.ammo<=0){reloadClock=1.15;beep(90,.08,'triangle');return;}player.ammo--;fireClock=.38;const base=Math.atan2(pointer.y-player.y,pointer.x-player.x);player.angle=base;const dist=Math.hypot(boss.x-player.x,boss.y-player.y);const spread=dist<220?.095:.18;for(let i=0;i<7;i++){const a=base+(i-3)*spread+rand(-.025,.025),speed=720+rand(-60,60);pellets.push({x:player.x+Math.cos(a)*20,y:player.y+Math.sin(a)*20,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:.46,damage:dist<250?4.1:2.6});}burst(player.x+Math.cos(base)*24,player.y+Math.sin(base)*24,'#d8ff52',8,100);screenShake=Math.max(screenShake,4);beep(95,.1,'sawtooth',.045);beep(330,.05,'triangle',.015);updateUI();}
  function parry(){if(mode!=='playing'||parryCooldown>0)return;parryWindow=.24;parryCooldown=1.15;player.parryFlash=.24;beep(680,.07,'triangle',.03);updateParryUI();}
  function updateParryUI(){if(!parryButton)return;parryButton.classList.toggle('ready',parryCooldown<=0);parryButton.classList.toggle('cooling',parryCooldown>0);parryButton.querySelector('small').textContent=parryCooldown<=0?'READY':`${parryCooldown.toFixed(1)}s`;}
  function parryHit(x,y){score+=150;bossHp=Math.max(0,bossHp-8);bossStun=.8;if(attack){attack=null;bossClock=.8;}burst(x,y,'#65e8ff',20,190);screenShake=7;beep(820,.16,'triangle',.04);updateUI();if(bossHp<=0)endGame(true);}
  function burst(x,y,color,n=8,power=100){for(let i=0;i<n;i++){const a=rand(0,Math.PI*2),v=rand(power*.25,power);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.16,.42),max:.42,color,r:rand(1.5,3.8)});}}
  function beginAttack(){
    const phase=bossHp>65?0:bossHp>30?1:2;
    const types=phase===0?['line','burst','cross']:phase===1?['line','burst','cross','aimed']:['line','burst','cross','aimed','spiral'];
    const type=types[Math.floor(Math.random()*types.length)];const dx=player.x-boss.x,dy=player.y-boss.y;
    if(type==='line'){
      const angle=Math.abs(dx)>Math.abs(dy)?(dx>0?0:Math.PI):(dy>0?Math.PI/2:-Math.PI/2);
      attack={type,phase:'tell',timer:phase===2?.52:.82,angle};boss.angle=angle;
    }else if(type==='burst'||type==='spiral')attack={type,phase:'tell',timer:.75,angle:Math.atan2(dy,dx)};
    else if(type==='cross')attack={type,phase:'tell',timer:.82,angle:Math.atan2(dy,dx)};
    else attack={type,phase:'tell',timer:.72,angle:Math.atan2(dy,dx)};
    beep(260,.16,'triangle',.02);
  }
  function spawnBurst(type='burst'){
    const n=bossHp<30?18:12,base=type==='spiral'?attack.angle:time*.21;
    if(type==='spiral'){for(let i=0;i<5;i++){const a=base+i*Math.PI*2/5,s=160;enemyShots.push({x:boss.x,y:boss.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:7,life:3,color:'#e773ff',turn:.9});}}
    else for(let i=0;i<n;i++){const a=i*Math.PI*2/n+base,s=190+(bossHp<30?35:0);enemyShots.push({x:boss.x,y:boss.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:6,life:3,color:type==='cross'?'#ff8b67':'#ff8b67'});}
  }
  function fireLine(){const dx=Math.cos(attack.angle),dy=Math.sin(attack.angle);let x=boss.x,y=boss.y;while(x>BX&&x<BX+BOARD&&y>BY&&y<BY+BOARD){x+=dx*18;y+=dy*18;}x-=dx*18;y-=dy*18;attack={...attack,phase:'dash',timer:.24,x0:boss.x,y0:boss.y,x1:x,y1:y};boss.x=x;boss.y=y;screenShake=9;beep(75,.19,'sawtooth',.045);}
  function fireAimed(){const a=Math.atan2(player.y-boss.y,player.x-boss.x),n=bossHp<30?5:3;for(let i=0;i<n;i++){const angle=a+(i-(n-1)/2)*.15,speed=255;enemyShots.push({x:boss.x,y:boss.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:7,life:3.2,color:'#ffcc54'});}attack={...attack,phase:'recover',timer:.58};beep(130,.14,'sawtooth',.03);}
  function fireCross(){for(let i=0;i<4;i++){const a=i*Math.PI/2;enemyShots.push({x:boss.x,y:boss.y,vx:Math.cos(a)*235,vy:Math.sin(a)*235,r:8,life:3,color:'#ff648e'});}attack={...attack,phase:'recover',timer:.68};screenShake=3;}
  function hurt(){if(invuln>0)return;player.lives--;invuln=1.25;screenShake=12;burst(player.x,player.y,'#ff5b56',17,175);beep(75,.25,'sawtooth',.05);updateUI();if(player.lives<=0)endGame(false);}
  function update(dt){if(mode!=='playing')return;time+=dt;fireClock=Math.max(0,fireClock-dt);invuln=Math.max(0,invuln-dt);screenShake=Math.max(0,screenShake-dt*28);parryWindow=Math.max(0,parryWindow-dt);parryCooldown=Math.max(0,parryCooldown-dt);bossStun=Math.max(0,bossStun-dt);if(player.parryFlash)player.parryFlash=Math.max(0,player.parryFlash-dt);updateParryUI();
    trailClock-=dt;if(trailClock<=0){trailClock=.035;bossTrail.push({x:boss.x,y:boss.y,life:.5,max:.5,hue:(time*145)%360});}for(let i=bossTrail.length-1;i>=0;i--){bossTrail[i].life-=dt;if(bossTrail[i].life<=0)bossTrail.splice(i,1);}
    if(reloadClock>0){reloadClock-=dt;if(reloadClock<=0){player.ammo=6;reloadClock=0;beep(520,.1,'triangle');updateUI();}}
    let mx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+pointer.moveVec.x;
    let my=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+pointer.moveVec.y;
    const ml=Math.hypot(mx,my);if(ml>1){mx/=ml;my/=ml;}player.x=clamp(player.x+mx*player.speed*dt,boardLimit.left,boardLimit.right);player.y=clamp(player.y+my*player.speed*dt,boardLimit.top,boardLimit.bottom);
    if(pointer.x||pointer.y){player.angle=Math.atan2(pointer.y-player.y,pointer.x-player.x);}if(pointer.down&&pointer.fireId!==null&&fireClock<=0)shoot();
    if(bossStun<=0){bossClock-=dt;if(!attack&&bossClock<=0)beginAttack();
      if(attack){attack.timer-=dt;if(attack.phase==='tell'&&attack.timer<=0){if(attack.type==='line')fireLine();else if(attack.type==='aimed')fireAimed();else if(attack.type==='cross')fireCross();else{spawnBurst(attack.type);attack={...attack,phase:'recover',timer:attack.type==='spiral'?.78:.68};screenShake=3;}}else if(attack.phase==='dash'&&attack.timer<=0){if(Math.hypot(player.x-attack.x1,player.y-attack.y1)<48){if(parryWindow>0){parryWindow=0;parryHit(attack.x1,attack.y1);}else hurt();}attack=null;bossClock=bossHp<30?1.05:1.55;}else if(attack.phase==='recover'&&attack.timer<=0){attack=null;bossClock=bossHp<30?1.2:1.8;}}
    }
    for(let i=pellets.length-1;i>=0;i--){const b=pellets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(Math.hypot(b.x-boss.x,b.y-boss.y)<boss.r+4){bossHp=Math.max(0,bossHp-b.damage);score+=10;burst(b.x,b.y,'#d8ff52',3,45);pellets.splice(i,1);updateUI();if(bossHp<=0){endGame(true);break;}}else if(b.life<=0)pellets.splice(i,1);}
    for(let i=enemyShots.length-1;i>=0;i--){const b=enemyShots[i];if(b.turn&&!b.reflected){const target=Math.atan2(player.y-b.y,player.x-b.x),current=Math.atan2(b.vy,b.vx),delta=Math.atan2(Math.sin(target-current),Math.cos(target-current)),angle=current+clamp(delta,-b.turn*dt,b.turn*dt),speed=Math.hypot(b.vx,b.vy);b.vx=Math.cos(angle)*speed;b.vy=Math.sin(angle)*speed;}b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;const distance=Math.hypot(player.x-b.x,player.y-b.y);if(b.reflected&&Math.hypot(boss.x-b.x,boss.y-b.y)<boss.r+b.r){bossHp=Math.max(0,bossHp-(b.damage||7));score+=40;burst(b.x,b.y,'#65e8ff',7,90);enemyShots.splice(i,1);updateUI();if(bossHp<=0)endGame(true);}else if(distance<player.r+b.r&&(parryWindow>0)){const a=Math.atan2(boss.y-b.y,boss.x-b.x),speed=430;b.vx=Math.cos(a)*speed;b.vy=Math.sin(a)*speed;b.life=1.8;b.turn=0;b.reflected=true;b.damage=7;b.color='#65e8ff';parryWindow=0;parryHit(b.x,b.y);}else if(distance<player.r+b.r){enemyShots.splice(i,1);hurt();}else if(b.life<=0||b.x<BX-20||b.x>BX+BOARD+20||b.y<BY-20||b.y>BY+BOARD+20)enemyShots.splice(i,1);}
    for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.08,dt);p.vy*=Math.pow(.08,dt);p.life-=dt;if(p.life<=0)particles.splice(i,1);}
  }
  function draw(){ctx.clearRect(0,0,W,H);ctx.save();if(screenShake>0)ctx.translate(rand(-screenShake,screenShake),rand(-screenShake,screenShake));drawArena();drawAttack();drawShots();drawPieces();drawParticles();ctx.restore();}
  function drawArena(){
    ctx.fillStyle='#171b26';ctx.fillRect(0,0,W,H);
    // Quiet vignette and board drop shadow.
    ctx.shadowColor='#0009';ctx.shadowBlur=28;ctx.fillStyle='#0c1019';ctx.fillRect(BX-2,BY-2,BOARD+4,BOARD+4);ctx.shadowBlur=0;
    for(let y=0;y<8;y++)for(let x=0;x<8;x++){const light=(x+y)%2===0;ctx.fillStyle=light?'#333b48':'#252d3b';ctx.fillRect(BX+x*TILE,BY+y*TILE,TILE,TILE);ctx.fillStyle=light?'#ffffff07':'#00000012';ctx.fillRect(BX+x*TILE,BY+y*TILE,TILE,TILE);}
    // Faint board inlays, border and corner rivets.
    ctx.strokeStyle='#e2e5e511';ctx.lineWidth=1;for(let i=1;i<8;i++){ctx.beginPath();ctx.moveTo(BX+i*TILE,BY);ctx.lineTo(BX+i*TILE,BY+BOARD);ctx.stroke();ctx.beginPath();ctx.moveTo(BX,BY+i*TILE);ctx.lineTo(BX+BOARD,BY+i*TILE);ctx.stroke();}
    ctx.strokeStyle='#8c95a366';ctx.lineWidth=2;ctx.strokeRect(BX,BY,BOARD,BOARD);
    for(const [x,y] of [[BX,BY],[BX+BOARD,BY],[BX,BY+BOARD],[BX+BOARD,BY+BOARD]]){ctx.fillStyle='#d8ff5277';ctx.fillRect(x-2,y-2,4,4);}
    // Danger pieces at the margins.
    ctx.globalAlpha=.16;ctx.font='36px serif';ctx.textAlign='center';ctx.fillStyle='#dce0e7';[['♟',80,112],['♞',915,100],['♝',110,520],['♛',910,508]].forEach(v=>ctx.fillText(...v));ctx.globalAlpha=1;
    // subtle rally markers
    ctx.fillStyle='#f0eee711';ctx.font='9px monospace';ctx.textAlign='center';for(let i=0;i<8;i++)ctx.fillText(String(i+1),BX-11,BY+i*TILE+TILE/2+3);
  }
  function drawAttack(){if(!attack||attack.phase!=='tell')return;const pulse=.45+.3*Math.sin(time*18);ctx.save();ctx.globalAlpha=pulse;
    if(attack.type==='line'){ctx.translate(boss.x,boss.y);ctx.rotate(attack.angle);const len=BOARD*1.35;ctx.fillStyle='#ff5b5627';ctx.fillRect(-len,-11,len*2,22);ctx.fillStyle='#ff6c62';ctx.fillRect(-len,-1.5,len*2,3);for(let i=-len;i<len;i+=28){ctx.fillStyle='#ffaaa055';ctx.fillRect(i,-13,12,2);}}
    else if(attack.type==='aimed'){ctx.strokeStyle='#ffce54';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.beginPath();ctx.moveTo(boss.x,boss.y);ctx.lineTo(boss.x+Math.cos(attack.angle)*BOARD,boss.y+Math.sin(attack.angle)*BOARD);ctx.stroke();ctx.setLineDash([]);}
    else{ctx.strokeStyle=attack.type==='cross'?'#ff648e':attack.type==='spiral'?'#e773ff':'#ff695b';ctx.lineWidth=2;ctx.setLineDash([5,8]);ctx.beginPath();ctx.arc(boss.x,boss.y,140+Math.sin(time*10)*12,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);if(attack.type==='cross'){ctx.beginPath();ctx.moveTo(BX,boss.y);ctx.lineTo(BX+BOARD,boss.y);ctx.moveTo(boss.x,BY);ctx.lineTo(boss.x,BY+BOARD);ctx.stroke();}}
    ctx.restore();}
  function drawShots(){for(const b of pellets){ctx.fillStyle='#eaff91';ctx.shadowColor='#d8ff52';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}for(const b of enemyShots){ctx.fillStyle=b.color;ctx.shadowColor=b.color;ctx.shadowBlur=13;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffe2c4';ctx.beginPath();ctx.arc(b.x-1,b.y-1,b.r*.35,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}}
  function drawPieces(){
    if(attack?.phase==='dash'){ctx.save();ctx.globalAlpha=.28;ctx.strokeStyle='#ff6b60';ctx.lineWidth=25;ctx.beginPath();ctx.moveTo(attack.x0,attack.y0);ctx.lineTo(attack.x1,attack.y1);ctx.stroke();ctx.restore();}
    for(const t of bossTrail){const alpha=clamp(t.life/t.max,0,1)*.38;ctx.globalAlpha=alpha;ctx.fillStyle=`hsl(${t.hue},100%,62%)`;ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=16;ctx.beginPath();ctx.arc(t.x,t.y,boss.r*(.28+.5*t.life/t.max),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;ctx.shadowBlur=0;
    const hue=(time*145)%360,bossColor=`hsl(${hue},72%,48%)`,edgeColor=`hsl(${(hue+45)%360},100%,72%)`;
    const glow=ctx.createRadialGradient(boss.x,boss.y,8,boss.x,boss.y,68);glow.addColorStop(0,`hsla(${hue},100%,60%,.32)`);glow.addColorStop(1,`hsla(${(hue+100)%360},100%,50%,0)`);ctx.fillStyle=glow;ctx.beginPath();ctx.arc(boss.x,boss.y,68,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.translate(boss.x,boss.y);ctx.rotate(Math.sin(time*2)*.035);ctx.shadowColor=edgeColor;ctx.shadowBlur=20;ctx.fillStyle=bossColor;ctx.strokeStyle=edgeColor;ctx.lineWidth=2;
    // stylized rook silhouette
    ctx.beginPath();ctx.moveTo(-22,-18);ctx.lineTo(-26,-29);ctx.lineTo(-16,-29);ctx.lineTo(-14,-22);ctx.lineTo(-6,-22);ctx.lineTo(-5,-31);ctx.lineTo(5,-31);ctx.lineTo(6,-22);ctx.lineTo(15,-22);ctx.lineTo(17,-29);ctx.lineTo(27,-29);ctx.lineTo(23,-17);ctx.lineTo(18,-12);ctx.lineTo(18,16);ctx.lineTo(29,23);ctx.lineTo(29,29);ctx.lineTo(-29,29);ctx.lineTo(-29,23);ctx.lineTo(-18,16);ctx.lineTo(-18,-12);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='#ffcfad';ctx.fillRect(-10,-5,6,6);ctx.fillRect(5,-5,6,6);ctx.fillStyle='#4b2029';ctx.fillRect(-9,-4,3,4);ctx.fillRect(6,-4,3,4);ctx.strokeStyle='#662d39';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,9);ctx.lineTo(8,9);ctx.stroke();ctx.restore();
    // parry window ring and player king
    if(parryWindow>0||player.parryFlash>0){const active=parryWindow>0;ctx.save();ctx.globalAlpha=active?.8:clamp(player.parryFlash/.24,0,1)*.45;ctx.strokeStyle='#65e8ff';ctx.lineWidth=active?3:2;ctx.shadowColor='#65e8ff';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(player.x,player.y,player.r+12+(active?Math.sin(time*35)*3:0),0,Math.PI*2);ctx.stroke();ctx.restore();}
    if(invuln<=0||Math.floor(time*15)%2===0){ctx.save();ctx.translate(player.x,player.y);ctx.rotate(player.angle);ctx.globalAlpha=invuln>0?.55:1;ctx.shadowColor='#d8ff52';ctx.shadowBlur=14;ctx.fillStyle='#e5e5d7';ctx.strokeStyle='#fff9ca';ctx.lineWidth=2;
      // shotgun
      ctx.fillStyle='#6d7561';ctx.fillRect(5,-5,29,10);ctx.fillStyle='#d3b783';ctx.fillRect(25,-3,14,6);ctx.fillStyle='#b7c58c';ctx.fillRect(7,-7,7,14);
      ctx.shadowBlur=0;ctx.fillStyle='#d8d8c9';ctx.beginPath();ctx.moveTo(-15,8);ctx.lineTo(-12,-7);ctx.lineTo(-8,-16);ctx.lineTo(0,-20);ctx.lineTo(8,-16);ctx.lineTo(12,-7);ctx.lineTo(15,8);ctx.lineTo(10,16);ctx.lineTo(-10,16);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#f6f1dc';ctx.beginPath();ctx.arc(0,-10,5,0,Math.PI*2);ctx.fill();ctx.fillRect(-2,-24,4,10);ctx.fillRect(-6,-22,12,3);ctx.fillStyle='#303744';ctx.fillRect(5,-2,3,4);ctx.restore();}
  }
  function drawParticles(){for(const p of particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
  function frame(now){const dt=Math.min(.033,(now-lastTime)/1000||0);lastTime=now;update(dt);draw();requestAnimationFrame(frame);}
  reset();requestAnimationFrame(frame);
})();
