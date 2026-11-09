/* FBEDS case study: live hero, layer scrollytelling, workflow explorer, email simulator. No dependencies. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function onView(el, cb, opts) {
    if (!('IntersectionObserver' in window)) { cb(true); return null; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { cb(e.isIntersecting, e); });
    }, opts || { threshold: 0.15 });
    io.observe(el);
    return io;
  }

  /* Reading progress */
  var bar = document.querySelector('[data-fb-progress]');
  if (bar) {
    var ticking = false;
    var setP = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--p', h > 0 ? Math.min(1, window.scrollY / h).toFixed(4) : 0);
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(setP); } }, { passive: true });
    setP();
  }

  /* Live hero: emails flow in, get classified, flow out */
  (function hero() {
    var root = document.querySelector('[data-fb-live]');
    if (!root) return;
    var svg = root.querySelector('svg');
    var layer = svg.querySelector('[data-fb-particles]');
    var ins = [].slice.call(svg.querySelectorAll('[data-in]'));
    var outs = {};
    [].forEach.call(svg.querySelectorAll('[data-out]'), function (p) { outs[p.getAttribute('data-out')] = p; });
    var dests = {};
    [].forEach.call(svg.querySelectorAll('[data-dest]'), function (p) { dests[p.getAttribute('data-dest')] = p; });
    var countEl = root.querySelector('[data-fb-count]');
    var reviewEl = root.querySelector('[data-fb-review]');
    var count = 0, review = 0;
    var LIME = '#cfff04', AMBER = '#ffb547', GREY = '#8a8a82';

    function pick() {
      var r = Math.random();
      if (r < 0.2) return 'noise';
      if (r < 0.45) return 'filed';
      if (r < 0.72) return 'drafts';
      if (r < 0.92) return 'contacts';
      return 'review';
    }
    function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

    var parts = [];
    function spawn(now) {
      var c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('r', '5');
      c.setAttribute('fill', GREY);
      layer.appendChild(c);
      var inPath = ins[Math.floor(Math.random() * ins.length)];
      parts.push({ el: c, inPath: inPath, inLen: inPath.getTotalLength(), route: pick(), t0: now, phase: 0 });
    }
    function place(el, path, len, t) {
      var pt = path.getPointAtLength(len * t);
      el.setAttribute('cx', pt.x.toFixed(1));
      el.setAttribute('cy', pt.y.toFixed(1));
    }
    function hit(name) {
      var d = dests[name];
      if (!d) return;
      d.classList.add('is-hit');
      setTimeout(function () { d.classList.remove('is-hit'); }, 450);
    }

    if (reduce) {
      ins.forEach(function (p, i) {
        var c = document.createElementNS(SVGNS, 'circle');
        c.setAttribute('r', '5'); c.setAttribute('fill', GREY); layer.appendChild(c);
        place(c, p, p.getTotalLength(), 0.35 + i * 0.08);
      });
      Object.keys(outs).forEach(function (k, i) {
        var c = document.createElementNS(SVGNS, 'circle');
        c.setAttribute('r', '5'); c.setAttribute('fill', k === 'review' ? AMBER : LIME); layer.appendChild(c);
        place(c, outs[k], outs[k].getTotalLength(), 0.5 + i * 0.05);
      });
      return;
    }

    var IN = 1700, HOLD = 380, OUT = 1500, running = false, last = 0, raf = 0;
    function frame(now) {
      if (!running) return;
      if (now - last > 420) { spawn(now); last = now; }
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i], dt = now - p.t0;
        if (dt < IN) {
          place(p.el, p.inPath, p.inLen, ease(dt / IN));
        } else if (dt < IN + HOLD) {
          if (p.phase === 0) {
            p.phase = 1;
            p.el.setAttribute('cx', 700); p.el.setAttribute('cy', 450);
            p.el.setAttribute('fill', p.route === 'noise' ? '#3a3a36' : p.route === 'review' ? AMBER : LIME);
          }
          if (p.route === 'noise') p.el.setAttribute('opacity', (1 - (dt - IN) / HOLD).toFixed(2));
        } else if (p.route !== 'noise' && dt < IN + HOLD + OUT) {
          var op = outs[p.route];
          if (!p.outLen) p.outLen = op.getTotalLength();
          place(p.el, op, p.outLen, ease((dt - IN - HOLD) / OUT));
        } else {
          count++;
          if (p.route === 'review') review++;
          if (p.route !== 'noise') hit(p.route);
          if (countEl) countEl.textContent = count;
          if (reviewEl) reviewEl.textContent = review;
          layer.removeChild(p.el);
          parts.splice(i, 1);
        }
      }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() {
      running = false; cancelAnimationFrame(raf);
      parts.forEach(function (p) { if (p.el.parentNode) layer.removeChild(p.el); });
      parts = [];
    }
    onView(root, function (vis) { vis && !document.hidden ? start() : stop(); }, { threshold: 0.05 });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (root.getBoundingClientRect().bottom > 0 && root.getBoundingClientRect().top < window.innerHeight) start();
    });
  })();

  /* Layer scrollytelling */
  (function layers() {
    var box = document.querySelector('[data-fb-scrolly]');
    if (!box) return;
    var steps = [].slice.call(box.querySelectorAll('.fb-step'));
    var layerEls = [].slice.call(box.querySelectorAll('.fbl-layer'));
    var beam = box.querySelector('.fbl-beam');
    var Y = { 1: 100, 2: 210, 3: 320, 4: 430, 5: 540 };
    function setActive(n) {
      box.setAttribute('data-active', n);
      steps.forEach(function (s) { s.classList.toggle('is-active', +s.getAttribute('data-step') === n); });
      layerEls.forEach(function (l) {
        var k = +l.getAttribute('data-layer');
        l.classList.toggle('is-on', k === n);
        l.classList.toggle('is-done', k < n);
      });
      if (beam) beam.style.transform = 'translateY(' + (Y[n] - 130) + 'px)';
    }
    setActive(1);
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(+e.target.getAttribute('data-step')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  })();

  /* Six-workflow explorer */
  (function explorer() {
    var box = document.querySelector('[data-fb-wf]');
    if (!box) return;
    var tabs = [].slice.call(box.querySelectorAll('[role="tab"]'));
    var nodes = [].slice.call(box.querySelectorAll('.fbw-node[data-n]'));
    var edges = [].slice.call(box.querySelectorAll('.fbw-edges path'));
    var cur = 1, timer = 0, auto = !reduce, visible = false, DWELL = 6500;

    function show(n, focus) {
      cur = n;
      tabs.forEach(function (t) {
        var on = +t.getAttribute('data-wf') === n;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
        if (on && focus) t.focus();
      });
      nodes.forEach(function (el) {
        var id = el.getAttribute('data-n');
        var related = id === String(n);
        el.classList.toggle('is-on', related);
        el.classList.toggle('is-dim', !related && id !== 'in' && id !== 'ledger' && n !== 6);
      });
      edges.forEach(function (p) {
        var ids = (p.getAttribute('data-e') || '').split(' ');
        p.classList.toggle('is-on', ids.indexOf(String(n)) > -1);
      });
      progress();
    }
    function progress() {
      tabs.forEach(function (x) { x.style.removeProperty('--t'); });
      var on = auto && visible;
      box.toggleAttribute('data-auto', on);
      var t = tabs[cur - 1];
      if (!on || !t) return;
      t.style.setProperty('--t', '0');
      t.getBoundingClientRect();
      requestAnimationFrame(function () { t.style.setProperty('--t', '1'); });
    }
    function schedule() {
      clearTimeout(timer);
      if (!auto || !visible) return;
      timer = setTimeout(function () { show(cur % 6 + 1); schedule(); }, DWELL);
    }
    function stopAuto() { auto = false; clearTimeout(timer); progress(); }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { stopAuto(); show(+t.getAttribute('data-wf')); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowRight') n = (i + 1) % tabs.length;
        else if (k === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        else if (k === 'Home') n = 0;
        else if (k === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); stopAuto(); show(n + 1, true); }
      });
    });
        onView(box, function (vis) { visible = vis; vis ? (progress(), schedule()) : clearTimeout(timer); }, { threshold: 0.35 });
    show(1);
  })();

  /* Email simulator */
  (function simulator() {
    var box = document.querySelector('[data-fb-sim]');
    if (!box) return;
    var SAMPLES = {
      contract: {
        inbox: 'Contracting', time: '09:42',
        from: 'Sales Manager, Azure Dune Resort', addr: 'sales@azuredune.example',
        subject: 'Contract rates: Summer 2027 (May to September)',
        body: ['Dear partners, please find attached our contracted rates for Summer 2027, valid 1 May to 30 September.', 'Kindly confirm receipt.'],
        noise: ['Best regards, Sales Team | Azure Dune Resort | Tel +971 4 000 0000', '> On 2 Nov, Reservations wrote: Could you share next season’s rates...'],
        att: 'AzureDune_Summer2027_Contract.pdf',
        category: 'Contract and rates', importance: 'High', reply: 'Yes, acknowledge', conf: 97,
        checks: [['ok', 'Document names Azure Dune Resort, Dubai, 5-star'], ['ok', 'Subject confirms season: Summer 2027'], ['ok', 'Sender domain matches a known hotel'], ['ok', 'File name agrees with the document']],
        kind: 'auto', title: 'Filed, drafted and recorded. No one touched it.',
        out: [['Filed', 'Drive › Dubai › 5-star › Azure Dune Resort › Summer 2027'], ['Reply', 'Acknowledgement saved to Zoho Drafts, ready to send'], ['Contact', 'Sales Manager, Azure Dune Resort, updated in the sheet']]
      },
      booking: {
        inbox: 'Reservations', time: '11:08',
        from: 'Leena, Bluecompass Travel', addr: 'leena@bluecompass.example',
        subject: 'Group enquiry: 12 rooms, 14 to 18 March',
        body: ['Hello team, we have a corporate group of 24 guests. Could you share availability and best rates for 12 double rooms, 14 to 18 March, Abu Dhabi?', 'Breakfast included if possible.'],
        noise: ['Leena | Senior Travel Consultant | Bluecompass Travel | +971 50 000 0000', 'This email and any attachments are confidential...'],
        att: '',
        category: 'Booking request', importance: 'High', reply: 'Yes, quote', conf: 94,
        checks: [['ok', 'Clear request: dates, rooms and city stated'], ['ok', 'Sender is a travel agency, not a hotel'], ['dim', 'No attachment, nothing to file']],
        kind: 'auto', title: 'Reply drafted and contact captured.',
        out: [['Reply', 'Draft asking to confirm room type and meal plan, saved in Zoho'], ['Contact', 'Leena, Senior Travel Consultant, Bluecompass Travel, added'], ['Filing', 'Not needed']]
      },
      newsletter: {
        inbox: 'Reservations', time: '06:15',
        from: 'Deals Weekly', addr: 'no-reply@dealsweekly.example',
        subject: 'This week’s hottest deals, up to 60% off',
        body: ['Unmissable offers on flights, cruises and gadgets. Shop now before they are gone!'],
        noise: ['[view in browser] [banner image] [12 product tiles]', 'Unsubscribe | Manage preferences | Privacy policy'],
        att: '',
        category: 'Promotional / newsletter', importance: 'Low', reply: 'No', conf: 99,
        checks: [['ok', 'Bulk sender with an unsubscribe footer'], ['dim', 'No business document'], ['dim', 'No-reply address, kept out of contacts']],
        kind: 'noise', title: 'Recognised as noise. Nothing to do.',
        out: [['Result', 'Marked low priority. No file, no draft, no contact'], ['Ledger', 'Recorded so it is never processed twice']]
      },
      unclear: {
        inbox: 'Contracting', time: '15:31',
        from: 'Ahmed K.', addr: 'ahmed.k@mail.example',
        subject: 'Updated rates attached',
        body: ['Hi, please see the revised rates as discussed. Thanks.'],
        noise: ['Sent from my phone'],
        att: 'rates_final_v2.xlsx',
        category: 'Contract and rates (unsure)', importance: 'High', reply: 'Probably', conf: 62,
        checks: [['no', 'Document does not name a hotel'], ['no', 'Subject has no hotel or season'], ['no', 'Personal address, not a known hotel domain'], ['no', 'File name gives no hotel']],
        kind: 'review', title: 'Sent to the review desk. Nothing filed on a guess.',
        out: [['Waiting', 'On the review desk with the AI’s best suggestion'], ['Next', 'One click confirms or corrects it, then filing and drafting finish'], ['Safe', 'No folder created, no draft written until a person decides']]
      }
    };
    var pickBtns = [].slice.call(box.querySelectorAll('[data-sample]'));
    var mail = box.querySelector('[data-sim-mail]');
    var stages = [].slice.call(box.querySelectorAll('[data-sim-stages] li'));
    var conf = box.querySelector('[data-sim-conf]');
    var confOut = conf.querySelector('output');
    var log = box.querySelector('[data-sim-log]');
    var result = box.querySelector('[data-sim-result]');
    var replay = box.querySelector('[data-sim-replay]');
    var key = 'contract', timers = [], started = false;

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function clear() { timers.forEach(clearTimeout); timers = []; }
    function at(ms, fn) { timers.push(setTimeout(fn, reduce ? 0 : ms)); }
    function stage(i) { stages.forEach(function (s, k) { s.classList.toggle('is-on', k === i); s.classList.toggle('is-done', k < i); }); }
    function line(cls, text) { var li = document.createElement('li'); if (cls) li.className = cls; li.textContent = text; log.appendChild(li); }

    function renderMail(s) {
      mail.classList.remove('is-clean');
      mail.innerHTML =
        '<div class="fb-mail-bar"><span>Inbox <b>' + esc(s.inbox) + '</b></span><span>' + esc(s.time) + ' Dubai</span></div>' +
        '<div class="fb-mail-head"><p><b>' + esc(s.from) + '</b> &lt;' + esc(s.addr) + '&gt;</p><h3>' + esc(s.subject) + '</h3></div>' +
        '<div class="fb-mail-body">' + s.body.map(function (b) { return '<p>' + esc(b) + '</p>'; }).join('') +
        s.noise.map(function (b) { return '<p class="fb-mail-noise">' + esc(b) + '</p>'; }).join('') +
        (s.att ? '<span class="fb-mail-att">' + esc(s.att) + '</span>' : '') + '</div>';
    }

    function run() {
      var s = SAMPLES[key];
      clear();
      renderMail(s);
      log.innerHTML = '';
      result.className = 'fb-sim-result';
      result.innerHTML = '';
      replay.classList.remove('is-in');
      conf.classList.remove('is-low');
      conf.style.setProperty('--c', '0%');
      confOut.textContent = '—';
      stage(0);
      line('', 'Received in ' + s.inbox + ' inbox, claimed in the ledger');
      at(900, function () { stage(1); mail.classList.add('is-clean'); line('', 'Cleaned: signature, footer and quoted history removed'); });
      at(1900, function () {
        stage(2);
        line('', 'Category: ' + s.category);
        line('', 'Importance: ' + s.importance + ' · Reply needed: ' + s.reply);
        conf.style.setProperty('--c', s.conf + '%');
        conf.classList.toggle('is-low', s.conf < 85);
        confOut.textContent = s.conf + '%';
      });
      var t = 3000;
      at(t, function () { stage(3); });
      s.checks.forEach(function (c, i) { at(t + 350 * (i + 1), function () { line(c[0], c[1]); }); });
      t += 350 * (s.checks.length + 1) + 300;
      at(t, function () {
        stage(4);
        line(s.kind === 'review' ? 'no' : 'ok', s.kind === 'review' ? 'Evidence disagrees and confidence is below the bar: hold for a person' : s.kind === 'noise' ? 'No action required' : 'Evidence agrees and confidence clears the bar: act');
      });
      at(t + 900, function () {
        stage(5);
        line('ok', 'Decision, reason and confidence written to the ledger');
        result.className = 'fb-sim-result is-' + s.kind;
        result.innerHTML = '<span class="fb-kicker">' + (s.kind === 'review' ? 'Human review' : s.kind === 'noise' ? 'Noise' : 'Automatic') + '</span><h3>' + esc(s.title) + '</h3><ul>' +
          s.out.map(function (o) { return '<li><b>' + esc(o[0]) + '</b>' + esc(o[1]) + '</li>'; }).join('') + '</ul>';
        requestAnimationFrame(function () { result.classList.add('is-in'); });
        replay.classList.add('is-in');
      });
      at(t + 1800, function () { stages.forEach(function (st) { st.classList.remove('is-on'); st.classList.add('is-done'); }); });
    }

    pickBtns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        pickBtns.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); x.tabIndex = x === b ? 0 : -1; });
        key = b.getAttribute('data-sample');
        started = true;
        run();
      });
      b.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % pickBtns.length;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + pickBtns.length) % pickBtns.length;
        if (n !== null) { e.preventDefault(); pickBtns[n].focus(); pickBtns[n].click(); }
      });
      b.tabIndex = i === 0 ? 0 : -1;
    });
    replay.addEventListener('click', run);
    renderMail(SAMPLES[key]);
    onView(box, function (vis) { if (vis && !started) { started = true; run(); } }, { threshold: 0.35 });
  })();

  /* Before/after bars */
  [].forEach.call(document.querySelectorAll('[data-fb-bars]'), function (el) {
    var io = onView(el, function (vis) { if (vis) { el.classList.add('is-in'); if (io) io.disconnect(); } }, { threshold: 0.4 });
  });
})();
