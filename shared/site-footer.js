(() => {
  const links = [
    ['崇德佛堂', 'https://goo.gl/maps/7QVdJd5FW6d8qXs36'],
    ['Facebook', 'https://www.facebook.com/%E5%B4%87%E5%BE%B7%E4%BB%81%E7%BE%A9-101054105533181/'],
    ['崇德仁義講堂 YouTube', 'https://www.youtube.com/c/%E5%B4%87%E5%BE%B7%E4%BB%81%E7%BE%A9%E8%AC%9B%E5%A0%82-fycd-%E4%BB%81%E7%BE%A9%E5%A4%A7%E4%BB%99'],
    ['台中中興書城', 'https://www.fycd.tw/books/'],
    ['台大藏書', 'https://ntu.primo.exlibrisgroup.com/discovery/fulldisplay?docid=alma991011128109704786&context=L&vid=886NTU_INST%3A886NTU_INST&lang=zh-tw&search_scope=MyInstitution&adaptor=Local%20Search%20Engine&tab=LibraryCatalog&query=any%2Ccontains%2C%E6%96%B9%E5%90%B3%E6%85%B6&offset=0'],
  ];

  const footer = document.createElement('footer');
  footer.className = 'site-related-footer';
  const inner = document.createElement('div');
  inner.className = 'site-related-footer-inner';
  const heading = document.createElement('div');
  heading.className = 'site-related-footer-heading';
  const title = document.createElement('strong');
  title.textContent = '崇德仁義';
  const subtitle = document.createElement('p');
  subtitle.textContent = '傳承仁義精神 · 留存珍貴記憶';
  heading.append(title, subtitle);

  const linkArea = document.createElement('div');
  linkArea.className = 'site-related-links';
  linkArea.setAttribute('role', 'navigation');
  linkArea.setAttribute('aria-label', '相關連結');
  links.forEach(([label, href]) => {
    const link = document.createElement('a');
    link.className = 'site-related-link';
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = label;
    linkArea.append(link);
  });

  const note = document.createElement('p');
  note.className = 'site-related-footer-note';
  note.textContent = '仁義紀念 · 經典典藏 · 永續傳承';
  inner.append(heading, linkArea, note);
  footer.append(inner);
  document.querySelectorAll('footer').forEach(existing => existing.remove());
  document.body.classList.add('has-site-related-footer');
  document.body.append(footer);
})();
