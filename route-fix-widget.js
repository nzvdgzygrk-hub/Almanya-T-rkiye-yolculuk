(() => {
  const BRIDGE_STORAGE_KEY = "turkiye-bridge-choice";

  const bridgeRoutes = {
    ruse: {
      label: "Giurgiu–Ruse",
      forward: "https://www.google.com/maps/dir/N%C4%83dlac/Giurgiu/Ruse/",
      backward: "https://www.google.com/maps/dir/Ruse/Giurgiu/N%C4%83dlac/"
    },
    calafat: {
      label: "Calafat–Vidin",
      forward: "https://www.google.com/maps/dir/N%C4%83dlac/Calafat/Vidin/",
      backward: "https://www.google.com/maps/dir/Vidin/Calafat/N%C4%83dlac/"
    }
  };

  const MAIN_FORWARD = "https://www.google.com/maps/dir/Velbert/Passau/N%C4%83dlac/Giurgiu/Ruse/Lesovo/Hamzabeyli/%C4%B0zmir/";
  const MAIN_BACKWARD = "https://www.google.com/maps/dir/%C4%B0zmir/Hamzabeyli/Lesovo/Ruse/Giurgiu/N%C4%83dlac/Passau/Velbert/";
  const SERBIA_FORWARD = "https://www.google.com/maps/dir/Velbert/Passau/Budapest/Belgrade/Sofia/Lesovo/Hamzabeyli/%C4%B0zmir/";
  const SERBIA_BACKWARD = "https://www.google.com/maps/dir/%C4%B0zmir/Hamzabeyli/Lesovo/Sofia/Belgrade/Budapest/Passau/Velbert/";
  const BULGARIA_FORWARD = "https://www.google.com/maps/dir/Ruse/Veliko+Tarnovo/Lesovo/Hamzabeyli/";
  const BULGARIA_BACKWARD = "https://www.google.com/maps/dir/Hamzabeyli/Lesovo/Veliko+Tarnovo/Ruse/";

  function addStyles() {
    if (document.getElementById("routeFixStyles")) return;

    const style = document.createElement("style");
    style.id = "routeFixStyles";
    style.textContent = `
      .bridge-switch{border:1px solid #dbeafe;background:#eff6ff;border-radius:16px;padding:12px;margin-top:10px}
      .bridge-switch-title{font-weight:900;color:#1e3a8a;margin-bottom:8px}
      .bridge-toggle{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}
      .bridge-toggle button{border:1px solid #bfdbfe;background:#fff;color:#1e3a8a;border-radius:12px;padding:10px;font-weight:900;cursor:pointer}
      .bridge-toggle button.active{background:#1d4ed8;color:#fff;border-color:#1d4ed8}
      .bridge-selected{font-weight:800;margin:8px 0;color:#1f2937}
      .bridge-actions{display:flex;flex-wrap:wrap;gap:8px}
      .bridge-hint{font-size:.9rem;color:#6b7280;margin-top:8px}
      .start-route-alt{margin-top:12px}
      @media(max-width:520px){.bridge-toggle{grid-template-columns:1fr}.bridge-actions a{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function findCard(container, headingText) {
    if (!container) return null;
    return Array.from(container.querySelectorAll(".card")).find(card => {
      const heading = card.querySelector("h3");
      return heading && heading.textContent.includes(headingText);
    }) || null;
  }

  function setCardText(card, title, text, mutedText) {
    if (!card) return;
    const heading = card.querySelector("h3");
    const paragraphs = card.querySelectorAll("p");
    if (heading) heading.textContent = title;
    if (paragraphs[0]) paragraphs[0].textContent = text;
    if (paragraphs[1]) paragraphs[1].textContent = mutedText;
  }

  function setLinks(card, links, useLargeButtons = false) {
    if (!card) return;
    const row = card.querySelector(".link-row");
    if (!row) return;
    const baseClass = useLargeButtons ? "btn" : "small-btn";
    row.innerHTML = links.map(link => `
      <a class="${baseClass} ${link.secondary ? "secondary" : ""}" target="_blank" rel="noopener" href="${link.href}">${link.label}</a>
    `).join("");
  }

  function removeOldPlanningBox() {
    document.querySelectorAll("#hamzabeyliRouteNote,.route-fix-note").forEach(element => element.remove());
  }

  function patchStartPage() {
    const startPanel = document.getElementById("start");
    if (!startPanel) return;

    const mainCard = findCard(startPanel, "Hauptstrecke");
    if (!mainCard) return;

    const mainParagraphs = mainCard.querySelectorAll("p");
    if (mainParagraphs[0]) {
      mainParagraphs[0].innerHTML = "<strong>Velbert → Passau → Ungarn → Rumänien → Giurgiu–Ruse → Bulgarien → Hamzabeyli / Lesovo → İzmir</strong>";
    }
    if (mainParagraphs[1]) {
      mainParagraphs[1].textContent = "Komplette Hauptstrecke. Die einzelnen Abschnitte und die Brückenwahl findest du im Route-Tab.";
    }
    setLinks(mainCard, [
      { label: "Hauptstrecke öffnen", href: MAIN_FORWARD },
      { label: "Rückfahrt öffnen", href: MAIN_BACKWARD, secondary: true }
    ], true);

    let alternativeCard = document.getElementById("startSerbiaAlternative");
    if (!alternativeCard) {
      alternativeCard = document.createElement("div");
      alternativeCard.id = "startSerbiaAlternative";
      alternativeCard.className = "card start-route-alt";
      mainCard.insertAdjacentElement("afterend", alternativeCard);
    }

    alternativeCard.innerHTML = `
      <h3>🛣️ Alternative über Serbien</h3>
      <p><strong>Velbert → Österreich → Ungarn → Serbien → Bulgarien → Hamzabeyli / Lesovo → İzmir</strong></p>
      <p class="muted">Alternative Gesamtstrecke über Serbien.</p>
      <div class="link-row">
        <a class="btn secondary" target="_blank" rel="noopener" href="${SERBIA_FORWARD}">Serbien-Hinweg</a>
        <a class="btn secondary" target="_blank" rel="noopener" href="${SERBIA_BACKWARD}">Serbien-Rückweg</a>
      </div>
    `;
  }

  function removeRouteBFromRouteTab() {
    const routePanel = document.getElementById("route");
    const routeBCard = findCard(routePanel, "Route B");
    if (routeBCard) routeBCard.remove();
  }

  function patchBridgeCard() {
    const routeList = document.getElementById("routeList");
    const bridgeCard = findCard(routeList, "Rumänien → Bulgarien");
    if (!bridgeCard) return;

    setCardText(
      bridgeCard,
      "Rumänien → Bulgarien: Brücke auswählen",
      "Wähle die gewünschte Brücke. Google Maps öffnet nur diesen einzelnen Abschnitt.",
      "Rumänien Rovinieta · Brückenmaut je nach Auswahl"
    );

    const row = bridgeCard.querySelector(".link-row");
    if (!row) return;

    row.innerHTML = `
      <div class="bridge-switch">
        <div class="bridge-switch-title">Brücke wählen</div>
        <div class="bridge-toggle">
          <button type="button" data-bridge="ruse">Giurgiu–Ruse</button>
          <button type="button" data-bridge="calafat">Calafat–Vidin</button>
        </div>
        <div class="bridge-selected" id="bridgeSelectedText"></div>
        <div class="bridge-actions">
          <a class="small-btn" id="bridgeForward" target="_blank" rel="noopener">Hinweg öffnen</a>
          <a class="small-btn secondary" id="bridgeBackward" target="_blank" rel="noopener">Rückweg öffnen</a>
        </div>
        <div class="bridge-hint">Die Auswahl wird auf diesem Gerät gespeichert.</div>
      </div>
    `;

    function applyBridge(choice) {
      const selected = bridgeRoutes[choice] ? choice : "ruse";
      const route = bridgeRoutes[selected];
      localStorage.setItem(BRIDGE_STORAGE_KEY, selected);

      bridgeCard.querySelectorAll("[data-bridge]").forEach(button => {
        button.classList.toggle("active", button.dataset.bridge === selected);
      });

      const selectedText = bridgeCard.querySelector("#bridgeSelectedText");
      const forwardLink = bridgeCard.querySelector("#bridgeForward");
      const backwardLink = bridgeCard.querySelector("#bridgeBackward");
      if (selectedText) selectedText.textContent = `Aktuell gewählt: ${route.label}`;
      if (forwardLink) forwardLink.href = route.forward;
      if (backwardLink) backwardLink.href = route.backward;
    }

    bridgeCard.querySelectorAll("[data-bridge]").forEach(button => {
      button.addEventListener("click", () => applyBridge(button.dataset.bridge));
    });

    applyBridge(localStorage.getItem(BRIDGE_STORAGE_KEY) || "ruse");
  }

  function patchBulgariaCard() {
    const routeList = document.getElementById("routeList");
    const card = findCard(routeList, "Bulgarien → Hamzabeyli");
    if (!card) return;

    setCardText(
      card,
      "Bulgarien → Hamzabeyli / Lesovo",
      "Google Maps öffnet den Abschnitt ab Ruse Richtung Lesovo/Hamzabeyli. Den Startpunkt kannst du in Maps bei Bedarf ändern.",
      "Bulgarien E-Vignette · Grenze Lesovo/Hamzabeyli"
    );

    setLinks(card, [
      { label: "Hinweg ab Ruse", href: BULGARIA_FORWARD },
      { label: "Rückweg nach Ruse", href: BULGARIA_BACKWARD, secondary: true }
    ]);
  }

  function patchTurkeyCard() {
    const routeList = document.getElementById("routeList");
    const card = findCard(routeList, "Hamzabeyli → İzmir");
    if (!card) return;

    setCardText(
      card,
      "Hamzabeyli → İzmir",
      "Türkei-Strecke ab Hamzabeyli bis İzmir. HGS/Autobahnmaut und Pausen einplanen.",
      "Türkei HGS / Otoyol / Brücken je nach Strecke"
    );

    setLinks(card, [
      { label: "Hinweg", href: "https://www.google.com/maps/dir/Hamzabeyli/%C4%B0zmir/" },
      { label: "Rückweg", href: "https://www.google.com/maps/dir/%C4%B0zmir/Hamzabeyli/", secondary: true }
    ]);
  }

  function patchAll() {
    addStyles();
    removeOldPlanningBox();
    patchStartPage();
    removeRouteBFromRouteTab();
    patchBridgeCard();
    patchBulgariaCard();
    patchTurkeyCard();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patchAll, { once: true });
  } else {
    patchAll();
  }

  setTimeout(patchAll, 500);
})();
