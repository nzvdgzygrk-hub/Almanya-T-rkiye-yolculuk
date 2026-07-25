(() => {
  const routes = {
    ruse: {
      label: "Giurgiu–Ruse",
      map: "https://www.google.com/maps/dir/N%C4%83dlac/Giurgiu/Ruse/",
      back: "https://www.google.com/maps/dir/Ruse/Giurgiu/N%C4%83dlac/",
      bg: "https://www.google.com/maps/dir/Ruse/Veliko+Tarnovo/Lesovo/Hamzabeyli/",
      bgBack: "https://www.google.com/maps/dir/Hamzabeyli/Lesovo/Veliko+Tarnovo/Ruse/"
    },
    calafat: {
      label: "Calafat–Vidin",
      map: "https://www.google.com/maps/dir/N%C4%83dlac/Calafat/Vidin/",
      back: "https://www.google.com/maps/dir/Vidin/Calafat/N%C4%83dlac/",
      bg: "https://www.google.com/maps/dir/Vidin/Sofia/Plovdiv/Lesovo/Hamzabeyli/",
      bgBack: "https://www.google.com/maps/dir/Hamzabeyli/Lesovo/Plovdiv/Sofia/Vidin/"
    }
  };

  function addStyles() {
    if (document.getElementById("routeFixStyles")) return;
    const style = document.createElement("style");
    style.id = "routeFixStyles";
    style.textContent = `
      .bridge-switch{border:1px solid #dbeafe;background:#eff6ff;border-radius:16px;padding:12px;margin-top:10px}.bridge-switch-title{font-weight:900;color:#1e3a8a;margin-bottom:8px}.bridge-toggle{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}.bridge-toggle button{border:1px solid #bfdbfe;background:#fff;color:#1e3a8a;border-radius:12px;padding:10px;font-weight:900}.bridge-toggle button.active{background:#1d4ed8;color:#fff;border-color:#1d4ed8}.bridge-selected{font-weight:800;margin:8px 0;color:#1f2937}.bridge-actions{display:flex;flex-wrap:wrap;gap:8px}.bridge-actions a{min-width:130px}.bridge-hint{font-size:.9rem;color:#6b7280;margin-top:8px}@media(max-width:520px){.bridge-toggle{grid-template-columns:1fr}.bridge-actions a{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function routeCards() {
    const list = document.getElementById("routeList");
    return list ? Array.from(list.querySelectorAll(".card")) : [];
  }

  function setText(card, title, text, toll) {
    if (!card) return;
    const h3 = card.querySelector("h3");
    const ps = card.querySelectorAll("p");
    if (h3) h3.textContent = title;
    if (ps[0]) ps[0].textContent = text;
    if (ps[1]) ps[1].textContent = toll;
  }

  function setLinks(card, links) {
    if (!card) return;
    const row = card.querySelector(".link-row");
    if (!row) return;
    row.innerHTML = links.map(link => `<a class="small-btn ${link.secondary ? "secondary" : ""}" target="_blank" rel="noopener" href="${link.href}">${link.label}</a>`).join("");
  }

  function removeOldPlanningBox() {
    document.querySelectorAll("#hamzabeyliRouteNote,.route-fix-note").forEach(el => el.remove());
  }

  function patchStartPage() {
    const card = Array.from(document.querySelectorAll(".card")).find(c => c.querySelector("h3")?.textContent.includes("Hauptstrecke"));
    if (!card) return;
    const ps = card.querySelectorAll("p");
    if (ps[0]) ps[0].innerHTML = "<strong>Velbert → Passau → Ungarn → Rumänien → Giurgiu–Ruse → Bulgarien → Hamzabeyli / Lesovo → İzmir</strong>";
    if (ps[1]) ps[1].textContent = "Komplette Hauptstrecke. Im Route-Tab sind die Abschnitte einzeln aufgeteilt.";
    const link = card.querySelector("a[href]");
    if (link) link.href = "https://www.google.com/maps/dir/Velbert/Passau/N%C4%83dlac/Giurgiu/Ruse/Lesovo/Hamzabeyli/%C4%B0zmir/";
  }

  function patchRouteB() {
    const card = Array.from(document.querySelectorAll(".card")).find(c => c.querySelector("h3")?.textContent.includes("Route B"));
    if (!card) return;
    const ps = card.querySelectorAll("p");
    if (ps[0]) ps[0].textContent = "Velbert → Österreich → Ungarn → Serbien → Bulgarien → Hamzabeyli / Lesovo → İzmir";
    if (ps[1]) ps[1].textContent = "Alternative Gesamtstrecke über Serbien. Nur prüfen, wenn du diese Route wirklich fahren willst.";
    const link = card.querySelector("a[href]");
    if (link) link.href = "https://www.google.com/maps/dir/Velbert/Passau/Budapest/Belgrade/Sofia/Lesovo/Hamzabeyli/%C4%B0zmir/";
  }

  function patchBridgeCard() {
    const cards = routeCards();
    const bridgeCard = cards[2];
    if (!bridgeCard) return;

    setText(
      bridgeCard,
      "Rumänien → Bulgarien: Brücke auswählen",
      "Wähle hier die Brücke. Der Maps-Button öffnet nur diesen Abschnitt, keine komplette Gesamtstrecke.",
      "Rumänien Rovinieta · Brückenmaut je nach Auswahl"
    );

    let selected = localStorage.getItem("turkiye-bridge-choice") || "ruse";
    if (!routes[selected]) selected = "ruse";

    const oldRow = bridgeCard.querySelector(".link-row");
    if (oldRow) oldRow.innerHTML = `
      <div class="bridge-switch">
        <div class="bridge-switch-title">Brücke wählen</div>
        <div class="bridge-toggle">
          <button type="button" data-bridge="ruse">Giurgiu–Ruse</button>
          <button type="button" data-bridge="calafat">Calafat–Vidin</button>
        </div>
        <div class="bridge-selected" id="bridgeSelectedText"></div>
        <div class="bridge-actions">
          <a class="small-btn" id="bridgeMapForward" target="_blank" rel="noopener">Hinweg öffnen</a>
          <a class="small-btn secondary" id="bridgeMapBack" target="_blank" rel="noopener">Rückweg öffnen</a>
        </div>
        <div class="bridge-hint">Die Auswahl wird gespeichert und passt auch die Bulgarien-Karte darunter an.</div>
      </div>
    `;

    function apply(choice) {
      selected = choice;
      localStorage.setItem("turkiye-bridge-choice", selected);
      const data = routes[selected];
      bridgeCard.querySelectorAll("[data-bridge]").forEach(btn => btn.classList.toggle("active", btn.dataset.bridge === selected));
      const text = bridgeCard.querySelector("#bridgeSelectedText");
      const fwd = bridgeCard.querySelector("#bridgeMapForward");
      const back = bridgeCard.querySelector("#bridgeMapBack");
      if (text) text.textContent = `Aktuell gewählt: ${data.label}`;
      if (fwd) fwd.href = data.map;
      if (back) back.href = data.back;
      patchBulgariaCard(selected);
    }

    bridgeCard.querySelectorAll("[data-bridge]").forEach(btn => btn.addEventListener("click", () => apply(btn.dataset.bridge)));
    apply(selected);
  }

  function patchBulgariaCard(choice = localStorage.getItem("turkiye-bridge-choice") || "ruse") {
    const cards = routeCards();
    const card = cards[3];
    if (!card) return;
    const data = routes[choice] || routes.ruse;
    setText(
      card,
      "Bulgarien → Hamzabeyli / Lesovo",
      `Nach ${data.label} weiter durch Bulgarien Richtung Lesovo/Hamzabeyli. Das ist die geplante Türkei-Grenze, nicht Kapıkule.`,
      "Bulgarien E-Vignette · Grenze Lesovo/Hamzabeyli"
    );
    setLinks(card, [
      { label: "Hinweg", href: data.bg },
      { label: "Rückweg", href: data.bgBack, secondary: true }
    ]);
  }

  function patchTurkeyCard() {
    const cards = routeCards();
    const card = cards[4];
    if (!card) return;
    setText(card, "Hamzabeyli → İzmir", "Türkei-Strecke ab Hamzabeyli bis İzmir. HGS/Autobahnmaut und Pausen einplanen.", "Türkei HGS / Otoyol / Brücken je nach Strecke");
    setLinks(card, [
      { label: "Hinweg", href: "https://www.google.com/maps/dir/Hamzabeyli/%C4%B0zmir/" },
      { label: "Rückweg", href: "https://www.google.com/maps/dir/%C4%B0zmir/Hamzabeyli/", secondary: true }
    ]);
  }

  function patchChecklist() {
    document.querySelectorAll(".check-item span").forEach(span => {
      if (span.textContent.includes("Calafat") && span.textContent.includes("Vidin")) span.textContent = "Giurgiu–Ruse oder Calafat–Vidin als Brückenoption speichern";
      if (span.textContent.includes("Kapıkule") && span.textContent.includes("Hamzabeyli")) span.textContent = "Hamzabeyli/Lesovo als Zielgrenze speichern; Kapıkule nur als Alternative";
    });
  }

  function patchAll() {
    addStyles();
    removeOldPlanningBox();
    patchStartPage();
    patchRouteB();
    patchBridgeCard();
    patchTurkeyCard();
    patchChecklist();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", patchAll);
  else patchAll();
  setTimeout(patchAll, 300);
  setTimeout(patchAll, 1000);
})();
