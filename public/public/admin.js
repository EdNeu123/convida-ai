import {
  auth, db, doc, getDoc, setDoc, onSnapshot, query, orderBy, collection,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut
} from './firebase-init.js';
import { TEMPLATES, GLOBAL_CSS, downloadBlob } from './shared.js';

document.getElementById('global-css').textContent = GLOBAL_CSS + `
  .admin-input{width:100%;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.1);border-radius:11px;padding:11px 13px;color:#ece7dd;font-size:14px;font-weight:500}
  .admin-lbl{font-size:10.5px;font-weight:700;color:rgba(236,231,221,.52);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;display:block}
  .field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
`;

const app = document.getElementById('app');
const SA = '#ff7a4d';
const DEFAULT_F = {
  formando: '', titulo: 'Colação de Grau', mensagem: TEMPLATES.minimal.msg,
  data: '', hora: '19:30', local: '', endereco: '', dresscode: '', pixKey: '', deadline: ''
};

let user = null;
let invite = { tpl: 'minimal', f: { ...DEFAULT_F } };
let responses = [];
let ui = { tab: 'compose', saved: false, copied: false, copiedWa: false, loginErr: '', authMode: 'login' };
let INVITE_DOC = null;
let RSVP_COL = null;

function shell(bodyHtml) {
  const footerHtml = `<div style="text-align:center; padding: 24px 10px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 11.5px; color: rgba(236,231,221,0.5); width: 100%; max-width: 640px; margin: 20px auto 0;">
    Direitos reservados a Eduardo Passos &copy; 2026<br>
    <div style="margin-top: 10px; display: flex; justify-content: center; gap: 16px; font-weight: 700;">
      <a href="https://instagram.com/ed_newmann" target="_blank" style="text-decoration:none; color:inherit;">IG: @ed_newmann</a>
      <a href="https://linkedin.com/in/edu-neumann/" target="_blank" style="text-decoration:none; color:inherit;">LI: /in/edu-neumann/</a>
    </div>
  </div>`;

  app.innerHTML = `<div style="min-height:100vh;background:#0c0b09;color:#ece7dd;font-family:Manrope,sans-serif;display:flex;flex-direction:column;">
    <div style="flex:1;">${bodyHtml}</div>
    <div style="padding-bottom: 20px;">${footerHtml}</div>
  </div>`;
}

function renderLogin() {
  const isLogin = ui.authMode === 'login';
  shell(`
    <div style="display:flex;align-items:center;justify-content:center;padding:40px 20px 20px;height:100%;">
      <div style="width:100%;max-width:340px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:28px">
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:22px">
          <div style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#160c06;background:${SA};font-family:Archivo">C</div>
          <div><div style="font-weight:700;font-size:16px">Convida_Aí</div><div style="font-size:10.5px;color:rgba(236,231,221,.42);font-weight:600;text-transform:uppercase">painel do formando</div></div>
        </div>
        <div class="field"><label class="admin-lbl">E-mail</label><input id="l-email" type="email" class="admin-input" placeholder="voce@email.com"></div>
        <div class="field"><label class="admin-lbl">Senha</label><input id="l-pass" type="password" class="admin-input" placeholder="••••••••"></div>
        ${ui.loginErr ? `<div style="color:#ff8a80;font-size:12.5px;margin-bottom:12px">${ui.loginErr}</div>` : ''}
        <button id="l-submit" style="width:100%;background:${SA};color:#160c06;border:none;border-radius:11px;padding:13px;font-size:14px;font-weight:800">${isLogin ? 'Entrar' : 'Criar Conta'}</button>
        <button id="l-toggle" style="width:100%;background:none;color:${SA};border:none;margin-top:16px;font-size:13px;text-decoration:underline">${isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}</button>
      </div>
    </div>`);

  document.getElementById('l-submit').onclick = async () => {
    const email = document.getElementById('l-email').value.trim();
    const pass = document.getElementById('l-pass').value;
    ui.loginErr = '';
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, pass);
      else await createUserWithEmailAndPassword(auth, email, pass);
    } catch (e) {
      ui.loginErr = 'Erro na autenticação. Verifique os dados inseridos.';
      renderLogin();
    }
  };

  document.getElementById('l-toggle').onclick = () => {
    ui.authMode = isLogin ? 'signup' : 'login';
    ui.loginErr = '';
    renderLogin();
  };
}

function fieldRow(id, label, value, opts = {}) {
  const tag = opts.textarea ? 'textarea' : 'input';
  const attrs = opts.textarea ? `rows="${opts.rows||3}"` : `type="${opts.type||'text'}"`;
  const val = opts.textarea ? '' : `value="${escAttr(value)}"`;
  const content = opts.textarea ? esc(value) : '';
  return `<div class="field"><label class="admin-lbl">${label}</label><${tag} id="${id}" class="admin-input" ${attrs} ${val} placeholder="${opts.placeholder||''}">${content}</${tag}></div>`;
}

function renderDashboard() {
  const f = invite.f;
  const accepts = responses.filter(r => r.status === 'accept');
  const declines = responses.filter(r => r.status === 'decline');
  const link = window.location.origin + '/?u=' + user.uid;
  const tabOn = 'padding:8px 15px;border:none;border-radius:8px;font-size:13px;font-weight:700;background:'+SA+';color:#160c06';
  const tabOff = 'padding:8px 15px;border:none;border-radius:8px;font-size:13px;font-weight:700;background:transparent;color:rgba(236,231,221,.58)';
  
  const composeHtml = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      ${fieldRow('f-formando','Nome do formando', f.formando)}
      ${fieldRow('f-titulo','Título do evento', f.titulo)}
    </div>
    ${fieldRow('f-mensagem','Mensagem do convite', f.mensagem, {textarea:true, rows:4})}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      ${fieldRow('f-data','Data', f.data, {type:'date'})}
      ${fieldRow('f-hora','Hora', f.hora, {type:'time'})}
    </div>
    ${fieldRow('f-local','Local', f.local)}
    ${fieldRow('f-endereco','Endereço', f.endereco)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      ${fieldRow('f-dresscode','Traje', f.dresscode)}
      ${fieldRow('f-deadline','Confirmar até', f.deadline, {type:'date'})}
    </div>
    ${fieldRow('f-pix','Chave PIX (opcional - caixinha da festa)', f.pixKey)}
    <div class="field"><label class="admin-lbl">Tema visual</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${Object.keys(TEMPLATES).map(id => `<button data-tpl="${id}" style="padding:9px 16px;border-radius:10px;font-size:13.5px;font-weight:600;border:1px solid ${id===invite.tpl?SA:'rgba(255,255,255,.1)'};background:${id===invite.tpl?SA:'rgba(255,255,255,.04)'};color:${id===invite.tpl?'#160c06':'rgba(236,231,221,.72)'}">${TEMPLATES[id].label}</button>`).join('')}
      </div>
    </div>
    <button id="btn-save" style="width:100%;background:${SA};color:#160c06;border:none;border-radius:13px;padding:16px;font-size:15px;font-weight:800;margin-top:6px">${ui.saved?'Salvo ✓':'Salvar convite'}</button>
    
    <div style="margin-top:28px;padding-top:22px;border-top:1px solid rgba(255,255,255,.08)">
      <div class="admin-lbl">Link do convite (mande para todos os convidados)</div>
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <input readonly value="${link}" class="admin-input" style="flex:1">
        <button id="btn-copy" style="background:rgba(255,255,255,.06);color:#ece7dd;border:1px solid rgba(255,255,255,.12);border-radius:11px;padding:11px 15px;font-size:13px;font-weight:700;white-space:nowrap">${ui.copied?'Copiado ✓':'Copiar'}</button>
      </div>
      <button id="btn-wa" style="width:100%;background:#25d366;color:#04310f;border:none;border-radius:11px;padding:12px;font-size:13.5px;font-weight:800">${ui.copiedWa?'Texto copiado ✓':'Copiar texto para WhatsApp'}</button>
    </div>`;
    
  const responsesHtml = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:20px">
      <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px"><div style="font-size:28px;font-weight:800">${responses.length}</div><div style="font-size:12px;color:rgba(236,231,221,.5);font-weight:600;margin-top:6px">Total</div></div>
      <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px"><div style="font-size:28px;font-weight:800;color:#5bd08a">${accepts.length}</div><div style="font-size:12px;color:rgba(236,231,221,.5);font-weight:600;margin-top:6px">Confirmados</div></div>
      <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px"><div style="font-size:28px;font-weight:800;color:#e88">${declines.length}</div><div style="font-size:12px;color:rgba(236,231,221,.5);font-weight:600;margin-top:6px">Não</div></div>
    </div>
    <button id="btn-csv" style="background:rgba(255,255,255,.06);color:#ece7dd;border:1px solid rgba(255,255,255,.12);border-radius:11px;padding:10px 16px;font-size:13px;font-weight:700;margin-bottom:16px">Exportar CSV</button>
    <div>${responses.length ? responses.map(r => {
      const acc = r.status === 'accept';
      const dt = r.ts && r.ts.toDate ? r.ts.toDate() : new Date();
      const hh = String(dt.getHours()).padStart(2,'0')+':'+String(dt.getMinutes()).padStart(2,'0');
      return `<div style="display:flex;align-items:center;gap:13px;padding:14px 4px;border-bottom:1px solid rgba(255,255,255,.06)">
        <div style="width:8px;height:8px;border-radius:50%;flex:none;background:${acc?'#5bd08a':'#e88'}"></div>
        <div style="flex:1;min-width:0"><div style="font-weight:600">${esc(r.name)}</div>${r.recado?`<div style="font-size:12.5px;color:rgba(236,231,221,.55);margin-top:2px">${esc(r.recado)}</div>`:''}</div>
        <div style="font-size:11px;font-weight:700;padding:4px 11px;border-radius:20px;background:${acc?'rgba(91,208,138,.13)':'rgba(238,136,136,.13)'};color:${acc?'#5bd08a':'#e88'}">${acc?'Confirmado':'Não vai'}</div>
        <div style="font-size:11px;color:rgba(236,231,221,.4)">${hh}</div>
      </div>`;
    }).join('') : '<div style="color:rgba(236,231,221,.4);font-size:13.5px;padding:20px 0">Nenhuma resposta ainda.</div>'}</div>`;

  shell(`
    <div style="display:flex;align-items:center;gap:18px;padding:15px 26px;border-bottom:1px solid rgba(255,255,255,.07);position:sticky;top:0;background:rgba(12,11,9,.92);backdrop-filter:blur(16px);z-index:30">
      <div style="display:flex;align-items:center;gap:11px">
        <div style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#160c06;background:${SA};font-family:Archivo">C</div>
        <div><div style="font-weight:700;font-size:16px">Convida_Aí</div><div style="font-size:10.5px;color:rgba(236,231,221,.42);font-weight:600;text-transform:uppercase">painel do formando</div></div>
      </div>
      <div style="display:flex;gap:2px;margin-left:14px;background:rgba(255,255,255,.045);padding:3px;border-radius:11px;border:1px solid rgba(255,255,255,.06)">
        <button id="tab-compose" style="${ui.tab==='compose'?tabOn:tabOff}">Compor</button>
        <button id="tab-responses" style="${ui.tab==='responses'?tabOn:tabOff}">Respostas <span style="background:rgba(255,255,255,.1);border-radius:20px;padding:1px 6px;font-size:10.5px">${responses.length}</span></button>
      </div>
      <button id="btn-logout" style="margin-left:auto;background:none;border:1px solid rgba(255,255,255,.12);color:rgba(236,231,221,.6);border-radius:9px;padding:8px 13px;font-size:12.5px;font-weight:600">Sair</button>
    </div>
    <div style="max-width:640px;margin:0 auto;padding:30px 22px 40px">
      ${ui.tab === 'compose' ? composeHtml : responsesHtml}
    </div>`);

  if (ui.tab === 'compose') {
    document.querySelectorAll('[data-tpl]').forEach(b => b.onclick = () => { invite.tpl = b.dataset.tpl; renderDashboard(); });
    document.getElementById('btn-save').onclick = async () => {
      const g = id => document.getElementById(id).value;
      invite.f = { formando:g('f-formando'), titulo:g('f-titulo'), mensagem:g('f-mensagem'), data:g('f-data'), hora:g('f-hora'),
        local:g('f-local'), endereco:g('f-endereco'), dresscode:g('f-dresscode'), pixKey:g('f-pix'), deadline:g('f-deadline') };
      await setDoc(INVITE_DOC, { tpl: invite.tpl, f: invite.f }, { merge: true });
      ui.saved = true; renderDashboard(); setTimeout(() => { ui.saved = false; renderDashboard(); }, 1500);
    };
    document.getElementById('btn-copy').onclick = () => { navigator.clipboard.writeText(link).catch(()=>{}); ui.copied = true; renderDashboard(); setTimeout(()=>{ui.copied=false;renderDashboard();},1500); };
    document.getElementById('btn-wa').onclick = () => {
      const txt = (f.formando||'')+' está te convidando para a '+(f.titulo||'')+'.\n'+link;
      navigator.clipboard.writeText(txt).catch(()=>{}); ui.copiedWa = true; renderDashboard(); setTimeout(()=>{ui.copiedWa=false;renderDashboard();},1600);
    };
    document.getElementById('tab-responses').onclick = () => { ui.tab='responses'; renderDashboard(); };
  } else {
    document.getElementById('tab-compose').onclick = () => { ui.tab='compose'; renderDashboard(); };
    document.getElementById('btn-csv').onclick = () => {
      const rows = [['Nome','Status','Recado','Data/hora']].concat(responses.map(r => {
        const dt = r.ts && r.ts.toDate ? r.ts.toDate() : new Date();
        return [r.name, r.status==='accept'?'Confirmado':'Nao vai', r.recado||'', dt.toLocaleString('pt-BR')];
      }));
      const csv = rows.map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\r\n');
      downloadBlob(new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8'}), 'confirmados.csv');
    };
  }
  document.getElementById('btn-logout').onclick = () => signOut(auth);
}

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escAttr(s) { return esc(s); }

onAuthStateChanged(auth, async (u) => {
  user = u;
  if (!user) { renderLogin(); return; }
  
  INVITE_DOC = doc(db, 'invites', user.uid);
  RSVP_COL = collection(db, 'invites', user.uid, 'rsvps');
  
  const snap = await getDoc(INVITE_DOC);
  if (snap.exists()) invite = { tpl: 'minimal', f: { ...DEFAULT_F }, ...snap.data() };
  onSnapshot(query(RSVP_COL, orderBy('ts','desc')), s => { responses = s.docs.map(d => d.data()); if (user) renderDashboard(); });
  
  renderDashboard();
});
