const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const safeUrl = (url = '') => /^(https?:\/\/|tel:|mailto:|#|\/)/i.test(url) ? url : '#';

function placeCard(place) {
  const meta = [];
  if (place.address) meta.push(`<span>${esc(place.address)}</span>`);
  if (place.phone) {
    meta.push(place.phoneHref
      ? `<a href="tel:${esc(place.phoneHref)}">${esc(place.phone)}</a>`
      : `<span>${esc(place.phone)}</span>`);
  }
  if (place.note) meta.push(`<span>${esc(place.note)}</span>`);
  const links = (place.links || []).map(link =>
    `<a href="${safeUrl(link.url)}" target="_blank" rel="noopener">${esc(link.label)}</a>`
  ).join('');
  return `<article class="place">
    <h3>${esc(place.name)}</h3>
    <p>${esc(place.description || '')}</p>
    ${meta.length ? `<div class="place-meta">${meta.join('')}</div>` : ''}
    ${links ? `<div class="place-links">${links}</div>` : ''}
  </article>`;
}

function proseSection(section, alt = false, id = '') {
  const paragraphs = (section.paragraphs || []).map(p => `<p>${esc(p)}</p>`).join('');
  const link = section.link
    ? `<p><a class="text-link" href="${safeUrl(section.link.url)}" target="_blank" rel="noopener">${esc(section.link.label)} <span aria-hidden="true">→</span></a></p>`
    : '';
  return `<section class="section ${alt ? 'alt' : 'shell'}"${id ? ` id="${id}"` : ''}>
    <div class="${alt ? 'shell' : ''}">
      <div class="section-heading"><h2>${esc(section.title)}</h2></div>
      <div class="prose narrow">${paragraphs}${link}</div>
    </div>
  </section>`;
}

function directorySection(id, title, places, alt = false) {
  return `<section class="section ${alt ? 'alt' : 'shell'}" id="${esc(id)}">
    <div class="${alt ? 'shell' : ''}">
      <div class="section-heading"><h2>${esc(title)}</h2></div>
      <div class="directory-grid">${places.map(placeCard).join('')}</div>
    </div>
  </section>`;
}

function buildHouse(house) {
  const quick = house.quickFacts.map(item => `<div>
    <span class="mini-label">${esc(item.label)}</span>
    <strong>${esc(item.primary)}</strong>
    ${item.phone ? `<a href="tel:${esc(item.phone)}">${esc(item.secondary)}</a>` : `<span>${esc(item.secondary)}</span>`}
  </div>`).join('');
  const essentials = house.essentials.map(item => `<div><dt>${esc(item.term)}</dt><dd>${esc(item.detail)}</dd></div>`).join('');
  const notes = house.notes.map(note => `<li>${esc(note)}</li>`).join('');
  return `<section class="section shell" id="house">
    <div class="section-heading"><h2>${esc(house.title)}</h2></div>
    <div class="house-strip">${quick}</div>
    <div class="split-list">
      <div><h3>${esc(house.essentialsTitle)}</h3><dl class="details-list">${essentials}</dl></div>
      <div><h3>${esc(house.notesTitle)}</h3><ul class="clean-list">${notes}</ul></div>
    </div>
  </section>`;
}

function buildFavorites(favorites) {
  const items = favorites.items.map(item => `<div class="favorite"><span>${esc(item.label)}</span><p>${esc(item.text)}</p></div>`).join('');
  return `<section class="section alt" id="favorites"><div class="shell">
    <div class="section-heading"><h2>${esc(favorites.title)}</h2></div>
    <div class="favorites-grid">${items}</div>
  </div></section>`;
}

function buildExplore(groups) {
  const blocks = groups.map((group, index) => {
    const headingClass = index === 0 ? 'section-heading' : 'subsection-heading';
    const gridClass = group.columns === 2 ? 'directory-grid two-col' : 'directory-grid';
    return `<div class="${headingClass}"><h2>${esc(group.title)}</h2></div><div class="${gridClass}">${group.places.map(placeCard).join('')}</div>`;
  }).join('');
  return `<section class="section shell" id="explore">${blocks}</section>`;
}

function buildDetails(details) {
  return `<section class="section shell final-details">${details.map(item =>
    `<details><summary>${esc(item.title)}</summary><div class="details-body"><p>${esc(item.body)}</p></div></details>`
  ).join('')}</section>`;
}

function setupNavigation() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.site-nav a')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
}

async function initGuide() {
  try {
    const response = await fetch('/guide.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Guide data failed to load: ${response.status}`);
    const data = await response.json();

    document.title = data.site.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', data.site.description);
    document.getElementById('brand-name').textContent = data.site.brandName;
    document.getElementById('brand-sub').textContent = data.site.brandSub;
    document.getElementById('hero-kicker').textContent = data.site.heroKicker;
    document.getElementById('hero-title').textContent = data.site.heroTitle;
    document.getElementById('hero-text').textContent = data.site.heroText;
    document.getElementById('hero-link').innerHTML = `${esc(data.site.heroLinkLabel)} <span aria-hidden="true">→</span>`;
    document.getElementById('footer-brand').textContent = `${data.site.brandName} ${data.site.brandSub}`;
    document.getElementById('footer-tagline').textContent = data.site.tagline;

    document.getElementById('site-nav').innerHTML = data.navigation
      .map(item => `<a href="#${esc(item.target)}">${esc(item.label)}</a>`).join('');

    document.getElementById('dynamic-sections').innerHTML = [
      buildHouse(data.house),
      buildFavorites(data.favorites),
      buildExplore(data.explore),
      directorySection('dining', data.dining.title, data.dining.places, true),
      directorySection('beaches', data.beaches.title, data.beaches.places, false),
      directorySection('transportation', data.transportation.title, data.transportation.places, true),
      proseSection(data.family, false),
      proseSection(data.tickAwareness, true),
      proseSection(data.help, false),
      buildDetails(data.details)
    ].join('');

    setupNavigation();
  } catch (error) {
    console.error(error);
    document.getElementById('dynamic-sections').innerHTML = `<section class="section shell"><div class="prose narrow"><h2>Guest guide temporarily unavailable</h2><p>Please refresh the page or contact guest support.</p></div></section>`;
  }
}

document.addEventListener('DOMContentLoaded', initGuide);
