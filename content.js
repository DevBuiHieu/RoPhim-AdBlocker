(() => {
  const PATTERN = /finallygotthexds\.site/i;

  const looksBad = (el) => {
    const attrs = [
      el.src, el.href, el.poster,
      el.getAttribute && el.getAttribute('data-src'),
      el.style && el.style.backgroundImage
    ].filter(Boolean).join(' ');
    if (PATTERN.test(attrs)) return true;
    const txt = (el.textContent || '').slice(0, 2048);
    return PATTERN.test(txt);
  };

  const nuke = (el) => {
    let t = el;
    for (let i = 0; i < 2 && t.parentElement; i++) {
      const p = t.parentElement;
      if (p.childElementCount <= 3) t = p; else break;
    }
    t.remove();
  };

  const sweep = (root = document) => {
    root.querySelectorAll('iframe,img,a,video,source,link,script,div,span,section,aside')
      .forEach(el => { if (looksBad(el)) nuke(el); });
  };

  sweep();
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === "childList") {
        m.addedNodes.forEach(n => {
          if (n.nodeType === 1) { if (looksBad(n)) nuke(n); else sweep(n); }
        });
      } else if (m.type === "attributes") {
        if (looksBad(m.target)) nuke(m.target);
      }
    }
  }).observe(document.documentElement, {
    childList: true, subtree: true,
    attributes: true,
    attributeFilter: ["src","href","style","data-src","poster"]
  });
})();
