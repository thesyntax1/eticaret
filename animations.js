// animations.js — Ultra‑max animations: GSAP timelines, Lottie hero, debounced search, wrappers
(function(){
  // Config
  const LOTTIE_URL = 'https://assets10.lottiefiles.com/packages/lf20_jtbfg2nb.json'; // fallback public animation
  const STAGGER_DELAY = 0.06;
  const DEBOUNCE_MS = 300;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animationsDisabled = localStorage.getItem('animationsDisabled') === 'true' || prefersReduced;

  function setAnimationsDisabled(disabled){
    if(disabled){
      document.documentElement.classList.add('no-animations');
      localStorage.setItem('animationsDisabled','true');
    } else {
      document.documentElement.classList.remove('no-animations');
      localStorage.removeItem('animationsDisabled');
    }
  }

  // Floating toggle control
  function createAnimationsToggle(){
    const btn = document.createElement('button');
    btn.className = 'btn-secondary animations-toggle';
    btn.textContent = animationsDisabled ? 'Animasyonlar: Kapalı' : 'Animasyonlar: Açık';
    btn.setAttribute('aria-pressed', String(animationsDisabled));
    Object.assign(btn.style, {
      position: 'fixed',
      right: '12px',
      bottom: '12px',
      zIndex: 9999,
      padding: '8px 10px',
      borderRadius: '10px',
      opacity: 0.92
    });
    btn.addEventListener('click', ()=>{
      const next = !(localStorage.getItem('animationsDisabled') === 'true');
      setAnimationsDisabled(next);
      btn.textContent = next ? 'Animasyonlar: Kapalı' : 'Animasyonlar: Açık';
      btn.setAttribute('aria-pressed', String(next));
    });
    document.body.appendChild(btn);
  }

  // Lottie hero
  async function initHeroLottie(){
    const container = document.getElementById('heroLottie');
    if(!container) return;
    if(animationsDisabled) return;
    if(typeof lottie !== 'undefined'){
      try{
        const anim = lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: LOTTIE_URL
        });
        // nice subtle scale with GSAP if available
        anim.addEventListener('DOMLoaded', ()=>{
          if(window.gsap && !animationsDisabled){
            gsap.to(container, {scale:1.02, duration:6, yoyo:true, repeat:-1, ease:'sine.inOut'});
          }
        });
      }catch(err){
        // fallback simple GSAP animation
        if(window.gsap && !animationsDisabled){
          gsap.to(container, {rotation:10, duration:4, yoyo:true, repeat:-1, ease:'sine.inOut'});
        }
      }
    } else if(window.gsap && !animationsDisabled){
      gsap.to(container, {rotation:10, duration:4, yoyo:true, repeat:-1, ease:'sine.inOut'});
    }
  }

  // Animate product cards on change / scroll
  function animateVisibleCards(){
    if(animationsDisabled) return;
    const grid = document.getElementById('productsGrid');
    if(!grid) return;

    const cards = Array.from(grid.querySelectorAll('.product-card'))
      .filter(c => !c.classList.contains('animated'));
    if(cards.length === 0) return;

    // If GSAP available, stagger a fade/translate
    if(window.gsap){
      gsap.fromTo(cards, {y:24, opacity:0, scale:0.98}, {
        y:0, opacity:1, scale:1, stagger: STAGGER_DELAY, duration: 0.6, ease: 'power3.out', onComplete(){
          cards.forEach(c=> c.classList.add('animated'));
        }
      });
    } else {
      // fallback: add CSS class with small timeout stagger
      cards.forEach((c,i)=> setTimeout(()=> c.classList.add('animate','animated'), i*80));
    }
  }

  // Observe changes to products grid
  function observeProductsGrid(){
    const grid = document.getElementById('productsGrid');
    if(!grid) return;
    const mo = new MutationObserver((mutList)=>{
      // give time for DOM nodes to be attached
      setTimeout(()=> animateVisibleCards(), 50);
    });
    mo.observe(grid, {childList:true, subtree:false});

    // Also animate on first load
    setTimeout(()=> animateVisibleCards(), 120);
  }

  // Wrap addToCart to trigger cart bump and notification timing
  function wrapAddToCart(){
    if(typeof window.addToCart !== 'function') return;
    const original = window.addToCart;
    window.addToCart = function(productId){
      original(productId);
      // cart bump
      const el = document.querySelector('.cart-count');
      if(el){
        el.classList.remove('bump');
        // force reflow
        void el.offsetWidth;
        el.classList.add('bump');
        setTimeout(()=> el.classList.remove('bump'), 800);
      }
    };
  }

  // Wrap showNotification to animate last notification
  function wrapShowNotification(){
    if(typeof window.showNotification !== 'function') return;
    const original = window.showNotification;
    window.showNotification = function(message){
      original(message);
      // animate last notification
      setTimeout(()=>{
        const notifs = document.querySelectorAll('.notification');
        const last = notifs[notifs.length-1];
        if(last){
          last.classList.add('notif-animated');
          if(window.gsap && !animationsDisabled){
            gsap.fromTo(last, {y:10, opacity:0, scale:0.96}, {y:0, opacity:1, scale:1, duration:0.42, ease:'back.out(1.2)'});
          }
        }
      }, 20);
    };
  }

  // Facets panel toggle (mobile) + clear filters
  function initFacetsControls(){
    const toggle = document.getElementById('facetsToggle');
    const panel = document.getElementById('facetsPanel');
    const clearBtn = document.getElementById('clearFilters');

    if(toggle && panel){
      // show toggle on small screens
      const mq = window.matchMedia('(max-width: 880px)');
      function updateToggleVisibility(){
        if(mq.matches){
          toggle.style.display = '';
        } else {
          toggle.style.display = 'none';
          panel.classList.remove('visible');
          toggle.setAttribute('aria-expanded','false');
        }
      }
      mq.addListener(updateToggleVisibility);
      updateToggleVisibility();

      toggle.addEventListener('click', ()=>{
        const isOpen = panel.classList.toggle('visible');
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.classList.add('animate');
        setTimeout(()=> toggle.classList.remove('animate'), 420);
        // stagger inner children
        const children = panel.querySelectorAll('.facets-section');
        if(window.gsap && !animationsDisabled){
          gsap.fromTo(children, {y:10, opacity:0}, {y:0, opacity:1, stagger:0.06, duration:0.36});
        }
      });
    }

    if(clearBtn){
      clearBtn.addEventListener('click', ()=>{
        const panelRoot = document.getElementById('facetsPanel');
        if(!panelRoot) return;
        // clear checkboxes
        panelRoot.querySelectorAll('input[type="checkbox"]').forEach(cb=> cb.checked = false);
        // clear number inputs
        panelRoot.querySelectorAll('input[type="number"]').forEach(n=> n.value = '');
        // clear search
        const s = document.getElementById('searchInput');
        if(s) s.value = '';
        // trigger display
        if(typeof window.displayProducts === 'function') window.displayProducts();
        // animate clear
        if(window.gsap && !animationsDisabled){
          const panelEl = document.getElementById('facetsPanel');
          gsap.fromTo(panelEl, {x:-6, opacity:0.94}, {x:0, opacity:1, duration:0.28, ease:'power1.out'});
        }
        if(typeof window.showNotification === 'function') window.showNotification('✅ Filtreler temizlendi');
      });
    }
  }

  // Debounced search exposed globally
  let searchTimer = null;
  function debouncedSearch(evt){
    const val = evt && (evt.target ? evt.target.value : evt);
    if(searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(()=>{
      if(typeof window.displayProducts === 'function') window.displayProducts();
      // animate new items
      animateVisibleCards();
    }, DEBOUNCE_MS);
  }

  // Hook up to existing hooks and init
  function init(){
    // set initial animations disabled state
    setAnimationsDisabled(animationsDisabled);
    createAnimationsToggle();

    initHeroLottie();
    observeProductsGrid();
    wrapAddToCart();
    wrapShowNotification();
    initFacetsControls();

    // Expose debouncedSearch for index.html onkeyup handler
    window.debouncedSearch = debouncedSearch;

    // Attach notification animation class cleanup via delegated listener
    document.addEventListener('animationend', (e)=>{
      if(e.target.classList && e.target.classList.contains('notification')){
        // cleanup classes if any
        e.target.classList.remove('notif-animated');
      }
    });

    // Also trigger an initial animation pass after first paint
    requestAnimationFrame(()=> setTimeout(()=> animateVisibleCards(), 120));
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else init();

})();
