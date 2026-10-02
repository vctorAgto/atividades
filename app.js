'use strict';
// Atividades da equipe — Victor, Vinicius e Paulo.
// Os dados ficam em data.json neste mesmo repositório (GitHub Pages + API de conteúdo do GitHub).

const CFG = { owner: 'vctorAgto', repo: 'atividades', branch: 'main', path: 'data.json' };
const API = `https://api.github.com/repos/${CFG.owner}/${CFG.repo}/contents/${CFG.path}`;

const PEOPLE = [
  { id: 'victor',   name: 'Victor',   full: 'Victor',         ini: 'VI', re: 'victor|vitor|vic' },
  { id: 'vinicius', name: 'Vinicius', full: 'Vinicius Titon', ini: 'VT', re: 'vinicius(?:\\s+titon)?|titon|vini' },
  { id: 'paulo',    name: 'Paulo',    full: 'Paulo Pecuch',   ini: 'PP', re: 'paulo(?:\\s+pecuch)?|pecuch' }
];
const PERSON = Object.fromEntries(PEOPLE.map(p => [p.id, p]));
const TYPES = { tarefa: 'Tarefa', atividade: 'Atividade', obs: 'Observação' };

/* ---------- Ícones ---------- */
const SV = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const I = {
  home: SV('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
  calendar: SV('<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>'),
  plus: SV('<path d="M12 5v14M5 12h14"/>'),
  note: SV('<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M9 12h6M9 16h4"/>'),
  users: SV('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M17 14.5c2.4 0 4 1.6 4.5 4.5"/>'),
  check: SV('<path d="M5 12.5 10 17 19 7.5" stroke-width="3"/>'),
  clock: SV('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  mic: SV('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'),
  send: SV('<path d="M5 12h13M13 6l6 6-6 6"/>'),
  x: SV('<path d="M6 6l12 12M18 6 6 18"/>'),
  left: SV('<path d="M15 5l-7 7 7 7"/>'),
  right: SV('<path d="M9 5l7 7-7 7"/>'),
  trash: SV('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  flag: SV('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
  task: SV('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
  face: SV('<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M9 9.5v1M15 9.5v1M12 9.5v3.5h-1M9.5 16c1.5 1 3.5 1 5 0"/>'),
  share: SV('<path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6"/>')
};

/* ---------- Utilidades ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => ymd(new Date());
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return ymd(d); };
const diffDays = (a, b) => Math.round((parseD(a) - parseD(b)) / 864e5);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const WDN = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MN = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function lsGet(k, def){ try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch(e){ return def; } }
function lsSet(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }

function relDay(s){
  if(!s) return 'Sem data';
  const d = diffDays(s, today());
  if(d === 0) return 'Hoje';
  if(d === 1) return 'Amanhã';
  if(d === -1) return 'Ontem';
  const dt = parseD(s);
  if(d > 1 && d < 7) return cap(WDN[dt.getDay()]);
  return dt.getDate() + ' ' + MN[dt.getMonth()].slice(0, 3) + (dt.getFullYear() !== new Date().getFullYear() ? ' ' + dt.getFullYear() : '');
}
function longDay(s){ const d = parseD(s); return cap(WDN[d.getDay()]) + ', ' + d.getDate() + ' de ' + MN[d.getMonth()]; }
function ago(ms){
  const m = Math.round((Date.now() - ms) / 60000);
  if(m < 1) return 'agora';
  if(m < 60) return 'há ' + m + ' min';
  const h = Math.round(m / 60);
  if(h < 24) return 'há ' + h + ' h';
  const d = Math.round(h / 24);
  return d === 1 ? 'ontem' : 'há ' + d + ' dias';
}
function initials(id){ return PERSON[id] ? PERSON[id].ini : '?'; }
function avatar(id, cls){ return `<span class="av ${id} ${cls || ''}" title="${esc(PERSON[id] ? PERSON[id].full : '')}">${initials(id)}</span>`; }
function avatars(who, cls){ return who && who.length ? `<span class="avs">${who.map(w => avatar(w, cls)).join('')}</span>` : ''; }

/* ---------- Estado ---------- */
const S = {
  items: lsGet('atv.items', []),
  people: lsGet('atv.people', {}), // { victor: { creds: [ids], u } } — de quem é cada rosto
  sha: null,
  me: lsGet('atv.me', null),
  key: lsGet('atv.key', ''),
  dirty: lsGet('atv.dirty', false),
  editVer: 0,
  sync: 'idle', syncMsg: '', lastSync: lsGet('atv.lastSync', null),
  view: lsGet('atv.view', 'hoje'),
  who: lsGet('atv.who', 'todos'),
  cal: null, day: today(),
  notesTab: 'obs',
  showAllLater: false
};
{ const d = new Date(); S.cal = { y: d.getFullYear(), m: d.getMonth() }; }

function persist(){ lsSet('atv.people', S.people); lsSet('atv.items', S.items); lsSet('atv.dirty', S.dirty); lsSet('atv.lastSync', S.lastSync); }
const live = () => S.items.filter(i => !i.deleted);
const byId = id => S.items.find(i => i.id === id);
function touch(it){ it.u = Date.now(); it.by = S.me; }

function matchWho(it, who){
  if(who === 'todos') return true;
  return !it.who || !it.who.length || it.who.includes(who);
}
function sortItems(list){
  return list.slice().sort((a, b) =>
    (a.done - b.done) ||
    (a.date || '9999').localeCompare(b.date || '9999') ||
    (a.time || '99').localeCompare(b.time || '99') ||
    ((b.priority === 'alta') - (a.priority === 'alta')) ||
    (a.c - b.c));
}

/* ---------- Sincronização com o GitHub ---------- */
function b64e(str){ const b = new TextEncoder().encode(str); let s = ''; for(let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }
function b64d(b64){ const bin = atob(b64.replace(/\n/g, '')); return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))); }

// Junta duas listas: para cada id fica a versão editada por último.
function merge(a, b){
  const map = new Map(a.map(i => [i.id, i]));
  for(const r of b){ const l = map.get(r.id); if(!l || (r.u || 0) > (l.u || 0)) map.set(r.id, r); }
  return [...map.values()];
}
function mergePeople(a, b){
  const out = Object.assign({}, a);
  for(const [id, v] of Object.entries(b || {})) if(!out[id] || (v.u || 0) > (out[id].u || 0)) out[id] = v;
  return out;
}
// Itens apagados ficam como "lápide" por 45 dias para os outros aparelhos saberem que foram apagados.
function prune(list){ const lim = Date.now() - 45 * 864e5; return list.filter(i => !i.deleted || (i.u || 0) > lim); }

async function fetchRemote(){
  if(S.key){
    const r = await fetch(`${API}?ref=${CFG.branch}&t=${Date.now()}`, {
      headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + S.key }, cache: 'no-store'
    });
    if(r.status === 404) return { sha: null, items: [], people: {} };
    if(r.status === 401){ S.key = ''; localStorage.removeItem('atv.key'); gate(); throw new Error('Chave inválida'); }
    if(r.status === 403) throw new Error('Chave sem permissão');
    if(!r.ok) throw new Error('GitHub respondeu ' + r.status);
    const j = await r.json();
    const data = JSON.parse(b64d(j.content));
    return { sha: j.sha, items: data.items || [], people: data.people || {} };
  }
  // Sem chave: só leitura, pelo arquivo publicado no GitHub Pages.
  const r = await fetch('./data.json?t=' + Date.now(), { cache: 'no-store' });
  if(!r.ok) throw new Error('Não consegui ler os dados');
  const j = await r.json();
  return { sha: null, items: j.items || [], people: j.people || {} };
}

let saving = false, saveAgain = false, saveTimer = null;
function changed(){
  S.dirty = true; S.editVer++; persist(); refresh();
  clearTimeout(saveTimer); saveTimer = setTimeout(push, 600);
}
async function push(){
  if(!S.key){ setSync('local'); return; }
  if(!S.dirty) return;
  if(saving){ saveAgain = true; return; }
  saving = true; setSync('saving');
  const ver = S.editVer;
  try{
    let ok = false;
    for(let i = 0; i < 4 && !ok; i++){
      const rem = await fetchRemote();
      S.items = merge(S.items, rem.items);
      S.people = mergePeople(S.people, rem.people);
      const payload = { version: 1, updatedAt: new Date().toISOString(), people: S.people, items: prune(S.items) };
      const body = {
        message: `${PERSON[S.me] ? PERSON[S.me].name : 'Alguém'} atualizou as atividades`,
        content: b64e(JSON.stringify(payload, null, 1)), branch: CFG.branch
      };
      if(rem.sha) body.sha = rem.sha;
      const r = await fetch(API, {
        method: 'PUT',
        headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + S.key, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if(r.ok){ ok = true; break; }
      if(r.status === 409 || r.status === 422) continue; // alguém salvou junto: busca de novo e tenta outra vez
      if(r.status === 401 || r.status === 403) throw new Error('Chave inválida ou sem permissão');
      throw new Error('GitHub respondeu ' + r.status);
    }
    if(!ok) throw new Error('Conflito ao salvar, tentando de novo já já');
    if(S.editVer === ver) S.dirty = false;
    S.lastSync = Date.now();
    setSync('ok');
  }catch(e){
    setSync('error', e.message);
  }finally{
    saving = false; persist(); refresh();
    if(saveAgain || S.dirty && S.sync !== 'error'){ saveAgain = false; if(S.dirty) setTimeout(push, 300); }
  }
}
async function pull(){
  if(saving) return;
  try{
    const rem = await fetchRemote();
    const before = JSON.stringify(S.items);
    S.items = merge(S.items, rem.items);
    S.people = mergePeople(S.people, rem.people);
    S.lastSync = Date.now();
    persist();
    if(JSON.stringify(S.items) !== before) refresh();
    if(S.dirty && S.key) push(); else setSync(S.key ? 'ok' : 'local');
  }catch(e){
    setSync(navigator.onLine === false ? 'error' : 'error', navigator.onLine === false ? 'Sem internet' : e.message);
  }
}
function setSync(state, msg){
  S.sync = state; S.syncMsg = msg || '';
  const el = $('#syncPill');
  el.className = 'sync-pill ' + state;
  el.querySelector('.txt').textContent =
    state === 'saving' ? 'Salvando' :
    state === 'error' ? (msg === 'Sem internet' ? 'Offline' : 'Erro') :
    state === 'local' ? 'Só leitura' :
    state === 'ok' ? 'Em dia' : '…';
}

/* ---------- Entendendo o texto falado/escrito ---------- */
// "amanhã às 14h reunião com cliente @paulo urgente" -> data, hora, responsável, prioridade.
function parseQuick(raw){
  let t = ' ' + raw + ' ';
  // Versão sem acentos e minúscula com o MESMO tamanho, para os índices baterem com o texto original.
  let n = t.split('').map(c => (c.normalize('NFD')[0] || c).toLowerCase()).join('');
  const res = { title: '', date: null, time: null, who: [], priority: 'normal', type: null };
  const take = re => {
    const m = re.exec(n);
    if(!m) return null;
    const blank = ' '.repeat(m[0].length);
    t = t.slice(0, m.index) + blank + t.slice(m.index + m[0].length);
    n = n.slice(0, m.index) + blank + n.slice(m.index + m[0].length);
    return m;
  };
  const T = today();

  if(take(/^\s*(obs|observacao|nota|anotacao|anotar)\b\s*[:\-,]?/)) res.type = 'obs';
  else if(take(/^\s*(tarefa)\b(?!\s+(?:do|pro|pra|para)\s)\s*[:\-,]?/)) res.type = 'tarefa';
  else if(take(/^\s*(atividade|compromisso|evento)\b\s*[:\-,]?/)) res.type = 'atividade';
  take(/^\s*(lembrar de|lembrete|me lembra de|lembra de)\b\s*[:\-,]?/);

  if(take(/\b(urgente|urgencia|importante|prioridade alta|prioritario)\b|!+/)) res.priority = 'alta';

  // Pessoas: "@paulo", "Paulo: ...", "pro Paulo fazer", "responsável Paulo", "pra todos".
  if(take(/(?:@|\b(?:pra|para|pro)\s+)(?:todos|todo mundo|equipe|galera)\b|\btodo mundo\b/)) res.who = PEOPLE.map(p => p.id);
  for(const p of PEOPLE){
    const nm = `(?:${p.re})`;
    const pats = [
      new RegExp(`@${nm}\\b`),
      new RegExp(`^\\s*${nm}\\s*[:,\\-]`),
      new RegExp(`\\b(?:responsavel|resp)\\s*:?\\s*(?:e\\s+)?(?:o\\s+)?${nm}\\b`),
      new RegExp(`\\b(?:tarefa|atividade)\\s+(?:do|pro|pra|para o)\\s+${nm}\\b`),
      new RegExp(`\\b(?:pro|pra|para o)\\s+${nm}\\s+(?=fazer|ver|resolver|cuidar|olhar|verificar|mandar|enviar|ligar)`)
    ];
    for(const re of pats) if(take(re)){ if(!res.who.includes(p.id)) res.who.push(p.id); }
  }

  // Hora
  let m;
  if((m = take(/\b(?:as\s+|a\s+)?(\d{1,2})[:h](\d{2})\b/))) res.time = pad(+m[1]) + ':' + m[2];
  else if((m = take(/\b(?:as\s+|a\s+)?(\d{1,2})\s*(?:h|hs|hrs|horas?)\b/))) res.time = pad(+m[1]) + ':00';
  else if((m = take(/\bas\s+(\d{1,2})\b(?![\/\d])/))) res.time = pad(+m[1]) + ':00';
  else if(take(/\b(?:ao\s+|as\s+|a\s+)?meio[\s-]dia\b/)) res.time = '12:00';
  if((m = take(/\b(?:de|da|pela|a|na|hoje a)\s+(manha|tarde|noite)\b/))){
    const per = m[1];
    if(res.time){
      const h = +res.time.slice(0, 2);
      if((per === 'tarde' || per === 'noite') && h < 12) res.time = pad(h + 12) + res.time.slice(2);
    } else res.time = per === 'manha' ? '09:00' : per === 'tarde' ? '14:00' : '19:00';
  }
  if(res.time && +res.time.slice(0, 2) > 23) res.time = null;

  // Data
  if(take(/\bdepois de amanha\b/)) res.date = addDays(T, 2);
  else if(take(/\bamanha\b/)) res.date = addDays(T, 1);
  else if(take(/\bhoje\b/)) res.date = T;
  else if((m = take(/\b(?:em|daqui a|daqui)\s+(\d{1,2})\s+dias?\b/))) res.date = addDays(T, +m[1]);
  else if(take(/\b(?:(?:na|a)\s+)?(?:semana que vem|proxima semana)\b/)){
    const d = new Date(); const off = ((8 - d.getDay()) % 7) || 7; res.date = addDays(T, off);
  }
  else if((m = take(/\b(?:dia\s+)?(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/))){
    const now = new Date();
    let y = m[3] ? +m[3] : now.getFullYear(); if(y < 100) y += 2000;
    let dt = new Date(y, +m[2] - 1, +m[1]);
    if(!m[3] && ymd(dt) < T) dt = new Date(y + 1, +m[2] - 1, +m[1]);
    if(!isNaN(dt)) res.date = ymd(dt);
  }
  else if((m = take(/\bdia\s+(\d{1,2})\b/))){
    const now = new Date(); const dd = +m[1];
    if(dd >= 1 && dd <= 31){
      let dt = new Date(now.getFullYear(), now.getMonth(), dd);
      if(ymd(dt) < T) dt = new Date(now.getFullYear(), now.getMonth() + 1, dd);
      res.date = ymd(dt);
    }
  }
  else if((m = take(/\b(?:(?:na|no|nesta|nessa|neste|nesse|esta|essa|proxima|proximo|ate)\s+)*(domingo|segunda|terca|quarta|quinta|sexta|sabado)(?:[\s-]feira)?(\s+que\s+vem)?\b/))){
    const wd = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'].indexOf(m[1]);
    let off = (wd - new Date().getDay() + 7) % 7;
    if(off === 0 && (/proxim/.test(m[0]) || m[2])) off = 7;
    res.date = addDays(T, off);
  }
  if(res.time && !res.date) res.date = T;

  res.title = t.replace(/\s+/g, ' ').trim()
    .replace(/^[\s,;:.\-–]+|[\s,;:\-–]+$/g, '')
    .replace(/\s+(?:de|da|do|com|para|pra|pro|no|na|e|as|às)$/i, '')
    .trim();
  res.title = res.title ? cap(res.title) : '';
  if(!res.type) res.type = res.time ? 'atividade' : 'tarefa';
  // Sem data falada/escrita: fica para hoje (dá para mudar depois).
  if(!res.date && res.type !== 'obs') res.date = T;
  return res;
}

/* ---------- Voz ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;
function startVoice(btn, onText, onDone){
  if(!SR){ toast('Seu navegador não tem ditado aqui. Use o microfone do teclado.'); return; }
  if(rec){ rec.stop(); return; }
  rec = new SR();
  rec.lang = 'pt-BR'; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
  btn.classList.add('listening');
  rec.onresult = e => { let s = ''; for(const r of e.results) s += r[0].transcript; onText(s); };
  rec.onerror = e => { if(e.error === 'not-allowed') toast('Libere o microfone para usar a voz.'); };
  rec.onend = () => { btn.classList.remove('listening'); rec = null; onDone && onDone(); };
  try { rec.start(); } catch(e){ btn.classList.remove('listening'); rec = null; }
}

/* ---------- Componentes ---------- */
function itemClass(it){
  const w = it.who || [];
  return ['item', 't-' + it.type, it.done ? 'done' : '', it.priority === 'alta' ? 'urg' : '',
    w.length === 1 ? w[0] : w.length > 1 ? 'multi' : ''].join(' ');
}
function metaTags(it, opts){
  opts = opts || {};
  const T = today(), tags = [];
  if(it.type === 'obs') tags.push(`<span class="tag obs">${I.note}Obs</span>`);
  if(it.date && !opts.hideDate){
    const late = !it.done && it.date < T;
    tags.push(`<span class="tag ${late ? 'late' : it.date === T ? 'today' : ''}">${I.calendar}${late ? 'Atrasada · ' : ''}${relDay(it.date)}</span>`);
  }
  if(it.time) tags.push(`<span class="tag time">${I.clock}${it.time}${it.date === T && !it.done ? untilTxt(it.time) : ''}</span>`);
  if(it.priority === 'alta') tags.push(`<span class="tag urg">${I.flag}Urgente</span>`);
  if(it.done && it.doneBy) tags.push(`<span class="tag ok">${I.check}${esc(PERSON[it.doneBy] ? PERSON[it.doneBy].name : '')} ${it.doneAt ? ago(it.doneAt) : ''}</span>`);
  return tags.join('');
}
function untilTxt(time){
  const [h, m] = time.split(':').map(Number);
  const now = new Date(); const t = new Date(); t.setHours(h, m, 0, 0);
  const min = Math.round((t - now) / 60000);
  if(min > 0 && min <= 90) return ' · em ' + min + ' min';
  if(min <= 0 && min > -60) return ' · agora';
  return '';
}
function itemHTML(it, opts){
  const left = it.type === 'obs'
    ? `<span class="noteic">${I.note}</span>`
    : `<button class="check" data-act="toggle" data-id="${it.id}" aria-label="Concluir">${I.check}</button>`;
  return `<div class="${itemClass(it)}" data-id="${it.id}">
    ${left}
    <div class="ibody" data-act="open" data-id="${it.id}">
      <div class="ititle">${esc(it.title)}</div>
      ${it.notes ? `<div class="inotes">${esc(it.notes)}</div>` : ''}
      <div class="imeta">${metaTags(it, opts)}</div>
    </div>
    ${avatars(it.who, 'sm')}
  </div>`;
}
function section(title, list, cls, opts){
  if(!list.length) return '';
  opts = opts || {};
  const shown = opts.limit ? list.slice(0, opts.limit) : list;
  return `<section class="sec sec-${cls || ''} ${cls || ''}" id="sec-${cls || ''}">
    <div class="sec-title"><h3>${title}</h3><small>${opts.sub || list.length}</small></div>
    <div class="list">${shown.map(i => itemHTML(i, opts)).join('')}
      ${opts.limit && list.length > opts.limit ? `<button class="more" data-act="${opts.moreAct}">Ver mais ${list.length - opts.limit}</button>` : ''}
    </div>
  </section>`;
}
function filtersHTML(){
  const pend = live().filter(i => !i.done && i.type !== 'obs');
  const cnt = w => pend.filter(i => matchWho(i, w)).length;
  return `<div class="filters">
    <button class="fchip all ${S.who === 'todos' ? 'on' : ''}" data-act="who" data-who="todos">Todos <span class="cnt">${pend.length}</span></button>
    ${PEOPLE.map(p => `<button class="fchip ${S.who === p.id ? 'on' : ''}" data-act="who" data-who="${p.id}">${avatar(p.id)}${p.name}${p.id === S.me ? ' (eu)' : ''} <span class="cnt">${cnt(p.id)}</span></button>`).join('')}
  </div>`;
}

/* ---------- Telas ---------- */
const TITLES = { hoje: 'Hoje', agenda: 'Agenda', notas: 'Notas', equipe: 'Equipe' };

function renderView(){
  $('#viewTitle').textContent = TITLES[S.view];
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.view === S.view));
  const v = $('#view');
  if(S.view === 'hoje'){
    v.innerHTML = `
      <div class="quick">
        <div class="qrow">
          <input id="qIn" type="text" enterkeyhint="done" autocomplete="off" placeholder="O que precisa ser feito?">
          ${SR ? `<button class="roundbtn" id="qMic" aria-label="Falar">${I.mic}</button>` : ''}
          <button class="roundbtn primary" id="qGo" aria-label="Adicionar" disabled>${I.send}</button>
        </div>
        <div class="qprev" id="qPrev" hidden></div>
        <div class="qhint" id="qHint">Ex.: <i>sábado 8h limpeza do salão @paulo</i> · <i>obs: trocar lâmpada da entrada</i></div>
      </div>
      <div id="homeBody"></div>`;
    bindQuick();
  } else v.innerHTML = '<div id="homeBody"></div>';
  refresh();
  window.scrollTo(0, 0);
}

function refresh(){
  const body = $('#homeBody');
  if(!body) return;
  $('#meBtn').innerHTML = S.me ? avatar(S.me) : `<span class="av">?</span>`;
  if(S.view === 'hoje') body.innerHTML = homeHTML();
  else if(S.view === 'agenda') body.innerHTML = agendaHTML();
  else if(S.view === 'notas') body.innerHTML = notesHTML();
  else body.innerHTML = teamHTML();
}

function homeHTML(){
  const T = today(), tm = addDays(T, 1), wk = addDays(T, 7);
  const all = live().filter(i => matchWho(i, S.who));
  const tasks = all.filter(i => i.type !== 'obs' || i.date);
  const open = tasks.filter(i => !i.done);
  const late = sortItems(open.filter(i => i.date && i.date < T));
  const todayAll = sortItems(tasks.filter(i => i.date === T && (!i.done || (i.doneAt && ymd(new Date(i.doneAt)) === T) || i.type === 'obs')));
  const tomorrow = sortItems(open.filter(i => i.date === tm));
  const week = sortItems(open.filter(i => i.date > tm && i.date <= wk));
  const later = sortItems(open.filter(i => i.date > wk));
  const nodate = sortItems(open.filter(i => !i.date));
  const notes = all.filter(i => i.type === 'obs' && !i.date).sort((a, b) => b.c - a.c);
  const doneToday = todayAll.filter(i => i.done).length;
  const todayTasks = todayAll.filter(i => i.type !== 'obs').length;

  const h = new Date().getHours();
  const greet = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const pct = todayTasks ? Math.round(doneToday / todayTasks * 100) : 0;

  const hero = `<div class="card hero">
    <h2>${greet}${S.me ? ', ' + PERSON[S.me].name : ''}</h2>
    <p class="sub">${longDay(T)}${S.who !== 'todos' ? ' · mostrando ' + PERSON[S.who].name : ''}</p>
    <div class="stats">
      <button class="stat late" data-act="jump" data-to="sec-late"><div class="n">${late.length}</div><div class="l">Atrasadas</div></button>
      <button class="stat today" data-act="jump" data-to="sec-today"><div class="n">${todayAll.filter(i => !i.done).length}</div><div class="l">Hoje</div></button>
      <button class="stat" data-act="jump" data-to="sec-next"><div class="n">${tomorrow.length + week.length}</div><div class="l">7 dias</div></button>
      <button class="stat obs" data-act="view" data-view="notas"><div class="n">${notes.length}</div><div class="l">Notas</div></button>
    </div>
    ${todayTasks ? `<div class="progress"><i style="width:${pct}%"></i></div>
    <div class="progress-meta"><span><b>${doneToday}</b> de ${todayTasks} feitas hoje</span><span>${pct}%</span></div>` : ''}
  </div>`;

  const nothing = !late.length && !todayAll.length && !tomorrow.length && !week.length && !later.length && !nodate.length;
  return hero + filtersHTML() +
    (nothing ? `<div class="card empty"><div class="big">🌳</div><h3>Tudo em dia</h3><p>Nada pendente por aqui. Escreva ou fale uma atividade no campo acima.</p></div>` : '') +
    section('Atrasadas', late, 'late') +
    section('Hoje', todayAll, 'today', { hideDate: true, sub: todayTasks ? `${doneToday}/${todayTasks}` : todayAll.length }) +
    section('Amanhã', tomorrow, 'tomorrow', { hideDate: true }) +
    section('Próximos dias', week, 'next') +
    section('Mais adiante', later, 'later', S.showAllLater ? {} : { limit: 4, moreAct: 'more-later' }) +
    section('Sem data', nodate, 'nodate') +
    (notes.length ? section('Últimas observações', notes.slice(0, 3), 'notes', {}) : '');
}

function agendaHTML(){
  const T = today();
  const all = live().filter(i => i.date && matchWho(i, S.who));
  const byDay = {};
  for(const i of all) (byDay[i.date] = byDay[i.date] || []).push(i);

  // Faixa dos próximos 14 dias
  let strip = '';
  for(let k = -1; k < 14; k++){
    const d = addDays(T, k), dt = parseD(d), n = (byDay[d] || []).filter(i => !i.done).length;
    strip += `<button class="wday ${d === T ? 'today' : ''} ${d === S.day ? 'sel' : ''}" data-act="day" data-day="${d}">
      <span class="w">${WDN[dt.getDay()].slice(0, 3)}</span><span class="d">${dt.getDate()}</span><span class="c">${n ? n : ''}</span></button>`;
  }

  // Mês
  const { y, m } = S.cal;
  const first = new Date(y, m, 1), start = new Date(y, m, 1 - first.getDay());
  let grid = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(w => `<div class="wd">${w}</div>`).join('');
  for(let k = 0; k < 42; k++){
    const dt = new Date(start); dt.setDate(start.getDate() + k);
    if(k >= 35 && dt.getMonth() !== m) break;
    const d = ymd(dt), list = byDay[d] || [];
    const dots = list.slice(0, 4).map(i => `<i class="${i.type === 'obs' ? 'obs' : (i.who && i.who.length === 1 ? i.who[0] : '')} ${i.done ? 'done' : ''}"></i>`).join('');
    const late = list.some(i => !i.done && d < T);
    grid += `<button class="day ${dt.getMonth() !== m ? 'out' : ''} ${d === T ? 'today' : ''} ${d === S.day ? 'sel' : ''} ${late ? 'has-late' : ''}" data-act="day" data-day="${d}">
      <span class="num">${dt.getDate()}</span><span class="dots">${dots}</span></button>`;
  }

  const dayList = sortItems(byDay[S.day] || []);
  return `<div class="week" id="weekStrip">${strip}</div>
    ${filtersHTML()}
    <div class="card">
      <div class="cal-head">
        <h2>${MN[m]} ${y}</h2>
        <div class="cal-nav">
          <button class="txt" data-act="cal-today">Hoje</button>
          <button data-act="cal" data-d="-1" aria-label="Mês anterior">${I.left}</button>
          <button data-act="cal" data-d="1" aria-label="Próximo mês">${I.right}</button>
        </div>
      </div>
      <div class="cal">${grid}</div>
    </div>
    <div class="day-title"><h3>${longDay(S.day)}</h3><button class="linkbtn" data-act="new-day">${I.plus}Adicionar</button></div>
    ${dayList.length ? `<div class="list">${dayList.map(i => itemHTML(i, { hideDate: true })).join('')}</div>`
      : `<div class="card empty"><p>Nada marcado para ${relDay(S.day).toLowerCase() === 'hoje' ? 'hoje' : 'este dia'}.</p></div>`}`;
}

function notesHTML(){
  const seg = `<div class="seg top-seg">
    <button class="${S.notesTab === 'obs' ? 'on' : ''}" data-act="ntab" data-tab="obs">${I.note}Observações</button>
    <button class="${S.notesTab === 'done' ? 'on' : ''}" data-act="ntab" data-tab="done">${I.check}Concluídas</button>
  </div>`;
  if(S.notesTab === 'obs'){
    const notes = live().filter(i => i.type === 'obs' && matchWho(i, S.who)).sort((a, b) => b.c - a.c);
    return seg + filtersHTML() + (notes.length ? `<div class="notes-grid">${notes.map(n => `
      <div class="note ${n.by || ''}" data-act="open" data-id="${n.id}">
        <div class="nt">${esc(n.title)}</div>
        ${n.notes ? `<div class="nn">${esc(n.notes)}</div>` : ''}
        <div class="nf"><span>${n.date ? relDay(n.date) + ' · ' : ''}${ago(n.c)}</span>${n.by ? avatar(n.by, 'sm') : ''}</div>
      </div>`).join('')}</div>`
      : `<div class="card empty"><div class="big">✎</div><h3>Nenhuma observação</h3><p>Comece com “obs:” no campo rápido, ou toque no + e escolha Observação.</p></div>`);
  }
  const done = live().filter(i => i.done && matchWho(i, S.who)).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0)).slice(0, 80);
  return seg + filtersHTML() + (done.length ? `<div class="list">${done.map(i => itemHTML(i)).join('')}</div>`
    : `<div class="card empty"><p>Nada concluído ainda.</p></div>`);
}

function teamHTML(){
  const T = today(), wk = addDays(T, 7);
  return PEOPLE.map(p => {
    const mine = live().filter(i => i.type !== 'obs' && !i.done && matchWho(i, p.id));
    const late = mine.filter(i => i.date && i.date < T).length;
    const tday = mine.filter(i => i.date === T).length;
    const next = sortItems(mine.filter(i => !i.date || i.date >= T)).filter(i => !i.date || i.date <= wk);
    return `<div class="card person ${p.id}">
      <div class="person-head">${avatar(p.id, 'lg')}
        <div><h2>${p.full}</h2><p>${mine.length} pendente${mine.length === 1 ? '' : 's'}${p.id === S.me ? ' · você' : ''}</p></div>
        <button class="linkbtn" data-act="see-person" data-who="${p.id}">Ver ${I.right}</button>
      </div>
      <div class="mini-stats">
        <div class="late"><b>${late}</b><span>Atrasadas</span></div>
        <div><b>${tday}</b><span>Hoje</span></div>
        <div><b>${next.length}</b><span>Na semana</span></div>
      </div>
      ${next.length ? `<ul class="next-list">${next.slice(0, 4).map(i => `<li data-act="open" data-id="${i.id}"><span>${esc(i.title)}</span><span class="muted">${relDay(i.date)}${i.time ? ' ' + i.time : ''}</span></li>`).join('')}</ul>` : ''}
    </div>`;
  }).join('');
}

/* ---------- Campo rápido (tela Hoje) ---------- */
let Q = { parsed: null, who: null };
function bindQuick(){
  const inp = $('#qIn'), go = $('#qGo'), mic = $('#qMic');
  Q = { parsed: null, who: null };
  const update = () => {
    const v = inp.value.trim();
    go.disabled = !v;
    $('#qHint').hidden = !!v;
    if(!v){ $('#qPrev').hidden = true; Q.parsed = null; return; }
    Q.parsed = parseQuick(v);
    renderQuickPreview();
  };
  inp.addEventListener('input', () => { Q.who = null; update(); });
  inp.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); quickAdd(); } });
  go.addEventListener('click', quickAdd);
  if(mic) mic.addEventListener('click', () => startVoice(mic, s => { inp.value = s; update(); }, () => inp.focus()));
  $('#qPrev').addEventListener('click', e => {
    const b = e.target.closest('[data-qwho]');
    if(b){
      const id = b.dataset.qwho, cur = quickWho();
      Q.who = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
      renderQuickPreview();
    }
    if(e.target.closest('[data-qmore]')) openEditor(null, quickDraft(), inp.value.trim());
  });
}
function quickWho(){
  if(Q.who) return Q.who;
  const p = Q.parsed;
  if(p.who.length) return p.who;
  return p.type === 'obs' || !S.me ? [] : [S.me];
}
function quickDraft(){
  const p = Q.parsed;
  return { title: p.title || $('#qIn').value.trim(), type: p.type, date: p.date, time: p.time, priority: p.priority, who: quickWho() };
}
function renderQuickPreview(){
  const p = Q.parsed, d = quickDraft(), el = $('#qPrev');
  const fake = Object.assign({ id: 'x', done: false }, d);
  el.hidden = false;
  el.innerHTML = `<div class="qt">Vai criar: <b>${esc(d.title || '…')}</b></div>
    <span class="tag ${p.type === 'obs' ? 'obs' : ''}">${p.type === 'obs' ? I.note : I.task}${TYPES[p.type]}</span>
    ${metaTags(Object.assign(fake, { type: 'x' }))}
    ${PEOPLE.map(x => `<button class="ppill ${x.id} ${d.who.includes(x.id) ? 'on' : ''}" data-qwho="${x.id}">${avatar(x.id)}${x.name}</button>`).join('')}
    <button class="linkbtn" data-qmore>Mais opções</button>`;
}
function quickAdd(){
  const inp = $('#qIn');
  if(!inp.value.trim() || !Q.parsed) return;
  const it = newItem(quickDraft());
  S.items.push(it);
  inp.value = ''; Q = { parsed: null, who: null };
  $('#qPrev').hidden = true; $('#qHint').hidden = false; $('#qGo').disabled = true;
  changed();
  toast(`Adicionado${it.date ? ' · ' + relDay(it.date) : ''}${it.time ? ' ' + it.time : ''}`, [
    { label: 'Desfazer', fn: () => { it.deleted = true; touch(it); changed(); } },
    { label: 'Editar', fn: () => openEditor(it) }
  ]);
}
function newItem(d){
  const now = Date.now();
  return {
    id: uid(), type: d.type || 'tarefa', title: d.title || 'Sem título', notes: d.notes || '',
    who: d.who || [], date: d.date || null, time: d.time || null, priority: d.priority || 'normal',
    done: false, doneAt: null, doneBy: null, c: now, u: now, by: S.me, deleted: false
  };
}

/* ---------- Editor (folha de baixo) ---------- */
let E = null; // { item, draft, touched:Set, isNew }
function openEditor(item, preset, rawText){
  const isNew = !item;
  const draft = isNew
    ? Object.assign({ title: '', type: 'tarefa', who: S.me ? [S.me] : [], date: today(), time: null, priority: 'normal', notes: '' }, preset || {})
    : JSON.parse(JSON.stringify(item));
  E = { item, draft, isNew, touched: new Set(preset ? Object.keys(preset) : []), raw: rawText || (preset && preset.title) || '' };
  if(preset && rawText) E.touched = new Set(['who']);
  openSheet(editorHTML());
  renderCtl();
  const ta = $('#eTitle');
  ta.value = isNew ? E.raw : draft.title;
  autoGrow(ta);
  ta.addEventListener('input', () => { autoGrow(ta); onTitle(); });
  $('#eNotes').addEventListener('input', e => { E.draft.notes = e.target.value; });
  const mic = $('#eMic');
  if(mic) mic.addEventListener('click', () => startVoice(mic, s => { ta.value = s; autoGrow(ta); onTitle(); }));
  if(isNew && !rawText) setTimeout(() => ta.focus(), 260);
  if(isNew && rawText) onTitle();
}
function onTitle(){
  const v = $('#eTitle').value;
  if(!E.isNew){ E.draft.title = v.trim(); return; }
  const p = parseQuick(v);
  E.draft.title = p.title || v.trim();
  for(const k of ['type', 'date', 'time', 'priority']) if(!E.touched.has(k) && (p[k] || k === 'type')) E.draft[k] = p[k];
  if(!E.touched.has('who') && p.who.length) E.draft.who = p.who;
  const pa = $('#parsedAs');
  pa.innerHTML = E.draft.title && E.draft.title !== v.trim() ? `Vai salvar como: <b>${esc(E.draft.title)}</b>` : '';
  renderCtl();
}
function autoGrow(ta){ ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 180) + 'px'; }
function editorHTML(){
  const d = E.draft;
  return `<div class="sh-head"><h2>${E.isNew ? 'Nova' : d.type === 'obs' ? 'Observação' : 'Editar'}</h2><button class="xbtn" data-act="close-sheet">${I.x}</button></div>
    <div class="titlebox">
      <textarea id="eTitle" rows="1" placeholder="${E.isNew ? 'Escreva ou fale… ex.: quinta 19h conferir o som @vinicius' : 'Título'}"></textarea>
      ${SR ? `<button class="roundbtn" id="eMic" aria-label="Falar">${I.mic}</button>` : ''}
    </div>
    <div class="parsed-as" id="parsedAs"></div>
    <div id="eCtl">${ctlHTML()}</div>
    <div class="lbl">Detalhes</div>
    <textarea class="inp" id="eNotes" rows="3" placeholder="Detalhes, o que precisa levar, links…">${esc(d.notes || '')}</textarea>
    <div class="sh-actions">
      ${!E.isNew ? `<button class="btn danger" data-act="e-del" aria-label="Excluir">${I.trash}</button>` : ''}
      ${!E.isNew && d.type !== 'obs' ? `<button class="btn ok" data-act="e-done">${I.check}${d.done ? 'Reabrir' : 'Concluir'}</button>` : ''}
      <button class="btn primary" data-act="e-save">${E.isNew ? 'Adicionar' : 'Salvar'}</button>
    </div>
    ${!E.isNew ? `<div class="meta-line">Criado ${ago(d.c)}${d.by ? ' · última edição por ' + esc(PERSON[d.by] ? PERSON[d.by].name : d.by) + ' ' + ago(d.u) : ''}</div>` : ''}`;
}
function ctlHTML(){
  const d = E.draft, T = today();
  const opt = (act, val, label, on, extra) => `<button class="optchip ${extra || ''} ${on ? 'on' : ''}" data-act="${act}" data-v="${val}">${label}</button>`;
  return `<div class="lbl">Tipo</div>
    <div class="seg">${Object.entries(TYPES).map(([k, l]) => `<button class="${d.type === k ? 'on' : ''}" data-act="e-type" data-v="${k}">${k === 'obs' ? I.note : k === 'atividade' ? I.clock : I.task}${l}</button>`).join('')}</div>
    <div class="lbl">${d.type === 'obs' ? 'Sobre / para' : 'Responsável'}</div>
    <div class="row">${PEOPLE.map(p => `<button class="ppill ${p.id} ${d.who.includes(p.id) ? 'on' : ''}" data-act="e-who" data-v="${p.id}">${avatar(p.id)}${p.name}</button>`).join('')}</div>
    <div class="lbl">Quando</div>
    <div class="row">
      ${opt('e-date', '', 'Sem data', !d.date)}
      ${opt('e-date', T, 'Hoje', d.date === T)}
      ${opt('e-date', addDays(T, 1), 'Amanhã', d.date === addDays(T, 1))}
      ${opt('e-date', nextMonday(), 'Segunda', d.date === nextMonday())}
      ${opt('e-urg', '', I.flag + 'Urgente', d.priority === 'alta', 'urg')}
    </div>
    <div class="when">
      <input class="inp" type="date" id="eDate" value="${d.date || ''}">
      <input class="inp" type="time" id="eTime" value="${d.time || ''}">
    </div>`;
}
function nextMonday(){ const off = ((8 - new Date().getDay()) % 7) || 7; return addDays(today(), off); }
function renderCtl(){
  $('#eCtl').innerHTML = ctlHTML();
  $('#eDate').addEventListener('change', e => { E.draft.date = e.target.value || null; E.touched.add('date'); renderCtl(); });
  $('#eTime').addEventListener('change', e => { E.draft.time = e.target.value || null; E.touched.add('time'); if(E.draft.time && !E.draft.date){ E.draft.date = today(); } renderCtl(); });
}
function saveEditor(){
  const d = E.draft;
  if(!d.title){ $('#eTitle').focus(); return; }
  if(E.isNew){
    const it = newItem(d);
    S.items.push(it);
    closeSheet(); changed();
    toast(`${TYPES[it.type]} adicionada${it.date ? ' · ' + relDay(it.date) : ''}`, [{ label: 'Desfazer', fn: () => { it.deleted = true; touch(it); changed(); } }]);
  } else {
    Object.assign(E.item, { title: d.title, type: d.type, who: d.who, date: d.date, time: d.time, priority: d.priority, notes: d.notes });
    touch(E.item);
    closeSheet(); changed();
  }
}

/* ---------- Bloqueio com rosto / digital (do próprio aparelho) ---------- */
// Usa o desbloqueio do celular (Face ID, digital, Windows Hello). Nada de rosto sai do aparelho:
// o site só pede para o aparelho confirmar que é o dono, e guarda o id da credencial aqui.
const LOCK_AFTER = 60 * 60 * 1000; // pede de novo depois de 1 hora sem usar
const rnd = n => crypto.getRandomValues(new Uint8Array(n));
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
let bioOk = null;
async function bioAvailable(){
  if(bioOk !== null) return bioOk;
  try { bioOk = !!(window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()); }
  catch(e){ bioOk = false; }
  return bioOk;
}
async function bioRegister(){
  const p = PERSON[S.me] || { full: 'Equipe' };
  const cred = await navigator.credentials.create({ publicKey: {
    challenge: rnd(32),
    rp: { name: 'Atividades da Equipe' },
    user: { id: new TextEncoder().encode((S.me || 'eu') + '-' + uid()), name: p.full, displayName: p.full },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { userVerification: 'required', residentKey: 'required', requireResidentKey: true },
    timeout: 60000, attestation: 'none'
  }});
  const id = b64u(cred.rawId);
  lsSet('atv.bio', id);
  // guarda no site que este rosto é desta pessoa: em outro aparelho, o nome dela só abre com ele
  const cur = (S.people[S.me] && S.people[S.me].creds) || [];
  S.people[S.me] = { creds: [...new Set([...cur, id])], u: Date.now() };
  markSeen();
  changed();
}
function personCreds(id){ return (S.people[id] && S.people[id].creds) || []; }
// Confirma com um dos rostos cadastrados para a pessoa (deste aparelho ou sincronizado no iCloud/Google).
async function bioVerify(ids){
  ids = ids || [...new Set([lsGet('atv.bio', null), ...personCreds(S.me)].filter(Boolean))];
  const cred = await navigator.credentials.get({ publicKey: {
    challenge: rnd(32), allowCredentials: ids.map(i => ({ type: 'public-key', id: unb64u(i) })),
    userVerification: 'required', timeout: 60000
  }});
  const used = b64u(cred.rawId);
  if(!ids.includes(used)) throw new Error('rosto de outra pessoa');
  lsSet('atv.bio', used);
  markSeen();
}
function markSeen(){ lsSet('atv.seen', Date.now()); }
function needsUnlock(){ return !!lsGet('atv.bio', null) && Date.now() - lsGet('atv.seen', 0) > LOCK_AFTER; }
// Portão de entrada: nada aparece atrás até a pessoa escolher o nome e confirmar com rosto/digital.
function lockScreen(inner){
  const el = $('#lock');
  el.innerHTML = `<div class="lock-box">
      <img src="logo.png" alt="" class="lock-logo">
      <p class="eyebrow">Equipe · Atividades</p>
      ${inner}
      <p class="lock-err" id="lockErr"></p>
    </div>`;
  el.hidden = false;
  document.body.classList.add('locked');
}
async function checkKey(k){
  try {
    const r = await fetch(`${API}?ref=${CFG.branch}&t=${Date.now()}`, { headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + k }, cache: 'no-store' });
    if(!r.ok && r.status !== 404) return false;
    // só passa se a chave puder gravar neste repositório
    const repo = await fetch(`https://api.github.com/repos/${CFG.owner}/${CFG.repo}`, { headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + k } });
    const j = await repo.json();
    return !!(j.permissions && j.permissions.push);
  } catch(e){ return false; }
}
function openApp(){
  $('#lock').hidden = true;
  document.body.classList.remove('locked');
  markSeen();
  refresh();
  pull();
}
async function gate(){
  // Sem a chave (que vem no link de acesso), o app não abre: é só da equipe.
  if(!S.key){
    lockScreen(`<h2>Só da equipe</h2>
      <p class="muted">Este app é só do Victor, do Vinicius e do Paulo. Para entrar, abra o <b>link de acesso</b> que um deles te mandou.</p>
      <input class="inp" type="password" id="gateKey" placeholder="ou cole a chave aqui (github_pat_…)" autocomplete="off">
      <button class="btn primary block" id="gateKeyBtn" style="margin-top:12px">Entrar</button>`);
    $('#gateKeyBtn').onclick = async () => {
      const k = $('#gateKey').value.trim();
      if(!k) return;
      $('#lockErr').textContent = 'Conferindo…';
      if(await checkKey(k)){ S.key = k; lsSet('atv.key', k); gate(); }
      else $('#lockErr').textContent = 'Essa chave não funcionou. Confira e tente de novo.';
    };
    return;
  }
  if(!S.me){
    try { await pull(); } catch(e){}
    lockScreen(`<h2>Quem é você?</h2>
      <p class="muted">Escolha seu nome. Na primeira vez, você cadastra seu rosto ou digital, e o seu nome passa a abrir só com ele.</p>
      <div class="who-grid">${PEOPLE.map(p => `<button class="who-opt" data-gate-me="${p.id}">${avatar(p.id, 'lg')}<span style="flex:1">${p.full}</span>${personCreds(p.id).length ? '<span class="lock-tag">🔒 cadastrado</span>' : ''}</button>`).join('')}</div>`);
    return;
  }
  const name = esc(PERSON[S.me].name);
  const back = `<button class="linkbtn" id="gateSwap" style="margin-top:14px">Não sou ${name}</button>`;
  const bindBack = () => { const b = $('#gateSwap'); if(b) b.onclick = () => { S.me = null; localStorage.removeItem('atv.me'); localStorage.removeItem('atv.bio'); gate(); }; };
  const fail = msg => { $('#lockErr').textContent = msg; };
  const hasLocal = !!lsGet('atv.bio', null);
  const registered = personCreds(S.me).length > 0;

  // 1) Este aparelho já tem o rosto: só pede de novo depois de 1 hora sem uso
  if(hasLocal){
    if(!needsUnlock()){ openApp(); return; }
    lockScreen(`<h2>Olá, ${name}</h2>
      <p class="muted">Confirme que é você para abrir.</p>
      <button class="btn primary block" id="gateBtn">${I.face}Desbloquear com rosto ou digital</button>${back}`);
    bindBack();
    const go = () => bioVerify().then(openApp).catch(() => fail('Não deu certo. Toque para tentar de novo.'));
    $('#gateBtn').onclick = go;
    go();
    return;
  }

  // 2) O nome já tem rosto cadastrado (em outro aparelho): precisa ser o mesmo rosto
  if(registered){
    lockScreen(`<h2>Olá, ${name}</h2>
      <p class="muted">Esse nome já tem rosto/digital cadastrado. Confirme com o <b>seu</b> para entrar neste aparelho.</p>
      <button class="btn primary block" id="gateBtn">${I.face}Confirmar com rosto ou digital</button>
      <p class="help" style="margin-top:12px">Trocou de celular e não consegue? Peça para alguém da equipe liberar um novo cadastro nos Ajustes.</p>${back}`);
    bindBack();
    $('#gateBtn').onclick = () => bioVerify(personCreds(S.me)).then(openApp)
      .catch(() => fail(`Não reconhecido. Só o rosto/digital do ${PERSON[S.me].name} abre esse nome.`));
    return;
  }

  // 3) Primeira vez desse nome: cadastra
  lockScreen(`<h2>Olá, ${name}</h2>
    <p class="muted">Cadastre seu rosto ou digital. A partir daí, o seu nome só abre com ele, em qualquer aparelho. Seu rosto não sai do celular.</p>
    <button class="btn primary block" id="gateBtn">${I.face}Cadastrar rosto ou digital</button>${back}`);
  bindBack();
  $('#gateBtn').onclick = async () => {
    try { await pull(); } catch(e){}
    if(personCreds(S.me).length){ gate(); return; } // alguém cadastrou nesse meio tempo
    bioRegister().then(() => { openApp(); toast('Pronto! Seu nome agora abre só com seu rosto 🔒'); })
      .catch(() => fail('Não deu certo. Toque para tentar de novo.'));
  };
}
$('#lock').addEventListener('click', e => {
  const b = e.target.closest('[data-gate-me]');
  if(b){ S.me = b.dataset.gateMe; lsSet('atv.me', S.me); localStorage.removeItem('atv.bio'); gate(); }
});

/* ---------- Folha de ajustes ---------- */
function openSettings(first){
  const link = id => location.origin + location.pathname + '#k=' + encodeURIComponent(S.key) + '&eu=' + id;
  openSheet(`<div class="sh-head"><h2>${first ? 'Quem é você?' : 'Ajustes'}</h2>${first ? '' : `<button class="xbtn" data-act="close-sheet">${I.x}</button>`}</div>
    ${first ? '<p class="help">Sem login: só escolha seu nome. Fica guardado neste aparelho.</p>' : '<div class="lbl">Eu sou</div>'}
    <div class="who-grid" style="margin-top:10px">${PEOPLE.map(p => `<button class="who-opt ${S.me === p.id ? 'on' : ''}" data-act="set-me" data-v="${p.id}">${avatar(p.id, 'lg')}${p.full}</button>`).join('')}</div>
    ${first ? '' : `
    <div class="lbl">Chave de sincronização</div>
    <input class="inp" type="password" id="keyIn" placeholder="github_pat_…" value="${esc(S.key)}" autocomplete="off">
    <p class="help">${S.key ? (S.sync === 'error' ? '⚠️ ' + esc(S.syncMsg) : '✅ Conectado. Tudo que você muda aparece para os outros.') : 'Sem a chave você só consegue ver. Peça o link de acesso para quem administra.'}
      ${S.lastSync ? '<br>Última sincronização ' + ago(S.lastSync) + '.' : ''}</p>
    <div class="row" style="margin-top:10px">
      <button class="btn small" data-act="save-key">Salvar chave</button>
      <button class="btn small" data-act="sync-now">Sincronizar agora</button>
    </div>
    ${S.key ? `<div class="lbl">Mandar link de acesso</div>
      <p class="help" style="margin-bottom:6px">Quem abrir o link já entra conectado (com a chave). Mande só para a equipe.</p>
      ${PEOPLE.filter(p => p.id !== S.me).map(p => `<div class="invite"><span>${avatar(p.id, 'sm')}${p.full}</span>
        <button class="btn small" data-act="invite" data-link="${esc(link(p.id))}" data-name="${p.name}">${I.share}Enviar</button></div>`).join('')}` : ''}
    <div class="lbl">Rosto / digital da equipe</div>
    ${PEOPLE.map(p => `<div class="invite"><span>${avatar(p.id, 'sm')}${p.full}</span>
      ${personCreds(p.id).length
        ? `<span class="row"><span class="tag ok">🔒 cadastrado</span>${p.id !== S.me ? `<button class="btn small" data-act="bio-reset" data-v="${p.id}">Liberar novo</button>` : ''}</span>`
        : '<span class="tag">ainda não</span>'}</div>`).join('')}
    <p class="help">"Liberar novo" é para quando alguém troca de celular: na próxima vez que entrar, ele cadastra o rosto de novo.</p>
    <div class="lbl">Aparência</div>
    <div class="seg">${[['', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']].map(([v, l]) => `<button class="${(lsGet('atv.theme', '') === v) ? 'on' : ''}" data-act="theme" data-v="${v}">${l}</button>`).join('')}</div>`}
  `, !first);
}
function applyTheme(){ const t = lsGet('atv.theme', ''); if(t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; }

/* ---------- Folha / toast ---------- */
let sheetClosable = true;
function openSheet(html, closable){
  sheetClosable = closable !== false;
  $('#sheetBody').innerHTML = html;
  $('#sheet').hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeSheet(){
  if(rec) rec.stop();
  $('#sheet').hidden = true; E = null;
  document.body.style.overflow = '';
}
let toastTimer;
function toast(msg, actions){
  const el = $('#toast');
  el.innerHTML = `<span>${esc(msg)}</span>` + (actions || []).map((a, i) => `<button data-t="${i}">${esc(a.label)}</button>`).join('');
  el.hidden = false;
  el.onclick = e => { const b = e.target.closest('[data-t]'); if(b){ actions[+b.dataset.t].fn(); el.hidden = true; } };
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 5000);
}

/* ---------- Ações ---------- */
function toggleDone(id){
  const it = byId(id); if(!it) return;
  const row = document.querySelector(`.item[data-id="${id}"]`);
  it.done = !it.done;
  it.doneAt = it.done ? Date.now() : null;
  it.doneBy = it.done ? S.me : null;
  touch(it);
  if(row){ row.classList.toggle('done', it.done); if(it.done && navigator.vibrate) navigator.vibrate(12); }
  setTimeout(changed, it.done ? 350 : 0);
  if(it.done) toast('Concluída ✓', [{ label: 'Desfazer', fn: () => { it.done = false; it.doneAt = null; it.doneBy = null; touch(it); changed(); } }]);
}

document.addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if(tab){ S.view = tab.dataset.view; lsSet('atv.view', S.view); renderView(); return; }
  const el = e.target.closest('[data-act]');
  if(!el) return;
  const a = el.dataset.act, d = el.dataset;
  switch(a){
    case 'toggle': toggleDone(d.id); break;
    case 'open': { const it = byId(d.id); if(it) openEditor(it); break; }
    case 'new': openEditor(null, S.view === 'agenda' ? { date: S.day } : null); break;
    case 'new-day': openEditor(null, { date: S.day }); break;
    case 'who': S.who = d.who; lsSet('atv.who', S.who); refresh(); break;
    case 'see-person': S.who = d.who; lsSet('atv.who', S.who); S.view = 'hoje'; renderView(); break;
    case 'view': S.view = d.view; renderView(); break;
    case 'jump': { const t = document.getElementById(d.to); if(t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); break; }
    case 'more-later': S.showAllLater = true; refresh(); break;
    case 'day': S.day = d.day; { const dt = parseD(d.day); S.cal = { y: dt.getFullYear(), m: dt.getMonth() }; } refresh(); break;
    case 'cal': { const dt = new Date(S.cal.y, S.cal.m + Number(d.d), 1); S.cal = { y: dt.getFullYear(), m: dt.getMonth() }; refresh(); break; }
    case 'cal-today': { const n = new Date(); S.cal = { y: n.getFullYear(), m: n.getMonth() }; S.day = today(); refresh(); break; }
    case 'ntab': S.notesTab = d.tab; refresh(); break;
    case 'settings': openSettings(false); break;
    case 'close-sheet': if(sheetClosable) closeSheet(); break;
    case 'set-me': {
      const first = !S.me;
      if(d.v === S.me) break;
      // trocar de nome passa pelo portão: o outro nome só abre com o rosto dele
      S.me = d.v; lsSet('atv.me', S.me); localStorage.removeItem('atv.bio');
      closeSheet(); gate(); break;
    }
    case 'save-key': S.key = $('#keyIn').value.trim(); lsSet('atv.key', S.key); setSync('saving'); pull().then(() => openSettings(false)); break;
    case 'sync-now': pull().then(() => openSettings(false)); break;
    case 'bio-reset': {
      const who = d.v;
      if(!confirm(`Liberar um novo cadastro de rosto para ${PERSON[who].name}?`)) break;
      bioVerify().then(() => {
        S.people[who] = { creds: [], u: Date.now() };
        changed(); openSettings(false); toast(`${PERSON[who].name} pode cadastrar o rosto de novo`);
      }).catch(() => toast('Precisa confirmar que é você.'));
      break;
    }
    case 'theme': lsSet('atv.theme', d.v); applyTheme(); openSettings(false); break;
    case 'invite': {
      const text = `${d.name}, abre esse link para ver e editar nossas atividades: ${d.link}`;
      if(navigator.share) navigator.share({ title: 'Atividades', text }).catch(() => {});
      else navigator.clipboard.writeText(d.link).then(() => toast('Link copiado'));
      break;
    }
    // Editor
    case 'e-type': E.draft.type = d.v; E.touched.add('type'); renderCtl(); break;
    case 'e-who': { const w = E.draft.who; E.draft.who = w.includes(d.v) ? w.filter(x => x !== d.v) : [...w, d.v]; E.touched.add('who'); renderCtl(); break; }
    case 'e-date': E.draft.date = d.v || null; if(!d.v) E.draft.time = null; E.touched.add('date'); renderCtl(); break;
    case 'e-urg': E.draft.priority = E.draft.priority === 'alta' ? 'normal' : 'alta'; E.touched.add('priority'); renderCtl(); break;
    case 'e-save': saveEditor(); break;
    case 'e-done': { const it = E.item; closeSheet(); if(it.done !== undefined) toggleDone(it.id); break; }
    case 'e-del': {
      const it = E.item; it.deleted = true; touch(it); closeSheet(); changed();
      toast('Excluída', [{ label: 'Desfazer', fn: () => { it.deleted = false; touch(it); changed(); } }]);
      break;
    }
  }
});
document.addEventListener('keydown', e => {
  if(e.key === 'Escape' && !$('#sheet').hidden && sheetClosable) closeSheet();
  if(e.key === 'Enter' && (e.metaKey || e.ctrlKey) && E) saveEditor();
});

/* ---------- Início ---------- */
function readHash(){
  if(!location.hash) return;
  const h = new URLSearchParams(location.hash.slice(1));
  if(h.get('k')){ S.key = h.get('k'); lsSet('atv.key', S.key); }
  if(h.get('eu') && PERSON[h.get('eu')]){ S.me = h.get('eu'); lsSet('atv.me', S.me); }
  history.replaceState(null, '', location.pathname + location.search);
}

document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = I[el.dataset.icon]; });
applyTheme();
readHash();
if(!TITLES[S.view]) S.view = 'hoje';
if(S.who !== 'todos' && !PERSON[S.who]) S.who = 'todos';
setSync(S.key ? 'saving' : 'local');
renderView();
gate();
setInterval(() => { if(!document.hidden && !saving && $('#lock').hidden) pull(); }, 30000);
setInterval(() => { if(!document.hidden && $('#sheet').hidden) refresh(); }, 60000);
document.addEventListener('visibilitychange', () => {
  if(document.hidden){ if($('#lock').hidden) markSeen(); return; }
  if($('#lock').hidden && needsUnlock()) gate();
  else if($('#lock').hidden){ markSeen(); pull(); }
});
setInterval(() => { if(!document.hidden && $('#lock').hidden) markSeen(); }, 60000);
window.addEventListener('online', () => pull());
