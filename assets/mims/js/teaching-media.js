/* Playback shell for rendered HyperFrames lessons. No autoplay or model call. */
(() => {
  'use strict';
  const players = [...document.querySelectorAll('[data-motion]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function play(subject) {
    const player = players.find(item => item.dataset.motion === subject);
    if (!player) return;
    const video = player.querySelector('video');
    const bounds = video.getBoundingClientRect();
    if (bounds.top < 75 || bounds.bottom > innerHeight) {
      video.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});
    }
    players.forEach(other => {if (other !== player) other.querySelector('video').pause();});
    if (!video.getAttribute('src')) video.src = video.dataset.videoSrc;
    if (video.ended) video.currentTime = 0;
    if (!video.paused) {video.pause();return;}
    video.play().catch(() => {
      player.querySelector('[data-play-motion]').firstChild.textContent = 'Use the video play control ';
    });
  }
  players.forEach(player => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-motion]');
    const update = () => {
      const action = video.ended ? 'Replay' : video.paused ? 'Play' : 'Pause';
      button.firstChild.textContent = action+' explanation ';
      button.setAttribute('aria-pressed',String(!video.paused));
      if (!player.closest('[role="tabpanel"]').hidden) {
        const names={science:'prism',english:'story',social:'voting'};
        document.querySelector('#play-example').firstChild.textContent=action+' '+names[player.dataset.motion]+' explanation ';
      }
    };
    button.addEventListener('click',() => play(player.dataset.motion));
    video.addEventListener('play',update);video.addEventListener('pause',update);video.addEventListener('ended',update);
    // Set the source when the subject is selected so native controls also work.
    const panel = player.closest('[role="tabpanel"]');
    const observer = new MutationObserver(() => {
      if (!panel.hidden && !video.getAttribute('src')) video.src = video.dataset.videoSrc;
      if (panel.hidden) video.pause();
      update();
    });
    observer.observe(panel,{attributes:true,attributeFilter:['hidden']});
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      entries.forEach(entry => {if (!entry.isIntersecting) video.pause();});
    },{threshold:.08}).observe(player);
    update();
  });
  reduced.addEventListener('change',() => players.forEach(player => player.querySelector('video').pause()));
  document.addEventListener('visibilitychange',() => {if (document.hidden) players.forEach(player => player.querySelector('video').pause());});
  window.MIMSTeachingMedia = {play};
})();
