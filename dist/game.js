import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

// Checkmate Arena — a small, self-contained 3D chess game.
const canvas = document.querySelector('#game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.14;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#111713');
scene.fog = new THREE.FogExp2('#111713', 0.026);
const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
const cameraTarget = new THREE.Vector3(0, 0, 0);
let viewMode = 'commander';
let selectedSquare = -1;
let legalTargets = [];
let busy = false;
let gameOver = false;
let boardState;
let history = [];
let lastMove = null;
let toastTimer;
let aiTimer;
const pieceMeshes = new Map();
const pieceData = new Map();
const tileMeshes = [];
const markerMeshes = [];
const effects = [];
const fallingPieces = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();
const mat = (color, roughness=.65, metalness=.05) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const mats = {
  boardDark: mat('#40382b'), boardLight: mat('#b7a982'), base: mat('#382f24'), edge: mat('#6b583c'),
  white: mat('#d9d4bd', .28, .2), whiteShade: mat('#9eaa8b', .36, .12), whiteDark: mat('#71806a', .35, .15),
  black: mat('#342e29', .3, .3), blackShade: mat('#a45545', .35, .18), blackDark: mat('#713d35', .35, .2),
  gold: mat('#cfb57b', .26, .62), silver: mat('#bfcbb2', .27, .45), red: mat('#d27c64', .32, .35),
  glow: new THREE.MeshBasicMaterial({ color: '#b5d490', transparent: true, opacity: .8 }),
  captureGlow: new THREE.MeshBasicMaterial({ color: '#e48068', transparent: true, opacity: .82 }),
};
scene.add(new THREE.HemisphereLight('#d5dfc2', '#342b22', 2.15));
const keyLight = new THREE.DirectionalLight('#fff0d3', 3.2);
keyLight.position.set(-5, 10, 5); keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048); keyLight.shadow.camera.left = -8; keyLight.shadow.camera.right = 8; keyLight.shadow.camera.top = 8; keyLight.shadow.camera.bottom = -8;
keyLight.shadow.bias = -.00025; scene.add(keyLight);
const rimLight = new THREE.PointLight('#9bac80', 22, 18, 2); rimLight.position.set(5, 5, -4); scene.add(rimLight);
const warmLight = new THREE.PointLight('#bd795d', 12, 14, 2); warmLight.position.set(-5, 3, 5); scene.add(warmLight);

function sq(file, rank) { return rank * 8 + file; }
function coords(index) { return [index % 8, Math.floor(index / 8)]; }
function world(index, y=0) { const [f,r] = coords(index); return new THREE.Vector3(f - 3.5, y, r - 3.5); }
function algebraic(index) { const [f,r] = coords(index); return String.fromCharCode(97+f) + (r+1); }
function pieceName(type) { return ({k:'KING',q:'QUEEN',r:'ROOK',b:'BISHOP',n:'KNIGHT',p:'PAWN'})[type]; }
function colorName(color) { return color === 'w' ? 'ally' : 'enemy'; }

function buildRoom() {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat('#171b17', .92));
  floor.rotation.x = -Math.PI/2; floor.position.y = -0.55; floor.receiveShadow = true; scene.add(floor);
  const platform = new THREE.Mesh(new THREE.BoxGeometry(8.82, .42, 8.82), mats.base);
  platform.position.y = -.24; platform.receiveShadow = platform.castShadow = true; scene.add(platform);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(8.96, .13, 8.96), mats.edge);
  rim.position.y = -.03; rim.receiveShadow = rim.castShadow = true; scene.add(rim);
  const squares = new THREE.Group(); scene.add(squares);
  for (let r=0; r<8; r++) for (let f=0; f<8; f++) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(.98, .075, .98), (f+r)%2 ? mats.boardDark : mats.boardLight);
    mesh.position.set(f-3.5, .055, r-3.5); mesh.receiveShadow = true; mesh.userData.index = sq(f,r); squares.add(mesh); tileMeshes.push(mesh);
  }
  // Subtle brass corner pins and a halo that gives the table a grounded, handcrafted feel.
  for (const [x,z] of [[-4.25,-4.25],[4.25,-4.25],[-4.25,4.25],[4.25,4.25]]) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.09,12), mats.gold); pin.position.set(x,.04,z); pin.castShadow=true; scene.add(pin);
  }
  const halo = new THREE.Mesh(new THREE.TorusGeometry(5.1,.018,8,100), new THREE.MeshBasicMaterial({color:'#776644',transparent:true,opacity:.36}));
  halo.rotation.x=Math.PI/2; halo.position.y=-.46; scene.add(halo);
}
buildRoom();

function createPieceMesh(type, color) {
  const group = new THREE.Group();
  const ally = color === 'w';
  const primary = ally ? mats.white : mats.black;
  const accent = ally ? mats.whiteShade : mats.blackShade;
  const darkAccent = ally ? mats.whiteDark : mats.blackDark;
  const add = (geometry, material, x=0, y=0, z=0, sx=1, sy=1, sz=1) => {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x,y,z); mesh.scale.set(sx,sy,sz); mesh.castShadow=true; mesh.receiveShadow=true; group.add(mesh); return mesh;
  };
  const lathe=(points, material=primary, seg=24)=>add(new THREE.LatheGeometry(points.map(([x,y])=>new THREE.Vector2(x,y)),seg),material);
  const baseProfile=[[.0,0],[.28,0],[.32,.04],[.32,.09],[.27,.13],[.23,.16],[.21,.2],[.19,.25],[.16,.29]];
  lathe(baseProfile, primary, 32);
  lathe([[.17,.23],[.21,.25],[.21,.29],[.16,.32],[.14,.36]], accent, 24);
  if(type==='p') {
    lathe([[.12,.31],[.15,.35],[.13,.42],[.105,.48],[.08,.56],[.09,.61],[.14,.65],[.16,.68],[.14,.72],[.08,.75],[0,.76]],primary,28);
    add(new THREE.SphereGeometry(.115,20,16), accent,0,.68,0,1,.97,1);
    add(new THREE.SphereGeometry(.048,16,12), ally?mats.gold:mats.red,0,.72,.098);
  } else if(type==='r') {
    lathe([[.13,.31],[.17,.36],[.14,.43],[.12,.48],[.16,.53],[.18,.59],[.18,.66],[.22,.69],[.22,.75],[.17,.77],[0,.77]],primary,28);
    lathe([[.18,.63],[.23,.65],[.23,.7],[.18,.72]],accent);
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5;add(new THREE.BoxGeometry(.1,.14,.12),accent,Math.cos(a)*.16,.79,Math.sin(a)*.16);}
    add(new THREE.CylinderGeometry(.11,.11,.08,24),accent,0,.74,0);
  } else if(type==='n') {
    lathe([[.12,.31],[.17,.36],[.14,.44],[.12,.49],[.18,.54],[.2,.59],[.18,.64],[.14,.67]],primary,24);
    // Stylized forward-facing knight bust, with a swept mane and bright eye.
    const neck=add(new THREE.CapsuleGeometry(.115,.36,5,10),accent,0,.72,-.025); neck.rotation.z=-.22;
    const head=add(new THREE.SphereGeometry(.16,20,16),primary,.045,.94,-.08, .83,1.05,.72); head.rotation.z=-.24;
    const muzzle=add(new THREE.ConeGeometry(.082,.2,16),accent,.1,.91,-.205); muzzle.rotation.x=Math.PI/2; muzzle.rotation.z=-.48;
    const mane=add(new THREE.ConeGeometry(.13,.35,12),darkAccent,-.045,.95,.05); mane.rotation.z=-.4;
    const ear=add(new THREE.ConeGeometry(.055,.16,10),accent,-.01,1.08,-.11); ear.rotation.z=-.18;
    add(new THREE.SphereGeometry(.025,12,10),ally?mats.gold:mats.red,.105,.99,-.151);
  } else if(type==='b') {
    lathe([[.12,.31],[.16,.36],[.14,.43],[.11,.49],[.14,.55],[.17,.61],[.13,.68],[.1,.76],[.07,.83],[0,.94]],primary,28);
    add(new THREE.SphereGeometry(.12,16,12),accent,0,.73,0,1,1.45,1);
    const slash=add(new THREE.BoxGeometry(.035,.2,.04),darkAccent,0,.85,0); slash.rotation.z=.38;
    add(new THREE.SphereGeometry(.045,16,12),mats.gold,0,.96,0);
  } else if(type==='q' || type==='k') {
    lathe([[.12,.31],[.17,.36],[.14,.44],[.12,.5],[.17,.55],[.19,.62],[.16,.68],[.12,.72],[.1,.77],[.15,.8],[.16,.84],[0,.84]],primary,32);
    lathe([[.16,.67],[.2,.69],[.2,.73],[.15,.76]],accent,28);
    add(new THREE.TorusGeometry(.14,.025,8,24),ally?mats.gold:mats.red,0,.81,0);
    if(type==='q') {
      add(new THREE.SphereGeometry(.055,16,12),accent,0,1.0,0);
      for(let i=0;i<5;i++){const a=i*2*Math.PI/5;add(new THREE.SphereGeometry(.045,12,10),ally?mats.gold:mats.red,Math.cos(a)*.14,.94,Math.sin(a)*.14);}
      add(new THREE.ConeGeometry(.1,.13,5),accent,0,.9,0);
    } else {
      add(new THREE.BoxGeometry(.055,.26,.055),ally?mats.gold:mats.red,0,1.0,0);
      add(new THREE.BoxGeometry(.2,.055,.055),ally?mats.gold:mats.red,0,1.02,0);
      add(new THREE.CylinderGeometry(.11,.13,.06,24),accent,0,.86,0);
    }
  }
  group.traverse(o=>{ if(o.isMesh){o.castShadow=true;o.receiveShadow=true;} });
  group.userData.type=type; group.userData.color=color;
  return group;
}

const initialBack=['r','n','b','q','k','b','n','r'];
let nextId=1;
let allyRoster=[];
function newPiece(type,color){return {type,color,id:nextId++,moved:false};}
function initialState(){
  const board=Array(64).fill(null);
  for(let f=0;f<8;f++){board[sq(f,0)]=newPiece(initialBack[f],'w');board[sq(f,1)]=newPiece('p','w');board[sq(f,6)]=newPiece('p','b');board[sq(f,7)]=newPiece(initialBack[f],'b');}
  allyRoster=board.filter(piece=>piece?.color==='w').map(piece=>({id:piece.id,type:piece.type}));
  return {board,turn:'w',ep:-1,halfmove:0,fullmove:1};
}
function cloneState(s){return {board:s.board.map(p=>p?{...p}:null),turn:s.turn,ep:s.ep,halfmove:s.halfmove,fullmove:s.fullmove};}

function inBounds(f,r){return f>=0&&f<8&&r>=0&&r<8;}
function attacked(state,index,byColor){
  const [tf,tr]=coords(index); const b=state.board;
  for(let i=0;i<64;i++){const p=b[i];if(!p||p.color!==byColor)continue;const [f,r]=coords(i),df=tf-f,dr=tr-r;
    if(p.type==='p'){const d=p.color==='w'?1:-1;if(Math.abs(df)===1&&dr===d)return true;continue;}
    if(p.type==='n'&&((Math.abs(df)===1&&Math.abs(dr)===2)||(Math.abs(df)===2&&Math.abs(dr)===1)))return true;
    if(p.type==='k'&&Math.max(Math.abs(df),Math.abs(dr))===1)return true;
    if(p.type==='b'||p.type==='r'||p.type==='q'){
      const diagonal=Math.abs(df)===Math.abs(dr)&&df!==0,straight=(df===0)!==(dr===0);
      if((p.type==='b'&&!diagonal)||(p.type==='r'&&!straight)||(p.type==='q'&&!diagonal&&!straight))continue;
      const sx=Math.sign(df),sy=Math.sign(dr);let x=f+sx,y=r+sy,blocked=false;
      while(x!==tf||y!==tr){if(b[sq(x,y)]){blocked=true;break;}x+=sx;y+=sy;}if(!blocked)return true;
    }
  }
  return false;
}
function kingSquare(state,color){return state.board.findIndex(p=>p&&p.color===color&&p.type==='k');}
function inCheck(state,color){const k=kingSquare(state,color);return k<0||attacked(state,k,color==='w'?'b':'w');}

function pseudoMoves(state,from){
  const p=state.board[from];if(!p)return[];const [f,r]=coords(from),moves=[],b=state.board;
  const add=(x,y,extra={})=>{if(!inBounds(x,y))return;const to=sq(x,y),target=b[to];if(target&&target.color===p.color)return;moves.push({from,to,...extra});};
  if(p.type==='p'){
    const d=p.color==='w'?1:-1,oneR=r+d;
    if(inBounds(f,oneR)&&!b[sq(f,oneR)]){add(f,oneR);if(!p.moved&&!b[sq(f,r+2*d)])add(f,r+2*d,{double:true});}
    for(const dx of [-1,1])if(inBounds(f+dx,oneR)){const to=sq(f+dx,oneR);if(b[to]&&b[to].color!==p.color)add(f+dx,oneR);else if(to===state.ep)add(f+dx,oneR,{ep:true});}
  } else if(p.type==='n'){
    for(const [dx,dy] of [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]])add(f+dx,r+dy);
  } else if(p.type==='k'){
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)if(dx||dy)add(f+dx,r+dy);
    if(!p.moved&&!inCheck(state,p.color)){
      const home=p.color==='w'?0:7;
      for(const side of ['king','queen']){
        const rookFile=side==='king'?7:0,rook=b[sq(rookFile,home)];
        if(!rook||rook.type!=='r'||rook.color!==p.color||rook.moved)continue;
        const emptyFiles=side==='king'?[5,6]:[1,2,3],path=side==='king'?[5,6]:[3,2];
        if(emptyFiles.some(x=>b[sq(x,home)]))continue;
        if(path.some(x=>attacked(state,sq(x,home),p.color==='w'?'b':'w')))continue;
        moves.push({from,to:sq(side==='king'?6:2,home),castle:side});
      }
    }
  } else {
    const dirs=[];if(p.type==='b'||p.type==='q')dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);if(p.type==='r'||p.type==='q')dirs.push([1,0],[-1,0],[0,1],[0,-1]);
    for(const [dx,dy] of dirs){let x=f+dx,y=r+dy;while(inBounds(x,y)){const to=sq(x,y);if(b[to]){if(b[to].color!==p.color)add(x,y);break;}add(x,y);x+=dx;y+=dy;}}
  }
  return moves;
}
function applyMove(state,move){
  const n=cloneState(state),p=n.board[move.from],taken=move.ep?n.board[move.to+(p.color==='w'?-8:8)]:n.board[move.to];
  n.board[move.from]=null;if(move.ep)n.board[move.to+(p.color==='w'?-8:8)]=null;
  p.moved=true;if(p.type==='p'&&(Math.floor(move.to/8)===0||Math.floor(move.to/8)===7))p.type=move.promotion||'q';
  n.board[move.to]=p;
  if(move.castle){const home=p.color==='w'?0:7,rookFrom=sq(move.castle==='king'?7:0,home),rookTo=sq(move.castle==='king'?5:3,home);n.board[rookTo]=n.board[rookFrom];n.board[rookFrom]=null;n.board[rookTo].moved=true;}
  n.ep=move.double?(move.from+move.to)/2:-1;
  n.halfmove=(p.type==='p'||taken)?0:n.halfmove+1;
  if(state.turn==='b')n.fullmove++;
  n.turn=state.turn==='w'?'b':'w';
  return {state:n,captured:taken};
}
function legalMoves(state,from=null){
  const color=from===null?state.turn:state.board[from]?.color;if(!color)return[];const candidates=[];
  for(let i=0;i<64;i++)if(state.board[i]&&state.board[i].color===color&&(from===null||from===i))candidates.push(...pseudoMoves(state,i));
  return candidates.filter(m=>!inCheck(applyMove(state,m).state,color));
}
function allMoves(state){return legalMoves(state,null);}

const pieceValue={p:100,n:320,b:335,r:500,q:900,k:20000};
function evaluate(state){
  let score=0;
  for(let i=0;i<64;i++){const p=state.board[i];if(!p)continue;const [f,r]=coords(i),advance=p.color==='b'?r:7-r;
    let positional=0;if(p.type==='p')positional=(p.color==='b'?r:7-r)*7+(3.5-Math.abs(3.5-f))*2;
    if(p.type==='n'||p.type==='b')positional=(3.5-Math.abs(3.5-f))*(p.type==='n'?7:4)+(3.5-Math.abs(3.5-r))*(p.type==='n'?7:4);
    if(p.type==='k'&&state.fullmove>12)positional=(3.5-Math.abs(3.5-f))*(3.5-Math.abs(3.5-r))*2;
    score+=(p.color==='b'?1:-1)*(pieceValue[p.type]+positional);
  }
  return score;
}
function scoreMove(state,m){
  const p=state.board[m.from],victim=m.ep?{type:'p'}:state.board[m.to];let s=victim?pieceValue[victim.type]*10-pieceValue[p.type]:0;
  if(m.promotion)s+=800;if(m.castle)s+=45;
  const next=applyMove(state,m).state;if(inCheck(next,next.turn))s+=35;
  const [f,r]=coords(m.to);s+=(3.5-Math.abs(3.5-f))+(3.5-Math.abs(3.5-r));
  return s+(Math.random()-.5)*8;
}
function chooseBotMove(state){
  const moves=allMoves(state);if(!moves.length)return null;
  moves.sort((a,b)=>scoreMove(state,b)-scoreMove(state,a));let best=-Infinity,choice=moves[0];
  for(const move of moves.slice(0,7)){
    const next=applyMove(state,move).state,reply=allMoves(next);let value=evaluate(next);
    if(reply.length){let worst=Infinity;for(const response of reply){const result=applyMove(next,response).state;worst=Math.min(worst,evaluate(result));}value=worst;}
    value+=scoreMove(state,move)*.08+(Math.random()-.5)*4;
    if(value>best){best=value;choice=move;}
  }
  return choice;
}

function clearPieces(){
  for(const mesh of pieceMeshes.values())scene.remove(mesh);
  pieceMeshes.clear();pieceData.clear();
}
function syncPieces(){
  const active=new Set();
  for(let i=0;i<64;i++){
    const p=boardState.board[i];if(!p)continue;active.add(p.id);let mesh=pieceMeshes.get(p.id);
    if(!mesh){mesh=createPieceMesh(p.type,p.color);pieceMeshes.set(p.id,mesh);scene.add(mesh);mesh.position.copy(world(i,.1));mesh.userData.index=i;mesh.userData.pieceId=p.id;}
    const meshType=mesh.userData.type;
    mesh.userData.index=i;mesh.userData.color=p.color;
    mesh.position.x+=(world(i,.1).x-mesh.position.x)*.22;mesh.position.z+=(world(i,.1).z-mesh.position.z)*.22;
    if(meshType!==p.type){scene.remove(mesh);mesh=createPieceMesh(p.type,p.color);mesh.position.copy(world(i,.1));mesh.userData.index=i;mesh.userData.pieceId=p.id;pieceMeshes.set(p.id,mesh);scene.add(mesh);}
  }
  for(const [id,mesh] of pieceMeshes)if(!active.has(id)){scene.remove(mesh);pieceMeshes.delete(id);}
  updateRoster();
}
function clearMarkers(){for(const m of markerMeshes)scene.remove(m);markerMeshes.length=0;}
function showMarkers(){
  clearMarkers();
  for(const move of legalTargets){
    const capture=!!boardState.board[move.to]||move.ep;
    if(capture){const ring=new THREE.Mesh(new THREE.TorusGeometry(.36,.035,8,36),mats.captureGlow);ring.rotation.x=Math.PI/2;ring.position.copy(world(move.to,.12));ring.userData.capture=true;scene.add(ring);markerMeshes.push(ring);}
    else{const dot=new THREE.Mesh(new THREE.CircleGeometry(.11,24),mats.glow);dot.rotation.x=-Math.PI/2;dot.position.copy(world(move.to,.101));scene.add(dot);markerMeshes.push(dot);}
  }
}
function selectPiece(index){
  const p=boardState.board[index];if(!p||p.color!=='w'||busy||gameOver)return false;
  selectedSquare=index;legalTargets=legalMoves(boardState,index);showMarkers();
  const panel=document.querySelector('#commander-name');panel.textContent=pieceName(p.type);document.querySelector('#commander-coord').textContent=`${algebraic(index).toUpperCase()} · READY`;
  document.querySelector('#move-message').textContent=legalTargets.length?`${pieceName(p.type)} at ${algebraic(index).toUpperCase()} — ${legalTargets.length} legal ${legalTargets.length===1?'move':'moves'}.`:'No legal moves from here.';
  document.querySelectorAll('.roster-unit').forEach(el=>el.classList.toggle('active',Number(el.dataset.index)===index));
  return true;
}
function clearSelection(){selectedSquare=-1;legalTargets=[];clearMarkers();document.querySelectorAll('.roster-unit').forEach(el=>el.classList.remove('active'));}
function updateRoster(){
  const roster=document.querySelector('#ally-roster');roster.innerHTML='';let allies=0;
  for(const ally of allyRoster){
    const idx=boardState.board.findIndex(piece=>piece&&piece.id===ally.id),piece=idx>=0?boardState.board[idx]:null;
    const type=piece?.type||ally.type;
    const el=document.createElement('button');el.className='roster-unit';el.type='button';el.dataset.index=idx;el.textContent=({k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'})[type];
    if(piece&&piece.color==='w'){allies++;el.title=`${pieceName(piece.type)} at ${algebraic(idx).toUpperCase()}`;el.addEventListener('click',()=>selectPiece(idx));}else{el.classList.add('dead');el.title='Lost in battle';}
    roster.appendChild(el);
  }
  // The field roster follows living pieces, but keeps its familiar opening order.
  document.querySelector('#ally-count').textContent=`${allies} UNIT${allies===1?'':'S'}`;
  const whites=history.flatMap(h=>h.captured&&h.captured.color==='w'?[h.captured]:[]),blacks=history.flatMap(h=>h.captured&&h.captured.color==='b'?[h.captured]:[]);
  renderCaptured('#captured-allies','#lost-ally-count',whites,'w');renderCaptured('#captured-enemies','#lost-enemy-count',blacks,'b');
  document.querySelectorAll('.roster-unit').forEach(el=>el.classList.toggle('active',Number(el.dataset.index)===selectedSquare));
}
function renderCaptured(containerId,countId,pieces,color){
  const container=document.querySelector(containerId);container.innerHTML=pieces.length?'':'<span class="empty-capture">—</span>';
  for(const p of pieces){const span=document.createElement('span');span.textContent=({k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'})[p.type];container.appendChild(span);}
  document.querySelector(countId).textContent=String(pieces.length).padStart(2,'0');
}
function updateIntel(message='Your allies are in position. Take the first move and shape the battle.'){
  const check=inCheck(boardState,'w'),enemyCheck=inCheck(boardState,'b'),enemyMoves=allMoves({...boardState,turn:'b'}).length;
  let level=check?3:enemyCheck?2:history.length>8?1:0;
  document.querySelector('#intel-headline').textContent=check?'Your king is under threat.':enemyCheck?'The enemy king is exposed.':history.length>8?'The battle is turning.':'A quiet opening.';
  document.querySelector('#intel-copy').textContent=check?'Your king is in check. Make a move that blocks, captures, or escapes the attack.':enemyCheck?'Your attack has the opposing king in check. Keep the pressure on.':message;
  document.querySelector('#threat-label').textContent=check?'CRITICAL':enemyCheck?'ELEVATED':level?'MODERATE':'LOW';
  document.querySelectorAll('.intel-meter span').forEach((el,i)=>{el.classList.toggle('active',i<Math.max(1,(level+1)*3));el.classList.toggle('hot',check&&i<6);});
}
function showToast(text,duration=1100){const el=document.querySelector('#board-toast');el.textContent=text;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),duration);}
function updateTurnUI(){
  document.querySelector('#turn-label').textContent=gameOver?'BATTLE OVER':boardState.turn==='w'?'YOUR TURN':'ENEMY TURN';
  document.querySelector('#move-number').textContent=String(boardState.fullmove).padStart(2,'0');
  document.querySelector('#game-id').textContent=`MATCH ${String(Math.max(1,Math.floor(history.length/2)+1)).padStart(3,'0')}`;
}

function spawnBurst(position,color='#e7c783',amount=24){
  const geometry=new THREE.BufferGeometry(),positions=new Float32Array(amount*3),velocities=[];
  for(let i=0;i<amount;i++){positions[i*3]=position.x;positions[i*3+1]=position.y+.35;positions[i*3+2]=position.z;velocities.push(new THREE.Vector3((Math.random()-.5)*2.8,Math.random()*3+1,(Math.random()-.5)*2.8));}
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const points=new THREE.Points(geometry,new THREE.PointsMaterial({color,size:.075,transparent:true,opacity:1,depthWrite:false}));scene.add(points);effects.push({object:points,geometry,velocities,age:0,duration:1.15,type:'burst'});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.15,.032,8,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8}));ring.rotation.x=Math.PI/2;ring.position.set(position.x,.12,position.z);scene.add(ring);effects.push({object:ring,age:0,duration:.65,type:'ring'});
}
function animateCapture(piece,position){
  const mesh=pieceMeshes.get(piece.id);spawnBurst(position,piece.color==='w'?'#d8d0ae':'#cf7966',piece.type==='k'?72:28);
  if(mesh){mesh.userData.falling={age:0,duration:piece.type==='k'?1.5:.85};mesh.userData.startY=mesh.position.y;mesh.userData.startRotation=mesh.rotation.z;fallingPieces.push(mesh);}
  if(piece.type==='k'&&piece.color==='b'){
    for(let i=0;i<5;i++){const p=world(sq(3+Math.round(Math.random()),6),.2);setTimeout(()=>spawnBurst(p,'#e1ba7b',20),i*90);}
  }
}
function makeMove(move,source='player'){
  const moving=boardState.board[move.from],captured=move.ep?boardState.board[move.to+(moving.color==='w'?-8:8)]:boardState.board[move.to];
  history.push({state:cloneState(boardState),move:{...move},captured:captured?{...captured}:null});
  const result=applyMove(boardState,move);boardState=result.state;lastMove=move;
  if(captured){animateCapture(captured,world(move.to,.2));document.querySelector('#move-message').textContent=`${pieceName(captured.type)} defeated at ${algebraic(move.to).toUpperCase()}.`;
    showToast(captured.type==='k'?'KING DEFEATED':'UNIT DEFEATED');}
  else document.querySelector('#move-message').textContent=`${source==='bot'?'Ashen Court':'Ivory Order'}: ${pieceName(moving.type)} ${algebraic(move.from).toUpperCase()} → ${algebraic(move.to).toUpperCase()}.`;
  syncPieces();clearSelection();updateTurnUI();
  const check=inCheck(boardState,boardState.turn);updateIntel(check?'A king is under attack. Choose a response.':captured?'A combatant has fallen. The board shifts in your favor.':undefined);
  if(check)showToast('CHECK',1200);
  const replies=allMoves(boardState);
  if(!replies.length){gameOver=true;busy=false;updateTurnUI();showResult(boardState.turn==='w'?'loss':'win',inCheck(boardState,boardState.turn));return;}
  if(boardState.halfmove>=100){gameOver=true;busy=false;showResult('draw',false);return;}
  if(boardState.turn==='b'){busy=true;document.querySelector('#move-message').textContent='The Ashen Court considers its next move…';aiTimer=setTimeout(botTurn,700+Math.random()*350);}else{busy=false;}
}
function botTurn(){if(gameOver)return;const move=chooseBotMove(boardState);if(move)makeMove(move,'bot');else{gameOver=true;showResult('win',true);}}
function showResult(result,checkmated){
  const modal=document.querySelector('#result-modal'),won=result==='win';
  document.querySelector('#result-sigil').textContent=won?'♔':result==='draw'?'♖':'♚';
  document.querySelector('#result-eyebrow').textContent=result==='draw'?'BATTLE DRAWN':'BATTLE COMPLETE';
  document.querySelector('#result-title').textContent=result==='draw'?'A Stalemate.':won?'Checkmate.':'The King Has Fallen.';
  document.querySelector('#result-copy').textContent=result==='draw'?'Neither force could claim the final square. The board waits for a new commander.':won?'The Ashen Court is broken. Your allies hold the Ironwood Table.':'The Ivory Order has been defeated. Regroup, commander — the board will be yours again.';
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');
  if(checkmated)showToast(won?'ASHEN KING CHECKMATED':'IVORY KING CHECKMATED',2600);
}
function attemptSquare(index){
  if(busy||gameOver)return;
  if(selectedSquare>=0){const move=legalTargets.find(m=>m.to===index);if(move){busy=true;makeMove(move);return;}}
  const p=boardState.board[index];if(p&&p.color==='w'){selectPiece(index);return;}
  if(selectedSquare>=0){clearSelection();document.querySelector('#move-message').textContent='Selection cleared. Choose an ally to see its moves.';}
}

function resize(){const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();}
function setView(mode){viewMode=mode;document.querySelector('#view-label').textContent=mode==='commander'?'COMMANDER VIEW':'TACTICAL VIEW';}
function updateCamera(dt){
  let targetPos,targetLook;
  if(viewMode==='commander'&&selectedSquare>=0){const pos=world(selectedSquare,0);targetPos=new THREE.Vector3(pos.x+.15,3.8,pos.z+4.3);targetLook=new THREE.Vector3(pos.x,0,pos.z-.4);}
  else if(viewMode==='commander'){targetPos=new THREE.Vector3(8.9,10.8,11.8);targetLook=new THREE.Vector3(0,0,0);}
  else{targetPos=new THREE.Vector3(0,15.2,.01);targetLook=new THREE.Vector3(0,0,0);}
  const ease=1-Math.exp(-dt*2.7);camera.position.lerp(targetPos,ease);cameraTarget.lerp(targetLook,ease);camera.lookAt(cameraTarget);
}
function animate(){requestAnimationFrame(animate);const dt=Math.min(.05,clock.getDelta());
  for(const mesh of [...pieceMeshes.values(),...fallingPieces]){
    const p=mesh.userData.falling?null:boardState.board[mesh.userData.index];
    if(mesh.userData.falling){const a=mesh.userData.falling; a.age+=dt;const t=Math.min(1,a.age/a.duration);mesh.position.y=a.startY+Math.sin(t*Math.PI)*.65-t*.5;mesh.rotation.z=a.startRotation+t*Math.PI*1.35;mesh.scale.setScalar(Math.max(.001,1-t));if(t>=1){scene.remove(mesh);mesh.userData.falling=null;const index=fallingPieces.indexOf(mesh);if(index>=0)fallingPieces.splice(index,1);}}
    else if(p){const target=world(mesh.userData.index,.1);mesh.position.x+=(target.x-mesh.position.x)*Math.min(1,dt*7);mesh.position.z+=(target.z-mesh.position.z)*Math.min(1,dt*7);mesh.position.y=.1+Math.sin(clock.elapsedTime*2.2+mesh.userData.pieceId)*.012;}
  }
  for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.age+=dt;const t=Math.min(1,e.age/e.duration);
    if(e.type==='burst'){const arr=e.geometry.attributes.position.array;for(let j=0;j<e.velocities.length;j++){const v=e.velocities[j];arr[j*3]+=v.x*dt;arr[j*3+1]+=v.y*dt;arr[j*3+2]+=v.z*dt;v.y-=4.2*dt;}e.geometry.attributes.position.needsUpdate=true;e.object.material.opacity=1-t;}
    else{e.object.scale.setScalar(1+t*5);e.object.material.opacity=.8*(1-t);}
    if(t>=1){scene.remove(e.object);if(e.geometry)e.geometry.dispose();effects.splice(i,1);}
  }
  for(const m of markerMeshes)if(m.userData.capture)m.material.opacity=.55+Math.sin(clock.elapsedTime*5)*.25;
  updateCamera(dt);renderer.render(scene,camera);
}

canvas.addEventListener('pointerdown',event=>{
  const rect=canvas.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects([...tileMeshes,...Array.from(pieceMeshes.values())],true);if(!hits.length)return;
  let obj=hits[0].object;while(obj&&!obj.userData.index&&obj.userData.index!==0)obj=obj.parent;
  if(obj&&Number.isInteger(obj.userData.index))attemptSquare(obj.userData.index);
});
document.querySelector('#view-toggle').addEventListener('click',()=>setView(viewMode==='commander'?'tactical':'commander'));
document.querySelector('#undo-button').addEventListener('click',()=>{
  if(busy||gameOver||!history.length)return;clearTimeout(aiTimer);
  // Undo the user's last move and the opponent's response as a pair when possible.
  const count=history.length>=2&&boardState.turn==='w'?2:1;
  for(let i=0;i<count&&history.length;i++){const entry=history.pop();boardState=entry.state;}
  busy=false;gameOver=false;lastMove=history.length?history[history.length-1].move:null;clearSelection();syncPieces();updateTurnUI();updateIntel('The last exchange has been rewound. Choose a new line of attack.');document.querySelector('#move-message').textContent='Last move undone. The board is yours.';
});
document.querySelector('#restart-button').addEventListener('click',()=>resetGame());
document.querySelector('#play-again').addEventListener('click',()=>resetGame());
function resetGame(){clearTimeout(aiTimer);boardState=initialState();history=[];lastMove=null;busy=false;gameOver=false;clearSelection();clearPieces();syncPieces();updateTurnUI();updateIntel();document.querySelector('#commander-name').textContent='KNIGHT';document.querySelector('#commander-coord').textContent='E1 · READY';document.querySelector('#move-message').textContent='Choose a unit to see its available moves.';document.querySelector('#result-modal').classList.remove('open');document.querySelector('#result-modal').setAttribute('aria-hidden','true');setView('commander');}
const helpModal=document.querySelector('#help-modal');
document.querySelector('#help-button').addEventListener('click',()=>{helpModal.classList.add('open');helpModal.setAttribute('aria-hidden','false');});
function closeHelp(){helpModal.classList.remove('open');helpModal.setAttribute('aria-hidden','true');}
document.querySelector('#close-help').addEventListener('click',closeHelp);document.querySelector('#got-it').addEventListener('click',closeHelp);helpModal.addEventListener('click',e=>{if(e.target===helpModal)closeHelp();});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeHelp();}if(e.key==='v'||e.key==='V')setView(viewMode==='commander'?'tactical':'commander');if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z')document.querySelector('#undo-button').click();});
window.addEventListener('resize',resize);
boardState=initialState();syncPieces();updateTurnUI();updateIntel();resize();animate();
