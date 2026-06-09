(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-main-nav]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-search-input]');

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));

    function applySearch() {
      var keyword = searchInput.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        card.classList.toggle('is-hidden-by-search', keyword !== '' && text.indexOf(keyword) === -1);
      });
    }

    if (initialKeyword) {
      searchInput.value = initialKeyword;
    }

    searchInput.addEventListener('input', applySearch);
    applySearch();
  }

  function initPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.play-overlay');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-hls-source');
    var hasLoaded = false;
    var hlsInstance = null;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function loadSource() {
      if (hasLoaded || !source) {
        return;
      }

      hasLoaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          lowLatencyMode: true,
          enableWorker: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        window.__activeHlsPlayer = hlsInstance;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      loadSource();
      hideOverlay();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target === video && video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
})();
