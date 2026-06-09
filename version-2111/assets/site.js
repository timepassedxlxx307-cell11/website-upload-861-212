(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function() {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        show(index);
      });
    });
    window.setInterval(function() {
      show(current + 1);
    }, 5600);
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-filter-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-result]");
    if (!cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";
    if (input && queryValue) {
      input.value = queryValue;
    }
    function apply() {
      var q = normalize(input ? input.value : "");
      var year = select ? select.value : "";
      var visible = 0;
      cards.forEach(function(card) {
        var search = normalize(card.getAttribute("data-search"));
        var cardYear = card.getAttribute("data-year") || "";
        var matched = (!q || search.indexOf(q) !== -1) && (!year || cardYear === year);
        card.classList.toggle("hidden-card", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  }

  ready(function() {
    initMobileMenu();
    initHero();
    initFilters();
  });
})();
