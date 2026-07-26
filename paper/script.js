(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Scroll progress bar
     --------------------------------------------------------------------- */
  var progressBar = document.getElementById("progressBar");

  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";
  }

  /* ---------------------------------------------------------------------
     Back to top button
     --------------------------------------------------------------------- */
  var backToTop = document.getElementById("backToTop");

  function updateBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 480) {
      backToTop.classList.add("is-visible");
    } else {
      backToTop.classList.remove("is-visible");
    }
  }

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  var scrollTicking = false;
  window.addEventListener("scroll", function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        updateProgress();
        updateBackToTop();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });
  updateProgress();
  updateBackToTop();

  /* ---------------------------------------------------------------------
     Mobile sidebar drawer
     --------------------------------------------------------------------- */
  var menuToggle = document.getElementById("menuToggle");
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("sidebarOverlay");

  function openSidebar() {
    sidebar.classList.add("is-open");
    overlay.classList.add("is-visible");
    menuToggle.setAttribute("aria-expanded", "true");
  }
  function closeSidebar() {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-visible");
    menuToggle.setAttribute("aria-expanded", "false");
  }
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      if (sidebar.classList.contains("is-open")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }
  if (overlay) overlay.addEventListener("click", closeSidebar);

  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc-link"));
  tocLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.innerWidth <= 1080) closeSidebar();
    });
  });

  /* ---------------------------------------------------------------------
     Active section highlighting in the TOC
     --------------------------------------------------------------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var homeSection = document.getElementById("home");
  if (homeSection) sections.unshift(homeSection);

  var linkMap = {};
  tocLinks.forEach(function (link) {
    var id = link.getAttribute("href").replace("#", "");
    linkMap[id] = link;
  });

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            tocLinks.forEach(function (l) { l.classList.remove("active"); });
            if (linkMap[id]) linkMap[id].classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (sec) { observer.observe(sec); });
  }

  /* ---------------------------------------------------------------------
     Reveal-on-scroll fade-ins
     --------------------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && revealEls.length && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------------------
     Hero decorative motif: a subtle branching "forest" of lines,
     evoking the splits of a Random Forest's decision trees.
     --------------------------------------------------------------------- */
  var heroCanvas = document.getElementById("heroCanvas");

  function buildBranch(svgNS, x, y, angle, depth, length) {
    var group = document.createElementNS(svgNS, "g");
    if (depth <= 0) return group;

    var rad = (angle * Math.PI) / 180;
    var x2 = x + Math.cos(rad) * length;
    var y2 = y + Math.sin(rad) * length;

    var line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", x);
    line.setAttribute("y1", y);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("class", "hero-branch");
    line.setAttribute("stroke", "url(#branchGradient)");
    line.setAttribute("stroke-width", Math.max(0.6, depth * 0.55));
    line.setAttribute("stroke-linecap", "round");
    line.style.opacity = "0";
    line.style.transition = "opacity 900ms ease";
    line.style.transitionDelay = ((6 - depth) * 90) + "ms";
    group.appendChild(line);

    var node = document.createElementNS(svgNS, "circle");
    node.setAttribute("cx", x2);
    node.setAttribute("cy", y2);
    node.setAttribute("r", depth > 1 ? 2.2 : 3.2);
    node.setAttribute("fill", depth > 1 ? "#8fb0ea" : "#2454c7");
    node.style.opacity = "0";
    node.style.transition = "opacity 900ms ease";
    node.style.transitionDelay = ((6 - depth) * 90 + 200) + "ms";
    group.appendChild(node);

    if (depth > 1) {
      var spread = 20 + depth * 4;
      group.appendChild(buildBranch(svgNS, x2, y2, angle - spread, depth - 1, length * 0.78));
      group.appendChild(buildBranch(svgNS, x2, y2, angle + spread, depth - 1, length * 0.78));
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        line.style.opacity = "0.5";
        node.style.opacity = "0.85";
      });
    });

    return group;
  }

  if (heroCanvas) {
    var svgNS = "http://www.w3.org/2000/svg";

    var defs = document.createElementNS(svgNS, "defs");
    var gradient = document.createElementNS(svgNS, "linearGradient");
    gradient.setAttribute("id", "branchGradient");
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "100%");
    gradient.setAttribute("y2", "100%");
    var stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#2454c7");
    var stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#9db8e8");
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    heroCanvas.appendChild(defs);

    var roots = [
      { x: 640, y: 560, angle: -95, depth: 5, length: 78 },
      { x: 800, y: 560, angle: -100, depth: 5, length: 72 },
      { x: 940, y: 560, angle: -110, depth: 4, length: 66 },
      { x: 480, y: 30,  angle: 90,  depth: 4, length: 60 }
    ];

    roots.forEach(function (r) {
      heroCanvas.appendChild(buildBranch(svgNS, r.x, r.y, r.angle, r.depth, r.length));
    });
  }
})();
