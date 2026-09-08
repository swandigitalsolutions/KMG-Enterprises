/* =========================================================
   KMG ENTERPRISES — interactions
   preloader · nav · reveal · 3D tilt · magnetic buttons
   marquee loop · custom cursor · enquiry form → WhatsApp
   ========================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- photo fallback (missing image files degrade gracefully) ---------- */
  (function () {
    var imgs = document.querySelectorAll("img[data-photo], img[data-logo]");
    imgs.forEach(function (img) {
      function fail() { img.classList.add("is-fallback"); }
      img.addEventListener("error", fail);
      if (img.complete && img.naturalWidth === 0) fail();
    });
  })();

  /* ---------- preloader ---------- */
  window.addEventListener("load", function () {
    var pre = document.getElementById("preloader");
    if (!pre) return;
    setTimeout(function () { pre.classList.add("is-done"); }, 700);
  });

  /* ---------- year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- nav: scrolled / hide-on-scroll-down / mobile menu ---------- */
  var nav = document.getElementById("nav");
  var navLinks = document.getElementById("navLinks");
  var navToggle = document.getElementById("navToggle");
  var lastY = window.scrollY;

  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    if (nav) {
      nav.classList.toggle("is-scrolled", y > 40);
      if (!nav.classList.contains("is-menu")) {
        nav.classList.toggle("is-hidden", y > lastY && y > 320);
      }
    }
    lastY = y;
  }, { passive: true });

  function closeMenu() {
    if (!nav) return;
    nav.classList.remove("is-menu");
    if (navLinks) navLinks.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-menu");
      navLinks.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
  }
  if (navLinks) {
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.transitionDelay = (Math.min(en.target.dataset.delay || 0, 300)) + "ms";
          en.target.classList.add("is-visible");
          ro.unobserve(en.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el, i) {
      var siblings = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.dataset.delay = (siblings % 4) * 70;
      ro.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 3D tilt ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var rect = null;
      var raf = null;
      var tx = 0, ty = 0;

      function onEnter() { rect = el.getBoundingClientRect(); }
      function onMove(e) {
        if (!rect) rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        tx = py * -8;
        ty = px * 10;
        if (!raf) raf = requestAnimationFrame(apply);
      }
      function apply() {
        raf = null;
        el.style.transform = "perspective(900px) rotateX(" + tx.toFixed(2) + "deg) rotateY(" + ty.toFixed(2) + "deg) translateZ(0)";
      }
      function onLeave() {
        rect = null;
        el.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
      }
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25;
        var y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = "translate(" + x + "px," + y + "px)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ---------- marquee: duplicate track for seamless loop ---------- */
  var mt = document.getElementById("marqueeTrack");
  if (mt) {
    mt.innerHTML += mt.innerHTML;
  }

  /* ---------- custom cursor ---------- */
  if (finePointer && !reduced) {
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    if (dot && ring) {
      var mx = -100, my = -100;
      var rx = mx, ry = my;
      window.addEventListener("pointermove", function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
        document.body.classList.add("cursor-ready");
      }, { passive: true });
      (function follow() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
        requestAnimationFrame(follow);
      })();
      document.querySelectorAll("a, button, [data-tilt], input, select, textarea").forEach(function (el) {
        el.addEventListener("pointerenter", function () { ring.classList.add("is-hover"); });
        el.addEventListener("pointerleave", function () { ring.classList.remove("is-hover"); });
      });
    }
  }

  /* ---------- active nav link on scroll ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var linkMap = {};
  document.querySelectorAll(".nav__links a").forEach(function (a) {
    linkMap[a.getAttribute("href").slice(1)] = a;
  });
  if ("IntersectionObserver" in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && linkMap[en.target.id]) {
          Object.keys(linkMap).forEach(function (k) { linkMap[k].classList.remove("is-current"); });
          linkMap[en.target.id].classList.add("is-current");
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* ---------- enquiry form → WhatsApp ---------- */
  var form = document.getElementById("enquiryForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var lines = [
        "*New Enquiry — KMG Enterprises*",
        "",
        "Name: " + (f.name.value || "-"),
        "Phone: " + (f.phone.value || "-"),
        "Email: " + (f.email.value || "-"),
        "Location: " + (f.location.value || "-"),
        "Project Type: " + (f.ptype.value || "-"),
        "Quantity / Size: " + (f.qty.value || "-"),
        "",
        "Requirement:",
        (f.message.value || "-")
      ];
      var url = "https://wa.me/919108318319?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  }
})();
