AFRAME.registerComponent("corn-platter", {
  init() {
    const make = (tag, attributes, parent = this.el) => {
      const element = document.createElement(tag);
      Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
      parent.appendChild(element);
      return element;
    };

    make("a-cylinder", {
      radius: 0.44, height: 0.055, position: "0 0.025 0",
      material: "color: #f0e5ce; roughness: 0.3"
    });
    make("a-cylinder", {
      radius: 0.37, height: 0.012, position: "0 0.058 0",
      material: "color: #d7c6a5; roughness: 0.4"
    });
    make("a-torus", {
      radius: 0.405, "radius-tubular": 0.018, position: "0 0.06 0",
      rotation: "90 0 0", material: "color: #64816b; roughness: 0.35"
    });

    const kernelColors = ["#f3d45d", "#e7bb3e", "#f7df78", "#efca4d"];
    const cobs = [
      { z: -0.2, angle: -12, color: "#b8812a" },
      { z: 0, angle: 0, color: "#a97325" },
      { z: 0.2, angle: 12, color: "#bd8a31" }
    ];

    cobs.forEach((cob) => {
      const ear = make("a-entity", {
        position: `0 0.13 ${cob.z}`,
        rotation: `0 ${cob.angle} 0`
      });
      make("a-cylinder", {
        radius: 0.062, height: 0.53, position: "0 0 0",
        rotation: "0 0 90",
        material: `color: ${cob.color}; roughness: 0.72`
      }, ear);

      for (let row = 0; row < 9; row += 1) {
        const angle = (Math.PI * 2 * row) / 9;
        for (let column = 0; column < 15; column += 1) {
          const x = -0.235 + column * 0.0335;
          const radius = 0.064;
          const y = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          make("a-sphere", {
            radius: 0.024,
            position: `${x} ${y} ${z}`,
            scale: "1.02 0.92 0.88",
            material: `color: ${kernelColors[(row * 2 + column) % kernelColors.length]}; roughness: 0.42`
          }, ear);
        }
      }

      make("a-cone", {
        "radius-bottom": 0.09, "radius-top": 0.005, height: 0.32,
        position: "-0.3 -0.01 0", rotation: "0 0 78",
        material: "color: #53753d; roughness: 0.88"
      }, ear);
      make("a-cone", {
        "radius-bottom": 0.075, "radius-top": 0.004, height: 0.28,
        position: "0.3 -0.015 0.01", rotation: "0 0 -80",
        material: "color: #6b8b45; roughness: 0.88"
      }, ear);
    });

    const looseKernels = [
      [-0.31, 0.12, -0.27], [-0.23, 0.12, -0.3], [-0.15, 0.12, -0.29],
      [0.12, 0.12, -0.3], [0.22, 0.12, -0.29], [0.31, 0.12, -0.25],
      [-0.32, 0.12, 0.27], [-0.24, 0.12, 0.3], [-0.14, 0.12, 0.3],
      [0.16, 0.12, 0.3], [0.25, 0.12, 0.29], [0.33, 0.12, 0.24]
    ];
    looseKernels.forEach(([x, y, z], index) => {
      make("a-sphere", {
        radius: 0.032,
        position: `${x} ${y} ${z}`,
        scale: "1 0.85 0.9",
        material: `color: ${kernelColors[index % kernelColors.length]}; roughness: 0.46`
      });
    });

    make("a-sphere", {
      radius: 0.055, position: "0.32 0.08 0.27", scale: "1.5 0.3 0.65",
      material: "color: #538047; roughness: 0.9"
    });
    make("a-sphere", {
      radius: 0.055, position: "0.32 0.08 -0.27", scale: "1.5 0.3 0.65",
      material: "color: #6e974d; roughness: 0.9"
    });
  }
});

AFRAME.registerComponent("arrow-walk", {
  schema: { speed: { default: 3.2 } },
  init() {
    this.keys = new Set();
    this.onDown = (event) => {
      if (!document.querySelector("#modal")?.classList.contains("hidden")
        || !document.querySelector("#resume-overlay")?.classList.contains("hidden")) return;
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"].includes(event.code)) return;
      event.preventDefault();
      this.keys.add(event.code);
    };
    this.onUp = (event) => this.keys.delete(event.code);
    window.addEventListener("keydown", this.onDown);
    window.addEventListener("keyup", this.onUp);
    this.direction = new THREE.Vector3();
    this.forward = new THREE.Vector3();
    this.right = new THREE.Vector3();
    this.cameraEl = document.querySelector("#camera");
    this.playerRadius = 0.32;
    this.obstacles = [
      { type: "box", x: -0.55, z: 0.22, halfWidth: 2.31, halfDepth: 0.47 },
      { type: "box", x: 0, z: -4.5, halfWidth: 2.24, halfDepth: 1.24 },
      { type: "box", x: -4.95, z: -3.55, halfWidth: 0.72, halfDepth: 0.9 },
      { type: "box", x: -4.95, z: -6.65, halfWidth: 0.72, halfDepth: 0.9 },
      { type: "box", x: -3.15, z: 5.55, halfWidth: 0.85, halfDepth: 0.675 },
      { type: "box", x: 3.15, z: 5.55, halfWidth: 0.85, halfDepth: 0.675 },
      { type: "box", x: -3.15, z: 4.27, halfWidth: 0.42, halfDepth: 0.42 },
      { type: "box", x: -3.15, z: 6.83, halfWidth: 0.42, halfDepth: 0.42 },
      { type: "box", x: -4.43, z: 5.55, halfWidth: 0.42, halfDepth: 0.42 },
      { type: "box", x: -1.87, z: 5.55, halfWidth: 0.42, halfDepth: 0.42 },
      { type: "box", x: 3.15, z: 4.27, halfWidth: 0.42, halfDepth: 0.42 },
      { type: "box", x: 3.15, z: 6.83, halfWidth: 0.42, halfDepth: 0.42 },
      { type: "box", x: 1.87, z: 5.55, halfWidth: 0.42, halfDepth: 0.42 },
      { type: "box", x: 4.43, z: 5.55, halfWidth: 0.42, halfDepth: 0.42 },
      { type: "box", x: 0, z: 8.34, halfWidth: 1.75, halfDepth: 0.54 }
    ];
    this.canOccupy = (x, z) => {
      if (x < -5.35 || x > 5.35 || z < -8.25 || z > 8.25) return false;

      const wallDepth = 0.15 + this.playerRadius;
      const doorwayHalfWidth = 2.9 - this.playerRadius;
      if (Math.abs(z) < wallDepth && Math.abs(x) > doorwayHalfWidth) return false;

      return !this.obstacles.some((obstacle) => {
        if (obstacle.type === "circle") {
          const dx = x - obstacle.x;
          const dz = z - obstacle.z;
          const radius = obstacle.radius + this.playerRadius;
          return dx * dx + dz * dz < radius * radius;
        }

        const closestX = THREE.MathUtils.clamp(x, obstacle.x - obstacle.halfWidth, obstacle.x + obstacle.halfWidth);
        const closestZ = THREE.MathUtils.clamp(z, obstacle.z - obstacle.halfDepth, obstacle.z + obstacle.halfDepth);
        const dx = x - closestX;
        const dz = z - closestZ;
        return dx * dx + dz * dz < this.playerRadius * this.playerRadius;
      });
    };
  },
  tick(time, delta) {
    if (!document.querySelector("#modal")?.classList.contains("hidden")
      || !document.querySelector("#resume-overlay")?.classList.contains("hidden")) {
      this.keys.clear();
      return;
    }
    const distance = this.data.speed * Math.min(delta / 1000, 0.05);
    const camera = this.cameraEl.getObject3D("camera");
    if (!camera) return;
    camera.getWorldDirection(this.forward);
    this.forward.y = 0;
    this.forward.normalize();
    this.right.set(-this.forward.z, 0, this.forward.x);
    this.direction.set(0, 0, 0);
    if (this.keys.has("ArrowUp") || this.keys.has("KeyW")) this.direction.add(this.forward);
    if (this.keys.has("ArrowDown") || this.keys.has("KeyS")) this.direction.sub(this.forward);
    if (this.keys.has("ArrowRight") || this.keys.has("KeyD")) this.direction.add(this.right);
    if (this.keys.has("ArrowLeft") || this.keys.has("KeyA")) this.direction.sub(this.right);
    if (!this.direction.lengthSq()) return;
    this.direction.normalize().multiplyScalar(distance);
    const position = this.el.object3D.position;
    const nextX = THREE.MathUtils.clamp(position.x + this.direction.x, -5.35, 5.35);
    if (this.canOccupy(nextX, position.z)) position.x = nextX;

    const nextZ = THREE.MathUtils.clamp(position.z + this.direction.z, -8.25, 8.25);
    if (this.canOccupy(position.x, nextZ)) position.z = nextZ;
  },
  remove() {
    window.removeEventListener("keydown", this.onDown);
    window.removeEventListener("keyup", this.onUp);
  }
});

AFRAME.registerComponent("mouse-look", {
  schema: { sensitivity: { default: 0.0045 } },
  init() {
    this.previousPointer = null;
    this.yawRotation = new THREE.Quaternion();
    this.pitchRotation = new THREE.Quaternion();
    this.worldUp = new THREE.Vector3(0, 1, 0);
    this.localRight = new THREE.Vector3(1, 0, 0);
    this.onPointerMove = (event) => {
      if (event.pointerType === "touch") return;
      if (!document.querySelector("#modal")?.classList.contains("hidden")) return;
      if (!document.querySelector("#resume-overlay")?.classList.contains("hidden")) return;

      const pointerLocked = document.pointerLockElement === this.el.sceneEl.canvas;
      let deltaX;
      let deltaY;
      if (pointerLocked) {
        deltaX = event.movementX;
        deltaY = event.movementY;
      } else {
        const current = { x: event.clientX, y: event.clientY };
        if (!this.previousPointer) {
          this.previousPointer = current;
          return;
        }
        deltaX = current.x - this.previousPointer.x;
        deltaY = current.y - this.previousPointer.y;
        this.previousPointer = current;
      }

      this.yawRotation.setFromAxisAngle(this.worldUp, -deltaX * this.data.sensitivity);
      this.pitchRotation.setFromAxisAngle(this.localRight, -deltaY * this.data.sensitivity);
      this.el.object3D.quaternion
        .premultiply(this.yawRotation)
        .multiply(this.pitchRotation);
    };
    this.resetPointer = () => { this.previousPointer = null; };
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("blur", this.resetPointer);
  },
  remove() {
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("blur", this.resetPointer);
  }
});

(() => {
  const modal = document.querySelector("#modal");
  const title = document.querySelector("#modal-title");
  const body = document.querySelector("#modal-body");
  const feedback = document.querySelector("#feedback");
  const actionButton = document.querySelector("#action-btn");
  const backButton = document.querySelector("#back-btn");
  const panelCount = document.querySelector("#panel-count");
  const closeButton = document.querySelector("#close-modal");
  const timer = document.querySelector("#timer");
  const toast = document.querySelector("#toast");
  const finishScreen = document.querySelector("#finish-screen");
  const finishRoom = document.querySelector("#finish-room");
  const mouseReticle = document.querySelector("#mouse-reticle");
  const resumeOverlay = document.querySelector("#resume-overlay");
  const rig = document.querySelector("#rig");
  const hud = document.querySelector(".hud");
  const instructions = document.querySelector(".instructions");
  const found = new Set();
  let timeLeft = 12 * 60;
  let timeExpired = false;
  let leftActiveWindow = false;
  let resumeInProgress = false;
  let timerInterval;
  let toastTimeout;

  const clues = {
    maize: { code: "7", label: "Primer Código" },
    cuban: { code: "9", label: "Segundo Código" },
    soup: { code: "0", label: "Tercer Código" },
    chair: { code: "7", label: "Cuarto Código" },
    map: { code: "2", label: "Último Código" }
  };

  const scene = document.querySelector("a-scene");
  const sceneRaycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let captureMouse = null;

  const videoLink = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const setPanel = ({ heading, subtitle = "", content, count = "", action, actionText = "Comprobar respuesta", back }) => {
    if (document.pointerLockElement === scene.canvas) document.exitPointerLock();
    title.textContent = heading;
    title.classList.toggle("hidden", !heading);
    let panelSubtitle = modal.querySelector(".panel-subtitle");
    if (subtitle) {
      if (!panelSubtitle) {
        panelSubtitle = document.createElement("p");
        panelSubtitle.className = "panel-subtitle";
        title.insertAdjacentElement("afterend", panelSubtitle);
      }
      panelSubtitle.textContent = subtitle;
    } else {
      panelSubtitle?.remove();
    }
    body.innerHTML = content;
    panelCount.textContent = count;
    feedback.textContent = "";
    feedback.className = "feedback";
    actionButton.classList.toggle("hidden", !action);
    actionButton.textContent = actionText;
    actionButton.onclick = action || null;
    backButton.classList.toggle("hidden", !back);
    backButton.onclick = back || null;
    modal.classList.remove("hidden");
    setTimeout(() => {
      const input = body.querySelector("input");
      if (input) input.focus();
    }, 0);
  };
  const closePanel = () => {
    modal.classList.add("hidden");
    captureMouse?.();
  };
  const finishExperience = () => {
    window.clearInterval(timerInterval);
    modal.classList.add("hidden");
    toast.classList.remove("visible");
    hud.classList.add("hidden");
    instructions.classList.add("hidden");

    Array.from(scene.children).forEach((entity) => {
      if (!entity.object3D || entity === rig || entity === finishRoom || entity.hasAttribute("light")) return;
      entity.object3D.visible = false;
    });

    finishRoom.object3D.visible = true;
    rig.object3D.position.set(0, 0, 0);
    rig.object3D.rotation.set(0, 0, 0);
    const cameraEl = document.querySelector("#camera");
    cameraEl.object3D.rotation.set(0, 0, 0);
    cameraEl.components["mouse-look"]?.resetPointer();
    finishScreen.classList.remove("hidden");
  };
  const tell = (message) => {
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("visible"), 3000);
  };
  const success = (key) => {
    const clue = clues[key];
    found.add(key);
    const successMessages = {
      maize: "Ahora busca un pequeño mundo acuático. ¡Allí podría esconderse tu próxima pista!",
      cuban: "¡Buen trabajo! El segundo código es 9. Ahora busca por un plato caliente que reúne diferentes ingredientes en un solo caldo. ¡Tu próxima pista te espera allí!",
      soup: "¡Excelente trabajo! Tu aventura por la cultura gastronómica hispana continúa… ahora toma asiento para tu próxima pista.",
      chair: "¡Felicidades! Cada pista te acerca más a descubrir los secretos de la mesa hispana. Ahora busca un mapa que conecte las cocinas latinas de Estados Unidos. ¡Tu próxima pista te espera allí!",
      map: "¡Mapa reconstruido! El último código es 2. ¡Ahora busca la salida!"
    };
    feedback.textContent = successMessages[key] || `¡Excelente! ${clue.label}: ${clue.code}`;
    feedback.className = successMessages[key]
      ? `feedback success next-clue${key === "soup" ? " soup-next-clue" : ""}${key === "chair" ? " chair-next-clue" : ""}${key === "map" ? " map-next-clue" : ""}`
      : "feedback success";
    body.querySelectorAll("input, button.check-answer").forEach((element) => { element.disabled = true; });
    if (!body.querySelector(".code-reveal")) {
      const reveal = document.createElement("div");
      reveal.className = "code-reveal";
      reveal.innerHTML = `${clue.label}<strong>${clue.code}</strong>`;
      body.append(reveal);
    }
    actionButton.classList.add("hidden");
  };
  const inputValue = (selector) => body.querySelector(selector)?.value.trim().toLocaleUpperCase("es") || "";
  const check = (key, answer, hint) => {
    if (answer()) success(key);
    else {
      feedback.textContent = hint;
      feedback.className = "feedback";
    }
  };
  function showIntro() {
    setPanel({
      heading: "",
      count: "ARCHIVO 01",
      content: `<p class="lead">Año 2026. El Archivo de la Memoria Gastronómica de Estados Unidos está a punto de cerrar sus puertas. Un documento histórico que conecta varias generaciones de comunidades hispanas ha desaparecido. Tienes 12 minutos para reconstruir la historia y recuperar los códigos que protege el documento.</p><p class="lead">Cada pista representa una parte de la historia que han contribuido a la gastronomía hispana en Estados Unidos. El archivo espera.<br>Esta investigación empieza por el maíz.</p>`,
      actionText: "Comenzar la búsqueda",
      action: () => {
        closePanel();
        startTimer();
      }
    });
  }

  function startTimer() {
    if (timerInterval) return;
    timerInterval = window.setInterval(() => {
      if (timeLeft <= 0) {
        timer.textContent = "00:00";
        if (!timeExpired) {
          tell("El tiempo terminó. Puedes seguir explorando y completar el archivo.");
          timeExpired = true;
        }
        window.clearInterval(timerInterval);
        return;
      }
      timeLeft -= 1;
      timer.textContent = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;
    }, 1000);
  }

  function showMaize() {
    setPanel({
      heading: "Maíz, memoria y comunidad",
      count: "RETO 01 / 05 · VIDEO",
      content: `<p>Mira este video y después continúa con la actividad.</p><video class="clue-video" id="maize-video" src="Image/videomaiz.mp4" controls autoplay muted playsinline preload="metadata"></video>`,
      actionText: "Continuar al reto →",
      action: showMaizeChallenge
    });
    const video = body.querySelector("#maize-video");
    video.addEventListener("ended", showMaizeChallenge, { once: true });
    video.addEventListener("error", () => {
      feedback.textContent = "No se pudo cargar el video. Comprueba que el archivo esté en la carpeta Image.";
    }, { once: true });
    video.play().catch(() => {
      feedback.textContent = "Pulsa reproducir en el video para verlo; después continúa con el reto.";
    });
  }

  function showMaizeChallenge() {
    setPanel({
      heading: "Maíz, memoria y comunidad",
      count: "RETO 01 / 05",
      subtitle: "Para obtener el código uno; completa esta oración sobre la memoria del maíz.",
      content: `<p class="lead">El tamal es mucho más que <input class="inline-word" id="word1" aria-label="Primera palabra">: conserva <input class="inline-word" id="word2" aria-label="Segunda palabra"> familiares, <input class="inline-word" id="word3" aria-label="Tercera palabra"> cultural, historias de migración y espíritu <input class="inline-word" id="word4" aria-label="Cuarta palabra">.</p><p class="word-bank">BANCO DE PALABRAS: EMPRENDEDOR · COMIDA · IDENTIDAD · RECUERDOS</p>`,
      action: () => check("maize", () => inputValue("#word1") === "COMIDA" && inputValue("#word2") === "RECUERDOS" && inputValue("#word3") === "IDENTIDAD" && inputValue("#word4") === "EMPRENDEDOR", "Pista: c…, r…, i…, e…; revisa el orden de las palabras.")
    });
  }

  const cubanPages = [
    `<p>Aunque este emparedado tiene su origen en Cuba, donde era conocido como “mixto”, su evolución en Estados Unidos dio lugar a dos versiones distintas.</p>
    <p>En Tampa, la receta incluye un ingrediente clave: el salami. Variante que surgio entre los inmigrantes cubanos, españoles e italianos del barrio Ybor City.</p>
    <p>En contraste, en Miami, el sándwich es más cercano a la tradición original, con cerdo asado, jamón, queso suizo, pepinillos y mostaza en pan cubano, sin salami.</p>`,
    `<p>Para Tampa, el sándwich representa una herencia multicultural y obrera; para Miami, es un emblema más directo de la identidad cubana en el exilio.</p>
    <p>Este gustoso sándwich tiene su propio festival. El evento reune chefs y competidores de distintas partes del mundo que buscarán el título al mejor sándwich cubano.</p>
    <p>Uno de los atractivos más llamativos ha sido la creación del sándwich cubano más largo del mundo, con registros recientes que superan los 365 pies.</p>
    <p class="source">(Adapted from N+ Univision, 2026)</p>`
  ];

  function showCuban(page = 0) {
    if (page < cubanPages.length) {
      setPanel({
        heading: "Sándwich Cubano",
        count: `LECTURA ${page + 1} / ${cubanPages.length}`,
        content: `<div class="page-copy">${cubanPages[page]}</div>`,
        actionText: page < cubanPages.length - 1 ? "Continuar →" : "Responder preguntas →",
        action: () => page < cubanPages.length - 1 ? showCuban(page + 1) : showCubanQuiz(),
        back: page > 0 ? () => showCuban(page - 1) : null
      });
      return;
    }
    showCubanQuiz();
  }

  function showCubanQuiz() {
    setPanel({
      heading: "Tres preguntas, dos ciudades",
      count: "RETO 02 / 05",
      content: `<ol class="cuban-quiz">
        <li><fieldset class="choice-group"><legend>¿Qué ingrediente distingue la versión de Tampa?</legend>
          <label class="choice-option"><input type="radio" name="tampa" value="PEPINILLOS"><span>Pepinillos</span></label>
          <label class="choice-option"><input type="radio" name="tampa" value="SALAMI"><span>Salami</span></label>
          <label class="choice-option"><input type="radio" name="tampa" value="QUESO SUIZO"><span>Queso suizo</span></label>
        </fieldset></li>
        <li><fieldset class="choice-group"><legend>¿Qué ciudad tiene la versión sin salami?</legend>
          <label class="choice-option"><input type="radio" name="miami" value="TAMPA"><span>Tampa</span></label>
          <label class="choice-option"><input type="radio" name="miami" value="MIAMI"><span>Miami</span></label>
        </fieldset></li>
        <li>Usa la cantidad de letras de cada ciudad para formar el código. Escribe primero Tampa y luego Miami.
          <div class="answer-row"><label for="city-code">Código numérico:</label><input type="text" id="city-code" aria-label="Código numérico de las ciudades" inputmode="numeric" pattern="[0-9]*" maxlength="2" placeholder="00"></div>
        </li>
      </ol>`,
      action: () => check("cuban", () => body.querySelector('input[name="tampa"]:checked')?.value === "SALAMI" && body.querySelector('input[name="miami"]:checked')?.value === "MIAMI" && inputValue("#city-code") === "55", "Revisa tus selecciones y escribe el número de letras de Tampa seguido del de Miami.")
    });
  }

  function showSoup() {
    setPanel({
      heading: "¡El sancocho que une!",
      count: "RETO 03 / 05 · VIDEO",
      content: `<p>Mira este video y después continúa con la actividad.</p><video class="clue-video" id="soup-video" src="Image/videosancocho.mp4" controls autoplay muted playsinline preload="metadata"></video>`,
      actionText: "Continuar al reto →",
      action: showSoupChallenge
    });
    const video = body.querySelector("#soup-video");
    video.addEventListener("ended", showSoupChallenge, { once: true });
    video.addEventListener("error", () => {
      feedback.textContent = "No se pudo cargar el video. Comprueba que videosancocho.mp4 esté en la carpeta Image.";
    }, { once: true });
    video.play().catch(() => {
      feedback.textContent = "Pulsa reproducir en el video para verlo; después continúa con el reto.";
    });
  }

  function showSoupChallenge() {
    setPanel({
      heading: "El sancocho al revés",
      count: "RETO 03 / 05",
      content: `<p>Ahora de demostrar tu conocimiento, pero ATENCIÓN ¡La respuesta de la pista está al revés! </p><p>Dos países, una tradición; muchos ingredientes en una sola preparación.  ¿ Cuál es el plato que une a Colombia y Puerto Rico?</p><div class="answer-row"><label for="reverse-word">Palabra descifrada:</label><input id="reverse-word" type="text" aria-label="Palabra al revés" autocomplete="off"></div>`,
      action: () => check("soup", () => inputValue("#reverse-word") === "OHCOCNAS", "Pista: escribe SANCOCHO de derecha a izquierda: OHCOCNAS.")
    });
  }

  const poemLines = [
    "Todo comenzó con una receta.",
    "Recuerdos que pasan de mano en mano.",
    "Aprender de quienes vinieron antes.",
    "Dar vida a una tradición.",
    "Inspirar a la siguiente generación.",
    "Cocinar con historia.",
    "Innovar sin olvidar las raíces.",
    "Oyeme bien: la cultura también se comparte.",
    "Nunca olvides de dónde vienes." 
  ];

  function showChairVideo() {
    setPanel({
      count: "RETO 04 / 05 · VIDEO",
      content: `<p>Mira este video y después continúa con la actividad.</p><video class="clue-video" id="chair-video" src="Image/videoempanadas.mp4" controls autoplay muted playsinline preload="metadata"></video>`,
      actionText: "Continuar al reto →",
      action: () => showChair(false)
    });
    const video = body.querySelector("#chair-video");
    video.addEventListener("ended", () => showChair(false), { once: true });
    video.addEventListener("error", () => {
      feedback.textContent = "No se pudo cargar el video. Comprueba que videosilla.mp4 esté en la carpeta Image.";
    }, { once: true });
    video.play().catch(() => {
      feedback.textContent = "Pulsa reproducir en el video para verlo; después continúa con el reto.";
    });
  }

  function showChair(revealHint = false) {
    const poem = poemLines.map((line) => revealHint
      ? `<strong>${line[0]}</strong>${line.slice(1)}`
      : line).join("<br>");
    setPanel({
      count: "RETO 04 / 05",
      content: `<p>Encontremos cuál es el secreto de la receta de Margarita. <br> Lee el siguiente poema para encontrar la respuesta. ATENCIÓN Las respuestas están frente a ti. Pero solo quien observa el inicio encontrará el mensaje escondido.</p><div class="poem">${poem}</div><p class="source">${revealHint ? "Pista: las iniciales de las nueve líneas forman la palabra." : "Pista disponible si fallas: presta atención a las líneas destacadas."}</p><div class="answer-row"><label for="tradition">Palabra secreta (sin tilde):</label><input id="tradition" type="text" aria-label="Palabra secreta" autocomplete="off"></div>`,
      action: () => {
        if (inputValue("#tradition") === "TRADICION") success("chair");
        else showChair(true);
      },
      back: null
    });
  }

  const mapPages = [
    `<p>La comida latina en Estados Unidos refleja siglos de migraciones e intercambios. Cada comunidad ha llevado sus tradiciones a nuevos lugares. 
    </p><p>En Miami, los exiliados cubanos crearon la Pequeña Habana, con restaurantes y cafeterías en la Calle Ocho. En Nueva York, los dominicanos abrieron tiendas y negocios con productos de su país, y los puertorriqueños popularizaron platos como el mofongo y los tostones.
    </p><p> En Washington D. C., la llegada de inmigrantes centroamericanos durante los años ochenta impulsó comida como pupusas salvadoreñas y gallo pinto, típico de Nicaragua y Costa Rica. En Los Ángeles, los restaurantes oaxaqueños sirven moles regionales, y en San Francisco, la migración desde Yucatán introdujo los salbutes.
    </p>`,
    `<p> En Chicago, el chile con carne se incorporó a los productos industriales enlatados, y después aparecieron nuevas versiones regionales en distintas partes del país. Así, la comida latina conecta comunidades y lugares, y demuestra cómo la migración transforma la cultura gastronómica de Estados Unidos. (Adapted from Pilcher, 2013) 
    </p>`
  ];

  function showMap(page = 0) {
    if (page < mapPages.length) {
      setPanel({
        heading: "El mapa de las conexiones: las cocinas latinas de Estados Unidos ",
        count: `LECTURA ${page + 1} / 2`,
        content: `<div class="page-copy">${mapPages[page]}</div>`,
        actionText: page === 0 ? "Continuar →" : "Completar la clave →",
        action: () => page === 0 ? showMap(1) : showMapQuiz(),
        back: page > 0 ? () => showMap(0) : null
      });
      return;
    }
    showMapQuiz();
  }

  function showMapQuiz() {
    setPanel({
      heading: "",
      count: "RETO 05 / 05",
      content: `<p>Lee cada alimento y descubre en qué ciudad se menciona en el texto. Escribe la inicial de cada ciudad junto al alimento correspondiente:</p><div class="map-answer-list">
        <label for="map-mofongo"><span>Mofongo</span><input type="text" id="map-mofongo" aria-label="Inicial de la ciudad del mofongo" maxlength="1" autocomplete="off"></label>
        <label for="map-salbutes"><span>Salbutes</span><input type="text" id="map-salbutes" aria-label="Inicial de la ciudad de los salbutes" maxlength="1" autocomplete="off"></label>
        <label for="map-mole"><span>Mole oaxaqueño</span><input type="text" id="map-mole" aria-label="Inicial de la ciudad del mole oaxaqueño" maxlength="1" autocomplete="off"></label>
        <label for="map-pupusas"><span>Pupusas</span><input type="text" id="map-pupusas" aria-label="Inicial de la ciudad de las pupusas" maxlength="1" autocomplete="off"></label>
      </div>`,
      action: () => check("map", () =>
        inputValue("#map-mofongo") === "N" &&
        inputValue("#map-salbutes") === "S" &&
        inputValue("#map-mole") === "L" &&
        inputValue("#map-pupusas") === "W",
      "Pista: Nueva York, San Francisco, Los Ángeles, Washington D.C.")
    });
  }

  function showExit() {
    setPanel({
      heading: "La puerta del archivo",
      count: "CÓDIGO FINAL",
      content: `<p>Es hora de poner todos los códigos juntos y descubrir si has recuperado el archivo. Pon los en el orden que los descubriste. ¡Mucha suerte! </p><div class="answer-row"><label for="final-code">Secuencia:</label><input type="text" id="final-code" aria-label="Código de salida" inputmode="numeric" maxlength="5" autocomplete="off" placeholder="•••••"></div>`,
      action: () => {
        if (inputValue("#final-code") === "79072") {
          setPanel({
            heading: "¡Misión cumplida!",
            count: "ARCHIVO RECUPERADO",
            content: `<p class="lead">Has recuperado el documento del Archivo de la Memoria Gastronómica. Las pistas revelan que la comida es mucho más que una receta: conserva recuerdos familiares, refleja la migración y muestra cómo las comunidades transforman y comparten sus tradiciones. La historia gastronómica hispana en Estados Unidos no pertenece a una sola cultura ni a un único lugar. Es una historia diversa, viva y en constante evolución. </p><div class="code-reveal">DOCUMENTO HISTÓRICO<br><strong>RECUPERADO</strong></div>`,
            actionText: "Finalizar",
            action: finishExperience
          });
        } else {
          feedback.textContent = "La respuesta correcta es 79072, intenta de nuevo.";
        }
      }
    });
  }

  const actions = {
    intro: showIntro,
    maize: showMaize,
    cuban: () => showCuban(0),
    soup: showSoup,
    chair: showChairVideo,
    map: () => showMap(0),
    exit: showExit
  };

  function enableSceneClicks() {
    const canvas = scene.canvas;
    if (!canvas) return;
    if (!canvas.hasAttribute("tabindex")) canvas.setAttribute("tabindex", "0");
    let resumeGuardTimeout;
    const releaseResumeGuard = () => {
      window.clearTimeout(resumeGuardTimeout);
      resumeGuardTimeout = window.setTimeout(() => { resumeInProgress = false; }, 1000);
    };
    const requestMouseCapture = () => {
      if (document.pointerLockElement === canvas) {
        resumeInProgress = false;
        return;
      }
      if (typeof canvas.requestPointerLock !== "function") {
        resumeInProgress = false;
        tell("Este navegador no permite capturar el mouse para girar sin límites.");
        return;
      }
      try {
        const request = canvas.requestPointerLock();
        if (request && typeof request.then === "function") {
          request.then(() => {
            leftActiveWindow = false;
            releaseResumeGuard();
          }).catch(() => {
            resumeInProgress = false;
            tell("No se pudo capturar el mouse. Haz clic dentro del restaurante para intentarlo de nuevo.");
          });
        } else {
          releaseResumeGuard();
        }
      } catch {
        resumeInProgress = false;
        tell("No se pudo capturar el mouse. Haz clic dentro del restaurante para intentarlo de nuevo.");
      }
    };
    captureMouse = requestMouseCapture;
    const resumeExperience = () => {
      if (resumeOverlay.classList.contains("hidden")) return;
      leftActiveWindow = false;
      resumeInProgress = true;
      resumeOverlay.classList.add("hidden");
      resumeOverlay.setAttribute("aria-hidden", "true");
      document.querySelector("#camera")?.components["mouse-look"]?.resetPointer();
      if (!modal.classList.contains("hidden")) {
        resumeInProgress = false;
        const panelTarget = body.querySelector("input:not(:disabled)")
          || (!actionButton.classList.contains("hidden") ? actionButton : closeButton);
        panelTarget.focus({ preventScroll: true });
        return;
      }
      canvas.focus({ preventScroll: true });
      requestMouseCapture();
    };
    const targetAt = (event) => {
      const bounds = canvas.getBoundingClientRect();
      if (document.pointerLockElement === canvas) {
        pointer.set(0, 0);
      } else {
        pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      }
      scene.object3D.updateMatrixWorld(true);
      sceneRaycaster.setFromCamera(pointer, scene.camera);
      const nearestHit = sceneRaycaster.intersectObject(scene.object3D, true)[0];
      return nearestHit?.object.el?.closest(".clickable") || null;
    };

    canvas.addEventListener("pointermove", (event) => {
      const target = targetAt(event);
      canvas.style.cursor = target ? "pointer" : "crosshair";
    });
    canvas.addEventListener("click", (event) => {
      if (!modal.classList.contains("hidden") || !resumeOverlay.classList.contains("hidden")) return;
      const target = targetAt(event);
      const actionName = target?.dataset.action;
      const action = actionName && actions[actionName];
      if (action) {
        action();
        return;
      }
      requestMouseCapture();
    });
    document.addEventListener("pointerlockchange", () => {
      document.querySelector("#camera")?.components["mouse-look"]?.resetPointer();
      const isLocked = document.pointerLockElement === canvas;
      canvas.style.cursor = isLocked ? "none" : "crosshair";
      mouseReticle.classList.toggle("hidden", !isLocked);
      if (isLocked) {
        leftActiveWindow = false;
        releaseResumeGuard();
        tell("Mouse capturado: ahora puedes girar sin límite, incluso en los bordes.");
      }
    });
    document.addEventListener("pointerlockerror", () => {
      resumeInProgress = false;
      tell("El navegador liberó el mouse. Haz clic en un espacio vacío del restaurante para reactivar el giro sin límites.");
    });
    const pauseOnLeave = () => {
      if (resumeInProgress) return;
      leftActiveWindow = true;
      document.querySelector("#rig")?.components["arrow-walk"]?.keys.clear();
      document.querySelector("#camera")?.components["mouse-look"]?.resetPointer();
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    };
    const resumeOnReturn = () => {
      if (!leftActiveWindow || !finishScreen.classList.contains("hidden")) return;
      document.querySelector("#camera")?.components["mouse-look"]?.resetPointer();
      const isLocked = document.pointerLockElement === canvas;
      canvas.style.cursor = isLocked ? "none" : "crosshair";
      mouseReticle.classList.toggle("hidden", !isLocked);
      leftActiveWindow = false;
      resumeOverlay.classList.remove("hidden");
      resumeOverlay.setAttribute("aria-hidden", "false");
      document.querySelector("#rig")?.components["arrow-walk"]?.keys.clear();
    };
    window.addEventListener("blur", pauseOnLeave);
    window.addEventListener("focus", resumeOnReturn);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") pauseOnLeave();
      else resumeOnReturn();
    });
    resumeOverlay.addEventListener("click", resumeExperience);
    resumeOverlay.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      resumeExperience();
    });
    resumeOverlay.setAttribute("aria-hidden", "true");
  }

  if (scene.hasLoaded) enableSceneClicks();
  else scene.addEventListener("loaded", enableSceneClicks, { once: true });

  closeButton.addEventListener("click", closePanel);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closePanel();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) closePanel();
    if (event.key === "Enter" && !modal.classList.contains("hidden") && !actionButton.classList.contains("hidden")) actionButton.click();
  });
  showIntro();
})();
