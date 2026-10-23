(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const faqItems = [...document.querySelectorAll(".faq details")];
  const faqState = new WeakMap();
  const faqTiming = { duration: 300, easing: "cubic-bezier(.25,1,.5,1)" };

  const finishFaqAnimation = (item, open) => {
    item.style.height = "";
    item.style.overflow = "";
    item.classList.remove("is-animating");
    if (!open) item.open = false;
  };

  const setFaqOpen = (item, open) => {
    const state = faqState.get(item) || { animation: null, intendedOpen: item.open };
    const startHeight = item.getBoundingClientRect().height;
    state.animation?.cancel();
    state.intendedOpen = open;
    faqState.set(item, state);

    if (reducedMotion || !item.animate) {
      item.open = open;
      item.style.height = "";
      item.style.overflow = "";
      item.classList.remove("is-animating");
      return;
    }

    const summary = item.querySelector("summary");
    if (!summary) return;
    if (open) item.open = true;
    const endHeight = open ? item.scrollHeight : summary.getBoundingClientRect().height;

    item.classList.add("is-animating");
    item.style.overflow = "hidden";
    item.style.height = `${startHeight}px`;
    const animation = item.animate(
      { height: [`${startHeight}px`, `${endHeight}px`] },
      faqTiming
    );
    state.animation = animation;
    animation.onfinish = () => {
      if (faqState.get(item)?.animation !== animation) return;
      finishFaqAnimation(item, open);
      state.animation = null;
    };
    animation.oncancel = () => {
      if (faqState.get(item)?.animation === animation) state.animation = null;
    };
  };

  faqItems.forEach(item => {
    const answer = item.querySelector("p");
    if (answer && !answer.parentElement.classList.contains("campus-faq-answer")) {
      const wrapper = document.createElement("div");
      wrapper.className = "campus-faq-answer";
      answer.before(wrapper);
      wrapper.append(answer);
    }
    faqState.set(item, { animation: null, intendedOpen: item.open });
    item.querySelector("summary")?.addEventListener("click", event => {
      if (reducedMotion) return;
      event.preventDefault();
      const shouldOpen = !(faqState.get(item)?.intendedOpen ?? item.open);
      if (shouldOpen) {
        faqItems.forEach(other => {
          if (other !== item && (faqState.get(other)?.intendedOpen ?? other.open)) setFaqOpen(other, false);
        });
      }
      setFaqOpen(item, shouldOpen);
    });
    item.addEventListener("toggle", () => {
      if (!reducedMotion || !item.open) return;
      faqItems.forEach(other => { if (other !== item && other.open) other.open = false; });
    });
  });

  for (const link of document.querySelectorAll("[data-format]")) {
    link.addEventListener("click", () => {
      const field = document.querySelector("#format");
      if (field) field.value = link.dataset.format;
    });
  }

  const enquiry = document.querySelector("#enquiry");
  const status = document.querySelector("#form-status");
  enquiry?.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = `Campus AI session enquiry — ${data.get("institution")}`;
    const body = `Hello MASS team,\n\nWe would like to discuss an AI session for our institution.\n\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nInstitution: ${data.get("institution")}\nCity: ${data.get("city")}\nSession of interest: ${data.get("format")}\n\nOur plans:\n${data.get("plans")}\n\nPlease share the next steps and available options.\n\nRegards,\n${data.get("name")}`;
    const prepared = document.querySelector("#prepared-enquiry");
    if (prepared) prepared.value = `To: info@mass.llc\nSubject: ${subject}\n\n${body}`;
    const fallback = document.querySelector("#email-fallback");
    if (fallback) fallback.hidden = false;
    if (status) status.textContent = "Review and send your enquiry in your email app. Your enquiry has not been sent yet.";
    window.location.href = `mailto:info@mass.llc?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  document.querySelector("#copy-enquiry")?.addEventListener("click", async () => {
    const field = document.querySelector("#prepared-enquiry");
    if (!field) return;
    try {
      await navigator.clipboard.writeText(field.value);
      if (status) status.textContent = "Enquiry copied. Paste it into an email to info@mass.llc.";
    } catch {
      field.focus();
      field.select();
      if (status) status.textContent = "Select and copy the enquiry below, then send it to info@mass.llc.";
    }
  });

  if (!reducedMotion && window.gsap) {
    const revealTargets = [...document.querySelectorAll(".opening > *, .section-head, .learning-grid, .session-plan-intro, .agenda, .formats, .about-grid, .hosting-grid, .faq > *, .contact > *")];
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.batch(revealTargets, {
        start: "top 86%",
        once: true,
        onEnter: batch => gsap.from(batch, { autoAlpha: 0, y: 28, duration: 0.66, ease: "power3.out", stagger: 0.08, overwrite: "auto" })
      });
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    }
    const hero = document.querySelector(".hero");
    const art = hero?.querySelector(".art");
    const heroTargets = hero ? [hero.querySelector(".hero-top"), hero.querySelector("h1"), hero.querySelector(".intro"), hero.querySelector(".subintro"), hero.querySelector(".button"), hero.querySelector(".hero-secondary"), hero.querySelector(".institution-line"), hero.querySelector(".hero-foot")].filter(Boolean) : [];
    gsap.from(heroTargets, { autoAlpha: 0, y: 22, duration: 0.72, ease: "power3.out", stagger: 0.07, clearProps: "transform,visibility" });
    const journeySteps = [...(art?.querySelectorAll(".journey .step") || [])];
    gsap.from(journeySteps, { autoAlpha: 0, y: 18, duration: 0.56, ease: "power3.out", stagger: 0.14, delay: 0.24, clearProps: "transform,visibility" });
  }
})();
