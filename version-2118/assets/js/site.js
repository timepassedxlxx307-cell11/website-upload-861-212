(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function text(value) {
        return String(value || '').toLowerCase();
    }

    function createNode(tag, className, content) {
        var node = document.createElement(tag);
        if (className) {
            node.className = className;
        }
        if (content !== undefined) {
            node.textContent = content;
        }
        return node;
    }

    function initNavigation() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"], input[type="search"]');
                var query = input ? input.value.trim() : '';
                var target = form.getAttribute('data-search-url') || 'search.html';
                if (query) {
                    window.location.href = target + '?q=' + encodeURIComponent(query);
                } else {
                    window.location.href = target;
                }
            });
        });
    }

    function initHeroCarousel() {
        var hero = document.querySelector('[data-hero-carousel]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dots] button'));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function reset(index) {
            window.clearInterval(timer);
            show(index);
            play();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                reset(index);
            });
        });

        play();
    }

    function initCategoryFilter() {
        var input = document.querySelector('[data-filter-input]');
        var list = document.querySelector('[data-filter-list]');
        var empty = document.querySelector('[data-filter-empty]');
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        input.addEventListener('input', function () {
            var query = text(input.value.trim());
            var visible = 0;
            cards.forEach(function (card) {
                var keywords = text(card.getAttribute('data-keywords'));
                var matched = !query || keywords.indexOf(query) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        });
    }

    function initPlayer() {
        var player = document.querySelector('[data-player]');
        if (!player) {
            return;
        }
        var source = player.getAttribute('data-src');
        var video = player.querySelector('video');
        var cover = player.querySelector('.player-cover');
        var button = player.querySelector('.play-trigger');
        var hasStarted = false;
        var hlsInstance = null;

        function start() {
            if (!source || !video || hasStarted) {
                if (video) {
                    video.play().catch(function () {});
                }
                return;
            }
            hasStarted = true;
            player.classList.add('is-playing');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal || !hlsInstance) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
                return;
            }
            video.src = source;
            video.play().catch(function () {});
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                start();
            });
        }
        if (cover) {
            cover.addEventListener('click', start);
        }
    }

    function movieCard(movie) {
        var card = createNode('a', 'movie-card poster-card');
        card.href = movie.path;

        var poster = createNode('div', 'poster-wrap');
        var image = createNode('img');
        image.src = movie.cover;
        image.alt = movie.title;
        image.loading = 'lazy';
        var badge = createNode('span', 'poster-badge', 'HD');
        poster.appendChild(image);
        poster.appendChild(badge);

        var body = createNode('div', 'card-body');
        var title = createNode('h3', '', movie.title);
        var meta = createNode('p', 'card-meta', movie.region + ' · ' + movie.type + ' · ' + movie.year);
        var desc = createNode('p', 'card-desc', movie.oneLine || '');
        body.appendChild(title);
        body.appendChild(meta);
        body.appendChild(desc);

        card.appendChild(poster);
        card.appendChild(body);
        return card;
    }

    function runSearch(query) {
        var data = window.MOVIE_SEARCH_INDEX || [];
        var results = document.getElementById('search-results');
        var empty = document.getElementById('search-empty');
        var title = document.getElementById('search-title');
        if (!results) {
            return;
        }
        results.innerHTML = '';
        var keyword = text(query.trim());
        if (!keyword) {
            if (title) {
                title.textContent = '输入关键词查找影片';
            }
            if (empty) {
                empty.hidden = true;
            }
            return;
        }
        var matched = data.filter(function (movie) {
            return text([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.category,
                movie.genre,
                movie.tags,
                movie.oneLine
            ].join(' ')).indexOf(keyword) !== -1;
        }).slice(0, 120);
        if (title) {
            title.textContent = '“' + query + '” 的搜索结果';
        }
        matched.forEach(function (movie) {
            results.appendChild(movieCard(movie));
        });
        if (empty) {
            empty.hidden = matched.length !== 0;
        }
    }

    function initSearchPage() {
        var form = document.querySelector('[data-search-page-form]');
        var input = document.getElementById('search-input');
        if (!form || !input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        runSearch(initial);

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input.value.trim();
            var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
            window.history.replaceState(null, '', nextUrl);
            runSearch(query);
        });

        document.querySelectorAll('[data-search-chip]').forEach(function (chip) {
            chip.addEventListener('click', function () {
                input.value = chip.getAttribute('data-search-chip') || '';
                form.dispatchEvent(new Event('submit', { cancelable: true }));
            });
        });
    }

    ready(function () {
        initNavigation();
        initHeroCarousel();
        initCategoryFilter();
        initPlayer();
        initSearchPage();
    });
})();
