(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');

        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('open');
            });
        }

        setupHero();
        setupFiltering();
        setupPlayers();
    });

    function setupHero() {
        var hero = document.querySelector('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFiltering() {
        var urlQuery = new URLSearchParams(window.location.search).get('q') || '';
        var searchInput = document.querySelector('[data-search-input]');
        var filterInput = document.querySelector('[data-filter-input]') || searchInput;
        var list = document.querySelector('[data-filter-list]');
        var empty = document.querySelector('[data-no-results]');

        if (searchInput && urlQuery) {
            searchInput.value = urlQuery;
        }

        if (!filterInput || !list) {
            return;
        }

        if (!filterInput.value && urlQuery) {
            filterInput.value = urlQuery;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

        function applyFilter() {
            var query = String(filterInput.value || '').trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = String(card.getAttribute('data-search') || '').toLowerCase();
                var matched = !query || haystack.indexOf(query) !== -1;

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        filterInput.addEventListener('input', applyFilter);
        applyFilter();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        players.forEach(function (player) {
            var video = player.querySelector('video');
            var cover = player.querySelector('.player-cover');
            var source = player.getAttribute('data-source');
            var isReady = false;

            if (!video || !source) {
                return;
            }

            function prepare() {
                if (isReady) {
                    return;
                }

                isReady = true;
                player.classList.add('is-ready');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });

                    hls.loadSource(source);
                    hls.attachMedia(video);
                    return;
                }

                video.src = source;
            }

            function play() {
                prepare();

                if (cover) {
                    cover.classList.add('hidden');
                }

                player.classList.add('is-playing');

                var promise = video.play();

                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        player.classList.remove('is-playing');
                    });
                }
            }

            if (cover) {
                cover.addEventListener('click', play);
            }

            video.addEventListener('play', function () {
                player.classList.add('is-playing');

                if (cover) {
                    cover.classList.add('hidden');
                }
            });

            video.addEventListener('pause', function () {
                if (!video.ended) {
                    player.classList.remove('is-playing');
                }
            });
        });

        Array.prototype.slice.call(document.querySelectorAll('[data-start-player]')).forEach(function (button) {
            button.addEventListener('click', function () {
                var selector = button.getAttribute('data-start-player');
                var target = selector ? document.querySelector(selector) : null;
                var cover = target ? target.querySelector('.player-cover') : null;

                if (cover) {
                    cover.click();
                }
            });
        });
    }
})();
