/* A local, interactive product walkthrough. No model or account endpoint. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const app = $('.mims-app');
  const feedback = $('#app-feedback');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const screenNames = {home:'Home',builder:'Lesson builder',materials:'My materials',curriculum:'Curriculum'};
  let activeScreen = 'home';
  let selectedMaterial = 'slide';
  let selectedTopic = 'trigonometry';
  let story = null;
  let transition = null;
  let scrollTween = null;
  const notesByTopic = new Map();
  const materials = {
    slide:{title:'Introduction to Trigonometry',type:'Presentation',src:'/assets/mims/evidence/trigonometry-eye-level.svg'},
    paper:{title:'Trigonometry classroom assessment',type:'Question paper',pdf:'/assets/mims/documents/class10-trigonometry-test.pdf'},
    key:{title:'Trigonometry worked solutions',type:'Answer key',pdf:'/assets/mims/documents/class10-trigonometry-worked-key.pdf'}
  };
  // Reuse the actual DOM asset URLs so the single-file export stays self-contained.
  materials.slide.src = $('#editor-slide img').getAttribute('src');


  const topics = {
    trigonometry:{grade:'10',title:'Introduction to Trigonometry',description:'Connect an angle in a right triangle with the ratios of its sides.',concepts:['Identify the hypotenuse, opposite side and adjacent side.','Explain sine, cosine and tangent as ratios.','Connect a diagram with a worked example.'],request:'Prepare a visual explanation of trigonometric ratios, with a worked example and classroom practice.',notes:'Begin at the observer’s eye. Identify the line of sight, horizontal reference and height above eye level. Distinguish that height from the full tower height.'},
    probability:{grade:'10',title:'Probability',description:'Connect equally likely outcomes with the probability of an event.',concepts:['List the outcomes of a simple experiment.','Distinguish an outcome from an event.','Use favourable outcomes and total outcomes to express probability.'],request:'Explain two tosses of a fair coin. Show all four outcomes and the probability of exactly one head.',notes:'List HH, HT, TH and TT. Exactly one head occurs in HT and TH, so the probability is 2/4 = 1/2.'},
    numbers:{grade:'9',title:'Number Systems',description:'Distinguish rational and irrational numbers within the real number system.',concepts:['Connect rational numbers with fractions and decimal expansions.','Identify non-terminating, non-recurring decimals as irrational.','Place real numbers on a number line.'],request:'Prepare an explanation that helps students distinguish rational and irrational numbers, with examples and practice.',notes:'Begin with familiar fractions and decimal representations. Compare terminating and recurring decimals with non-terminating, non-recurring decimals.'},
    polynomials:{grade:'9',title:'Polynomials',description:'Read a polynomial through its terms, coefficients and degree.',concepts:['Identify coefficients, terms and the degree.','Evaluate a polynomial at a given value.','Relate a zero of a polynomial to its value becoming zero.'],request:'Prepare a visual explanation of terms, coefficients and degree, followed by polynomial evaluation practice.',notes:'Ask students to identify terms and coefficients before classifying the degree. Check evaluation by substituting one value at a time.'}
  };
  function announce(message) { feedback.textContent = message; }
  function scrollToPosition(top) {
    scrollTween?.kill();
    if (!window.gsap || motionPreference.matches) {
      window.scrollTo({top,behavior:'instant'});
      return;
    }
    const position = {y:window.scrollY};
    scrollTween = gsap.to(position,{y:top,duration:.85,ease:'power3.inOut',onUpdate:()=>window.scrollTo({top:position.y,behavior:'instant'})});
  }
  window.addEventListener('wheel',() => scrollTween?.kill(),{passive:true});
  window.addEventListener('touchstart',() => scrollTween?.kill(),{passive:true});
  function enterDashboard() {
    if (!story || motionPreference.matches) return;
    const trigger = story.scrollTrigger;
    const progress = trigger.progress;
    if (progress < .34 || progress > .73) {
      scrollToPosition(trigger.start+(trigger.end-trigger.start)*.48);
    }
  }
  function selectScreen(name, options = {}) {
    if (!screenNames[name]) return;
    transition?.kill();
    activeScreen = name;
    $$('.app-screen').forEach(screen => {
      const selected = screen.id === `app-${name}`;
      screen.hidden = !selected;
      screen.style.opacity = '';
      screen.style.transform = '';
    });
    $$('.app-nav [data-screen-link]').forEach(button => {
      if (button.dataset.screenLink === name) button.setAttribute('aria-current','page');
      else button.removeAttribute('aria-current');
    });
    $('#app-current-title').textContent = screenNames[name];
    $('.app-content').scrollTop = 0;
    closeProfile();
    if (window.gsap && !motionPreference.matches) {
      transition = gsap.fromTo($(`#app-${name}`),{opacity:.4,y:4},{opacity:1,y:0,duration:.2,ease:'power3.out',clearProps:'transform,opacity'});
    }
    if (options.expand !== false) enterDashboard();
    if (options.focus) $(`#app-${name} h2`).focus({preventScroll:true});
    announce(`${screenNames[name]} open. Explore this proposed MIMS experience.`);
  }
  $$('[data-screen-link]').forEach(button => button.addEventListener('click',event => {
    event.preventDefault();
    selectScreen(button.dataset.screenLink);
  }));
  $$('.app-screen h2').forEach(heading => heading.tabIndex = -1);
  const navButtons = $$('.app-nav button');
  navButtons.forEach((button,index) => button.addEventListener('keydown',event => {
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index+1)%navButtons.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index-1+navButtons.length)%navButtons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = navButtons.length-1;
    else return;
    event.preventDefault();
    selectScreen(navButtons[next].dataset.screenLink);
    navButtons[next].focus({preventScroll:true});
  }));

  const profileButton = $('#teacher-profile-toggle');
  const profile = $('#teacher-profile');
  function closeProfile() { profile.hidden = true; profileButton.setAttribute('aria-expanded','false'); }
  profileButton.addEventListener('click',() => {
    const open = profile.hidden;
    profile.hidden = !open;
    profileButton.setAttribute('aria-expanded',String(open));
    enterDashboard();
  });
  document.addEventListener('click',event => {
    if (!profile.hidden && !profile.contains(event.target) && !profileButton.contains(event.target)) closeProfile();
  });
  document.addEventListener('keydown',event => {
    if (event.key === 'Escape' && !profile.hidden) { closeProfile(); profileButton.focus({preventScroll:true}); }
  });

  function setEditorView(kind) {
    const chosen = (selectedTopic !== 'trigonometry' && kind !== 'slide') ? 'slide' : kind;
    $$('.editor-tabs [data-editor-view]').forEach(button => {
      const selected = button.dataset.editorView === chosen;
      button.setAttribute('aria-selected',String(selected));
      button.tabIndex = selected ? 0 : -1;
      document.getElementById(button.getAttribute('aria-controls')).hidden = !selected;
    });
    const pdf = $(`#editor-${chosen} [data-pdf-src]`);
    if (pdf && !pdf.getAttribute('src')) pdf.src = pdf.dataset.pdfSrc;
    $('.editor-footer>span:first-child').textContent = chosen === 'slide' ? (selectedTopic === 'trigonometry' ? 'Revised explanatory diagram' : 'Editable concept outline') : 'Complete historical prototype PDF · 4 pages';
  }
  const editorTabs = $$('.editor-tabs [data-editor-view]');
  editorTabs.forEach((button,index) => {
    button.addEventListener('click',() => setEditorView(button.dataset.editorView));
    button.addEventListener('keydown',event => {
      const enabled = editorTabs.filter(tab => !tab.disabled);
      const activeIndex = enabled.indexOf(button);
      let next;
      if (event.key === 'ArrowRight') next = (activeIndex+1)%enabled.length;
      else if (event.key === 'ArrowLeft') next = (activeIndex-1+enabled.length)%enabled.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = enabled.length-1;
      else return;
      event.preventDefault();
      enabled[next].click(); enabled[next].focus({preventScroll:true});
    });
  });
  function updateBuilderTopics(grade, key) {
    const select = $('#builder-topic');
    select.replaceChildren();
    Object.entries(topics).filter(([,topic]) => topic.grade === grade).forEach(([topicKey,topic]) => {
      const option = document.createElement('option');
      option.value = topicKey; option.textContent = topic.title;
      select.append(option);
    });
    select.value = key || Object.keys(topics).find(topicKey => topics[topicKey].grade === grade);
  }
  function prepareTopic(key, preserveRequest = false) {
    if (!topics[key]) return;
    notesByTopic.set(selectedTopic,$('#teacher-notes').value);
    selectedTopic = key;
    const topic = topics[key];
    $('#builder-class').value = topic.grade;
    updateBuilderTopics(topic.grade,key);
    $('#lesson-title-input').value = topic.title;
    if (!preserveRequest) $('#builder-request').value = topic.request;
    $('#teacher-notes').value = notesByTopic.get(key) || topic.notes;
    $('.editor-slide-frame').hidden = key !== 'trigonometry';
    $('#authored-lesson-preview').hidden = key === 'trigonometry';
    $('.slide-outline').hidden = key !== 'trigonometry';
    $('#outline-title').textContent = topic.title;
    $('#outline-description').textContent = topic.description;
    $('#outline-concepts').replaceChildren(...topic.concepts.map(text => {const li=document.createElement('li');li.textContent=text;return li;}));
    editorTabs.forEach(tab => {
      tab.disabled = key !== 'trigonometry' && tab.dataset.editorView !== 'slide';
      tab.title = tab.disabled ? 'The paired paper and key in this walkthrough are for trigonometry.' : '';
    });
    $('.editor-footer>span:first-child').textContent = key === 'trigonometry' ? 'Existing prototype output' : 'Editable concept outline';
    setEditorView('slide');
  }
  updateBuilderTopics('10','trigonometry');
  $('#builder-class').addEventListener('change',event => {
    const key = Object.keys(topics).find(topicKey => topics[topicKey].grade === event.target.value);
    prepareTopic(key);
  });
  $('#builder-topic').addEventListener('change',event => prepareTopic(event.target.value));
  $('#home-lesson-form').addEventListener('submit',event => {
    event.preventDefault();
    prepareTopic('trigonometry');
    $('#builder-request').value = $('#home-request').value;
    selectScreen('builder');
    announce('Your request is in the lesson builder. Review the sample and edit your teaching notes.');
  });
  $('#lesson-brief').addEventListener('submit',event => {
    event.preventDefault();
    prepareTopic($('#builder-topic').value,true);
    announce(selectedTopic === 'trigonometry' ? 'Existing trigonometry lesson opened. Teaching notes and lesson title are editable.' : 'Editable topic outline opened. This walkthrough does not call a live model.');
  });
  $('#save-teacher-notes').addEventListener('click',() => {
    notesByTopic.set(selectedTopic,$('#teacher-notes').value);
    announce('Teaching notes saved for this visit. They stay in this page until it is reloaded.');
  });
  $('#teacher-notes').addEventListener('input',() => notesByTopic.set(selectedTopic,$('#teacher-notes').value));
  $('#download-lesson-notes').addEventListener('click',() => {
    const title = $('#lesson-title-input').value.trim() || topics[selectedTopic].title;
    const content = `${title}\nMimansa Singh\nCBSE Class ${$('#builder-class').value} Mathematics\n\nLesson request\n${$('#builder-request').value}\n\nTeaching notes\n${$('#teacher-notes').value}\n`;
    const url = URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a');link.href=url;link.download='MIMS-lesson-notes.txt';link.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
    announce('Lesson notes downloaded as a text file.');
  });

  function openMaterial(kind) {
    prepareTopic('trigonometry');
    setEditorView(kind);
    selectScreen('builder');
    announce(`${materials[kind].title} opened in the lesson builder.`);
  }
  $$('[data-open-material]').forEach(button => button.addEventListener('click',() => openMaterial(button.dataset.openMaterial)));
  function previewLibraryMaterial(kind) {
    selectedMaterial = kind;
    const holder = $('#library-preview-image');
    const pdfHolder = $('#library-pdf');
    holder.hidden = kind !== 'slide';
    pdfHolder.hidden = kind === 'slide';
    if (kind === 'slide') {
      holder.className = 'library-preview-image app-slide-crop';
      $('img',holder).src = materials.slide.src;
      $('img',holder).alt = 'Revised eye-level trigonometry diagram';
      pdfHolder.replaceChildren();
    } else {
      const link = document.createElement('a');
      link.className = 'app-button';link.href = '/assets/mims/documents/reader.html?file='+materials[kind].pdf.split('/').pop();link.target='_blank';link.rel='noopener';link.textContent='Open all 4 pages ↗';
      const frame = document.createElement('iframe');frame.src='/assets/mims/documents/reader.html?file='+materials[kind].pdf.split('/').pop();frame.title='Complete '+materials[kind].type.toLowerCase()+' · 4 pages';
      pdfHolder.replaceChildren(link,frame);
    }
    $('#library-preview-title').textContent = materials[kind].title;
    $$('[data-library-item]').forEach(row => row.classList.toggle('selected',row.dataset.libraryItem === kind));
    announce(`${materials[kind].title} selected.`);
  }
  $$('[data-open-library]').forEach(button => button.addEventListener('click',() => previewLibraryMaterial(button.dataset.openLibrary)));
  $('#open-library-in-builder').addEventListener('click',() => openMaterial(selectedMaterial));
  function filterMaterials() {
    const query = $('#material-search').value.trim().toLowerCase();
    const type = $('#material-filter').value;
    let visible = 0;
    $$('[data-library-item]').forEach(row => {
      const kind = row.dataset.libraryItem;
      const match = (type === 'all' || type === kind) && `${materials[kind].title} ${materials[kind].type}`.toLowerCase().includes(query);
      row.hidden = !match;
      if (match) visible++;
    });
    $('#materials-empty').hidden = visible > 0;
    announce(visible ? 'Material list updated.' : 'No materials match the selected search and type.');
  }
  $('#material-search').addEventListener('input',filterMaterials);
  $('#material-filter').addEventListener('change',filterMaterials);
  $('#app-search-open').addEventListener('click',() => {selectScreen('materials');$('#material-search').focus({preventScroll:true});});

  let curriculumTopic = 'trigonometry';
  function showTopic(key) {
    const topic = topics[key]; curriculumTopic = key;
    $('#topic-breadcrumb').textContent = `Class ${topic.grade} / Mathematics`;
    $('#topic-title').textContent = topic.title;
    $('#topic-description').textContent = topic.description;
    $('#topic-prompt').textContent = `“${topic.request}”`;
    $('#topic-concepts').replaceChildren(...topic.concepts.map(text => {const li=document.createElement('li');li.textContent=text;return li;}));
    $$('[data-topic]').forEach(button => {
      const selected = button.dataset.topic === key;
      button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));
    });
  }
  function showCurriculumClass(grade) {
    $$('[data-curriculum-class]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.curriculumClass === grade)));
    const holder = $('#curriculum-topics');holder.replaceChildren();
    Object.entries(topics).filter(([,topic]) => topic.grade === grade).forEach(([key,topic]) => {
      const button=document.createElement('button');button.dataset.topic=key;button.textContent=topic.title;
      button.addEventListener('click',() => showTopic(key));holder.append(button);
    });
    showTopic(Object.keys(topics).find(key => topics[key].grade === grade));
  }
  $$('[data-curriculum-class]').forEach(button => button.addEventListener('click',() => showCurriculumClass(button.dataset.curriculumClass)));
  showCurriculumClass('10');
  $('#use-curriculum-topic').addEventListener('click',() => {prepareTopic(curriculumTopic);selectScreen('builder');announce(`${topics[curriculumTopic].title} added to your lesson brief.`);});

  // One brand-level scroll sequence around a stable, task-focused app.
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(min-width: 700px) and (min-height: 500px) and (prefers-reduced-motion: no-preference)',() => {
      const hero = $('#top');
      const motion = $('.dashboard-motion');
      const pageHeader = $('.site-header');
      const reveal = document.createElement('div');reveal.className='hero-reveal';reveal.setAttribute('aria-hidden','true');reveal.inert=true;
      const challengeClone = $('#challenge').cloneNode(true);
      challengeClone.removeAttribute('id');
      $$('[id]',challengeClone).forEach(element => element.removeAttribute('id'));
      reveal.append(challengeClone);hero.prepend(reveal);
      document.body.classList.add('scroll-tour-active');
      gsap.set(motion,{y:()=>innerHeight*.9,scale:.87,rotationX:9,rotationY:-6,rotation:-4,transformOrigin:'50% 0%',transformPerspective:1800,autoAlpha:1});
      gsap.set(reveal,{autoAlpha:0});
      const hold = {progress:0};
      story = gsap.timeline({
        defaults:{ease:'none'},
        scrollTrigger:{id:'mims-app-story',trigger:hero,start:'top top',end:()=>`+=${innerHeight*2.5}`,pin:true,pinSpacing:true,scrub:.45,anticipatePin:1,invalidateOnRefresh:true,
          onUpdate:trigger => {
            const phase = trigger.progress < .34 ? 'enter' : trigger.progress < .74 ? 'explore' : 'exit';
            hero.dataset.tourPhase=phase;
            hero.style.pointerEvents = trigger.progress > .985 ? 'none' : '';
            motion.inert = trigger.progress > .985;
            if (trigger.progress>.02) {$('#site-menu').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');}
          }
        }
      });
      story.to(motion,{y:0,scale:1,rotationX:0,rotationY:0,rotation:0,duration:.85,ease:'power3.out'},0)
        .to($('.hero-intro'),{y:-140,autoAlpha:0,duration:.5,ease:'power2.out'},0)
        .to(pageHeader,{autoAlpha:0,duration:.18},.02)
        .to($('.dashboard-frame'),{borderRadius:0,duration:.3},.5)
        .to(hold,{progress:1,duration:1},.85)
        .to(reveal,{autoAlpha:1,duration:.12},1.85)
        .to(motion,{rotationX:75,yPercent:-85,y:-100,scale:.86,duration:.65,ease:'power2.out'},1.85)
        .to(motion,{autoAlpha:0,duration:.12},2.38)
        .to(pageHeader,{autoAlpha:1,duration:.22},2.12);
      document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => {
        story=null;reveal.remove();document.body.classList.remove('scroll-tour-active');
        hero.style.pointerEvents='';delete hero.dataset.tourPhase;motion.inert=false;
      };
    });
    window.addEventListener('load',() => ScrollTrigger.refresh(),{once:true});
  }
  $$('.explore-link, #site-menu a[href="#dashboard-tour"]').forEach(link => link.addEventListener('click',event => {
    if (story) {event.preventDefault();enterDashboard();}
  }));
  $$('a[href="#top"]').forEach(link => link.addEventListener('click',event => {
    if (story) {event.preventDefault();scrollToPosition(0);}
  }));
  $('#continue-page').addEventListener('click',() => {
    if (story) scrollToPosition(story.scrollTrigger.end+2);
    else $('#challenge').scrollIntoView({behavior:motionPreference.matches?'instant':'smooth',block:'start'});
  });
  app.addEventListener('keydown',event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase()==='k') {
      event.preventDefault();selectScreen('materials');$('#material-search').focus({preventScroll:true});
    }
  });
})();
