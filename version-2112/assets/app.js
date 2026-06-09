(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initNavSearch() {
        var forms = document.querySelectorAll("[data-site-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (!value) {
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(value);
            });
        });
    }

    function initHeroCarousel() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function initListingFilter() {
        var input = document.querySelector("[data-filter-input]");
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (query) {
            input.value = query;
        }
        function applyFilter() {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                card.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
            });
        }
        input.addEventListener("input", applyFilter);
        applyFilter();
    }

    ready(function () {
        initMenu();
        initNavSearch();
        initHeroCarousel();
        initListingFilter();
    });
})();

function setupMovieVideo(videoId, streamUrl, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !streamUrl) {
        return;
    }
    var hls = null;
    var loaded = false;
    function loadStream() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }
    function playVideo() {
        overlay.classList.add("is-hidden");
        loadStream();
        var request = video.play();
        if (request && request.catch) {
            request.catch(function () {
                overlay.classList.remove("is-hidden");
            });
        }
    }
    loadStream();
    overlay.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });
    video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
        overlay.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
