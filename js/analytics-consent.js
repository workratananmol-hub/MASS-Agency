/* Optional analytics: no Google request until a visitor opts in. */
(() => {
  'use strict';
  const measurement = 'G-S0TWT8QTLL';
  const storageKey = 'mass.analytics-choice.v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  let loaded = false;
  let choice = null;
  let previousFocus = null;
  window['ga-disable-' + measurement] = true;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && ['allow', 'decline'].includes(saved.value) && Date.now() - saved.at < lifetime) choice = saved.value;
  } catch { /* Storage may be unavailable. A choice still works for this page. */ }
  const cleanUrl = value => {
    try { const u = new URL(value); return u.origin + u.pathname; } catch { return ''; }
  };
  const enable = () => {
    if (loaded) return;
    loaded = true;
    window['ga-disable-' + measurement] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', measurement, { allow_google_signals: false, allow_ad_personalization_signals: false, page_location: cleanUrl(location.href), page_referrer: cleanUrl(document.referrer) });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurement;
    document.head.append(tag);
  };
  const style = document.createElement('style');
  style.textContent = `
    .mass-consent{position:fixed;inset:auto 20px 20px auto;width:min(440px,calc(100vw - 40px));padding:22px;background:#f7f6ef;color:#172b2b;border:1px solid #c6cdc5;border-radius:4px;box-shadow:0 8px 40px #0002;z-index:10050;font:15px/1.5 "Instrument Sans",Arial,sans-serif}
    .mass-consent[hidden]{display:none}.mass-consent h2{font:600 19px/1.3 "Instrument Sans",Arial,sans-serif;letter-spacing:0;margin:0 0 8px}.mass-consent p{font:15px/1.5 "Instrument Sans",Arial,sans-serif;margin:0 0 16px;color:#344846}.mass-consent a{color:inherit;text-decoration:underline}
    .mass-consent-actions{display:flex;gap:10px}.mass-consent button,.mass-consent-open{font:600 14px/1.3 "Instrument Sans",Arial,sans-serif;border:1px solid #173b35;border-radius:3px;cursor:pointer}.mass-consent button{flex:1;padding:11px 10px;background:#173b35;color:#fff}.mass-consent button:last-child{background:#f7f6ef;color:#173b35}.mass-consent button:focus-visible,.mass-consent-open:focus-visible{outline:3px solid #f2aa43;outline-offset:4px}
    .mass-consent-open{position:fixed;bottom:12px;left:12px;min-height:44px;padding:10px 12px;color:#173b35;background:#f7f6ef;z-index:10040;box-shadow:0 2px 10px #0001;font-size:12px}
    @media(max-width:600px){.mass-consent{inset:auto 12px 52px;width:calc(100vw - 24px);padding:18px}}
    @media print{.mass-consent,.mass-consent-open{display:none}}
  `;
  document.head.append(style);
  const panel = document.createElement('section');
  panel.className = 'mass-consent';
  panel.id = 'mass-analytics-preferences';
  panel.setAttribute('aria-labelledby', 'mass-consent-title');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.innerHTML = '<h2 id="mass-consent-title">Optional analytics</h2><p>May we use Google Analytics to understand visits? The site works without it. Your choice is saved for 180 days when browser storage is available. <a href="/privacy">Privacy policy</a></p><div class="mass-consent-actions"><button type="button" data-choice="allow">Allow analytics</button><button type="button" data-choice="decline">Decline analytics</button></div>';
  const opener = document.createElement('button');
  opener.type = 'button';
  opener.className = 'mass-consent-open';
  opener.textContent = 'Privacy settings';
  opener.setAttribute('aria-controls', panel.id);
  opener.setAttribute('aria-expanded', String(!choice));
  const show = focus => {
    previousFocus = document.activeElement;
    panel.hidden = false;
    opener.setAttribute('aria-expanded', 'true');
    if (focus) panel.querySelector('button').focus();
  };
  const hide = () => {
    panel.hidden = true;
    opener.setAttribute('aria-expanded', 'false');
    if (panel.contains(document.activeElement)) (previousFocus && previousFocus !== document.body ? previousFocus : opener).focus();
  };
  const clearAnalyticsCookies = () => {
    document.cookie.split(';').forEach(pair => {
      const name = pair.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) return;
      ['', location.hostname, '.' + location.hostname].forEach(domain => {
        document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '') + '; SameSite=Lax';
      });
    });
  };
  panel.addEventListener('click', event => {
    const button = event.target.closest('[data-choice]');
    if (!button) return;
    choice = button.dataset.choice;
    try { localStorage.setItem(storageKey, JSON.stringify({ value: choice, at: Date.now() })); } catch {}
    hide();
    if (choice === 'allow') enable();
    else {
      window['ga-disable-' + measurement] = true;
      clearAnalyticsCookies();
      if (loaded) { window.gtag = undefined; location.reload(); }
    }
  });
  panel.addEventListener('keydown', event => { if (event.key === 'Escape' && choice) { hide(); opener.focus(); } });
  opener.addEventListener('click', () => panel.hidden ? show(true) : hide());
  document.body.append(panel, opener);
  panel.hidden = !!choice;
  if (choice === 'allow') enable();
})();
