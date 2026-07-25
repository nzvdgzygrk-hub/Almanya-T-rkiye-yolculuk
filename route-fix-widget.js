(() => {
  const MAIN_ROUTE_TEXT = "Velbert → Passau → Ungarn → Rumänien → Calafat–Vidin → Bulgarien → Hamzabeyli / Lesovo → İzmir";
  const MAIN_ROUTE_URL = "https://www.google.com/maps/dir/Velbert/Passau/N%C4%83dlac/Calafat/Vidin/Lesovo/Hamzabeyli/%C4%B0zmir/";
  const RUSE_ALT_URL = "https://www.google.com/maps/dir/N%C4%83dlac/Giurgiu/Ruse/Lesovo/Hamzabeyli/%C4%B0zmir/";

  function addStyles() {
    if (document.getElementById("routeFixStyles")) return;
    const style = document.createElement("style");
    style.id = "routeFixStyles";
    style.textContent = `
      .route-fix-note{border:1px solid #bfdbfe;background:#eff6ff;color:#1e3a8a;border-radius:16px;padding:12px;margin-bottom:12px}.route-fix-note strong{display:block;margin-bottom:4px}.route-fix-note .link-row{margin-top:10px}
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
    setFirstParagraph(card, `<strong>${MAIN_ROUTE_TEXT}</strong>`);
    setSecondParagraph(card, "Standard ist jetzt Hamzabeyli / Lesovo. Brücke Rumänien–Bulgarien: Calafat–Vidin. Ruse/Giurgiu bleibt nur als Ausweichroute, wenn Navi oder Stau deutlich besser ist.");
    setMapLink(card, MAIN_ROUTE_URL);
  }

  function patchRouteInfo() {
    const routePanel = document.getElementById("route");
    if (!routePanel || document.getElementById("hamzabeyliRouteNote")) return;

    const title = routePanel.querySelector(".section-title");
    const note = document.createElement("div");
    note.id = "hamzabeyliRouteNote";
    note.className = "route-fix-note";
    note.innerHTML = `
      <strong>Aktuelle Standardroute</strong>
      ${MAIN_ROUTE_TEXT}<br>
      <span>Richtige Standardbrücke: <b>Calafat–Vidin</b>. Alternative Brücke: <b>Giurgiu–Ruse</b> nur prüfen, wenn Calafat–Vidin Stau/Sperrung hat.</span>
      <div class="link-row">
        <a class="small-btn" target="_blank" rel="noopener" href="${MAIN_ROUTE_URL}">Standardroute öffnen</a>
        <a class="small-btn secondary" target="_blank" rel="noopener" href="${RUSE_ALT_URL}">Ruse-Alternative öffnen</a>
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

      if (h3.textContent.includes("Vidin") && h3.textContent.includes("Kap")) {
        h3.textContent = "Vidin → Sofia/Plovdiv → Hamzabeyli / Lesovo";
        const ps = card.querySelectorAll("p");
        if (ps[0]) ps[0].textContent = "Bulgarien Richtung Türkei. Ziel-Grenze ist Hamzabeyli / Lesovo, nicht Kapıkule.";
        if (ps[1]) ps[1].textContent = "Bulgarien E-Vignette · Grenze Lesovo/Hamzabeyli";
        const links = card.querySelectorAll("a[href]");
        if (links[0]) links[0].href = "https://www.google.com/maps/dir/Vidin/Sofia/Plovdiv/Lesovo/Hamzabeyli/";
        if (links[1]) links[1].href = "https://www.google.com/maps/dir/Hamzabeyli/Lesovo/Plovdiv/Sofia/Vidin/";
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
        setFirstParagraph(card, "Geplante Hauptgrenze Richtung Türkei. Für deine Route als Standard speichern.");
        setMapLink(card, "https://www.google.com/maps/search/Hamzabeyli+Lesovo+Border+Gate/");
      } else if (h3.textContent.includes("Hamzabeyli")) {
        h3.textContent = "Alternative: Kapıkule / Kapitan Andreevo";
        setFirstParagraph(card, "Nur als Alternative speichern, falls Hamzabeyli/Lesovo laut Navi oder Wartezeit schlechter ist.");
        setMapLink(card, "https://www.google.com/maps/search/Kap%C4%B1kule+Kapitan+Andreevo+Border+Gate/");
      } else if (h3.textContent.includes("Calafat") || h3.textContent.includes("Vidin")) {
        h3.textContent = "🇷🇴 ↔ 🇧🇬 Calafat–Vidin Brücke";
        setFirstParagraph(card, "Richtige Standardbrücke zwischen Rumänien und Bulgarien für deine Route. Brückenmaut extra einplanen.");
        setMapLink(card, "https://www.google.com/maps/search/Calafat+Vidin+Bridge/");
      }
    });
  }

  function patchRouteB() {
    const card = findCardByHeading("Route B");
    if (!card) return;
    setFirstParagraph(card, "Velbert → Österreich → Ungarn → Serbien → Bulgarien → Hamzabeyli / Lesovo → İzmir");
    setSecondParagraph(card, "Serbien bleibt nur Alternative. Für unsere Standardroute bleibt Rumänien mit Calafat–Vidin und danach Hamzabeyli/Lesovo eingetragen.");
    setMapLink(card, "https://www.google.com/maps/dir/Velbert/Passau/Budapest/Belgrade/Sofia/Lesovo/Hamzabeyli/%C4%B0zmir/");
  }

  function patchChecklist() {
    document.querySelectorAll(".check-item span").forEach(span => {
      if (span.textContent.includes("Kapıkule") && span.textContent.includes("Hamzabeyli")) {
        span.textContent = "Hamzabeyli/Lesovo als Hauptgrenze und Kapıkule als Alternative im Navi speichern";
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
