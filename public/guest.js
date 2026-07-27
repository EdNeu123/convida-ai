import { db, doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, INVITE_DOC, RSVP_COL } from './firebase-init.js';
import { TEMPLATES, GLOBAL_CSS, fmtDate, fmtShort, first, buildICS, downloadBlob, playSound, runConfetti, stopConfetti } from './shared.js';

document.getElementById('global-css').textContent = GLOBAL_CSS;
const app = document.getElementById('app');
const canvas = document.getElementById('confetti-canvas');
const muteBtn = document.getElementById('mute-btn');

let invite = null;      // dados do convite (f) vindos do Firestore
let responses = [];     // rsvps (para "prova social")
let state = { stage: 'invite', guestName: '', recado: '', muted: false, cd: { d:'--',h:'--',m:'--',s:'--' }, hasCd: false, sending: false };

function t() { return TEMPLATES[invite.tpl] || TEMPLATES.minimal; }

function updateCd() {
  const hadCd = state.hasCd;
  if (!invite || !invite.f || !invite.f.data) { state.hasCd = false; if (hadCd) render(); return; }
  const target = new Date(invite.f.data + 'T' + (invite.f.hora || '19:00') + ':00').getTime();
  if (isNaN(target)) { state.hasCd = false; if (hadCd) render(); return; }
  let s = Math.floor((target - Date.now()) / 1000); if (s < 0) s = 0;
  const d = Math.floor(s/86400), h = Math.floor(s%86400/3600), m = Math.floor(s%3600/60), sec = s%60;
  const p = n => String(n).padStart(2,'0');
  state.hasCd = true; state.cd = { d:String(d), h:p(h), m:p(m), s:p(sec) };
  // Se o bloco do contador já está na tela, só atualiza os números (sem redesenhar tudo,
  // pra não replicar a animação de entrada do cartão a cada segundo).
  const el = document.getElementById('cd-d');
  if (el && hadCd) {
    Object.keys(state.cd).forEach(k => { const n = document.getElementById('cd-'+k); if (n) n.textContent = state.cd[k]; });
  } else {
    render();
  }
}

async function submitAccept() {
  if (state.sending) return;
  const name = (state.guestName || '').trim() || 'Convidado(a)';
  state.sending = true;
  try {
    await addDoc(RSVP_COL, { name, status: 'accept', recado: state.recado || '', ts: serverTimestamp() });
    state.stage = 'celebrate'; state.sending = false;
    playSound(t().sound, state.muted); render();
    requestAnimationFrame(() => runConfetti(canvas, t()));
  } catch (e) {
    state.sending = false;
    alert('Não consegui enviar sua confirmação agora. Tenta de novo em instantes.');
    render();
  }
}
async function submitDecline() {
  try { await addDoc(RSVP_COL, { name: (state.guestName||'').trim()||'Convidado(a)', status: 'decline', recado: '', ts: serverTimestamp() }); } catch(e) {}
  state.stage = 'decline'; playSound('sad', state.muted); render();
}

function render() {
  if (!invite) { app.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;color:#7c766a;font-family:Manrope,sans-serif;font-size:14px">Convite ainda não foi publicado.</div>'; return; }
  const th = t(), f = invite.f, nameFam = th.display, bodyFam = th.font, tpl = invite.tpl;
  const overText = (tpl === 'divertido') ? 'Você. Está. Convidado.' : 'Você está convidado(a) para';
  const accepts = responses.filter(r => r.status === 'accept');
  const proofNames = accepts.map(r => first(r.name)).filter(Boolean);
  let proofLabel = '';
  if (proofNames.length === 1) proofLabel = proofNames[0] + ' já confirmou presença';
  else if (proofNames.length === 2) proofLabel = proofNames[0] + ' e ' + proofNames[1] + ' já confirmaram';
  else if (proofNames.length > 2) proofLabel = proofNames[0] + ', ' + proofNames[1] + ' e mais ' + (proofNames.length-2) + ' já confirmaram';

  const cardGrain = th.grain === 'grain'
    ? 'position:absolute;inset:-20%;pointer-events:none;opacity:.5;background-image:radial-gradient(rgba(56,39,26,.16) 1px, transparent 1.4px);background-size:4px 4px;animation:cai-grain 4s steps(2) infinite'
    : 'position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 60% at 50% 0%, '+th.accent+'14, transparent 55%)';
  const btnPrimary = 'width:100%;border:none;border-radius:13px;padding:17px;font-size:15.5px;font-weight:700;letter-spacing:.01em;font-family:'+bodyFam+';background:'+th.btnP[0]+';color:'+th.btnP[1];
  const btnSecondary = 'width:100%;background:transparent;border:1px solid '+th.lineStrong+';border-radius:13px;padding:15px;font-size:14px;font-weight:600;color:'+th.sub+';font-family:'+bodyFam;
  const guestInput = 'width:100%;background:'+th.accent+'0d;border:1px solid '+th.line+';border-radius:12px;padding:14px;font-size:15px;color:'+th.ink+';font-family:'+bodyFam;
  const textBtn = 'background:none;border:none;color:'+th.sub+';font-size:13px;margin-top:12px;text-decoration:underline;font-family:'+bodyFam;

  document.body.style.background = 'transparent';
  muteBtn.style.display = 'block';
  muteBtn.textContent = state.muted ? 'áudio desligado' : 'áudio ligado';
  muteBtn.onclick = () => { state.muted = !state.muted; render(); };

  let inner = '';
  if (state.stage === 'invite') {
    const details = [
      { label:'Quando', value: fmtDate(f.data), sub: f.hora, hasSub: !!f.hora },
      { label:'Onde', value: f.local, sub: f.endereco, hasSub: !!f.endereco },
      { label:'Traje', value: f.dresscode, sub: '', hasSub: false },
    ];
    inner = `
      <div class="cai-fu" style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.22em;color:${th.accent};font-family:${bodyFam}">${overText}</div>
      <h1 class="cai-hero" style="font-family:${nameFam};font-weight:${th.nameW};font-size:clamp(46px,13vw,66px);line-height:.98;color:${th.ink};margin:14px 0 12px;text-transform:${th.nameCase};letter-spacing:${th.nameTrack}">${esc(f.formando)}</h1>
      <div class="cai-fu cai-d1" style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.18em;color:${th.sub};font-family:${bodyFam}">${esc(f.titulo)}</div>
      ${f.deadline ? `<div class="cai-fu cai-d1" style="font-size:12px;font-weight:700;color:${th.accent};margin-top:10px;font-family:${bodyFam}">Confirme sua presença até ${fmtShort(f.deadline)}</div>` : ''}
      <div class="cai-fu cai-d2" style="height:1px;background:${th.line};margin:26px 0 24px;width:100%"></div>
      <p class="cai-fu cai-d2" style="font-size:${tpl==='elegante'?'20px':'16px'};line-height:1.7;color:${th.ink};opacity:.9;font-family:${bodyFam};font-weight:${tpl==='elegante'?'500':'400'}">${esc(f.mensagem)}</p>
      <div class="cai-fu cai-d3" style="width:100%">
        ${details.map(d=>`<div style="display:flex;justify-content:space-between;align-items:baseline;gap:18px;padding:15px 0;border-top:1px solid ${th.line}">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:${th.sub};font-family:${bodyFam}">${d.label}</div>
          <div style="text-align:right"><div style="font-size:16px;font-weight:700;color:${th.ink};font-family:${bodyFam}">${esc(d.value||'')}</div>
          ${d.hasSub?`<div style="font-size:12.5px;color:${th.sub};margin-top:2px;font-family:${bodyFam};max-width:210px">${esc(d.sub)}</div>`:''}</div></div>`).join('')}
      </div>
      ${state.hasCd ? `<div class="cai-fu cai-d3" style="display:flex;align-items:center;justify-content:space-between;width:100%;margin-top:26px;padding:18px 4px;border-top:1px solid ${th.line};border-bottom:1px solid ${th.line}">
        ${['d','h','m','s'].map((k,i)=>`${i>0?`<div style="width:1px;height:30px;background:${th.line}"></div>`:''}<div style="display:flex;flex-direction:column;align-items:center;flex:1">
        <div id="cd-${k}" style="font-family:${nameFam};font-weight:${tpl==='elegante'?600:700};font-size:30px;color:${th.ink};font-variant-numeric:tabular-nums">${state.cd[k]}</div>
        <div style="font-size:9.5px;text-transform:uppercase;letter-spacing:.14em;color:${th.sub};font-weight:700;margin-top:6px;font-family:${bodyFam}">${ {d:'dias',h:'horas',m:'min',s:'seg'}[k] }</div></div>`).join('')}
      </div>` : ''}
      <button id="btn-maps" class="cai-fu cai-d4" style="position:relative;display:block;width:100%;height:104px;border-radius:14px;overflow:hidden;margin-top:26px;border:1px solid ${th.line};background:${th.accent}0c;padding:0">
        <div style="position:absolute;inset:0;background-image:linear-gradient(${th.line} 1px,transparent 1px),linear-gradient(90deg,${th.line} 1px,transparent 1px);background-size:26px 26px;opacity:.7"></div>
        <div style="position:absolute;top:10px;right:10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${th.ink};background:${th.pageBg}d9;padding:5px 9px;border-radius:20px;border:1px solid ${th.line};font-family:${bodyFam}">Como chegar →</div>
        <div style="position:absolute;bottom:0;left:0;right:0;font-family:monospace;font-size:10.5px;padding:8px 12px;background:${th.pageBg};color:${th.sub};border-top:1px solid ${th.line};text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(f.endereco||'')}</div>
      </button>
      ${f.pixKey ? `<div class="cai-fu cai-d4" style="display:flex;align-items:center;gap:14px;width:100%;margin-top:22px;padding:15px 17px;border-radius:14px;border:1px dashed ${th.lineStrong};background:${th.accent}0a">
        <div style="flex:1;min-width:0"><div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:${th.accent};font-family:${bodyFam}">Caixinha da festa</div>
        <div style="font-family:monospace;font-size:14px;color:${th.ink};margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(f.pixKey)}</div></div>
        <button id="btn-pix" style="flex:none;background:${th.btnP[0]};color:${th.btnP[1]};border:none;border-radius:9px;padding:10px 14px;font-size:12.5px;font-weight:700;font-family:${bodyFam}">Copiar</button>
      </div>` : ''}
      ${proofNames.length ? `<div class="cai-fu cai-d5" style="display:flex;align-items:center;gap:11px;width:100%;margin-top:24px">
        <div style="display:flex">${accepts.slice(0,3).map((r,i)=>`<div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:${th.btnP[1]};background:${th.accent};border:2px solid ${(tpl==='minimal'||tpl==='retro')?th.pageBg:'#0d0b07'};margin-left:${i===0?'0':'-9px'};font-family:'Archivo'">${esc(first(r.name).slice(0,1).toUpperCase())}</div>`).join('')}</div>
        <div style="font-size:13px;font-weight:600;color:${th.sub};font-family:${bodyFam}">${proofLabel}</div>
      </div>` : ''}
      <div class="cai-fu cai-d5" style="display:flex;flex-direction:column;gap:10px;width:100%;margin-top:18px">
        <button id="btn-accept" style="${btnPrimary}">Aceito o convite</button>
        <button id="btn-decline" style="${btnSecondary}">Infelizmente não poderei ir</button>
      </div>
      <div style="display:flex;gap:20px;justify-content:center;width:100%;margin-top:16px">
        <button id="btn-cal" style="background:none;border:none;color:${th.sub};font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;font-family:${bodyFam};border-bottom:1px solid ${th.line};padding:2px 0">Adicionar à agenda</button>
        <button id="btn-maps2" style="background:none;border:none;color:${th.sub};font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;font-family:${bodyFam};border-bottom:1px solid ${th.line};padding:2px 0">Como chegar</button>
      </div>`;
  } else if (state.stage === 'form') {
    inner = `<div class="cai-fu" style="width:100%">
      <div style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.22em;color:${th.accent};font-family:${bodyFam}">Confirmar presença</div>
      <h2 style="font-family:${nameFam};font-weight:${th.nameW};font-size:30px;color:${th.ink};line-height:1.12;margin:12px 0 18px;text-transform:${th.nameCase}">Que alegria. Como é o seu nome?</h2>
      <input id="in-name" value="${esc(state.guestName)}" placeholder="Seu nome completo" style="${guestInput}">
      <textarea id="in-recado" rows="3" placeholder="Um recado pro formando (opcional)" style="${guestInput};margin-top:11px">${esc(state.recado)}</textarea>
      <button id="btn-submit" style="${btnPrimary};margin-top:18px">${state.sending?'Enviando…':'Confirmar meu sim'}</button>
      <button id="btn-back" style="${textBtn}">voltar</button>
    </div>`;
  } else if (state.stage === 'celebrate') {
    inner = `<div style="width:100%;text-align:center;display:flex;flex-direction:column;align-items:center">
      <div class="cai-fu" style="font-size:54px;color:${th.accent};margin-bottom:16px;animation:cai-pop .5s both, cai-float 2.6s ease-in-out .5s infinite">${th.celebIcon}</div>
      <div class="cai-fu cai-d1" style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.22em;color:${th.accent};font-family:${bodyFam}">Presença confirmada</div>
      <h2 class="cai-hero cai-d1" style="font-family:${nameFam};font-weight:${th.nameW};font-size:clamp(38px,10vw,52px);color:${th.ink};margin:12px 0 16px">${th.celebHead}</h2>
      <p class="cai-fu cai-d2" style="font-size:16px;line-height:1.65;color:${th.ink};opacity:.82;max-width:34ch;margin:0 auto 26px;font-family:${bodyFam}">${th.celebBody}</p>
      <button id="btn-cal2" style="${btnPrimary};max-width:300px">Adicionar à minha agenda</button>
      <button id="btn-reset" style="${textBtn}">ver o convite novamente</button>
    </div>`;
  } else if (state.stage === 'decline') {
    inner = `<div class="cai-fu" style="width:100%;text-align:center;display:flex;flex-direction:column;align-items:center">
      <div style="font-size:54px;color:${th.accent};opacity:.7">✧</div>
      <div style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.22em;color:${th.accent};font-family:${bodyFam}">Obrigado pelo retorno</div>
      <h2 style="font-family:${nameFam};font-weight:${th.nameW};font-size:clamp(38px,10vw,52px);color:${th.ink};margin:12px 0 16px">Vamos sentir sua falta</h2>
      <p style="font-size:16px;line-height:1.65;color:${th.ink};opacity:.82;max-width:34ch;margin:0 auto 26px;font-family:${bodyFam}">Agradeço de coração por avisar. Fica pra próxima, combinado? Um abraço apertado — e obrigado por tudo.</p>
      <button id="btn-reset2" style="${btnSecondary};max-width:280px;margin-top:6px">voltar ao convite</button>
    </div>`;
  }

  app.innerHTML = `<div style="min-height:100vh;width:100%;display:flex;align-items:flex-start;justify-content:center;position:relative;overflow-x:hidden;background:${th.pageBg};font-family:${bodyFam};color:${th.ink}">
    <div style="${cardGrain}"></div>
    <div style="position:relative;z-index:5;width:100%;max-width:452px;padding:80px 30px 82px;display:flex;flex-direction:column;align-items:flex-start">${inner}</div>
  </div>`;

  const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
  on('btn-accept','click',()=>{ state.stage='form'; render(); });
  on('btn-decline','click', submitDecline);
  on('btn-submit','click', submitAccept);
  on('btn-back','click',()=>{ state.stage='invite'; render(); });
  on('btn-reset','click',()=>{ stopConfetti(canvas); state.stage='invite'; state.guestName=''; state.recado=''; render(); });
  on('btn-reset2','click',()=>{ state.stage='invite'; render(); });
  on('in-name','input', e=>{ state.guestName = e.target.value; });
  on('in-recado','input', e=>{ state.recado = e.target.value; });
  ['btn-maps','btn-maps2'].forEach(id => on(id,'click', () => {
    const q = encodeURIComponent(f.endereco || f.local || '');
    window.open('https://www.google.com/maps/search/?api=1&query=' + q, '_blank');
  }));
  ['btn-cal','btn-cal2'].forEach(id => on(id,'click', () => {
    const ics = buildICS(f); if (ics) downloadBlob(new Blob([ics],{type:'text/calendar;charset=utf-8'}), 'formatura.ics');
  }));
  on('btn-pix','click', () => { try { navigator.clipboard.writeText(f.pixKey || ''); } catch(e){} });
}

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

async function init() {
  const snap = await getDoc(INVITE_DOC);
  if (snap.exists()) { invite = snap.data(); }
  onSnapshot(INVITE_DOC, s => { if (s.exists()) { invite = s.data(); render(); } });
  onSnapshot(query(RSVP_COL, orderBy('ts','desc')), s => { responses = s.docs.map(d => d.data()); render(); });
  setInterval(updateCd, 1000);
  updateCd();
  render();
}
init();
