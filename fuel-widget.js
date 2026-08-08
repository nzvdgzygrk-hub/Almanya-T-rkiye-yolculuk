(() => {
  const LOCAL_SOURCE_URL = "fuel-prices.json";
  const RAW_SOURCE_URL = "https://raw.githubusercontent.com/nzvdgzygrk-hub/Almanya-T-rkiye-yolculuk/main/fuel-prices.json";
  const ACTIONS_URL = "https://github.com/nzvdgzygrk-hub/Almanya-T-rkiye-yolculuk/actions/workflows/update-fuel-prices.yml";
  const EU_SOURCE = "https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en";
  const FALLBACK = {
    updated_at: null,
    status: "waiting_for_first_update",
    countries: [
      { code: "DE", country: "Deutschland", diesel_eur: null, gasoline95_eur: null },
      { code: "AT", country: "Österreich", diesel_eur: null, gasoline95_eur: null },
      { code: "HU", country: "Ungarn", diesel_eur: null, gasoline95_eur: null },
      { code: "RO", country: "Rumänien", diesel_eur: null, gasoline95_eur: null },
      { code: "BG", country: "Bulgarien", diesel_eur: null, gasoline95_eur: null },
      { code: "TR", country: "Türkei", diesel_eur: null, gasoline95_eur: null }
    ]
  };

  let priceData = FALLBACK;

  function addStyles() {
    if (document.getElementById("fuelWidgetStyles")) return;
    const style = document.createElement("style");
    style.id = "fuelWidgetStyles";
    style.textContent = `
      .fuel-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:end;margin:12px 0}.fuel-toolbar>div{flex:1;min-width:160px}.fuel-price-list{display:grid;gap:8px}.fuel-price-row{display:grid;grid-template-columns:1.1fr .8fr .9fr;gap:8px;align-items:center;border:1px solid var(--line,#e5e7eb);border-radius:14px;padding:10px;background:#fff}.fuel-price-row.best{border-color:#047857;background:#ecfdf5}.fuel-price-country{font-weight:900}.fuel-price-value{font-size:1.05rem;font-weight:900;text-align:right}.fuel-price-badge{justify-self:end;border-radius:999px;padding:5px 8px;font-size:.76rem;background:#f3f4f6;color:#374151}.fuel-price-row.best .fuel-price-badge{background:#047857;color:#fff}.fuel-price-empty{border:1px dashed var(--line,#e5e7eb);border-radius:14px;padding:12px;color:var(--muted,#6b7280);background:#f9fafb}.fuel-source-link{font-size:.86rem;color:var(--muted,#6b7280)}.fuel-info{border:1px solid #bfdbfe;background:#eff6ff;color:#1e3a8a;border-radius:13px;padding:10px;margin:10px 0;font-size:.9rem}.fuel-status{font-size:.88rem;font-weight:700;margin-top:8px}.fuel-status.ok{color:#047857}.fuel-status.warn{color:#b45309}.fuel-status.error{color:#b91c1c}@media(max-width:520px){.fuel-price-row{grid-template-columns:1fr}.fuel-price-value{text-align:left}.fuel-price-badge{justify-self:start}.fuel-toolbar .btn{width:100%}}
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

  function setStatus(message, type = "ok") {
    const status = document.getElementById("fuelReloadStatus");
    if (!status) return;
    status.className = `fuel-status ${type}`;
    status.textContent = message;
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

    const dataDate = priceData.data_date ? ` · Datenstand: <strong>${priceData.data_date}</strong>` : "";
    meta.innerHTML = `Datei aktualisiert: <strong>${formatDate(priceData.updated_at)}</strong>${dataDate} · nationale Durchschnittspreise. <a class="fuel-source-link" href="${EU_SOURCE}" target="_blank" rel="noopener">EU-Quelle</a>`;

    if (!valid.length) {
      root.innerHTML = `<div class="fuel-price-empty">Noch keine Preiswerte vorhanden. Zuerst über „Neue Daten abrufen“ den GitHub-Workflow starten.</div>`;
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
      const badge = row.displayPrice === null ? "kein Wert" : (isBest ? "am günstigsten" : "Vergleich");
      const localKey = kind === "gasoline95" ? "local_gasoline95" : "local_diesel";
      const localText = row[localKey] ? `<div class="muted" style="font-size:.78rem">${row[localKey]}</div>` : "";
      return `
        <div class="fuel-price-row ${isBest ? "best" : ""}">
          <div class="fuel-price-country">${row.country || row.code}</div>
          <div class="fuel-price-value">${formatPrice(row.displayPrice)}${localText}</div>
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

  async function fetchJson(url) {
    const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async function loadPrices(showResult = false) {
    const oldUpdatedAt = priceData.updated_at || null;
    const reloadButton = document.getElementById("reloadFuelPrices");
    if (reloadButton) {
      reloadButton.disabled = true;
      reloadButton.textContent = "Lädt …";
    }
    setStatus("Preisdatei wird ohne Cache neu geladen …", "warn");

    try {
      try {
        priceData = await fetchJson(RAW_SOURCE_URL);
      } catch (rawError) {
        priceData = await fetchJson(LOCAL_SOURCE_URL);
      }
      render();

      if (showResult) {
        const newUpdatedAt = priceData.updated_at || null;
        if (oldUpdatedAt && newUpdatedAt === oldUpdatedAt) {
          setStatus("Neu geladen – es liegt aber noch kein neuer Datenstand im GitHub-Repo vor.", "warn");
        } else {
          setStatus(`Neu geladen. Stand: ${formatDate(newUpdatedAt)}`, "ok");
        }
      } else {
        setStatus(`Geladen. Stand: ${formatDate(priceData.updated_at)}`, "ok");
      }
    } catch (error) {
      priceData = FALLBACK;
      render();
      setStatus(`Preisdatei konnte nicht geladen werden: ${error.message}`, "error");
    } finally {
      if (reloadButton) {
        reloadButton.disabled = false;
        reloadButton.textContent = "Preise neu laden";
      }
    }
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
      <p class="muted" id="fuelPriceMeta">Spritpreise werden geladen …</p>
      <div class="fuel-info"><strong>Unterschied:</strong> „Preise neu laden“ lädt nur den aktuellen Stand aus GitHub. „Neue Daten abrufen“ startet nicht automatisch in der App, sondern öffnet den geschützten GitHub-Workflow.</div>
      <div class="fuel-toolbar">
        <div>
          <label class="input-label" for="fuelKind">Anzeige</label>
          <select id="fuelKind">
            <option value="diesel">Diesel</option>
            <option value="gasoline95">Benzin 95</option>
          </select>
        </div>
        <button class="btn secondary" id="reloadFuelPrices">Preise neu laden</button>
        <a class="btn blue" id="runFuelUpdate" href="${ACTIONS_URL}" target="_blank" rel="noopener">Neue Daten abrufen</a>
      </div>
      <div id="fuelReloadStatus" class="fuel-status warn">Preisdatei wird geladen …</div>
      <div id="fuelPricesRoot" class="fuel-price-list"></div>
      <p class="muted">Nur Orientierung: Länder-Durchschnittspreise. Autobahn- und Grenztankstellen können deutlich teurer sein.</p>
    `;

    if (title && title.nextSibling) {
      tankenPanel.insertBefore(card, title.nextSibling);
    } else {
      tankenPanel.prepend(card);
    }

    document.getElementById("fuelKind").addEventListener("change", render);
    document.getElementById("reloadFuelPrices").addEventListener("click", () => loadPrices(true));
    loadPrices(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insertWidget);
  } else {
    insertWidget();
  }
})();

(() => {
  const TASK_KEY = "turkiye_yolculuk_tasks_v1";
  const TASKS = [
    { id: "hgs", label: "HGS laden" },
    { id: "buca", label: "Buca Vergi" },
    { id: "dask", label: "DASK verlängern" },
    { id: "turkcell", label: "Turkcell" },
    { id: "trafik-ceza", label: "🚦 Trafik ceza kontrol et" }
  ];

  function getTaskState() {
    try {
      return JSON.parse(localStorage.getItem(TASK_KEY) || "{}") || {};
    } catch (_) {
      return {};
    }
  }

  function saveTaskState(state) {
    localStorage.setItem(TASK_KEY, JSON.stringify(state));
  }

  function addTaskStyles() {
    if (document.getElementById("turkiyeTaskStyles")) return;
    const style = document.createElement("style");
    style.id = "turkiyeTaskStyles";
    style.textContent = `
      .turkiye-task-list{display:grid;gap:9px;margin-top:12px}
      .turkiye-task{display:flex;align-items:center;gap:12px;padding:13px 12px;border:1px solid var(--line,#e5e7eb);border-radius:14px;background:#fff;cursor:pointer;user-select:none}
      .turkiye-task input{width:24px;height:24px;flex:0 0 auto;accent-color:var(--green,#047857)}
      .turkiye-task span{font-weight:800;font-size:1rem}
      .turkiye-task.done{background:#ecfdf5;border-color:#a7f3d0}
      .turkiye-task.done span{text-decoration:line-through;color:var(--muted,#6b7280)}
      .turkiye-task-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:10px 0 2px}
      .turkiye-task-count{font-weight:900;color:var(--green,#047857)}
    `;
    document.head.appendChild(style);
  }

  function insertTasksTab() {
    if (document.getElementById("aufgaben")) return;
    const nav = document.querySelector(".nav-tabs");
    const main = document.querySelector("main");
    if (!nav || !main) return;

    addTaskStyles();

    const button = document.createElement("button");
    button.className = "tab-btn";
    button.dataset.tab = "aufgaben";
    button.textContent = "🇹🇷 Aufgaben";
    nav.appendChild(button);

    const panel = document.createElement("section");
    panel.className = "panel";
    panel.id = "aufgaben";
    panel.innerHTML = `
      <div class="section-title"><h2>Aufgaben Türkei</h2><small>vor Ort erledigen</small></div>
      <div class="card">
        <div class="check-head">
          <div>
            <h3>🇹🇷 To-do-Liste</h3>
            <p class="muted">Einfach antippen und abhaken. Die Haken bleiben auf diesem Gerät gespeichert.</p>
          </div>
        </div>
        <div class="turkiye-task-summary">
          <span>Fortschritt</span>
          <span class="turkiye-task-count" id="turkiyeTaskCount">0 / ${TASKS.length}</span>
        </div>
        <div class="progress-wrap"><div class="progress-bar" id="turkiyeTaskProgress"></div></div>
        <div class="turkiye-task-list" id="turkiyeTaskList"></div>
        <div class="link-row">
          <button class="small-btn secondary" id="resetTurkiyeTasks">Haken zurücksetzen</button>
        </div>
      </div>
    `;
    main.appendChild(panel);

    const state = getTaskState();
    const list = panel.querySelector("#turkiyeTaskList");

    function renderTasks() {
      list.innerHTML = TASKS.map(task => {
        const checked = !!state[task.id];
        return `<label class="turkiye-task ${checked ? "done" : ""}"><input type="checkbox" data-task-id="${task.id}" ${checked ? "checked" : ""}><span>${task.label}</span></label>`;
      }).join("");

      const done = TASKS.filter(task => !!state[task.id]).length;
      panel.querySelector("#turkiyeTaskCount").textContent = `${done} / ${TASKS.length}`;
      panel.querySelector("#turkiyeTaskProgress").style.width = `${Math.round((done / TASKS.length) * 100)}%`;

      list.querySelectorAll("input[data-task-id]").forEach(input => {
        input.addEventListener("change", () => {
          state[input.dataset.taskId] = input.checked;
          saveTaskState(state);
          renderTasks();
        });
      });
    }

    panel.querySelector("#resetTurkiyeTasks").addEventListener("click", () => {
      if (!confirm("Alle Türkei-Aufgaben zurücksetzen?")) return;
      TASKS.forEach(task => delete state[task.id]);
      saveTaskState(state);
      renderTasks();
    });

    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      panel.classList.add("active");
    });

    renderTasks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insertTasksTab);
  } else {
    insertTasksTab();
  }
})();