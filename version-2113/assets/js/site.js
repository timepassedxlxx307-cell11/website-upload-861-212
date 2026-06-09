(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function text(value) {
        return String(value || "").toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = document.body.classList.toggle("nav-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        start();
    }

    function setupLocalFilters() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var input = document.querySelector("[data-local-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-grid] .movie-card"));
        if (!cards.length) {
            return;
        }
        var active = "all";
        function apply() {
            var keyword = text(input ? input.value : "");
            cards.forEach(function (card) {
                var haystack = text([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.textContent
                ].join(" "));
                var matchedFilter = active === "all" || haystack.indexOf(text(active)) !== -1;
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                card.classList.toggle("is-filter-hidden", !(matchedFilter && matchedKeyword));
            });
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                buttons.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                active = button.getAttribute("data-filter-value") || "all";
                apply();
            });
        });
        if (input) {
            input.addEventListener("input", apply);
        }
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var poster = player.querySelector(".player-poster");
            if (!video) {
                return;
            }
            var source = video.getAttribute("data-src");
            var loaded = false;
            function attachSource() {
                if (!source || loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        autoStartLoad: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video.hlsController = hls;
                } else {
                    video.src = source;
                }
            }
            function start() {
                attachSource();
                if (poster) {
                    poster.classList.add("is-hidden");
                }
                video.play().catch(function () {
                    if (poster) {
                        poster.classList.remove("is-hidden");
                    }
                });
            }
            if (poster) {
                poster.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (!loaded) {
                    start();
                }
            });
        });
    }

    function setupSearchPage() {
        var results = document.getElementById("search-results");
        var input = document.getElementById("search-keyword");
        var title = document.getElementById("search-title");
        var desc = document.getElementById("search-desc");
        if (!results || !input || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        input.value = q;
        function card(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return "<article class=\"movie-card\">" +
                "<a href=\"" + escapeHtml(movie.url) + "\" class=\"movie-card-link\">" +
                "<figure class=\"movie-cover\">" +
                "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                "<figcaption>" + escapeHtml(movie.type) + "</figcaption>" +
                "</figure>" +
                "<div class=\"movie-card-body\">" +
                "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>" +
                "<h3>" + escapeHtml(movie.title) + "</h3>" +
                "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                "<div class=\"tag-row\">" + tags + "</div>" +
                "</div>" +
                "</a>" +
                "</article>";
        }
        function runSearch() {
            var keyword = text(input.value || q);
            if (!keyword) {
                results.innerHTML = "<div class=\"empty-state\">请输入关键词搜索影片。</div>";
                return;
            }
            var matched = window.SEARCH_INDEX.filter(function (movie) {
                var haystack = text([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(" "),
                    movie.oneLine
                ].join(" "));
                return haystack.indexOf(keyword) !== -1;
            }).slice(0, 96);
            title.textContent = "搜索：“" + input.value + "”";
            desc.textContent = matched.length ? "以下为匹配的影片入口。" : "没有找到相关影片。";
            results.innerHTML = matched.length ? matched.map(card).join("") : "<div class=\"empty-state\">没有找到相关影片。</div>";
        }
        runSearch();
        input.addEventListener("input", runSearch);
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupLocalFilters();
        setupPlayers();
        setupSearchPage();
    });
})();
