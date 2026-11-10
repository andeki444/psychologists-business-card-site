/**
 * ПОЛИНА КИСЕЛЁВА — САЙТ-ВИЗИТКА ПСИХОЛОГА-КОНСУЛЬТАНТА
 * Нативный модульный скрипт без внешних зависимостей (60 FPS, < 0.8s FCP)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initRevealObserver();
  initScrollThreadAnimation();
  initPainChecklistMetaphor();
  initFormatSwitcher();
  initFaqAccordion();
  initReviewsCarousel();
  initClipboardCopy();
});

/**
 * 1. Мобильное меню с доступностью (aria-expanded) и закрытием по клику на якорь
 */
function initMobileNav() {
  const burgerBtn = document.getElementById('burgerBtn');
  const siteNav = document.getElementById('siteNav');
  if (!burgerBtn || !siteNav) return;

  const toggleMenu = (forceState) => {
    const isOpen = typeof forceState === 'boolean' ? forceState : !siteNav.classList.contains('is-open');
    siteNav.classList.toggle('is-open', isOpen);
    burgerBtn.classList.toggle('is-active', isOpen);
    burgerBtn.setAttribute('aria-expanded', String(isOpen));
  };

  burgerBtn.addEventListener('click', () => toggleMenu());

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
      toggleMenu(false);
    }
  });
}

/**
 * 2. Плавное проявление элементов при скролле через нативный IntersectionObserver
 */
function initRevealObserver() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || revealElements.length === 0) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-delay');
          if (delay) {
            entry.target.style.transitionDelay = `${delay}ms`;
          }
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/**
 * 3. Анимация «распутывающейся нити» по мере прокрутки страницы (stroke-dashoffset)
 */
function initScrollThreadAnimation() {
  const threadPath = document.getElementById('scrollThreadPath');
  if (!threadPath) return;

  const pathLength = threadPath.getTotalLength();
  threadPath.style.strokeDasharray = `${pathLength}`;
  threadPath.style.strokeDashoffset = `${pathLength * 0.88}`;

  let ticking = false;

  const updateThread = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = Math.max(
      document.body.scrollHeight - window.innerHeight,
      1
    );
    const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
    const drawOffset = pathLength * (1 - (0.12 + progress * 0.88));
    threadPath.style.strokeDashoffset = `${drawOffset}`;
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateThread);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateThread();
}

/**
 * 4. Интерактивный чек-лист в блоке «КАК ТЫ СЕЙЧАС?» с визуальным откликом клубка мыслей
 */
function initPainChecklistMetaphor() {
  const painCards = document.querySelectorAll('.pain-card');
  const tangleSvg = document.getElementById('tangleSvg');
  const tangleStatus = document.getElementById('tangleStatus');
  if (painCards.length === 0) return;

  const updateMetaphorState = () => {
    const selectedCount = document.querySelectorAll('.pain-card.is-selected').length;
    if (!tangleSvg || !tangleStatus) return;

    const statusText = tangleStatus.querySelector('.tangle-card__status-text');
    if (selectedCount > 0) {
      tangleSvg.classList.add('is-calming');
      if (statusText) {
        statusText.textContent = `Отмечено тем: ${selectedCount}. Признать то, что тревожит — уже первый шаг к распутыванию клубка и внутренней опоре.`;
      }
    } else {
      tangleSvg.classList.remove('is-calming');
      if (statusText) {
        statusText.textContent = 'Любой запутанный клубок мыслей можно бережно распутать нить за нитью.';
      }
    }
  };

  painCards.forEach((card) => {
    card.addEventListener('click', () => {
      const isSelected = card.classList.toggle('is-selected');
      card.setAttribute('aria-pressed', String(isSelected));
      updateMetaphorState();
    });
  });
}

/**
 * 5. Переключатель акцента формата встреч (Онлайн / В кабинете) в блоке стоимости
 */
function initFormatSwitcher() {
  const buttons = document.querySelectorAll('.format-switcher__btn');
  const rateRows = document.querySelectorAll('.price-card__rate-row');
  if (buttons.length === 0) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const format = btn.getAttribute('data-format');
      buttons.forEach((b) => b.classList.toggle('is-active', b === btn));

      rateRows.forEach((row) => {
        const rowFormat = row.getAttribute('data-rate');
        if (format === 'all' || rowFormat === format) {
          row.classList.remove('is-dimmed');
        } else {
          row.classList.add('is-dimmed');
        }
      });
    });
  });
}

/**
 * 6. Плавный аккордеон FAQ без рывков контента
 */
function initFaqAccordion() {
  const accordion = document.getElementById('faqAccordion');
  if (!accordion) return;

  const items = accordion.querySelectorAll('.faq-item');

  // Инициализация открытых по умолчанию панелей
  items.forEach((item) => {
    const trigger = item.querySelector('.faq-item__trigger');
    const panel = item.querySelector('.faq-item__panel');
    if (trigger && panel && trigger.getAttribute('aria-expanded') === 'true') {
      panel.hidden = false;
      panel.classList.add('is-open');
    }
  });

  items.forEach((item) => {
    const trigger = item.querySelector('.faq-item__trigger');
    const panel = item.querySelector('.faq-item__panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.classList.remove('is-open');
        setTimeout(() => {
          if (trigger.getAttribute('aria-expanded') === 'false') {
            panel.hidden = true;
          }
        }, 340);
      } else {
        panel.hidden = false;
        // Форсируем reflow перед запуском CSS Grid-анимации
        void panel.offsetHeight;
        trigger.setAttribute('aria-expanded', 'true');
        panel.classList.add('is-open');
      }
    });
  });
}

/**
 * 7. Навигация карусели отзывов
 */
function initReviewsCarousel() {
  const track = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('prevReviewBtn');
  const nextBtn = document.getElementById('nextReviewBtn');
  if (!track || !prevBtn || !nextBtn) return;

  const getScrollAmount = () => {
    const card = track.querySelector('.review-card');
    return card ? card.offsetWidth + 20 : 300;
  };

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
  });
}

/**
 * 8. Копирование телефона и почты в 1 клик с всплывающим уведомлением
 */
function initClipboardCopy() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  const toast = document.getElementById('copyToast');
  if (copyButtons.length === 0) return;

  let toastTimeout;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    void toast.offsetHeight;
    toast.classList.add('is-visible');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => {
        toast.hidden = true;
      }, 280);
    }, 2400);
  };

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.getAttribute('data-copy');
      if (!value) return;

      try {
        await navigator.clipboard.writeText(value);
        showToast(`Скопировано: ${value}`);
      } catch {
        showToast(`Контакт: ${value}`);
      }
    });
  });
}
