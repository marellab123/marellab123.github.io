/* Title search. Loads /search.json once, filters as you type.
   Supports ?q=term in the URL so searches can be linked. */
(function () {
  'use strict';
  var input = document.getElementById('search-input');
  var list = document.getElementById('search-results');
  var count = document.getElementById('search-count');
  var posts = [];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function highlight(text, terms) {
    var out = esc(text);
    terms.forEach(function (t) {
      if (!t) return;
      var re = new RegExp('(' + esc(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }

  function render() {
    var q = input.value.trim().toLowerCase();
    var terms = q.split(/\s+/).filter(Boolean);
    var hits = posts.filter(function (p) {
      var title = p.title.toLowerCase();
      return terms.every(function (t) { return title.indexOf(t) !== -1; });
    });
    list.innerHTML = hits.map(function (p) {
      return '<li><a href="' + esc(p.url) + '">' +
        '<div class="r-title">' + highlight(p.title, terms) + '</div>' +
        '<div class="r-meta">' + esc(p.date) + (p.tags && p.tags.length ? ' · ' + esc(p.tags.join(', ')) : '') + '</div>' +
        (p.excerpt ? '<div class="r-excerpt">' + esc(p.excerpt) + '</div>' : '') +
        '</a></li>';
    }).join('');
    count.textContent = q
      ? hits.length + (hits.length === 1 ? ' result' : ' results') + ' for “' + input.value.trim() + '”'
      : posts.length + (posts.length === 1 ? ' post' : ' posts');

    var url = new URL(window.location);
    q ? url.searchParams.set('q', input.value.trim()) : url.searchParams.delete('q');
    history.replaceState(null, '', url);
  }

  fetch(window.SEARCH_INDEX_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      posts = data;
      var q = new URLSearchParams(window.location.search).get('q');
      if (q) input.value = q;
      render();
    })
    .catch(function () { count.textContent = 'Could not load the search index.'; });

  input.addEventListener('input', render);
})();
