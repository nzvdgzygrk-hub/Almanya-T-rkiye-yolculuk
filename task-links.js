(() => {
  const YPTI_URL = "https://ypti.ticaret.gov.tr";

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

  function init() {
    attachTaskLink();
    const observer = new MutationObserver(attachTaskLink);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
