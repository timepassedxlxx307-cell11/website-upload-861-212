(function () {
  var html = document.documentElement;
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-fail');
    }, { once: true });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    show(0);
    restart();
  });

  var searchLayer = document.querySelector('[data-search-layer]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var headerSearch = document.querySelector('[data-header-search]');
  var closeSearch = document.querySelector('[data-search-close]');

  function movieText(movie) {
    return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
  }

  function renderSearch(query) {
    if (!searchResults) {
      return;
    }
    var keyword = String(query || '').trim().toLowerCase();
    if (!keyword) {
      searchResults.innerHTML = '<div class="empty-text">输入片名、类型、地区或标签开始搜索</div>';
      return;
    }
    var data = window.siteMovies || [];
    var matches = data.filter(function (movie) {
      return movieText(movie).indexOf(keyword) !== -1;
    }).slice(0, 36);
    if (!matches.length) {
      searchResults.innerHTML = '<div class="empty-text">没有找到匹配影片</div>';
      return;
    }
    searchResults.innerHTML = matches.map(function (movie) {
      return '<a class="search-result" href="' + movie.url + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">' +
        '<div><h3>' + escapeHtml(movie.title) + '</h3>' +
        '<p>' + escapeHtml([movie.region, movie.type, movie.year, movie.genre].filter(Boolean).join(' · ')) + '</p>' +
        '<p>' + escapeHtml(movie.oneLine || '') + '</p></div></a>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char];
    });
  }

  function openSearch(value) {
    if (!searchLayer || !searchInput) {
      return;
    }
    searchLayer.classList.add('is-open');
    html.style.overflow = 'hidden';
    searchInput.value = value || '';
    renderSearch(searchInput.value);
    window.setTimeout(function () {
      searchInput.focus();
    }, 30);
  }

  function hideSearch() {
    if (!searchLayer) {
      return;
    }
    searchLayer.classList.remove('is-open');
    html.style.overflow = '';
  }

  if (headerSearch) {
    headerSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = headerSearch.querySelector('input');
      openSearch(input ? input.value : '');
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }

  if (closeSearch) {
    closeSearch.addEventListener('click', hideSearch);
  }

  if (searchLayer) {
    searchLayer.addEventListener('click', function (event) {
      if (event.target === searchLayer) {
        hideSearch();
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      hideSearch();
    }
  });

  document.querySelectorAll('[data-player-wrap]').forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var overlay = wrap.querySelector('[data-play-overlay]');
    var message = wrap.querySelector('[data-player-message]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-video-url');

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add('is-show');
    }

    function preparePlayer() {
      if (!source) {
        showMessage('视频暂时无法加载');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            showMessage('网络波动，正在重新连接');
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            showMessage('播放恢复中');
            hls.recoverMediaError();
            return;
          }
          showMessage('视频暂时无法播放');
        });
        window.addEventListener('beforeunload', function () {
          hls.destroy();
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      showMessage('视频暂时无法播放');
    }

    function playVideo() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    preparePlayer();

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
  });
})();
