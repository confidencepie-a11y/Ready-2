(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  function buzz() { if (navigator.vibrate) navigator.vibrate(10); }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Balance ----
  var balance = 0;   // change this to set the starting balance
  var shown = 0;
  var hidden = false;
  var balEl = $('balance');
  var eye = $('eye');

  function money(n) {
    var p = n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('.');
    return '<span class="cur">$</span>' + p[0] + '<span class="dec">.' + p[1] + '</span>';
  }
  function renderBalance() {
    balEl.innerHTML = hidden ? '<span class="cur">$</span>••••' : money(shown);
  }

  function countUp(to) {
    if (reduce || to === 0) { shown = to; renderBalance(); return; }
    var t0 = performance.now(), dur = 700;
    (function step(t) {
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      shown = Math.round(to * e * 100) / 100;
      renderBalance();
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  eye.addEventListener('click', function () {
    hidden = !hidden;
    eye.setAttribute('aria-pressed', String(hidden));
    eye.setAttribute('aria-label', hidden ? 'Show balance' : 'Hide balance');
    renderBalance();
    buzz();
  });

  // ---- Transactions (sample data from the mockup) ----
  var IN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7 7 17M16 17H7V8"/></svg>';
  var OUT = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';

  // [name, date, amount (number), isIncoming]
  var transactions = [
    ['Colins Ewah', 'July 25th, 2025', 100, true],
    ['Umar Bamisile', 'July 25th, 2025', 1000, true],
    ['Joy Ogeh', 'July 25th, 2025', 100, false],
    ['Okolo Moses', 'July 25th, 2025', 100, false]
  ];

  var txEl = $('txs');

  function renderSkeleton() {
    var row = '<div class="tx sk" style="opacity:1;animation:none"><div class="ic"></div><div class="bar"></div><div class="bar s"></div></div>';
    txEl.innerHTML = new Array(transactions.length + 1).join(row);
  }

  function renderTransactions() {
    txEl.innerHTML = transactions.map(function (t, i) {
      return '<div class="tx ' + (t[3] ? 'in' : 'out') + '" style="animation-delay:' + (0.05 + i * 0.07) + 's">' +
             '<div class="ic">' + (t[3] ? IN : OUT) + '</div>' +
             '<div class="nm">' + t[0] + '<small>' + t[1] + '</small></div>' +
             '<div class="amt">' + (t[3] ? '+' : '-') + money(t[2]) + '<br><span>Successful</span></div></div>';
    }).join('');
  }

  // Brief skeleton on launch, then reveal real content
  balEl.classList.add('skel');
  balEl.innerHTML = '<span class="cur">$</span>000<span class="dec">.00</span>';
  renderSkeleton();
  setTimeout(function () {
    balEl.classList.remove('skel');
    renderTransactions();
    countUp(balance);
  }, reduce ? 0 : 600);

  // ---- Bottom tabs ----
  var tabs = document.querySelectorAll('.tab');
  var screens = document.querySelectorAll('.screen');
  tabs.forEach(function (b) {
    b.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      screens.forEach(function (s) { s.classList.toggle('on', s.id === b.dataset.t); });
      buzz();
    });
  });

  // ---- Bottom sheet (placeholder for Send / Receive / QR / Add) ----
  var sheet = $('sheet'), scrim = $('scrim'), closeBtn = $('sheetClose');
  var lastFocus = null;

  function openSheet(title, body) {
    lastFocus = document.activeElement;
    $('sheetTitle').textContent = title;
    $('sheetBody').textContent = body;
    sheet.classList.add('open');
    scrim.classList.add('open');
    sheet.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
    buzz();
  }
  function closeSheet() {
    sheet.classList.remove('open');
    scrim.classList.remove('open');
    sheet.setAttribute('aria-hidden', 'true');
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('[data-sheet]').forEach(function (b) {
    b.addEventListener('click', function () { openSheet(b.dataset.sheet, b.dataset.body); });
  });
  scrim.addEventListener('click', closeSheet);
  closeBtn.addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet.classList.contains('open')) closeSheet();
  });
})();
