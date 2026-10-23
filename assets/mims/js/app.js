/* MIMS interactive product preview. Examples on this page are authored demonstrations.
   The waitlist handoff opens the visitor's email application; no data is stored in this page. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  // Navigation is a non-modal disclosure, with focus returned on Escape.
  const menuToggle = $('.menu-toggle');
  const menu = $('#site-menu');
  function setMenu(open, returnFocus = false) {
    menu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    if (returnFocus) menuToggle.focus();
  }
  menuToggle.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !menu.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false);
  });

  // Subject navigation uses ARIA tabs and an authored request for each example.
  const subjectTabs = $$('[data-subject]');
  const exampleButton = $('#play-example');
  const request = $('#lesson-request');
  let activeSubject = 'maths';
  let demoTimers = [];
  const requests = {
    maths: 'Explain two coin tosses and show the sample space with all outcomes.',
    science: 'Show how one ray changes direction as it enters and leaves a triangular glass prism.',
    english: 'In The Fun They Had, show the contrast between Margie learning alone and the older school she imagines.',
    social: 'In the French Revolution, explain why the Third Estate challenged voting by estate.'
  };
  const exampleLabels = {
    maths: 'Play explanation', science: 'Play prism explanation',
    english: 'Play story explanation', social: 'Play voting explanation'
  };
  function clearDemoTimers() {
    demoTimers.forEach(clearTimeout);
    demoTimers = [];
    $$('.outcome').forEach(outcome => outcome.classList.remove('is-flipping'));
    exampleButton.disabled = false;
  }
  function setExampleLabel() {
    exampleButton.firstChild.textContent = `${exampleLabels[activeSubject]} `;
  }
  function selectSubject(subject, focus = false) {
    clearDemoTimers();
    activeSubject = subject;
    document.querySelectorAll('.motion-player video').forEach(video => video.pause());
    subjectTabs.forEach(tab => {
      const selected = tab.dataset.subject === subject;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
      if (selected && focus) tab.focus();
    });
    request.value = requests[subject];
    setExampleLabel();
  }
  function wireTabKeyboard(tabs, activate, vertical = false) {
    tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
      let next = index;
      if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) next = (index + 1) % tabs.length;
      else if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(tabs[next]);
      tabs[next].focus();
    }));
  }
  subjectTabs.forEach(tab => tab.addEventListener('click', () => selectSubject(tab.dataset.subject)));
  wireTabKeyboard(subjectTabs, tab => selectSubject(tab.dataset.subject));
  $$('[data-explore]').forEach(button => button.addEventListener('click', () => {
    selectSubject(button.dataset.explore);
    $('#experience').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    subjectTabs.find(tab => tab.dataset.subject === button.dataset.explore).focus({ preventScroll: true });
  }));

  // Probability explanation: all four outcomes are always equally likely.
  const outcomes = $$('.outcome');
  const probabilityMessage = $('#probability-message');
  const fraction = $('.fraction-result');
  function showOneHead() {
    outcomes.forEach((outcome, index) => {
      const selected = index === 1 || index === 2;
      outcome.classList.toggle('favourable', selected);
      outcome.setAttribute('aria-pressed', String(selected));
    });
    probabilityMessage.innerHTML = 'Exactly one head: <strong>2 of 4 outcomes.</strong>';
    fraction.innerHTML = 'P = <span>2 / 4</span> = <strong>½</strong>';
    $('.result-bracket').style.opacity = '1';
  }
  const outcomeNames = ['Two heads', 'Head then tail', 'Tail then head', 'Two tails'];
  outcomes.forEach((outcome, index) => outcome.addEventListener('click', () => {
    clearDemoTimers();
    outcomes.forEach(other => {
      const selected = other === outcome;
      other.classList.toggle('favourable', selected);
      other.setAttribute('aria-pressed', String(selected));
    });
    probabilityMessage.textContent = `${outcomeNames[index]}: 1 of 4 outcomes.`;
    fraction.innerHTML = 'P = <span>1 / 4</span> = <strong>¼</strong>';
    $('.result-bracket').style.opacity = '0';
  }));
  $('#reset-outcomes').addEventListener('click', () => { clearDemoTimers(); showOneHead(); });
  function playProbability() {
    clearDemoTimers();
    if (reducedMotion.matches) { showOneHead(); return; }
    exampleButton.disabled = true;
    probabilityMessage.textContent = 'Two tosses. Four equally likely outcomes.';
    fraction.innerHTML = '<span>Building the sample space…</span>';
    $('.result-bracket').style.opacity = '0';
    outcomes.forEach((outcome, index) => {
      outcome.classList.remove('favourable');
      outcome.setAttribute('aria-pressed', 'false');
      demoTimers.push(setTimeout(() => outcome.classList.add('is-flipping'), index * 190));
    });
    demoTimers.push(setTimeout(() => { showOneHead(); exampleButton.disabled = false; }, 1500));
    demoTimers.push(setTimeout(() => outcomes.forEach(outcome => outcome.classList.remove('is-flipping')), 1700));
  }

  // Future-subject playback is handled by the HyperFrames media controller.
  exampleButton.addEventListener('click', () => {
    if (activeSubject === 'maths') playProbability();
    else window.MIMSTeachingMedia?.play(activeSubject);
  });

  // Audience explorer. Its companion section keeps school value visible by default.
  const roleTabs = $$('[data-role]');
  function selectRole(button) {
    roleTabs.forEach(tab => {
      const selected = tab === button;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
    });
  }
  roleTabs.forEach(button => button.addEventListener('click', () => selectRole(button)));
  wireTabKeyboard(roleTabs, selectRole, true);

  let workflowTimers = [];
  const workflowItems = $$('.school-workflow li');
  function showWorkflowStep(index) {
    workflowItems.forEach((item, itemIndex) => item.classList.toggle('active', index === itemIndex));
    $('#workflow-status').textContent = workflowItems[index].textContent.trim();
  }
  $('#play-workflow').addEventListener('click', () => {
    workflowTimers.forEach(clearTimeout);
    workflowTimers = [];
    if (reducedMotion.matches) {
      const current = workflowItems.findIndex(item => item.classList.contains('active'));
      showWorkflowStep((current + 1) % workflowItems.length);
      return;
    }
    workflowItems.forEach((_, index) => workflowTimers.push(setTimeout(() => showWorkflowStep(index), index * 950)));
  });

  // Native dialog previews use the original sampled image, with neutral framing.
  const dialog = $('#proof-dialog');
  let proofTrigger = null;
  const proofNames = { slide: 'A triangle from the observer’s eye', paper: 'Trigonometry question paper', key: 'Matching worked answer key' };
  $$('[data-proof]').forEach(button => button.addEventListener('click', () => {
    proofTrigger = button;
    const kind = button.dataset.proof;
    $('#proof-title').textContent = proofNames[kind];
    const holder = $('#proof-dialog-image');
    holder.className = `dialog-image ${kind === 'slide' ? 'slide-crop' : 'paper-crop'}`;
    holder.replaceChildren($('img', button).cloneNode());
    dialog.showModal();
    $('.dialog-close', dialog).focus();
  }));
  $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => proofTrigger?.focus({ preventScroll: true }));

  // There is no collection endpoint. Prepare an email request and make that handoff explicit.
  $('#waitlist-form').addEventListener('submit', event => {
    event.preventDefault();
    const email = $('#email').value.trim();
    const role = $('#role').value;
    const status = $('#form-status');
    if (!email || !role) {
      status.textContent = 'Add your email address and role first.';
      return;
    }
    const subject = 'MIMS waitlist request';
    const body = `Please add me to the MIMS waitlist.\n\nEmail: ${email}\nRole: ${role}\n\nI understand that this opens my email app and I need to review and send the request.`;
    const href = `mailto:contact@mass.llc?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.replaceChildren('Your email app will open with a prepared request. Review and send it to complete the request. ');
    const fallback = document.createElement('a');
    fallback.href = href;
    fallback.textContent = 'Open the prepared email';
    fallback.className = 'text-link';
    status.append(fallback);
    const fallbackText = `To: contact@mass.llc\nSubject: ${subject}\n\n${body}`;
    const copyBlock = document.createElement('div');
    copyBlock.className = 'waitlist-copy-fallback';
    const copyLabel = document.createElement('label');
    copyLabel.textContent = 'No email app? Copy this request:';
    const copyText = document.createElement('textarea');
    copyText.readOnly = true;
    copyText.value = fallbackText;
    copyText.setAttribute('aria-label', 'Prepared MIMS waitlist email');
    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.textContent = 'Copy request';
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(fallbackText);
        copyButton.textContent = 'Copied';
      } catch {
        copyText.focus();
        copyText.select();
        copyButton.textContent = 'Select text to copy';
      }
    });
    copyBlock.append(copyLabel, copyText, copyButton);
    status.append(copyBlock);
    window.location.href = href;
  });

  // Separate transform systems: pointer motion uses the translate property on
  // individual layers; scroll motion uses a distinct outer wrapper.
  const scenes = $$('[data-depth-scene]').map(element => ({
    element,
    layers: $$('[data-depth]', element).filter(layer => layer.closest('[data-depth-scene]') === element),
    x: 0, y: 0, targetX: 0, targetY: 0
  }));
  let frame = null;
  function animateDepth() {
    frame = null;
    let stillMoving = false;
    scenes.forEach(scene => {
      scene.x += (scene.targetX - scene.x) * .085;
      scene.y += (scene.targetY - scene.y) * .085;
      if (Math.abs(scene.targetX - scene.x) + Math.abs(scene.targetY - scene.y) > .001) stillMoving = true;
      scene.layers.forEach(layer => {
        const amount = Number(layer.dataset.depth);
        layer.style.setProperty('--depth-x', `${(scene.x * amount).toFixed(2)}px`);
        layer.style.setProperty('--depth-y', `${(scene.y * amount * .6).toFixed(2)}px`);
      });
    });
    if (stillMoving) frame = requestAnimationFrame(animateDepth);
  }
  function scheduleDepth() { if (frame === null) frame = requestAnimationFrame(animateDepth); }
  scenes.forEach(scene => {
    scene.element.addEventListener('pointermove', event => {
      if (reducedMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
      const rect = scene.element.getBoundingClientRect();
      scene.targetX = (event.clientX - rect.left) / rect.width - .5;
      scene.targetY = (event.clientY - rect.top) / rect.height - .5;
      scheduleDepth();
    }, { passive: true });
    scene.element.addEventListener('pointerleave', () => {
      scene.targetX = 0; scene.targetY = 0; scheduleDepth();
    });
  });
  reducedMotion.addEventListener('change', () => {
    scenes.forEach(scene => { scene.targetX = scene.targetY = 0; });
    scheduleDepth();
    clearDemoTimers();
    workflowTimers.forEach(clearTimeout);
  });
})();
