// Portado 1:1 dos temas/estilos do protótipo original (Convida_Aí).
export const TEMPLATES = {
  minimal: { label:'Minimalista', font:"'Manrope',sans-serif", display:"'Archivo',sans-serif", nameW:800, nameCase:'none', nameTrack:'-.03em',
    pageBg:'#f4f2ee', ink:'#17150f', sub:'#7c766a', line:'rgba(20,18,12,.13)', lineStrong:'rgba(20,18,12,.28)', accent:'#c4502a', grain:'none',
    btnP:['#17150f','#f4f2ee'], celeb:'pop', sound:'soft', celebIcon:'✓',
    celebHead:'Confirmado.', celebBody:'Obrigado. Nos vemos lá — sua presença significa muito pra mim.',
    msg:'Concluí uma etapa importante e quero dividir esse momento com você. Será uma honra ter você comigo nesta noite.' },
  elegante: { label:'Elegante', font:"'Cormorant Garamond',serif", display:"'Cormorant Garamond',serif", nameW:500, nameCase:'none', nameTrack:'0',
    pageBg:'radial-gradient(120% 80% at 50% -5%, #1a150c 0%, #0d0b07 62%)', ink:'#f0e7d2', sub:'#a99a7d', line:'rgba(201,162,75,.2)', lineStrong:'rgba(201,162,75,.5)', accent:'#c9a24b', grain:'none',
    btnP:['#c9a24b','#14110a'], celeb:'shimmer', sound:'chime', celebIcon:'✦',
    celebHead:'Será uma honra', celebBody:'Sua presença tornará esta noite ainda mais especial e inesquecível. Aguardo você com imensa alegria.',
    msg:'É com grande alegria que convido você para celebrar a conclusão da minha graduação. Sua presença tornará esta noite ainda mais especial.' },
  festivo: { label:'Festivo', font:"'Manrope',sans-serif", display:"'Yeseva One',serif", nameW:400, nameCase:'none', nameTrack:'-.01em',
    pageBg:'radial-gradient(130% 85% at 50% -10%, #8a2444 0%, #6c1a33 46%, #4f0f24 100%)', ink:'#fbeee6', sub:'rgba(251,238,230,.68)', line:'rgba(251,238,230,.2)', lineStrong:'rgba(255,178,122,.6)', accent:'#ffb27a', accent2:'#f2c14e', grain:'none',
    btnP:['#ffb27a','#5a1128'], celeb:'confetti', sound:'party', celebIcon:'✺',
    celebHead:'Vai ser inesquecível', celebBody:'Sua vaga está garantida. Já já a gente comemora juntinho — prepara o look e vem com tudo.',
    msg:'Cheguei ao fim dessa jornada longa e não seria a mesma coisa sem você por perto. Bora celebrar minha formatura comigo? Vai ter emoção, boa companhia e muita alegria.' },
  retro: { label:'Retrô', font:"'Space Mono',monospace", display:"'Space Mono',monospace", nameW:700, nameCase:'uppercase', nameTrack:'-.02em',
    pageBg:'#ece0c6', ink:'#38271a', sub:'#8a7256', line:'rgba(56,39,26,.22)', lineStrong:'rgba(198,86,42,.7)', accent:'#c6562a', accent2:'#2e6b5e', grain:'grain',
    btnP:['#c6562a','#f6ecd6'], celeb:'pixel', sound:'retro', celebIcon:'★',
    celebHead:'Gravado na fita', celebBody:'Sua presença acabou de entrar pra lista. Guarda a data e vem viver essa comemoração à moda antiga.',
    msg:'Depois de muitos cafés e madrugadas, chegou a hora. Reservei um lugar especial pra você nessa comemoração à moda antiga. Conto com a sua presença.' },
  divertido: { label:'Divertido', font:"'Manrope',sans-serif", display:"'Space Grotesk',sans-serif", nameW:700, nameCase:'uppercase', nameTrack:'-.03em',
    pageBg:'radial-gradient(120% 90% at 50% -10%, #24242a 0%, #131315 62%)', ink:'#f2f0e8', sub:'#9b9a92', line:'rgba(242,240,232,.14)', lineStrong:'rgba(198,255,46,.7)', accent:'#c6ff2e', accent2:'#ff5c8a', grain:'none',
    btnP:['#c6ff2e','#151600'], celeb:'emoji', sound:'silly', celebIcon:'🤯',
    celebHead:'VOCÊ VEM. ISSO AÍ.', celebBody:'A festa acabou de ficar 200% melhor. Presença confirmadíssima — pode ir treinando os passos de dança.',
    msg:'SOCORRO, EU ME FORMEI. Contra todas as apostas (inclusive as minhas), consegui. Agora bora comemorar antes que a ficha caia — presença obrigatória e opcional trazer salgadinho.' },
};

export function fmtDate(d) {
  if (!d) return 'a definir';
  const dt = new Date(d + 'T00:00:00'); if (isNaN(dt)) return d;
  const di = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const me = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return di[dt.getDay()] + ', ' + dt.getDate() + ' de ' + me[dt.getMonth()];
}
export function fmtShort(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00'); if (isNaN(dt)) return '';
  const me = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return dt.getDate() + ' de ' + me[dt.getMonth()];
}
export function first(n) { return String(n || '').trim().split(/\s+/)[0] || ''; }

export function downloadBlob(blob, name) {
  try {
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 2000);
  } catch (e) {}
}

export function buildICS(f) {
  const dt = new Date(f.data + 'T' + (f.hora || '19:00') + ':00');
  if (isNaN(dt)) return null;
  const end = new Date(dt.getTime() + 3 * 3600 * 1000);
  const z = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const esc = s => String(s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, ' ');
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ConvidaAi//PT-BR','BEGIN:VEVENT',
    'UID:' + Date.now() + '@convida.ai','DTSTAMP:' + z(new Date()),'DTSTART:' + z(dt),'DTEND:' + z(end),
    'SUMMARY:' + esc(f.titulo + ' — ' + f.formando),'LOCATION:' + esc((f.local||'') + ', ' + (f.endereco||'')),
    'DESCRIPTION:' + esc(f.mensagem),'END:VEVENT','END:VCALENDAR'].join('\r\n');
}

// ---------- som (Web Audio, sem assets) ----------
let AC = null;
function ensureAudio(muted) {
  if (muted) return null;
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function note(ac, f, s, dur, type, gv) {
  if (!ac) return;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'sine'; o.frequency.value = f;
  const t0 = ac.currentTime + s;
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gv || .2, t0 + .02);
  g.gain.exponentialRampToValueAtTime(.0007, t0 + dur);
  o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + dur + .05);
}
function slide(ac, f1, f2, s, dur, type, gv) {
  if (!ac) return;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'sawtooth';
  const t0 = ac.currentTime + s;
  o.frequency.setValueAtTime(f1, t0); o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(gv || .18, t0); g.gain.exponentialRampToValueAtTime(.0007, t0 + dur);
  o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + dur + .05);
}
export function playSound(k, muted) {
  const ac = ensureAudio(muted); if (!ac) return;
  if (k === 'party') { [523,659,784,1046].forEach((f,i)=>note(ac,f,i*.09,.5,'triangle',.2)); [784,988,1318].forEach(f=>note(ac,f,.5,.7,'sine',.11)); }
  else if (k === 'chime') { [1046,1568,2093].forEach((f,i)=>{ note(ac,f,i*.14,1.7,'sine',.13); note(ac,f*2,i*.14,1.1,'sine',.04); }); }
  else if (k === 'soft') { note(ac,660,0,.3,'sine',.16); note(ac,990,.11,.55,'sine',.14); }
  else if (k === 'retro') { [392,523,392,659,784].forEach((f,i)=>note(ac,f,i*.11,.16,'square',.13)); note(ac,1046,.55,.4,'square',.13); }
  else if (k === 'silly') { slide(ac,300,900,0,.35,'sawtooth',.17); slide(ac,900,320,.34,.28,'sawtooth',.15); [523,659,784].forEach((f,i)=>note(ac,f,.62+i*.08,.3,'square',.13)); }
  else if (k === 'sad') { [440,392,349,294].forEach((f,i)=>note(ac,f,i*.28,.55,'sawtooth',.15)); slide(ac,300,150,1.15,.7,'sine',.13); }
}

// ---------- confete (canvas) ----------
let raf = null;
export function stopConfetti(canvas) {
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  if (canvas) { const c = canvas.getContext('2d'); c && c.clearRect(0, 0, canvas.width, canvas.height); }
}
export function runConfetti(canvas, theme) {
  if (!canvas) return;
  const mode = theme.celeb;
  const dpr = Math.min(window.devicePixelRatio || 1, 2), W = canvas.clientWidth, H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
  const cols = [theme.accent, theme.accent2 || theme.accent, theme.ink];
  const emojis = ['🎉','🎊','🥳','🎓','🤩','🕺','✨'];
  let parts = [];
  const N = mode === 'pop' ? 24 : mode === 'shimmer' ? 48 : mode === 'emoji' ? 32 : 110;
  for (let i = 0; i < N; i++) {
    const up = mode === 'shimmer';
    parts.push({ x: Math.random()*W, y: up ? H+Math.random()*40 : -20-Math.random()*H*.4,
      vx: (Math.random()-.5)*(mode==='pop'?3:6), vy: up ? -(1+Math.random()*2.2) : (2+Math.random()*3.6),
      g: up?0:.11, s: mode==='emoji'?18+Math.random()*16:5+Math.random()*7, rot: Math.random()*6.28, vr:(Math.random()-.5)*.28,
      col: cols[i%cols.length], emo: emojis[i%emojis.length], age:0 });
  }
  if (mode === 'pop') parts.forEach(p => { p.x=W/2; p.y=H*.4; const a=Math.random()*6.28, sp=2+Math.random()*5; p.vx=Math.cos(a)*sp; p.vy=Math.sin(a)*sp-2; });
  let frame = 0;
  const draw = () => {
    ctx.clearRect(0,0,W,H); frame++;
    parts.forEach(p => {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.age++;
      const al = mode==='shimmer' ? Math.max(0,1-p.age/240) : (mode==='pop' ? Math.max(0,1-p.age/60) : 1);
      ctx.save(); ctx.globalAlpha=al; ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      if (mode==='emoji') { ctx.font=p.s+'px serif'; ctx.textAlign='center'; ctx.fillText(p.emo,0,0); }
      else if (mode==='shimmer') { ctx.fillStyle=p.col; ctx.shadowColor=p.col; ctx.shadowBlur=7; ctx.beginPath(); ctx.arc(0,0,p.s*.38,0,6.28); ctx.fill(); }
      else if (mode==='pixel') { ctx.fillStyle=p.col; ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s); }
      else if (mode==='pop') { ctx.fillStyle=p.col; ctx.beginPath(); ctx.arc(0,0,p.s*.5,0,6.28); ctx.fill(); }
      else { ctx.fillStyle=p.col; ctx.fillRect(-p.s/2,-p.s*.34,p.s,p.s*.68); }
      ctx.restore();
    });
    const done = (mode==='shimmer'||mode==='pop') ? frame>220 : (frame>90 && parts.every(p=>p.y>H+30));
    if (!done) raf = requestAnimationFrame(draw); else stopConfetti(canvas);
  };
  draw();
}

export const GLOBAL_CSS = `
*{box-sizing:border-box}
body{margin:0;background:#0c0b09;font-family:'Manrope',system-ui,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
a{color:inherit}
input,textarea,button,select{font-family:inherit}
textarea{resize:vertical}
input:focus,textarea:focus{outline:none;border-color:currentColor}
button{transition:transform .14s ease, opacity .14s ease, background .14s ease;cursor:pointer}
button:active{transform:scale(.975)}
::-webkit-scrollbar{width:9px;height:9px}
::-webkit-scrollbar-thumb{background:rgba(128,128,128,.32);border-radius:20px}
::placeholder{color:rgba(140,140,140,.7)}
@keyframes cai-hero{from{opacity:0;transform:translateY(16px);filter:blur(4px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}
@keyframes cai-fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes cai-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes cai-pop{0%{transform:scale(.7);opacity:0}62%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
@keyframes cai-grain{0%,100%{transform:translate(0,0)}50%{transform:translate(-2%,1%)}}
.cai-hero{animation:cai-hero .7s cubic-bezier(.2,.7,.15,1) both}
.cai-fu{animation:cai-fu .6s cubic-bezier(.2,.7,.15,1) both}
.cai-d1{animation-delay:.08s}.cai-d2{animation-delay:.16s}.cai-d3{animation-delay:.24s}.cai-d4{animation-delay:.32s}.cai-d5{animation-delay:.4s}
@media (prefers-reduced-motion: reduce){.cai-hero,.cai-fu,.cai-float{animation:none !important}}
`;
