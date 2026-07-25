(() => {
  const RUSE_ROUTE_TEXT = "Velbert → Passau → Ungarn → Rumänien → Giurgiu–Ruse → Bulgarien → Hamzabeyli / Lesovo → İzmir";
  const CALAFAT_ROUTE_TEXT = "Velbert → Passau → Ungarn → Rumänien → Calafat–Vidin → Bulgarien → Hamzabeyli / Lesovo → İzmir";
  const RUSE_ROUTE_URL = "https://www.google.com/maps/dir/Velbert/Passau/N%C4%83dlac/Giurgiu/Ruse/Lesovo/Hamzabeyli/%C4%B0zmir/";
  const CALAFAT_ROUTE_URL = "https://www.google.com/maps/dir/Velbert/Passau/N%C4%83dlac/Calafat/Vidin/Lesovo/Hamzabeyli/%C4%B0zmir/";
  const KAPIKULE_ALT_URL = "https://www.google.com/maps/dir/Velbert/Passau/N%C4%83dlac/Giurgiu/Ruse/Kap%C4%B1kule/%C4%B0zmir/";

  function addStyles() {
    if (document.getElementById("routeFixStyles")) return;
    const style = document.createElement("style");
    style.id = "routeFixStyles";
    style.textContent = `
      .route-fix-note{border:1px solid #bfdbfe;background:#eff6ff;color:#1e3a8a;border-radius:16px;padding:12px;margin-bottom:12px}.route-fix-note strong{display:block;margin-bottom:4px}.route-fix-note .link-row{margin-top:10px}.route-choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}.route-choice{background:#fff;border:1px solid #bfdbfe;border-radius:14px;padding:10px}.route-choice h4{margin:0 0 6px;font-size:1rem}.route-choice p{margin:6px 0}.route-choice .tag{display:inline-flex;border-radius:999px;padding:4px 8px;font-weight:900;font-size:.78rem;background:#dbeafe;color:#1e40af}@media(max-width:720px){.route-choice-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function findCardByHeading(text) {
    return Array.from(document.querySelectorAll(".card")).find(card => {
      const h3 = card.querySelector("h3");
      return h3 && h3.textContent.includes(text);
    });
  }

  function setFirstParagraph(card, html) {
    const p = card && card.querySelector("p");
    if (p) p.innerHTML = html;
  }

  function setSecondParagraph(card, html) {
    const paragraphs = card ? card.querySelectorAll("p") : [];
    if (paragraphs[1]) paragraphs[1].innerHTML = html;
  }

  function setMapLink(card, href) {
    const link = card && card.querySelector("a[href]");
    if (link) href ? link.href = href : link.removeAttribute("href");
  }

  function patchStartCard() {
    const card = findCardByHeading("Hauptstrecke");
    if (!card) return;
    setFirstParagraph(card, `<strong>${RUSE_ROUTE_TEXT}</strong>`);
    setSecondParagraph(card, "Für Hamzabeyli / Lesovo ist Giurgiu–Ruse als Hauptvariante sinnvoll. Calafat–Vidin bleibt als zweite Rumänien/Bulgarien-Variante gespeichert. In beiden Fällen bleibt die Türkei-Grenze Hamzabeyli / Lesovo.");
    setMapLink(card, RUSE_ROUTE_URL);
  }

  function patchRouteInfo() {
    const routePanel = document.getElementById("route");
    if (!routePanel || document.getElementById("hamzabeyliRouteNote")) return;

    const title = routePanel.querySelector(".section-title");
    const note = document.createElement("div");
    note.id = "hamzabeyliRouteNote";
    note.className = "route-fix-note";
    note.innerHTML = `
      <strong>Aktuelle Planung: Hamzabeyli / Lesovo bleibt in beiden Varianten</strong>
      Nicht mehr Kapıkule als Zielgrenze. Für Hamzabeyli macht <b>Giurgiu–Ruse</b> oft mehr Sinn, deshalb steht es jetzt als Hauptvariante. <b>Calafat–Vidin</b> bleibt als zweite Variante drin.
      <div class="route-choice-grid">
        <div class="route-choice">
          <span class="tag">Variante 1</span>
          <h4>Giurgiu–Ruse → Hamzabeyli / Lesovo</h4>
          <p>${RUSE_ROUTE_TEXT}</p>
          <div class="link-row"><a class="small-btn" target="_blank" rel="noopener" href="${RUSE_ROUTE_URL}">Ruse-Route öffnen</a></div>
        </div>
        <div class="route-choice">
          <span class="tag">Variante 2</span>
          <h4>Calafat–Vidin → Hamzabeyli / Lesovo</h4>
          <p>${CALAFAT_ROUTE_TEXT}</p>
          <div class="link-row"><a class="small-btn secondary" target="_blank" rel="noopener" href="${CALAFAT_ROUTE_URL}">Calafat-Route öffnen</a></div>
        </div>
      </div>
    `;

    if (title && title.nextSibling) routePanel.insertBefore(note, title.nextSibling);
    else routePanel.prepend(note);
  }

  function patchRouteCards() {
    const routeList = document.getElementById("routeList");
    if (!routeList) return;

    Array.from(routeList.querySelectorAll(".card")).forEach(card => {
      const h3 = card.querySelector("h3");
      if (!h3) return;

      if (h3.textContent.includes("Rumänien") || h3.textContent.includes("Calafat") || h3.textContent.includes("Vidin")) {
        if (h3.textContent.includes("Rumänien") || h3.textContent.includes("Calafat")) {
          h3.textContent = "Rumänien → Bulgarien: Giurgiu–Ruse oder Calafat–Vidin";
          const ps = card.querySelectorAll("p");
          if (ps[0]) ps[0].textContent = "Für Hamzabeyli / Lesovo beide Brücken im Navi prüfen. Giurgiu–Ruse ist jetzt als Hauptvariante, Calafat–Vidin als zweite Variante gespeichert.";
          if (ps[1]) ps[1].textContent = "Rumänien Rovinieta · Brückenmaut Giurgiu–Ruse oder Calafat–Vidin";
          const links = card.querySelectorAll("a[href]");
          if (links[0]) links[0].href = "https://www.google.com/maps/dir/N%C4%83dlac/Giurgiu/Ruse/";
          if (links[1]) links[1].href = "https://www.google.com/maps/dir/Ruse/Giurgiu/N%C4%83dlac/";
        }
      }

      if ((h3.textContent.includes("Vidin") && h3.textContent.includes("Kap")) || h3.textContent.includes("Sofia/Plovdiv")) {
        h3.textContent = "Bulgarien → Hamzabeyli / Lesovo";
        const ps = card.querySelectorAll("p");
        if (ps[0]) ps[0].textContent = "Von Ruse oder Vidin weiter Richtung Hamzabeyli / Lesovo. Ziel-Grenze bleibt Hamzabeyli, nicht Kapıkule.";
        if (ps[1]) ps[1].textContent = "Bulgarien E-Vignette · Grenze Lesovo/Hamzabeyli";
        const links = card.querySelectorAll("a[href]");
        if (links[0]) links[0].href = "https://www.google.com/maps/dir/Ruse/Veliko+Tarnovo/Lesovo/Hamzabeyli/";
        if (links[1]) links[1].href = "https://www.google.com/maps/dir/Hamzabeyli/Lesovo/Veliko+Tarnovo/Ruse/";
      }

      if (h3.textContent.includes("Kap") && h3.textContent.includes("Izmir")) {
        h3.textContent = "Hamzabeyli → İzmir";
        const ps = card.querySelectorAll("p");
        if (ps[0]) ps[0].textContent = "Türkei-Strecke ab Hamzabeyli bis İzmir. HGS/Autobahnmaut und Pausen einplanen.";
        if (ps[1]) ps[1].textContent = "Türkei HGS / Otoyol / Brücken je nach Strecke";
        const links = card.querySelectorAll("a[href]");
        if (links[0]) links[0].href = "https://www.google.com/maps/dir/Hamzabeyli/%C4%B0zmir/";
        if (links[1]) links[1].href = "https://www.google.com/maps/dir/%C4%B0zmir/Hamzabeyli/";
      }
    });
  }

  function patchBorders() {
    const borders = document.getElementById("grenzen");
    if (!borders) return;

    Array.from(borders.querySelectorAll(".card")).forEach(card => {
      const h3 = card.querySelector("h3");
      if (!h3) return;

      if (h3.textContent.includes("Kapıkule")) {
        h3.textContent = "🇧🇬 → 🇹🇷 Hamzabeyli / Lesovo";
        setFirstParagraph(card, "Geplante Grenze Richtung Türkei. In beiden Rumänien/Bulgarien-Varianten bleibt das Ziel Hamzabeyli / Lesovo.");
        setMapLink(card, "https://www.google.com/maps/search/Hamzabeyli+Lesovo+Border+Gate/");
      } else if (h3.textContent.includes("Hamzabeyli")) {
        h3.textContent = "Alternative: Kapıkule / Kapitan Andreevo";
        setFirstParagraph(card, "Nur als echte Alternative speichern, falls Hamzabeyli/Lesovo laut Navi oder Wartezeit schlechter ist.");
        setMapLink(card, "https://www.google.com/maps/search/Kap%C4%B1kule+Kapitan+Andreevo+Border+Gate/");
      } else if (h3.textContent.includes("Calafat") || h3.textContent.includes("Vidin")) {
        h3.textContent = "🇷🇴 ↔ 🇧🇬 Brücken: Giurgiu–Ruse oder Calafat–Vidin";
        setFirstParagraph(card, "Für Hamzabeyli beide Brücken als Optionen speichern. Giurgiu–Ruse als Hauptvariante, Calafat–Vidin als zweite Variante. Brückenmaut extra einplanen.");
        setMapLink(card, "https://www.google.com/maps/search/Giurgiu+Ruse+Bridge/");
      }
    });
  }

  function patchRouteB() {
    const card = findCardByHeading("Route B");
    if (!card) return;
    setFirstParagraph(card, "Velbert → Österreich → Ungarn → Serbien → Bulgarien → Hamzabeyli / Lesovo → İzmir");
    setSecondParagraph(card, "Serbien bleibt eine separate Alternative. Unabhängig von Rumänien-Brücke oder Serbien bleibt die geplante Türkei-Grenze Hamzabeyli / Lesovo.");
    setMapLink(card, "https://www.google.com/maps/dir/Velbert/Passau/Budapest/Belgrade/Sofia/Lesovo/Hamzabeyli/%C4%B0zmir/");
  }

  function patchChecklist() {
    document.querySelectorAll(".check-item span").forEach(span => {
      if (span.textContent.includes("Calafat") && span.textContent.includes("Vidin")) {
        span.textContent = "Giurgiu–Ruse und Calafat–Vidin als Brückenoptionen speichern";
      }
      if (span.textContent.includes("Kapıkule") && span.textContent.includes("Hamzabeyli")) {
        span.textContent = "Hamzabeyli/Lesovo als Zielgrenze speichern; Kapıkule nur als Alternative";
      }
    });
  }

  function patchAll() {
    addStyles();
    patchStartCard();
    patchRouteInfo();
    patchRouteCards();
    patchRouteB();
    patchBorders();
    patchChecklist();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patchAll);
  } else {
    patchAll();
  }

  setTimeout(patchAll, 300);
  setTimeout(patchAll, 1000);
})();
