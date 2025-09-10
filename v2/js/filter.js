(() => {
  const grid = document.getElementById('productGrid');
  const items = Array.from(grid.querySelectorAll('.card'));
  const nav = document.querySelector('.filter-nav');
  const links = Array.from(nav.querySelectorAll('a[data-cat]'));
  const live = document.getElementById('live');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const css = getComputedStyle(document.documentElement);
  const ease = css.getPropertyValue('--ease').trim() || 'cubic-bezier(.2,.7,.2,1)';
  const dur = parseInt((css.getPropertyValue('--dur') || '230ms').trim()) || 230;

  const getCats = el => (el.getAttribute('data-categories') || '')
    .split(/[, ]+/).map(s=>s.trim()).filter(Boolean);

  const hideItem = async (el, i) => {
    if (el.hidden) return;
    if (prefersReduced) { el.hidden = true; return; }
    const anim = el.animate(
      [
        { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
        { opacity: 0, transform: 'scale(0.96)', filter: 'blur(2px)' }
      ],
      { duration: dur - 30, easing: ease, delay: i * 18 }
    );
    try { await anim.finished; } catch {}
    el.hidden = true;
  };

  const showItem = (el, i) => {
    if (!el.hidden) return;
    el.hidden = false;
    if (prefersReduced) return;
    el.animate(
      [
        { opacity: 0, transform: 'scale(0.96)', filter: 'blur(2px)' },
        { opacity: 1, transform: 'scale(1)',   filter: 'blur(0px)' }
      ],
      { duration: dur, easing: ease, delay: i * 18 }
    );
  };

  function setActiveLink(cat){
    links.forEach(a => a.removeAttribute('aria-current'));
    const active = links.find(a => a.dataset.cat === cat) || links[0];
    active.setAttribute('aria-current', 'page');
  }

  async function applyFilter(cat, {updateUrl=true} = {}){
    // Update URL (progressive enhancement + shareable state)
    if (updateUrl) {
      const url = new URL(window.location);
      url.searchParams.set('cat', cat);
      history.pushState({cat}, '', url);
    }

    // Split items
    const toShow = [];
    const toHide = [];
    if (cat === 'all') {
      items.forEach(el => toShow.push(el));
    } else {
      items.forEach(el => (getCats(el).includes(cat) ? toShow : toHide).push(el));
    }

    // Animate hides first, then show
    await Promise.all(toHide.map((el,i) => hideItem(el, i)));
    toShow.forEach((el,i) => showItem(el, i));

    // Update nav state + live announcement
    setActiveLink(cat);
    live.textContent = `${toShow.length} item${toShow.length===1?'':'s'} shown for "${cat}".`;
  }

  // Intercept clicks for client-side filter, keep link semantics
  links.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      applyFilter(a.dataset.cat);
    });
  });

  // Back/forward support
  window.addEventListener('popstate', (e) => {
    const cat = (e.state && e.state.cat) || new URL(location).searchParams.get('cat') || 'all';
    applyFilter(cat, {updateUrl:false});
  });

  // Initial state from URL (or default)
  const initialCat = new URL(location).searchParams.get('cat') || 'all';
  setActiveLink(initialCat);
  applyFilter(initialCat, {updateUrl:false});
})();