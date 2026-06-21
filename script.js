(function () {
  'use strict';

  function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.scrollIntoView({ behavior: 'smooth' });
  }

  function switchTab(sectionId) {
    const sections = document.querySelectorAll('main > section');
    sections.forEach((sec) => {
      if (sec.id === sectionId) {
        sec.classList.remove('hidden');
      } else {
        sec.classList.add('hidden');
      }
    });

    document.querySelectorAll('.nav-links a').forEach((a) => {
      const target = a.dataset.target || a.getAttribute('href').slice(1);
      if (target === sectionId) a.classList.add('active');
      else a.classList.remove('active');
    });
  }

  function setupNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.dataset.target || link.getAttribute('href').slice(1);
        switchTab(targetId);
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  function setupReveal() {
    const elements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
  }

  function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          const duration = 1200;
          const start = performance.now();

          function update(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(update);
          }

          requestAnimationFrame(update);
          observer.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }

  function setupContact() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fields = form.querySelectorAll('input, textarea');
      let valid = true;

      fields.forEach((field) => {
        field.classList.remove('error');
        if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        }
      });

      const emailField = form.querySelector('#email');
      if (emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.classList.add('error');
        valid = false;
      }

      if (!valid) {
        showToast('Please fill in all fields correctly.');
        return;
      }

      const submitBtn = document.getElementById('submitBtn');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          showToast('Message sent! Thanks for reaching out — I will get back to you soon.');
          form.reset();
        } else {
          const data = await response.json().catch(() => ({}));
          const errorMsg = data.error || 'Something went wrong. Please try again later.';
          showToast(errorMsg);
        }
      } catch {
        showToast('Network error. Please check your connection and try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  function setupProjectLinks() {
    document.querySelectorAll('.project-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        if (link.getAttribute('href') === '#') {
          e.preventDefault();
          const type = link.dataset.type === 'demo' ? 'Live demo' : 'Source code';
          showToast(`${type} link coming soon!`);
        }
      });
    });
  }

  function setupFooter() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function init() {
    setupNavbar();
    // initialize active tab from URL hash or default to 'about'
    const initial = (location.hash && location.hash.slice(1)) || 'about';
    // hide all sections first, then show the initial
    document.querySelectorAll('main > section').forEach((sec) => sec.classList.add('hidden'));
    switchTab(initial);
    setupReveal();
    animateCounters();
    setupContact();
    setupProjectLinks();
    setupFooter();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
