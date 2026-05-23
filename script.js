const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

navToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -80px 0px" }
);

document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach((el) => {
  revealObserver.observe(el);
});

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const slides = [...carousel.querySelectorAll(".carousel-slide")];
  const dotsWrap = carousel.querySelector("[data-dots]");
  const prev = carousel.querySelector("[data-prev]");
  const next = carousel.querySelector("[data-next]");
  const interval = Number(carousel.dataset.interval || 2600);
  let index = 0;
  let timer;

  const dots = slides.map((_, dotIndex) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Mostrar imagem ${dotIndex + 1}`);
    dot.addEventListener("click", () => show(dotIndex, true));
    dotsWrap?.appendChild(dot);
    return dot;
  });

  const show = (nextIndex, shouldReset = false) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === index));
    dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
    if (shouldReset) restart();
  };

  const restart = () => {
    window.clearInterval(timer);
    if (!prefersReducedMotion) {
      timer = window.setInterval(() => show(index + 1), interval);
    }
  };

  prev?.addEventListener("click", () => show(index - 1, true));
  next?.addEventListener("click", () => show(index + 1, true));
  carousel.addEventListener("mouseenter", () => window.clearInterval(timer));
  carousel.addEventListener("mouseleave", restart);

  show(0);
  restart();
});

document.querySelectorAll("[data-premium-carousel]").forEach((carousel) => {
  const cards = [...carousel.querySelectorAll(".benefit-card")];
  const prev = carousel.querySelector("[data-premium-prev]");
  const next = carousel.querySelector("[data-premium-next]");
  let active = 0;
  let timer;
  let touchStartX = 0;

  const setCardClasses = () => {
    cards.forEach((card, index) => {
      const diff = (index - active + cards.length) % cards.length;
      card.classList.remove("is-active", "is-prev", "is-next", "is-far-prev", "is-far-next", "is-hidden");
      if (diff === 0) card.classList.add("is-active");
      else if (diff === 1) card.classList.add("is-next");
      else if (diff === 2) card.classList.add("is-far-next");
      else if (diff === cards.length - 2) card.classList.add("is-far-prev");
      else if (diff === cards.length - 1) card.classList.add("is-prev");
      else card.classList.add("is-hidden");
    });
  };

  const goTo = (index, shouldReset = false) => {
    active = (index + cards.length) % cards.length;
    setCardClasses();
    if (shouldReset) restart();
  };

  const restart = () => {
    window.clearInterval(timer);
    if (!prefersReducedMotion) {
      timer = window.setInterval(() => goTo(active + 1), 3200);
    }
  };

  cards.forEach((card, index) => {
    card.addEventListener("click", () => goTo(index, true));
  });

  prev?.addEventListener("click", () => goTo(active - 1, true));
  next?.addEventListener("click", () => goTo(active + 1, true));
  carousel.addEventListener("mouseenter", () => window.clearInterval(timer));
  carousel.addEventListener("mouseleave", restart);
  carousel.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  carousel.addEventListener("touchend", (event) => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 42) {
      goTo(active + (delta < 0 ? 1 : -1), true);
    }
  }, { passive: true });

  setCardClasses();
  restart();
});

const procedureBlocks = [...document.querySelectorAll(".procedure-block")];
const updateProcedureState = () => {
  if (!procedureBlocks.length || window.innerWidth <= 760) return;
  const viewportMiddle = window.innerHeight * 0.52;
  let closest = 0;
  let closestDistance = Infinity;

  procedureBlocks.forEach((block, index) => {
    const rect = block.getBoundingClientRect();
    const blockMiddle = rect.top + rect.height * 0.38;
    const distance = Math.abs(blockMiddle - viewportMiddle);
    if (distance < closestDistance) {
      closest = index;
      closestDistance = distance;
    }
  });

  procedureBlocks.forEach((block, index) => {
    block.classList.toggle("is-active", index === closest);
  });
};

updateProcedureState();
window.addEventListener("scroll", updateProcedureState, { passive: true });
window.addEventListener("resize", updateProcedureState);

const whySection = document.querySelector(".why");
const whyImage = document.querySelector(".why-bg");
const updateWhyParallax = () => {
  if (!whySection || !whyImage || window.innerWidth <= 760 || prefersReducedMotion) return;
  const rect = whySection.getBoundingClientRect();
  const progress = Math.max(-1, Math.min(1, rect.top / window.innerHeight));
  whyImage.style.setProperty("--why-shift", `${progress * -28}px`);
};

updateWhyParallax();
window.addEventListener("scroll", updateWhyParallax, { passive: true });

document.querySelectorAll("[data-accordion]").forEach((accordion) => {
  const items = [...accordion.querySelectorAll(".accordion-item")];

  const openItem = (itemToOpen) => {
    items.forEach((item) => {
      const panel = item.querySelector(".accordion-panel");
      const button = item.querySelector("button");
      const isOpen = item === itemToOpen;
      item.classList.toggle("is-open", isOpen);
      button?.setAttribute("aria-expanded", String(isOpen));
      if (panel) {
        panel.style.maxHeight = isOpen ? `${panel.scrollHeight}px` : "0px";
      }
    });
  };

  items.forEach((item) => {
    item.querySelector("button")?.addEventListener("click", () => {
      if (item.classList.contains("is-open")) {
        const panel = item.querySelector(".accordion-panel");
        item.classList.remove("is-open");
        item.querySelector("button")?.setAttribute("aria-expanded", "false");
        if (panel) panel.style.maxHeight = "0px";
        return;
      }
      openItem(item);
    });
  });

  const initial = items.find((item) => item.classList.contains("is-open")) || items[0];
  if (initial) openItem(initial);
});
