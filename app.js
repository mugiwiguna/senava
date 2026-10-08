/* SENAVA — app (index + katalog) */
document.documentElement.classList.add('js');

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WA = '6281234567890'; /* TODO: ganti nomor asli SENAVA */

const ICO = {
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
};

/* cat: atasan | bawahan | lapisan | dress */
const PROD = {
  sekar:   { name:'Kemeja Linen Sekar',    price:289000, img:'img/sekar.jpg',   meta:'100% LINEN · SAGE',        cat:'atasan',  desc:'Kemeja lengan panjang potongan santai. Linen garment wash — jatuh ringan, adem, makin betah makin sering dicuci. Bisa ditumpuk kaos atau dipakai terbuka.' },
  lembut:  { name:'Kaos Oversized Lembut', price:149000, img:'img/lembut.jpg',  meta:'KATUN COMBED 24S · IVORY', cat:'atasan',  desc:'Tee oversized dengan bahu jatuh dan rib leher yang tidak mudah melar. Katun combed 24s — lembut di kulit, netral di semua padanan.' },
  kabut:   { name:'Cardigan Rajut Kabut',  price:329000, img:'img/kabut.jpg',   meta:'WOOL BLEND · DUSTY MAUVE', cat:'lapisan', desc:'Cardigan rajut bertekstur dengan kancing marmer. Hangat tanpa gerah — lapis sempurna untuk pagi dan malam yang dingin.' },
  rileks:  { name:'Celana Kargo Rileks',   price:279000, img:'img/rileks.jpg',  meta:'RIPSTOP COTTON · SAND',    cat:'bawahan', desc:'Kargo potongan lurus dengan enam saku fungsional. Ripstop cotton — ringan, tidak kaku, siap dipakai dari kerja sampai jalan sore.' },
  tenang:  { name:'Sweater Tenang',        price:259000, img:'img/tenang.jpg',  meta:'POLY COTTON RIB · OAT',    cat:'lapisan', desc:'Sweater rib dengan bahan poly-cotton yang tidak berat. Warna oat — gampang dipadukan dengan apa pun di lemari kamu.' },
  sore:    { name:'Dress Sore',            price:319000, img:'img/sore.jpg',    meta:'LINEN VISCOSE · CREAM',    cat:'dress',   desc:'Dress panjang potongan A dengan jatuh kain yang tenang. Linen viscose — adem untuk cuaca panas, tetap rapi untuk acara.' },
  raga:    { name:'Kemeja Pendek Raga',    price:239000, img:'img/raga.jpg',    meta:'100% LINEN · POWDER',      cat:'atasan',  desc:'Kemeja lengan pendek dengan kerah rileks. Linen powder blue — pas untuk siang panas, tetap terlihat rapi untuk virtual meeting.' },
  teduh:   { name:'Hoodie Longgar Teduh',  price:349000, img:'img/teduh.jpg',   meta:'FLEECE COTTON · CHARCOAL', cat:'lapisan', desc:'Hoodie oversize dengan fleece lembut di dalam. Charcoal — teman perjalanan pagi dan malam yang tiba-tiba dingin.' },
  lurus:   { name:'Celana Bahan Lurus',    price:269000, img:'img/lurus.jpg',   meta:'TROPICAL WOOL · CHARCOAL', cat:'bawahan', desc:'Celana bahan potongan lurus yang jatuh rapi. Tropical wool ringan — kantor, kopi, sampai acara malam tanpa ganti.' },
  rimbun:  { name:'Rok Lipit Rimbun',      price:249000, img:'img/rimbun.jpg',  meta:'COTTON PLEATS · OLIVE',    cat:'bawahan', desc:'Rok lipit dengan jatuh kain yang hidup. Cotton pleats — gerak leluasa, warna olive gampang dipadukan atasan netral.' },
  ringkas: { name:'Outer Ringkas',         price:299000, img:'img/ringkas.jpg', meta:'COTTON TWILL · CAMEL',     cat:'lapisan', desc:'Overshirt tipis bahan twill camel. Lapisan tunggal untuk cuaca berubah-ubah — muat dilapis apa pun.' },
  nada:    { name:'Polo Rajut Nada',       price:199000, img:'img/nada.jpg',    meta:'COTTON KNIT · FOREST',     cat:'atasan',  desc:'Polo rajut dengan kerah yang tetap rapi setelah cuci. Forest green — kasual yang tidak males-malesan.' },
};
const SIZES = ['S','M','L','XL'];
const BARU = ['raga','teduh','lurus','rimbun','ringkas','nada']; /* batch terbaru */
const CAT_LABEL = { semua:'SEMUA', atasan:'ATASAN', bawahan:'BAWAHAN', lapisan:'LAPISAN', dress:'DRESS' };
const rp = n => 'Rp ' + n.toLocaleString('id-ID');
const el = id => document.getElementById(id);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---------- refs ---------- */
const pre = el('preloader'), hdr = el('hdr'), menu = el('menu'), burger = el('burger');
const drawer = el('drawer'), veil = el('veil'), qv = el('qv');
const dItems = el('dItems'), dCount = el('dCount'), dTotal = el('dTotal'), cartCount = el('cartCount');
const waCheckout = el('waCheckout');
if (el('dClose')) el('dClose').innerHTML = ICO.x;
if (el('qvClose')) el('qvClose').innerHTML = ICO.x;

/* ---------- lenis + gsap ---------- */
let lenis = null;
if (!RM && window.Lenis) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

/* ---------- lock ---------- */
function syncLock() {
  const locked = (menu && menu.classList.contains('open')) || (drawer && drawer.classList.contains('open')) || (qv && qv.classList.contains('open'));
  document.body.classList.toggle('lock', locked);
  if (lenis) locked ? lenis.stop() : lenis.start();
}

/* ---------- page wipe (transisi index <-> katalog) ---------- */
const WIPE_KEY = 'snv-wipe';
const wipe = document.createElement('div');
wipe.className = 'pg-wipe';
document.body.appendChild(wipe);
let cameWiped = false;
try { cameWiped = sessionStorage.getItem(WIPE_KEY) === '1'; sessionStorage.removeItem(WIPE_KEY); } catch (e) {}
gsap.set(wipe, { xPercent: cameWiped ? 0 : 101 });

/* ---------- reveals (dipanggil setelah preloader) ---------- */
function initReveals() {
  if (RM) return;
  $$('[data-rev]').forEach(e => {
    if (e.closest('.hero')) return; /* hero urusannya heroIntro */
    gsap.fromTo(e, { autoAlpha: 0, y: 44 }, {
      autoAlpha: 1, y: 0, duration: .95, ease: 'expo.out',
      scrollTrigger: { trigger: e, start: 'top 86%', once: true },
    });
  });
  $$('[data-stagger]').forEach(wrap => {
    gsap.fromTo(wrap.children, { autoAlpha: 0, y: 54 }, {
      autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .09,
      scrollTrigger: { trigger: wrap, start: 'top 82%', once: true },
      onComplete: () => gsap.set(wrap.children, { clearProps: 'transform' }),
    });
  });

  /* karaoke statement */
  const stmt = el('stmt');
  if (stmt) {
    stmt.innerHTML = stmt.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
    gsap.to('#stmt .w', {
      opacity: 1, ease: 'none', stagger: .5,
      scrollTrigger: { trigger: stmt, start: 'top 78%', end: 'bottom 48%', scrub: .4 },
    });
  }

  /* lookbook slides */
  $$('.slide').forEach((s, i) => {
    gsap.fromTo(s, { autoAlpha: 0, y: 40 }, {
      autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', delay: (i % 3) * .06,
      scrollTrigger: { trigger: s, start: 'top 88%', once: true },
    });
  });

  /* hero parallax pelan (desktop only) */
  if (document.querySelector('.hero-r') && matchMedia('(min-width: 900px)').matches) {
    gsap.to('.hero-r', { y: -46, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5 } });
  }
}

/* ---------- preloader + hero intro ---------- */
function heroIntro() {
  if (!document.querySelector('[data-hero]')) return;
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.fromTo('[data-hero]', { yPercent: 112 }, { yPercent: 0, duration: 1.15, stagger: .12 }, 0)
    .fromTo('#heroImg', { scale: 1.16, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.5 }, .15)
    .to('.hero .eyebrow, .hero-sub, .hero-cta, .fig, .hero-tag', { autoAlpha: 1, y: 0, duration: .9, stagger: .09 }, .5);
}
function wipeOut() {
  if (!cameWiped || RM) return;
  gsap.to(wipe, { xPercent: 101, duration: .5, ease: 'expo.inOut', delay: .1,
    onComplete: () => { cameWiped = false; } });
}
function startSite() {
  document.body.classList.remove('is-loading');
  if (window.ScrollTrigger) ScrollTrigger.refresh();
  initReveals();
  if (!RM) heroIntro();
  wipeOut();
  const h = location.hash.slice(1);
  if (h && PROD[h]) setTimeout(() => openQV(h), 450); /* deep-link katalog.html#sekar */
}
if (RM) {
  if (pre) pre.style.display = 'none';
  startSite();
} else {
  gsap.set('.hero .eyebrow, .hero-sub, .hero-cta, .fig, .hero-tag', { autoAlpha: 0, y: 26 });
  if (cameWiped) {
    if (pre) pre.style.display = 'none';
    startSite();
  } else {
    const tl = gsap.timeline();
    tl.to('#preFill', { width: '100%', duration: 1.05, ease: 'power2.inOut' })
      .to('.pre-word', { letterSpacing: '.16em', duration: .8, ease: 'expo.out' }, 0)
      .to(pre, { yPercent: -101, duration: .7, ease: 'expo.inOut', delay: .12 })
      .add(() => { pre.style.display = 'none'; startSite(); });
  }
}

/* ---------- header ---------- */
addEventListener('scroll', () => hdr && hdr.classList.toggle('stuck', scrollY > 24), { passive: true });

/* ---------- menu ---------- */
function closeMenu() { menu.classList.remove('open'); burger.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); syncLock(); }
if (burger) burger.addEventListener('click', () => {
  const open = !menu.classList.contains('open');
  menu.classList.toggle('open', open); burger.classList.toggle('open', open);
  menu.setAttribute('aria-hidden', String(!open)); syncLock();
});

/* ---------- anchors ---------- */
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  const t = document.querySelector(id);
  if (!t) return;
  e.preventDefault();
  if (menu && menu.classList.contains('open')) closeMenu();
  if (lenis) lenis.scrollTo(t, { offset: -60 });
  else t.scrollIntoView({ behavior: 'smooth' });
}));

/* page navigation -> wipe (delegation: nangkep link yang dirender JS juga) */
const pageHere = location.pathname.split('/').pop() || 'index.html';
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || RM) return;
  const dest = (a.getAttribute('href') || '').split('#')[0];
  if (!/\.html?$/.test(dest) || dest === pageHere) return;
  e.preventDefault();
  if (menu && menu.classList.contains('open')) closeMenu();
  if (drawer && drawer.classList.contains('open')) closeDrawer();
  try { sessionStorage.setItem(WIPE_KEY, '1'); } catch (err) {}
  gsap.to(wipe, { xPercent: 0, duration: .45, ease: 'expo.inOut',
    onComplete: () => { location.href = a.href; } });
});

/* ---------- quickview (delegation — dukung kartu yang dirender JS) ---------- */
let curId = null, curSize = 'M';
function openQV(id) {
  const p = PROD[id]; if (!p) return;
  curId = id; curSize = 'M';
  el('qvImg').src = p.img; el('qvImg').alt = p.name;
  el('qvMeta').textContent = p.meta;
  el('qvName').textContent = p.name;
  el('qvPrice').textContent = rp(p.price);
  el('qvDesc').textContent = p.desc;
  el('qvSizes').innerHTML = SIZES.map(s => `<button class="chip${s === 'M' ? ' on' : ''}" type="button" data-size="${s}">${s}</button>`).join('');
  if (el('qvBarPrice')) el('qvBarPrice').textContent = rp(p.price);
  if (el('qbSize')) el('qbSize').textContent = curSize;
  qv.classList.add('open'); qv.setAttribute('aria-hidden', 'false');
  syncLock();
}
function closeQV() { qv.classList.remove('open'); qv.setAttribute('aria-hidden', 'true'); syncLock(); }
document.addEventListener('click', e => {
  if (e.target.closest('[data-fav]')) return; /* urusan favorit di listener lain */
  const b = e.target.closest('[data-qv]') || e.target.closest('.card[data-id]');
  if (b) { openQV(b.dataset.qv || b.dataset.id); return; }
  if (e.target.closest('#qvClose')) closeQV();
  if (e.target === qv) closeQV();
});
if (el('qvSizes')) el('qvSizes').addEventListener('click', e => {
  const c = e.target.closest('.chip'); if (!c) return;
  $$('#qvSizes .chip').forEach(x => x.classList.remove('on'));
  c.classList.add('on'); curSize = c.dataset.size;
  if (el('qbSize')) el('qbSize').textContent = curSize;
});
function addQV() { addToCart(curId, curSize); closeQV(); openDrawer(); }
if (el('qvAdd')) el('qvAdd').addEventListener('click', addQV);
if (el('qvBarAdd')) el('qvBarAdd').addEventListener('click', addQV);

/* ---------- cart (persist localStorage) ---------- */
let cart = [], lastN = 0;
try { cart = JSON.parse(localStorage.getItem('snv-cart') || '[]').filter(i => i && PROD[i.id] && SIZES.includes(i.size) && i.qty > 0); } catch (e) {}
cart.forEach(i => { delete i.flash; });
lastN = cart.reduce((s, i) => s + i.qty, 0);
function saveCart() { try { localStorage.setItem('snv-cart', JSON.stringify(cart)); } catch (e) {} }
function addToCart(id, size) {
  const hit = cart.find(i => i.id === id && i.size === size);
  hit ? hit.qty++ : cart.push({ id, size, qty: 1, flash: true });
  renderCart();
}
function renderCart() {
  const n = cart.reduce((s, i) => s + i.qty, 0);
  const sub = cart.reduce((s, i) => s + PROD[i.id].price * i.qty, 0);
  const disc = n >= 2 ? Math.round(sub * .1) : 0; /* bundle ≥2 potong −10% */
  const total = sub - disc;
  cartCount.textContent = `(${n})`;
  if (!RM && n > lastN) gsap.fromTo(cartCount, { scale: 1.45 }, { scale: 1, duration: .45, ease: 'back.out(3)' });
  lastN = n;
  dCount.textContent = `(${n})`;
  dTotal.textContent = rp(total);
  const dDisc = el('dDisc');
  if (dDisc) { dDisc.hidden = !disc; if (disc) el('dDiscVal').textContent = '−' + rp(disc); }
  if (!cart.length) {
    dItems.innerHTML = '<p class="d-empty">Tas kosong — <a href="katalog.html">mulai dari katalog →</a></p>';
    waCheckout.setAttribute('aria-disabled', 'true');
    waCheckout.href = '#';
    saveCart();
    return;
  }
  waCheckout.removeAttribute('aria-disabled');
  dItems.innerHTML = cart.map((i, idx) => {
    const p = PROD[i.id];
    const isNew = i.flash; delete i.flash;
    return `<div class="d-item${isNew ? ' flash' : ''}">
      <img src="${p.img}" alt="${p.name}">
      <div>
        <p class="d-it-n">${p.name}</p>
        <p class="d-it-m">SIZE ${i.size}</p>
        <div class="d-qty">
          <button type="button" data-dec="${idx}" aria-label="Kurangi">−</button>
          <span>${i.qty}</span>
          <button type="button" data-inc="${idx}" aria-label="Tambah">+</button>
        </div>
      </div>
      <div style="text-align:right">
        <p class="d-price">${rp(p.price * i.qty)}</p>
        <button class="d-rm" type="button" data-rm="${idx}" style="margin-top:10px">hapus</button>
      </div>
    </div>`;
  }).join('');
  const lines = cart.map(i => `- ${PROD[i.id].name} (Size ${i.size}) x${i.qty}`).join('\n');
  const text = `Halo SENAVA! Aku mau pesan:\n${lines}\n\nTotal: ${rp(total)}${disc ? ` (harga asli ${rp(sub)}, potongan bundle −10% sudah dihitung)` : ''}`;
  waCheckout.href = `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  saveCart();
}
if (dItems) dItems.addEventListener('click', e => {
  const t = e.target;
  if (t.dataset.inc !== undefined) cart[+t.dataset.inc].qty++;
  else if (t.dataset.dec !== undefined) {
    const i = +t.dataset.dec;
    cart[i].qty > 1 ? cart[i].qty-- : cart.splice(i, 1);
  }
  else if (t.dataset.rm !== undefined) cart.splice(+t.dataset.rm, 1);
  else return;
  renderCart();
});
function openDrawer() { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); veil.classList.add('on'); syncLock(); }
function closeDrawer() { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); veil.classList.remove('on'); syncLock(); }
if (el('cartBtn')) el('cartBtn').addEventListener('click', openDrawer);
if (el('dClose')) el('dClose').addEventListener('click', closeDrawer);
if (veil) veil.addEventListener('click', closeDrawer);
renderCart();

/* default WA links */
const waDefault = `https://wa.me/${WA}?text=${encodeURIComponent('Halo SENAVA, aku mau lihat koleksi yang ready.')}`;
if (el('waCta')) el('waCta').href = waDefault;
if (el('waFoot')) el('waFoot').href = waDefault;

/* ---------- lookbook progress ---------- */
const track = el('lookTrack'), fill = el('lookFill');
if (track && fill) track.addEventListener('scroll', () => {
  const max = track.scrollWidth - track.clientWidth;
  const pct = max > 0 ? track.scrollLeft / max : 0;
  fill.style.width = (12 + pct * 88) + '%';
}, { passive: true });

/* ---------- favorit (localStorage) ---------- */
const FAVS = 'snv-fav';
let favs = [];
try { favs = JSON.parse(localStorage.getItem(FAVS) || '[]').filter(id => PROD[id]); } catch (e) {}
function saveFavs() { try { localStorage.setItem(FAVS, JSON.stringify(favs)); } catch (e) {} }
function syncFavs() {
  $$('[data-fav]').forEach(b => b.classList.toggle('on', favs.includes(b.dataset.fav)));
  const lab = document.querySelector('.f-chip[data-filter="favorit"]');
  if (lab) lab.textContent = favs.length ? `\u2665 FAVORIT (${favs.length})` : '\u2665 FAVORIT';
}
document.addEventListener('click', e => {
  const f = e.target.closest('[data-fav]');
  if (!f) return;
  const i = favs.indexOf(f.dataset.fav);
  i > -1 ? favs.splice(i, 1) : favs.push(f.dataset.fav);
  saveFavs(); syncFavs();
  document.dispatchEvent(new Event('snv:favs'));
});

/* ---------- katalog (hanya kalau #grid ada) ---------- */
const grid = el('grid');
if (grid) {
  const order = Object.keys(PROD);
  let filter = 'semua', sort = 'default';

  const cardHTML = (id, n) => {
    const p = PROD[id];
    return `<article class="card" data-id="${id}">
      <div class="c-media"><img src="${p.img}" alt="${p.name}" loading="lazy" width="1600" height="1600"><span class="c-num" aria-hidden="true">${String(n).padStart(2, '0')}</span>${BARU.includes(id) ? '<span class="c-new mono">BARU</span>' : ''}<button class="c-fav${favs.includes(id) ? ' on' : ''}" type="button" data-fav="${id}" aria-label="Simpan ${p.name}">♥</button></div>
      <div class="c-body">
        <p class="c-meta mono">${p.meta}</p>
        <h3>${p.name}</h3>
        <p class="c-price mono">${rp(p.price)}</p>
        <button class="c-qv mono" type="button" data-qv="${id}">EXPLORE ↗</button>
      </div>
    </article>`;
  };
  function list() {
    const q = (el('q') ? el('q').value : '').toLowerCase().trim();
    let ids = order.filter(id =>
      (filter === 'semua' || (filter === 'favorit' ? favs.includes(id) : PROD[id].cat === filter)) &&
      (!q || (PROD[id].name + ' ' + PROD[id].meta + ' ' + PROD[id].desc).toLowerCase().includes(q)));
    if (sort === 'baru') ids.sort((a, b) => (BARU.includes(b) ? 1 : 0) - (BARU.includes(a) ? 1 : 0));
    else if (sort === 'nama') ids.sort((a, b) => PROD[a].name.localeCompare(PROD[b].name, 'id'));
    else if (sort === 'murah') ids.sort((a, b) => PROD[a].price - PROD[b].price);
    else if (sort === 'mahal') ids.sort((a, b) => PROD[b].price - PROD[a].price);
    return ids;
  }
  /* build sekali; filter/sort = FLIP (kartu bergerak ke posisi baru) */
  grid.innerHTML = order.map(id => cardHTML(id, 1)).join('');
  const cards = {};
  $$('.card', grid).forEach(c => { cards[c.dataset.id] = c; });
  let firstApply = true;
  function render() {
    const ids = list();
    const state = (!RM && window.Flip && !firstApply) ? Flip.getState(Object.values(cards)) : null;
    order.forEach(id => { cards[id].style.display = ids.includes(id) ? '' : 'none'; });
    ids.forEach((id, i) => {
      cards[id].querySelector('.c-num').textContent = String(i + 1).padStart(2, '0');
      grid.appendChild(cards[id]);
    });
    const cnt = el('count');
    count.textContent = `${ids.length} / ${order.length} PIECES`;
    if (state) {
      Flip.from(state, {
        targets: ids.map(id => cards[id]),
        duration: .65, ease: 'expo.out', absolute: true, stagger: .03,
        onEnter: els => gsap.fromTo(els, { autoAlpha: 0, scale: .94 }, { autoAlpha: 1, scale: 1, duration: .5, ease: 'expo.out' }),
        onLeave: els => gsap.to(els, { autoAlpha: 0, duration: .35 }),
        onComplete: () => gsap.set(Object.values(cards), { clearProps: 'transform' }),
      });
    } else if (!firstApply && !RM) {
      gsap.fromTo(ids.map(id => cards[id]), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'expo.out', stagger: .04 });
    }
    firstApply = false;
  }
  /* filter dari URL: katalog.html?cat=bawahan */
  const qp = new URLSearchParams(location.search).get('cat');
  if (qp && (CAT_LABEL[qp] || qp === 'favorit')) {
    filter = qp;
    $$('.f-chip[data-filter]').forEach(x => x.classList.toggle('on', x.dataset.filter === qp));
  }
  $$('.f-chip').forEach(ch => ch.addEventListener('click', () => {
    const group = ch.dataset.filter !== undefined ? 'filter' : 'sort';
    $$(`.f-chip[data-${group}]`).forEach(x => x.classList.remove('on'));
    ch.classList.add('on');
    if (group === 'filter') {
      filter = ch.dataset.filter;
      history.replaceState(null, '', CAT_LABEL[filter] ? location.pathname + '?cat=' + filter : location.pathname);
    } else sort = ch.dataset.sort;
    render();
  }));
  if (el('q')) el('q').addEventListener('input', () => render());
  document.addEventListener('snv:favs', () => { if (filter === 'favorit') render(); });
  syncFavs();
  render();
}

/* ---------- scroll progress ---------- */
const prog = document.createElement('div');
prog.className = 'progress';
document.body.appendChild(prog);
function progUpd() {
  const m = document.documentElement.scrollHeight - innerHeight;
  prog.style.transform = 'scaleX(' + (m > 0 ? Math.min(1, scrollY / m) : 0) + ')';
}
addEventListener('scroll', progUpd, { passive: true });
addEventListener('resize', progUpd);
progUpd();

/* ---------- side rail indeks bagian (index) ---------- */
const rail = el('rail');
if (rail) {
  const rl = $$('#rail a');
  const secs = rl.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (secs.length) {
    const io = new IntersectionObserver(es => {
      es.forEach(en => {
        if (!en.isIntersecting) return;
        rl.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-42% 0px -50% 0px' });
    secs.forEach(s => io.observe(s));
    rail.style.display = 'flex';
  }
}

/* ---------- esc ---------- */
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeQV(); closeDrawer(); if (menu && menu.classList.contains('open')) closeMenu();
});
