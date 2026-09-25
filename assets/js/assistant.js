/* =========================================================
   KMG STONES — site assistant
   A lightweight, offline rule-based helper. No backend, no API
   keys. Answers common questions from a local knowledge base and
   hands off to WhatsApp / the enquiry form for anything else.
   ========================================================= */
(function () {
  "use strict";

  var WA = "https://wa.me/919108318319";
  var PHONE1 = "91083 18319", PHONE2 = "95359 88986";

  var fab = document.getElementById("asstFab");
  var wrap = document.getElementById("asst");
  var panel = document.getElementById("asstPanel");
  var closeBtn = document.getElementById("asstClose");
  var log = document.getElementById("asstLog");
  var chipsBox = document.getElementById("asstChips");
  var form = document.getElementById("asstForm");
  var input = document.getElementById("asstInput");
  if (!fab || !panel) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var started = false;
  var missCount = 0;

  /* ---------------- knowledge base ---------------- */
  var KB = [
    {
      id: "greeting",
      k: ["hi", "hello", "hey", "hai", "namaste", "vanakkam", "good morning", "good evening"],
      a: "Hello! I'm the KMG Stones assistant. I can help with our temple stones, parking / paving stones, services, the stone factory, or getting a quote. What would you like to know?"
    },
    {
      id: "products",
      k: ["product", "what do you make", "what do you sell", "offer", "catalogue", "catalog", "items"],
      a: "KMG Stones manufactures and supplies:<ul><li><strong>Temple stones</strong> — pillars, beams, mandapam stones, door frames, steps, gopuram components, wall stones and decorative / custom stonework</li><li><strong>Parking &amp; paving stones</strong> — multiple sizes and thicknesses</li><li><strong>Custom stone products</strong> — made to your drawings</li></ul>",
      chips: ["Parking stone sizes", "Temple stone list", "Get a quote"]
    },
    {
      id: "temple-stones",
      k: ["temple stone", "pillar", "mandapam", "gopuram", "door frame", "beam", "carving", "wall stone", "temple component"],
      a: "For temples we cut and finish stone to your project drawings: <strong>pillars, beams, mandapam stones, door frames, steps, gopuram components, wall stones</strong> and decorative or fully custom stonework. We also handle carving, transportation and installation.",
      chips: ["Services", "Get a quote", "Talk to a person"]
    },
    {
      id: "parking-sizes",
      k: ["parking", "paving", "paver", "driveway", "size", "thickness", "dimension", "mm", "sqft", "square"],
      a: "Parking / paving stones are available in these sizes (feet): <strong>2×2, 1×2, 2×3, 2×4, 1×3, 1×4</strong>.<br>Thicknesses: <strong>20mm, 30mm, 40mm, 50mm</strong>.<br>Bulk and project-specific orders are welcome — patterns include hexagon, brick-bond, large-format and grass-joint.",
      chips: ["Get a quote", "See parking gallery", "Talk to a person"]
    },
    {
      id: "services",
      k: ["service", "do you install", "installation", "transport", "delivery", "construction", "build temple", "architecture"],
      a: "Our services: <strong>temple construction, temple stone manufacturing, stone carving, temple architecture components, parking stone supply, transportation, installation</strong> and custom stone work — projects across India.",
      chips: ["Get a quote", "Coverage area", "Contact details"]
    },
    {
      id: "factory",
      k: ["factory", "process", "how do you make", "manufactur", "cutting", "finishing", "quality", "machinery"],
      a: "We run our own stone factory. The process is: <strong>Stone selection → Cutting → Shaping → Finishing → Quality check → Packing → Transportation</strong>. Having our own unit means better control over quality and custom sizing.",
      chips: ["Products", "Get a quote"]
    },
    {
      id: "projects",
      k: ["project", "portfolio", "work done", "past work", "reference", "example"],
      a: "KMG undertakes temple construction, temple stonework and parking / paving supply across India. You can see recent parking &amp; paving work in the <a href=\"#parking-gallery\">Parking gallery</a> and stone-yard photos in the <a href=\"#gallery\">Gallery</a>.",
      chips: ["Get a quote", "Contact details"]
    },
    {
      id: "coverage",
      k: ["where", "location", "area", "city", "state", "deliver to", "pan india", "which places", "serve"],
      a: "We take on temple and stone projects and supply stone <strong>across India</strong>, with transportation support to the project site."
    },
    {
      id: "quote",
      k: ["quote", "quotation", "estimate", "enquiry", "inquiry", "enquire", "order", "buy", "purchase", "requirement"],
      a: "Happy to help with a quote. Please share your <strong>requirement, quantity / size and location</strong> — I'll open the enquiry form for you, or you can send it straight to WhatsApp.",
      action: "quote",
      chips: ["Open enquiry form", "Send on WhatsApp"]
    },
    {
      id: "price",
      k: ["price", "cost", "rate", "how much", "per sqft", "per piece", "charges", "budget"],
      a: "Pricing depends on the stone type, size, thickness, finish and quantity. Share those details and your location and the KMG team will give you a rate — shall I open the enquiry form?",
      action: "quote",
      chips: ["Open enquiry form", "Send on WhatsApp"]
    },
    {
      id: "contact",
      k: ["contact", "phone", "call", "number", "mobile", "reach", "talk", "speak", "whatsapp", "email", "address"],
      a: "You can reach KMG Stones here:<ul><li>📞 <a href=\"tel:9108318319\">" + PHONE1 + "</a></li><li>📞 <a href=\"tel:9535988986\">" + PHONE2 + "</a></li><li>📱 <a href=\"" + WA + "\" target=\"_blank\" rel=\"noopener\">WhatsApp</a></li></ul>Email and the factory address are being added shortly.",
      chips: ["Get a quote", "Business hours"]
    },
    {
      id: "hours",
      k: ["hours", "timing", "open", "working days", "when are you open", "closed"],
      a: "Working hours aren't published yet — the quickest way to confirm availability is a quick call or WhatsApp to " + PHONE1 + "."
    },
    {
      id: "founder",
      k: ["founder", "owner", "who runs", "managing director", "about the company", "who are you", "history"],
      a: "KMG Stones is led by its Founder &amp; Managing Director, and was started to build a trusted name in temple construction, stone craftsmanship and stone manufacturing, serving projects across India."
    },
    {
      id: "thanks",
      k: ["thanks", "thank you", "thankyou", "great", "ok thanks", "nice"],
      a: "You're welcome! If you'd like a quote, share your requirement and location and I'll pass it to the KMG team."
    }
  ];

  var DEFAULT_CHIPS = ["Parking stone sizes", "Temple stone list", "Services", "Get a quote", "Contact details"];

  var CHIP_QUERY = {
    "Parking stone sizes": "parking stone sizes and thickness",
    "Temple stone list": "temple stone products",
    "Temple stone products": "temple stone products",
    "Services": "what services do you offer",
    "Get a quote": "i want a quote",
    "Open enquiry form": "__form__",
    "Send on WhatsApp": "__wa__",
    "Contact details": "contact details",
    "Business hours": "business hours",
    "Coverage area": "which areas do you cover",
    "See parking gallery": "__gallery__",
    "Talk to a person": "__wa__"
  };

  /* ---------------- helpers ---------------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function addMsg(html, who) {
    var m = el("div", "asst__msg asst__msg--" + who, html);
    log.appendChild(m);
    scrollDown();
  }

  function setChips(list) {
    chipsBox.innerHTML = "";
    (list || DEFAULT_CHIPS).forEach(function (label) {
      var b = el("button", null, label);
      b.type = "button";
      b.addEventListener("click", function () { handleChip(label); });
      chipsBox.appendChild(b);
    });
  }

  function typing(cb) {
    var t = el("div", "asst__typing", "<i></i><i></i><i></i>");
    log.appendChild(t);
    scrollDown();
    setTimeout(function () { t.remove(); cb(); }, reduced ? 120 : 460);
  }

  function match(text) {
    var q = " " + text.toLowerCase().replace(/[^\w\s×x]/g, " ") + " ";
    var best = null, bestScore = 0;
    KB.forEach(function (entry) {
      var score = 0;
      entry.k.forEach(function (kw) {
        if (q.indexOf(kw.toLowerCase()) !== -1) score += kw.length;
      });
      if (score > bestScore) { bestScore = score; best = entry; }
    });
    return bestScore > 0 ? best : null;
  }

  function openForm() {
    var target = document.getElementById("contact");
    if (target) target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    var first = document.querySelector("#enquiryForm input[name='name']");
    if (first) setTimeout(function () { try { first.focus(); } catch (e) {} }, reduced ? 0 : 600);
  }

  function respond(text) {
    addMsg(escapeText(text), "user");
    typing(function () {
      var hit = match(text);
      if (!hit) {
        missCount++;
        if (missCount >= 2) {
          addMsg("I'm a simple assistant and might not have that answer. The KMG team can help directly:", "bot");
          setChips(["Send on WhatsApp", "Contact details", "Get a quote"]);
        } else {
          addMsg("I didn't quite catch that. I can help with <strong>products, parking stone sizes, services, the factory, coverage area, contact details</strong> or a <strong>quote</strong>.", "bot");
          setChips(DEFAULT_CHIPS);
        }
        return;
      }
      missCount = 0;
      addMsg(hit.a, "bot");
      if (hit.action === "quote") {
        openForm();
      }
      setChips(hit.chips || DEFAULT_CHIPS);
    });
  }

  function handleChip(label) {
    var q = CHIP_QUERY[label] || label;
    if (q === "__wa__") {
      addMsg(escapeText(label), "user");
      window.open(WA + "?text=" + encodeURIComponent("Hi KMG Stones, I have a question about your stone products."), "_blank", "noopener");
      typing(function () { addMsg("Opening WhatsApp so you can chat with the KMG team directly.", "bot"); setChips(DEFAULT_CHIPS); });
      return;
    }
    if (q === "__form__") {
      addMsg(escapeText(label), "user");
      typing(function () { addMsg("I've scrolled to the enquiry form below — fill it in and it goes straight to KMG on WhatsApp.", "bot"); openForm(); setChips(DEFAULT_CHIPS); });
      return;
    }
    if (q === "__gallery__") {
      addMsg(escapeText(label), "user");
      var g = document.getElementById("parking-gallery");
      if (g) g.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      typing(function () { addMsg("Scrolled to the parking &amp; paving gallery.", "bot"); setChips(DEFAULT_CHIPS); });
      return;
    }
    respond(q);
  }

  function escapeText(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function start() {
    if (started) return;
    started = true;
    addMsg("👋 Hi! I'm the <strong>KMG Assistant</strong>. Ask me about our temple stones, parking / paving stones, services or a quote.", "bot");
    setChips(DEFAULT_CHIPS);
  }

  /* ---------------- open / close ---------------- */
  function open() {
    panel.hidden = false;
    wrap.classList.add("is-open");
    fab.setAttribute("aria-expanded", "true");
    start();
    setTimeout(function () { try { input.focus(); } catch (e) {} }, 60);
  }
  function close() {
    panel.hidden = true;
    wrap.classList.remove("is-open");
    fab.setAttribute("aria-expanded", "false");
    try { fab.focus(); } catch (e) {}
  }

  fab.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) close();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    input.value = "";
    respond(v);
  });
})();
