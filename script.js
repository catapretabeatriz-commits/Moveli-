/* ===== Moveli – script.js ===== */
(function () {
  'use strict';

  // >>> Edite aqui: número com DDI+DDD, só dígitos (ex.: 5531999999999). Vazio = botão não aparece.
  var CONFIG = { whatsapp: '', mensagem: 'Olá! Quero um orçamento de móveis sob medida.' };

  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1) Logo: V com régua recortada por máscara (funciona sobre qualquer fundo) */
  var ticks = '';
  for (var k = 0; k < 9; k++) {
    var y = 8 + k * 10.5, x = 0.37 * y, l = k % 2 ? 8 : 13;
    ticks += '<path d="M' + (x - 1) + ' ' + y + ' L' + (x + l) + ' ' + y + '" stroke="#000" stroke-width="3.6"/>';
  }
  document.querySelectorAll('svg[data-v]').forEach(function (s, i) {
    var id = 'mk' + i;
    s.innerHTML = '<defs><mask id="' + id + '" maskUnits="userSpaceOnUse" x="-5" y="-5" width="110" height="110">' +
      '<rect x="-5" y="-5" width="110" height="110" fill="#fff"/>' + ticks + '</mask></defs>' +
      '<polygon fill="currentColor" points="50,72 74,0 100,0 63,100 37,100"/>' +
      '<polygon fill="currentColor" mask="url(#' + id + ')" points="0,0 26,0 50,72 37,100"/>';
  });

  /* 2) Revelação ao rolar (uma vez só, com escalonamento por grupo) */
  var els = [].slice.call(document.querySelectorAll('.rv'));
  els.forEach(function (el) {
    var i = [].filter.call(el.parentNode.children, function (c) { return c.classList.contains('rv'); }).indexOf(el);
    el.style.setProperty('--d', Math.min(i, 5) * 0.09 + 's');
  });
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* 3) Menu mobile */
  var body = document.body, burger = document.querySelector('.burger'), header = document.querySelector('header');
  function menu(open) {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  burger.addEventListener('click', function () { menu(!body.classList.contains('menu-open')); });
  document.querySelectorAll('#menu a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu(false); });
  window.matchMedia('(min-width: 761px)').addEventListener('change', function () { menu(false); });

  /* 4) Régua do hero + cabeçalho + link ativo, tudo num único rAF no scroll */
  var ruler = document.querySelector('.hero .ruler'), hero = document.querySelector('.hero'), tk = [];
  if (ruler) {
    var n = 40, ord = [], i;
    for (i = 0; i < n; i++) ord.push(i / n);
    for (i = n - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = ord[i]; ord[i] = ord[j]; ord[j] = t; }
    for (i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.className = 'ruler-tick';
      s.style.left = (i / (n - 1)) * 100 + '%';
      s.style.height = (i % 5 === 0 ? 38 : i % 2 === 0 ? 24 : 14) + 'px';
      s.style.transitionDelay = (Math.random() * 0.2).toFixed(2) + 's';
      ruler.appendChild(s);
      tk.push({ el: s, at: ord[i] });
    }
  }
  var links = [].slice.call(document.querySelectorAll('#menu li:not(.m-only) a')).map(function (a) {
    return { a: a, s: document.querySelector(a.getAttribute('href')) };
  });
  var queued = false;
  function frame() {
    queued = false;
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 8);
    if (tk.length) {
      var p = Math.min(Math.max(y / ((hero.offsetHeight || 600) * 0.6), 0), 1);
      tk.forEach(function (o) { o.el.classList.toggle('puxada', p > 0.02 && p >= o.at); });
    }
    var mid = y + window.innerHeight * 0.4;
    links.forEach(function (o) {
      var on = o.s && o.s.offsetTop <= mid && o.s.offsetTop + o.s.offsetHeight > mid;
      if (on) o.a.setAttribute('aria-current', 'true'); else o.a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener('resize', frame);
  frame();

  /* 5) Fotos que ainda não existem viram um espaço reservado elegante */
  document.querySelectorAll('.projeto-card img, .sobre-foto img').forEach(function (img) {
    function miss() { img.parentNode.classList.add('sem-foto'); }
    if (img.complete && img.naturalWidth === 0) miss(); else img.addEventListener('error', miss);
  });

  /* 6) WhatsApp (só aparece se você preencher o número em CONFIG) */
  if (CONFIG.whatsapp) {
    document.querySelectorAll('[data-wa]').forEach(function (a) {
      a.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(CONFIG.mensagem);
      a.hidden = false;
    });
  }
})();
