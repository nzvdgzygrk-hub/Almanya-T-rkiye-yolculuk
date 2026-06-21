(() => {
  const SOURCE_URL = "fuel-prices.json";
  const EU_SOURCE = "https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en";
  const FALLBACK = {
    updated_at: null,
    status: "waiting_for_first_update",
    countries: [
      { code: "DE", country: "Deutschland", diesel_eur: null, gasoline95_eur: null, source: "European Commission Weekly Oil Bulletin" },
      { code: "AT", country: "Österreich", diesel_eur: null, gasoline95_eur: null, source: "European Commission Weekly Oil Bulletin" },
      { code: "HU", country: "Ungarn", diesel_eur: null, gasoline95_eur: null, source: "European Commission Weekly Oil Bulletin" },
      { code: "RO", country: "Rumänien", diesel_eur: null, gasoline95_eur: null, source: "European Commission Weekly Oil Bulletin" },
      { code: "BG", country: "Bulgarien", diesel_eur: null, gasoline95_eur: null, source: "European Commission Weekly Oil Bulletin" },
      { code: "TR", country: "Türkei", diesel_eur: null, gasoline95_eur: null, source: "Optional über TURKEY_FUEL_API_URL" }
    ]
  };

  let priceData = FALLBACK;

  function addStyles() {
    if (document.getElementById("fuelWidgetStyles")) return;
    const style = document.createElement("style");
    style.id = "fuelWidgetStyles";
    style.textContent = `
      .fuel-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:end;margin:12px 0}.fuel-toolbar>div{flex:1;min-width:160px}.fuel-price-list{display:grid;gap:8px}.fuel-price-row{display:grid;grid-template-columns:1.1fr .8fr .9fr;gap:8px;align-items:center;border:1px solid var(--line,#e5e7eb);border-radius:14px;padding:10px;background:#fff}.fuel-price-row.best{border-color:#047857;background:#ecfdf5}.fuel-price-country{font-weight:900}.fuel-price-value{font-size:1.05rem;font-weight:900;text-align:right}.fuel-price-badge{justify-self:end;border-radius:999px;padding:5px 8px;font-size:.76rem;background:#f3f4f6;color:#374151}.fuel-price-row.best .fuel-price-badge{background:#047857;color:#fff}.fuel-price-empty{border:1px dashed var(--line,#e5e7eb);border-radius:14px;padding:12px;color:var(--muted,#6b7280);background:#f9fafb}.fuel-source-link{font-size:.86rem;color:var(--muted,#6b7280)}@media(max-width:520px){.fuel-price-row{grid-template-columns:1fr}.fuel-price-value{text-align:left}.fuel-price-badge{justify-self:start}}
    `;
    document.head.appendChild(style);
  }

  function formatPrice(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return "–";
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(value) + "/L";
  }

  function formatDate(value) {
    if (!value) return "noch nicht aktualisiert";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(date);
  }

  function getPrice(country, kind) {
    const key = kind === "gasoline95" ? "gasoline95_eur" : "diesel_eur";
    const value = Number(country[key]);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  function render() {
    const root = document.getElementById("fuelPricesRoot");
    const meta = document.getElementById("fuelPriceMeta");
    const select = document.getElementById("fuelKind");
    if (!root || !meta || !select) return;

    const kind = select.value;
    const countries = Array.isArray(priceData.countries) ? priceData.countries : [];
    const rows = countries.map(country => ({ ...country, displayPrice: getPrice(country, kind) }));
    const valid = rows.filter(row => row.displayPrice !== null);
    const best = valid.length ? Math.min(...valid.map(row => row.displayPrice)) : null;

    meta.innerHTML = `Stand: <strong>${formatDate(priceData.updated_at)}</strong> · nationale Durchschnittspreise, nicht einzelne Tankstelle. <a class="fuel-source-link" href="${EU_SOURCE}" target="_blank" rel="noopener">EU-Quelle</a>`;

    if (!valid.length) {
      root.innerHTML = `<div class="fuel-price-empty">Noch keine Livepreise geladen. Die GitHub Action kann die Datei <strong>fuel-prices.json</strong> automatisch aktualisieren. Für die Türkei braucht man zusätzlich eine freie Quelle/API oder einen manuellen Wert.</div>`;
      updateHero("–", "Preise noch leer");
      return;
    }

    rows.sort((a, b) => {
      if (a.displayPrice === null && b.displayPrice === null) return 0;
      if (a.displayPrice === null) return 1;
      if (b.displayPrice === null) return -1;
      return a.displayPrice - b.displayPrice;
    });

    root.innerHTML = rows.map(row => {
      const isBest = row.displayPrice !== null && row.displayPrice === best;
      const badge = row.displayPrice === null ? "kein Wert" : (isBest ? "am günstigsten" : "vergleich");
      return `
        <div class="fuel-price-row ${isBest ? "best" : ""}">
          <div class="fuel-price-country">${row.country || row.code}</div>
          <div class="fuel-price-value">${formatPrice(row.displayPrice)}</div>
          <div class="fuel-price-badge">${badge}</div>
        </div>
      `;
    }).join("");

    const bestRow = rows.find(row => row.displayPrice !== null && row.displayPrice === best);
    updateHero(bestRow ? bestRow.country : "–", bestRow ? `${formatPrice(best)} ${kind === "gasoline95" ? "Benzin" : "Diesel"}` : "Preise fehlen");
  }

  function updateHero(title, subtitle) {
    let card = document.getElementById("fuelQuickCard");
    const grid = document.querySelector(".quick-grid");
    if (!grid) return;
    if (!card) {
      card = document.createElement("div");
      card.id = "fuelQuickCard";
      card.className = "quick-card";
      grid.appendChild(card);
    }
    card.innerHTML = `<strong>${title}</strong><span>${subtitle}</span>`;
  }

  async function loadPrices() {
    const meta = document.getElementById("fuelPriceMeta");
    if (meta) meta.textContent = "Spritpreise werden geladen ...";
    try {
      const response = await fetch(`${SOURCE_URL}?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      priceData = await response.json();
    } catch (error) {
      priceData = FALLBACK;
      const metaEl = document.getElementById("fuelPriceMeta");
      if (metaEl) metaEl.textContent = `Spritpreise konnten nicht geladen werden: ${error.message}`;
    }
    render();
  }

  function insertWidget() {
    addStyles();
    const tankenPanel = document.getElementById("tanken");
    if (!tankenPanel || document.getElementById("fuelPricesCard")) return;

    const title = tankenPanel.querySelector(".section-title");
    const card = document.createElement("div");
    card.className = "card";
    card.id = "fuelPricesCard";
    card.innerHTML = `
      <h3>💸 Spritpreise Länder-Vergleich</h3>
      <p class="muted" id="fuelPriceMeta">Spritpreise werden geladen ...</p>
      <div class="fuel-toolbar">
        <div>
          <label class="input-label" for="fuelKind">Anzeige</label>
          <select id="fuelKind">
            <option value="diesel">Diesel</option>
            <option value="gasoline95">Benzin 95</option>
          </select>
        </div>
        <button class="btn secondary" id="reloadFuelPrices">Aktualisieren</button>
      </div>
      <div id="fuelPricesRoot" class="fuel-price-list"></div>
      <p class="muted">Zum Tanken nur als Orientierung nutzen: EU-Werte sind Länder-Durchschnittspreise. Tankstellen an der Autobahn können teurer sein.</p>
    `;

    if (title && title.nextSibling) {
      tankenPanel.insertBefore(card, title.nextSibling);
    } else {
      tankenPanel.prepend(card);
    }

    document.getElementById("fuelKind").addEventListener("change", render);
    document.getElementById("reloadFuelPrices").addEventListener("click", loadPrices);
    loadPrices();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insertWidget);
  } else {
    insertWidget();
  }
})();
