// RYDEXS shared layout: navbar, footer, floating buttons, booking-assistance popup and dark mode.
// Every page uses this file, so change the menu, footer links or phone number here once.
//
// Usage in a page:
//   <head> ... <script src="js/supabase.js"></script><script src="js/site.js"></script></head>
//   <body><script>RYDEXS.header();</script> ...page content... <script>RYDEXS.footer();</script></body>
(function () {
  const PHONE = '9483607072';
  const PHONE_DISPLAY = '+91 94836 07072';
  const WHATSAPP = 'https://wa.me/91' + PHONE;
  const LOGO = 'a_clean_high_contrast_modern_vector_logo_style_g.png';

  // "fleet.html", "/fleet" (clean URLs) and "/" all resolve to a page id
  const page = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';

  // Home and Contact have their own trip planner; other pages send visitors to the Contact planner
  const PLAN_URL = page === 'index' || page === 'contact' ? '#planner' : 'contact.html#planner';

  // The navbar is transparent at the top of every page and turns white once scrolled.
  // What shows through decides the menu text colour:
  //   'light' photo -> dark text, 'dark' photo -> white text,
  //   'page' (plain page background) -> dark text, or white text in dark mode
  const NAV_BACKDROP = { index: 'dark', about: 'dark', contact: 'dark', fleet: 'page', services: 'page' };
  const navClass = 'nav-transparent' + ({ dark: ' nav-on-dark', page: ' nav-on-page' }[NAV_BACKDROP[page]] || '');

  const MENU = [
    ['index', 'index.html', 'Home'],
    ['', 'index.html#urbania', 'Urbania'],               // Tempo & Vans rates on Home, Urbania rows highlighted
    ['', 'index.html#tempo-traveller', 'Tempo Traveller'], // same table, Tempo Traveller rows highlighted
    ['fleet', 'fleet.html', 'Fleet'],
    ['services', 'services.html', 'Services'],
    ['', 'index.html#packages', 'Packages'],
    ['', 'index.html#experiences', 'Experiences'],
    ['about', 'about.html', 'About'],
    ['contact', 'contact.html', 'Contact']
  ];

  const FOOTER_COLUMNS = [
    ['Explore', [['Fleet', 'fleet.html'], ['Services', 'services.html'], ['Packages', 'index.html#packages'], ['Experiences', 'index.html#experiences'], ['Gallery', 'index.html#gallery']]],
    ['Company', [['About Us', 'about.html'], ['Contact', 'contact.html'], ['Careers', '#'], ['Blog', '#']]],
    ['Support', [['Get a Quote', 'contact.html#planner'], ['FAQ', '#'], ['Privacy Policy', '#'], ['Terms &amp; Conditions', '#']]]
  ];

  // ---- Dark mode: applied immediately (this file loads in <head>) so the page never flashes ----
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const label = document.querySelector('#themeToggle .theme-toggle-label');
    if (label) label.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  }
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('rydexs-theme'); } catch (e) {}
  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');

  // Inserts markup right where the calling inline <script> sits
  function insertHere(html) {
    document.currentScript.insertAdjacentHTML('beforebegin', html);
  }

  function header() {
    const links = MENU.map(([id, href, label]) =>
      `<a href="${href}"${id === page ? ' class="nav-active" aria-current="page"' : ''}>${label}</a>`
    ).join('\n      ');

    insertHere(`
  <nav id="navbar" class="${navClass}">
    <div class="logo"><a href="index.html" aria-label="RYDEXS home"><img src="${LOGO}" alt="RYDEXS"></a></div>
    <div class="nav-links" id="navLinks">
      ${links}
      <a href="${PLAN_URL}" class="nav-menu-cta">Plan Your Trip</a>
      <button type="button" class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
        <span class="theme-toggle-icon" aria-hidden="true"></span>
        <span class="theme-toggle-label">Dark mode</span>
      </button>
    </div>
    <a href="${PLAN_URL}" class="nav-cta">Plan Your Trip</a>
    <button type="button" class="hamburger" id="hamburger" aria-label="Open navigation menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </nav>`);
    applyTheme(document.documentElement.getAttribute('data-theme'));
  }

  function footer() {
    const columns = FOOTER_COLUMNS.map(([title, items]) => `
      <div class="footer-section">
        <h4>${title}</h4>
        <ul>${items.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join('')}</ul>
      </div>`).join('');

    insertHere(`
  <footer>
    <div class="footer-content">
      <div>
        <img src="${LOGO}" alt="RYDEXS" class="footer-logo" loading="lazy">
        <p class="footer-tagline">Your journey, our priority. Crafting unforgettable travel experiences from Bengaluru.</p>
      </div>${columns}
    </div>
    <div class="footer-bottom">
      <p>Bengaluru, Karnataka, India &middot; <a href="tel:+91${PHONE}" style="color:inherit;">${PHONE_DISPLAY}</a></p>
      <div class="footer-social">
        <a href="#" title="Instagram">IG</a>
        <a href="${WHATSAPP}" target="_blank" rel="noopener" title="WhatsApp">WA</a>
        <a href="#" title="Facebook">f</a>
      </div>
      <p>&copy; ${new Date().getFullYear()} RYDEXS. All rights reserved.</p>
    </div>
  </footer>

  <div class="fab-stack">
    <button type="button" class="fab fab-assistant" id="assistOpen" title="Trip Assistant" aria-label="Open trip assistant">
      <span class="fab-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2" y="13" width="4" height="7" rx="1.5"/><rect x="18" y="13" width="4" height="7" rx="1.5"/><path d="M20 18v1a3 3 0 0 1-3 3h-3"/></svg></span>
      <span class="fab-label">Trip Assistant</span>
    </button>
    <a href="${WHATSAPP}" target="_blank" rel="noopener" class="fab fab-whatsapp" title="Chat with us" aria-label="Chat on WhatsApp">
      <span class="fab-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.445 4.436-9.879 9.888-9.879 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.445-4.437 9.879-9.885 9.879m8.413-18.297A11.815 11.815 0 0 0 12.05.083C5.495.083.16 5.418.157 11.974c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg></span>
      <span class="fab-label">Chat with us</span>
    </a>
    <button type="button" class="fab fab-top" id="scrollTopBtn" title="Back to top" aria-label="Back to top">
      <span class="fab-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg></span>
    </button>
  </div>

  <div class="assist-overlay" id="assistOverlay" aria-hidden="true">
    <div class="assist-modal" role="dialog" aria-modal="true" aria-labelledby="assistTitle">
      <button type="button" class="assist-close" id="assistClose" aria-label="Close">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <div class="assist-header">
        <h3 class="assist-title" id="assistTitle">Clear your doubts &amp;<span>Get Booking Assistance</span></h3>
        <div class="assist-agent">
          <span class="assist-agent-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.94.36 1.85.68 2.72a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.36-1.36a2 2 0 0 1 2.11-.45c.87.32 1.78.55 2.72.68A2 2 0 0 1 22 16.92z"/></svg></span>
          <div><small>Talk to our agent</small><strong><a href="tel:+91${PHONE}" style="color:inherit;text-decoration:none;">${PHONE_DISPLAY}</a></strong></div>
        </div>
      </div>
      <div class="assist-panel">
        <div class="assist-benefits">
          <div class="assist-benefit"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>Get a personalized route plan</div>
          <div class="assist-benefit"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>Learn about pricing for your travel</div>
        </div>
        <form class="assist-form" id="assistForm">
          <div class="assist-input-wrap">
            <span class="assist-cc">+91</span>
            <input type="tel" id="assistPhone" placeholder="Phone number" inputmode="numeric" pattern="[0-9]{10}" maxlength="10" required aria-label="Phone number">
          </div>
          <button type="submit" class="assist-submit">Schedule a call</button>
        </form>
        <p class="assist-confirm" id="assistConfirm">Thanks! Our team will call you back shortly.</p>
      </div>
    </div>
  </div>`);
    wireLayout();
  }

  function wireLayout() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    document.getElementById('themeToggle').addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('rydexs-theme', next); } catch (e) {}
    });

    // Mobile menu
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('active');
      navbar.classList.toggle('menu-open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      navbar.classList.remove('menu-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }));

    // Navbar shadow and back-to-top button appear after scrolling
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 80);
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Booking-assistance popup: the floating button, or any element with data-open-assist
    const overlay = document.getElementById('assistOverlay');
    const assistForm = document.getElementById('assistForm');
    const open = e => {
      e.preventDefault();
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    document.getElementById('assistOpen').addEventListener('click', open);
    document.querySelectorAll('[data-open-assist]').forEach(el => el.addEventListener('click', open));
    document.getElementById('assistClose').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });

    assistForm.addEventListener('submit', async e => {
      e.preventDefault();
      const phone = document.getElementById('assistPhone').value.trim();
      if (!/^[0-9]{10}$/.test(phone)) return; // the browser's pattern check flags invalid input
      if (!await submitEnquiry(assistForm.querySelector('.assist-submit'), { source: 'callback', phone })) return;
      document.getElementById('assistConfirm').classList.add('show');
      assistForm.reset();
    });
  }

  window.RYDEXS = { header, footer };
})();
