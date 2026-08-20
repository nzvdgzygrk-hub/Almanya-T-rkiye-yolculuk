(() => {
  const YPTI_URL = "https://ypti.ticaret.gov.tr";

  const ORDERS = [
    {
      title: "Gasdruckdämpfer lang",
      length: "ca. 270 mm",
      pressure: "100 N",
      note: "Etwas stärker als der bisherige 80-N-Dämpfer.",
      url: "https://globstar.store/products/gasdruckdampfer-entry"
    },
    {
      title: "Gasdruckdämpfer kurz",
      length: "ca. 178 mm Gesamtlänge / 156 mm Befestigungsabstand",
      pressure: "100 N",
      note: "Kurze Ausführung, ebenfalls etwas stärker als 80 N.",
      url: "https://globstar.store/products/gasdruckdampfer-ntp-mini"
    }
  ];

  function attachTaskLink() {
    const task = document.querySelector('input[data-task-id="trafik-ceza"]')?.closest('.turkiye-task');
    if (!task || task.querySelector('.turkiye-task-link')) return;

    const link = document.createElement('a');
    link.className = 'turkiye-task-link';
    link.href = YPTI_URL;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Öffnen ↗';
    link.setAttribute('aria-label', 'YPTI öffnen');
    link.addEventListener('click', event => event.stopPropagation());

    Object.assign(link.style, {
      marginLeft: 'auto',
      flex: '0 0 auto',
      padding: '7px 10px',
      borderRadius: '10px',
      background: 'var(--blue, #1d4ed8)',
      color: '#fff',
      fontSize: '.84rem',
      fontWeight: '800',
      textDecoration: 'none'
    });

    task.appendChild(link);
  }

  function addOrderStyles() {
    if (document.getElementById('turkiyeOrderStyles')) return;
    const style = document.createElement('style');
    style.id = 'turkiyeOrderStyles';
    style.textContent = `
      .order-grid{display:grid;gap:12px}
      .order-card{background:#fff;border:1px solid var(--line,#e5e7eb);border-radius:18px;padding:15px;box-shadow:var(--shadow,0 12px 28px rgba(15,23,42,.08))}
      .order-card h3{margin:0 0 9px;font-size:1.08rem}
      .order-specs{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 10px}
      .order-spec{display:inline-flex;border:1px solid var(--line,#e5e7eb);border-radius:999px;background:#f9fafb;padding:7px 10px;font-size:.86rem;font-weight:800}
      .order-card p{margin:7px 0}
      .order-card .btn{margin-top:6px}
    `;
    document.head.appendChild(style);
  }

  function insertOrdersTab() {
    if (document.getElementById('bestellungen')) return;
    const nav = document.querySelector('.nav-tabs');
    const main = document.querySelector('main');
    if (!nav || !main) return;

    addOrderStyles();

    const button = document.createElement('button');
    button.className = 'tab-btn';
    button.dataset.tab = 'bestellungen';
    button.textContent = '🛒 Bestellungen Türkei';
    nav.prepend(button);

    const panel = document.createElement('section');
    panel.className = 'panel';
    panel.id = 'bestellungen';
    panel.innerHTML = `
      <div class="section-title"><h2>Bestellungen für Türkei</h2><small>noch bestellen</small></div>
      <div class="order-grid">
        ${ORDERS.map(order => `
          <div class="order-card">
            <h3>🔧 ${order.title}</h3>
            <div class="order-specs">
              <span class="order-spec">📏 ${order.length}</span>
              <span class="order-spec">💨 Gasdruck ${order.pressure}</span>
            </div>
            <p class="muted">${order.note}</p>
            <a class="btn" href="${order.url}" target="_blank" rel="noopener">Artikel öffnen ↗</a>
          </div>
        `).join('')}
      </div>
    `;

    const firstPanel = main.querySelector('.panel');
    if (firstPanel) main.insertBefore(panel, firstPanel);
    else main.appendChild(panel);

    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      panel.classList.add('active');
    });
  }

  function init() {
    insertOrdersTab();
    attachTaskLink();
    const observer = new MutationObserver(() => {
      insertOrdersTab();
      attachTaskLink();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
