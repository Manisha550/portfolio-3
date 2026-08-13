/* ==========================================================
   SUMAIYA ISLAM — PORTFOLIO
   Vanilla JS only. No frameworks, no dependencies.

   Sections in this file:
   1. Mobile menu toggle
   2. Scroll-reveal (fade/slide elements in as they enter view)
   3. Running-stitch scroll progress (the header thread)
   4. Running-stitch section dividers (draw in once, on scroll)
   5. Active nav-link highlighting + sliding stitch indicator
   6. Navbar "scrolled" state (tightens up once you leave the hero)
   7. Magnetic buttons (nudge toward the cursor, ease back on leave)
   8. Hero parallax (cursor-glow + hoop tilt — skipped for touch /
      reduced-motion, since it's pure atmosphere, not information)
   9. Contact form -> mailto handoff
   10. Copy-email button (clipboard, with a small "Copied" state)
   11. Hero stat count-up (animates once, when scrolled into view)
   12. Project row spotlight (cursor-tracked glow on hover)
   13. Current year in footer
   ========================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- 1. mobile menu ---------- */
    var menuBtn = document.querySelector(".menu-btn");
    var navLinks = document.querySelector("nav.links");
    if (menuBtn && navLinks) {
      menuBtn.addEventListener("click", function () {
        var isOpen = navLinks.classList.toggle("open");
        menuBtn.classList.toggle("open", isOpen);
        menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      // Close the menu whenever a link inside it is tapped.
      navLinks.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { navLinks.classList.remove("open"); });
      });
    }

    /* ---------- 2. reveal on scroll ---------- */
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && revealEls.length) {
      var revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
      revealEls.forEach(function (el) { revealIO.observe(el); });
    } else {
      // No IntersectionObserver support (or reduced-motion users who'd
      // rather just see the content) -> show everything immediately.
      revealEls.forEach(function (el) { el.classList.add("in"); });
    }

    /* ---------- 3. running-stitch scroll progress ---------- */
    var stitchPath = document.getElementById("stitch-path");
    if (stitchPath) {
      var pathLength = stitchPath.getTotalLength();
      stitchPath.style.strokeDasharray = pathLength;
      var onScroll = function () {
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
        stitchPath.style.strokeDashoffset = pathLength * (1 - pct);
      };
      stitchPath.style.strokeDashoffset = pathLength;
      document.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    /* ---------- 4. running-stitch section dividers ---------- */
    var stitchDividers = document.querySelectorAll(".stitch-draw");
    if ("IntersectionObserver" in window && stitchDividers.length) {
      var stitchIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            stitchIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      stitchDividers.forEach(function (el) { stitchIO.observe(el); });
    }

    /* ---------- 5. active nav link on scroll + sliding indicator ---------- */
    var sections = document.querySelectorAll("main section[id]");
    var navAnchors = document.querySelectorAll("nav.links a[href^='#']");
    var navIndicator = document.querySelector(".nav-indicator");
    var navLinksEl = document.querySelector("nav.links");

    // Moves the dashed indicator under whichever link we pass it — used
    // both for the "true" active link (on scroll) and a live hover preview.
    function moveIndicatorTo(link) {
      if (!navIndicator || !navLinksEl || !link) return;
      var linkBox = link.getBoundingClientRect();
      var navBox = navLinksEl.getBoundingClientRect();
      navIndicator.style.width = linkBox.width + "px";
      navIndicator.style.transform = "translateX(" + (linkBox.left - navBox.left) + "px)";
      navIndicator.classList.add("on");
    }

    if (sections.length && navAnchors.length && "IntersectionObserver" in window) {
      var navIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.getAttribute("id");
          var link = document.querySelector("nav.links a[href='#" + id + "']");
          if (!link) return;
          if (entry.isIntersecting) {
            navAnchors.forEach(function (a) { a.classList.remove("active"); });
            link.classList.add("active");
            moveIndicatorTo(link);
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      sections.forEach(function (s) { navIO.observe(s); });
    }

    // While the mouse is over a specific link, preview the indicator there;
    // hand it back to the actual active link once the mouse leaves the nav.
    navAnchors.forEach(function (a) {
      a.addEventListener("mouseenter", function () { moveIndicatorTo(a); });
    });
    if (navLinksEl) {
      navLinksEl.addEventListener("mouseleave", function () {
        var current = document.querySelector("nav.links a.active");
        if (current) moveIndicatorTo(current);
      });
    }
    window.addEventListener("resize", function () {
      var current = document.querySelector("nav.links a.active");
      if (current) moveIndicatorTo(current);
    });

    /* ---------- 6. navbar "scrolled" state ---------- */
    var siteNav = document.querySelector(".site-nav");
    if (siteNav) {
      var updateNavState = function () {
        siteNav.classList.toggle("scrolled", window.scrollY > 40);
      };
      document.addEventListener("scroll", updateNavState, { passive: true });
      updateNavState();
    }

    /* ---------- 7. magnetic buttons ---------- */
    // Skip entirely for touch devices (no real cursor to "attract" toward)
    // and for reduced-motion users, who've told us they don't want this.
    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var isTouch = window.matchMedia("(hover: none)").matches;
    if (!prefersReducedMotion && !isTouch) {
      document.querySelectorAll(".btn-magnetic").forEach(function (btn) {
        var strength = 0.35; // how far it travels relative to cursor offset
        btn.addEventListener("mousemove", function (e) {
          var box = btn.getBoundingClientRect();
          var x = (e.clientX - box.left - box.width / 2) * strength;
          var y = (e.clientY - box.top - box.height / 2) * strength;
          btn.style.setProperty("--magnet-transform", "translate(" + x + "px," + y + "px)");
        });
        btn.addEventListener("mouseleave", function () {
          btn.style.setProperty("--magnet-transform", "translateY(-2px)");
        });
      });
    }

    /* ---------- 8. hero parallax: cursor-glow + hoop tilt ---------- */
    var heroSection = document.querySelector(".hero");
    var heroGlow = document.querySelector(".hero-glow");
    var hoopWrap = document.querySelector(".hoop-wrap");
    if (heroSection && !prefersReducedMotion && !isTouch) {
      heroSection.addEventListener("mousemove", function (e) {
        var box = heroSection.getBoundingClientRect();
        var relX = (e.clientX - box.left) / box.width;   // 0 -> 1
        var relY = (e.clientY - box.top) / box.height;   // 0 -> 1

        if (heroGlow) {
          var glowX = (relX - 0.5) * 60;
          var glowY = (relY - 0.5) * 60;
          heroGlow.style.transform = "translate(" + glowX + "px," + glowY + "px)";
        }
        if (hoopWrap) {
          var tiltY = (relX - 0.5) * 10; // left/right cursor -> turn toward it
          var tiltX = (0.5 - relY) * 10; // up/down cursor -> tip toward it
          hoopWrap.style.setProperty("--tilt-y", tiltY + "deg");
          hoopWrap.style.setProperty("--tilt-x", tiltX + "deg");
        }
      });
      heroSection.addEventListener("mouseleave", function () {
        if (heroGlow) heroGlow.style.transform = "";
        if (hoopWrap) {
          hoopWrap.style.setProperty("--tilt-y", "0deg");
          hoopWrap.style.setProperty("--tilt-x", "0deg");
        }
      });
    }

    /* ---------- 9. contact form (static site — no backend) ---------- */
    var form = document.querySelector(".contact-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = form.querySelector("[name='name']").value.trim();
        var email = form.querySelector("[name='email']").value.trim();
        var message = form.querySelector("[name='message']").value.trim();
        if (!name || !email || !message) return;
        var subject = encodeURIComponent("Portfolio inquiry from " + name);
        var body = encodeURIComponent(message + "\n\nFrom: " + name + " (" + email + ")");
        window.location.href = "mailto:manishasumu887@gmail.com?subject=" + subject + "&body=" + body;
      });
    }

    /* ---------- 10. copy-email button ---------- */
    var copyBtn = document.querySelector(".copy-email-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var email = copyBtn.getAttribute("data-email");
        var original = copyBtn.textContent;
        var showCopied = function () {
          copyBtn.textContent = "Copied";
          copyBtn.classList.add("copied");
          setTimeout(function () {
            copyBtn.textContent = original;
            copyBtn.classList.remove("copied");
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(showCopied).catch(function () {
            /* clipboard permission denied or unavailable — the mailto link right next to it still works */
          });
        }
      });
    }

    /* ---------- 11. hero stat count-up ---------- */
    // Counts up from 0 to the target once the hero stats scroll into view.
    // Reduced-motion users just get the final number immediately.
    var countEls = document.querySelectorAll("[data-count-to]");
    if (countEls.length) {
      var animateCount = function (el) {
        var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
        if (prefersReducedMotion || target <= 1) { el.textContent = target; return; }
        var start = null;
        var duration = 900;
        var step = function (timestamp) {
          if (start === null) start = timestamp;
          var progress = Math.min((timestamp - start) / duration, 1);
          el.textContent = Math.floor(progress * target);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target;
        };
        requestAnimationFrame(step);
      };
      if ("IntersectionObserver" in window) {
        var countIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countIO.unobserve(entry.target);
            }
          });
        }, { threshold: 0.6 });
        countEls.forEach(function (el) { countIO.observe(el); });
      } else {
        countEls.forEach(function (el) { el.textContent = el.getAttribute("data-count-to"); });
      }
    }

    /* ---------- 12. project row spotlight ---------- */
    // A soft glow that tracks the cursor across each project row — same
    // "attentive" feeling as the magnetic buttons, scoped to hover only.
    if (!prefersReducedMotion && !isTouch) {
      document.querySelectorAll(".project-row").forEach(function (row) {
        row.addEventListener("mousemove", function (e) {
          var box = row.getBoundingClientRect();
          row.style.setProperty("--spot-x", (e.clientX - box.left) + "px");
          row.style.setProperty("--spot-y", (e.clientY - box.top) + "px");
          row.classList.add("lit");
        });
        row.addEventListener("mouseleave", function () { row.classList.remove("lit"); });
      });
    }

    /* ---------- 13. current year in footer ---------- */
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

  });
})();
