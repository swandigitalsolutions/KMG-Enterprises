/* =========================================================
   KMG ENTERPRISES — 3D scenes (Three.js r128, global THREE)
   - Hero: procedural South-Indian gopuram temple, orbit + parallax
   - Products: interactive 3D stone viewer (drag to rotate)
   ========================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeof THREE === "undefined") {
    document.body.classList.add("no-webgl");
    return;
  }

  /* ---------- procedural stone texture (diffuse + bump) ----------
     One canvas, reused by every stone material — gives the flat
     procedural geometry a believable weathered-granite surface
     without shipping any image files. */
  var _stoneTex = null;
  function stoneTexture() {
    if (_stoneTex) return _stoneTex;
    var S = 256;
    var c = document.createElement("canvas");
    c.width = c.height = S;
    var x = c.getContext("2d");
    x.fillStyle = "#b9ab92";
    x.fillRect(0, 0, S, S);
    /* mineral speckle */
    for (var i = 0; i < 4200; i++) {
      var g = 150 + ((Math.random() * 90) | 0);
      var a = 0.04 + Math.random() * 0.16;
      x.fillStyle = "rgba(" + g + "," + (g - 12) + "," + (g - 30) + "," + a + ")";
      var r = Math.random() * 1.7;
      x.fillRect(Math.random() * S, Math.random() * S, r, r);
    }
    /* soft blotches for tonal variation */
    for (var j = 0; j < 26; j++) {
      var rad = 12 + Math.random() * 44;
      var grd = x.createRadialGradient(Math.random() * S, Math.random() * S, 0, Math.random() * S, Math.random() * S, rad);
      grd.addColorStop(0, "rgba(90,78,60," + (0.05 + Math.random() * 0.09).toFixed(3) + ")");
      grd.addColorStop(1, "rgba(90,78,60,0)");
      x.fillStyle = grd;
      x.fillRect(0, 0, S, S);
    }
    /* a few chisel hairlines */
    x.strokeStyle = "rgba(60,50,38,.20)";
    for (var k = 0; k < 18; k++) {
      x.lineWidth = Math.random() * 1.2;
      x.beginPath();
      x.moveTo(Math.random() * S, Math.random() * S);
      x.lineTo(Math.random() * S, Math.random() * S);
      x.stroke();
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    t.anisotropy = 4;
    _stoneTex = t;
    return t;
  }

  /* ---------- shared materials ---------- */
  function mats() {
    var tex = stoneTexture();
    return {
      stone: new THREE.MeshStandardMaterial({ color: 0xbcae95, roughness: 0.94, metalness: 0.02, map: tex, bumpMap: tex, bumpScale: 0.03 }),
      stoneDark: new THREE.MeshStandardMaterial({ color: 0x6f6455, roughness: 1.0, metalness: 0.0, map: tex, bumpMap: tex, bumpScale: 0.045 }),
      stoneWarm: new THREE.MeshStandardMaterial({ color: 0xcdb98f, roughness: 0.82, metalness: 0.03, map: tex, bumpMap: tex, bumpScale: 0.025 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xe8b84b, roughness: 0.32, metalness: 0.85, emissive: 0x3a2a08, emissiveIntensity: 0.45 })
    };
  }

  /* ============================================================
     TEMPLE BUILDER
     ============================================================ */
  function buildTemple() {
    var g = new THREE.Group();
    var m = mats();

    function block(w, h, d, y, mat) {
      var mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat || m.stone);
      mesh.position.y = y;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      g.add(mesh);
      return mesh;
    }

    /* plinth */
    block(15, 1.2, 15, 0.6, m.stoneDark);
    block(13.4, 1.0, 13.4, 1.6);
    block(11.8, 0.7, 11.8, 2.35);

    /* tapering gopuram tiers */
    var y = 2.7, w = 10, d = 10, tiers = 9;
    for (var i = 0; i < tiers; i++) {
      var th = 1.55 - i * 0.05;
      block(w, th, d, y + th / 2);
      block(w + 0.55, 0.22, d + 0.55, y + th + 0.11, m.stoneDark); // cornice
      /* niche shadows on front face */
      if (i < 5) {
        var niche = new THREE.Mesh(new THREE.BoxGeometry(w * 0.16, th * 0.55, 0.25), m.stoneDark);
        niche.position.set(0, y + th * 0.52, d / 2 + 0.02);
        g.add(niche);
      }
      y += th + 0.22;
      w *= 0.865;
      d *= 0.865;
    }

    /* shikhara cap + gold finial */
    var cap = new THREE.Mesh(new THREE.ConeGeometry(w * 0.82, 1.7, 6), m.stoneWarm);
    cap.position.y = y + 0.85;
    cap.rotation.y = Math.PI / 6;
    cap.castShadow = true;
    g.add(cap);

    var pot = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 14), m.gold);
    pot.position.y = y + 2.0;
    pot.castShadow = true;
    g.add(pot);
    var spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.0, 8), m.gold);
    spike.position.y = y + 2.75;
    g.add(spike);

    /* front mandapam — pillars + slab roof */
    var plinthTop = 2.7;
    var xs = [-4.6, -1.55, 1.55, 4.6];
    var zs = [5.6, 9.1];
    xs.forEach(function (x) {
      zs.forEach(function (z) {
        var col = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.2, 0.8), m.stone);
        col.position.set(x, plinthTop + 2.1, z);
        col.castShadow = true;
        col.receiveShadow = true;
        g.add(col);
        var capital = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.42, 1.3), m.stoneDark);
        capital.position.set(x, plinthTop + 4.35, z);
        capital.castShadow = true;
        g.add(capital);
        var base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.2), m.stoneDark);
        base.position.set(x, plinthTop + 0.2, z);
        g.add(base);
      });
    });
    var roof = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.6, 5.4), m.stone);
    roof.position.set(0, plinthTop + 4.9, 7.35);
    roof.castShadow = true;
    g.add(roof);
    var roof2 = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.32, 6.2), m.stoneDark);
    roof2.position.set(0, plinthTop + 5.25, 7.35);
    g.add(roof2);

    /* entrance steps */
    for (var s = 0; s < 3; s++) {
      var step = new THREE.Mesh(new THREE.BoxGeometry(6 - s * 0.6, 0.42, 1.1), m.stoneWarm);
      step.position.set(0, 0.2 + s * 0.42, 11.4 - s * 0.7);
      step.castShadow = true;
      step.receiveShadow = true;
      g.add(step);
    }

    /* corner guardian blocks */
    [[-6.4, 6.4], [6.4, 6.4]].forEach(function (p) {
      var gd = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.2, 1.4), m.stoneWarm);
      gd.position.set(p[0], plinthTop + 1.6, p[1]);
      gd.castShadow = true;
      g.add(gd);
    });

    g.scale.setScalar(0.92);
    return g;
  }

  function makeDust(count) {
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      var r = 7 + Math.random() * 24;
      var a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.random() * 26;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({
      color: 0xffcf8a, size: 0.09, transparent: true, opacity: 0.55,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    return new THREE.Points(geo, mat);
  }

  /* ============================================================
     HERO SCENE
     ============================================================ */
  function initHero(canvas) {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if ("outputEncoding" in renderer) renderer.outputEncoding = THREE.sRGBEncoding;
    if ("toneMapping" in renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
    }

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1c1a19, 0.026);

    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 260);

    var hemi = new THREE.HemisphereLight(0x9fb2d8, 0x181209, 0.42);
    scene.add(hemi);
    scene.add(new THREE.AmbientLight(0xffe9cf, 0.14));

    var key = new THREE.DirectionalLight(0xffdca6, 2.7);
    key.position.set(14, 20, 10);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 80;
    key.shadow.camera.left = -26;
    key.shadow.camera.right = 26;
    key.shadow.camera.top = 30;
    key.shadow.camera.bottom = -6;
    key.shadow.bias = -0.0006;
    scene.add(key);

    var rim = new THREE.DirectionalLight(0xff9a3c, 1.5);
    rim.position.set(-16, 8, -12);
    scene.add(rim);

    var fill = new THREE.PointLight(0xffcf8a, 0.7, 90);
    fill.position.set(-8, 5, 14);
    scene.add(fill);

    var ground = new THREE.Mesh(
      new THREE.CircleGeometry(80, 64),
      new THREE.MeshStandardMaterial({ color: 0x252019, roughness: 1, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    scene.add(ground);

    var temple = buildTemple();
    temple.position.y = -2;
    temple.scale.setScalar(0.82);
    scene.add(temple);

    var dust = makeDust(280);
    scene.add(dust);

    /* orbit state — target offset left so the temple sits right-of-centre */
    var isNarrow = window.matchMedia("(max-width: 860px)").matches;
    var target = new THREE.Vector3(isNarrow ? 0 : -4.5, 8.5, 0);
    var theta = 0.6, phi = 1.14, radius = isNarrow ? 54 : 49;
    var tTheta = 0.6, tPhi = 1.14;
    var dragging = false, lx = 0, ly = 0, idle = 0;
    var scrollF = 0;

    canvas.addEventListener("pointerdown", function (e) {
      dragging = true; lx = e.clientX; ly = e.clientY; idle = 0;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    canvas.addEventListener("pointerup", function () { dragging = false; });
    canvas.addEventListener("pointercancel", function () { dragging = false; });
    canvas.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      tTheta -= (e.clientX - lx) * 0.005;
      tPhi -= (e.clientY - ly) * 0.004;
      tPhi = Math.max(0.7, Math.min(1.42, tPhi));
      lx = e.clientX; ly = e.clientY; idle = 0;
    });

    window.addEventListener("scroll", function () {
      scrollF = Math.min(1.4, window.scrollY / window.innerHeight);
    }, { passive: true });

    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    }

    var running = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        running = es[0].isIntersecting;
        if (running) loop();
      }, { threshold: 0.01 }).observe(canvas);
    }

    var clock = new THREE.Clock();
    function loop() {
      if (!running) return;
      requestAnimationFrame(loop);
      var dt = Math.min(clock.getDelta(), 0.05);
      idle += dt;
      resize();

      if (!dragging && idle > 1.2 && !reduced) tTheta += dt * 0.11;
      theta += (tTheta - theta) * 0.06;
      phi += (tPhi - phi) * 0.06;

      var r = radius + scrollF * 12;
      target.y = 7 + scrollF * 5;
      camera.position.x = target.x + r * Math.sin(phi) * Math.sin(theta);
      camera.position.y = target.y + r * Math.cos(phi);
      camera.position.z = target.z + r * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(target);

      if (!reduced) temple.rotation.y += dt * 0.02;
      dust.rotation.y += dt * 0.03;
      dust.position.y = Math.sin(clock.elapsedTime * 0.3) * 0.6;
      dust.material.opacity = 0.42 + Math.sin(clock.elapsedTime * 0.9) * 0.14;

      renderer.render(scene, camera);
    }
    resize();
    loop();
  }

  /* ============================================================
     PRODUCT VIEWER
     ============================================================ */
  function initViewer(canvas) {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if ("outputEncoding" in renderer) renderer.outputEncoding = THREE.sRGBEncoding;
    if ("toneMapping" in renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
    }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 2.4, 9);

    scene.add(new THREE.HemisphereLight(0xbcd0ff, 0x1c150d, 0.75));
    var d1 = new THREE.DirectionalLight(0xffe6bf, 2.0);
    d1.position.set(6, 9, 7);
    d1.castShadow = true;
    d1.shadow.mapSize.set(1024, 1024);
    d1.shadow.camera.near = 1;
    d1.shadow.camera.far = 40;
    scene.add(d1);
    var d2 = new THREE.DirectionalLight(0xff9d3a, 0.85);
    d2.position.set(-7, 4, -5);
    scene.add(d2);
    var rimP = new THREE.PointLight(0xffd9a0, 0.6, 40);
    rimP.position.set(0, 3, -6);
    scene.add(rimP);

    var floor = new THREE.Mesh(
      new THREE.CircleGeometry(12, 48),
      new THREE.MeshStandardMaterial({ color: 0x241f1c, roughness: 1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.7;
    floor.receiveShadow = true;
    scene.add(floor);

    var holder = new THREE.Group();
    scene.add(holder);

    var m = mats();

    function carveRings(mesh, radius, count, from, step) {
      for (var i = 0; i < count; i++) {
        var t = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.06, 8, 24), m.stoneDark);
        t.rotation.x = Math.PI / 2;
        t.position.y = from + i * step;
        t.castShadow = true;
        mesh.add(t);
      }
    }

    var models = {
      pillar: function () {
        var grp = new THREE.Group();
        var base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 1.5), m.stoneDark);
        base.position.y = -1.4; base.castShadow = true; base.receiveShadow = true; grp.add(base);
        var base2 = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.4, 1.15), m.stone);
        base2.position.y = -1.05; base2.castShadow = true; grp.add(base2);
        var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 3.0, 16), m.stone);
        shaft.position.y = 0.5; shaft.castShadow = true; grp.add(shaft);
        carveRings(shaft, 0.46, 3, -0.9, 0.9);
        var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.42, 0.35, 16), m.stoneWarm);
        neck.position.y = 2.15; grp.add(neck);
        var cap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 1.4), m.stoneDark);
        cap.position.y = 2.5; cap.castShadow = true; grp.add(cap);
        var abacus = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.28, 1.7), m.stone);
        abacus.position.y = 2.82; abacus.castShadow = true; grp.add(abacus);
        return grp;
      },
      mandapam: function () {
        var grp = new THREE.Group();
        var slab = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.0, 2.2), m.stone);
        slab.castShadow = true; slab.receiveShadow = true; grp.add(slab);
        var lip = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.28, 2.6), m.stoneDark);
        lip.position.y = 0.6; lip.castShadow = true; grp.add(lip);
        var top = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.3, 1.7), m.stoneWarm);
        top.position.y = 0.9; top.castShadow = true; grp.add(top);
        for (var i = -1; i <= 1; i++) {
          var groove = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 2.24), m.stoneDark);
          groove.position.set(i * 0.9, 0.05, 0); grp.add(groove);
        }
        grp.position.y = -0.6;
        return grp;
      },
      paving: function () {
        var grp = new THREE.Group();
        var cols = 3, rows = 2, size = 1.05, gap = 0.09;
        for (var x = 0; x < cols; x++) {
          for (var z = 0; z < rows; z++) {
            var h = 0.34 + Math.random() * 0.05;
            var slab = new THREE.Mesh(new THREE.BoxGeometry(size, h, size), m.stone.clone());
            slab.material.color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.05);
            slab.position.set((x - (cols - 1) / 2) * (size + gap), -1.4 + h / 2, (z - (rows - 1) / 2) * (size + gap));
            slab.castShadow = true; slab.receiveShadow = true;
            grp.add(slab);
          }
        }
        return grp;
      },
      gopuram: function () {
        var grp = new THREE.Group();
        var y = -1.3, w = 2.6, d = 2.0;
        for (var i = 0; i < 5; i++) {
          var th = 0.7;
          var b = new THREE.Mesh(new THREE.BoxGeometry(w, th, d), m.stone);
          b.position.y = y + th / 2; b.castShadow = true; b.receiveShadow = true; grp.add(b);
          var cor = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.14, d + 0.2), m.stoneDark);
          cor.position.y = y + th + 0.07; grp.add(cor);
          y += th + 0.14; w *= 0.8; d *= 0.8;
        }
        var cap = new THREE.Mesh(new THREE.ConeGeometry(w * 0.8, 0.7, 6), m.stoneWarm);
        cap.position.y = y + 0.35; cap.castShadow = true; grp.add(cap);
        var fin = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), m.gold);
        fin.position.y = y + 0.8; grp.add(fin);
        return grp;
      }
    };

    var copy = {
      pillar: ["Temple Pillar", "Precision-cut and carved monolithic pillars with moulded base and capital, shaped to traditional temple proportions."],
      mandapam: ["Mandapam Stone", "Heavy dressed slabs and platform stones for the temple hall — flat, true and beveled for tight joints."],
      paving: ["Paving Stone", "Calibrated parking and paving stones in 20–50mm thickness and standard sizes, for driveways, yards and walkways."],
      gopuram: ["Gopuram Block", "Stacked, tapering tower blocks with cornice lips — the stepped units that form a temple gopuram."]
    };

    var current = null;
    function show(key) {
      if (current) holder.remove(current);
      current = models[key]();
      holder.add(current);
      var c = document.getElementById("viewerCopy");
      if (c && copy[key]) c.innerHTML = "<h3>" + copy[key][0] + "</h3><p>" + copy[key][1] + "</p>";
    }
    show("pillar");

    var tabs = document.querySelectorAll(".viewer__tabs button");
    tabs.forEach(function (b) {
      b.addEventListener("click", function () {
        tabs.forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        show(b.getAttribute("data-model"));
      });
    });

    var dragging = false, lx = 0, vel = 0, rot = 0.5, idle = 0;
    canvas.addEventListener("pointerdown", function (e) { dragging = true; lx = e.clientX; idle = 0; });
    window.addEventListener("pointerup", function () { dragging = false; });
    canvas.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      vel = (e.clientX - lx) * 0.01;
      rot += vel; lx = e.clientX; idle = 0;
    });

    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    }

    var vis = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        vis = es[0].isIntersecting;
        if (vis) tick();
      }, { threshold: 0.05 }).observe(canvas);
    }

    var clock = new THREE.Clock();
    function tick() {
      if (!vis) return;
      requestAnimationFrame(tick);
      var dt = Math.min(clock.getDelta(), 0.05);
      idle += dt;
      resize();
      if (!dragging) {
        vel *= 0.94;
        rot += vel;
        if (idle > 1 && !reduced) rot += dt * 0.35;
      }
      holder.rotation.y = rot;
      holder.position.y = reduced ? 0 : Math.sin(clock.elapsedTime * 1.1) * 0.07;
      renderer.render(scene, camera);
    }
    resize();
    tick();
  }

  /* ---------- boot ---------- */
  function boot() {
    var hero = document.getElementById("hero-canvas");
    var prod = document.getElementById("product-canvas");
    try { if (hero) initHero(hero); } catch (e) { document.body.classList.add("no-webgl"); }
    try { if (prod) initViewer(prod); } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
