(() => {
  const products = [
    {
      country: "Deutschland",
      flag: "🇩🇪",
      buy: "Nichts kaufen",
      category: "Pkw bis 3,5 t",
      recommendation: "Für deine Durchfahrt keine Pkw-Autobahnmaut.",
      extra: "Nur Umweltplakette wäre relevant, wenn du in bestimmte Umweltzonen fährst – nicht für die reine Autobahnroute.",
      link: ""
    },
    {
      country: "Österreich",
      flag: "🇦🇹",
      buy: "Digitale Vignette",
      category: "Pkw · 1-Tages-, 10-Tages-, 2-Monats- oder Jahres-Vignette",
      recommendation: "In deinem Screenshot links wählen: Digitale Vignetten. Für Velbert → Passau → Nickelsdorf/Hegyeshalom normalerweise KEINE Digitale Streckenmaut nötig.",
      extra: "Digitale Streckenmaut ist nur für Sonderstrecken wie A9, A10, A11, A13 oder S16. Wenn Hin- und Rückfahrt mehr als 10 Tage auseinander liegen: zweite 10-Tages-Vignette oder 2-Monats-Vignette prüfen.",
      link: "https://shop.asfinag.at/"
    },
    {
      country: "Ungarn",
      flag: "🇭🇺",
      buy: "E-Vignette / e-Matrica",
      category: "D1 · normaler Pkw bis 3,5 t und bis 7 Sitze",
      recommendation: "Für die Durchfahrt eine landesweite 10-Tages-Vignette D1 nehmen, keine Komitats-/County-Vignette.",
      extra: "Wichtig: Kennzeichen und Land Deutschland korrekt eintragen. Beleg speichern.",
      link: "https://ematrica.nemzetiutdij.hu/"
    },
    {
      country: "Rumänien",
      flag: "🇷🇴",
      buy: "Rovinieta",
      category: "Kategorie A / Car · normaler Pkw",
      recommendation: "Ja, es gibt mehrere Kategorien. Für dein normales Auto musst du im Shop 'Car' bzw. Kategorie A wählen. Nicht '0–3.5 t', das ist dort für Güterfahrzeug/Transporter bis 3,5 t.",
      extra: "Laufzeiten für Kategorie A: 1 Tag, 10 Tage, 30 Tage, 60 Tage oder 12 Monate. Für reine Durchfahrt reicht meist 10 Tage; wenn Rückfahrt später ist, 30/60 Tage prüfen. Die Brücke Calafat–Vidin ist extra und nicht mit der Rovinieta abgedeckt.",
      link: "https://www.roviniete.ro/en/rovinieta"
    },
    {
      country: "Bulgarien",
      flag: "🇧🇬",
      buy: "E-Vignette",
      category: "Pkw bis 3,5 t",
      recommendation: "Für die Durchfahrt eine Wochen- oder Monats-E-Vignette nehmen, je nach Rückfahrt.",
      extra: "Die Brücke Calafat–Vidin ist extra. Kennzeichen genau wie im Fahrzeugschein eintragen.",
      link: "https://web.bgtoll.bg/"
    },
    {
      country: "Türkei",
      flag: "🇹🇷",
      buy: "HGS",
      category: "Hızlı Geçiş Sistemi · kein Vignetten-System",
      recommendation: "Keine Vignette kaufen. HGS-Guthaben/Etikett/Karte nutzen, Autobahn und Brücken werden nach Nutzung berechnet.",
      extra: "Bei Miet-/fremdem Auto vorher klären, wie HGS abgerechnet wird. Guthaben regelmäßig prüfen.",
      link: "https://hgsmusteri.ptt.gov.tr/"
    },
    {
      country: "Serbien Alternative",
      flag: "🇷🇸",
      buy: "Keine Vignette",
      category: "Mautstationen / streckenabhängige Maut",
      recommendation: "Nur relevant, wenn du Route B über Serbien fährst. Dort wird normalerweise an Mautstellen pro Strecke bezahlt.",
      extra: "Für deine Standardroute über Rumänien/Bulgarien nicht nötig.",
      link: ""
    }
  ];

  function addStyles() {
    if (document.getElementById("vignetteWidgetStyles")) return;
    const style = document.createElement("style");
    style.id = "vignetteWidgetStyles";
    style.textContent = `
      .vignette-list{display:grid;gap:10px}.vignette-row{border:1px solid var(--line,#e5e7eb);background:#fff;border-radius:16px;padding:12px}.vignette-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.vignette-country{font-weight:900;font-size:1.02rem}.vignette-buy{font-weight:900;color:var(--red-dark,#7f1d1d);text-align:right}.vignette-cat{margin-top:4px;color:var(--muted,#6b7280);font-size:.9rem}.vignette-rec{margin:8px 0 0}.vignette-extra{margin:6px 0 0;color:var(--muted,#6b7280);font-size:.9rem}.vignette-warning{border:1px solid #fed7aa;background:#fff7ed;color:#7c2d12;border-radius:14px;padding:10px;margin-bottom:10px}.vignette-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}@media(max-width:520px){.vignette-top{display:block}.vignette-buy{text-align:left;margin-top:3px}}
    `;
    document.head.appendChild(style);
  }

  function createCard() {
    const card = document.createElement("div");
    card.className = "card";
    card.id = "vignetteGuideCard";
    card.innerHTML = `
      <h3>🎟️ Was muss ich kaufen?</h3>
      <div class="vignette-warning"><strong>Österreich Screenshot:</strong> Für deine normale Route auf <strong>Digitale Vignetten</strong> tippen. <strong>Digitale Streckenmaut</strong> nur kaufen, wenn dein Navi wirklich über eine Sondermautstrecke fährt.</div>
      <div class="vignette-warning"><strong>Rumänien:</strong> Für normalen Pkw <strong>Car / Kategorie A</strong> wählen. Die Auswahl <strong>0–3.5 t</strong> ist dort nicht dein normaler Pkw, sondern Güterfahrzeug/Transporter bis 3,5 t.</div>
      <div class="vignette-list">
        ${products.map(item => `
          <div class="vignette-row">
            <div class="vignette-top">
              <div>
                <div class="vignette-country">${item.flag} ${item.country}</div>
                <div class="vignette-cat">${item.category}</div>
              </div>
              <div class="vignette-buy">${item.buy}</div>
            </div>
            <p class="vignette-rec">${item.recommendation}</p>
            <p class="vignette-extra">${item.extra}</p>
            ${item.link ? `<div class="vignette-actions"><a class="small-btn secondary" href="${item.link}" target="_blank" rel="noopener">Shop öffnen</a></div>` : ""}
          </div>
        `).join("")}
      </div>
    `;
    return card;
  }

  function insertWidget() {
    addStyles();
    if (document.getElementById("vignetteGuideCard")) return;

    const routePanel = document.getElementById("route");
    const bordersPanel = document.getElementById("grenzen");

    if (routePanel) {
      const title = routePanel.querySelector(".section-title");
      const card = createCard();
      if (title && title.nextSibling) routePanel.insertBefore(card, title.nextSibling);
      else routePanel.prepend(card);
    }

    if (bordersPanel) {
      const title = bordersPanel.querySelector(".section-title");
      const clone = createCard();
      clone.id = "vignetteGuideCardBorders";
      if (title && title.nextSibling) bordersPanel.insertBefore(clone, title.nextSibling);
      else bordersPanel.prepend(clone);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insertWidget);
  } else {
    insertWidget();
  }
})();
