(function () {
'use strict';

/* ---------- utilidades ---------- */
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.ºª]/g, '');
const wait = ms => new Promise(r => setTimeout(r, ms));
const uid8 = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const A = {}; AREAS.forEach(a => { A[a.id] = a; });
const dkey = x => (x.num + x.sig).replace(/[^A-Za-z0-9]/g, '');
const cvar = id => 'var(--c-' + (A[id] ? A[id].ramo : 'base') + ')';
const opt = (v, l, sel) => '<option value="' + esc(v) + '"' + (v === sel ? ' selected' : '') + '>' + esc(l) + '</option>';
const ST = ['Não iniciado', 'Estudando', 'Revisado'];
const TIPOS = ['Resumo', 'Fichamento', 'Peça', 'Jurisprudência', 'Doutrina', 'Questão', 'Videoaula', 'Áudio', 'Outro'];
const VIEWS = ['areas', 'conexoes', 'ferramentas', 'oab', 'caderno'];
const TOTAL_DIP = AREAS.reduce((n, a) => n + a.dip.length, 0);
const main = $('#main');

/* ---------- estado ---------- */
const S = { rep: [], voc: [], prog: { d: {}, c: {}, o: null }, cloud: false, db: null, uid: null };
const ui = { sort: 'ramo', node: 'civ', edge: -1, tool: 'graficas', pyr: 0, fcArea: 'todas', fcI: 0, fcFlip: false,
  tl: 'cpc', tlI: -1, tlPlay: false, tlTok: 0, cad: 'rep', repEdit: null, vocEdit: null, repQ: '', repArea: '', repTipo: '', vocQ: '', pre: null, pa: 'civ', pOpen: -1, fix: null };

/* ---------- armazenamento ---------- */
const LS = 'codex-juridico-v1';
function lsGet() { try { return JSON.parse(localStorage.getItem(LS) || 'null'); } catch (e) { return null; } }
function lsSet(v) { try { localStorage.setItem(LS, JSON.stringify(v)); } catch (e) { /* sem armazenamento local */ } }
function persistLocal() { if (!S.cloud) lsSet({ rep: S.rep, voc: S.voc, prog: S.prog }); }
function cleanProg(p) { p = p || {}; return { d: p.d || {}, c: p.c || {}, o: Array.isArray(p.o) ? p.o : null }; }

const local = lsGet();
if (local) { S.rep = local.rep || []; S.voc = local.voc || []; S.prog = cleanProg(local.prog); }
const pend = { rep: S.rep.slice(), voc: S.voc.slice(), prog: local ? cleanProg(local.prog) : null };

let cols = null, progDoc = null, progTimer = null, progChain = Promise.resolve();

function setMode(m) {
  const chip = $('#save-chip'), txt = $('#save-txt');
  const map = {
    local: ['', 'Salvo neste aparelho'],
    sync: ['', 'Abrindo seu caderno'],
    conta: ['ok', 'Salvo na sua conta'],
    lento: ['warn', 'Sem resposta do servidor'],
    leitura: ['warn', 'Não foi possível salvar']
  };
  chip.className = 'chip ' + map[m][0];
  txt.textContent = map[m][1];
}
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 4200);
}
function fail(e) {
  const code = e && e.code;
  if (code === 'quota_exceeded') toast('Seu caderno atingiu o limite de espaço. Apague anotações antigas para guardar novas.');
  else if (code === 'invalid_argument') { setMode('leitura'); toast('Não foi possível salvar: seu acesso a esta página é só de leitura.'); }
  else toast('Não foi possível salvar agora. Confira a conexão e tente de novo.');
}
function syncPendLocal() { lsSet({ rep: pend.rep || [], voc: pend.voc || [], prog: pend.prog || {} }); }

function writeItem(kind, item) {
  const body = Object.assign({}, item); delete body.id;
  return cols[kind].doc(item.id).set(body).catch(fail);
}
function saveItem(kind, item) {
  const list = S[kind], i = list.findIndex(x => x.id === item.id);
  if (i >= 0) list[i] = item; else list.push(item);
  if (S.cloud) writeItem(kind, item); else persistLocal();
}
function removeItem(kind, id) {
  S[kind] = S[kind].filter(x => x.id !== id);
  if (S.cloud) cols[kind].doc(id).delete().catch(fail); else persistLocal();
}
function saveProg() {
  if (!S.cloud) { persistLocal(); return; }
  clearTimeout(progTimer);
  progTimer = setTimeout(() => {
    progTimer = null;
    const body = JSON.parse(JSON.stringify(S.prog));
    progChain = progChain.then(() => progDoc.set(body)).catch(fail);
  }, 600);
}

async function connect() {
  if (!window.claude || typeof window.claude.use !== 'function') return;
  let db = null, user = null, id = null;
  try { const r = await Promise.all([window.claude.use('db'), window.claude.use('user')]); db = r[0]; user = r[1]; } catch (e) { db = null; }
  try { id = user ? await user.id() : null; } catch (e) { id = null; }
  if (!db || !id) return;
  let base;
  try {
    base = db.doc('data/users/' + id + '/caderno');
    cols = { rep: base.collection('repertorio'), voc: base.collection('vocabulario') };
    progDoc = db.doc('data/users/' + id + '/progresso');
  } catch (e) { cols = null; return; }
  S.cloud = true; S.db = db; S.uid = id;
  try { AI.usoDoc = db.doc('data/users/' + id + '/ia'); } catch (e) { AI.usoDoc = null; }
  loadUso();
  setMode('sync');
  let settled = false;
  const timer = setTimeout(() => { if (!settled) setMode('lento'); }, 10000);
  const ready = () => { if (!settled) { settled = true; clearTimeout(timer); setMode('conta'); } };
  const onErr = () => { clearTimeout(timer); settled = true; setMode('lento'); };

  ['rep', 'voc'].forEach(kind => {
    cols[kind].onSnapshot(snap => {
      const items = snap.docs.map(x => Object.assign({}, x.data(), { id: x.id }));
      if (!snap.metadata.fromCache) {
        if (pend[kind]) {
          const have = new Set(items.map(i => i.id));
          pend[kind].filter(i => !have.has(i.id)).forEach(it => { items.push(it); writeItem(kind, it); });
          pend[kind] = null; syncPendLocal();
        }
        ready();
      } else if (pend[kind]) {
        const have = new Set(items.map(i => i.id));
        pend[kind].forEach(it => { if (!have.has(it.id)) items.push(it); });
      }
      S[kind] = items;
      refresh(kind);
    }, onErr);
  });
  progDoc.onSnapshot(snap => {
    let p = snap.exists ? cleanProg(JSON.parse(JSON.stringify(snap.data()))) : null;
    if (!snap.metadata.fromCache && pend.prog) {
      const l = pend.prog; pend.prog = null; syncPendLocal();
      const had = Object.keys(l.d).length || Object.keys(l.c).length || l.o;
      if (had) {
        p = p || cleanProg();
        p = { d: Object.assign({}, l.d, p.d), c: Object.assign({}, l.c, p.c), o: p.o || l.o };
        S.prog = p; saveProg(); refresh('prog'); return;
      }
    }
    if (!p) return;
    if (JSON.stringify(p) === JSON.stringify(S.prog)) return;
    if (progTimer) return; /* há escrita local a caminho */
    S.prog = p; refresh('prog');
  }, onErr);
}

/* ---------- voz ---------- */
let tts = null;
const webSpeech = typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';
if (webSpeech) document.body.classList.add('has-audio');
async function initVoice() {
  if (!window.claude || typeof window.claude.use !== 'function') return;
  try { tts = await window.claude.use('tts'); } catch (e) { tts = null; }
  if (tts) document.body.classList.add('has-audio');
}
function speak(text, own) {
  if (tts) return tts.speak(String(text).slice(0, 1900), own === false ? undefined : { language: 'pt-BR' });
  if (webSpeech) return new Promise((res, rej) => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = 'pt-BR';
      u.onend = () => res(); u.onerror = () => rej(new Error('voz'));
      window.speechSynthesis.speak(u);
    } catch (e) { rej(e); }
  });
  return Promise.reject(new Error('sem voz'));
}
function hush() { try { if (tts) tts.stop(); else if (webSpeech) window.speechSynthesis.cancel(); } catch (e) { /* nada */ } }

/* ---------- Áreas ---------- */
function areaCard(a) {
  const done = a.dip.filter(x => S.prog.d[dkey(x)] === 2).length;
  const pct = a.dip.length ? Math.round(done / a.dip.length * 100) : 0;
  const meta = (a.dip.length ? a.dip.length + (a.dip.length === 1 ? ' diploma' : ' diplomas') : 'doutrina') + ' · ' + a.oab + ' na OAB';
  return '<a class="card" href="#area-' + a.id + '" style="--c:' + cvar(a.id) + '"><span class="tab">' + a.sig + '</span><span class="cbody"><strong>' + esc(a.nome) +
    '</strong><span class="meta">' + meta + (done ? ' · ' + done + ' revisado' + (done > 1 ? 's' : '') : '') + '</span><span class="prog"><i style="width:' + pct + '%"></i></span></span></a>';
}
function vAreas() {
  let groups;
  if (ui.sort === 'oab') {
    const l = AREAS.slice().sort((x, y) => y.oab - x.oab);
    groups = '<section class="group"><p class="gh">Do maior para o menor peso na 1ª fase</p><div class="grid">' + l.map(areaCard).join('') + '</div></section>';
  } else {
    groups = RAMO_ORDER.map(r => '<section class="group" style="--c:var(--c-' + r + ')"><p class="gh"><i></i>' + RAMOS[r].nome + '</p><div class="grid">' +
      AREAS.filter(a => a.ramo === r).map(areaCard).join('') + '</div></section>').join('');
  }
  return '<section class="hero"><p class="eyebrow">Faculdade e Exame de Ordem</p>' +
    '<h1>Cada lei em um só lugar. As ligações, à vista.</h1>' +
    '<p class="lead">Os códigos e as leis estão distribuídos pelas áreas sem repetição. Onde um diploma toca outra matéria, você encontra uma conexão com o artigo que faz a ponte.</p>' +
    '<label class="search" for="q"><input id="q" type="search" autocomplete="off" placeholder="Busque: 8.245, usucapião, CTN" aria-label="Buscar código, lei ou tema"></label>' +
    '<div class="q-res" id="q-res" hidden></div>' +
    '<dl class="stats"><div><dt>' + AREAS.length + '</dt><dd>áreas</dd></div><div><dt>' + TOTAL_DIP + '</dt><dd>diplomas</dd></div><div><dt>' + EDGES.length + '</dt><dd>conexões</dd></div><div><dt>' + FLASH.length + '</dt><dd>cartões</dd></div></dl></section>' +
    '<div class="bar"><h2>Áreas</h2><div class="seg" role="group" aria-label="Ordenar áreas"><button data-act="sort" data-v="ramo" class="' + (ui.sort === 'ramo' ? 'on' : '') + '">Por ramo</button><button data-act="sort" data-v="oab" class="' + (ui.sort === 'oab' ? 'on' : '') + '">Por peso na OAB</button></div></div>' +
    groups +
    '<p class="foot">Os links abrem o texto compilado no Planalto. Lei muda: confira sempre a redação em vigor antes de citar.</p>';
}
function paintSearch(v) {
  const box = $('#q-res'); if (!box) return;
  const n = norm(v).trim();
  if (n.length < 2) { box.hidden = true; box.innerHTML = ''; return; }
  const out = [];
  AREAS.forEach(a => {
    if (norm(a.nome + ' ' + a.temas.join(' ') + ' ' + a.fac.join(' ')).includes(n)) out.push('<a href="#area-' + a.id + '"><span class="mono">' + a.sig + '</span><span>' + esc(a.nome) + ' <em>área</em></span></a>');
    a.dip.forEach(x => {
      if (norm(x.sig + ' ' + x.nome + ' ' + x.num + ' ' + x.desc).includes(n)) out.push('<a href="#area-' + a.id + '"><span class="mono">' + esc(x.num) + '</span><span>' + esc(x.nome) + ' <em>em ' + esc(a.nome) + '</em></span></a>');
    });
  });
  GLOSS.forEach(g => { if (norm(g.t).includes(n)) out.push('<a href="#caderno" data-act="goterm" data-t="' + esc(g.t) + '"><span class="mono">termo</span><span>' + esc(g.t) + ' <em>no vocabulário</em></span></a>'); });
  box.hidden = false;
  box.innerHTML = out.length ? out.slice(0, 12).join('') : '<a><span>Nada encontrado. Tente o número da lei ou um tema.</span></a>';
}

function stBtn(k) {
  const s = S.prog.d[k] || 0;
  return '<button class="st s' + s + '" data-act="st" data-k="' + k + '" aria-label="Situação: ' + ST[s] + '. Toque para mudar."><i></i>' + ST[s] + '</button>';
}
function vArea(a) {
  const edges = EDGES.filter(e => e.a === a.id || e.b === a.id);
  const cards = FLASH.filter(c => c.a === a.id).length;
  const rows = a.dip.map((x, di) => {
    const lab = x.url.indexOf('planalto') > 0 ? 'Abrir no Planalto' : 'Buscar no site da OAB';
    return '<div class="row"><div class="rowh"><h3><span class="mono muted">' + esc(x.sig) + '</span> ' + esc(x.nome) + '</h3><span class="mono num">' + esc(x.num) + '</span></div>' +
      '<p class="muted">' + esc(x.desc) + '</p>' +
      (x.est ? '<details class="est"><summary>Estrutura por artigos</summary><ol>' + x.est.map(e => '<li><span>' + esc(e[0]) + '</span><span class="mono">' + esc(e[1]) + '</span></li>').join('') + '</ol></details>' : '') +
      '<div class="acts">' + stBtn(dkey(x)) + (x.url ? '<a class="btn sm ghost" href="' + esc(x.url) + '" target="_blank" rel="noopener">' + lab + '</a>' : '') +
      '<button class="btn sm ghost ai-only" data-act="ai-dip" data-a="' + a.id + '" data-i="' + di + '">Explicar com IA</button></div><div class="ai-slot" id="ai-d-' + di + '"></div></div>';
  }).join('');
  const cons = edges.map(e => {
    const o = A[e.a === a.id ? e.b : e.a];
    return '<a class="con" href="#area-' + o.id + '" style="--c:' + cvar(o.id) + '"><b><i></i>' + esc(o.nome) + '</b><span>' + esc(e.t) + '</span><span class="mono">' + esc(e.n) + '</span></a>';
  }).join('');
  return '<header class="ahead" style="--c:' + cvar(a.id) + '"><a class="back" href="#areas">‹ Todas as áreas</a>' +
    '<div class="atitle"><span class="tab">' + a.sig + '</span><div><h1>' + esc(a.nome) + '</h1><p class="muted">' + RAMOS[a.ramo].nome + ' · ' + a.oab + ' questões na 1ª fase da OAB' + (OAB2.indexOf(a.id) >= 0 ? ' · opção na 2ª fase' : '') + '</p></div></div>' +
    (a.nota ? '<p class="note">' + esc(a.nota) + '</p>' : '') + '</header>' +
    '<section class="sec"><h2>Na faculdade</h2><div class="tags">' + a.fac.map(f => '<span class="tag">' + esc(f) + '</span>').join('') + '</div>' +
    '<h3>Temas que mais pesam</h3><div class="tags">' + a.temas.map(t => '<button class="tag c" data-act="ai-tema" data-a="' + a.id + '" data-t="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div>' +
    '<div class="ai-only" style="display:flex;flex-direction:column;gap:8px"><p class="muted" style="font-size:.84rem">Toque em um tema para a IA explicar, ou peça um artigo ou instituto.</p>' +
    expForm('ai-q-area', 'Explicar com IA um artigo ou instituto desta área', a.id, null) + '<div id="ai-area-out"></div></div></section>' +
    '<section class="sec"><h2>Códigos e leis desta área</h2>' + (a.semLei ? '<p class="note">' + esc(a.semLei) + '</p>' : '') +
    (rows ? '<div class="rows">' + rows + '</div>' : '') + '</section>' +
    '<section class="sec ai-only"><h2>Questões no estilo OAB</h2><p class="muted">A IA escreve 5 questões inéditas de múltipla escolha sobre esta área, com gabarito comentado. Conta como uma pergunta do seu limite diário.</p>' +
    '<div class="ctrl"><button class="btn rubi" data-act="ai-quiz" data-a="' + a.id + '">Gerar 5 questões</button></div><div id="ai-quiz-out"></div></section>' +
    '<section class="sec"><h2>Conexões</h2><p class="muted">O que esta área compartilha com as outras, e por qual artigo.</p><div class="rows">' + cons + '</div>' +
    '<div class="ctrl"><button class="btn ghost" data-act="seemap" data-id="' + a.id + '">Ver no mapa</button>' +
    (cards ? '<button class="btn ghost" data-act="train" data-id="' + a.id + '">Treinar ' + cards + ' cartões</button>' : '') +
    '<button class="btn" data-act="note" data-id="' + a.id + '">Anotar no caderno</button></div></section>';
}

/* ---------- Conexões ---------- */
const RING = ['fil', 'dh', 'int', 'elei', 'amb', 'adm', 'fin', 'trib', 'prev', 'trab', 'pt', 'pc', 'civ', 'emp', 'cdc', 'eca', 'pen', 'pp', 'oab'];
function xy(id) {
  if (id === 'cf') return [190, 190];
  const ang = -Math.PI / 2 + RING.indexOf(id) * 2 * Math.PI / RING.length;
  return [190 + 160 * Math.cos(ang), 190 + 160 * Math.sin(ang)];
}
function svgGraph() {
  const sel = ui.node, linked = {};
  EDGES.forEach(e => { if (e.a === sel) linked[e.b] = 1; if (e.b === sel) linked[e.a] = 1; });
  let back = '', front = '';
  EDGES.forEach((e, i) => {
    const p = xy(e.a), q = xy(e.b), on = e.a === sel || e.b === sel;
    const s = '<line class="e' + (on ? ' on' : '') + (i === ui.edge ? ' hot' : '') + '" x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '"/>';
    if (on) front += s; else back += s;
  });
  const nodes = AREAS.map(a => {
    const p = xy(a.id), cls = a.id === sel ? 'sel' : (linked[a.id] ? 'lk' : 'dim');
    return '<g class="n ' + cls + '" data-act="node" data-id="' + a.id + '" tabindex="0" role="button" aria-label="' + esc(a.nome) + '" style="--c:' + cvar(a.id) + '"><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="17.5"/><text x="' + p[0].toFixed(1) + '" y="' + p[1].toFixed(1) + '">' + a.sig + '</text></g>';
  }).join('');
  return '<svg viewBox="0 0 380 380" role="group" aria-label="Mapa de conexões entre as áreas do Direito">' + back + front + nodes + '</svg>';
}
function graphPanel() {
  const a = A[ui.node];
  const list = EDGES.map((e, i) => ({ e: e, i: i })).filter(x => x.e.a === a.id || x.e.b === a.id);
  return '<div class="sec"><h2>' + esc(a.nome) + '</h2><p class="muted">' + list.length + ' conexões. Toque em uma para destacar a linha no mapa.</p><div class="rows">' +
    list.map(x => {
      const o = A[x.e.a === a.id ? x.e.b : x.e.a];
      return '<button class="con' + (x.i === ui.edge ? ' on' : '') + '" data-act="edge" data-i="' + x.i + '" style="--c:' + cvar(o.id) + '"><b><i></i>' + esc(o.nome) + '</b><span>' + esc(x.e.t) + '</span><span class="mono">' + esc(x.e.n) + '</span></button>';
    }).join('') + '</div><div class="ctrl"><a class="btn ghost" href="#area-' + a.id + '">Abrir ' + esc(a.nome) + '</a></div></div>';
}
function vConexoes() {
  return '<header class="vh"><h1>Mapa de conexões</h1><p>A Constituição fica no centro porque alimenta todas as áreas. Toque em uma sigla para ver com quem ela conversa e por qual artigo.</p></header>' +
    '<div class="gwrap"><div><div id="graph">' + svgGraph() + '</div><ul class="legend" style="margin-top:10px">' +
    RAMO_ORDER.map(r => '<li style="--c:var(--c-' + r + ')"><i></i>' + RAMOS[r].nome + '</li>').join('') + '</ul></div><div id="gpanel">' + graphPanel() + '</div></div>' +
    '<section class="tool ai-only"><h2>Entender a relação com IA</h2><p>Selecione uma conexão na lista e peça a explicação, ou compare dois institutos de ramos diferentes.</p>' +
    '<div class="ctrl"><button class="btn rubi" data-act="ai-edge">Explicar a conexão selecionada</button></div>' +
    '<div class="two"><div class="field"><label for="ai-i1">Instituto 1</label><input id="ai-i1" maxlength="150" placeholder="Ex.: desconsideração da personalidade jurídica"></div>' +
    '<div class="field"><label for="ai-i2">Instituto 2</label><input id="ai-i2" maxlength="150" placeholder="Ex.: responsabilidade tributária do sócio"></div></div>' +
    '<div class="ctrl"><button class="btn ghost" data-act="ai-cmp">Relacionar os dois institutos</button></div><div id="ai-con-out"></div></section>';
}
function paintGraph() { const g = $('#graph'), p = $('#gpanel'); if (g) g.innerHTML = svgGraph(); if (p) p.innerHTML = graphPanel(); }

/* ---------- Ferramentas ---------- */
function tGraficas() {
  const w = [44, 58, 72, 86, 100];
  const lv = PIRAMIDE[ui.pyr];
  return '<section class="tool"><h2>Pirâmide normativa</h2><p>A hierarquia das normas no Brasil. Toque em um degrau.</p>' +
    '<div class="pyr">' + PIRAMIDE.map((p, i) => '<button data-act="pyr" data-i="' + i + '" class="' + (i === ui.pyr ? 'on' : '') + '" style="width:' + w[i] + '%">' + esc(p.t) + '</button>').join('') + '</div>' +
    '<div class="pd" id="pyr-d"><h3>' + esc(lv.t) + '</h3><p>' + esc(lv.d) + '</p><span class="mono" style="color:var(--rubi)">' + esc(lv.f) + '</span></div></section>' +

    '<section class="tool"><h2>Teoria do crime em três filtros</h2><p>Só há crime se a conduta passar pelos três, nesta ordem.</p><div class="tri">' +
    '<div><h3>1. Fato típico</h3><ol><li>Conduta dolosa ou culposa <small class="mono">CP, art. 18</small></li><li>Resultado</li><li>Nexo causal <small class="mono">CP, art. 13</small></li><li>Tipicidade</li></ol></div>' +
    '<div><h3>2. Ilicitude</h3><ol><li>Estado de necessidade <small class="mono">CP, art. 24</small></li><li>Legítima defesa <small class="mono">CP, art. 25</small></li><li>Estrito cumprimento de dever legal</li><li>Exercício regular de direito <small class="mono">CP, art. 23, III</small></li></ol><small>Presentes, excluem o crime.</small></div>' +
    '<div><h3>3. Culpabilidade</h3><ol><li>Imputabilidade <small class="mono">CP, arts. 26 a 28</small></li><li>Potencial consciência da ilicitude <small class="mono">CP, art. 21</small></li><li>Exigibilidade de conduta diversa <small class="mono">CP, art. 22</small></li></ol></div></div></section>' +

    '<section class="tool"><h2>Escada ponteana</h2><p>Os três planos do negócio jurídico, de baixo para cima.</p><div class="stairs">' +
    '<div><b>3. Eficácia</b><br>Condição, termo e encargo. <span class="mono">CC, arts. 121, 131 e 136</span></div>' +
    '<div><b>2. Validade</b><br>Agente capaz, objeto lícito, forma legal. Nulo ou anulável. <span class="mono">CC, arts. 104, 166 e 171</span></div>' +
    '<div><b>1. Existência</b><br>Agente, vontade, objeto e forma. <span class="mono">Doutrina (Pontes de Miranda)</span></div></div></section>' +

    '<section class="tool"><h2>Mais gráficos</h2><div class="links"><a href="#conexoes"><b>Mapa de conexões</b><span>As ' + EDGES.length + ' pontes entre as áreas.</span></a><a href="#oab"><b>Peso das disciplinas na OAB</b><span>Barras por número de questões.</span></a></div></section>';
}
function deck() { return FLASH.map((c, i) => Object.assign({ i: i }, c)).filter(c => ui.fcArea === 'todas' || c.a === ui.fcArea); }
function fcHtml() {
  const dk = deck(); if (ui.fcI >= dk.length) ui.fcI = 0;
  const c = dk[ui.fcI];
  let ok = 0, tot = 0;
  dk.forEach(x => { const r = S.prog.c['f' + x.i]; if (r) { ok += r[0]; tot += r[0] + r[1]; } });
  return '<button class="fc" data-act="flip"><span class="tag c" style="--c:' + cvar(c.a) + ';align-self:flex-start">' + esc(A[c.a].nome) + '</span><span class="q">' + esc(c.q) + '</span>' +
    (ui.fcFlip ? '<span class="a">' + esc(c.r) + '</span><span class="mono" style="color:var(--rubi)">' + esc(c.f) + '</span>' : '') +
    '<small>' + (ui.fcFlip ? '' : 'Toque para ver a resposta · ') + 'cartão ' + (ui.fcI + 1) + ' de ' + dk.length + '</small></button>' +
    '<div class="ctrl">' + (ui.fcFlip
      ? '<button class="btn ghost" data-act="fc-mark" data-r="0">Errei</button><button class="btn" data-act="fc-mark" data-r="1">Acertei</button>'
      : '<button class="btn ghost" data-act="fc-next">Pular</button>') +
    '<button class="say" data-act="say" data-say="' + esc(c.q + (ui.fcFlip ? ' Resposta: ' + c.r : '')) + '">Ouvir</button></div>' +
    '<p class="muted" style="font-size:.86rem">' + (tot ? 'Neste baralho você acertou ' + ok + ' de ' + tot + ' respostas.' : 'Marque Acertei ou Errei para acompanhar seu desempenho.') + '</p>';
}
function tVerbais() {
  const withCards = AREAS.filter(a => FLASH.some(c => c.a === a.id));
  return '<section class="tool"><h2>Cartões de pergunta e resposta</h2><p>Cada resposta traz o artigo de onde saiu.</p>' +
    '<div class="ctrl"><label for="fc-area" class="muted" style="font-size:.86rem">Baralho</label><select id="fc-area">' + opt('todas', 'Todas as áreas (' + FLASH.length + ')', ui.fcArea) +
    withCards.map(a => opt(a.id, a.nome, ui.fcArea)).join('') + '</select></div><div id="fc-box" style="display:flex;flex-direction:column;gap:12px">' + fcHtml() + '</div></section>' +
    '<section class="tool"><h2>Mnemônicos</h2><p>Atalhos de memória para listas que caem em prova.</p><div class="mn">' +
    MNEMO.map(m => '<div><b>' + esc(m.m) + '</b><strong>' + esc(m.t) + '</strong><span style="font-size:.9rem">' + esc(m.x) + '</span><span class="mono" style="color:var(--ink-2)">' + esc(m.f) + '</span>' +
      '<button class="say" data-act="say" data-say="' + esc(m.t + '. ' + m.x) + '">Ouvir</button></div>').join('') + '</div></section>' +
    '<section class="tool"><h2>Vocabulário jurídico</h2><p>O glossário base, com ' + GLOSS.length + ' termos e suas fontes, fica no Caderno, junto dos termos que você anotar.</p><div class="ctrl"><button class="btn ghost" data-act="govoc">Abrir o vocabulário</button></div></section>';
}
function tlHtml() {
  const T = TIMELINES.find(t => t.id === ui.tl);
  return '<ol class="tl" id="tl-list">' + T.passos.map((p, i) => '<li data-act="tl-step" data-i="' + i + '" tabindex="0" class="' + (i === ui.tlI ? 'on' : (i < ui.tlI ? 'done' : '')) + '"><div><b>' + esc(p.t) + '</b> <span class="mono" style="color:var(--rubi)">' + esc(p.n) + '</span><p>' + esc(p.d) + '</p></div></li>').join('') + '</ol>';
}
function tAudio() {
  const T = TIMELINES.find(t => t.id === ui.tl);
  return '<section class="tool"><h2>Linha do tempo narrada</h2><p>O procedimento passo a passo, com destaque na tela e, quando houver voz, leitura em voz alta.</p>' +
    '<p class="no-audio muted" style="font-size:.86rem">Neste aplicativo a voz não está disponível, então a apresentação avança sem som. No computador, pelo Chrome ou Edge, ela é narrada.</p>' +
    '<div class="ctrl"><select id="tl-sel" aria-label="Procedimento">' + TIMELINES.map(t => opt(t.id, t.nome, ui.tl)).join('') + '</select>' +
    '<button class="btn rubi" id="tl-btn" data-act="tl-play">' + (ui.tlPlay ? 'Parar' : 'Reproduzir') + '</button></div>' +
    '<p class="mono muted" id="tl-base">' + esc(T.base) + '</p><div id="tl-box">' + tlHtml() + '</div>' +
    '<div class="ctrl"><a class="btn ghost sm" href="#area-' + T.area + '" id="tl-area">Abrir a área deste procedimento</a></div></section>' +
    '<section class="tool only-audio"><h2>Ouvir cartões e mnemônicos</h2><p>Na aba Verbais, o botão Ouvir lê a pergunta, a resposta e os mnemônicos. Bom para revisar sem olhar a tela.</p></section>' +
    '<section class="tool"><h2>Vídeo e áudio de fontes oficiais</h2><p>Sessões de julgamento, aulas e programas. Achou uma videoaula boa? Guarde o link no Repertório, com a área e suas anotações.</p><div class="links">' +
    FONTES_AV.map(f => '<a href="' + f.u + '" target="_blank" rel="noopener"><b>' + esc(f.n) + '</b><span>' + esc(f.d) + '</span><span class="mono">' + esc(f.u.replace('https://', '').replace(/\/$/, '')) + '</span></a>').join('') + '</div>' +
    '<div class="ctrl"><button class="btn" data-act="note" data-id="">Guardar um link no Repertório</button></div></section>';
}
function vFerramentas() {
  const tabs = [['graficas', 'Gráficas'], ['verbais', 'Verbais'], ['audio', 'Audiovisuais'], ['ia', 'Com IA']];
  if (ui.tool === 'ia' && !AI.fn) ui.tool = 'graficas';
  const body = ui.tool === 'graficas' ? tGraficas() : ui.tool === 'verbais' ? tVerbais() : ui.tool === 'ia' ? tIA() : tAudio();
  return '<header class="vh"><h1>Ferramentas de estudo</h1><p>Três jeitos de fixar a mesma matéria: ver, dizer e ouvir.</p>' +
    '<div class="seg" role="group" aria-label="Tipo de ferramenta" style="align-self:flex-start">' + tabs.map(t => '<button data-act="tool" data-v="' + t[0] + '" class="' + (ui.tool === t[0] ? 'on' : '') + (t[0] === 'ia' ? ' ai-only' : '') + '">' + t[1] + '</button>').join('') + '</div></header>' + body;
}
function paintTl() {
  const list = $('#tl-list'), btn = $('#tl-btn');
  if (btn) btn.textContent = ui.tlPlay ? 'Parar' : 'Reproduzir';
  if (!list) return;
  Array.prototype.forEach.call(list.children, (li, i) => { li.className = i === ui.tlI ? 'on' : (i < ui.tlI ? 'done' : ''); });
  const on = list.children[ui.tlI];
  if (on && ui.tlPlay && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
function tlStop() { ui.tlTok++; if (ui.tlPlay) { ui.tlPlay = false; hush(); paintTl(); } }
async function tlPlay() {
  const my = ++ui.tlTok; ui.tlPlay = true;
  const T = TIMELINES.find(t => t.id === ui.tl);
  let start = ui.tlI < 0 || ui.tlI >= T.passos.length - 1 ? 0 : ui.tlI;
  for (let i = start; i < T.passos.length; i++) {
    if (my !== ui.tlTok) return;
    ui.tlI = i; paintTl();
    const p = T.passos[i], txt = 'Passo ' + (i + 1) + '. ' + p.t + '. ' + p.d;
    await Promise.race([speak(txt).catch(() => wait(3400)), wait(txt.length * 95 + 6000)]);
    if (my !== ui.tlTok) return;
    await wait(350);
  }
  if (my === ui.tlTok) { ui.tlPlay = false; paintTl(); }
}

/* ---------- OAB ---------- */
function picks() { return S.prog.o || ['oab', 'cf', 'civ', 'pc', 'pen', 'pp']; }
function oabBox() {
  const pk = picks(), sum = AREAS.reduce((n, a) => n + (pk.indexOf(a.id) >= 0 ? a.oab : 0), 0);
  const rows = AREAS.slice().sort((x, y) => y.oab - x.oab).map(a => {
    const on = pk.indexOf(a.id) >= 0;
    return '<button class="brow' + (on ? ' on' : '') + '" data-act="pick" data-id="' + a.id + '" style="--c:' + cvar(a.id) + '" aria-pressed="' + on + '"><span class="box">' + (on ? '✓' : '') + '</span><span>' +
      esc(a.id === 'fil' ? 'Filosofia do Direito' : a.nome.replace('Direito Processual', 'Processo').replace('Direito da Criança e do Adolescente', 'ECA').replace(/^Direito (do |da |dos )?/, '').replace(/^Direitos /, 'Direitos ')) +
      '</span><span class="trk"><i style="width:' + (a.oab / 8 * 100) + '%"></i></span><span class="v">' + a.oab + '</span></button>';
  }).join('');
  const msg = sum >= 40 ? 'Acertando tudo nelas, você passa da linha com ' + (sum - 40) + ' de folga.' : 'Ainda faltam ' + (40 - sum) + ' para chegar à linha de corte.';
  return '<div class="meter"><p><strong>' + sum + ' de 80 questões</strong> estão nas disciplinas marcadas. ' + msg + '</p><div class="trk"><i style="width:' + (sum / 80 * 100) + '%"></i></div><small>A linha vertical marca os 40 acertos exigidos.</small></div><div class="bars">' + rows + '</div>';
}
function vOab() {
  return '<header class="vh"><h1>Exame de Ordem</h1><p>Como a prova se distribui e onde concentrar o estudo.</p></header>' +
    '<div class="tiles"><div><b>80</b><span>questões objetivas na 1ª fase</span></div><div><b>40</b><span>acertos para passar</span></div><div><b>20</b><span>disciplinas cobradas</span></div><div><b>5 h</b><span>de prova em cada fase</span></div></div>' +
    '<section class="tool"><h2>Peso de cada disciplina na 1ª fase</h2><p>Marque as disciplinas que você pretende dominar e veja quanto da prova elas cobrem.</p><div id="oab-box" style="display:flex;flex-direction:column;gap:14px">' + oabBox() + '</div></section>' +
    pecasSec() +
    '<p class="foot">Distribuição em vigor desde a inclusão de Eleitoral, Financeiro e Previdenciário na prova. O edital de cada exame é a fonte que vale: confira em <a href="https://oab.fgv.br/" target="_blank" rel="noopener">oab.fgv.br</a>.</p>';
}


/* ---------- Peças da 2ª fase ---------- */
function pecaTxt(P, x) {
  return x.n + '\n' + P.nome + ' · 2ª fase da OAB\n\nQuando cabe: ' + x.q + '\nBase legal: ' + x.b + '\nPrazo: ' + x.p + '\nEndereçamento: ' + x.e +
    '\n\nESTRUTURA\n' + EST[x.est].map((t, i) => (i + 1) + '. ' + t).join('\n') + '\n\nPEDIDOS\n' + x.ped.map(t => '- ' + t).join('\n') + '\n\nATENÇÃO\n' + x.d;
}
function pecaHtml(P, x, i) {
  const open = i === ui.pOpen;
  return '<article class="pc' + (open ? ' open' : '') + '">' +
    '<button class="pc-h" data-act="pc-open" data-i="' + i + '" aria-expanded="' + open + '"><span class="pc-n">' + esc(x.n) + '</span><span class="pc-p mono">' + esc(x.p) + '</span><span class="pc-x" aria-hidden="true">' + (open ? '−' : '+') + '</span></button>' +
    (open ? '<div class="pc-b">' +
      '<dl class="pc-dl"><div><dt>Quando cabe</dt><dd>' + esc(x.q) + '</dd></div><div><dt>Base legal</dt><dd class="mono src">' + esc(x.b) + '</dd></div>' +
      '<div><dt>Endereçamento</dt><dd>' + esc(x.e) + '</dd></div></dl>' +
      '<div class="pc-cols"><div><h3>Estrutura</h3><ol class="pc-est">' + EST[x.est].map(t => '<li>' + esc(t) + '</li>').join('') + '</ol></div>' +
      '<div><h3>Pedidos</h3><ul class="pc-ped">' + x.ped.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul><p class="note" style="margin-top:10px">' + esc(x.d) + '</p></div></div>' +
      '<div class="acts"><button class="say" data-act="say" data-say="' + esc(x.n + '. Quando cabe: ' + x.q + ' Prazo: ' + x.p + '. Atenção: ' + x.d) + '">Ouvir</button>' +
      '<button class="btn sm ghost" data-act="pc-save" data-i="' + i + '">Guardar no repertório</button>' +
      '<button class="btn sm ghost ai-only" data-act="pc-exp" data-i="' + i + '">Explicar com IA</button>' +
      '<button class="btn sm rubi ai-only" data-act="pc-caso" data-i="' + i + '">Gerar caso para treinar</button></div>' +
      '<div class="pc-ai" id="pc-ai-' + i + '"></div></div>' : '') + '</article>';
}
function pecasBody() {
  const P = PECAS[ui.pa];
  return '<p class="muted" style="font-size:.88rem">' + esc(P.base) + ' · ' + P.lista.length + ' peças. Toque em uma para ver estrutura e pedidos.</p>' +
    (P.ver ? P.ver.map(v => '<p class="note">' + esc(v) + '</p>').join('') : '') +
    '<div class="pcs">' + P.lista.map((x, i) => pecaHtml(P, x, i)).join('') + '</div>' +
    '<div class="ctrl"><a class="btn sm ghost" href="#area-' + ui.pa + '">Abrir ' + esc(A[ui.pa].nome) + '</a></div>';
}
function pecasSec() {
  return '<section class="tool" id="pecas"><h2>Peças da 2ª fase</h2><p>Escolha a área de opção. Cada peça traz quando cabe, base legal, prazo, endereçamento, estrutura e pedidos.</p>' +
    '<div class="pa-chips" role="group" aria-label="Área da 2ª fase">' + OAB2.map(id => '<button class="pa' + (id === ui.pa ? ' on' : '') + '" data-act="pa" data-v="' + id + '" style="--c:' + cvar(id) + '"><i></i>' + esc(PECAS[id].nome.replace(/^Direito (do |da )?/, '')) + '</button>').join('') + '</div>' +
    '<div class="ident"><h3>Como identificar a peça</h3><ol>' + IDENTIFICAR.map(x => '<li><b>' + esc(x.t) + '</b><span>' + esc(x.d) + '</span></li>').join('') + '</ol></div>' +
    '<div id="pecas-box" style="display:flex;flex-direction:column;gap:10px">' + pecasBody() + '</div>' +
    '<div class="rules"><h3>Regras da prova que zeram a peça</h3><ul>' +
    '<li>Peça inadequada para o problema recebe nota zero na peça.</li>' +
    '<li>Assine só "Advogado..." e use "Local...", "Data...", "OAB...". Qualquer outro dado que identifique você leva a nota zero.</li>' +
    '<li>Respeite a ordem (peça e depois as 4 questões) e o número de linhas.</li>' +
    '<li>Aprovação com nota 6,0, sem arredondamento. Consulta só a legislação e súmulas sem anotação (Provimento 144/2011 do CFOAB, art. 11).</li></ul>' +
    '<p class="muted" style="font-size:.8rem">Confira as regras no edital do seu exame, em <a href="https://oab.fgv.br/" target="_blank" rel="noopener">oab.fgv.br</a>.</p></div></section>';
}
function paintPecas() { const b = $('#pecas-box'); if (b) b.innerHTML = pecasBody(); }

/* ---------- Caderno ---------- */
function areaOpts(sel, first) { return opt('', first, sel) + AREAS.map(a => opt(a.id, a.nome, sel)).join(''); }
function repForm() {
  const it = ui.repEdit ? S.rep.find(x => x.id === ui.repEdit) : null;
  const v = it || { titulo: '', area: ui.pre || '', tipo: 'Resumo', texto: '', link: '', rel: [] };
  return '<form class="box" id="rep-form" novalidate><h3>' + (it ? 'Editar anotação' : 'Nova anotação') + '</h3>' +
    '<div class="field"><label for="rep-titulo">Título</label><input id="rep-titulo" maxlength="140" value="' + esc(v.titulo) + '" placeholder="Ex.: Solidariedade passiva"></div>' +
    '<div class="two"><div class="field"><label for="rep-area">Área</label><select id="rep-area">' + areaOpts(v.area, 'Geral') + '</select></div>' +
    '<div class="field"><label for="rep-tipo">Tipo</label><select id="rep-tipo">' + TIPOS.map(t => opt(t, t, v.tipo)).join('') + '</select></div></div>' +
    '<div class="field"><label for="rep-texto">Conteúdo</label><textarea id="rep-texto" placeholder="Resumo, fichamento, trecho de julgado, sua explicação com as próprias palavras">' + esc(v.texto) + '</textarea></div>' +
    '<div class="field"><label for="rep-link">Link (videoaula, áudio, julgado, PDF)</label><input id="rep-link" inputmode="url" value="' + esc(v.link) + '" placeholder="https://"></div>' +
    '<details' + (v.rel && v.rel.length ? ' open' : '') + '><summary class="muted" style="font-size:.86rem;cursor:pointer">Relacionar com outras áreas</summary><div class="checks">' +
    AREAS.map(a => '<label for="rel-' + a.id + '"><input type="checkbox" id="rel-' + a.id + '" value="' + a.id + '"' + (v.rel && v.rel.indexOf(a.id) >= 0 ? ' checked' : '') + '>' + esc(a.sig) + '</label>').join('') + '</div></details>' +
    '<div class="ctrl"><button class="btn rubi" type="submit">' + (it ? 'Salvar alterações' : 'Guardar no repertório') + '</button>' + (it ? '<button class="btn ghost" type="button" data-act="rep-cancel">Cancelar</button>' : '') + '</div></form>';
}
function repItem(it, ex) {
  const a = A[it.area], long = (it.texto || '').length > 300 || (it.texto || '').split('\n').length > 6;
  const link = /^https?:\/\//i.test(it.link || '') ? '<a class="mono" href="' + esc(it.link) + '" target="_blank" rel="noopener" style="overflow-wrap:anywhere">' + esc(it.link) + '</a>' : '';
  return '<article class="item' + (ex ? ' ex' : '') + '" style="--c:' + (a ? cvar(a.id) : 'var(--c-base)') + '"><div class="tags">' + (ex ? '<span class="tag" style="border-color:var(--warn)">Exemplo</span>' : '') +
    '<span class="tag">' + esc(it.tipo || 'Resumo') + '</span><span class="tag c">' + esc(a ? a.nome : 'Geral') + '</span>' +
    (it.rel || []).filter(r => A[r]).map(r => '<span class="tag">↔ ' + esc(A[r].nome) + '</span>').join('') + '</div>' +
    '<h3>' + esc(it.titulo) + '</h3>' + (it.texto ? '<div class="body">' + esc(it.texto) + '</div>' : '') + link +
    (ex ? '<small class="muted">Some quando você guardar a primeira anotação.</small>' :
      '<div class="acts">' + (long ? '<button class="btn sm ghost" data-act="more">Ver tudo</button>' : '') +
      '<button class="btn sm ghost" data-act="rep-edit" data-id="' + esc(it.id) + '">Editar</button><button class="btn sm danger" data-act="del" data-kind="rep" data-id="' + esc(it.id) + '">Apagar</button>' +
      '<small class="muted">' + (it.c ? new Date(it.c).toLocaleDateString('pt-BR') : '') + '</small></div>') + '</article>';
}
function paintRep() {
  const box = $('#rep-list'); if (!box) return;
  const q = norm(ui.repQ);
  const list = S.rep.filter(it => (!ui.repArea || it.area === ui.repArea || (it.rel || []).indexOf(ui.repArea) >= 0) && (!ui.repTipo || it.tipo === ui.repTipo) &&
    (!q || norm(it.titulo + ' ' + it.texto).includes(q))).sort((x, y) => (y.c || 0) - (x.c || 0));
  if (!S.rep.length) {
    box.innerHTML = repItem({ titulo: 'Solidariedade não se presume', area: 'civ', tipo: 'Fichamento', rel: ['cdc'], texto: 'CC, art. 265: a solidariedade resulta da lei ou da vontade das partes.\nPonte com o consumidor: o CDC, art. 7º, parágrafo único, cria solidariedade legal entre os fornecedores que causaram o dano.' }, true);
  } else {
    box.innerHTML = list.length ? list.map(it => repItem(it)).join('') : '<p class="empty">Nenhuma anotação com esse filtro.</p>';
  }
  const n = $('#rep-n'); if (n) n.textContent = S.rep.length ? S.rep.length + (S.rep.length === 1 ? ' anotação' : ' anotações') : '';
}
function vocForm() {
  const it = ui.vocEdit ? S.voc.find(x => x.id === ui.vocEdit) : null;
  const v = it || { termo: '', def: '', fonte: '', uso: '', area: '' };
  return '<form class="box" id="voc-form" novalidate><h3>' + (it ? 'Editar termo' : 'Novo termo') + '</h3>' +
    '<div class="two"><div class="field"><label for="voc-termo">Termo ou expressão</label><input id="voc-termo" maxlength="100" value="' + esc(v.termo) + '" placeholder="Ex.: Sub-rogação"></div>' +
    '<div class="field"><label for="voc-area">Área</label><select id="voc-area">' + areaOpts(v.area, 'Geral') + '</select></div></div>' +
    '<div class="field"><label for="voc-def">Significado, com as suas palavras</label><textarea id="voc-def" style="min-height:84px">' + esc(v.def) + '</textarea>' +
    '<div class="ctrl ai-only"><button type="button" class="btn sm ghost" data-act="ai-def">Sugerir definição com IA</button></div><div id="ai-def-out"></div></div>' +
    '<div class="two"><div class="field"><label for="voc-fonte">Fonte (lei e artigo, autor, aula)</label><input id="voc-fonte" maxlength="400" value="' + esc(v.fonte) + '" placeholder="Ex.: CC, art. 346"></div>' +
    '<div class="field"><label for="voc-uso">Exemplo de uso</label><input id="voc-uso" maxlength="240" value="' + esc(v.uso) + '" placeholder="Uma frase em que o termo aparece"></div></div>' +
    '<div class="ctrl"><button class="btn rubi" type="submit">' + (it ? 'Salvar alterações' : 'Guardar no vocabulário') + '</button>' + (it ? '<button class="btn ghost" type="button" data-act="voc-cancel">Cancelar</button>' : '') + '</div></form>';
}
function vocItem(it) {
  const a = A[it.area];
  return '<article class="item" style="--c:' + (a ? cvar(a.id) : 'var(--c-base)') + '"><h3>' + esc(it.termo) + '</h3><p>' + esc(it.def) + '</p>' +
    (it.fonte ? '<span class="mono src">' + esc(it.fonte) + '</span>' : '') + (it.uso ? '<span class="use">' + esc(it.uso) + '</span>' : '') +
    '<div class="acts">' + (a ? '<span class="tag c">' + esc(a.nome) + '</span>' : '') +
    '<button class="say" data-act="say" data-own="0" data-say="' + esc(it.termo + '. ' + it.def) + '">Ouvir</button>' +
    '<button class="btn sm ghost" data-act="voc-edit" data-id="' + esc(it.id) + '">Editar</button><button class="btn sm danger" data-act="del" data-kind="voc" data-id="' + esc(it.id) + '">Apagar</button></div></article>';
}
function paintVoc() {
  const box = $('#voc-list'); if (!box) return;
  const q = norm(ui.vocQ);
  const mine = S.voc.filter(it => !q || norm(it.termo + ' ' + it.def).includes(q)).sort((x, y) => norm(x.termo).localeCompare(norm(y.termo)));
  let h = '<h2>Meus termos' + (S.voc.length ? ' (' + S.voc.length + ')' : '') + '</h2>';
  if (!mine.length) h += '<p class="empty">' + (S.voc.length ? 'Nenhum termo seu com essa busca.' : 'Você ainda não anotou termos. Use o formulário acima ou guarde um termo do glossário base.') + '</p>';
  let last = '';
  mine.forEach(it => { const l = (norm(it.termo)[0] || '#').toUpperCase(); if (l !== last) { h += '<div class="letter">' + esc(l) + '</div>'; last = l; } h += vocItem(it); });
  const have = {}; S.voc.forEach(it => { have[norm(it.termo)] = 1; });
  const base = GLOSS.map((g, i) => ({ g: g, i: i })).filter(x => !q || norm(x.g.t + ' ' + x.g.d).includes(q));
  h += '<h2 style="margin-top:14px">Glossário base (' + GLOSS.length + ')</h2><p class="muted" style="font-size:.88rem">Termos de partida, cada um com a fonte. Guarde os que quiser para editar com as suas palavras.</p>';
  h += base.length ? base.map(x => '<article class="item"><h3>' + esc(x.g.t) + '</h3><p>' + esc(x.g.d) + '</p><span class="mono src">' + esc(x.g.f) + '</span><div class="acts">' +
    '<button class="say" data-act="say" data-say="' + esc(x.g.t + '. ' + x.g.d) + '">Ouvir</button>' +
    (have[norm(x.g.t)] ? '<span class="tag">Já está nos seus termos</span>' : '<button class="btn sm ghost" data-act="glo-save" data-i="' + x.i + '">Guardar nos meus termos</button>') + '</div></article>').join('') : '<p class="empty">Nenhum termo do glossário com essa busca.</p>';
  box.innerHTML = h;
}
function ioRow() {
  return '<div class="ctrl"><label class="btn sm ghost" for="imp-file">Importar arquivo</label><input type="file" id="imp-file" accept=".json,application/json" hidden>' +
    '<button class="btn sm ghost site-only" data-act="exp">Exportar caderno</button>' +
    '<span class="muted" style="font-size:.8rem">Arquivo .json com anotações e termos.</span></div>' +
    '<p class="note site-only">Seu caderno fica salvo só neste navegador. Para não perder nada ou usar em outro aparelho, exporte o arquivo e importe no outro.</p>';
}
function exportCaderno() {
  const d = new Date(), p = n => (n < 10 ? '0' : '') + n;
  const blob = new Blob([JSON.stringify({ codex: 1, exportado: d.toISOString(), rep: S.rep, voc: S.voc }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'codex-caderno-' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Caderno exportado: ' + S.rep.length + ' anotações e ' + S.voc.length + ' termos.');
}
function vCaderno() {
  const head = '<header class="vh"><h1>Meu caderno</h1><p>Seu repertório de estudos e o seu vocabulário jurídico. Só você vê o que guarda aqui.</p>' +
    '<div class="seg" role="group" aria-label="Parte do caderno" style="align-self:flex-start"><button data-act="cad" data-v="rep" class="' + (ui.cad === 'rep' ? 'on' : '') + '">Repertório</button><button data-act="cad" data-v="voc" class="' + (ui.cad === 'voc' ? 'on' : '') + '">Vocabulário</button></div></header>';
  if (ui.cad === 'rep') {
    return head + repForm() + ioRow() +
      '<section class="sec"><div class="bar"><h2>Repertório</h2><span class="muted" id="rep-n" style="font-size:.86rem"></span></div>' +
      '<div class="ctrl"><input id="rep-q" type="search" placeholder="Buscar nas anotações" aria-label="Buscar nas anotações" value="' + esc(ui.repQ) + '" style="flex:1 1 180px;padding:10px 11px;border:1px solid var(--ink-2);border-radius:var(--r);background:var(--sheet)">' +
      '<select id="rep-farea" aria-label="Filtrar por área">' + areaOpts(ui.repArea, 'Todas as áreas') + '</select>' +
      '<select id="rep-ftipo" aria-label="Filtrar por tipo">' + opt('', 'Todos os tipos', ui.repTipo) + TIPOS.map(t => opt(t, t, ui.repTipo)).join('') + '</select></div>' +
      '<div class="list" id="rep-list"></div></section>';
  }
  return head + vocForm() + ioRow() +
    '<section class="sec"><div class="ctrl"><input id="voc-q" type="search" placeholder="Buscar um termo" aria-label="Buscar um termo" value="' + esc(ui.vocQ) + '" style="flex:1 1 180px;padding:10px 11px;border:1px solid var(--ink-2);border-radius:var(--r);background:var(--sheet)"></div>' +
    '<div class="list" id="voc-list"></div></section>';
}

/* ---------- importação por arquivo ---------- */
async function importFile(file) {
  let data;
  try { data = JSON.parse(await file.text()); } catch (e) { toast('Não consegui ler o arquivo. Ele precisa ser um .json do Códex.'); return; }
  const str = (v, n) => String(v == null ? '' : v).slice(0, n);
  const idOf = (x, p) => /^[A-Za-z0-9_-]{1,60}$/.test(String(x.id || '')) ? String(x.id) : uid8(p);
  const rep = (data && Array.isArray(data.rep) ? data.rep : []).slice(0, 300).filter(x => x && x.titulo).map(x => ({
    id: idOf(x, 'r'), titulo: str(x.titulo, 140), area: A[x.area] ? x.area : '', tipo: TIPOS.indexOf(x.tipo) >= 0 ? x.tipo : 'Resumo',
    texto: str(x.texto, 60000), link: /^https?:\/\//i.test(String(x.link || '')) ? str(x.link, 500) : '',
    rel: (Array.isArray(x.rel) ? x.rel : []).filter(r => A[r] && r !== x.area), c: +x.c || Date.now(), u: Date.now()
  }));
  const voc = (data && Array.isArray(data.voc) ? data.voc : []).slice(0, 500).filter(x => x && x.termo && x.def).map(x => ({
    id: idOf(x, 'v'), termo: str(x.termo, 100), def: str(x.def, 4000), fonte: str(x.fonte, 400), uso: str(x.uso, 240), area: A[x.area] ? x.area : '', c: +x.c || Date.now()
  }));
  const total = rep.length + voc.length;
  if (!total) { toast('O arquivo não traz anotações nem termos do Códex.'); return; }
  toast('Importando ' + total + ' itens…');
  let ok = 0, stop = false;
  for (const pair of [['rep', rep], ['voc', voc]]) {
    for (const it of pair[1]) {
      if (S.cloud) {
        const body = Object.assign({}, it); delete body.id;
        try { await cols[pair[0]].doc(it.id).set(body); } catch (e) { fail(e); stop = true; break; }
      }
      const i = S[pair[0]].findIndex(y => y.id === it.id);
      if (i >= 0) S[pair[0]][i] = it; else S[pair[0]].push(it);
      ok++;
    }
    if (stop) break;
  }
  persistLocal(); paintRep(); paintVoc();
  if (ok) toast(ok < total ? 'Importação incompleta: só ' + ok + ' de ' + total + ' itens foram gravados.' : 'Importação concluída: ' + (rep.length ? rep.length + ' anotações' : '') + (rep.length && voc.length ? ' e ' : '') + (voc.length ? voc.length + ' termos' : '') + '.');
}

/* ---------- roteamento ---------- */
function cur() {
  const h = location.hash.slice(1);
  if (h.indexOf('area-') === 0 && A[h.slice(5)]) return 'area';
  return VIEWS.indexOf(h) >= 0 ? h : 'areas';
}
function render(keep) {
  const v = cur();
  tlStop(); hush();
  main.innerHTML = v === 'area' ? vArea(A[location.hash.slice(6)]) : v === 'conexoes' ? vConexoes() : v === 'ferramentas' ? vFerramentas() : v === 'oab' ? vOab() : v === 'caderno' ? vCaderno() : vAreas();
  Array.prototype.forEach.call($('#nav').children, a => { a.className = (a.dataset.v === v || (v === 'area' && a.dataset.v === 'areas')) ? 'on' : ''; });
  if (v === 'caderno') { paintRep(); paintVoc(); }
  paintUso();
  if (!keep) window.scrollTo(0, 0);
}
function refresh(kind) {
  if (kind === 'rep') paintRep();
  if (kind === 'voc') paintVoc();
  if (kind === 'prog') {
    const v = cur(), ae = document.activeElement;
    const typing = ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName);
    if (!typing && (v === 'areas' || v === 'area' || v === 'oab')) render(true);
  }
}
function go(h) { if (location.hash === '#' + h) render(); else location.hash = h; }

/* ---------- eventos ---------- */
main.addEventListener('click', ev => {
  const b = ev.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, d = b.dataset;
  if (aiAct(b)) return;
  switch (act) {
    case 'sort': ui.sort = d.v; render(true); break;
    case 'goterm': ui.cad = 'voc'; ui.vocQ = d.t; break;
    case 'exp': exportCaderno(); break;
    case 'govoc': ui.cad = 'voc'; ui.vocQ = ''; go('caderno'); break;
    case 'st': {
      const n = ((S.prog.d[d.k] || 0) + 1) % 3;
      if (n) S.prog.d[d.k] = n; else delete S.prog.d[d.k];
      saveProg(); b.outerHTML = stBtn(d.k); break;
    }
    case 'seemap': ui.node = d.id; ui.edge = -1; go('conexoes'); break;
    case 'train': ui.tool = 'verbais'; ui.fcArea = d.id; ui.fcI = 0; ui.fcFlip = false; go('ferramentas'); break;
    case 'note': ui.cad = 'rep'; ui.repEdit = null; ui.pre = d.id || null; go('caderno'); break;
    case 'node': ui.node = d.id; ui.edge = -1; paintGraph(); break;
    case 'edge': ui.edge = ui.edge === +d.i ? -1 : +d.i; paintGraph(); break;
    case 'tool': ui.tool = d.v; render(true); break;
    case 'pyr': ui.pyr = +d.i; render(true); break;
    case 'flip': ui.fcFlip = !ui.fcFlip; $('#fc-box').innerHTML = fcHtml(); break;
    case 'fc-next': ui.fcI++; ui.fcFlip = false; $('#fc-box').innerHTML = fcHtml(); break;
    case 'fc-mark': {
      const c = deck()[ui.fcI], k = 'f' + c.i, r = S.prog.c[k] ? S.prog.c[k].slice() : [0, 0];
      if (d.r === '1') r[0]++; else r[1]++;
      S.prog.c[k] = r; saveProg(); ui.fcI++; ui.fcFlip = false; $('#fc-box').innerHTML = fcHtml(); break;
    }
    case 'say': speak(d.say, d.own !== '0').catch(() => { /* voz indisponível */ }); break;
    case 'tl-play': if (ui.tlPlay) tlStop(); else tlPlay(); break;
    case 'tl-step': tlStop(); ui.tlI = +d.i; paintTl(); { const p = TIMELINES.find(t => t.id === ui.tl).passos[ui.tlI]; speak(p.t + '. ' + p.d).catch(() => {}); } break;
    case 'pa': ui.pa = d.v; ui.pOpen = -1; Array.prototype.forEach.call(document.querySelectorAll('.pa'), x => x.classList.toggle('on', x.dataset.v === d.v)); paintPecas(); break;
    case 'pc-open': ui.pOpen = ui.pOpen === +d.i ? -1 : +d.i; paintPecas(); break;
    case 'pc-save': {
      const P = PECAS[ui.pa], x = P.lista[+d.i], id = 'peca-' + ui.pa + '-' + d.i;
      saveItem('rep', { id: id, titulo: 'Peça: ' + x.n, area: ui.pa, tipo: 'Peça', texto: pecaTxt(P, x), link: '', rel: [], c: Date.now(), u: Date.now() });
      b.textContent = 'Guardada no repertório'; b.disabled = true; break;
    }
    case 'pick': {
      const pk = picks().slice(), i = pk.indexOf(d.id);
      if (i >= 0) pk.splice(i, 1); else pk.push(d.id);
      S.prog.o = pk; saveProg(); $('#oab-box').innerHTML = oabBox(); break;
    }
    case 'cad': ui.cad = d.v; ui.repEdit = null; ui.vocEdit = null; render(true); break;
    case 'more': { const it = b.closest('.item'); it.classList.toggle('open'); b.textContent = it.classList.contains('open') ? 'Recolher' : 'Ver tudo'; break; }
    case 'rep-edit': ui.repEdit = d.id; render(); break;
    case 'rep-cancel': ui.repEdit = null; render(true); break;
    case 'voc-edit': ui.vocEdit = d.id; render(); break;
    case 'voc-cancel': ui.vocEdit = null; render(true); break;
    case 'del':
      if (d.sure) { removeItem(d.kind, d.id); if (d.kind === 'rep') paintRep(); else paintVoc(); toast('Apagado.'); }
      else { b.dataset.sure = '1'; b.textContent = 'Confirmar exclusão'; setTimeout(() => { if (b.isConnected) { delete b.dataset.sure; b.textContent = 'Apagar'; } }, 4000); }
      break;
    case 'glo-save': {
      const g = GLOSS[+d.i];
      saveItem('voc', { id: uid8('v'), termo: g.t, def: g.d, fonte: g.f, uso: '', area: '', c: Date.now() });
      paintVoc(); toast('Guardado nos seus termos. Edite com as suas palavras.'); break;
    }
  }
});
main.addEventListener('keydown', ev => {
  if (ev.key !== 'Enter' && ev.key !== ' ') return;
  const t = ev.target;
  if (t && t.dataset && t.dataset.act && t.tagName !== 'BUTTON' && t.tagName !== 'A') { ev.preventDefault(); t.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
});
main.addEventListener('input', ev => {
  const t = ev.target;
  if (t.id === 'q') paintSearch(t.value);
  else if (t.id === 'rep-q') { ui.repQ = t.value; paintRep(); }
  else if (t.id === 'voc-q') { ui.vocQ = t.value; paintVoc(); }
});
main.addEventListener('change', ev => {
  const t = ev.target;
  if (t.id === 'fc-area') { ui.fcArea = t.value; ui.fcI = 0; ui.fcFlip = false; $('#fc-box').innerHTML = fcHtml(); }
  else if (t.id === 'tl-sel') {
    tlStop(); ui.tl = t.value; ui.tlI = -1;
    const T = TIMELINES.find(x => x.id === ui.tl);
    $('#tl-box').innerHTML = tlHtml(); $('#tl-base').textContent = T.base; $('#tl-area').setAttribute('href', '#area-' + T.area);
  }
  else if (t.id === 'imp-file') { if (t.files && t.files[0]) importFile(t.files[0]); t.value = ''; }
  else if (t.id === 'rep-farea') { ui.repArea = t.value; paintRep(); }
  else if (t.id === 'rep-ftipo') { ui.repTipo = t.value; paintRep(); }
});
main.addEventListener('submit', ev => {
  ev.preventDefault();
  const f = ev.target;
  if (f.id === 'rep-form') {
    const titulo = $('#rep-titulo').value.trim(), texto = $('#rep-texto').value.trim();
    let link = $('#rep-link').value.trim();
    if (!titulo) { toast('Dê um título à anotação.'); $('#rep-titulo').focus(); return; }
    if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link;
    const old = ui.repEdit ? S.rep.find(x => x.id === ui.repEdit) : null;
    const rel = Array.prototype.map.call(f.querySelectorAll('.checks input:checked'), c => c.value).filter(r => r !== $('#rep-area').value);
    saveItem('rep', { id: old ? old.id : uid8('r'), titulo: titulo, area: $('#rep-area').value, tipo: $('#rep-tipo').value, texto: texto, link: link, rel: rel, c: old ? old.c : Date.now(), u: Date.now() });
    ui.repEdit = null; ui.pre = null; render(true); toast('Anotação guardada.');
  } else if (f.id === 'voc-form') {
    const termo = $('#voc-termo').value.trim(), def = $('#voc-def').value.trim();
    if (!termo || !def) { toast('Preencha o termo e o significado.'); (termo ? $('#voc-def') : $('#voc-termo')).focus(); return; }
    const old = ui.vocEdit ? S.voc.find(x => x.id === ui.vocEdit) : null;
    saveItem('voc', { id: old ? old.id : uid8('v'), termo: termo, def: def, fonte: $('#voc-fonte').value.trim(), uso: $('#voc-uso').value.trim(), area: $('#voc-area').value, c: old ? old.c : Date.now() });
    ui.vocEdit = null; render(true); toast('Termo guardado.');
  }
});
window.addEventListener('hashchange', () => render());


/* ================= IA (recurso sample) ================= */
const LIMITE = 20;
const FN = { explicar: 'Explicar', questoes: 'Questões OAB', pecas: 'Caso de peça', corrigir: 'Corrigir resposta', definicao: 'Definição', conexao: 'Conexões', chat: 'Chat de dúvidas' };
const AI = { fn: null, busy: false, ctl: null, seq: 0, reg: {}, chat: [], uso: { dia: '', n: 0, f: {} }, usoDoc: null, usoLocal: false, owner: false, chain: Promise.resolve() };
const LSU = 'codex-ia-uso', LSR = 'codex-ia-denuncias';
const HIDE = ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'];
const MAIN_LINKS = ['CF/88', 'CC', 'CPC', 'CP', 'CPP', 'CLT', 'CTN', 'CDC', 'ECA', 'EAOAB', 'LINDB', 'LEF', 'LEP'];
const LINKS = (function () { const o = []; AREAS.forEach(a => a.dip.forEach(x => { if (MAIN_LINKS.indexOf(x.sig) >= 0) o.push('- ' + x.sig + ' (' + x.num + '): ' + x.url); })); return o.join('\n'); })();
const RULES = 'Você é professor de Direito para alunos de graduação e do Exame de Ordem (OAB/FGV). Responda sempre em português do Brasil.\n' +
  'REGRAS OBRIGATÓRIAS:\n' +
  '1. Cite sempre a fonte: lei, artigo e o link do Planalto, para o aluno conferir a vigência. Use o link informado no trecho em estudo ou na lista abaixo. Se não tiver certeza do número do artigo, diga expressamente que não tem certeza do artigo. Nunca invente artigo, súmula ou julgado. Se não souber o link exato, indique https://www4.planalto.gov.br/legislacao para a busca.\n' +
  '2. Você é uma ferramenta de estudo, não consultoria jurídica. Recuse casos concretos reais e pedidos de consultoria, parecer ou estratégia para uma situação real (do aluno ou de terceiros): explique em uma ou duas frases que a consultoria jurídica é atividade privativa da advocacia (Lei 8.906/1994, art. 1º, II, https://www.planalto.gov.br/ccivil_03/leis/l8906.htm) e ofereça explicar o instituto em tese. Casos hipotéticos de prova e exercícios são permitidos.\n' +
  '3. Resposta curta por padrão: no máximo 150 palavras, salvo se a tarefa pedir outro tamanho.\n' +
  '4. Trabalhe só com o trecho em estudo. Não transcreva códigos nem capítulos inteiros.\n' +
  '5. Texto simples, sem tabelas e sem títulos com #. Pode usar listas com hífen.\n' +
  'LINKS OFICIAIS DOS PRINCIPAIS DIPLOMAS:\n' + LINKS;
const DEEP = '\n\nAPROFUNDAR: o aluno pediu a versão aprofundada. Agora use até 450 palavras: fundamentos, requisitos, exceções, pontos que a FGV costuma cobrar e divergências relevantes, sempre com lei, artigo e link.';
function prompt(task, ctx, pedido) { return RULES + '\n\nTAREFA: ' + task + '\n\nTRECHO EM ESTUDO:\n' + ctx + (pedido ? '\n\nPEDIDO DO ALUNO: ' + pedido : ''); }
function ctxDip(a, x) { return 'Área: ' + a.nome + '.\nDiploma: ' + x.nome + ' (' + x.num + ').\nLink oficial: ' + x.url + '\nO que regula: ' + x.desc + (x.est ? '\nEstrutura: ' + x.est.map(e => e[0] + ' (' + e[1] + ')').join('; ') : ''); }
function ctxArea(a) { return 'Área: ' + a.nome + '.\nTemas centrais: ' + a.temas.join('; ') + '.' + (a.dip.length ? '\nDiplomas desta área e links oficiais:\n' + a.dip.slice(0, 14).map(x => '- ' + x.nome + ' (' + x.num + '): ' + x.url).join('\n') : ''); }
function fmt(t) {
  return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/https?:\/\/[^\s<>()\[\]]*[^\s<>()\[\].,;:!?]/g, u => '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>');
}
function today() { const d = new Date(), p = n => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
function usedToday() { return AI.uso.dia === today() ? AI.uso.n : 0; }
function dock() {
  const nav = $('#nav'), note = $('#ainote'), mob = window.innerWidth < 860;
  const nh = mob ? nav.offsetHeight : 0;
  note.style.bottom = nh + 'px';
  document.documentElement.style.setProperty('--dock', (nh + (AI.fn ? note.offsetHeight : 0)) + 'px');
}
function paintQuota() {
  const q = $('#ai-q'); if (q) q.textContent = usedToday() + ' de ' + LIMITE + ' perguntas hoje';
  paintUso();
}
function paintUso() {
  const box = $('#ai-uso'); if (!box) return;
  const rows = Object.keys(FN).map(k => ({ k: k, v: AI.uso.f[k] || { q: 0, c: 0 } })).sort((x, y) => y.v.q - x.v.q);
  box.innerHTML = '<table class="utab"><thead><tr><th>Função</th><th>Usos</th><th>Tamanho médio</th></tr></thead><tbody>' +
    rows.map(r => '<tr><td>' + FN[r.k] + '</td><td>' + r.v.q + '</td><td>' + (r.v.q ? Math.round(r.v.c / r.v.q) + ' caracteres' : '') + '</td></tr>').join('') + '</tbody></table>' +
    '<p class="muted" style="font-size:.82rem">Hoje: ' + usedToday() + ' de ' + LIMITE + ' perguntas.' + (AI.usoLocal || !AI.usoDoc ? ' Contagem guardada só neste aparelho.' : '') + '</p>' +
    '';
}
function cleanUso(u) { u = u || {}; const f = {}; Object.keys(u.f || {}).forEach(k => { if (FN[k]) f[k] = { q: +u.f[k].q || 0, c: +u.f[k].c || 0 }; }); return { dia: String(u.dia || ''), n: +u.n || 0, f: f }; }
function lsJson(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
function lsPut(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } }
function saveUso() {
  lsPut(LSU, AI.uso);
  if (!AI.usoDoc || AI.usoLocal) return;
  const body = JSON.parse(JSON.stringify(AI.uso));
  AI.chain = AI.chain.then(() => AI.usoDoc.set(body)).catch(() => { AI.usoLocal = true; });
}
async function loadUso() {
  if (!AI.usoDoc) return;
  try {
    const snap = await AI.usoDoc.get();
    if (snap.exists) {
      const c = cleanUso(snap.data()), l = AI.uso;
      if (c.dia === l.dia) c.n = Math.max(c.n, l.n);
      else if (l.dia > c.dia) { c.dia = l.dia; c.n = l.n; }
      Object.keys(l.f).forEach(k => { if (!c.f[k] || l.f[k].q > c.f[k].q) c.f[k] = l.f[k]; });
      AI.uso = c;
    }
  } catch (e) { AI.usoLocal = true; }
  paintQuota();
}
function bump(fn, len) {
  const u = AI.uso, t = today();
  if (u.dia !== t) { u.dia = t; u.n = 0; }
  u.n++;
  const f = u.f[fn] || (u.f[fn] = { q: 0, c: 0 });
  f.q++; f.c += len || 0;
  saveUso(); paintQuota();
}
function quotaOk() {
  if (usedToday() >= LIMITE) { toast('Você já fez as ' + LIMITE + ' perguntas de hoje. O contador zera amanhã.'); return false; }
  return true;
}
function aiOff() {
  AI.fn = null; document.body.classList.remove('has-ai'); $('#chat').hidden = true; dock();
  if (ui.tool === 'ia') { ui.tool = 'graficas'; if (cur() === 'ferramentas') render(true); }
}
function actsHtml(rid, deep) {
  return '<button class="say" data-act="ai-say" data-rid="' + rid + '">Ouvir</button>' +
    (deep ? '<button class="btn sm ghost" data-act="ai-deep" data-rid="' + rid + '">Aprofundar</button>' : '') +
    '<button class="btn sm ghost" data-act="ai-rep" data-rid="' + rid + '">Denunciar resposta</button>';
}
/* Uma chamada por vez, só por ação do aluno; nunca repete sozinha. */
async function ask(o) {
  if (!AI.fn || !o.slot) return null;
  if (AI.busy) { toast('Espere a resposta atual terminar.'); return null; }
  if (!quotaOk()) return null;
  const rid = 'a' + (++AI.seq);
  const box = document.createElement('div');
  box.className = 'ai'; box.dataset.rid = rid;
  box.innerHTML = '<div class="ai-h"><span class="ai-tag">IA · ' + esc(o.label || FN[o.fn]) + '</span><button class="btn sm ghost" data-act="ai-stop">Parar</button></div>' +
    '<div class="ai-out" aria-live="polite">Pensando…</div><p class="ai-msg" hidden></p><div class="ai-acts" hidden>' + actsHtml(rid, o.deep !== false && !o.json) + '</div>';
  if (!o.append) o.slot.innerHTML = '';
  o.slot.appendChild(box);
  const out = box.querySelector('.ai-out'), acts = box.querySelector('.ai-acts'), msg = box.querySelector('.ai-msg'), stop = box.querySelector('[data-act="ai-stop"]');
  const say = m => { msg.textContent = m; msg.hidden = false; };
  const rec = AI.reg[rid] = { fn: o.fn, o: o, text: '' };
  const ctl = new AbortController();
  AI.busy = true; AI.ctl = ctl;
  let last = '';
  const opts = { modelTier: o.tier, signal: ctl.signal, onText: u => { last = u.text; if (o.onText) o.onText(u.text, out); else out.innerHTML = fmt(u.text); if (o.scroll) o.scroll(); } };
  if (o.cache === false) opts.cache = false;
  let result = null;
  try {
    if (o.json) {
      const val = await AI.fn.json(o.input, opts);
      let txt;
      try { txt = o.onJson(val, out, rid); } catch (x) { throw { code: 'invalid_json' }; }
      rec.text = txt; bump(o.fn, last.length || txt.length);
    } else {
      const r = await AI.fn(o.input, opts);
      rec.text = r.text;
      if (o.onText) o.onText(r.text, out); else out.innerHTML = fmt(r.text);
      if (r.truncated) say('A resposta foi cortada pelo limite de tamanho. Peça menos de cada vez.');
      bump(o.fn, r.text.length);
    }
    acts.hidden = false; result = rec.text;
    if (o.done) o.done(rec.text, box);
  } catch (e) {
    const code = e && e.code, part = e && typeof e.text === 'string' ? e.text : '';
    if (HIDE.indexOf(code) >= 0) { box.remove(); aiOff(); toast('A IA não está disponível nesta visualização.'); }
    else if (code === 'refused') { out.textContent = ''; say('A IA recusou este pedido. Mude a pergunta e tente de novo.'); }
    else {
      if (part && !o.json) { rec.text = part; out.innerHTML = fmt(part); acts.hidden = false; bump(o.fn, part.length); } else out.textContent = '';
      if (code === 'cancelled') say(part ? 'Resposta interrompida.' : 'Cancelado.');
      else if (code === 'rate_limited') say('Muitas perguntas em pouco tempo, ou o limite de uso do seu plano Claude foi atingido. Tente de novo mais tarde.');
      else if (code === 'invalid_json') say('A resposta veio em formato inválido. Toque no botão de novo para tentar outra vez.');
      else if (code === 'session_expired') say('Sua sessão expirou. Entre de novo no Claude e repita a pergunta.');
      else if (code === 'prompt_too_large') say('O texto enviado ficou grande demais. Envie um trecho menor.');
      else say('Não foi possível falar com a IA agora. Tente de novo em instantes.');
    }
    if (o.fail) o.fail(code);
  } finally {
    AI.busy = false; AI.ctl = null; if (stop) stop.remove();
  }
  return result;
}
function speakLong(text) {
  const clean = String(text).replace(/https?:\/\/\S+/g, '').replace(/\*\*/g, '');
  if (tts) {
    const lines = [];
    clean.split(/\n+/).forEach(p => { p = p.trim(); while (p.length > 1800) { lines.push({ text: p.slice(0, 1800) }); p = p.slice(1800); } if (p) lines.push({ text: p }); });
    return lines.length ? tts.speak(lines.slice(0, 40)) : Promise.resolve();
  }
  return speak(clean, false);
}

/* ---- 1. Explicar ---- */
function explain(a, x, pedido, slot) {
  const alvo = pedido ? pedido : (x ? 'visão geral do diploma: para que serve, como se organiza e os artigos que mais caem' : 'visão geral da área');
  ask({ fn: 'explicar', label: 'Explicar' + (pedido ? ': ' + pedido.slice(0, 40) : ''), tier: 'quick', slot: slot,
    input: prompt('Explique em linguagem simples o artigo ou instituto pedido e dê um exemplo prático hipotético. Termine com a linha "Fonte:" trazendo lei, artigo e link.', x ? ctxDip(a, x) : ctxArea(a), alvo) });
}
function expForm(id, label, a, di) {
  return '<div class="aiform"><label for="' + id + '">' + label + '</label><div class="ctrl"><input id="' + id + '" maxlength="200" placeholder="Ex.: art. 265, solidariedade passiva">' +
    '<button class="btn sm rubi" data-act="ai-exp" data-a="' + a + '"' + (di == null ? '' : ' data-i="' + di + '"') + '>Explicar</button></div><div class="ai-res"></div></div>';
}
/* ---- 2. Questões ---- */
function quiz(a, slot) {
  ask({ fn: 'questoes', label: 'Questões de ' + a.nome, tier: 'default', cache: false, json: true, slot: slot,
    input: prompt('Crie 5 questões inéditas de múltipla escolha no estilo do Exame de Ordem da FGV sobre esta área: enunciado com caso hipotético curto, quatro alternativas (A a D) e uma só correta. Varie os temas e a letra correta. ' +
      'Responda APENAS com um array JSON de 5 objetos neste formato: [{"enunciado":"...","alternativas":{"A":"...","B":"...","C":"...","D":"..."},"correta":"B","comentario":"por que a correta está certa e o erro das demais, em até 60 palavras","fonte":"lei, artigo e link do Planalto"}]. A regra de tamanho de 150 palavras não vale para o conjunto.', ctxArea(a)),
    onText: (t, out) => { const n = (t.match(/"enunciado"/g) || []).length; out.textContent = 'Escrevendo as questões… ' + Math.min(n, 5) + ' de 5'; },
    onJson: (val, out, rid) => {
      const qs = (Array.isArray(val) ? val : []).filter(q => q && q.enunciado && q.alternativas && ['A', 'B', 'C', 'D'].every(k => q.alternativas[k]) && /^[ABCD]$/.test(String(q.correta).trim().toUpperCase())).slice(0, 5)
        .map(q => ({ e: String(q.enunciado), alt: q.alternativas, ok: String(q.correta).trim().toUpperCase(), c: String(q.comentario || ''), f: String(q.fonte || '') }));
      if (!qs.length) throw new Error('formato');
      AI.reg[rid].qs = qs; AI.reg[rid].hits = 0; AI.reg[rid].done = 0;
      out.style.whiteSpace = 'normal';
      out.innerHTML = qs.map((q, i) => '<div class="qz" data-q="' + i + '"><p><b>' + (i + 1) + '.</b> ' + esc(q.e) + '</p>' +
        ['A', 'B', 'C', 'D'].map(k => '<button class="alt" data-act="qz-pick" data-rid="' + rid + '" data-q="' + i + '" data-k="' + k + '"><b>' + k + '</b><span>' + esc(q.alt[k]) + '</span></button>').join('') +
        '<div class="qz-c" hidden><span><b>Gabarito: ' + q.ok + '.</b> ' + esc(q.c) + '</span><span class="mono">' + fmt(q.f) + '</span>' +
        '<button class="say" data-act="say" data-own="0" data-say="' + esc('Gabarito ' + q.ok + '. ' + q.c) + '">Ouvir</button></div></div>').join('') + '<p class="muted qz-score" style="font-size:.86rem"></p>';
      return qs.map((q, i) => (i + 1) + '. ' + q.e + '\n' + ['A', 'B', 'C', 'D'].map(k => k + ') ' + q.alt[k]).join('\n') + '\nGabarito: ' + q.ok + '. ' + q.c + '\nFonte: ' + q.f).join('\n\n');
    } });
}
/* ---- 6. Chat ---- */
function chatOpen() { $('#chat').hidden = false; hush(); const i = $('#chat-in'); if (i && window.innerWidth >= 860) i.focus(); }
function chatSend(text) {
  text = String(text || '').trim().slice(0, 2000);
  if (!text || !AI.fn) return;
  if (AI.busy) { toast('Espere a resposta atual terminar.'); return; }
  if (!quotaOk()) return;
  const log = $('#chat-log'), empty = log.querySelector('.empty'); if (empty) empty.remove();
  const me = document.createElement('div'); me.className = 'me'; me.textContent = text; log.appendChild(me);
  AI.chat.push({ role: 'user', content: text });
  let turns = AI.chat.slice(-12);
  while (turns.length && turns[0].role !== 'user') turns.shift();
  const v = cur(), area = v === 'area' ? A[location.hash.slice(6)] : null;
  const head = RULES + '\n\nTAREFA: tirar dúvidas de estudo do aluno, de forma curta e direta, uma dúvida por vez.' + (area ? '\nO aluno está com esta área aberta: ' + area.nome + '.' : '');
  const scroll = () => { log.scrollTop = log.scrollHeight; };
  $('#chat-in').value = '';
  ask({ fn: 'chat', label: 'Professor', tier: 'quick', cache: false, slot: log, append: true, scroll: scroll, input: [{ role: 'user', content: head }].concat(turns),
    done: t => { AI.chat.push({ role: 'assistant', content: t }); scroll(); },
    fail: () => { const l = AI.chat[AI.chat.length - 1]; if (l && l.role === 'user') AI.chat.pop(); } });
  scroll();
}
/* ---- Denúncia ---- */
async function sendReport(box, rid) {
  const rec = AI.reg[rid]; if (!rec) return;
  const item = { fn: rec.fn, texto: String(rec.text).slice(0, 8000), motivo: box.querySelector('.rp-m').value, obs: box.querySelector('.rp-o').value.trim().slice(0, 500), c: Date.now() };
  const f = box.querySelector('.ai-repf'); if (f) f.remove();
  let cloud = false;
  if (S.db && S.uid) {
    try { await S.db.doc('data/users/' + S.uid + '/ia/denuncias/' + uid8('d')).set(item); cloud = true; } catch (e) { cloud = false; }
  }
  if (!cloud) { const l = lsJson(LSR) || []; l.push(item); lsPut(LSR, l.slice(-50)); }
  const b = box.querySelector('[data-act="ai-rep"]'); if (b) { b.textContent = 'Denúncia registrada'; b.disabled = true; }
  toast(cloud ? 'Denúncia registrada. Obrigado.' : 'Denúncia guardada só neste aparelho: seu acesso não permite gravar no banco.');
}
function tIA() {
  return '<section class="tool"><h2>Corrigir minha resposta</h2><p>Escreva uma resposta discursiva ou um trecho de peça de treino. A IA aponta acertos, erros e a fundamentação que faltou. Use só casos hipotéticos de estudo.</p>' +
    '<div class="field"><label for="fx-area">Área</label><select id="fx-area">' + areaOpts(ui.fix ? ui.fix.area : '', 'Escolha a área') + '</select></div>' +
    '<div class="field"><label for="fx-q">Enunciado ou tema</label><textarea id="fx-q" maxlength="2000" style="min-height:' + (ui.fix && ui.fix.q ? '160' : '74') + 'px" placeholder="Cole o enunciado da questão ou diga o tema">' + esc(ui.fix ? ui.fix.q : '') + '</textarea></div>' +
    '<div class="field"><label for="fx-r">Sua resposta</label><textarea id="fx-r" maxlength="6000" placeholder="Escreva aqui sua resposta ou o trecho da peça"></textarea></div>' +
    '<div class="ctrl"><button class="btn rubi" data-act="ai-fix">Corrigir com IA</button></div><div id="ai-fix-out"></div></section>' +
    '<section class="tool"><h2>Pergunte ao professor</h2><p>Um chat para dúvidas rápidas de estudo. Ele lembra a conversa enquanto a página estiver aberta.</p><div class="ctrl"><button class="btn" data-act="chat-open">Abrir o chat</button></div></section>' +
    '<section class="tool"><h2>Outras funções de IA</h2><div class="links"><a href="#areas"><b>Explicar e gerar questões</b><span>Abra uma área: há um botão em cada diploma e um gerador de 5 questões.</span></a>' +
    '<a href="#conexoes"><b>Explicar conexões</b><span>No mapa, selecione uma ligação ou compare dois institutos.</span></a>' +
    '<a href="#caderno" data-act="govoc2"><b>Sugerir definição</b><span>No vocabulário, a IA propõe e você revisa antes de guardar.</span></a></div></section>' +
    '<section class="tool"><h2>Uso da IA</h2><p>Quais funções você mais usa e o tamanho médio das respostas.</p><div id="ai-uso"></div></section>';
}
/* ---- ações ---- */
function aiAct(b) {
  const d = b.dataset, act = d.act;
  switch (act) {
    case 'ai-tema': { const a = A[d.a], slot = $('#ai-area-out'); if (a && slot) { explain(a, null, d.t, slot); slot.scrollIntoView({ block: 'nearest' }); } return true; }
    case 'ai-dip': { const slot = $('#ai-d-' + d.i); if (slot) { if (slot.firstChild) slot.innerHTML = ''; else slot.innerHTML = expForm('ai-q-d' + d.i, 'Artigo ou instituto deste diploma (em branco: visão geral)', d.a, d.i); } return true; }
    case 'ai-exp': { const f = b.closest('.aiform'), a = A[d.a]; explain(a, d.i == null ? null : a.dip[+d.i], f.querySelector('input').value.trim().slice(0, 200), f.querySelector('.ai-res')); return true; }
    case 'ai-quiz': quiz(A[d.a], $('#ai-quiz-out')); return true;
    case 'qz-pick': {
      const r = AI.reg[d.rid]; if (!r) return true;
      const q = r.qs[+d.q], wrap = b.closest('.qz'); if (wrap.dataset.done) return true;
      wrap.dataset.done = '1'; r.done++; if (d.k === q.ok) r.hits++;
      Array.prototype.forEach.call(wrap.querySelectorAll('.alt'), x => { x.disabled = true; if (x.dataset.k === q.ok) x.classList.add('ok'); else if (x === b) x.classList.add('no'); });
      wrap.querySelector('.qz-c').hidden = false;
      const sc = wrap.parentNode.querySelector('.qz-score'); if (sc) sc.textContent = 'Acertos: ' + r.hits + ' de ' + r.done + ' respondidas.';
      return true;
    }
    case 'ai-fix': {
      const a = A[$('#fx-area').value], q = $('#fx-q').value.trim().slice(0, 2000), r = $('#fx-r').value.trim().slice(0, 6000);
      if (r.length < 30) { toast('Escreva sua resposta (pelo menos algumas linhas) antes de pedir a correção.'); return true; }
      ask({ fn: 'corrigir', tier: 'complex', slot: $('#ai-fix-out'),
        input: prompt('Corrija a resposta discursiva (ou trecho de peça de treino) do aluno como um examinador da 2ª fase da OAB. Use exatamente estes blocos: "Acertos:", "Erros:", "Fundamentação que faltou:" (lei, artigo e link) e "Como melhorar:". Seja direto e respeitoso. Até 220 palavras.',
          (a ? ctxArea(a) : 'Área não informada.') + '\n\nENUNCIADO OU TEMA:\n' + (q || '(não informado)') + '\n\nRESPOSTA DO ALUNO:\n' + r) });
      return true;
    }
    case 'ai-def': {
      const termo = $('#voc-termo').value.trim().slice(0, 100), a = A[$('#voc-area').value];
      if (!termo) { toast('Escreva o termo primeiro.'); $('#voc-termo').focus(); return true; }
      const ta = $('#voc-def');
      const parse = t => { const m = { def: t, fonte: '', uso: '', link: '' }; const i = t.search(/\n\s*FONTE:/i); if (i >= 0) { m.def = t.slice(0, i); const rest = t.slice(i);
        const g = (k) => { const r = rest.match(new RegExp('\\n\\s*' + k + ':\\s*([^\\n]*)', 'i')); return r ? r[1].trim() : ''; }; m.fonte = g('FONTE'); m.uso = g('USO'); m.link = g('LINK'); } m.def = m.def.trim(); return m; };
      ask({ fn: 'definicao', label: 'Definição sugerida', tier: 'quick', deep: false, slot: $('#ai-def-out'),
        input: prompt('Defina o termo para o caderno de vocabulário do aluno. Responda exatamente em quatro linhas, sem mais nada:\n<definição em até 40 palavras, linguagem simples>\nFONTE: <lei e artigo; ou "Doutrina"; ou "sem certeza do artigo">\nUSO: <uma frase de exemplo com o termo>\nLINK: <link do Planalto da lei citada, se houver>',
          a ? 'Área: ' + a.nome + '.' : 'Área: geral.', 'Termo: ' + termo),
        onText: (t, out) => { const m = parse(t); ta.value = m.def; out.innerHTML = (m.link ? fmt(m.link) + '\n' : '') + 'Sugestão da IA nos campos acima. Revise e reescreva com as suas palavras antes de guardar.'; },
        done: t => { const m = parse(t); ta.value = m.def; if (m.fonte) $('#voc-fonte').value = m.fonte.slice(0, 160); if (m.uso) $('#voc-uso').value = m.uso.slice(0, 240); } });
      return true;
    }
    case 'ai-edge': {
      if (ui.edge < 0) { toast('Toque primeiro em uma conexão da lista acima.'); return true; }
      const e = EDGES[ui.edge];
      ask({ fn: 'conexao', label: A[e.a].sig + ' e ' + A[e.b].sig, tier: 'default', slot: $('#ai-con-out'),
        input: prompt('Explique a relação entre estes dois ramos do Direito no ponto indicado: o que um empresta ao outro, um exemplo hipotético e o erro mais comum em prova.', 'Ramos: ' + A[e.a].nome + ' e ' + A[e.b].nome + '.\nPonte: ' + e.t + '\nNormas-ponte: ' + e.n) });
      return true;
    }
    case 'ai-cmp': {
      const x = $('#ai-i1').value.trim().slice(0, 150), y = $('#ai-i2').value.trim().slice(0, 150);
      if (!x || !y) { toast('Preencha os dois institutos.'); return true; }
      ask({ fn: 'conexao', label: 'Relação entre institutos', tier: 'default', slot: $('#ai-con-out'),
        input: prompt('Explique a relação entre os dois institutos, que são de ramos diferentes do Direito: semelhanças, diferenças, como um influencia o outro e um exemplo hipotético.', 'Instituto 1: ' + x + '\nInstituto 2: ' + y + (ui.node ? '\nÁrea selecionada no mapa: ' + A[ui.node].nome + '.' : '')) });
      return true;
    }
    case 'pc-exp': {
      const P = PECAS[ui.pa], x = P.lista[+d.i];
      ask({ fn: 'explicar', label: 'Explicar: ' + x.n, tier: 'quick', slot: $('#pc-ai-' + d.i),
        input: prompt('Explique esta peça da 2ª fase da OAB a um aluno: para que serve, como reconhecer no enunciado da FGV, como diferenciá-la da peça com que mais se confunde, e um exemplo hipotético curto. Termine com a linha "Fonte:".', pecaTxt(P, x)) });
      return true;
    }
    case 'pc-caso': {
      const P = PECAS[ui.pa], x = P.lista[+d.i];
      ask({ fn: 'pecas', label: 'Caso para treinar: ' + x.n, tier: 'default', cache: false, deep: false, slot: $('#pc-ai-' + d.i),
        input: prompt('Escreva um enunciado inédito de peça prático-profissional no estilo da FGV, área ' + P.nome + ', cuja peça correta seja a indicada no trecho. Caso hipotético com nomes fictícios, datas e fatos suficientes, terminando com "Na qualidade de advogado(a) de ..., redija a peça cabível". NÃO diga o nome da peça nem dê o gabarito no enunciado. Depois de uma linha só com "---", traga "Gabarito:" com o nome da peça, a base legal e as 3 teses principais. Até 330 palavras no total.', pecaTxt(P, x)),
        onText: (t, out) => { out.innerHTML = fmt(t.split(/\n\s*-{3,}/)[0]); },
        done: (t, box) => {
          const parts = t.split(/\n\s*-{3,}\s*\n?/), enun = parts[0].trim(), gab = parts.slice(1).join('\n').trim();
          const acts = box.querySelector('.ai-acts');
          if (gab) {
            const g = document.createElement('div'); g.className = 'pc-gab'; g.hidden = true; g.innerHTML = fmt(gab);
            box.insertBefore(g, acts);
            const bg = document.createElement('button'); bg.className = 'btn sm ghost'; bg.textContent = 'Ver gabarito';
            bg.addEventListener('click', () => { g.hidden = !g.hidden; bg.textContent = g.hidden ? 'Ver gabarito' : 'Esconder gabarito'; });
            acts.appendChild(bg);
          }
          const bt = document.createElement('button'); bt.className = 'btn sm rubi'; bt.textContent = 'Escrever e corrigir com IA';
          bt.dataset.act = 'pc-treinar'; bt.dataset.e = enun.slice(0, 2000);
          acts.appendChild(bt);
        } });
      return true;
    }
    case 'pc-treinar': ui.fix = { area: ui.pa, q: d.e || '' }; ui.tool = 'ia'; location.hash = 'ferramentas'; return true;
    case 'ai-stop': if (AI.ctl) AI.ctl.abort(); return true;
    case 'ai-say': { const r = AI.reg[d.rid]; if (r && r.text) speakLong(r.text).catch(() => { /* voz indisponível */ }); return true; }
    case 'ai-deep': {
      const r = AI.reg[d.rid]; if (!r) return true;
      if (r.fn === 'chat') { chatSend('Aprofunde a resposta anterior, com fundamentos, exceções e os artigos aplicáveis.'); return true; }
      if (typeof r.o.input === 'string') ask(Object.assign({}, r.o, { input: r.o.input + DEEP, deep: false, label: (r.o.label || FN[r.fn]) + ' (aprofundado)' }));
      return true;
    }
    case 'ai-rep': {
      const box = b.closest('.ai'); if (box.querySelector('.ai-repf')) return true;
      const f = document.createElement('div'); f.className = 'ai-repf';
      f.innerHTML = '<label class="lb" for="rp-' + d.rid + '">Motivo da denúncia</label><div class="ctrl"><select class="rp-m" id="rp-' + d.rid + '"><option>Informação jurídica errada</option><option>Artigo ou fonte que não existe</option><option>Conteúdo ofensivo ou inadequado</option><option>Outro</option></select>' +
        '<input class="rp-o" maxlength="500" placeholder="Detalhe (opcional)" aria-label="Detalhe da denúncia"></div><div class="ctrl"><button class="btn sm rubi" data-act="ai-rep-send" data-rid="' + d.rid + '">Enviar denúncia</button><button class="btn sm ghost" data-act="ai-rep-cancel">Cancelar</button></div>';
      box.appendChild(f); return true;
    }
    case 'ai-rep-send': sendReport(b.closest('.ai'), d.rid); return true;
    case 'ai-rep-cancel': b.closest('.ai-repf').remove(); return true;
    case 'chat-open': chatOpen(); return true;
    case 'chat-close': $('#chat').hidden = true; return true;
    case 'chat-clear': if (AI.busy && AI.ctl) AI.ctl.abort(); AI.chat = []; $('#chat-log').innerHTML = '<p class="empty">Conversa limpa. Qual é a dúvida?</p>'; return true;
    case 'govoc2': ui.cad = 'voc'; return true;
    case 'say': if (b.closest('#chat')) { speak(d.say, d.own !== '0').catch(() => {}); return true; } return false;
  }
  return false;
}
async function initAI() {
  const l = lsJson(LSU); if (l) AI.uso = cleanUso(l);
  window.addEventListener('resize', dock);
  dock();
  if (!window.claude || typeof window.claude.use !== 'function') return;
  let fn = null;
  try { fn = await window.claude.use('sample'); } catch (e) { fn = null; }
  if (typeof fn !== 'function') return;
  AI.fn = fn;
  document.body.classList.add('has-ai');
  dock(); paintQuota();
}
$('#chat').addEventListener('click', ev => { const b = ev.target.closest('[data-act]'); if (b) aiAct(b); });
$('#chat-fab').addEventListener('click', chatOpen);
$('#chat-form').addEventListener('submit', ev => { ev.preventDefault(); chatSend($('#chat-in').value); });
$('#chat-in').addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.shiftKey && window.innerWidth >= 860) { ev.preventDefault(); chatSend($('#chat-in').value); } });

if (!window.claude) document.body.classList.add('site');
setMode('local');
render();
connect();
initVoice();
initAI();
})();
