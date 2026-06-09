(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');

        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, current) {
                    slide.classList.toggle('is-active', current === index);
                });
                dots.forEach(function (dot, current) {
                    dot.classList.toggle('active', current === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    start();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    start();
                });
            });

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        });

        document.querySelectorAll('[data-rail]').forEach(function (rail) {
            var section = rail.closest('.section');
            var prev = section ? section.querySelector('[data-rail-prev]') : null;
            var next = section ? section.querySelector('[data-rail-next]') : null;
            var distance = 320;

            if (prev) {
                prev.addEventListener('click', function () {
                    rail.scrollBy({ left: -distance, behavior: 'smooth' });
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    rail.scrollBy({ left: distance, behavior: 'smooth' });
                });
            }
        });

        document.querySelectorAll('[data-card-grid]').forEach(function (grid) {
            var section = grid.closest('.section') || document;
            var input = section.querySelector('[data-search-input]') || document.querySelector('[data-search-input]');
            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
            var chips = Array.prototype.slice.call(section.querySelectorAll('[data-chip]'));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q') || '';
            var chipValue = '';

            function normalize(value) {
                return String(value || '').toLowerCase().replace(/\s+/g, '');
            }

            function cardText(card) {
                return normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category'),
                    card.textContent
                ].join(' '));
            }

            function applyFilter() {
                var query = normalize(input ? input.value : '');
                var chip = normalize(chipValue);

                cards.forEach(function (card) {
                    var text = cardText(card);
                    var matchedQuery = !query || text.indexOf(query) !== -1;
                    var matchedChip = !chip || text.indexOf(chip) !== -1;
                    card.classList.toggle('is-hidden', !(matchedQuery && matchedChip));
                });
            }

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            if (input) {
                input.addEventListener('input', applyFilter);
            }

            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    chips.forEach(function (item) {
                        item.classList.remove('active');
                    });
                    chip.classList.add('active');
                    chipValue = chip.getAttribute('data-chip') || '';
                    applyFilter();
                });
            });

            applyFilter();
        });
    });
})();
