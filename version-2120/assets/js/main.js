(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");

        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var currentSlide = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            currentSlide = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === currentSlide);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === currentSlide);
            });
        }

        if (slides.length) {
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    showSlide(dotIndex);
                });
            });
            showSlide(0);
            window.setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5200);
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var filterRegion = document.querySelector("[data-filter-region]");
        var filterType = document.querySelector("[data-filter-type]");
        var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var emptyState = document.querySelector("[data-empty-state]");

        function applyCardFilter() {
            if (!filterCards.length) {
                return;
            }

            var keyword = normalize(filterInput ? filterInput.value : "");
            var region = normalize(filterRegion ? filterRegion.value : "");
            var type = normalize(filterType ? filterType.value : "");
            var visible = 0;

            filterCards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-keywords"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardType = normalize(card.getAttribute("data-type"));
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (region && cardRegion !== region) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        [filterInput, filterRegion, filterType].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyCardFilter);
                control.addEventListener("change", applyCardFilter);
            }
        });
        applyCardFilter();

        var searchRoot = document.querySelector("[data-search-results]");
        var searchForm = document.querySelector("[data-search-form]");
        var searchInput = document.querySelector("[data-search-input]");
        var searchRegion = document.querySelector("[data-search-region]");
        var searchType = document.querySelector("[data-search-type]");
        var params = new URLSearchParams(window.location.search);

        if (searchInput && params.has("q")) {
            searchInput.value = params.get("q") || "";
        }
        if (searchRegion && params.has("region")) {
            searchRegion.value = params.get("region") || "";
        }
        if (searchType && params.has("type")) {
            searchType.value = params.get("type") || "";
        }

        function renderSearch() {
            if (!searchRoot || !window.SITE_MOVIES) {
                return;
            }

            var keyword = normalize(searchInput ? searchInput.value : "");
            var region = normalize(searchRegion ? searchRegion.value : "");
            var type = normalize(searchType ? searchType.value : "");

            var matched = window.SITE_MOVIES.filter(function (movie) {
                var text = normalize(movie.text);
                if (keyword && text.indexOf(keyword) === -1) {
                    return false;
                }
                if (region && normalize(movie.region) !== region) {
                    return false;
                }
                if (type && normalize(movie.type) !== type) {
                    return false;
                }
                return true;
            }).slice(0, 96);

            if (!matched.length) {
                searchRoot.innerHTML = '<div class="empty-state is-visible">未找到相关影片</div>';
                return;
            }

            searchRoot.innerHTML = matched.map(function (movie) {
                var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                    return '<span class="movie-tag">' + escapeHtml(tag) + '</span>';
                }).join("");
                return '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
                    '<div class="movie-poster">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
                    '<span class="type-badge">' + escapeHtml(movie.type) + '</span>' +
                    '</div>' +
                    '<div class="movie-card-body">' +
                    '<h3>' + escapeHtml(movie.title) + '</h3>' +
                    '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="movie-tags">' + tags + '</div>' +
                    '</div>' +
                    '</a>';
            }).join("");
        }

        if (searchRoot) {
            renderSearch();
            [searchInput, searchRegion, searchType].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", renderSearch);
                    control.addEventListener("change", renderSearch);
                }
            });
        }

        if (searchForm) {
            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                var next = new URLSearchParams();
                if (searchInput && searchInput.value.trim()) {
                    next.set("q", searchInput.value.trim());
                }
                if (searchRegion && searchRegion.value) {
                    next.set("region", searchRegion.value);
                }
                if (searchType && searchType.value) {
                    next.set("type", searchType.value);
                }
                window.history.replaceState(null, "", "search.html" + (next.toString() ? "?" + next.toString() : ""));
                renderSearch();
            });
        }
    });
})();
