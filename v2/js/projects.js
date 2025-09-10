// js/render-projects.js
(() => {
  // normalize labels like "UI/UX" -> "uiux" for class/attr hooks
  const toToken = s => String(s)
    .trim()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  const typeToClass = t => 'product-' + toToken(t);

  async function render() {
    const container = document.getElementById('productGrid');
    if (!container) return;

    const res = await fetch('projects.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for projects.json`);
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.projects || []);

    const frag = document.createDocumentFragment();

    items.forEach(p => {
      const size = String(p.size || '100');
      const cats = Array.isArray(p.categories) ? p.categories : [];
      const types = Array.isArray(p.types) ? p.types : [];

      const article = document.createElement('article');
      article.classList.add('card', `cell--${size}`);
      if (p.hero) article.classList.add('hero');
      if (p.productClass) article.classList.add(p.productClass);

      // IMPORTANT: your filter reads this attribute
      article.setAttribute('data-categories', cats.join(', '));

      const typesHtml = types
        .map(t => `<p class="type ${typeToClass(t)}">${t}</p>`)
        .join('');

      const isStartup = p.labels && p.labels.startup;

      article.innerHTML = `
      <a href="${p.slug}">
        <h2 class="title">${p.title || ''}</h2>
        <div class="identifier">
          <p class="year">${p.year || ''}</p>
          ${typesHtml}
          ${isStartup ? '<p class="startup">Startup</p>' : ''}
        </div>
      </a>
      `;

      frag.appendChild(article);
    });

    container.replaceChildren(frag);

    // Let the filter know cards are in the DOM
    document.dispatchEvent(new CustomEvent('projects:ready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render, { once: true });
  } else {
    render();
  }
})();
