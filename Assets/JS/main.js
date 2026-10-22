(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var nav = $(".nav");
  addEventListener("scroll", function () { nav.classList.toggle("on", scrollY > 40); }, { passive: true });
  // Menu burger : ouvre/ferme, bloque le défilement derrière, se ferme avec Échap ou au passage en grand écran
  var burger = $(".burger"), root = document.documentElement;
  function setMenu(open) {
    nav.classList.toggle("open", open);
    root.classList.toggle("menu-open", open);
    if (burger) {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      burger.textContent = open ? "Fermer" : "Menu";
    }
    if (open && window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(".nav nav a", { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .5, ease: "power3.out", delay: .12, overwrite: true });
    }
  }
  if (burger) burger.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  $$(".nav nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  addEventListener("resize", function () { if (innerWidth > 800) setMenu(false); });

  // Carte : filtres
  var items = $$(".menu li");
  $$(".tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".tabs button").forEach(function (x) { x.classList.toggle("on", x === b); });
      items.forEach(function (li) { li.hidden = !(b.dataset.f === "all" || li.dataset.c === b.dataset.f); });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  // Commande : panier + envoi WhatsApp
  var form = $(".order");
  if (form) {
    var rows = $$(".oi", form), tot = $(".total"), list = $(".sum ul");
    var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA"; };
    var upd = function () {
      var t = 0, lines = [];
      rows.forEach(function (r) {
        var q = +r.dataset.q;
        if (q) { t += q * +r.dataset.price; lines.push(q + " × " + r.dataset.name); }
        $(".q", r).textContent = q;
      });
      tot.textContent = fmt(t);
      list.innerHTML = lines.length ? lines.map(function (l) { return "<li>" + l + "</li>"; }).join("") : '<li class="empty">Aucun article pour le moment</li>';
      return { t: t, lines: lines };
    };
    rows.forEach(function (r) {
      r.dataset.q = 0;
      $(".plus", r).addEventListener("click", function () { r.dataset.q = +r.dataset.q + 1; upd(); });
      $(".minus", r).addEventListener("click", function () { r.dataset.q = Math.max(0, +r.dataset.q - 1); upd(); });
    });
    $(".send").addEventListener("click", function () {
      var o = upd();
      if (!o.lines.length) { alert("Ajoutez au moins un article."); return; }
      var nom = $("#nom").value.trim(), note = $("#note").value.trim();
      var msg = "Bonjour, je souhaite commander :\n" + o.lines.map(function (l) { return "- " + l; }).join("\n") + "\nTotal : " + fmt(o.t) + (nom ? "\nNom : " + nom : "") + (note ? "\nRemarque : " + note : "");
      window.open("https://wa.me/237600000000?text=" + encodeURIComponent(msg), "_blank");
    });
    upd();
  }

  // Animations
  var cur = $(".curtain");
  var calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || calme) {
    if (cur) cur.remove();
    $$(".rv,.gc").forEach(function (e) { e.style.opacity = 1; });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  function init() {
    // Titres découpés mot à mot
    $$("[data-split]").forEach(function (el) {
      el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w"><span>' + w + "</span></span>"; }).join(" ");
      gsap.from($$(".w>span", el), { yPercent: 115, duration: 1, stagger: .07, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 90%" } });
    });
    // Hero
    if ($(".hero")) {
      gsap.timeline({ defaults: { ease: "power4.out" } })
        .from(".hero h1 .w>span", { yPercent: 115, duration: 1, stagger: .09 }, 0)
        .fromTo(".arch .shape", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.3 }, .1)
        .from(".arch img", { scale: 1.45, duration: 1.8, ease: "power3.out" }, .1)
        .from(".hero .eyebrow,.hero .lead,.hero .cta", { y: 24, opacity: 0, duration: .8, stagger: .12 }, .5)
        .from(".badge", { scale: 0, rotation: -90, duration: 1, ease: "back.out(1.6)" }, 1);
      gsap.to(".badge svg", { rotation: 360, duration: 14, ease: "none", repeat: -1 });
      gsap.to(".arch img", { yPercent: 7, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    }
    // Bandeau
    $$(".mq-track").forEach(function (t, i) { gsap.fromTo(t, { xPercent: i ? -50 : 0 }, { xPercent: i ? 0 : -50, duration: 26, ease: "none", repeat: -1 }); });
    // Galerie horizontale épinglée
    var track = $(".hg-track");
    if (track && matchMedia("(min-width:800px)").matches) {
      $(".hg").style.overflow = "hidden";
      gsap.to(track, {
        x: function () { return -(track.scrollWidth - innerWidth); },
        ease: "none",
        scrollTrigger: { trigger: ".hg", pin: true, scrub: .6, start: "top top", end: function () { return "+=" + (track.scrollWidth - innerWidth); }, invalidateOnRefresh: true }
      });
    }
    // Apparitions
    $$(".rv").forEach(function (el) {
      gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
    });
    // Images en parallaxe
    $$(".duo .big img").forEach(function (img) {
      gsap.to(img, { yPercent: -8, ease: "none", scrollTrigger: { trigger: img, scrub: true } });
    });
    // Aperçu qui suit la souris sur la carte
    var pv = $(".pv");
    if (pv && matchMedia("(hover:hover)").matches) {
      var pic = $("img", pv);
      var mx = gsap.quickTo(pv, "x", { duration: .5, ease: "power3" }), my = gsap.quickTo(pv, "y", { duration: .5, ease: "power3" });
      gsap.set(pv, { scale: .85 });
      items.forEach(function (li) {
        li.addEventListener("mouseenter", function () { pic.src = li.dataset.img; gsap.to(pv, { opacity: 1, scale: 1, duration: .3 }); });
        li.addEventListener("mouseleave", function () { gsap.to(pv, { opacity: 0, scale: .85, duration: .3 }); });
      });
      addEventListener("mousemove", function (e) { mx(e.clientX + 30); my(e.clientY - 130); });
    }

    // Barre de progression
    var bar = document.createElement("div"); bar.className = "prog"; document.body.appendChild(bar);
    gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: .3 } });
    // Cartes : apparition en cascade + inclinaison
    ScrollTrigger.batch(".gc", { start: "top 92%", onEnter: function (b) { gsap.fromTo(b, { y: 70, opacity: 0, rotate: 3 }, { y: 0, opacity: 1, rotate: 0, stagger: .12, duration: .9, ease: "power3.out" }); } });
    if (matchMedia("(hover:hover)").matches) $$(".gc").forEach(function (c) {
      c.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(); gsap.to(c, { rotationY: ((e.clientX - r.left) / r.width - .5) * 12, rotationX: -((e.clientY - r.top) / r.height - .5) * 12, transformPerspective: 800, duration: .4 }); });
      c.addEventListener("mouseleave", function () { gsap.to(c, { rotationX: 0, rotationY: 0, duration: .6 }); });
    });
    // Douceurs en parallaxe pendant le défilement
    $$(".ps").forEach(function (p, i) {
      var sp = +p.dataset.sp;
      gsap.to(p, { y: -120 * sp, rotation: (i % 2 ? -1 : 1) * 70 * sp, ease: "none", scrollTrigger: { trigger: ".sweet", start: "top bottom", end: "bottom top", scrub: .8 } });
    });
    // Touche perso : soulignement dessiné à la main sous « vrai. »
    var ul = $(".ul path");
    if (ul) { var L = ul.getTotalLength(); gsap.set(ul, { strokeDasharray: L, strokeDashoffset: L }); gsap.to(ul, { strokeDashoffset: 0, duration: 1.1, ease: "power2.out", delay: 1.5 }); }
    // Touche perso : une baguette qui roule le long de la barre de progression
    var bag = document.createElement("div"); bag.className = "bag"; bag.textContent = "🥖"; bag.setAttribute("aria-hidden", "true"); document.body.appendChild(bag);
    ScrollTrigger.create({ trigger: document.body, start: "top top", end: "bottom bottom", onUpdate: function (s) { gsap.set(bag, { x: s.progress * (innerWidth - 34), rotation: s.progress * 720 }); } });
    // Touche perso : des miettes jaillissent au clic
    var cols = ["#f2c230", "#c9742b", "#f6efe2", "#e9a64a"];
    document.addEventListener("click", function (e) {
      for (var i = 0; i < 12; i++) {
        var c = document.createElement("i"); c.className = "mie"; c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px"; c.style.background = cols[i % 4]; document.body.appendChild(c);
        var a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 60;
        gsap.to(c, { x: Math.cos(a) * d, y: Math.sin(a) * d + 30, rotation: Math.random() * 360, opacity: 0, scale: .3, duration: .9, ease: "power2.out", onComplete: (function (el) { return function () { el.remove(); }; })(c) });
      }
    });
    // Touche perso : boutons aimantés
    if (matchMedia("(hover:hover)").matches) $$(".btn:not(.fab)").forEach(function (b) {
      var qx = gsap.quickTo(b, "x", { duration: .4, ease: "power3" }), qy = gsap.quickTo(b, "y", { duration: .4, ease: "power3" });
      b.addEventListener("mousemove", function (e) { var r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .25); qy((e.clientY - r.top - r.height / 2) * .35); });
      b.addEventListener("mouseleave", function () { qx(0); qy(0); });
    });
    // Détails FAQ : ouverture douce
    $$("details").forEach(function (d) { d.addEventListener("toggle", function () { if (d.open) gsap.from($("p", d), { y: -10, opacity: 0, duration: .4 }); }); });
    addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  // Rideau : s'ouvre à l'arrivée, se referme avant de changer de page
  gsap.to(cur, { yPercent: -100, duration: .85, ease: "power4.inOut", delay: .2 });
  gsap.delayedCall(.5, init);
  $$("a[href]").forEach(function (a) {
    var h = a.getAttribute("href");
    if (!h || h.charAt(0) === "#" || /^(https?:|tel:|mailto:)/.test(h) || a.target) return;
    a.addEventListener("click", function (e) {
      e.preventDefault();
      gsap.fromTo(cur, { yPercent: 100 }, { yPercent: 0, duration: .55, ease: "power3.inOut", onComplete: function () { location.href = h; } });
    });
  });
  addEventListener("pageshow", function (e) { if (e.persisted) gsap.set(cur, { yPercent: -100 }); });
})();