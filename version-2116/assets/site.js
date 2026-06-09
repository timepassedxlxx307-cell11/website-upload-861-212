(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('.menu-toggle');
  var nav = qs('.main-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  qsa('.site-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = qs('input[type="search"]', form);
      if (!input) {
        return;
      }
      var value = input.value.trim();
      if (!value) {
        return;
      }
      event.preventDefault();
      window.location.href = './all-movies.html?q=' + encodeURIComponent(value);
    });
  });

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('.hero-slide', hero);
    var images = qsa('.hero-image', hero);
    var dots = qsa('.hero-dot', hero);
    var current = 0;
    var timer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      images.forEach(function (image, i) {
        image.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        showHero(i);
        startHero();
      });
    });

    startHero();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  qsa('[data-filter-scope]').forEach(function (panel) {
    var searchInput = qs('[data-filter-search]', panel);
    var clearButton = qs('[data-filter-clear]', panel);
    var chips = qsa('[data-filter-field]', panel);
    var selects = qsa('[data-filter-select]', panel);
    var list = qs('[data-movie-list]') || document;
    var cards = qsa('.movie-card', list);
    var state = { type: '', year: '', region: '', genre: '', q: '' };
    var urlQuery = new URLSearchParams(window.location.search).get('q') || '';

    if (searchInput && urlQuery) {
      searchInput.value = urlQuery;
      state.q = normalize(urlQuery);
    }

    function applyFilters() {
      state.q = normalize(searchInput ? searchInput.value : state.q);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var matchText = !state.q || text.indexOf(state.q) !== -1;
        var matchType = !state.type || normalize(card.getAttribute('data-type')) === normalize(state.type);
        var matchYear = !state.year || normalize(card.getAttribute('data-year')).indexOf(normalize(state.year)) !== -1;
        var matchRegion = !state.region || normalize(card.getAttribute('data-region')) === normalize(state.region);
        var matchGenre = !state.genre || normalize(card.getAttribute('data-genre')).indexOf(normalize(state.genre)) !== -1;
        card.classList.toggle('is-hidden', !(matchText && matchType && matchYear && matchRegion && matchGenre));
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var field = chip.getAttribute('data-filter-field');
        var value = chip.getAttribute('data-filter-value') || '';
        state[field] = value;
        chips.filter(function (item) {
          return item.getAttribute('data-filter-field') === field;
        }).forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        applyFilters();
      });
    });

    selects.forEach(function (select) {
      select.addEventListener('change', function () {
        state[select.getAttribute('data-filter-select')] = select.value;
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        state = { type: '', year: '', region: '', genre: '', q: '' };
        if (searchInput) {
          searchInput.value = '';
        }
        selects.forEach(function (select) {
          select.value = '';
        });
        chips.forEach(function (chip) {
          var empty = !chip.getAttribute('data-filter-value');
          chip.classList.toggle('is-active', empty);
        });
        applyFilters();
      });
    }

    applyFilters();
  });

  function activatePlayer(shell) {
    var video = qs('video', shell);
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var backup = video.getAttribute('data-backup');

    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
      shell.classList.add('is-playing');
    }

    if (window.SiteHls && window.SiteHls.isSupported && window.SiteHls.isSupported() && stream) {
      if (!video.siteHlsInstance) {
        video.siteHlsInstance = new window.SiteHls({ enableWorker: true });
        video.siteHlsInstance.loadSource(stream);
        video.siteHlsInstance.attachMedia(video);
        video.siteHlsInstance.on(window.SiteHls.Events.MANIFEST_PARSED, playVideo);
        video.siteHlsInstance.on(window.SiteHls.Events.ERROR, function (event, data) {
          if (data && data.fatal && backup) {
            video.src = backup;
            playVideo();
          }
        });
      } else {
        playVideo();
      }
      return;
    }

    if (stream && video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = stream;
      }
      playVideo();
      return;
    }

    if (backup && !video.src) {
      video.src = backup;
    }
    playVideo();
  }

  qsa('[data-player]').forEach(function (shell) {
    var button = qs('.player-start', shell);
    if (button) {
      button.addEventListener('click', function () {
        activatePlayer(shell);
      });
    }
    shell.addEventListener('dblclick', function () {
      activatePlayer(shell);
    });
  });
})();
