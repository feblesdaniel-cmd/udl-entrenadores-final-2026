'use strict';
(function(){
function safe(fn, name){ try{ fn(); }catch(e){ console.warn('['+name+']', e); } }

/* ── SLIDES / NAV DOTS ── */
const slides = Array.from(document.querySelectorAll('section.slide'));
const navLabels = [
  'Portada','Mapa de trabajo','Por qué estamos aquí','El entrenador, pieza clave','Equipos del club',
  'Pilares de la cantera','Captación','Competición','Promoción','Metodología','Modelo de juego',
  'Técnicos formadores','Control del método','MIT','MIT IN','MIT OUT','MIT PRO','Gamificación',
  'Tiempo y espacio','Análisis y evaluación','Denominación de Origen','Normas operativas',
  'Centro de recursos','Comunicación','Centro de contenido','Contacto','Compromiso final'
];

function goToSection(id){
  const s = document.getElementById(id);
  if (s) s.scrollIntoView({ behavior:'smooth', block:'start' });
}
window.goToSection = goToSection;

function buildNav(){
  const nav = document.getElementById('nav');
  if (!nav) return;
  slides.forEach((s,i) => {
    const d = document.createElement('button');
    d.className = 'nd';
    d.setAttribute('data-label', navLabels[i] || 'Sección '+(i+1));
    d.setAttribute('aria-label', navLabels[i] || 'Sección '+(i+1));
    d.addEventListener('click', () => s.scrollIntoView({ behavior:'smooth' }));
    nav.appendChild(d);
  });
}
function updateNav(){
  const dots = document.querySelectorAll('.nd');
  let active = 0;
  slides.forEach((s,i) => { const r = s.getBoundingClientRect(); if (r.top <= window.innerHeight*0.5) active = i; });
  dots.forEach((d,i) => d.classList.toggle('on', i===active));
}
function updateProgress(){
  const el = document.getElementById('progress');
  if (!el) return;
  const scrolled = window.scrollY;
  const total = document.body.scrollHeight - window.innerHeight;
  el.style.width = (total>0 ? (scrolled/total)*100 : 0) + '%';
}
window.addEventListener('scroll', () => { updateProgress(); updateNav(); }, { passive:true });

/* ── QUICKMENU ── */
const QUICK_LINKS = [
  { id:'contenido',       ico:'🗂️', label:'Contenido' },
  { id:'metodologia',     ico:'📘', label:'Metodología' },
  { id:'modelo-juego',    ico:'⚽', label:'Modelo de juego' },
  { id:'control-metodo',  ico:'🎛️', label:'Control del método' },
  { id:'mit',             ico:'🏋️', label:'MIT' },
  { id:'normas-operativas', ico:'📋', label:'Normas' },
  { id:'comunicacion',    ico:'💬', label:'Comunicación' },
  { id:'centro-contenido',ico:'📚', label:'Centro de contenido' },
  { id:'contacto',        ico:'📞', label:'Contacto' }
];
function buildQuickmenu(){
  const wrap = document.getElementById('quickmenu');
  if (!wrap) return;
  QUICK_LINKS.forEach(q => {
    const b = document.createElement('button');
    b.className = 'qm-item';
    b.setAttribute('data-target', q.id);
    b.setAttribute('data-label', q.label);
    b.setAttribute('data-mlabel', q.label);
    b.setAttribute('aria-label', q.label);
    b.textContent = q.ico;
    wrap.appendChild(b);
  });
}

/* ── DATA-TARGET DELEGATION ── */
document.addEventListener('click', function(e){
  const el = e.target.closest('[data-target]');
  if (!el) return;
  e.preventDefault();
  goToSection(el.getAttribute('data-target'));
});

/* ── REVEAL ── */
function initReveal(){
  const revEls = document.querySelectorAll('.rv');
  document.querySelectorAll('#portada .rv').forEach(el => el.classList.add('up'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('up'); obs.unobserve(e.target); } });
  }, { threshold:0.04 });
  revEls.forEach(el => { if (!el.classList.contains('up')) obs.observe(el); });
}

/* ── PARTICLE CANVASES (hero + cierre) ── */
function initParticleCv(id, count, colorFn){
  const cv = document.getElementById(id);
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const pts = [];
  function resize(){ cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
  resize();
  for (let i=0;i<count;i++){
    pts.push({ x:Math.random()*cv.width, y:Math.random()*cv.height, vx:(Math.random()-.5)*0.3, vy:(Math.random()-.5)*0.3, r:Math.random()*1.5+.5 });
  }
  function draw(){
    cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;
    ctx.clearRect(0,0,cv.width,cv.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x<0||p.x>cv.width) p.vx*=-1;
      if (p.y<0||p.y>cv.height) p.vy*=-1;
      const a = 0.2 + Math.abs(Math.sin(Date.now()/3000+p.x))*0.5;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = 'rgba(201,162,39,'+a.toFixed(2)+')'; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', resize);
}

/* ── CUSTOM CURSOR ── */
function initCursor(){
  const cur = document.querySelector('.cursor');
  const dot = document.querySelector('.cursor-dot');
  const ring= document.querySelector('.cursor-ring');
  if (!cur||!dot||!ring) return;
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove', e => {
    mx=e.clientX; my=e.clientY;
    dot.style.transform = 'translate('+mx+'px,'+my+'px)';
    cur.classList.add('ready');
  });
  (function loop(){
    rx += (mx-rx)*0.12; ry += (my-ry)*0.12;
    ring.style.transform = 'translate('+rx+'px,'+ry+'px)';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a,button,.nd,.qm-item,.pillar-row,.ctrl-block,summary').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('hover'));
    el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
  });
}

/* ── CONTENT HUB FILTER ── */
function initContentHub(){
  const filters = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('#chub-grid .chub-card');
  if (!filters.length) return;
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.getAttribute('data-filter');
      cards.forEach(c => {
        c.style.display = (f==='todos' || c.getAttribute('data-cat')===f) ? 'flex' : 'none';
      });
    });
  });
}

/* ── FORMULARIO DE COMUNICACIÓN ── */
function initCommForm(){
  const form = document.getElementById('comm-form');
  const success = document.getElementById('comm-success');
  if (!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const fd = new FormData(form);
    const body = [
      'Nombre: '+(fd.get('nombre')||''),
      'Categoría/equipo: '+(fd.get('categoria')||''),
      'Área: '+(fd.get('area')||''),
      'Tipo de mensaje: '+(fd.get('tipo')||''),
      'Urgencia: '+(fd.get('urgencia')||''),
      '¿Responder?: '+(fd.get('respuesta')||''),
      'Contacto: '+(fd.get('contacto')||''),
      '',
      'Mensaje:',
      (fd.get('mensaje')||'')
    ].join('\n');
    const mailto = 'mailto:direcciondeportiva@udlanzarotebase.com?subject='+encodeURIComponent('Comunicación de entrenador — UD Lanzarote Base')+'&body='+encodeURIComponent(body);
    window.location.href = mailto;
    if (success) success.classList.add('show');
    form.reset();
  });
}

/* ── REINICIAR PRESENTACIÓN ── */
function initRestart(){
  const btn = document.getElementById('btn-restart');
  if (!btn) return;
  btn.addEventListener('click', () => goToSection('portada'));
}

/* ── ÓRBITA METODOLOGÍA ── */
function initOrbit(){
  const outer = document.getElementById('orbit-outer');
  const stage = document.getElementById('orbit-stage');
  if (!outer || !stage || stage._orbitInit) return;
  stage._orbitInit = true;

  const CX=1010, CY=580, RX=540, RY=345, TS=8, LOOP=23;

  const NODE_DATA = [
    { img:'assets/images/modelo.png',     label:'Modelo de juego',           desc:'Una identidad de juego común para todas las categorías de la base.' },
    { img:'assets/images/tecnicos.png',   label:'Técnicos formadores',       desc:'Formamos personas antes que futbolistas, con entrenadores cercanos y preparados.' },
    { img:'assets/images/control.png',    label:'Control del método',        desc:'Planificamos y damos seguimiento al trabajo diario en cada sesión.' },
    { img:'assets/images/analisis.png',   label:'Análisis y evaluación',     desc:'Los datos al servicio del desarrollo individual de cada jugador.' },
    { img:'assets/logos/do_logo_v2.png', label:'D.O · UD Lanzarote',        desc:'La identidad que da coherencia a todo el proyecto formativo.' }
  ];
  const NODE_TARGETS = ['modelo-juego','tecnicos-formadores','control-metodo','analisis','denominacion-origen'];

  const SCHED = [['spin',2],['visit',3,0],['spin',1],['visit',3,1],['spin',1],
                 ['visit',3,2],['spin',1],['visit',3,3],['spin',1],['visit',3,4],['spin',2]];
  let segs=[], T=0, spinAcc=0;
  for (const s of SCHED){
    const [kind,dur] = s;
    const seg = { kind, start:T, end:T+dur, dur };
    if (kind==='spin'){ seg.spinBefore=spinAcc; spinAcc+=dur; }
    else { seg.spinBefore=spinAcc; seg.frozenRot=2*Math.PI*spinAcc/TS; seg.node=s[2]; }
    segs.push(seg); T+=dur;
  }
  function pos(i,rot){ const th=-Math.PI/2+i*(2*Math.PI/5)+rot; return { x:CX+RX*Math.cos(th), y:CY+RY*Math.sin(th), s:Math.sin(th) }; }
  function rotAt(t){ for (const seg of segs){ if (t>=seg.start && t<=seg.end){ if (seg.kind==='spin') return 2*Math.PI*(seg.spinBefore+(t-seg.start))/TS; return seg.frozenRot; } } return 0; }
  function activeAt(t){ for (const seg of segs) if (seg.kind==='visit' && t>=seg.start+0.55 && t<=seg.end) return seg.node; return -1; }

  const nodesWrap = document.getElementById('orbit-nodes');
  const nodeEls = NODE_DATA.map((nd,i) => {
    const div = document.createElement('div');
    div.className = 'onode';
    div.style.cssText = 'position:absolute;width:150px;height:150px;transform:translate(-50%,-50%);pointer-events:auto;cursor:pointer;';
    div.innerHTML = '<div class="onode-img" style="width:100%;height:100%;border-radius:50%;overflow:hidden;border:4px solid rgba(255,255,255,.9);box-shadow:0 14px 32px rgba(0,0,0,.45);transition:border-color .3s,box-shadow .3s;"><img src="'+nd.img+'" alt="'+nd.label+'" style="width:100%;height:100%;object-fit:cover;display:block;"></div><div class="onode-label" style="position:absolute;width:230px;left:50%;transform:translateX(-50%);text-align:center;font-family:\'Montserrat\',sans-serif;font-weight:700;font-size:15px;letter-spacing:.04em;text-transform:uppercase;color:#B7CBE2;pointer-events:none;text-shadow:0 2px 10px rgba(0,0,0,.6);transition:color .3s;white-space:nowrap;">'+nd.label+'</div>';
    nodesWrap.appendChild(div);
    div.addEventListener('mouseenter', () => { interacting=true; frozenRot=rotAt(t); hoverNode=i; });
    div.addEventListener('mouseleave', () => { hoverNode=-1; });
    div.addEventListener('click', () => { goToSection(NODE_TARGETS[i]); });
    return div;
  });

  const connLine = document.getElementById('orbit-conn-line');
  const connDot  = document.getElementById('orbit-conn-dot');
  const tip      = document.getElementById('orbit-tip');
  const tipNum   = document.getElementById('orbit-tip-num');
  const tipLbl   = document.getElementById('orbit-tip-label');
  const tipDesc  = document.getElementById('orbit-tip-desc');

  const pcv = document.getElementById('orbit-particles');
  const pctx = pcv.getContext('2d');
  pcv.width=1920; pcv.height=1080;
  const parts = Array.from({length:18}, () => ({ x0:120+Math.random()*1680, y0:Math.random()*1180, r:2+Math.random()*4, spd:12+Math.random()*26, amp:18+Math.random()*40, ph:Math.random()*6.28, o:.12+Math.random()*.30 }));

  function scaleStage(){
    const s = Math.min(outer.clientWidth/1920, outer.clientHeight/1080);
    stage.style.setProperty('--os', Math.max(.05,s));
    stage.style.transform = 'translate(-50%,-50%) scale('+Math.max(.05,s)+')';
  }
  scaleStage();
  new ResizeObserver(scaleStage).observe(outer);
  window.addEventListener('resize', scaleStage);

  let interacting=false, hoverNode=-1, frozenRot=0, t=0;
  stage.addEventListener('mouseleave', () => { interacting=false; hoverNode=-1; });

  let last=performance.now();
  function loop(now){
    const dt = Math.min(.05,(now-last)/1000); last=now;
    if (!interacting) t=(t+dt)%LOOP;
    const rot = interacting ? frozenRot : rotAt(t);
    const active = interacting ? hoverNode : activeAt(t);

    pctx.clearRect(0,0,1920,1080);
    for (const p of parts){
      let y = p.y0 - t*p.spd; y = ((y%1180)+1180)%1180 - 50;
      const x = p.x0 + p.amp*Math.sin(t*.3+p.ph);
      pctx.beginPath(); pctx.arc(x,y,p.r,0,Math.PI*2);
      pctx.fillStyle = 'rgba(222,192,103,'+p.o+')'; pctx.fill();
    }

    nodeEls.forEach((el,i) => {
      const p = pos(i,rot);
      const depth = (p.s+1)/2;
      let sc = .78+.36*depth;
      const isActive = i===active;
      if (isActive) sc+=.28;
      const z = isActive ? 300 : Math.round(40+depth*120);
      const op = isActive ? 1 : .5+.5*depth;
      const imgDiv = el.querySelector('.onode-img');
      const lbl    = el.querySelector('.onode-label');
      el.style.left = p.x+'px'; el.style.top = p.y+'px';
      el.style.transform = 'translate(-50%,-50%) scale('+sc+')';
      el.style.zIndex = z; el.style.opacity = op;
      imgDiv.style.borderColor = isActive ? '#DEC067' : 'rgba(255,255,255,.9)';
      imgDiv.style.boxShadow = isActive ? '0 0 0 5px rgba(201,162,39,.3),0 0 58px 12px rgba(222,192,103,.55),0 22px 46px rgba(0,0,0,.5)' : '0 14px 32px rgba(0,0,0,.45)';
      lbl.style.color = isActive ? '#DEC067' : '#B7CBE2';
      lbl.style.fontWeight = isActive ? '800' : '700';
      lbl.style.opacity = isActive ? '1' : String(.35+.55*depth);
      lbl.style.top = (75*sc+18)+'px'; lbl.style.position='absolute'; lbl.style.left='50%'; lbl.style.transform='translateX(-50%)';
    });

    if (active>=0){
      const p = pos(active,rot);
      connLine.setAttribute('x1',CX); connLine.setAttribute('y1',CY);
      connLine.setAttribute('x2',p.x); connLine.setAttribute('y2',p.y);
      connLine.setAttribute('opacity','.85');
      connDot.setAttribute('cx',CX); connDot.setAttribute('cy',CY);
      connDot.setAttribute('opacity','.85');
    } else { connLine.setAttribute('opacity','0'); connDot.setAttribute('opacity','0'); }

    if (active>=0){
      const p = pos(active,rot);
      const nd = NODE_DATA[active];
      const depth=(p.s+1)/2; const sc=.78+.36*depth+.28;
      const goRight = p.x<=CX;
      const off = 75*sc+32;
      const tx = goRight ? p.x+off : p.x-off-310;
      const ty = Math.max(120, Math.min(860, p.y));
      tip.style.left = tx+'px'; tip.style.top = ty+'px';
      tip.style.transform = 'translateY(-50%) scale(1)'; tip.style.opacity = '1';
      tipNum.textContent = 'Línea '+String(active+1).padStart(2,'0');
      tipLbl.textContent = nd.label;
      tipDesc.textContent = nd.desc+' (clic para entrar)';
    } else { tip.style.opacity='0'; tip.style.transform='translateY(-50%) scale(.92)'; }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* ── INIT ── */
safe(buildNav,       'nav');
safe(buildQuickmenu, 'quickmenu');
safe(updateNav,      'navInit');
safe(initReveal,     'reveal');
safe(() => initParticleCv('hero-cv', 55),  'heroCv');
safe(() => initParticleCv('close-cv', 40), 'closeCv');
safe(initCursor,     'cursor');
safe(initContentHub, 'contentHub');
safe(initCommForm,   'commForm');
safe(initRestart,    'restart');
safe(initOrbit,      'orbit');
})();
