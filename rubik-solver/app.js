(function () {
  "use strict";

  const FACE_ORDER = ["U", "R", "F", "D", "L", "B"];
  const STORAGE_KEY = "rubik-solver-state-v1";
  const SPEED_STORAGE_KEY = "rubik-solver-motion-speed-v1";
  const MIN_ANIMATION_SPEED = 0.4;
  const MAX_ANIMATION_SPEED = 1.4;
  const DEFAULT_ANIMATION_SPEED = 0.7;
  const BASE_QUARTER_TURN_DURATION_MS = 1250;
  const BASE_HALF_TURN_DURATION_MS = 1800;
  const BASE_CUBE_VIEW_DURATION_MS = 720;
  const BASE_SOLUTION_VIEW_DURATION_MS = 840;
  const BASE_STICKER_TRANSITION_MS = 170;

  const FACES = {
    U: {
      label: "Arriba",
      short: "U",
      hint: "Foto desde arriba: deja la cara frontal (verde/F) en la parte inferior de la imagen.",
    },
    R: {
      label: "Derecha",
      short: "R",
      hint: "Foto de la derecha: cara superior arriba y cara frontal (verde/F) a la izquierda.",
    },
    F: {
      label: "Frontal",
      short: "F",
      hint: "Foto frontal: cara superior arriba y cara derecha (rojo/R) a la derecha.",
    },
    D: {
      label: "Abajo",
      short: "D",
      hint: "Foto desde abajo: deja la cara frontal (verde/F) en la parte superior de la imagen.",
    },
    L: {
      label: "Izquierda",
      short: "L",
      hint: "Foto de la izquierda: cara superior arriba y cara frontal (verde/F) a la derecha.",
    },
    B: {
      label: "Trasera",
      short: "B",
      hint: "Foto trasera: cara superior arriba; revisa manualmente la orientación porque es la cara más fácil de invertir.",
    },
  };

  const COLORS = {
    U: { name: "Blanco", hex: "#f8fafc", rgb: [248, 250, 252] },
    R: { name: "Rojo", hex: "#ef4444", rgb: [239, 68, 68] },
    F: { name: "Verde", hex: "#22c55e", rgb: [34, 197, 94] },
    D: { name: "Amarillo", hex: "#facc15", rgb: [250, 204, 21] },
    L: { name: "Naranja", hex: "#f97316", rgb: [249, 115, 22] },
    B: { name: "Azul", hex: "#2563eb", rgb: [37, 99, 235] },
  };

  const MOVE_FACES = {
    U: "cara superior",
    R: "cara derecha",
    F: "cara frontal",
    D: "cara inferior",
    L: "cara izquierda",
    B: "cara trasera",
  };

  const VIEW_PRESETS = {
    front: { x: -28, y: -35 },
    right: { x: -22, y: -125 },
    top: { x: -78, y: -35 },
    back: { x: -20, y: -215 },
  };

  const SOLUTION_VIEW_PRESETS = {
    U: { x: -58, y: -35 },
    R: { x: -24, y: -58 },
    F: { x: -26, y: -35 },
    D: { x: 32, y: -35 },
    L: { x: -24, y: 42 },
    B: { x: -22, y: -210 },
    default: { x: -28, y: -35 },
  };

  const elements = {
    inputModeCards: document.getElementById("inputModeCards"),
    manualInputPanel: document.getElementById("manualInputPanel"),
    cameraInputPanel: document.getElementById("cameraInputPanel"),
    switchToManualBtn: document.getElementById("switchToManualBtn"),
    palette: document.getElementById("palette"),
    countsGrid: document.getElementById("countsGrid"),
    faceProgress: document.getElementById("faceProgress"),
    cubeStage: document.getElementById("cubeStage"),
    cube3d: document.getElementById("cube3d"),
    viewControls: document.getElementById("viewControls"),
    cubeEditor: document.getElementById("cubeEditor"),
    photoFaceSelect: document.getElementById("photoFaceSelect"),
    photoFaceHint: document.getElementById("photoFaceHint"),
    photoInput: document.getElementById("photoInput"),
    cameraVideo: document.getElementById("cameraVideo"),
    startCameraBtn: document.getElementById("startCameraBtn"),
    stopCameraBtn: document.getElementById("stopCameraBtn"),
    nextFaceBtn: document.getElementById("nextFaceBtn"),
    photoCanvas: document.getElementById("photoCanvas"),
    samplePhotoBtn: document.getElementById("samplePhotoBtn"),
    solveBtn: document.getElementById("solveBtn"),
    validationBox: document.getElementById("validationBox"),
    loadSolvedBtn: document.getElementById("loadSolvedBtn"),
    clearBtn: document.getElementById("clearBtn"),
    engineDot: document.getElementById("engineDot"),
    engineTitle: document.getElementById("engineTitle"),
    engineStatus: document.getElementById("engineStatus"),
    solutionPanel: document.getElementById("solutionPanel"),
    solutionTitle: document.getElementById("solutionTitle"),
    solutionCube3d: document.getElementById("solutionCube3d"),
    solutionMoveBadge: document.getElementById("solutionMoveBadge"),
    movesList: document.getElementById("movesList"),
    currentStep: document.getElementById("currentStep"),
    prevStepBtn: document.getElementById("prevStepBtn"),
    nextStepBtn: document.getElementById("nextStepBtn"),
    copySolutionBtn: document.getElementById("copySolutionBtn"),
    motionSpeedRange: document.getElementById("motionSpeedRange"),
    motionSpeedValue: document.getElementById("motionSpeedValue"),
  };

  let cubeState = createEmptyState();
  let activeInputMode = "manual";
  let activeColor = "U";
  let selectedFace = "F";
  let currentPhoto = null;
  let currentPhotoUrl = null;
  let cameraStream = null;
  let cameraFrameRequest = null;
  let solverWorker = null;
  let solverReady = false;
  let workerFailed = false;
  let mainSolverReady = false;
  let cubeRotation = { ...VIEW_PRESETS.front };
  let dragState = null;
  let cubeWasDragged = false;
  let cubeTapHandled = false;
  let solverReadyResolve;
  let solverReadyReject;
  let solutionMoves = [];
  let solutionInitialFacelets = "";
  let solutionAnimating = false;
  let currentStepIndex = 0;
  let animationSpeed = DEFAULT_ANIMATION_SPEED;
  const pendingSolves = new Map();
  const solverReadyPromise = new Promise((resolve, reject) => {
    solverReadyResolve = resolve;
    solverReadyReject = reject;
  });

  init();

  function init() {
    loadSavedState();
    loadSavedSpeed();
    applyMotionSpeed();
    renderPalette();
    renderPhotoFaceOptions();
    renderCube3d();
    renderEditor();
    renderCounts();
    renderFaceProgress();
    setInputMode(activeInputMode);
    bindEvents();
    updatePhotoHint();
    drawEmptyPhotoCanvas();
    initSolverWorker();
  }

  function bindEvents() {
    elements.inputModeCards.addEventListener("click", (event) => {
      const card = event.target.closest("[data-input-mode]");
      if (!card) return;
      setInputMode(card.dataset.inputMode);
    });

    elements.switchToManualBtn.addEventListener("click", () => {
      setInputMode("manual");
    });

    elements.palette.addEventListener("click", (event) => {
      const button = event.target.closest("[data-color]");
      if (!button) return;
      activeColor = button.dataset.color;
      renderPalette();
    });

    elements.cubeEditor.addEventListener("click", (event) => {
      const sticker = event.target.closest("[data-face][data-index]");
      if (sticker && !sticker.disabled) {
        paintSticker(sticker.dataset.face, Number(sticker.dataset.index));
        return;
      }

      const faceCard = event.target.closest("[data-face-card]");
      if (faceCard) {
        selectFace(faceCard.dataset.faceCard);
      }
    });

    elements.cube3d.addEventListener("click", (event) => {
      if (cubeWasDragged || cubeTapHandled) return;

      const sticker = event.target.closest("[data-cube-face][data-index]");
      if (sticker && !sticker.disabled) {
        paintSticker(sticker.dataset.cubeFace, Number(sticker.dataset.index));
        return;
      }

      const face = event.target.closest("[data-cube-face-card]");
      if (face) {
        selectFace(face.dataset.cubeFaceCard);
      }
    });

    elements.cubeStage.addEventListener("pointerdown", startCubeDrag);
    elements.cubeStage.addEventListener("pointermove", dragCube);
    elements.cubeStage.addEventListener("pointerup", stopCubeDrag);
    elements.cubeStage.addEventListener("pointercancel", stopCubeDrag);

    elements.viewControls.addEventListener("click", (event) => {
      const button = event.target.closest("[data-view]");
      if (!button) return;
      cubeRotation = { ...VIEW_PRESETS[button.dataset.view] };
      updateCubeRotation();
    });

    elements.photoFaceSelect.addEventListener("change", () => {
      selectFace(elements.photoFaceSelect.value);
    });

    elements.faceProgress.addEventListener("click", (event) => {
      const faceButton = event.target.closest("[data-progress-face]");
      if (!faceButton) return;
      selectFace(faceButton.dataset.progressFace);
    });

    elements.photoInput.addEventListener("change", handlePhotoInput);
    elements.startCameraBtn.addEventListener("click", startCamera);
    elements.stopCameraBtn.addEventListener("click", stopCamera);
    elements.nextFaceBtn.addEventListener("click", selectNextFace);
    elements.samplePhotoBtn.addEventListener("click", samplePhotoFace);
    elements.solveBtn.addEventListener("click", solveCurrentCube);
    elements.loadSolvedBtn.addEventListener("click", () => {
      cubeState = createSolvedState();
      saveState();
      renderCube3d();
      renderEditor();
      renderCounts();
      renderFaceProgress();
      showValidation("ok", "Cubo resuelto cargado. Puedes pintar encima para registrar el caos actual.");
      resetSolution();
    });

    elements.clearBtn.addEventListener("click", () => {
      cubeState = createEmptyState();
      saveState();
      renderCube3d();
      renderEditor();
      renderCounts();
      renderFaceProgress();
      showValidation("warn", "Caras vaciadas. Los centros quedan fijados porque definen la orientación del cubo.");
      resetSolution();
    });

    elements.prevStepBtn.addEventListener("click", () => {
      if (solutionAnimating || currentStepIndex <= 0) return;
      currentStepIndex -= 1;
      renderCurrentStep();
    });

    elements.nextStepBtn.addEventListener("click", async () => {
      if (solutionAnimating || currentStepIndex >= solutionMoves.length) return;
      await executeCurrentSolutionMove();
      currentStepIndex += 1;
      renderCurrentStep();
    });

    elements.copySolutionBtn.addEventListener("click", async () => {
      const algorithm = solutionMoves.join(" ");
      if (!algorithm) return;
      if (!navigator.clipboard) {
        showValidation("warn", "Tu navegador no permite copiar automáticamente. Selecciona los movimientos desde la lista.");
        return;
      }

      try {
        await navigator.clipboard.writeText(algorithm);
        showValidation("ok", "Algoritmo copiado al portapapeles.");
      } catch (error) {
        showValidation("error", `No se pudo copiar el algoritmo: ${error.message || error}`);
      }
    });

    elements.motionSpeedRange.addEventListener("input", () => {
      setAnimationSpeed(elements.motionSpeedRange.value);
    });
  }

  function createSolvedState() {
    return FACE_ORDER.reduce((state, face) => {
      state[face] = Array(9).fill(face);
      return state;
    }, {});
  }

  function createEmptyState() {
    return FACE_ORDER.reduce((state, face) => {
      state[face] = Array(9).fill(null);
      state[face][4] = face;
      return state;
    }, {});
  }

  function loadSavedState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== "object") return;
      const isValidShape = FACE_ORDER.every((face) => Array.isArray(saved[face]) && saved[face].length === 9);
      if (!isValidShape) return;
      cubeState = createEmptyState();
      for (const face of FACE_ORDER) {
        cubeState[face] = saved[face].map((color, index) => {
          if (index === 4) return face;
          return COLORS[color] ? color : null;
        });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cubeState));
  }

  function loadSavedSpeed() {
    const savedSpeed = Number.parseFloat(localStorage.getItem(SPEED_STORAGE_KEY));
    if (Number.isFinite(savedSpeed)) {
      animationSpeed = clamp(savedSpeed, MIN_ANIMATION_SPEED, MAX_ANIMATION_SPEED);
    }
  }

  function setAnimationSpeed(value) {
    const nextSpeed = clamp(Number.parseFloat(value), MIN_ANIMATION_SPEED, MAX_ANIMATION_SPEED);
    animationSpeed = Number.isFinite(nextSpeed) ? nextSpeed : DEFAULT_ANIMATION_SPEED;
    applyMotionSpeed();
    localStorage.setItem(SPEED_STORAGE_KEY, String(animationSpeed));
  }

  function applyMotionSpeed() {
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--cube-view-transition-duration", `${getAnimationDuration(BASE_CUBE_VIEW_DURATION_MS)}ms`);
    rootStyle.setProperty("--solution-view-transition-duration", `${getAnimationDuration(BASE_SOLUTION_VIEW_DURATION_MS)}ms`);
    rootStyle.setProperty("--sticker-transition-duration", `${getAnimationDuration(BASE_STICKER_TRANSITION_MS)}ms`);
    rootStyle.setProperty("--turn-duration", `${getAnimationDuration(BASE_QUARTER_TURN_DURATION_MS)}ms`);
    elements.motionSpeedRange.value = String(animationSpeed);
    elements.motionSpeedValue.textContent = formatSpeed(animationSpeed);
  }

  function getAnimationDuration(baseDurationMs) {
    return Math.round(baseDurationMs / animationSpeed);
  }

  function formatSpeed(speed) {
    return `${speed.toFixed(1).replace(".", ",")}x`;
  }

  function setInputMode(mode) {
    activeInputMode = mode === "camera" ? "camera" : "manual";
    elements.manualInputPanel.hidden = activeInputMode !== "manual";
    elements.cameraInputPanel.hidden = activeInputMode !== "camera";
    elements.inputModeCards.querySelectorAll("[data-input-mode]").forEach((card) => {
      card.classList.toggle("active", card.dataset.inputMode === activeInputMode);
    });

    if (activeInputMode === "camera") {
      drawDetectionFrame(true) || drawEmptyPhotoCanvas();
    } else {
      stopCamera();
    }
  }

  function renderPalette() {
    elements.palette.innerHTML = FACE_ORDER.map((face) => `
      <button class="color-button ${face === activeColor ? "active" : ""}" type="button" data-color="${face}">
        <span class="swatch" style="background:${COLORS[face].hex}"></span>
        <span><strong>${COLORS[face].name}</strong><br><small>${face} · ${FACES[face].label}</small></span>
      </button>
    `).join("");
  }

  function renderPhotoFaceOptions() {
    elements.photoFaceSelect.innerHTML = FACE_ORDER.map((face) => (
      `<option value="${face}" ${face === selectedFace ? "selected" : ""}>${face} · ${FACES[face].label}</option>`
    )).join("");
  }

  function renderFaceProgress() {
    elements.faceProgress.innerHTML = FACE_ORDER.map((face) => {
      const assigned = cubeState[face].filter(Boolean).length;
      const complete = assigned === 9;
      return `
        <button
          class="face-progress-chip ${face === selectedFace ? "selected" : ""} ${complete ? "complete" : ""}"
          type="button"
          data-progress-face="${face}"
          aria-label="Seleccionar cara ${FACES[face].label}"
        >
          <span>${face}</span>
          <small>${assigned}/9</small>
        </button>
      `;
    }).join("");
  }

  function renderCube3d() {
    elements.cube3d.innerHTML = renderCube3dMarkup(cubeState, {
      selectedFace,
      interactive: true,
    });
    updateCubeRotation();
  }

  function renderCube3dMarkup(state, options = {}) {
    const selected = options.selectedFace || null;
    const interactive = options.interactive !== false;

    return FACE_ORDER.map((face) => {
      const stickers = state[face].map((stickerColor, index) => {
        const isCenter = index === 4;
        const background = stickerColor ? COLORS[stickerColor].hex : "transparent";
        const label = `${FACES[face].label} ${index + 1}: ${stickerColor ? COLORS[stickerColor].name : "sin asignar"}`;
        const tag = interactive ? "button" : "span";
        const interactiveAttrs = interactive
          ? `type="button" data-cube-face="${face}" data-index="${index}" ${isCenter ? "disabled" : ""}`
          : `role="img"`;
        return `
          <${tag}
            class="cube3d-sticker ${isCenter ? "center" : ""} ${stickerColor ? "" : "empty"}"
            data-center="${face}"
            style="background:${background}"
            aria-label="${label}"
            ${interactiveAttrs}
          ></${tag}>
        `;
      }).join("");
      const selectedClass = face === selected ? "selected" : "";
      const cardAttr = interactive ? `data-cube-face-card="${face}"` : "";

      return `
        <div class="cube-face-shell face-${face}" ${cardAttr}>
          <div class="cube-face-3d ${selectedClass}">
            ${stickers}
          </div>
        </div>
      `;
    }).join("");
  }

  function renderEditor() {
    elements.cubeEditor.innerHTML = FACE_ORDER.map((face) => {
      const stickers = cubeState[face].map((color, index) => {
        const isCenter = index === 4;
        const background = color ? COLORS[color].hex : "transparent";
        const label = `${FACES[face].label} ${index + 1}: ${color ? COLORS[color].name : "sin asignar"}`;
        return `
          <button
            class="sticker ${isCenter ? "center" : ""} ${color ? "" : "empty"}"
            type="button"
            data-face="${face}"
            data-index="${index}"
            style="background:${background}"
            aria-label="${label}"
            ${isCenter ? "disabled" : ""}
          ></button>
        `;
      }).join("");

      return `
        <article class="face-card ${face === selectedFace ? "selected" : ""}" data-face-card="${face}">
          <div class="face-title">
            <strong>${face} · ${FACES[face].label}</strong>
            <span>${COLORS[face].name} al centro</span>
          </div>
          <div class="face-grid">${stickers}</div>
        </article>
      `;
    }).join("");
  }

  function selectFace(face) {
    selectedFace = face;
    elements.photoFaceSelect.value = selectedFace;
    updatePhotoHint();
    renderCube3d();
    renderEditor();
    renderFaceProgress();
  }

  function paintSticker(face, index) {
    if (index === 4) return;
    cubeState[face][index] = activeColor;
    selectedFace = face;
    elements.photoFaceSelect.value = selectedFace;
    updatePhotoHint();
    saveState();
    renderCube3d();
    renderEditor();
    renderCounts();
    renderFaceProgress();
    clearValidation();
    resetSolution();
  }

  function startCubeDrag(event) {
    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      rotationX: cubeRotation.x,
      rotationY: cubeRotation.y,
      tapSticker: event.target.closest("[data-cube-face][data-index]"),
      tapFace: event.target.closest("[data-cube-face-card]"),
    };
    cubeWasDragged = false;
    cubeTapHandled = false;
    elements.cube3d.classList.add("dragging");
    elements.cubeStage.setPointerCapture(event.pointerId);
  }

  function dragCube(event) {
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 4) {
      cubeWasDragged = true;
    }

    cubeRotation = {
      x: clamp(dragState.rotationX - deltaY * 0.45, -88, 88),
      y: dragState.rotationY + deltaX * 0.45,
    };
    updateCubeRotation();
  }

  function stopCubeDrag(event) {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const wasTap = !cubeWasDragged;
    const tapSticker = dragState.tapSticker;
    const tapFace = dragState.tapFace;
    if (elements.cubeStage.hasPointerCapture(event.pointerId)) {
      elements.cubeStage.releasePointerCapture(event.pointerId);
    }
    dragState = null;
    elements.cube3d.classList.remove("dragging");
    if (wasTap && tapSticker && !tapSticker.disabled) {
      paintSticker(tapSticker.dataset.cubeFace, Number(tapSticker.dataset.index));
      cubeTapHandled = true;
    } else if (wasTap && tapFace) {
      selectFace(tapFace.dataset.cubeFaceCard);
      cubeTapHandled = true;
    }
    window.setTimeout(() => {
      cubeWasDragged = false;
      cubeTapHandled = false;
    }, 80);
  }

  function updateCubeRotation() {
    elements.cube3d.style.setProperty("--rx", `${cubeRotation.x}deg`);
    elements.cube3d.style.setProperty("--ry", `${cubeRotation.y}deg`);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function renderCounts() {
    const counts = getColorCounts();
    elements.countsGrid.innerHTML = FACE_ORDER.map((face) => {
      const count = counts[face] || 0;
      const className = count === 9 ? "good" : "bad";
      return `
        <div class="count-chip ${className}">
          <span><span class="swatch" style="background:${COLORS[face].hex}"></span>${COLORS[face].name}</span>
          <strong>${count}/9</strong>
        </div>
      `;
    }).join("");
  }

  function getColorCounts() {
    const counts = Object.fromEntries(FACE_ORDER.map((face) => [face, 0]));
    for (const face of FACE_ORDER) {
      for (const color of cubeState[face]) {
        if (COLORS[color]) counts[color] += 1;
      }
    }
    return counts;
  }

  function updatePhotoHint() {
    elements.photoFaceHint.textContent = FACES[selectedFace].hint;
  }

  async function handlePhotoInput(event) {
    const file = event.target.files[0];
    if (!file) return;

    setInputMode("camera");
    stopCamera();

    if (currentPhotoUrl) {
      URL.revokeObjectURL(currentPhotoUrl);
    }

    currentPhotoUrl = URL.createObjectURL(file);
    currentPhoto = new Image();
    currentPhoto.onload = () => {
      drawPhoto(true);
      showValidation("ok", "Foto cargada. Alinea la cara con la cuadrícula y pulsa detectar esta cara.");
    };
    currentPhoto.onerror = () => {
      drawEmptyPhotoCanvas();
      showValidation("error", "No se pudo leer la imagen seleccionada.");
    };
    currentPhoto.src = currentPhotoUrl;
  }

  async function startCamera() {
    setInputMode("camera");
    if (!navigator.mediaDevices?.getUserMedia) {
      showValidation("error", "Este navegador no permite acceder a la cámara. Usa la opción de subir/tomar una foto.");
      return;
    }

    try {
      stopCamera();
      currentPhoto = null;
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      elements.cameraVideo.srcObject = cameraStream;
      await elements.cameraVideo.play();
      drawCameraFrameLoop();
      showValidation("ok", "Cámara activa. Encaja una cara dentro de la cuadrícula y pulsa detectar.");
    } catch (error) {
      showValidation("error", `No se pudo iniciar la cámara: ${error.message || error}`);
      drawEmptyPhotoCanvas();
    }
  }

  function stopCamera() {
    if (cameraFrameRequest) {
      cancelAnimationFrame(cameraFrameRequest);
      cameraFrameRequest = null;
    }

    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
    }

    if (elements.cameraVideo.srcObject) {
      elements.cameraVideo.srcObject = null;
    }
  }

  function drawCameraFrameLoop() {
    if (!cameraStream) return;
    drawVideoFrame(true);
    cameraFrameRequest = requestAnimationFrame(drawCameraFrameLoop);
  }

  function drawEmptyPhotoCanvas() {
    const canvas = elements.photoCanvas;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 24px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Activa cámara o sube foto", canvas.width / 2, canvas.height / 2 - 8);
    ctx.font = "400 16px system-ui";
    ctx.fillText("Alinea una cara por vez", canvas.width / 2, canvas.height / 2 + 24);
  }

  function drawPhoto(withOverlay) {
    if (!currentPhoto) return false;
    drawSourceToCanvas(currentPhoto, withOverlay, "contain");
    return true;
  }

  function drawVideoFrame(withOverlay) {
    const video = elements.cameraVideo;
    if (!cameraStream || video.readyState < 2) {
      return false;
    }

    drawSourceToCanvas(video, withOverlay, "cover");
    return true;
  }

  function drawDetectionFrame(withOverlay) {
    if (drawVideoFrame(withOverlay)) return true;
    if (drawPhoto(withOverlay)) return true;
    return false;
  }

  function drawSourceToCanvas(source, withOverlay, fit) {
    const canvas = elements.photoCanvas;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const side = 720;
    canvas.width = side;
    canvas.height = side;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, side, side);

    const sourceWidth = source.videoWidth || source.width;
    const sourceHeight = source.videoHeight || source.height;
    const scale = fit === "cover"
      ? Math.max(side / sourceWidth, side / sourceHeight)
      : Math.min(side / sourceWidth, side / sourceHeight);
    const width = sourceWidth * scale;
    const height = sourceHeight * scale;
    const left = (side - width) / 2;
    const top = (side - height) / 2;
    ctx.drawImage(source, left, top, width, height);

    if (!withOverlay) return;

    const grid = getPhotoGrid();
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = 4;
    ctx.strokeRect(grid.left, grid.top, grid.size, grid.size);
    ctx.lineWidth = 2;
    for (let i = 1; i < 3; i += 1) {
      const offset = grid.cell * i;
      ctx.beginPath();
      ctx.moveTo(grid.left + offset, grid.top);
      ctx.lineTo(grid.left + offset, grid.top + grid.size);
      ctx.moveTo(grid.left, grid.top + offset);
      ctx.lineTo(grid.left + grid.size, grid.top + offset);
      ctx.stroke();
    }

    getPhotoSamplePoints().forEach((point, index) => {
      ctx.beginPath();
      ctx.fillStyle = "rgba(2,6,23,0.78)";
      ctx.strokeStyle = "#67e8f9";
      ctx.lineWidth = 3;
      ctx.arc(point.x, point.y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 14px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(index + 1), point.x, point.y);
    });
  }

  function getPhotoGrid() {
    const side = elements.photoCanvas.width;
    const size = side * 0.72;
    return {
      size,
      cell: size / 3,
      left: (side - size) / 2,
      top: (side - size) / 2,
    };
  }

  function getPhotoSamplePoints() {
    const grid = getPhotoGrid();
    const points = [];
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        points.push({
          x: Math.round(grid.left + grid.cell * (col + 0.5)),
          y: Math.round(grid.top + grid.cell * (row + 0.5)),
        });
      }
    }
    return points;
  }

  function samplePhotoFace() {
    if (!drawDetectionFrame(false)) {
      showValidation("warn", "Primero inicia la cámara o sube una foto de la cara.");
      return;
    }

    const ctx = elements.photoCanvas.getContext("2d", { willReadFrequently: true });
    const sampled = getPhotoSamplePoints().map((point) => nearestCubeColor(averagePatch(ctx, point.x, point.y, 12)));
    sampled[4] = selectedFace;
    cubeState[selectedFace] = sampled;
    saveState();
    drawPhoto(true);
    renderCube3d();
    renderEditor();
    renderCounts();
    renderFaceProgress();
    drawDetectionFrame(true);
    showValidation("ok", `Cara ${selectedFace} detectada. Revisa colores y continúa con la siguiente cara.`);
    resetSolution();
  }

  function selectNextFace() {
    const currentIndex = FACE_ORDER.indexOf(selectedFace);
    const nextIncomplete = FACE_ORDER.find((face) => cubeState[face].filter(Boolean).length < 9);
    const nextFace = nextIncomplete || FACE_ORDER[(currentIndex + 1) % FACE_ORDER.length];
    selectFace(nextFace);
  }

  function averagePatch(ctx, x, y, radius) {
    const size = radius * 2 + 1;
    const imageData = ctx.getImageData(x - radius, y - radius, size, size).data;
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      const alpha = imageData[i + 3];
      if (alpha < 10) continue;
      r += imageData[i];
      g += imageData[i + 1];
      b += imageData[i + 2];
      count += 1;
    }
    return [r / count, g / count, b / count];
  }

  function nearestCubeColor(rgb) {
    let bestFace = "U";
    let bestDistance = Number.POSITIVE_INFINITY;
    const normalized = normalizeRgb(rgb);

    for (const face of FACE_ORDER) {
      const distance = colorDistance(normalized, normalizeRgb(COLORS[face].rgb));
      if (distance < bestDistance) {
        bestDistance = distance;
        bestFace = face;
      }
    }

    return bestFace;
  }

  function normalizeRgb(rgb) {
    const maxValue = Math.max(rgb[0], rgb[1], rgb[2], 1);
    return rgb.map((value) => value / maxValue);
  }

  function colorDistance(a, b) {
    const redMean = (a[0] + b[0]) / 2;
    const red = a[0] - b[0];
    const green = a[1] - b[1];
    const blue = a[2] - b[2];
    return (2 + redMean) * red * red + 4 * green * green + (3 - redMean) * blue * blue;
  }

  async function solveCurrentCube() {
    resetSolution();
    const validation = validateCubeState();
    if (!validation.ok) {
      showValidation("error", validation.errors.join("<br>"));
      return;
    }

    if (validation.cube.isSolved()) {
      showValidation("ok", "El cubo ya está resuelto.");
      renderSolution([], validation.facelets);
      return;
    }

    elements.solveBtn.disabled = true;
    showValidation("warn", "Resolviendo. Si es la primera vez, espera a que terminen las tablas del motor.");

    try {
      const algorithm = await requestSolution(validation.facelets);
      solutionMoves = algorithm.trim() ? algorithm.trim().split(/\s+/) : [];
      showValidation("ok", `Solución calculada con ${solutionMoves.length} movimientos.`);
      renderSolution(solutionMoves, validation.facelets);
    } catch (error) {
      showValidation("error", `No se pudo resolver este estado: ${error.message || error}`);
    } finally {
      elements.solveBtn.disabled = false;
    }
  }

  function validateCubeState() {
    const errors = [];
    const facelets = buildFaceletString();
    const counts = getColorCounts();

    for (const face of FACE_ORDER) {
      if (cubeState[face][4] !== face) {
        errors.push(`El centro de ${face} debe ser ${COLORS[face].name}.`);
      }
    }

    const emptyCount = FACE_ORDER.flatMap((face) => cubeState[face]).filter((color) => !color).length;
    if (emptyCount > 0) {
      errors.push(`Faltan ${emptyCount} pegatinas por asignar.`);
    }

    for (const face of FACE_ORDER) {
      if (counts[face] !== 9) {
        errors.push(`${COLORS[face].name}: hay ${counts[face]} pegatinas, deben ser 9.`);
      }
    }

    if (errors.length > 0) {
      return { ok: false, errors };
    }

    try {
      const cube = Cube.fromString(facelets);
      const normalized = cube.asString();
      const cornerSet = new Set(cube.cp);
      const edgeSet = new Set(cube.ep);
      const cornerOrientation = cube.co.reduce((sum, value) => sum + value, 0);
      const edgeOrientation = cube.eo.reduce((sum, value) => sum + value, 0);

      if (normalized !== facelets || cornerSet.size !== 8 || edgeSet.size !== 12) {
        errors.push("Las pegatinas no forman piezas válidas. Revisa esquinas y aristas repetidas.");
      }

      if (cornerOrientation % 3 !== 0) {
        errors.push("La orientación de las esquinas es imposible en un cubo físico.");
      }

      if (edgeOrientation % 2 !== 0) {
        errors.push("La orientación de las aristas es imposible en un cubo físico.");
      }

      if (cube.cornerParity() !== cube.edgeParity()) {
        errors.push("La paridad de esquinas y aristas no coincide. Probablemente hay dos piezas intercambiadas.");
      }

      return { ok: errors.length === 0, errors, cube, facelets };
    } catch (error) {
      return {
        ok: false,
        errors: [`No se pudo interpretar el cubo: ${error.message || error}`],
      };
    }
  }

  function buildFaceletString() {
    return FACE_ORDER.map((face) => cubeState[face].map((color) => color || "?").join("")).join("");
  }

  function initSolverWorker() {
    if (!window.Worker) {
      setEngineState("warn", "Motor en hilo principal", "Este navegador no soporta Web Workers; la primera resolución puede bloquear la pantalla.");
      solverReadyResolve();
      return;
    }

    solverWorker = new Worker("./solver-worker.js");
    solverWorker.addEventListener("message", (event) => {
      const message = event.data;
      if (message.type === "ready") {
        solverReady = true;
        setEngineState("ready", "Motor listo", "Tablas de Kociemba preparadas en segundo plano.");
        solverReadyResolve();
        return;
      }

      if (message.type === "error" && !message.id) {
        workerFailed = true;
        setEngineState("error", "Worker no disponible", "Se usará el motor en el hilo principal al resolver.");
        solverReadyReject(new Error(message.error));
        return;
      }

      const pending = pendingSolves.get(message.id);
      if (!pending) return;
      pendingSolves.delete(message.id);

      if (message.type === "solution") {
        pending.resolve(message.algorithm || "");
      } else if (message.type === "error") {
        pending.reject(new Error(message.error));
      }
    });

    solverWorker.addEventListener("error", (event) => {
      workerFailed = true;
      setEngineState("error", "Worker no disponible", "Se usará el motor en el hilo principal al resolver.");
      solverReadyReject(new Error(event.message));
    });
  }

  async function requestSolution(facelets) {
    if (solverWorker && !workerFailed) {
      await solverReadyPromise.catch(() => null);
      if (solverReady) {
        return solveWithWorker(facelets);
      }
    }

    if (!mainSolverReady) {
      setEngineState("warn", "Preparando motor", "Inicializando tablas en el hilo principal...");
      await new Promise((resolve) => setTimeout(resolve, 30));
      Cube.initSolver();
      mainSolverReady = true;
      setEngineState("ready", "Motor listo", "Tablas de Kociemba preparadas.");
    }

    return Cube.fromString(facelets).solve();
  }

  function solveWithWorker(facelets) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return new Promise((resolve, reject) => {
      pendingSolves.set(id, { resolve, reject });
      solverWorker.postMessage({ type: "solve", id, facelets });
    });
  }

  function setEngineState(state, title, status) {
    elements.engineDot.classList.toggle("ready", state === "ready");
    elements.engineDot.classList.toggle("error", state === "error");
    elements.engineTitle.textContent = title;
    elements.engineStatus.textContent = status;
  }

  function renderSolution(moves, initialFacelets) {
    solutionInitialFacelets = initialFacelets || buildFaceletString();
    solutionAnimating = false;
    elements.solutionPanel.hidden = false;
    elements.solutionTitle.textContent = moves.length > 0 ? `${moves.length} movimientos` : "Sin movimientos necesarios";
    elements.movesList.innerHTML = moves.length > 0
      ? moves.map((move, index) => `<span class="move-pill ${index === 0 ? "active" : ""}" data-move-index="${index}">${move}</span>`).join("")
      : `<span class="move-pill active">OK</span>`;
    currentStepIndex = 0;
    setSolutionViewForFace(moves[0]?.[0] || "default");
    renderCurrentStep();
    elements.solutionPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderCurrentStep() {
    const pills = elements.movesList.querySelectorAll("[data-move-index]");
    pills.forEach((pill, index) => {
      pill.classList.toggle("active", index === currentStepIndex);
      pill.classList.toggle("done", index < currentStepIndex);
    });
    renderSolutionCubeAtStep(currentStepIndex);

    if (solutionMoves.length === 0) {
      elements.currentStep.innerHTML = `
        <div class="step-number">Estado final</div>
        <div class="step-move">✓</div>
        <div class="step-text">El cubo ya está resuelto.</div>
      `;
      elements.solutionMoveBadge.textContent = "No hace falta ejecutar ningún giro.";
      elements.prevStepBtn.disabled = true;
      elements.nextStepBtn.disabled = true;
      return;
    }

    if (currentStepIndex >= solutionMoves.length) {
      elements.currentStep.innerHTML = `
        <div class="step-number">Estado final</div>
        <div class="step-move">✓</div>
        <div class="step-text">Has completado todos los movimientos. El cubo queda resuelto.</div>
      `;
      elements.solutionMoveBadge.textContent = "Solución completada.";
      setSolutionViewForFace("default");
      updateSolutionControls();
      return;
    }

    const move = solutionMoves[currentStepIndex];
    setSolutionViewForFace(move[0]);
    elements.currentStep.innerHTML = `
      <div class="step-number">Paso ${currentStepIndex + 1} de ${solutionMoves.length}</div>
      <div class="step-move">${move}</div>
      <div class="step-text">${describeMove(move)}</div>
    `;
    elements.solutionMoveBadge.textContent = `Preparado: ejecuta ${move} en el cubo 3D.`;
    updateSolutionControls();
  }

  async function executeCurrentSolutionMove() {
    const move = solutionMoves[currentStepIndex];
    if (!move) return;

    solutionAnimating = true;
    updateSolutionControls();
    const cube = getSolutionCubeAtStep(currentStepIndex);
    const turn = getTurnAnimation(move);
    setSolutionViewForFace(turn.face);
    renderSolutionCube(faceletsToState(cube.asString()), turn);
    elements.solutionMoveBadge.textContent = `Ejecutando ${move}...`;
    await wait(turn.duration);
    cube.move(move);
    renderSolutionCube(faceletsToState(cube.asString()));
    solutionAnimating = false;
    updateSolutionControls();
  }

  function updateSolutionControls() {
    elements.prevStepBtn.disabled = solutionAnimating || currentStepIndex === 0;
    elements.nextStepBtn.disabled = solutionAnimating || currentStepIndex >= solutionMoves.length;
    elements.nextStepBtn.textContent = solutionAnimating ? "Girando..." : "Ejecutar paso";
  }

  function renderSolutionCubeAtStep(stepIndex) {
    const cube = getSolutionCubeAtStep(stepIndex);
    renderSolutionCube(faceletsToState(cube.asString()));
  }

  function renderSolutionCube(state, turningMove = null) {
    elements.solutionCube3d.innerHTML = renderVolumetricCubeMarkup(state, turningMove);
  }

  function getSolutionCubeAtStep(stepIndex) {
    const cube = Cube.fromString(solutionInitialFacelets);
    const movesToApply = solutionMoves.slice(0, stepIndex).join(" ");
    if (movesToApply) {
      cube.move(movesToApply);
    }
    return cube;
  }

  function faceletsToState(facelets) {
    return FACE_ORDER.reduce((state, face, faceIndex) => {
      const start = faceIndex * 9;
      state[face] = facelets.slice(start, start + 9).split("");
      return state;
    }, {});
  }

  function renderVolumetricCubeMarkup(state, turningMove = null) {
    const cubies = buildCubies(state);
    const staticCubies = [];
    const turningCubies = [];

    for (const cubie of cubies) {
      if (turningMove && isCubieInLayer(cubie, turningMove.face)) {
        turningCubies.push(cubie);
      } else {
        staticCubies.push(cubie);
      }
    }

    const turningMarkup = turningMove
      ? `
        <div
          class="solution-turning-layer"
          style="--layer-turn: rotate${turningMove.axis}(${turningMove.cssAngle}deg); --turn-duration:${turningMove.duration}ms"
        >
          ${turningCubies.map(renderCubie).join("")}
        </div>
      `
      : "";

    return `
      <div class="volumetric-cube">
        <div class="solution-static-layer">${staticCubies.map(renderCubie).join("")}</div>
        ${turningMarkup}
      </div>
    `;
  }

  function buildCubies(state) {
    const cubieMap = new Map();

    for (let x = -1; x <= 1; x += 1) {
      for (let y = -1; y <= 1; y += 1) {
        for (let z = -1; z <= 1; z += 1) {
          if (x === 0 && y === 0 && z === 0) continue;
          cubieMap.set(cubieKey(x, y, z), {
            x,
            y,
            z,
            stickers: {},
          });
        }
      }
    }

    for (const face of FACE_ORDER) {
      state[face].forEach((color, index) => {
        const target = getFaceletTarget(face, index);
        cubieMap.get(cubieKey(target.x, target.y, target.z)).stickers[face] = color;
      });
    }

    return Array.from(cubieMap.values());
  }

  function getFaceletTarget(face, index) {
    const row = Math.floor(index / 3);
    const col = index % 3;

    switch (face) {
      case "U":
        return { x: col - 1, y: 1, z: row - 1 };
      case "D":
        return { x: col - 1, y: -1, z: 1 - row };
      case "R":
        return { x: 1, y: 1 - row, z: 1 - col };
      case "L":
        return { x: -1, y: 1 - row, z: col - 1 };
      case "B":
        return { x: 1 - col, y: 1 - row, z: -1 };
      case "F":
      default:
        return { x: col - 1, y: 1 - row, z: 1 };
    }
  }

  function cubieKey(x, y, z) {
    return `${x},${y},${z}`;
  }

  function isCubieInLayer(cubie, face) {
    return (
      (face === "U" && cubie.y === 1) ||
      (face === "D" && cubie.y === -1) ||
      (face === "R" && cubie.x === 1) ||
      (face === "L" && cubie.x === -1) ||
      (face === "F" && cubie.z === 1) ||
      (face === "B" && cubie.z === -1)
    );
  }

  function renderCubie(cubie) {
    const coordClasses = `${coordClass("x", cubie.x)} ${coordClass("y", cubie.y)} ${coordClass("z", cubie.z)}`;
    const faces = FACE_ORDER.map((face) => {
      const color = cubie.stickers[face];
      const colorClass = color ? "cubie-sticker" : "cubie-wall";
      const background = color ? `style="background:${COLORS[color].hex}"` : "";
      const label = color ? `${FACES[face].label}: ${COLORS[color].name}` : "";
      return `<span class="cubie-side cubie-side-${face} ${colorClass}" ${background} aria-label="${label}"></span>`;
    }).join("");

    return `
      <div class="solution-cubie ${coordClasses}">
        ${faces}
      </div>
    `;
  }

  function coordClass(axis, value) {
    if (value < 0) return `coord-${axis}-neg`;
    if (value > 0) return `coord-${axis}-pos`;
    return `coord-${axis}-zero`;
  }

  function getTurnAnimation(move) {
    const face = move[0];
    const suffix = move.slice(1);
    const angle = suffix === "'" ? -90 : suffix === "2" ? 180 : 90;
    const baseDuration = suffix === "2" ? BASE_HALF_TURN_DURATION_MS : BASE_QUARTER_TURN_DURATION_MS;
    const duration = getAnimationDuration(baseDuration);
    const cssAngleByFace = {
      U: -angle,
      D: angle,
      R: -angle,
      L: angle,
      F: angle,
      B: -angle,
    };
    const axisByFace = {
      U: "Y",
      D: "Y",
      R: "X",
      L: "X",
      F: "Z",
      B: "Z",
    };
    return {
      face,
      angle,
      cssAngle: cssAngleByFace[face],
      axis: axisByFace[face],
      duration,
    };
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function setSolutionViewForFace(face) {
    const preset = SOLUTION_VIEW_PRESETS[face] || SOLUTION_VIEW_PRESETS.default;
    elements.solutionCube3d.style.setProperty("--rx", `${preset.x}deg`);
    elements.solutionCube3d.style.setProperty("--ry", `${preset.y}deg`);
  }

  function describeMove(move) {
    const face = move[0];
    const suffix = move.slice(1);
    const faceName = MOVE_FACES[face] || "cara indicada";
    if (suffix === "2") {
      return `Gira la ${faceName} media vuelta, 180 grados.`;
    }
    if (suffix === "'") {
      return `Gira la ${faceName} 90 grados en sentido antihorario mirando directamente esa cara.`;
    }
    return `Gira la ${faceName} 90 grados en sentido horario mirando directamente esa cara.`;
  }

  function resetSolution() {
    solutionMoves = [];
    solutionInitialFacelets = "";
    solutionAnimating = false;
    currentStepIndex = 0;
    elements.solutionPanel.hidden = true;
    elements.movesList.innerHTML = "";
    elements.currentStep.innerHTML = "";
    elements.solutionCube3d.innerHTML = "";
    elements.solutionMoveBadge.textContent = "";
  }

  function showValidation(type, message) {
    elements.validationBox.className = `validation-box show ${type}`;
    elements.validationBox.innerHTML = message;
  }

  function clearValidation() {
    elements.validationBox.className = "validation-box";
    elements.validationBox.innerHTML = "";
  }
})();
