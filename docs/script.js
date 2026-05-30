/* ═══════════════════════════════════════════════════════════
   Megicula Stake — Landing Page Scripts
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ── Mobile Nav Toggle ────────────────────────────────────
  const mobileToggle = document.getElementById("mobileToggle");
  const navLinks = document.getElementById("navLinks");

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
      mobileToggle.classList.toggle("active");
    });

    // Close on link click
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        mobileToggle.classList.remove("active");
      });
    });
  }

  // ── Navbar scroll effect ─────────────────────────────────
  const navbar = document.getElementById("navbar");
  var lastScroll = 0;

  window.addEventListener("scroll", function () {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 50) {
      navbar.style.background = "rgba(15,15,26,0.95)";
      navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
    } else {
      navbar.style.background = "rgba(15,15,26,0.85)";
      navbar.style.boxShadow = "none";
    }
    lastScroll = scrollTop;
  });

  // ── Scroll-reveal animation ──────────────────────────────
  var animatedElements = document.querySelectorAll(".animate-on-scroll");

  function checkVisible() {
    var triggerBottom = window.innerHeight * 0.88;
    animatedElements.forEach(function (el) {
      var top = el.getBoundingClientRect().top;
      if (top < triggerBottom) {
        el.classList.add("visible");
      }
    });
  }

  window.addEventListener("scroll", checkVisible);
  window.addEventListener("resize", checkVisible);
  // Initial check
  checkVisible();

  // ── Smooth scroll for anchor links ───────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var targetId = this.getAttribute("href");
      if (targetId === "#") return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var offset = navbar.offsetHeight + 16;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });
  });

  // ── Contract address placeholders ────────────────────────
  // After deploying, replace these with real addresses:
  var CONTRACTS = {
    token: "0x0000000000000000000000000000000000000000",
    staking: "0x0000000000000000000000000000000000000000",
  };

  var EXPLORER = "https://testnet.opnscan.io";

  function updateContractUI() {
    var tokenEl = document.getElementById("token-address");
    var stakingEl = document.getElementById("staking-address");

    if (tokenEl && CONTRACTS.token !== "0x0000000000000000000000000000000000000000") {
      tokenEl.innerHTML =
        '<a href="' + EXPLORER + "/address/" + CONTRACTS.token + '" target="_blank" rel="noopener" style="color:#a855f7;">' +
        CONTRACTS.token + "</a>";
    }
    if (stakingEl && CONTRACTS.staking !== "0x0000000000000000000000000000000000000000") {
      stakingEl.innerHTML =
        '<a href="' + EXPLORER + "/address/" + CONTRACTS.staking + '" target="_blank" rel="noopener" style="color:#a855f7;">' +
        CONTRACTS.staking + "</a>";
    }
  }

  updateContractUI();

  // ── Stats placeholders ───────────────────────────────────
  // In production, these would be fetched from the blockchain.
  // For the static landing page we show placeholder values.
  function updateStats() {
    var tvl = document.getElementById("stat-tvl");
    var stakers = document.getElementById("stat-stakers");
    var rewards = document.getElementById("stat-rewards");

    if (tvl) tvl.textContent = "0 MEGA";
    if (stakers) stakers.textContent = "0";
    if (rewards) rewards.textContent = "0 MEGA";
  }

  updateStats();

  // ── Copy to clipboard helper (used if needed) ────────────
  window.copyToClipboard = function (text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        showToast("Copied to clipboard!");
      });
    } else {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showToast("Copied to clipboard!");
    }
  };

  // ── Toast notification ───────────────────────────────────
  function showToast(message) {
    var existing = document.querySelector(".toast-notification");
    if (existing) existing.remove();

    var toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.textContent = message;
    toast.style.cssText =
      "position:fixed;bottom:2rem;right:2rem;" +
      "background:#1a1a2e;border:1px solid rgba(168,85,247,0.3);" +
      "color:#f0f0ff;padding:0.75rem 1.25rem;border-radius:0.75rem;" +
      "font-size:0.85rem;font-weight:600;z-index:9999;" +
      "box-shadow:0 4px 20px rgba(0,0,0,0.4);" +
      "animation:fadeUp 0.3s ease;";

    document.body.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 2500);
  }

  // ── Year in footer ───────────────────────────────────────
  var yearEl = document.querySelector(".footer-copy");
  if (yearEl) {
    yearEl.innerHTML = yearEl.innerHTML.replace("2026", new Date().getFullYear());
  }

  console.log(
    "%c⚡ Megicula Stake %c— Secure. Stake. Earn on OPN Chain.",
    "color:#a855f7;font-weight:bold;font-size:14px;",
    "color:#9898b0;font-size:12px;"
  );
})();
