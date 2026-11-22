import * as T from '/three/three.module.js';
const q=new URL(location.href);if(!q.searchParams.get('room')){q.searchParams.set('room',Array.from(crypto.getRandomValues(new Uint8Array(12)),n=>n.toString(16).padStart(2,'0')).join(''));history.replaceState(null,'',q)}const socket=io({auth:{room:q.searchParams.get('room')}});const scene=new T.Scene();scene.background=new T.Color(0x101b36);scene.fog=new T.FogExp2(0x151d35,.008);const r=new T.WebGLRenderer({antialias:true});r.setPixelRatio(Math.min(1.75,devicePixelRatio));document.body.append(r.domElement);const cam=new T.PerspectiveCamera(67,1,.08,130);function resize(){r.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}addEventListener('resize',resize);resize();scene.add(new T.HemisphereLight(0xabbffe,0x6d4934,1.8));
function box(x,y,z,w,h,d,c,parent=scene){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color:c}));m.position.set(x,y,z);parent.add(m);return m}function cyl(x,y,z,a,b,h,c,parent=scene){const m=new T.Mesh(new T.CylinderGeometry(a,b,h,24),new T.MeshStandardMaterial({color:c}));m.position.set(x,y,z);parent.add(m);return m}const wood=0x65412f,cream=0xc3a379,trim=0x38291f;
for(let i=0;i<64;i++)box(-8.86+i*.28,-.1,-2, .274,.19,18,i%3===0?0x704b37:0x805641);box(0,3.45,2,18,.18,10,trim);box(0,1.68,7,18,3.36,.2,cream);for(const x of [-9,9])box(x,1.68,2,.2,3.36,10,cream);
for(const side of [-1,1]){box(side*5.25,.42,-3,7.5,.84,.2,cream);box(side*5.25,3.1,-3,7.5,.65,.2,cream);for(let i=0;i<11;i++)box(side*(1.5+i*.75),1.8,-3,.055,2,.09,trim);for(const y of [1.05,1.65,2.25])box(side*5.25,y,-3,7.5,.045,.09,trim)}box(0,3.04,-3,3,.73,.2,cream);for(const x of [-1.49,1.49])box(x,1.47,-3,.13,2.95,.22,trim);
box(-5.5,.51,-.2,4.8,1.02,1.15,wood);box(-5.5,1.04,-.2,5,.14,1.28,0x936c48);for(let i=0;i<7;i++)box(-7.6+i*.65,.52,.39,.036,.87,.04,0x9c734e);box(-6.6,1.32,-.25,.89,.47,.54,0x473c35);for(let j=0;j<3;j++){box(-5.8,1.45+j*.46,6.56,4.8,.09,.42,wood);for(let i=0;i<8;i++)cyl(-7.8+i*.53,1.57+j*.46,6.53,.08,.062,.15,[0x9aabb0,0xd5b88a,0x875f45][i%3])}
for(const [x,z] of [[-5,2],[0,2],[5,2]]){const light=new T.PointLight(0xffba73,24,13);light.position.set(x,2.62,z);scene.add(light);cyl(x,2.93,z,.13,.38,.31,0xa27149);cyl(x,3.23,z,.024,.024,.35,trim)}
const tables = [[3.8, 1.4], [5.75, 4.55], [-0.35, 4.85]];for(const [x,z] of tables){cyl(x,.79,z,.87,.87,.12,wood);cyl(x,.37,z,.09,.15,.74,trim);box(x,.47,z+1.13,.62,.1,.65,wood);box(x,.78,z+1.43,.62,.52,.09,wood);for(const dx of [-.24,.24])for(const dz of [.89,1.37])box(x+dx,.24,z+dz,.055,.46,.055,trim);cyl(x+.3,.92,z,.07,.1,.17,0x8e7866)}
for(const x of [-8.5,8.5]){cyl(x,.21,-7,.35,.27,.42,0x9d674d);cyl(x,.65,-7,.3,.22,.63,0x435d46)}for(let i=-9;i<=9;i++)box(i,.48,-10.85,.08,.96,.08,wood);box(0,.98,-10.85,18,.13,.17,wood);// 테라스 좌우 난간: 카페 벽에서 정면 난간까지
for (const railX of [-8.95, 8.95]) {
  for (let i = 0; i < 8; i++) {
    box(railX, .48, -3.35 - i * 1.06, .08, .96, .08, wood);
  }
  box(railX, .98, -7, .17, .13, 7.7, wood);
}

// 바닥 아래에 펼쳐지는 밤바다
const terraceSeaTime = { value: 0 };
const terraceSea = new T.Mesh(
  new T.PlaneGeometry(260, 260),
  new T.ShaderMaterial({
    uniforms: { uTime: terraceSeaTime },
    vertexShader: `
      varying vec3 vWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vWorld;
      void main() {
        vec2 p = vWorld.xz;
        float a = sin(p.y * 2.1 + p.x * .38 - uTime * 1.7);
        float b = sin(p.y * 3.4 - p.x * .72 - uTime * 1.15);
        float c = sin(p.x * 1.6 + p.y * .65 + uTime * .8);
        float swell = .5 + .5 * (a * .58 + b * .27 + c * .15);
        float crest = pow(max(0.0, a * .71 + b * .29), 8.0);
        float broken = smoothstep(.33, .86,
          .5 + .5 * sin(p.x * 1.1 + c * .8 + uTime * .35));
        vec3 color = mix(vec3(.007, .018, .037),
                         vec3(.023, .058, .098), swell);
        color += vec3(.047, .085, .12) * crest * broken;
        float dist = length(cameraPosition - vWorld);
        color = mix(color, vec3(.009, .012, .036),
                    smoothstep(32.0, 120.0, dist));
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `
  })
);
terraceSea.rotation.x = -Math.PI / 2;
terraceSea.position.y = -.32;
terraceSea.visible = false;
scene.add(terraceSea);
const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d'),tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const sign=new T.Mesh(new T.PlaneGeometry(23,5.75),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));sign.position.set(0,9,-36);scene.add(sign);const points=[];for(let i=0;i<430;i++)points.push(Math.sin(i*17.13)*65,3+(i*13.17)%42,-21-(i*19.81)%58);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));scene.add(new T.Points(geo,new T.PointsMaterial({color:0xffe7b8,size:.11})));
let x=0,z=2,yaw=0,pitch=0,sitting=-1,order=-1,ready=0,held=-1,left=0,preview=0,last=0,notice='바에 가까이 가면 주문할 수 있어요.';const names=['모카아이스블렌디드','스윗앤솔티모카','모카라떼','에스프레소','유자차'],colors=[0x38221c,0xc2926e,0xe1ba82,0x734535,0xeeb94f],keys=new Set(),people=new Map();const cup=(p)=>{const g=new T.Group();p.add(g);cyl(0,0,0,.09,.065,.14,0xffe5c0,g);const top=cyl(0,.071,0,.075,.075,.009,colors[0],g);return {g,top}};const mine=cup(cam);scene.add(cam);mine.g.position.set(.29,-.24,-.55);
socket.on('pose',(id,p)=>{if(!people.has(id)){let g=new T.Group();scene.add(g);box(0,.66,0,.41,.56,.25,0x526f6d,g);cyl(0,1.09,0,.17,.16,.28,0xe1ac81,g);box(0,.22,0,.29,.42,.21,0x302b33,g);const mug=cup(g);mug.g.position.set(.27,.66,-.2);g.position.set(p[0],0,p[1]);people.set(id,{g,mug})}const a=people.get(id);a.p=p;a.mug.g.visible=p[4]>=0;if(p[4]>=0)a.mug.top.material.color.setHex(colors[p[4]])});function remove(id){const a=people.get(id);if(a){scene.remove(a.g);people.delete(id)}}socket.on('bye',remove);socket.on('disconnect',()=>[...people.keys()].forEach(remove));
// 서버가 알려 준 실제 의자 목록과 점유 상태입니다.
let cafeChairs = [];
let cafeOccupied = new Map();
let cafeSeatPending = false;

// 처음 접속하거나 다시 연결됐을 때 의자 정보를 받습니다.
socket.on('seats:init', data => {
  cafeChairs = data.chairs;

  cafeOccupied = new Map(
    data.occupied.map(item => [
      item.chairId,
      item.playerId
    ])
  );

  cafeSeatPending = false;
  sitting = -1;
});

// 다른 사람이 앉거나 일어나면 점유 상태를 갱신합니다.
socket.on('seats:state', occupied => {
  cafeOccupied = new Map(
    occupied.map(item => [
      item.chairId,
      item.playerId
    ])
  );
});

// 연결이 끊기면 이전 착석 상태를 해제합니다.
socket.on('disconnect', () => {
  cafeChairs = [];
  cafeOccupied.clear();
  cafeSeatPending = false;
  sitting = -1;
});

// 가까운 실제 의자 하나를 찾습니다.
// 점유된 의자를 건너뛰어 먼 의자에 앉히지는 않습니다.
function nearestCafeChair() {
  let nearest = null;
  let distance = Infinity;

  for (const chair of cafeChairs) {
    const current = Math.hypot(
      x - chair.x,
      z - chair.z
    );

    if (current < distance) {
      nearest = chair;
      distance = current;
    }
  }

  return { chair: nearest, distance };
}

// 두 착석 버튼이 함께 사용할 함수입니다.
function requestCafeSeat() {
  if (!socket.connected) {
    notice = '서버에 연결된 뒤 다시 시도해 주세요.';
    return;
  }

  if (sitting >= 0 || cafeSeatPending) return;

  if (!cafeChairs.length) {
    notice = '의자 정보를 불러오는 중이에요.';
    return;
  }

  const { chair, distance } = nearestCafeChair();

  if (!chair || distance > .83) {
    notice = '보이는 의자에 조금 더 가까이 가 주세요.';
    return;
  }

  if (cafeOccupied.has(chair.id)) {
    notice = '이미 다른 사람이 앉아 있는 의자예요.';
    return;
  }

  cafeSeatPending = true;
  notice = '빈자리인지 확인하고 있어요.';

  socket.timeout(5000).emit(
    'seat:request',
    chair.id,
    (error, result) => {
      cafeSeatPending = false;

      if (error) {
        notice = '착석 응답을 받지 못했어요. 다시 접속해 주세요.';
        return;
      }

      if (!result?.ok) {
        notice = result?.reason || '지금은 앉을 수 없어요.';
        return;
      }

      const approved = result.chair;

      x = approved.x;
      z = approved.z;
      yaw = approved.yaw;
      pitch = 0;
      sitting = approved.id;

      notice = '의자에 앉았어요.';
    }
  );
}

// 일어서기 버튼에서 사용할 함수입니다.
function leaveCafeSeat() {
  if (cafeSeatPending || sitting < 0) return;

  cafeSeatPending = true;

  socket.timeout(5000).emit(
    'seat:leave',
    (error, result) => {
      cafeSeatPending = false;

      if (error || !result?.ok) {
        notice = '일어서기 응답을 받지 못했어요. 다시 접속해 주세요.';
        return;
      }

      sitting = -1;
      notice = '자리에서 일어났어요.';
    }
  );
}const ui=document.querySelector('#act'),msg=document.querySelector('#msg');const nearBar=()=>Math.hypot(x+5.5,z-1)<2.25;const nearTable=()=>tables.findIndex(([a,b])=>Math.hypot(x-a,z-b-1.13)<1.05);let prev='';function update(now){const t=nearTable(),bar=nearBar();let a=[];if(sitting>=0){a.push(['stand','일어서기']);if(held>=0)a.push(['sip','한 모금 마시기'])}else if(t>=0)a.push(['seat','테이블에 앉기']);if(bar&&held<0){if(order<0)names.forEach((n,i)=>a.push(['o'+i,n]));else a.push(['pick',now>=ready?'음료 받기':'준비 중',now<ready])}if(z<-3.5)a.push(['preview','10초 미리보기']);const html=a.map(([id,n,d])=>`<button data-a="${id}" ${d?'disabled':''}>${n}</button>`).join('');if(html!==prev){ui.innerHTML=html;prev=html}msg.textContent=notice+(held>=0?' · '+names[held]+' '+left+'모금':'')+' · '+(socket.connected?'이 방 '+(people.size+1)+'명':'연결 중')}
ui.onclick=e=>{const a=e.target.dataset.a;if(!a)return;if(a[0]==='o'&&nearBar()&&order<0&&held<0){order=+a[1];ready=Date.now()+2200;notice=names[order]+' 주문 완료'}if(a==='pick'&&order>=0&&Date.now()>=ready&&nearBar()){held=order;order=-1;left=3;notice='음료를 받았어요. 의자에 가까이 가 보세요.'}if (a === 'seat') {
  requestCafeSeat();
}if (a === 'stand') {
  leaveCafeSeat();
}if(a==='sip'&&sitting>=0&&held>=0){left--;notice=left?'한 모금 마셨어요.':names[held]+'를 다 마셨어요.';if(!left)held=-1}if(a==='preview')preview=Date.now()+10000};document.querySelector('#share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);notice='친구 링크를 복사했어요.'}catch{prompt('친구에게 보낼 주소',location.href)}};
addEventListener('keydown',e=>keys.add(e.key.toLowerCase()));addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>keys.clear());const nav=document.querySelector('#nav');nav.innerHTML=[['q','↶'],['w','↑'],['e','↷'],['a','←'],['s','↓'],['d','→']].map(([k,v])=>`<button data-k="${k}">${v}</button>`).join('');for(const b of nav.children){b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);keys.add(b.dataset.k)};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(b.dataset.k)}const cv=r.domElement;cv.style.touchAction='none';let drag=null;cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);drag=[e.clientX,e.clientY]};cv.onpointerup=cv.onpointercancel=()=>drag=null;cv.onpointermove=e=>{if(!drag)return;yaw-=(e.clientX-drag[0])*.005;pitch=T.MathUtils.clamp(pitch-(e.clientY-drag[1])*.004,-1.15,1.15);drag=[e.clientX,e.clientY]};
function valid(a,b){return Math.abs(a)<8.7&&b>-10.65&&b<6.75&&!(Math.abs(b+3)<.25&&Math.abs(a)>1.22)&&!(Math.abs(a+5.5)<2.65&&Math.abs(b+.2)<.75)&&!tables.some(([u,v])=>Math.hypot(a-u,b-v)<.98)}let clock=new T.Clock(),old='';r.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05),now=Date.now();yaw+=((keys.has('q')?1:0)-(keys.has('e')?1:0))*dt*1.8;if(sitting<0){const f=+keys.has('w')-+keys.has('s'),s=+keys.has('d')-+keys.has('a'),k=dt*3/Math.max(1,Math.hypot(f,s));const xx=x+(-Math.sin(yaw)*f+Math.cos(yaw)*s)*k,zz=z+(-Math.cos(yaw)*f-Math.sin(yaw)*s)*k;if(valid(xx,z))x=xx;if(valid(x,zz))z=zz}cam.position.set(x,sitting<0?1.64:1.16,z);cam.rotation.set(pitch,yaw,0,'YXZ');mine.g.visible=held>=0;if(held>=0)mine.top.material.color.setHex(colors[held]);for (const {g, p} of people.values()) {
  const seated = !!p[3];

  // 아바타를 바닥 아래로 내리지 않고 의자 위치에 유지합니다.
  g.position.lerp(
    new T.Vector3(p[0], 0, p[1]),
    Math.min(dt * 12, 1)
  );

  // 둥근 아바타의 얼굴은 +Z 방향입니다.
  // 앉았을 때는 테이블을 바라보도록 방향을 돌립니다.
  g.rotation.y = p[2] + (seated ? Math.PI : 0);

  // 둥근 아바타 생성이 끝난 뒤에만 착석 자세를 적용합니다.
  if (!g.userData.tcikRoundAvatar) continue;

  // 각 신체 부위의 원래 위치를 한 번만 저장합니다.
  if (!g.userData.tcikSeatParts) {
    const parts = [];

    for (const mesh of [...g.children]) {
      if (
        !mesh.isMesh ||
        mesh.geometry?.type !== 'SphereGeometry'
      ) continue;

      const rest = mesh.position.clone();
      const leg = Math.abs(rest.y - .24) < .001;
      const foot = Math.abs(rest.y - .075) < .001;

      parts.push({mesh, rest, leg, foot});

      // 앉았을 때 무릎 아래로 내려오는 종아리를 추가합니다.
      if (leg) {
        const calf = new T.Mesh(
          new T.SphereGeometry(1, 16, 12),
          mesh.material
        );

        calf.scale.set(.085, .16, .085);
        calf.position.set(rest.x, .29, .29);
        calf.visible = false;
        g.add(calf);

        parts[parts.length - 1].calf = calf;
      }
    }

    g.userData.tcikSeatParts = parts;
  }

  for (const part of g.userData.tcikSeatParts) {
    const {mesh, rest, leg, foot, calf} = part;

    // 매번 원래 자세로 되돌린 뒤 착석 여부를 반영합니다.
    mesh.position.copy(rest);
    mesh.rotation.x = 0;

    if (seated) {
      if (leg) {
        // 의자 좌판 높이에서 허벅지를 앞으로 뻗습니다.
        mesh.position.set(rest.x, .52, .15);
        mesh.rotation.x = Math.PI / 2;
      } else if (foot) {
        // 발을 무릎 아래쪽 바닥 가까이에 배치합니다.
        mesh.position.set(rest.x, .105, .34);
      } else {
        // 몸통·머리·팔을 좌판에 맞는 높이로 올립니다.
                mesh.position.y += .16;
      }
    }

    // 앉으면 종아리를 표시하고, 일어서면 숨깁니다.
    if (calf) calf.visible = seated;
  }
}if(now-last>=70){last=now;socket.volatile.emit('pose',[x,z,yaw,+ (sitting>=0),held]);update(now)}const rem=Math.max(0,Math.ceil(((preview||Date.parse('2027-01-01T00:00:00+09:00'))-now)/1000));const pad=n=>String(n).padStart(2,'0');const text=!rem?'2027':rem<=10?String(rem):`${Math.floor(rem/86400)}일 ${pad(Math.floor(rem/3600)%24)}:${pad(Math.floor(rem/60)%60)}:${pad(rem%60)}`;if(text!==old){old=text;ctx.clearRect(0,0,1024,256);ctx.fillStyle='white';ctx.font=`bold ${rem<=10?185:100}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,128);const pixels=ctx.getImageData(0,0,1024,256).data;ctx.clearRect(0,0,1024,256);ctx.fillStyle='#ffedb7';for(let y=0;y<256;y+=6)for(let x=0;x<1024;x+=6)if(pixels[(y*1024+x)*4+3]>128){ctx.beginPath();ctx.arc(x,y,1.2+((x*19+y*23)%7)/7,0,Math.PI*2);ctx.fill()}tex.needsUpdate=true}terraceSeaTime.value = now * .001 % 3600;
r.render(scene,cam);});
// TCIK decor patch
{
const counter=-5.5;
const staff=new T.Group();staff.position.set(counter,0,-1.02);scene.add(staff);
const orb=(x,y,z,sz,col,parent)=>{const m=new T.Mesh(new T.SphereGeometry(sz,18,12),new T.MeshStandardMaterial({color:col}));m.position.set(x,y,z);parent.add(m);return m};
const head=new T.Group();staff.add(head);head.position.y=1.67;orb(0,0,0,.138,0xe4ad87,head);orb(0,.066,-.035,.14,0x2d201e,head);orb(.09,.116,-.115,.075,0x2d201e,head);for(const xx of [-.048,.048])orb(xx,-.015,.124,.012,0x382625,head);
box(0,1.29,0,.36,.52,.22,0xe9dcc7,staff);box(0,1.24,.12,.25,.37,.035,0x596754,staff);box(0,.66,0,.27,.67,.21,0x423532,staff);
const hand=new T.Group();staff.add(hand);hand.position.set(.22,1.44,.025);box(0,-.14,0,.105,.29,.11,0xe9dcc7,hand);orb(0,-.31,0,.062,0xe4ad87,hand);box(-.22,1.29,0,.10,.31,.11,0xe9dcc7,staff);
const poster=(x,y,z,w,h,draw,angle=0)=>{const c=document.createElement('canvas');c.width=768;c.height=960;const a=c.getContext('2d');draw(a);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));m.position.set(x,y,z);m.rotation.y=angle;scene.add(m);return m};
poster(-8.88,1.80,0.80,1.14,1.43,a=>{a.fillStyle='#745439';a.fillRect(0,0,768,960);a.fillStyle='#272c27';a.fillRect(26,26,716,908);a.strokeStyle='#b59b72';a.lineWidth=3;a.strokeRect(51,51,666,858);a.textAlign='center';a.fillStyle='#f4e8ca';a.font='bold 73px serif';a.fillText('오늘의 메뉴',384,188);a.font='30px serif';a.fillText('T C I K   ·   C A F É',384,249);a.font='48px sans-serif';['모카아이스블렌디드','스윗앤솔티모카','모카라떼','에스프레소','유자차'].forEach((s,i)=>a.fillText(s,384,368+i*99));a.font='27px serif';a.fillText('카운터 앞에서 주문해 주세요',384,875) },Math.PI/2);
poster(7.1,1.98,6.86,1.08,1.35,a=>{a.fillStyle='#755338';a.fillRect(0,0,768,960);a.fillStyle='#d9bf91';a.fillRect(27,27,714,906);a.fillStyle='#344959';a.beginPath();a.arc(402,382,173,0,Math.PI*2);a.fill();a.fillStyle='#e9dca9';a.beginPath();a.arc(448,329,52,0,Math.PI*2);a.fill();a.strokeStyle='#8ca2a1';a.lineWidth=8;for(let i=0;i<6;i++){a.beginPath();a.moveTo(260+i*6,412+i*18);a.quadraticCurveTo(405,387+i*18,535-i*6,412+i*18);a.stroke()}a.fillStyle='#4d443c';a.textAlign='center';a.font='54px serif';a.fillText('별이 내리는 카페',384,750)},Math.PI);
for(const x of [-2.2,2.2]){cyl(x,.18,-4,.19,.15,.31,0x9a6c50);cyl(x,.45,-4,.025,.04,.45,0x566043);for(let i=0;i<6;i++)orb(x+Math.sin(i*2.4)*.13,.48+i*.055,-4+Math.cos(i*2.4)*.1,.09,0x50664e,scene)}
const water=new T.Mesh(new T.PlaneGeometry(260,350,144,200),new T.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:`uniform float time; varying vec2 wp; varying float swell; void main(){vec3 p=position;wp=p.xy; swell=sin(p.y*.96+time*1.65+p.x*.14)*.6+sin(p.x*.5-p.y*.74+time*1.1)*.4;p.z+=swell*.17;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`uniform float time;varying vec2 wp;varying float swell;void main(){float x=wp.x,y=wp.y;float a=sin(y*2.7+time*1.9+sin(x*.49)*.8);float b=sin(y*5.8+time*2.1+x*.46);float ridge=smoothstep(.55,.99,a)*(.55+.45*b);float lane=exp(-abs(x+sin(y*.55+time)*1.35)*.25);float glow=pow(max(0.,sin(x*3.3+y*2.6-time*1.8)*sin(y*4.1+time*1.17)),6.);float foam=smoothstep(.91,.995,a)*smoothstep(.52,.97,sin(x*.82+y*.62))*exp(-abs(y+29.)*.18);vec3 col=mix(vec3(.047,.083,.153),vec3(.11,.225,.33),.33+swell*.21+ridge*.32);col+=vec3(.67,.79,.94)*(glow*lane*.66+foam*.42);gl_FragColor=vec4(col,1.);}` }));water.rotation.x=-Math.PI/2;water.position.set(0,-.40,-43.45);scene.add(water);
const begin=performance.now();function decorate(now){const t=(now-begin)/1000;water.material.uniforms.time.value=t;head.rotation.y=Math.sin(t*.85)*.15;hand.rotation.x=-.24+Math.sin(t*2)*.19;requestAnimationFrame(decorate)}requestAnimationFrame(decorate);
}

// TCIK New Year patch
{
const target=Date.parse('2027-01-01T00:00:00+09:00');
const card=document.createElement('canvas');card.width=1400;card.height=400;
const ink=card.getContext('2d');ink.textAlign='center';ink.textBaseline='middle';ink.font='italic 145px Georgia, "Times New Roman", serif';ink.shadowColor='#ffb75e';ink.shadowBlur=32;const gold=ink.createLinearGradient(0,115,0,275);gold.addColorStop(0,'#fff9de');gold.addColorStop(.55,'#ffe4a1');gold.addColorStop(1,'#ecad61');ink.fillStyle=gold;ink.fillText('Happy New Year',700,196);ink.shadowBlur=0;ink.fillStyle='#fff5cb';for(const [x,y,s] of [[130,123,18],[1260,248,16],[233,292,10],[1160,107,12]]){ink.beginPath();ink.moveTo(x,y-s);ink.quadraticCurveTo(x+3,y-3,x+s,y);ink.quadraticCurveTo(x+3,y+3,x,y+s);ink.quadraticCurveTo(x-3,y+3,x-s,y);ink.quadraticCurveTo(x-3,y-3,x,y-s);ink.fill()}
const map=new T.CanvasTexture(card);map.colorSpace=T.SRGBColorSpace;const greeting=new T.Mesh(new T.PlaneGeometry(22,6.29),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,fog:false}));greeting.position.set(0,8.3,-35);greeting.visible=false;scene.add(greeting);
const palettes=[0xffcc80,0xff93b8,0xa3dafe,0xe0baff,0xfff0c8];const bursts=[];let seen=0,end=0,was=false,next=0,serial=0;
function burst(now){const n=76,x=[-12,11,-6,7,0][serial%5],y=12+Math.random()*5,z=-36-Math.random()*7;const pos=new Float32Array(n*3),vel=[];for(let i=0;i<n;i++){const a=i*2.39996,h=2*(i+.5)/n-1,j=Math.sqrt(1-h*h),s=1.6+Math.random()*3.5;vel.push([Math.cos(a)*j*s,h*s,Math.sin(a)*j*s]);pos.set([x,y,z],i*3)}const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));const m=new T.PointsMaterial({color:palettes[serial++%palettes.length],size:.19,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false});const pts=new T.Points(g,m);pts.frustumCulled=false;scene.add(pts);bursts.push({pts,g,m,pos,vel,now,x,y,z});}
function clear(){for(const b of bursts.splice(0)){scene.remove(b.pts);b.g.dispose();b.m.dispose()}}
function frame(){const now=Date.now();if(preview&&preview!==seen){seen=preview;end=preview;was=false;serial=0;clear()}const show=now>=(end||target);greeting.visible=show;sign.visible=!show;if(show&&!was){next=now;was=true}if(show&&serial<9&&now>=next){burst(now);next=now+480+Math.random()*240}for(let i=bursts.length-1;i>=0;i--){const b=bursts[i],t=(now-b.now)/1000;if(t>2.65){scene.remove(b.pts);b.g.dispose();b.m.dispose();bursts.splice(i,1);continue}const spread=(1-Math.exp(-t*.67))/.67;for(let j=0;j<b.vel.length;j++){const [a,c,d]=b.vel[j];b.pos[j*3]=b.x+a*spread;b.pos[j*3+1]=b.y+c*spread-1.08*t*t;b.pos[j*3+2]=b.z+d*spread}b.g.attributes.position.needsUpdate=true;b.m.opacity=Math.pow(1-t/2.65,1.15)}requestAnimationFrame(frame)}requestAnimationFrame(frame);
}

// TCIK Galaxy upgrade — local world.js
{
const actual=Date.parse('2027-01-01T00:00:00+09:00'), duration=3600000;
const round=(g,x,y,z,a,b,c,color)=>{const m=new T.Mesh(new T.SphereGeometry(1,16,12),new T.MeshStandardMaterial({color}));m.position.set(x,y,z);m.scale.set(a,b,c);g.add(m)};
function doll(g, staff = false) {
  // 기존 기본 외형을 숨깁니다.
  for (const mesh of g.children) {
    if (mesh.isMesh) mesh.visible = false;
  }

  const skin = 0xe8ae89;
  const hair = 0x3b2826;
  const shirt = staff ? 0xffffff : 0x43834e;
  const pants = staff ? 0x171717 : 0x805437;
  const shoes = 0x342a29;

  // 얼굴과 머리 윗부분입니다.
  round(g, 0, .94, 0, .22, .21, .20, skin);
  round(g, 0, 1.045, -.023, .222, .136, .20, hair);

  if (staff) {
    // 직원의 기존 묶음머리는 유지합니다.
    round(g, .125, 1.105, -.10, .082, .077, .078, hair);
  } else {
    // 단발머리 뒷부분입니다.
    round(g, 0, .94, -.125, .225, .205, .115, hair);

    // 얼굴 양옆에서 턱 부근까지 내려오는 머리입니다.
    for (const side of [-1, 1]) {
      round(
        g,
        side * .192, .93, -.005,
        .062, .175, .145,
        hair
      );
    }

    // 이마 위쪽의 둥근 앞머리입니다.
    round(g, -.07, 1.064, .12, .13, .064, .072, hair);
    round(g, .09, 1.07, .115, .105, .058, .07, hair);
  }

  // 몸통입니다. 친구는 초록색 티셔츠를 입습니다.
  round(g, 0, .61, 0, .23, .27, .165, shirt);

  if (staff) {
    // 직원의 베이지색 앞치마입니다.
    round(g, 0, .56, .13, .155, .183, .047, 0xd8c29e);
  }

  for (const side of [-1, 1]) {
    if (staff) {
      // 직원의 기존 긴소매입니다.
      round(
        g,
        side * .221, .60, .015,
        .073, .174, .085,
        shirt
      );
    } else {
      // 친구의 초록색 긴팔 소매입니다.
      round(
        g,
        side * .221, .60, .015,
        .073, .174, .085,
        shirt
      );
    }

    // 손입니다.
    round(
      g,
      side * .225, .465, .041,
      .061, .064, .06,
      skin
    );

    // 갈색 바지입니다.
    // 기존 착석 코드가 다리로 인식하는 높이를 유지합니다.
    round(
      g,
      side * .105, .24, 0,
      .094, .19, .09,
      pants
    );

    // 신발입니다.
    round(
      g,
      side * .105, .075, .052,
      .096, .07, .13,
      shoes
    );

    // 눈입니다.
    round(
      g,
      side * .077, .933, .185,
      .014, .02, .012,
      0x382826
    );

    // 볼입니다.
    round(
      g,
      side * .127, .887, .157,
      .033, .019, .015,
      0xd98f7c
    );
  }
}
// 기존 직원이 배치된 그룹을 찾습니다.
const worker = scene.children.find(o =>
  o.isGroup &&
  Math.abs(o.position.x + 5.5) < .01 &&
  Math.abs(o.position.z + 1.02) < .01
);

let staff;

if (worker) {
  // 기존 직원의 이전 외형을 숨깁니다.
  for (const object of worker.children) {
    object.visible = false;
  }

  // 첫 번째 직원: 현재의 묶음머리를 유지합니다.
  // 기존 애니메이션이 사용하는 staff 변수도 유지합니다.
  staff = new T.Group();
  staff.position.set(0, -.012, -.25);
  staff.scale.setScalar(1.4);
  worker.add(staff);

  doll(staff, true);

  // 두 번째 직원: 첫 번째 직원 옆의 카운터 안쪽에 배치합니다.
  const secondStaff = new T.Group();
  secondStaff.position.set(-4.25, -.012, -1.27);
  secondStaff.scale.setScalar(1.4);
  scene.add(secondStaff);

  // 두 직원에게 같은 직원용 의상을 적용합니다.
  doll(secondStaff, true);

  // 두 번째 직원의 묶음머리 부분만 숨깁니다.
  for (const mesh of secondStaff.children) {
    if (
      mesh.isMesh &&
      Math.abs(mesh.position.x - .125) < .001 &&
      Math.abs(mesh.position.y - 1.105) < .001 &&
      Math.abs(mesh.position.z + .10) < .001
    ) {
      mesh.visible = false;
    }
  }

  const longHairColor = 0x3b2826;

  // 등 쪽으로 내려오는 긴 머리입니다.
  round(
    secondStaff,
    0, .85, -.14,
    .225, .32, .11,
    longHairColor
  );

  // 얼굴 양옆에서 어깨까지 내려오는 머리입니다.
  for (const side of [-1, 1]) {
    round(
      secondStaff,
      side * .19, .89, -.015,
      .06, .245, .12,
      longHairColor
    );
  }
}
const large=tables.slice(),small=[[-6.65, 4.25], [-3.35, 4.45], [7.10, -1.42], [3.55, -1.65]],spots=[];
function chair(u,v,a,existing=false){const cx=u+Math.sin(a)*1.12,cz=v+Math.cos(a)*1.12;spots.push([cx,cz,a]);if(existing)return;const g=new T.Group();g.position.set(cx,0,cz);g.rotation.y=a;scene.add(g);box(0,.45,0,.49,.095,.49,0x875c43,g);box(0,.68,.215,.47,.35,.085,0x765039,g);for(const dx of [-.18,.18])for(const dz of [-.18,.18])box(dx,.22,dz,.052,.44,.052,0x52372a,g)}
for(const [u,v] of large)for(let i=0;i<5;i++)chair(u,v,i*Math.PI*2/5,i===0);for(const [u,v] of small){tables.push([u,v]);cyl(u,.78,v,.63,.63,.105,0x75503a);cyl(u,.38,v,.09,.15,.76,0x382921);chair(u,v,Math.PI/2);chair(u,v,-Math.PI/2)}
function button(label,bottom){const b=document.createElement('button');b.textContent=label;Object.assign(b.style,{position:'fixed',right:'12px',bottom,zIndex:6});document.body.append(b);return b}const sit=button('가까운 의자에 앉기','80px'),sound=button('폭죽 소리 켜기','135px');sit.style.display='none';sound.setAttribute('aria-pressed','false');const dist=s=>Math.hypot(x-s[0],z-s[1]),nearest=()=>spots.reduce((a,b)=>dist(a)<=dist(b)?a:b);sit.onclick = () => {
  requestCafeSeat();
};
const c=document.createElement('canvas');c.width=1400;c.height=340;const ctx=c.getContext('2d');ctx.font='italic bold 152px Georgia, serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Happy New Year',700,165);const pixels=ctx.getImageData(0,0,1400,340).data,stars=[],colors=[],band=[];for(let v=0;v<340;v+=6)for(let u=0;u<1400;u+=6)if(pixels[(v*1400+u)*4+3]>=120){stars.push((u-700)/57,(170-v)/57,0);const k=new T.Color().setHSL(.08+u/1400*.52,.74,.73+Math.random()*.22);colors.push(k.r,k.g,k.b)}for(let i=0;i<420;i++){const a=(Math.random()-.5)*32;band.push(a,a*.16+(Math.random()+Math.random()-1)*6,-1-Math.random()*4)}
function points(pos,opts,rgb){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));if(rgb)g.setAttribute('color',new T.Float32BufferAttribute(rgb,3));const m=new T.PointsMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,vertexColors:!!rgb,...opts});const o=new T.Points(g,m);scene.add(o);return o}const words=points(stars,{size:.13},colors),milky=points(band,{color:0x9ca8ff,size:.09,opacity:.48});for(const o of [words,milky]){o.position.set(0,8.3,-34);o.visible=false}const old=scene.children.find(o=>o.isMesh&&Math.abs(o.position.y-8.3)<.01&&Math.abs(o.position.z+35)<.01);if(old)old.material.visible=false;
let ac,bus,noise,on=false;sound.onclick=async()=>{try{if(!ac){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){sound.textContent='폭죽 소리 미지원';return}ac=new Audio();bus=ac.createGain();bus.gain.value=0;const limiter=ac.createDynamicsCompressor();bus.connect(limiter);limiter.connect(ac.destination);noise=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const a=noise.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1}if(on)on=false;else{await ac.resume();on=ac.state==='running'}bus.gain.value=on?.35:0;sound.textContent=on?'폭죽 소리 끄기':'폭죽 소리 켜기';sound.setAttribute('aria-pressed',String(on))}catch{sound.textContent='폭죽 소리 다시 켜기'}};
function play(ox){if(!on||ac.state!=='running'||document.hidden)return;const t=ac.currentTime,mix=ac.createGain(),pan=ac.createStereoPanner?.();if(pan){pan.pan.value=Math.max(-.8,Math.min(.8,ox/17));mix.connect(pan);pan.connect(bus)}else mix.connect(bus);const osc=ac.createOscillator(),g=ac.createGain();osc.frequency.setValueAtTime(102+Math.random()*18,t);osc.frequency.exponentialRampToValueAtTime(37,t+.25);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.42,t+.018);g.gain.exponentialRampToValueAtTime(.001,t+.48);osc.connect(g);g.connect(mix);osc.start(t);osc.stop(t+.52);osc.onended=()=>{osc.disconnect();g.disconnect();mix.disconnect();pan?.disconnect()};function crack(at,len,hz,vol){const src=ac.createBufferSource(),filter=ac.createBiquadFilter(),env=ac.createGain();src.buffer=noise;filter.type='bandpass';filter.frequency.value=hz;filter.Q.value=.65;env.gain.setValueAtTime(vol,at);env.gain.exponentialRampToValueAtTime(.001,at+len);src.connect(filter);filter.connect(env);env.connect(mix);src.start(at,Math.random()*.4,len);src.onended=()=>{src.disconnect();filter.disconnect();env.disconnect()}}crack(t,.32,380,.32);for(let i=0;i<4;i++)crack(t+.11+i*.105,.075,1900+Math.random()*1700,.09)}
const shells=[];let last=0,end=actual,next=actual,index=0;
function launch(now){const k=index++%6,ox=[-13,13,-8,9,-3,4][k]*(.85+Math.random()*.28),oy=10+Math.random()*7,oz=-37-Math.random()*9;const pos=[],rgb=[],vel=[];for(let i=0;i<156;i++){const a=i*2.39996,h=2*(i+.5)/156-1,r=Math.sqrt(1-h*h),inner=i%3===0,s=(inner?2.4:5.1)*(.83+Math.random()*.35);vel.push([Math.cos(a)*r*s,h*s,Math.sin(a)*r*s]);pos.push(ox,oy,oz);const cl=new T.Color().setHSL(([.045,.81,.56,.92,.12,.43][k]+(inner?.11:0))%1,.92,.58+Math.random()*.34);rgb.push(cl.r,cl.g,cl.b)}const o=points(pos,{size:.18},rgb);o.frustumCulled=false;shells.push({o,ox,oy,oz,vel,now});play(ox)}
function remove(s){scene.remove(s.o);s.o.geometry.dispose();s.o.material.dispose()}
function galaxyFrame(){const now=Date.now();sit.style.display=sitting<0&&z>-3&&dist(nearest())<=.83?'block':'none';for(const {g} of people.values())if(!g.userData.tcikRoundAvatar){doll(g);g.userData.tcikRoundAvatar=true}if(staff)staff.rotation.y=.12*Math.sin(now*.0014);if(preview&&preview!==last){last=preview;end=next=preview;index=0;for(const s of shells.splice(0))remove(s)}const show=now>=end;words.visible=milky.visible=show;sign.visible=!show;if(show){words.material.opacity=.94+.05*Math.sin(now*.003);words.material.size=.13+.008*Math.sin(now*.004);if(now<end+duration&&now>=next){launch(now);if(index%4===1)launch(now);next=now+300+Math.random()*240}}for(let i=shells.length-1;i>=0;i--){const s=shells[i],age=(now-s.now)/1000;if(age>=3){remove(s);shells.splice(i,1);continue}const e=(1-Math.exp(-age*.64))/.64,p=s.o.geometry.attributes.position;for(let j=0;j<s.vel.length;j++){const [a,b,c]=s.vel[j];p.setXYZ(j,s.ox+a*e,s.oy+b*e-1.05*age*age,s.oz+c*e)}p.needsUpdate=true;s.o.material.opacity=(1-age/3)**.85*(.8+.2*Math.sin(age*23+i))}requestAnimationFrame(galaxyFrame)}requestAnimationFrame(galaxyFrame);
// Paste inside the Galaxy block, immediately before its final lone closing brace.
{
  sound.remove();
  const load=(name,loop=false)=>{const a=new Audio('/audio/'+name+'.mp3');a.loop=loop;a.preload='auto';a.volume=0;return a};
  const inside=load('cafe-inside',true),outside=load('cafe-outside',true),countdown=load('new-year-countdown');
  const shots=Array.from({length:10},()=>load('new-year-firework'));
  let armed=false, countdownFor=0, pending=0;
  const tryPlay=a=>{try{return Promise.resolve(a.play()).then(()=>true,()=>false)}catch{return Promise.resolve(false)}};
  async function unlock(){
    const results=await Promise.all([inside,outside].map(a=>a.paused?tryPlay(a):Promise.resolve(true)));
    armed=results.some(Boolean);
    if(armed)sync();
  }
  for(const type of ['click','pointerup','keydown'])window.addEventListener(type,unlock,{passive:true});
  unlock();
  function sync(){
    const now=Date.now(),deadline=end,remaining=deadline-now;
    if(countdownFor&&countdownFor!==deadline){countdown.pause();countdownFor=0;countdown.currentTime=0}
    if(armed&&remaining>0&&remaining<=10000&&countdownFor!==deadline&&pending!==deadline){
      pending=deadline;
      const offset=(10000-remaining)/1000;
      if(!Number.isFinite(countdown.duration)||offset<countdown.duration){
        try{countdown.currentTime=offset}catch{}
        countdown.volume=.7;
        tryPlay(countdown).then(ok=>{if(ok)countdownFor=deadline;if(pending===deadline)pending=0});
      }
    }
    const busy=(remaining>0&&remaining<=10000)||(!countdown.paused&&!countdown.ended);
    for(const [a,isOutside] of [[inside,false],[outside,true]]){
      const target=armed&&(z<-3)===isOutside?(busy?.07:.36):0;
      a.volume+= (target-a.volume)*.15;
    }
  }
  const fireworkStartVolume = 0.34;
  const fireworkMinVolume = 0.08;
  const fireworkFadeMs = 10000;

  let fadeStartedAt = null;
  let fadeForEnd = null;

  function currentFireworkVolume() {
    if (fadeStartedAt === null) return fireworkStartVolume;

    const progress = Math.min(
      1, (performance.now() - fadeStartedAt) / fireworkFadeMs
    );
    return fireworkStartVolume
      + (fireworkMinVolume - fireworkStartVolume) * progress;
  }

  // 재생 중인 폭죽 소리도 끊기지 않고 함께 작아져요.
  setInterval(() => {
    if (fadeStartedAt === null) return;
    const volume = currentFireworkVolume();
    for (const shot of shots) {
      if (!shot.paused && !shot.ended) shot.volume = volume;
    }
  }, 50);

  play = function () {
    // 새 카운트다운이나 미리보기마다 34%에서 다시 시작해요.
    if (fadeForEnd !== end) {
      fadeForEnd = end;
      fadeStartedAt = performance.now();
    }

    if (!armed || document.hidden) return;

    const shot = shots.find(a => a.paused || a.ended);
    if (!shot) return;

    shot.volume = currentFireworkVolume();
    try { shot.currentTime = 0; } catch {}
    tryPlay(shot);
  };
  setInterval(sync,100);
}
}
// TCIK Vintage Interior — append once, outside the previous blocks.
{
const timber=0x805638,dark=0x352823,black=0x252529,brass=0xb58b53,ivory=0xe7d9bc;
const block=(x,y,z,w,h,d,c)=>box(x,y,z,w,h,d,c);
function ball(x,y,z,a,b,c,color){const m=new T.Mesh(new T.SphereGeometry(1,12,8),new T.MeshStandardMaterial({color}));m.position.set(x,y,z);m.scale.set(a,b,c);scene.add(m);return m}
function glow(m,color,intensity){m.material.emissive.setHex(color);m.material.emissiveIntensity=intensity;return m}
const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,256,128);let seed=137;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};for(let i=0;i<210;i++){const y=rand()*128;g.strokeStyle=`rgba(77,43,25,${rand()*.19})`;g.beginPath();g.moveTo(-2,y);g.bezierCurveTo(67,y+rand()*8,172,y-rand()*8,258,y);g.stroke()}const grain=new T.CanvasTexture(c);grain.colorSpace=T.SRGBColorSpace;grain.anisotropy=Math.min(4,r.capabilities.getMaxAnisotropy());
function wooden(m){m.material=m.material.clone();m.material.map=grain;return m}const base=[...scene.children];for(const m of base){const q=m.geometry?.parameters;if(m.isMesh&&q&&(q.depth===18&&m.position.y<0||q.width>=4.8&&q.width<=5.1&&m.position.x<-5&&Math.abs(m.position.z+.2)<.05))wooden(m)}
// Front paneling and the return end of the coffee bar.
wooden(block(-5.5,.51,.405,4.78,.9,.044,timber));for(let i=0;i<5;i++){const x=-7.35+i*.925;wooden(block(x,.47,.436,.82,.63,.035,0x71482f));for(const y of [.16,.78])block(x,y,.46,.83,.033,.032,0x9a704e);for(const dx of [-.405,.405])block(x+dx,.47,.46,.028,.62,.032,0x9a704e)}block(-5.5,.88,.454,4.83,.06,.047,0x93674b);block(-5.5,.11,.453,4.83,.075,.051,dark);
// Espresso machine, knobs, grinders, ceramic cups and tray.
block(-6.57,1.15,-.27,1.04,.10,.56,0x383532);block(-6.57,1.34,-.28,1.03,.35,.51,black);block(-6.57,1.28,-.016,.81,.12,.04,0x9b9080);block(-6.57,1.15,.027,.94,.045,.22,0x99948a);for(const x of [-6.81,-6.37]){cyl(x,1.24,.025,.061,.061,.069,brass);block(x,1.23,.104,.036,.028,.17,black);cyl(x,1.53,-.28,.067,.056,.09,ivory)}for(const x of [-7.4,-7.75]){cyl(x,1.25,-.18,.105,.12,.37,black);cyl(x,1.55,-.18,.125,.075,.22,0x604334);cyl(x,1.68,-.18,.126,.126,.032,black)}block(-3.91,1.123,-.03,.52,.045,.33,0x483f35);for(let i=0;i<3;i++){const x=-4.08+i*.16;cyl(x,1.19,-.03,.063,.048,.105,[ivory,0xabc0a8,0xa78973][i]);cyl(x,1.244,-.03,.051,.051,.006,0x6a4c3d)}
// Cream ceiling, dark rails and warm linear lighting.
block(0,3.32,2,17.7,.10,9.75,0xc8bba2);for(const z of [.1,2.8,5.45]){block(0,3.20,z,14.8,.13,.18,dark);for(const x of [-4.65,4.65]){block(x,3.04,z,.021,.21,.021,black);block(x,2.956,z,3.26,.071,.13,0x483931);glow(block(x,2.919,z,3.14,.018,.082,0xffd7a2),0xffaa59,1.5)}}
// Open timber picture windows: the center doorway stays clear.
for(const side of [-1,1]){const x=side*5.2;wooden(block(x,.93,-2.94,7.36,.13,.35,timber));wooden(block(x,2.72,-2.91,7.36,.115,.13,timber));for(const v of [1.55,3.34,5.2,7.05,8.83])wooden(block(side*v,1.8,-2.9,.119,1.76,.135,timber));const awning=wooden(block(side*6.13,2.48,-2.78,1.64,.075,.52,0x7e5638));awning.rotation.x=-.37;block(side*6.13,2.403,-2.56,.13,.035,.035,brass)}
// Window ledges at the far ends, with no extra seat in the main walking lane.
for(const side of [-1,1]){const x=side*7.65;wooden(block(x,.98,-2.70,2.12,.095,.59,timber));for(const dx of [-.69,.69]){const brace=block(x+dx,.748,-2.6,.075,.53,.087,dark);brace.rotation.x=-.53}for(const dx of [-.52,.52]){cyl(x+dx,1.11,-2.83,.10,.076,.18,0x9c7259);for(let i=0;i<5;i++){const a=i*2.4;const leaf=ball(x+dx+Math.cos(a)*.10,1.21+i*.038,-2.83+Math.sin(a)*.08,.10,.052,.07,0x51683c);leaf.rotation.z=a}}}
function plant(x,z,scale){cyl(x,.19*scale,z,.22*scale,.15*scale,.38*scale,0x84624e);cyl(x,.37*scale,z,.185*scale,.185*scale,.025,0x42392c);const stalk=cyl(x,.68*scale,z,.014*scale,.027*scale,.6*scale,0x626341);stalk.rotation.z=.14;for(let i=0;i<18;i++){const a=i*2.39996,h=(.52+i*.045)*scale,radius=(.09+(i%4)*.053)*scale;const leaf=ball(x+Math.cos(a)*radius,h,z+Math.sin(a)*radius,.18*scale,.034*scale,.071*scale,[0x516443,0x6d7c49,0x3e5b3a][i%3]);leaf.rotation.y=-a;leaf.rotation.z=.32*Math.sin(i)}}plant(-8.59,5.7,1.1);plant(8.58,5.95,1.06);
// Amber table lamp and little ceramic accents on existing tables.
function lamp(x,y,z,s){cyl(x,y+.023*s,z,.19*s,.21*s,.045*s,black);cyl(x,y+.24*s,z,.026*s,.032*s,.45*s,black);glow(cyl(x,y+.47*s,z,.125*s,.125*s,.26*s,0xffba5a),0xffa139,1.9);for(let i=0;i<8;i++){const a=i*Math.PI/4;block(x+Math.cos(a)*.135*s,y+.47*s,z+Math.sin(a)*.135*s,.027*s,.29*s,.027*s,brass)}cyl(x,y+.621*s,z,.14*s,.14*s,.04*s,black)}wooden(block(8.42,.51,6.53,.62,1.02,.59,timber));lamp(8.42,1.03,6.53,.79);for(const [x,z] of tables){cyl(x-.23,.905,z-.20,.113,.113,.017,0xa78863);cyl(x-.23,.958,z-.20,.067,.051,.09,ivory)}
}

// TCIK Vintage Interior — append once, outside the previous blocks.
{
const timber=0x805638,dark=0x352823,black=0x252529,brass=0xb58b53,ivory=0xe7d9bc;
const block=(x,y,z,w,h,d,c)=>box(x,y,z,w,h,d,c);
function ball(x,y,z,a,b,c,color){const m=new T.Mesh(new T.SphereGeometry(1,12,8),new T.MeshStandardMaterial({color}));m.position.set(x,y,z);m.scale.set(a,b,c);scene.add(m);return m}
function glow(m,color,intensity){m.material.emissive.setHex(color);m.material.emissiveIntensity=intensity;return m}
const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,256,128);let seed=137;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};for(let i=0;i<210;i++){const y=rand()*128;g.strokeStyle=`rgba(77,43,25,${rand()*.19})`;g.beginPath();g.moveTo(-2,y);g.bezierCurveTo(67,y+rand()*8,172,y-rand()*8,258,y);g.stroke()}const grain=new T.CanvasTexture(c);grain.colorSpace=T.SRGBColorSpace;grain.anisotropy=Math.min(4,r.capabilities.getMaxAnisotropy());
function wooden(m){m.material=m.material.clone();m.material.map=grain;return m}const base=[...scene.children];for(const m of base){const q=m.geometry?.parameters;if(m.isMesh&&q&&(q.depth===18&&m.position.y<0||q.width>=4.8&&q.width<=5.1&&m.position.x<-5&&Math.abs(m.position.z+.2)<.05))wooden(m)}
// Front paneling and the return end of the coffee bar.
wooden(block(-5.5,.51,.405,4.78,.9,.044,timber));for(let i=0;i<5;i++){const x=-7.35+i*.925;wooden(block(x,.47,.436,.82,.63,.035,0x71482f));for(const y of [.16,.78])block(x,y,.46,.83,.033,.032,0x9a704e);for(const dx of [-.405,.405])block(x+dx,.47,.46,.028,.62,.032,0x9a704e)}block(-5.5,.88,.454,4.83,.06,.047,0x93674b);block(-5.5,.11,.453,4.83,.075,.051,dark);
// Espresso machine, knobs, grinders, ceramic cups and tray.
block(-6.57,1.15,-.27,1.04,.10,.56,0x383532);block(-6.57,1.34,-.28,1.03,.35,.51,black);block(-6.57,1.28,-.016,.81,.12,.04,0x9b9080);block(-6.57,1.15,.027,.94,.045,.22,0x99948a);for(const x of [-6.81,-6.37]){cyl(x,1.24,.025,.061,.061,.069,brass);block(x,1.23,.104,.036,.028,.17,black);cyl(x,1.53,-.28,.067,.056,.09,ivory)}for(const x of [-7.4,-7.75]){cyl(x,1.25,-.18,.105,.12,.37,black);cyl(x,1.55,-.18,.125,.075,.22,0x604334);cyl(x,1.68,-.18,.126,.126,.032,black)}block(-3.91,1.123,-.03,.52,.045,.33,0x483f35);for(let i=0;i<3;i++){const x=-4.08+i*.16;cyl(x,1.19,-.03,.063,.048,.105,[ivory,0xabc0a8,0xa78973][i]);cyl(x,1.244,-.03,.051,.051,.006,0x6a4c3d)}
// Cream ceiling, dark rails and warm linear lighting.
block(0,3.32,2,17.7,.10,9.75,0xc8bba2);for(const z of [.1,2.8,5.45]){block(0,3.20,z,14.8,.13,.18,dark);for(const x of [-4.65,4.65]){block(x,3.04,z,.021,.21,.021,black);block(x,2.956,z,3.26,.071,.13,0x483931);glow(block(x,2.919,z,3.14,.018,.082,0xffd7a2),0xffaa59,1.5)}}
// Open timber picture windows: the center doorway stays clear.
for(const side of [-1,1]){const x=side*5.2;wooden(block(x,.93,-2.94,7.36,.13,.35,timber));wooden(block(x,2.72,-2.91,7.36,.115,.13,timber));for(const v of [1.55,3.34,5.2,7.05,8.83])wooden(block(side*v,1.8,-2.9,.119,1.76,.135,timber));const awning=wooden(block(side*6.13,2.48,-2.78,1.64,.075,.52,0x7e5638));awning.rotation.x=-.37;block(side*6.13,2.403,-2.56,.13,.035,.035,brass)}
// Window ledges at the far ends, with no extra seat in the main walking lane.
for(const side of [-1,1]){const x=side*7.65;wooden(block(x,.98,-2.70,2.12,.095,.59,timber));for(const dx of [-.69,.69]){const brace=block(x+dx,.748,-2.6,.075,.53,.087,dark);brace.rotation.x=-.53}for(const dx of [-.52,.52]){cyl(x+dx,1.11,-2.83,.10,.076,.18,0x9c7259);for(let i=0;i<5;i++){const a=i*2.4;const leaf=ball(x+dx+Math.cos(a)*.10,1.21+i*.038,-2.83+Math.sin(a)*.08,.10,.052,.07,0x51683c);leaf.rotation.z=a}}}
function plant(x,z,scale){cyl(x,.19*scale,z,.22*scale,.15*scale,.38*scale,0x84624e);cyl(x,.37*scale,z,.185*scale,.185*scale,.025,0x42392c);const stalk=cyl(x,.68*scale,z,.014*scale,.027*scale,.6*scale,0x626341);stalk.rotation.z=.14;for(let i=0;i<18;i++){const a=i*2.39996,h=(.52+i*.045)*scale,radius=(.09+(i%4)*.053)*scale;const leaf=ball(x+Math.cos(a)*radius,h,z+Math.sin(a)*radius,.18*scale,.034*scale,.071*scale,[0x516443,0x6d7c49,0x3e5b3a][i%3]);leaf.rotation.y=-a;leaf.rotation.z=.32*Math.sin(i)}}plant(-8.59,5.7,1.1);plant(8.58,5.95,1.06);
// Amber table lamp and little ceramic accents on existing tables.
function lamp(x,y,z,s){cyl(x,y+.023*s,z,.19*s,.21*s,.045*s,black);cyl(x,y+.24*s,z,.026*s,.032*s,.45*s,black);glow(cyl(x,y+.47*s,z,.125*s,.125*s,.26*s,0xffba5a),0xffa139,1.9);for(let i=0;i<8;i++){const a=i*Math.PI/4;block(x+Math.cos(a)*.135*s,y+.47*s,z+Math.sin(a)*.135*s,.027*s,.29*s,.027*s,brass)}cyl(x,y+.621*s,z,.14*s,.14*s,.04*s,black)}wooden(block(8.42,.51,6.53,.62,1.02,.59,timber));lamp(8.42,1.03,6.53,.79);for(const [x,z] of tables){cyl(x-.23,.905,z-.20,.113,.113,.017,0xa78863);cyl(x-.23,.958,z-.20,.067,.051,.09,ivory)}
}
// TCIK Interior V2
{
  const ivory = 0xf5efe3;
  const walnut = 0x755039;
  const brass = 0xb88e57;

  // 기존 벽만 밝게: 원목 창틀과 카운터는 그대로 둡니다.
  for (const mesh of scene.children) {
    if (!mesh.isMesh || !mesh.material?.color) continue;

    const { width, height, depth } = mesh.geometry.parameters || {};
    const { x, z } = mesh.position;

    const backWall = Math.abs(z - 7) < 0.1 && width >= 17;
    const sideWall = Math.abs(Math.abs(x) - 9) < 0.1
      && height > 2 && depth >= 9;
    const windowWall = Math.abs(z + 3) < 0.1
      && width >= 2.9 && height > 0.28 && depth < 0.25;

    if (backWall || sideWall || windowWall) {
      mesh.material = mesh.material.clone();
      mesh.material.color.setHex(ivory);
    }
  }

  // 왼쪽 창가: 책 다섯 권. 선반이 없는 버전에서도 놓일 받침을 추가합니다.
  box(-7.55, 1.00, -2.66, 1.32, 0.06, 0.32, walnut);

  const covers = [0x536549, 0xa85b48, 0xc29f63, 0x456478, 0x806077];

  covers.forEach((color, i) => {
    const x = -7.95 + i * 0.18;
    const h = [0.32, 0.39, 0.30, 0.36, 0.34][i];
    const y = 1.03 + h / 2;

    box(x, y, -2.64, 0.15, h, 0.19, color);
    box(x, y + h * 0.24, -2.542, 0.105, 0.018, 0.008, brass);
    box(x, y - h * 0.25, -2.542, 0.105, 0.012, 0.008, brass);
  });

  // 오른쪽 창가: 달과 밤바다를 그린 원목 액자.
  box(7.55, 1.00, -2.66, 0.86, 0.06, 0.32, walnut);

  const picture = new T.Group();
  picture.position.set(7.55, 1.33, -2.69);
  picture.rotation.x = -0.10;
  scene.add(picture);

  box(0, 0, 0, 0.59, 0.62, 0.055, walnut, picture);
  box(0, 0, 0.03, 0.51, 0.54, 0.012, 0xe6d7bb, picture);
  box(0, 0, 0.04, 0.41, 0.44, 0.010, 0x283c51, picture);
  box(0, -0.10, 0.047, 0.41, 0.19, 0.010, 0x526e78, picture);

  const moon = new T.Mesh(
    new T.CircleGeometry(0.063, 24),
    new T.MeshBasicMaterial({ color: 0xffe5a1 })
  );
  moon.position.set(0.066, 0.11, 0.055);
  picture.add(moon);

  for (let i = 0; i < 4; i++) {
    box(0.065, -0.055 - i * 0.029, 0.055,
      0.035 + i * 0.018, 0.007, 0.006, 0xb9b4a0, picture);
  }

  // 카운터: 쿠키병, 포개 놓은 접시, 시럽 펌프병.
  const jarX = -4.65;
  const jarZ = 0.12;

  const jar = new T.Mesh(
    new T.CylinderGeometry(0.106, 0.106, 0.22, 24),
    new T.MeshStandardMaterial({
      color: 0xd9e4dc,
      transparent: true,
      opacity: 0.30,
      depthWrite: false
    })
  );
  jar.position.set(jarX, 1.22, jarZ);
  scene.add(jar);

  cyl(jarX, 1.34, jarZ, 0.113, 0.113, 0.028, walnut);
  for (let i = 0; i < 4; i++) {
    cyl(jarX, 1.135 + i * 0.039, jarZ,
      0.068, 0.068, 0.025, 0xbd8a53);
    cyl(-4.31, 1.121 + i * 0.020, -0.03,
      0.101, 0.089, 0.016, 0xeadbc1);
  }

  cyl(-3.60, 1.22, -0.20, 0.049, 0.057, 0.21, 0x8c602f);
  cyl(-3.60, 1.345, -0.20, 0.026, 0.032, 0.043, 0x352922);
  box(-3.57, 1.369, -0.20, 0.084, 0.018, 0.024, brass);

  const badge = document.createElement('div');
  badge.textContent = '인테리어 적용 완료';
  Object.assign(badge.style, {
    position: 'fixed',
    top: '12px',
    right: '12px',
    zIndex: 100,
    padding: '8px 12px',
    borderRadius: '8px',
    color: '#352922',
    background: '#f5efe3',
    pointerEvents: 'none'
  });
  document.body.append(badge);
  setTimeout(() => badge.remove(), 6000);
}
// TCIK Ocean & Wall Sign
{
  // 기존 파도 메시와 시간 애니메이션은 유지하고, 수면 색과 반사만 교체합니다.
  const ocean = scene.children.find(object =>
    object.isMesh &&
    object.material?.isShaderMaterial &&
    object.material.uniforms?.time &&
    Math.abs(object.position.z + 43.45) < 0.1
  );

  if (ocean) {
    ocean.material.fragmentShader = `
      uniform float time;
      varying vec2 wp;
      varying float swell;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)),
              hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      void main() {
        float x = wp.x;
        float y = wp.y;
        float t = time;

        // 기존 바다의 앞쪽은 wp.y가 양수입니다.
        float nearShore = smoothstep(-20.0, 31.0, y);

        float waveA = sin(y * 2.65 + t * 1.65
                          + sin(x * 0.54 + t * 0.45) * 0.85);
        float waveB = sin(y * 6.2 - x * 0.47 + t * 2.2);
        float ripple = noise(vec2(x * 6.2, y * 11.0 - t * 2.9));
        float chop = noise(vec2(x * 2.2 + t * 0.18, y * 3.8));

        // 가까운 물결에서는 폭이 넓어지고, 물결마다 중심이 살짝 흔들립니다.
        float width = mix(0.95, 4.8, nearShore) * 4.0;
        float drift = sin(y * 0.37 + t * 0.62) * 0.72
                    + (chop - 0.5) * 0.8;
        float distanceFromLight = (x - drift) / width;
        float reflection = exp(-distanceFromLight * distanceFromLight * 1.55);

        // 가느다란 반사 띠를 작은 조각으로 끊어 수면 위 윤슬을 만듭니다.
        float crest = smoothstep(0.63, 0.99, waveA);
        float breaks = smoothstep(0.36, 0.77,
          noise(vec2(x * 3.4 - t * 0.27, y * 8.5 + t * 0.5)));
        float shimmer = reflection * crest * breaks
                      * (0.25 + 0.75 * smoothstep(-0.35, 0.94, waveB));
        float spark = reflection * crest * pow(ripple, 6.0) * 1.65;

        vec3 color = mix(
          vec3(0.027, 0.052, 0.097),
          vec3(0.083, 0.155, 0.218),
          clamp(0.37 + swell * 0.18 + waveA * 0.11, 0.0, 1.0)
        );
        color += vec3(0.23, 0.36, 0.49) * reflection * 0.13;
        color += vec3(0.69, 0.81, 0.92) * (shimmer * 0.56 + spark);

        float foam = smoothstep(0.88, 0.998, waveA)
                   * smoothstep(0.44, 0.79, chop)
                   * smoothstep(23.0, 31.0, y);
        color += vec3(0.44, 0.54, 0.60) * foam * 0.33;

        gl_FragColor = vec4(color, 1.0);
      }
    `;
    ocean.material.needsUpdate = true;
  } else {
    console.warn('TCIK: 기존 파도 메시를 찾지 못했어요.');
  }

  // 창가의 작은 액자가 아닌, 뒤쪽 벽의 큰 액자 위치입니다.
  const wallArt = scene.children.find(object =>
    object.isMesh &&
    object.geometry?.type === 'PlaneGeometry' &&
    Math.abs(object.position.x - 7.1) < 0.06 &&
    Math.abs(object.position.y - 1.98) < 0.06 &&
    Math.abs(object.position.z - 6.86) < 0.06
  );

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');

  // 짙은 원목 프레임과 따뜻한 아이보리색 바탕.
  ctx.fillStyle = '#593d30';
  ctx.fillRect(0, 0, 1024, 1280);
  ctx.fillStyle = '#a98463';
  ctx.fillRect(20, 20, 984, 1240);
  ctx.fillStyle = '#f5ecdc';
  ctx.fillRect(36, 36, 952, 1208);
  ctx.strokeStyle = '#c6ad8a';
  ctx.lineWidth = 3;
  ctx.strokeRect(78, 78, 868, 1124);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#342720';
  ctx.font = '900 240px Georgia, serif';
  ctx.fillText('TCIK', 512, 506, 820);

  ctx.fillStyle = '#5f4435';
  ctx.font = '500 83px "Nanum Myeongjo", "Batang", "Malgun Gothic", serif';
  ctx.fillText('내가 아는 카페', 512, 681, 760);

  ctx.fillStyle = '#725b49';
  ctx.font = '42px Georgia, serif';
  ctx.fillText('Mon~Sun, am12:00~am12:00', 512, 800, 800);

  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  const material = new T.MeshBasicMaterial({
    map: texture,
    side: T.DoubleSide
  });

  if (wallArt) {
    wallArt.material = material;
  } else {
    // 기존 액자가 없는 버전에서도 같은 벽에 표시합니다.
    const signboard = new T.Mesh(new T.PlaneGeometry(1.08, 1.35), material);
    signboard.position.set(7.1, 1.98, 6.86);
    signboard.rotation.y = Math.PI;
    scene.add(signboard);
  }
}
// TCIK High Ceiling & Simple Roof
{
  const lift = 1.635;

  // 기존 천장판, 천장 보, 조명 기구를 함께 올립니다.
  // 실제로 실내를 비추는 조명은 그대로 두어 테이블이 어두워지지 않게 합니다.
  for (const mesh of scene.children) {
    if (!mesh.isMesh) continue;
    const { y, z } = mesh.position;
    if (z > -2.8 && y >= 2.918 && y <= 3.451) {
      mesh.position.y += lift;
    }
  }

  // 기존 벽 위를 메워 천장까지 이어 줍니다.
  const wallColor = 0xf5efe3;
  const wallBottom = 3.35;
  const wallTop = 5.25;
  const wallHeight = wallTop - wallBottom;
  const wallY = (wallBottom + wallTop) / 2;

  for (const z of [-3, 7]) {
    box(0, wallY, z, 18, wallHeight, .2, wallColor);
  }
  for (const x of [-9, 9]) {
    box(x, wallY, 2, .2, wallHeight, 10, wallColor);
  }

  // 두 장의 지붕판: 테라스 위로는 짧게만 나옵니다.
  const roofColor = 0x3b302b;
  const eaveY = 5.27;
  const halfSpan = 5.42;
  const rise = 1.02;
  const slope = Math.atan2(rise, halfSpan);
  const roofDepth = Math.hypot(halfSpan, rise) + .06;

  for (const side of [-1, 1]) {
    const panel = box(
      0, eaveY + rise / 2, 2 + side * halfSpan / 2,
      18.72, .16, roofDepth, roofColor
    );
    panel.rotation.x = side * slope;
  }

  // 건물 양옆에서 보이는 지붕 아래 삼각형을 막습니다.
  const gable = new T.Shape();
  gable.moveTo(-5.1, 0);
  gable.lineTo(5.1, 0);
  gable.lineTo(0, rise - .02);
  gable.closePath();

  const gableGeo = new T.ShapeGeometry(gable);
  const gableMat = new T.MeshStandardMaterial({
    color: wallColor,
    side: T.DoubleSide
  });

  for (const x of [-9.1, 9.1]) {
    const end = new T.Mesh(gableGeo, gableMat);
    end.rotation.y = Math.PI / 2;
    end.position.set(x, wallTop, 2);
    scene.add(end);
  }
}
// TCIK Main Entrance — 파일 맨 끝에 한 번만 추가
{
  const walnut = 0x563b2b;
  const edge = 0x9a704b;
  const brass = 0xa77b42;

  // 원목 문틀: 기존 통로 양옆에만 설치합니다.
  for (const x of [-1.52, 1.52]) {
    box(x, 1.51, -3, .25, 3.02, .38, walnut);
    box(x, 1.51, -3.205, .045, 2.90, .03, edge);
    box(x, .12, -3, .31, .24, .42, 0x3e3029);
  }
  box(0, 3.055, -3, 3.34, .22, .42, walnut);
  box(0, 3.18, -3, 3.46, .065, .46, edge);

  // 테라스 쪽에서 읽는 정문 간판.
  const board = document.createElement('canvas');
  board.width = 1024;
  board.height = 256;
  const ink = board.getContext('2d');

  ink.fillStyle = '#34271e';
  ink.fillRect(0, 0, 1024, 256);
  ink.strokeStyle = '#b18a58';
  ink.lineWidth = 4;
  ink.strokeRect(18, 18, 988, 220);

  ink.textAlign = 'center';
  ink.fillStyle = '#f4e3bd';
  ink.font = 'bold 100px Georgia, serif';
  ink.fillText('TCIK', 512, 120);
  ink.font = '38px "Malgun Gothic", sans-serif';
  ink.fillText('내가 아는 카페', 512, 194);

  const map = new T.CanvasTexture(board);
  map.colorSpace = T.SRGBColorSpace;
  box(0, 3.89, -3.16, 2.68, .72, .16, walnut);

  const lettering = new T.Mesh(
    new T.PlaneGeometry(2.56, .64),
    new T.MeshBasicMaterial({ map })
  );
  lettering.rotation.y = Math.PI;
  lettering.position.set(0, 3.89, -3.245);
  scene.add(lettering);

  // 양쪽 황동 벽등: 밝은 유리와 은은한 주황빛.
  for (const x of [-1.84, 1.84]) {
    box(x, 3.63, -3.13, .18, .28, .07, brass);
    box(x, 3.61, -3.26, .052, .052, .25, brass);

    const glass = box(x, 3.55, -3.43, .17, .26, .16, 0xffd69a);
    glass.material.emissive.setHex(0xffb76a);
    glass.material.emissiveIntensity = 1.1;

    for (const y of [3.40, 3.70]) {
      box(x, y, -3.43, .22, .045, .21, brass);
    }

    const light = new T.PointLight(0xffbb7b, 3, 3);
    light.position.set(x, 3.53, -3.58);
    scene.add(light);
  }

  // 바닥에 거의 붙는 현관 매트. 이동 판정은 바꾸지 않습니다.
  box(0, .006, -3.72, 1.82, .022, .78, 0x514138);
  box(0, .019, -3.72, 1.68, .006, .64, 0x79614b);
}
// TCIK Open Double Doors
{
  // 커튼은 제거하되, 정문 위의 기존 가로 벽 띠는 계속 숨깁니다.
  const wallStrip = scene.children.find(m => {
    const p = m.geometry?.parameters;
    return m.isMesh && p &&
      Math.abs(p.width - 3) < .01 &&
      Math.abs(p.height - .73) < .01 &&
      Math.abs(m.position.x) < .01 &&
      Math.abs(m.position.y - 3.04) < .01 &&
      Math.abs(m.position.z + 3) < .01;
  });
  if (wallStrip) wallStrip.visible = false;

  const wood = 0x563b2b;
  const inset = 0x755036;
  const trim = 0x916845;
  const brass = 0xb08a51;

  for (const side of [-1, 1]) {
    const door = new T.Group();
    door.position.set(side * 1.40, .02, -3.22);
    door.rotation.y = -side * Math.PI * .60;
    scene.add(door);

    // 문짝의 모든 부품을 경첩을 기준으로 배치합니다.
    const part = (u, y, z, w, h, d, color) =>
      box(-side * u, y, z, w, h, d, color, door);

    // 두 세로 틀과 위·가운데·아래 가로대.
    for (const u of [.055, 1.245]) {
      part(u, 1.40, 0, .11, 2.80, .095, wood);
    }
    for (const y of [.08, 1.03, 2.73]) {
      part(.65, y, 0, 1.30, .14, .095, wood);
    }

    // 아래쪽 원목 판과 위쪽 창살.
    part(.65, .55, 0, 1.08, .80, .065, inset);
    for (const u of [.31, .65, .99]) {
      part(u, 1.88, 0, .038, 1.56, .065, trim);
    }
    for (const y of [1.60, 2.20]) {
      part(.65, y, 0, 1.08, .040, .065, trim);
    }

    // 문 양면의 황동 손잡이와 경첩.
    for (const face of [-1, 1]) {
      part(1.14, 1.03, face * .065, .055, .20, .035, brass);
      part(1.14, 1.03, face * .10, .035, .13, .035, brass);
    }
    for (const y of [.37, 1.44, 2.43]) {
      cyl(0, y, 0, .034, .034, .15, brass, door);
    }
  }
}
// TCIK Facade Wall Piers — 파일 맨 끝에 한 번만 추가
{
  const plaster = 0xf5efe3; // 기존 외벽과 같은 크림색
  const timber = 0x563b2b;  // 기존 정문과 같은 원목색

  for (const x of [-4.5, 4.5]) {
    // 아래쪽 흰 벽에서 위쪽 흰 벽까지 이어지는 벽기둥.
    // 창살보다 깊게 만들어 기둥 안쪽의 창살은 보이지 않게 합니다.
    box(x, 2.095, -2.98, .86, 2.57, .48, plaster);

    // 창과 벽이 만나는 양쪽에 얇은 원목 마감.
    for (const dx of [-.445, .445]) {
      box(x + dx, 1.83, -3.115, .038, 1.94, .15, timber);
    }
  }
}
// TCIK Shooting Stars — 파일 맨 끝에 한 번만 추가
{
  const count = 16;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const geometry = new T.BufferGeometry();

  // 앞부분은 밝게, 꼬리 끝은 어둡게 만듭니다.
  for (let i = 0; i < count; i++) {
    const glow = (1 - i / (count - 1)) ** 2;
    colors.set([.77 * glow, .87 * glow, glow], i * 3);
  }
  geometry.setAttribute('position', new T.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new T.BufferAttribute(colors, 3));

  const material = new T.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: T.AdditiveBlending,
    fog: false
  });

  const meteor = new T.Line(geometry, material);
  meteor.visible = false;
  meteor.frustumCulled = false;
  scene.add(meteor);

  const random = (min, max) => min + Math.random() * (max - min);
  let next = performance.now() + random(2200, 5000);
  let flight = null;

  function shootingStarFrame(now) {
    if (!flight && now >= next) {
      flight = {
        start: now,
        duration: random(550, 950),
        x: random(-30, 30),
        y: random(13, 23),
        z: random(-66, -44),
        dx: random(8, 16) * (Math.random() < .5 ? -1 : 1),
        dy: -random(4, 8)
      };
      meteor.visible = true;
    }

    if (flight) {
      const progress = (now - flight.start) / flight.duration;
      if (progress >= 1) {
        meteor.visible = false;
        flight = null;
        next = now + random(4000, 15000);
      } else {
        for (let i = 0; i < count; i++) {
          const trail = Math.max(0, progress - .34 * i / (count - 1));
          positions.set([
            flight.x + flight.dx * trail,
            flight.y + flight.dy * trail,
            flight.z
          ], i * 3);
        }
        geometry.attributes.position.needsUpdate = true;
        material.opacity = Math.min(1, progress * 10) * (1 - progress ** 3);
      }
    }

    requestAnimationFrame(shootingStarFrame);
  }

  requestAnimationFrame(shootingStarFrame);
}
// TCIK Mobile Controls
{
  document.body.append(document.querySelector('#nav'));
  const mobileStyle = document.createElement('style');
  mobileStyle.textContent = `
        @media (any-pointer: coarse), (max-width: 900px) {
      #nav {
        display: grid !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: fixed !important;
        left: calc(12px + env(safe-area-inset-left, 0px)) !important;
        bottom: calc(14px + env(safe-area-inset-bottom, 0px)) !important;
        top: auto !important;
        right: auto !important;
        transform: none !important;
        width: max-content;
        grid-template-columns: repeat(3, 48px);
        gap: 6px;
        z-index: 1000;
        pointer-events: auto;
      }

      #nav > button {
        display: block !important;
        width: 48px;
        height: 48px;
        margin: 0;
        padding: 0;
        font-size: 23px;
        color: #fff3de;
        background: rgba(54, 38, 30, .9);
        border: 1px solid #aa815e;
        border-radius: 10px;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
      }

      #nav > button:active {
        background: #956949;
      }
    }
  `;
  document.head.append(mobileStyle);
}