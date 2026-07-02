const BOARD_WIDTH = 3508;
const BOARD_HEIGHT = 2481;
const DEFAULT_BACKGROUND = "#f3efe6";
const DEFAULT_CHARACTER = "Rumi";
const DEFAULT_TEMPLATE_COLOR = "#a42add";
const TEXTURES_ROOT = "Elementos/Texturas";
const WHITE_FILL_PATTERN = /(?:style="[^"]*?\bfill\s*:\s*)(#fff(?:fff)?|white)\b|(?:fill=")(#fff(?:fff)?|white)(?:")/gi;
const HEAD2_TEMPLATE_SRC = "Elementos/templates/template-head-2.svg";
const DEFAULT_NOSE_SRC = "Elementos/Texturas/Basic-Textures/nose/Nose-default.svg";
const EMPTY_OPTIONAL_TEXTURE_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"></svg>'
)}`;

const baseTemplates = [
  "Elementos/templates/template-arm-left.svg",
  "Elementos/templates/template-arm-right.svg",
  "Elementos/templates/template-leg-left.svg",
  "Elementos/templates/template-leg-right.svg",
  "Elementos/templates/template-torso.svg",
  "Elementos/templates/template-head-1.svg",
  "Elementos/templates/template-textures-layer.svg",
];

/* Always rendered last (on top of everything) */
const overlayTemplate = "Elementos/templates/template-border-logo.svg";

const secondaryTemplates = [
  "Elementos/templates/template-head-2.svg",
];

const templateLabels = {
  "Elementos/templates/template-arm-left.svg": "Brazo izq",
  "Elementos/templates/template-arm-right.svg": "Brazo der",
  "Elementos/templates/template-leg-left.svg": "Pierna izq",
  "Elementos/templates/template-leg-right.svg": "Pierna der",
  "Elementos/templates/template-torso.svg": "Torso",
  "Elementos/templates/template-head-1.svg": "Head 1",
  "Elementos/templates/template-head-2.svg": "Head 2",
  "Elementos/templates/template-textures-layer.svg": "Capa textures",
};

const manualTemplateSources = [
  ...new Set([...baseTemplates, ...secondaryTemplates]),
].filter((src) => !src.endsWith("template-textures-layer.svg"));

const characterTexturePathCache = new Map();
const characterRecordCache = new Map();
let characterIndexPromise = null;

/* Body & structural textures → Mesa 01 */
const bodyLayers = [
  texture("hair-up", "Elementos/Texturas/Kpop Demon Hunters/Rumi/hair/Rumi-hair-up.svg", 2504.4, 518.8, 680.1, 680.1, 135, false, "hair-up"),
  texture("hair-left", "Elementos/Texturas/Kpop Demon Hunters/Rumi/hair/Rumi-hair-left.svg", 2023.6, 999.7, 680.1, 680.1, 45, true, "hair-left"),
  texture("hair-right", "Elementos/Texturas/Kpop Demon Hunters/Rumi/hair/Rumi-hair-right.svg", 100, 1961.4, 680.1, 680.1, -135, true, "hair-right"),
  texture("ear-left", "Elementos/Texturas/Kpop Demon Hunters/Rumi/ears/Rumi-ears.svg", 2023.6, 999.7, 680.1, 680.1, 45, true, "ears"),
  texture("ear-right", "Elementos/Texturas/Kpop Demon Hunters/Rumi/ears/Rumi-ears.svg", 580.9, 2442.4, 680.1, 680.1, -135, false, "ears"),
  texture("arm-left-front", "Elementos/Texturas/Kpop Demon Hunters/Rumi/arms/Rumi-arm-left.svg", 2969.6, 960.6, 492.9, 492.9, 135, false, "arm-left"),
  texture("arm-left-back", "Elementos/Texturas/Kpop Demon Hunters/Rumi/arms/Rumi-arm-left.svg", 3159.2, 771, 492.9, 492.9, 135, true, "arm-left"),
  texture("arm-right-front", "Elementos/Texturas/Kpop Demon Hunters/Rumi/arms/Rumi-arm-right.svg", 75.9, 100, 492.9, 492.9, 0, false, "arm-right"),
  texture("arm-right-back", "Elementos/Texturas/Kpop Demon Hunters/Rumi/arms/Rumi-arm-right.svg", 1329.9, 100, 492.9, 492.9, 0, true, "arm-right"),
  texture("torso-back", "Elementos/Texturas/Kpop Demon Hunters/Rumi/torso/Rumi-torso-back.svg", 2817.6, 1339.3, 637.3, 637.3, 135, false, "torso-back"),
  texture("torso-front", "Elementos/Texturas/Kpop Demon Hunters/Rumi/torso/Rumi-torso-front.svg", 2556.6, 1979.7, 637.3, 637.3, -45, false, "torso-front"),
  texture("leg-left-back", "Elementos/Texturas/Kpop Demon Hunters/Rumi/legs/Rumi-legs-left.svg", 2817.6, 1339.3, 637.3, 637.3, 135, false, "legs-left"),
  texture("leg-left-front", "Elementos/Texturas/Kpop Demon Hunters/Rumi/legs/Rumi-legs-left.svg", 2556.6, 1979.7, 637.3, 637.3, -45, false, "legs-left"),
  texture("leg-right-back", "Elementos/Texturas/Kpop Demon Hunters/Rumi/legs/Rumi-legs-right.svg", 2817.6, 1339.3, 637.3, 637.3, 135, false, "legs-right"),
  texture("leg-right-front", "Elementos/Texturas/Kpop Demon Hunters/Rumi/legs/Rumi-legs-right.svg", 2556.6, 1979.7, 637.3, 637.3, -45, false, "legs-right"),
];

/* Face & hair front/back textures → Mesa 02 */
const faceLayers = [
  texture("hair-back", "Elementos/Texturas/Kpop Demon Hunters/Rumi/hair/Rumi-hair-back.svg", 2046.2, 403, 1674.2, 1674.2, 0, false, "hair-back"),
  texture("hair-back-2", "Elementos/Texturas/Kpop Demon Hunters/Rumi/hair/Rumi-hair-back.svg", 1461.7, 403, 1674.2, 1674.2, 0, true, "hair-back"),
  texture("hair-front", "Elementos/Texturas/Kpop Demon Hunters/Rumi/hair/Rumi-hair-front.svg", 916.8, 403, 1674.2, 1674.2, 0, false, "hair-front"),
  texture("eyes", "Elementos/Texturas/Kpop Demon Hunters/Rumi/eyes/Rumi-eyes.svg", 1413.9, 759.9, 680.1, 680.1, 0, false, "eyes"),
  texture("eyebrows", "Elementos/Texturas/Kpop Demon Hunters/Rumi/eyebrows/Rumi-eyebrows.svg", 1413.9, 759.9, 680.1, 680.1, 0, false, "eyebrows"),
  texture("nose", "Elementos/Texturas/Basic-Textures/nose/Nose-default.svg", 1413.9, 759.9, 680.1, 680.1, 0, false, "nose"),
];

const primaryBoard = document.querySelector("#artboard-primary");
const secondaryBoard = document.querySelector("#artboard-secondary");
const bgPicker = document.querySelector("#background-picker");
const resetBgButton = document.querySelector("#reset-background");
const downloadBtn = document.querySelector("#download-pdf");
const layerTemplate = document.querySelector("#layer-template");
const characterNameInput = document.querySelector("#character-name");
const loadCharacterIconBtn = document.querySelector("#load-character-icon");
const iconPreviewSurface = document.querySelector("#icon-preview-surface");
const characterIconCanvas = document.querySelector("#character-icon-canvas");
const iconStatus = document.querySelector("#icon-status");
const iconZoomOutBtn = document.querySelector("#icon-zoom-out");
const iconZoomInBtn = document.querySelector("#icon-zoom-in");
const eyedropperBtn = document.querySelector("#eyedropper-button");
const currentColorHex = document.querySelector("#current-color-hex");
const currentColorChip = document.querySelector("#current-color-chip");
const templateColorPicker = document.querySelector("#template-color-picker");
const templateButtonList = document.querySelector("#template-button-list");
const selectionSummary = document.querySelector("#selection-summary");
const applyTemplateColorBtn = document.querySelector("#apply-template-color");
const resetTemplateColorsBtn = document.querySelector("#reset-template-colors");

const boardLayers = new WeakMap();
const layerNodeRegistry = new Map();
const layerElementRegistry = new Map();
const layerAssetCache = new Map();
const templateSourceCache = new Map();
const templateRenderCache = new Map();
const templateTintColors = new Map();
const selectedTemplateSources = new Set();
const iconSamplingCanvas = document.createElement("canvas");
const iconSamplingContext = iconSamplingCanvas.getContext("2d", { willReadFrequently: true });
const iconPreviewContext = characterIconCanvas.getContext("2d", { willReadFrequently: true });

let currentTemplateColor = DEFAULT_TEMPLATE_COLOR;
let currentIconScale = 1.5;
let currentIconPanX = 0;
let currentIconPanY = 0;
let currentIconNaturalSize = { width: 1, height: 1 };
let iconDragState = null;
let suppressIconSample = false;
let currentIconImage = null;
let availableCharacterNames = [DEFAULT_CHARACTER];

renderBoard(primaryBoard, [
  ...baseTemplates.map((src) => fullBoardLayer(src)),
  ...bodyLayers,
  fullBoardLayer(overlayTemplate),
]);

renderBoard(secondaryBoard, [
  ...secondaryTemplates.map((src) => fullBoardLayer(src)),
  ...faceLayers,
]);

setBackground(DEFAULT_BACKGROUND);
renderTemplateButtons();
updateTemplateButtonsUI();
updateSelectionSummary();
updateCurrentColorUI();

bgPicker.addEventListener("input", (event) => {
  setBackground(event.target.value);
});

resetBgButton.addEventListener("click", () => {
  bgPicker.value = DEFAULT_BACKGROUND;
  setBackground(DEFAULT_BACKGROUND);
});

downloadBtn.addEventListener("click", generatePDF);
loadCharacterIconBtn.addEventListener("click", () => {
  loadCharacterIcon(characterNameInput.value);
});
characterNameInput.addEventListener("change", () => {
  loadCharacterIcon(characterNameInput.value);
});
templateColorPicker.addEventListener("input", (event) => {
  setCurrentTemplateColor(event.target.value);
});
currentColorChip.addEventListener("click", () => {
  templateColorPicker.click();
});
applyTemplateColorBtn.addEventListener("click", applyColorToSelection);
resetTemplateColorsBtn.addEventListener("click", () => {
  resetAllTemplateColors();
});
iconPreviewSurface.addEventListener("click", sampleColorFromPreview);
iconPreviewSurface.addEventListener("wheel", handleIconZoom, { passive: false });
iconPreviewSurface.addEventListener("pointerdown", beginIconPan);
iconPreviewSurface.addEventListener("pointermove", updateIconPan);
iconPreviewSurface.addEventListener("pointerup", endIconPan);
iconPreviewSurface.addEventListener("pointercancel", endIconPan);
iconZoomOutBtn.addEventListener("click", () => {
  zoomIconOut();
});
iconZoomInBtn.addEventListener("click", () => {
  zoomIconIn();
});
eyedropperBtn.addEventListener("click", openSystemEyeDropper);
window.addEventListener("resize", renderIconCanvas);

loadAvailableCharacterNames();
loadCharacterIcon(DEFAULT_CHARACTER);

/* ─── Core helpers ─── */

function texture(name, src, x, y, width, height, rotation = 0, flipX = false, characterAssetKey = null) {
  return { name, src, x, y, width, height, rotation, flipX, characterAssetKey };
}

function fullBoardLayer(src) {
  return texture(src, src, 0, 0, BOARD_WIDTH, BOARD_HEIGHT);
}

function renderBoard(target, layers) {
  boardLayers.set(target, layers);

  layers.forEach((layer) => {
    const node = layerTemplate.content.firstElementChild.cloneNode(true);
    const image = node.querySelector("img");
    const leftPct = (layer.x / BOARD_WIDTH) * 100;
    const topPct = (layer.y / BOARD_HEIGHT) * 100;
    const widthPct = (layer.width / BOARD_WIDTH) * 100;
    const heightPct = (layer.height / BOARD_HEIGHT) * 100;
    const rotate = `rotate(${layer.rotation || 0}deg)`;
    const flip = layer.flipX ? "scaleX(-1)" : "scaleX(1)";

    node.dataset.layer = layer.name;
    node.style.left = `${leftPct}%`;
    node.style.top = `${topPct}%`;
    node.style.width = `${widthPct}%`;
    node.style.height = `${heightPct}%`;
    node.style.transform = `${rotate} ${flip}`;

    image.src = getRenderableSrc(layer.src);
    image.alt = layer.name;
    image.draggable = false;

    registerLayerImage(layer.src, image);
    registerLayerElement(layer.name, node);
    target.appendChild(node);
  });
}

function registerLayerImage(src, image) {
  if (!layerNodeRegistry.has(src)) {
    layerNodeRegistry.set(src, new Set());
  }
  layerNodeRegistry.get(src).add(image);
}

function registerLayerElement(name, node) {
  if (!layerElementRegistry.has(name)) {
    layerElementRegistry.set(name, new Set());
  }

  layerElementRegistry.get(name).add(node);
}

function getRenderableSrc(src) {
  return templateRenderCache.get(src) || encodeURI(src);
}

function setBackground(color) {
  document.documentElement.style.setProperty("--workspace-bg", color);
}

/* ─── Manual Tint Studio ─── */

function renderTemplateButtons() {
  manualTemplateSources.forEach((src) => {
    const button = document.createElement("button");
    const swatch = document.createElement("span");
    const label = document.createElement("span");

    button.type = "button";
    button.className = "template-button";
    button.dataset.templateSrc = src;
    swatch.className = "template-button__color";
    label.className = "template-button__name";
    label.textContent = templateLabels[src] || humanizeTemplateName(src);

    button.append(swatch, label);
    button.addEventListener("click", () => {
      toggleTemplateSelection(src);
    });

    templateButtonList.appendChild(button);
  });
}

function humanizeTemplateName(src) {
  return src
    .split("/")
    .pop()
    .replace(".svg", "")
    .replace("template-", "")
    .replace(/-/g, " ");
}

function toggleTemplateSelection(src) {
  if (selectedTemplateSources.has(src)) {
    selectedTemplateSources.delete(src);
  } else {
    selectedTemplateSources.add(src);
  }

  updateTemplateButtonsUI();
  updateSelectionSummary();
}

function updateTemplateButtonsUI() {
  templateButtonList.querySelectorAll(".template-button").forEach((button) => {
    const src = button.dataset.templateSrc;
    const swatch = button.querySelector(".template-button__color");
    const appliedColor = templateTintColors.get(src);
    const color = appliedColor || "var(--panel-chip)";
    const selected = selectedTemplateSources.has(src);
    const activeBackground = appliedColor || "#a87429";
    const activeForeground = appliedColor
      ? getContrastingTextColor(appliedColor)
      : "#111111";

    button.classList.toggle("is-selected", selected);

    if (selected) {
      button.style.background = activeBackground;
      button.style.color = activeForeground;
      button.style.borderColor = activeBackground;
    } else {
      button.style.background = "#111";
      button.style.color = "var(--text-dim)";
      button.style.borderColor = "var(--border-strong)";
    }

    swatch.style.background = color;
  });
}

function updateSelectionSummary() {
  if (selectedTemplateSources.size === 0) {
    selectionSummary.textContent = "Selecciona uno o varios";
    return;
  }

  selectionSummary.textContent = `${selectedTemplateSources.size} template${selectedTemplateSources.size > 1 ? "s" : ""} seleccionado${selectedTemplateSources.size > 1 ? "s" : ""}`;
}

function setCurrentTemplateColor(color) {
  currentTemplateColor = normalizeHexColor(color);
  updateCurrentColorUI();
}

function handleIconZoom(event) {
  event.preventDefault();
  if (event.deltaY < 0) {
    zoomIconIn();
  } else {
    zoomIconOut();
  }
}

function zoomIconIn() {
  currentIconScale = Math.min(currentIconScale + 0.2, 4);
  clampIconPan();
  renderIconCanvas();
  iconStatus.textContent = `Zoom ${Math.round((currentIconScale / 1.5) * 100)}% sobre el tamaño base`;
}

function zoomIconOut() {
  currentIconScale = Math.max(currentIconScale - 0.2, 1);
  clampIconPan();
  renderIconCanvas();
  iconStatus.textContent = `Zoom ${Math.round(currentIconScale * 100)}%`;
}

function beginIconPan(event) {
  if (event.button !== 0) {
    return;
  }

  iconDragState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startPanX: currentIconPanX,
    startPanY: currentIconPanY,
    moved: false,
  };

  iconPreviewSurface.setPointerCapture(event.pointerId);
}

function updateIconPan(event) {
  if (!iconDragState || iconDragState.pointerId !== event.pointerId) {
    return;
  }

  const deltaX = event.clientX - iconDragState.startX;
  const deltaY = event.clientY - iconDragState.startY;

  if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
    iconDragState.moved = true;
  }

  currentIconPanX = iconDragState.startPanX + deltaX;
  currentIconPanY = iconDragState.startPanY + deltaY;
  clampIconPan();
  renderIconCanvas();
}

function endIconPan(event) {
  if (!iconDragState || iconDragState.pointerId !== event.pointerId) {
    return;
  }

  if (iconPreviewSurface.hasPointerCapture(event.pointerId)) {
    iconPreviewSurface.releasePointerCapture(event.pointerId);
  }

  suppressIconSample = iconDragState.moved;
  iconDragState = null;
}

function updateCurrentColorUI() {
  currentColorHex.textContent = currentTemplateColor;
  currentColorChip.style.background = currentTemplateColor;
  templateColorPicker.value = currentTemplateColor;
}

async function applyColorToSelection() {
  if (selectedTemplateSources.size === 0) {
    iconStatus.textContent = "Selecciona templates antes de teñir";
    return;
  }

  const tasks = [...selectedTemplateSources].map((src) => applyTemplateTint(src, currentTemplateColor));
  await Promise.all(tasks);
  await syncDependentAssetTints();
  updateTemplateButtonsUI();
  iconStatus.textContent = `Color aplicado ${currentTemplateColor}`;
}

async function applyTemplateTint(src, color) {
  const sourceText = await fetchTemplateSource(src);
  const tintedText = tintTemplateSvg(sourceText, color);

  templateRenderCache.set(src, createSvgDataUrl(tintedText));
  templateTintColors.set(src, color);
  updateLayerImagesForTemplate(src);
}

function tintTemplateSvg(svgText, color) {
  return svgText.replace(WHITE_FILL_PATTERN, (match) =>
    match.replace(/#fff(?:fff)?|white/gi, color)
  );
}

function createSvgDataUrl(svgText) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}

async function fetchTemplateSource(src) {
  if (!templateSourceCache.has(src)) {
    templateSourceCache.set(
      src,
      fetch(encodeURI(src)).then(async (response) => {
        if (!response.ok) {
          throw new Error(`No se pudo leer el template: ${src}`);
        }
        return response.text();
      })
    );
  }

  return templateSourceCache.get(src);
}

function updateLayerImagesForTemplate(src) {
  const renderSrc = getRenderableSrc(src);
  const nodes = layerNodeRegistry.get(src);

  if (!nodes) return;

  nodes.forEach((image) => {
    image.src = renderSrc;
  });
}

function setLayerVisibility(layerName, visible) {
  const nodes = layerElementRegistry.get(layerName);
  if (!nodes) return;

  nodes.forEach((node) => {
    node.style.display = visible ? "" : "none";
  });
}

async function resetAllTemplateColors() {
  templateRenderCache.clear();
  templateTintColors.clear();

  manualTemplateSources.forEach((src) => {
    updateLayerImagesForTemplate(src);
  });

  await syncDependentAssetTints();

  updateTemplateButtonsUI();
  iconStatus.textContent = "Templates reseteados a blanco";
}

async function syncDependentAssetTints() {
  await syncNoseTintFromHead2();
}

async function syncNoseTintFromHead2() {
  const head2Color = templateTintColors.get(HEAD2_TEMPLATE_SRC);

  if (!head2Color) {
    templateRenderCache.delete(DEFAULT_NOSE_SRC);
    updateLayerImagesForTemplate(DEFAULT_NOSE_SRC);
    return;
  }

  const sourceText = await fetchTemplateSource(DEFAULT_NOSE_SRC);
  const darkerColor = darkenColor(head2Color, 0.25);
  const tintedText = tintTemplateSvg(sourceText, darkerColor);

  templateRenderCache.set(DEFAULT_NOSE_SRC, createSvgDataUrl(tintedText));
  updateLayerImagesForTemplate(DEFAULT_NOSE_SRC);
}

async function loadCharacterIcon(name) {
  const character = normalizeCharacterName(name || DEFAULT_CHARACTER);

  iconStatus.textContent = "Cargando icono…";

  try {
    const record = await resolveCharacterRecord(character);
    const image = await loadImageElement(encodeURI(record.iconSrc));
    await applyCharacterTextures(character);
    characterNameInput.value = record.name;
    syncIconSamplingCanvas(image);
    currentIconImage = image;
    currentIconNaturalSize = {
      width: image.naturalWidth || image.width || 1,
      height: image.naturalHeight || image.height || 1,
    };
    resetIconView();
    iconStatus.textContent = "Listo para muestrear color";
  } catch (error) {
    iconStatus.textContent = "No encontré ese icono";
    console.error(error);
  }
}

async function loadAvailableCharacterNames() {
  try {
    const records = await ensureCharacterDirectoryIndex();
    const names = [...records.values()].map((record) => record.name);

    availableCharacterNames = [...new Set([DEFAULT_CHARACTER, ...names])].sort((left, right) =>
      left.localeCompare(right, "es", { sensitivity: "base" })
    );
  } catch (error) {
    console.error(error);
    availableCharacterNames = [...new Set([DEFAULT_CHARACTER])];
  }

  renderCharacterOptions(characterNameInput.value || DEFAULT_CHARACTER);
}

function renderCharacterOptions(selectedName = DEFAULT_CHARACTER) {
  const normalizedSelection = normalizeCharacterName(selectedName);
  const resolvedSelection = availableCharacterNames.includes(normalizedSelection)
    ? normalizedSelection
    : availableCharacterNames[0] || DEFAULT_CHARACTER;

  characterNameInput.replaceChildren(
    ...availableCharacterNames.map((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      option.selected = name === resolvedSelection;
      return option;
    })
  );

  characterNameInput.value = resolvedSelection;
}

async function applyCharacterTextures(character) {
  const layers = [...(boardLayers.get(primaryBoard) || []), ...(boardLayers.get(secondaryBoard) || [])];
  const characterLayers = layers.filter((layer) => layer.characterAssetKey);
  const uniquePairs = new Map();

  characterLayers.forEach((layer) => {
    uniquePairs.set(`${character}:${layer.characterAssetKey}`, {
      character,
      assetKey: layer.characterAssetKey,
    });
  });

  const resolved = new Map();
  await Promise.all(
    [...uniquePairs.values()].map(async ({ character: characterName, assetKey }) => {
      const src = await resolveCharacterTexturePath(characterName, assetKey);
      resolved.set(assetKey, src);
    })
  );

  characterLayers.forEach((layer) => {
    const nextSrc = resolved.get(layer.characterAssetKey);
    if (nextSrc && layer.src !== nextSrc) {
      const previousSrc = layer.src;
      layer.src = nextSrc;
      moveLayerRegistryBinding(previousSrc, nextSrc);
      updateLayerImagesForTemplate(nextSrc);
    }

    const isMissingCharacterAsset =
      Boolean(layer.characterAssetKey) &&
      nextSrc === EMPTY_OPTIONAL_TEXTURE_SRC;

    setLayerVisibility(layer.name, !isMissingCharacterAsset);
  });
}

function moveLayerRegistryBinding(previousSrc, nextSrc) {
  const nodes = layerNodeRegistry.get(previousSrc);
  if (!nodes || previousSrc === nextSrc) {
    return;
  }

  if (!layerNodeRegistry.has(nextSrc)) {
    layerNodeRegistry.set(nextSrc, new Set());
  }

  nodes.forEach((image) => {
    layerNodeRegistry.get(nextSrc).add(image);
    image.src = getRenderableSrc(nextSrc);
  });

  layerNodeRegistry.delete(previousSrc);
}

async function resolveCharacterTexturePath(character, assetKey) {
  const cacheKey = `${character}:${assetKey}`;
  if (characterTexturePathCache.has(cacheKey)) {
    return characterTexturePathCache.get(cacheKey);
  }

  const promise = resolveCharacterRecord(character).then(async (record) => {
    const src = await findFirstExistingAsset(getCharacterTextureCandidates(record, assetKey));
    return src || EMPTY_OPTIONAL_TEXTURE_SRC;
  });
  characterTexturePathCache.set(cacheKey, promise);
  return promise;
}

function getCharacterTextureCandidates(record, assetKey) {
  const base = record.basePath;
  const character = record.name;

  switch (assetKey) {
    case "hair-up":
      return [`${base}/hair/${character}-hair-up.svg`];
    case "hair-left":
      return [`${base}/hair/${character}-hair-left.svg`];
    case "hair-right":
      return [`${base}/hair/${character}-hair-right.svg`];
    case "hair-back":
      return [
        `${base}/hair/${character}-hair-back.svg`,
        `${base}/hair/${character}-back-hair.svg`,
      ];
    case "hair-front":
      return [
        `${base}/hair/${character}-hair-front.svg`,
        `${base}/hair/${character}-front-hair.svg`,
      ];
    case "ears":
      return [`${base}/ears/${character}-ears.svg`];
    case "arm-left":
      return [`${base}/arms/${character}-arm-left.svg`];
    case "arm-right":
      return [`${base}/arms/${character}-arm-right.svg`];
    case "torso-back":
      return [`${base}/torso/${character}-torso-back.svg`];
    case "torso-front":
      return [`${base}/torso/${character}-torso-front.svg`];
    case "legs-left":
      return [
        `${base}/legs/${character}-legs-left.svg`,
        `${base}/legs/${character}-leg-left.svg`,
      ];
    case "legs-right":
      return [
        `${base}/legs/${character}-legs-right.svg`,
        `${base}/legs/${character}-leg-right.svg`,
      ];
    case "eyes":
      return [`${base}/eyes/${character}-eyes.svg`];
    case "eyebrows":
      return [`${base}/eyebrows/${character}-eyebrows.svg`];
    case "nose":
      return [
        `${base}/nose/${character}-nose.svg`,
        DEFAULT_NOSE_SRC,
      ];
    default:
      return [];
  }
}

async function ensureCharacterDirectoryIndex() {
  if (!characterIndexPromise) {
    characterIndexPromise = buildCharacterDirectoryIndex();
  }

  return characterIndexPromise;
}

async function buildCharacterDirectoryIndex() {
  const collections = await listDirectoryNames(TEXTURES_ROOT);
  const records = new Map();

  await Promise.all(
    collections
      .filter((collection) => collection !== "Basic-Textures")
      .map(async (collection) => {
        const collectionPath = `${TEXTURES_ROOT}/${collection}`;
        const characterDirs = await listDirectoryNames(collectionPath);

        await Promise.all(
          characterDirs.map(async (dirName) => {
            const normalizedName = normalizeCharacterName(dirName);
            const basePath = `${collectionPath}/${dirName}`;
            const iconSrc = `${basePath}/${normalizedName}-icon.svg`;

            if (!(await assetExists(iconSrc))) {
              return;
            }

            const key = normalizedName.toLowerCase();
            records.set(key, {
              name: normalizedName,
              basePath,
              iconSrc,
            });
          })
        );
      })
  );

  characterRecordCache.clear();
  records.forEach((record, key) => {
    characterRecordCache.set(key, record);
  });

  return characterRecordCache;
}

async function resolveCharacterRecord(character) {
  const normalized = normalizeCharacterName(character || DEFAULT_CHARACTER);
  const cacheKey = normalized.toLowerCase();

  if (characterRecordCache.has(cacheKey)) {
    return characterRecordCache.get(cacheKey);
  }

  const records = await ensureCharacterDirectoryIndex();
  const record = records.get(cacheKey);
  if (record) {
    return record;
  }

  throw new Error(`No encontré la carpeta del personaje "${normalized}"`);
}

async function listDirectoryNames(path) {
  const response = await fetch(`${encodeURI(path)}/`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`No pude leer ${path}`);
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  return [...doc.querySelectorAll("a")]
    .map((anchor) => decodeURIComponent((anchor.getAttribute("href") || "").replace(/\/$/, "")))
    .filter((name) => name && !name.startsWith(".") && !name.includes("."));
}

async function findFirstExistingAsset(candidates) {
  for (const candidate of candidates) {
    if (await assetExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function assetExists(src) {
  try {
    const response = await fetch(encodeURI(src), { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

function normalizeCharacterName(name) {
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function syncIconSamplingCanvas(image) {
  iconSamplingCanvas.width = image.naturalWidth || image.width;
  iconSamplingCanvas.height = image.naturalHeight || image.height;
  iconSamplingContext.clearRect(0, 0, iconSamplingCanvas.width, iconSamplingCanvas.height);
  iconSamplingContext.drawImage(image, 0, 0, iconSamplingCanvas.width, iconSamplingCanvas.height);
}

function sampleColorFromPreview(event) {
  if (suppressIconSample) {
    suppressIconSample = false;
    return;
  }

  if (!iconSamplingCanvas.width || !iconSamplingCanvas.height) {
    return;
  }

  const rect = iconPreviewSurface.getBoundingClientRect();
  const geometry = getIconGeometry();
  const viewportX = event.clientX - rect.left;
  const viewportY = event.clientY - rect.top;
  const imageLeft = geometry.centerX - geometry.renderedWidth / 2;
  const imageTop = geometry.centerY - geometry.renderedHeight / 2;

  if (
    viewportX < imageLeft ||
    viewportX > imageLeft + geometry.renderedWidth ||
    viewportY < imageTop ||
    viewportY > imageTop + geometry.renderedHeight
  ) {
    iconStatus.textContent = "Haz clic sobre el personaje para muestrear";
    return;
  }

  const relativeX = (viewportX - imageLeft) / geometry.renderedWidth;
  const relativeY = (viewportY - imageTop) / geometry.renderedHeight;
  const x = Math.max(0, Math.min(iconSamplingCanvas.width - 1, Math.floor(relativeX * iconSamplingCanvas.width)));
  const y = Math.max(0, Math.min(iconSamplingCanvas.height - 1, Math.floor(relativeY * iconSamplingCanvas.height)));
  const [r, g, b, a] = iconSamplingContext.getImageData(x, y, 1, 1).data;

  if (a < 16) {
    iconStatus.textContent = "Ese punto es transparente";
    return;
  }

  const sampledColor = rgbToHex(r, g, b);
  setCurrentTemplateColor(sampledColor);
  iconStatus.textContent = `Color muestreado ${sampledColor}`;
}

async function openSystemEyeDropper() {
  if (typeof window.EyeDropper !== "function") {
    iconStatus.textContent = "El gotero del sistema no está disponible aquí";
    return;
  }

  try {
    const result = await new EyeDropper().open();
    setCurrentTemplateColor(result.sRGBHex);
    iconStatus.textContent = `Color muestreado ${result.sRGBHex}`;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error);
      iconStatus.textContent = "No pude leer el color del gotero";
    }
  }
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

function normalizeHexColor(color) {
  const match = String(color).trim().match(/^#?([0-9a-f]{6})$/i);
  return match ? `#${match[1].toLowerCase()}` : DEFAULT_TEMPLATE_COLOR;
}

function getContrastingTextColor(color) {
  const normalized = normalizeHexColor(color);
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  return luminance > 0.6 ? "#111111" : "#f7f3ea";
}

function darkenColor(color, amount) {
  const normalized = normalizeHexColor(color);
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);

  return rgbToHex(
    Math.round(r * (1 - amount)),
    Math.round(g * (1 - amount)),
    Math.round(b * (1 - amount))
  );
}

function resetIconView() {
  currentIconScale = 1.5;
  currentIconPanX = 0;
  currentIconPanY = getBaseIconShift();
  renderIconCanvas();
}

function getBaseIconShift() {
  return iconPreviewSurface.clientHeight * 0.05;
}

function getIconGeometry() {
  const viewportWidth = iconPreviewSurface.clientWidth;
  const viewportHeight = iconPreviewSurface.clientHeight;
  const imageAspect = currentIconNaturalSize.width / currentIconNaturalSize.height;
  const viewportAspect = viewportWidth / viewportHeight;

  let baseWidth;
  let baseHeight;

  if (imageAspect > viewportAspect) {
    baseWidth = viewportWidth;
    baseHeight = viewportWidth / imageAspect;
  } else {
    baseHeight = viewportHeight;
    baseWidth = viewportHeight * imageAspect;
  }

  return {
    viewportWidth,
    viewportHeight,
    baseWidth,
    baseHeight,
    renderedWidth: baseWidth * currentIconScale,
    renderedHeight: baseHeight * currentIconScale,
    centerX: viewportWidth / 2 + currentIconPanX,
    centerY: viewportHeight / 2 + currentIconPanY,
  };
}

function clampIconPan() {
  const geometry = getIconGeometry();
  const maxPanX = Math.max(0, (geometry.renderedWidth - geometry.viewportWidth) / 2);
  const maxPanY = Math.max(0, (geometry.renderedHeight - geometry.viewportHeight) / 2);
  const baseShiftY = getBaseIconShift();

  currentIconPanX = clamp(currentIconPanX, -maxPanX, maxPanX);
  currentIconPanY = clamp(currentIconPanY, baseShiftY - maxPanY, baseShiftY + maxPanY);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function renderIconCanvas() {
  if (!currentIconImage) {
    return;
  }

  const cssWidth = iconPreviewSurface.clientWidth;
  const cssHeight = iconPreviewSurface.clientHeight;
  const devicePixelRatio = window.devicePixelRatio || 1;

  characterIconCanvas.width = Math.max(1, Math.round(cssWidth * devicePixelRatio));
  characterIconCanvas.height = Math.max(1, Math.round(cssHeight * devicePixelRatio));

  iconPreviewContext.setTransform(1, 0, 0, 1, 0, 0);
  iconPreviewContext.clearRect(0, 0, characterIconCanvas.width, characterIconCanvas.height);
  iconPreviewContext.scale(devicePixelRatio, devicePixelRatio);
  iconPreviewContext.imageSmoothingEnabled = true;
  iconPreviewContext.imageSmoothingQuality = "high";

  const geometry = getIconGeometry();
  const drawX = geometry.centerX - geometry.renderedWidth / 2;
  const drawY = geometry.centerY - geometry.renderedHeight / 2;

  iconPreviewContext.fillStyle = DEFAULT_BACKGROUND;
  iconPreviewContext.fillRect(0, 0, cssWidth, cssHeight);
  iconPreviewContext.drawImage(
    currentIconImage,
    drawX,
    drawY,
    geometry.renderedWidth,
    geometry.renderedHeight
  );
}

/* ─── PDF generation (flattened / acoplado) ─── */

async function generatePDF() {
  downloadBtn.disabled = true;
  downloadBtn.textContent = "Generando…";

  try {
    const outputFilename = "Papelcool-Textures.pdf";
    const saveTarget = await preparePdfSaveTarget(outputFilename);
    const canvases = await Promise.all([
      renderBoardToCanvas(primaryBoard),
      renderBoardToCanvas(secondaryBoard),
    ]);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    canvases.forEach((canvas, i) => {
      if (i > 0) pdf.addPage("a4", "landscape");
      const imgData = canvas.toDataURL("image/png", 1.0);
      pdf.addImage(imgData, "PNG", 0, 0, pageW, pageH, undefined, "FAST");
    });

    const pdfBlob = pdf.output("blob");
    await savePdfBlob(saveTarget, pdfBlob, outputFilename);
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("Error generando PDF:", err);
      alert("Error al generar el PDF. Revisa la consola para más detalles.");
    }
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.textContent = "Descargar PDF";
  }
}

async function renderBoardToCanvas(board) {
  const layers = boardLayers.get(board) || [];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const backgroundColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--workspace-bg")
    .trim() || DEFAULT_BACKGROUND;

  canvas.width = BOARD_WIDTH;
  canvas.height = BOARD_HEIGHT;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

  for (const layer of layers) {
    if (isOmittedLayerSource(layer.src)) {
      continue;
    }

    try {
      const asset = await loadLayerAssetForSource(layer.src);
      if (!asset) {
        continue;
      }
      drawLayer(ctx, asset, layer);
    } catch (error) {
      console.warn(`Omitiendo capa al exportar PDF: ${layer.name}`, error);
    }
  }

  return canvas;
}

async function loadLayerAssetForSource(src) {
  if (isOmittedLayerSource(src)) {
    return null;
  }

  const renderSrc = getRenderableSrc(src);
  const cacheKey = `${src}::${renderSrc}`;

  if (!layerAssetCache.has(cacheKey)) {
    layerAssetCache.set(cacheKey, loadLayerAssetUncached(renderSrc));
  }

  return layerAssetCache.get(cacheKey);
}

function isOmittedLayerSource(src) {
  return src === EMPTY_OPTIONAL_TEXTURE_SRC;
}

async function loadLayerAssetUncached(src) {
  const [image, metadata] = await Promise.all([
    loadImageElement(src),
    readAssetMetadata(src),
  ]);

  return {
    image,
    width: metadata.width || image.naturalWidth,
    height: metadata.height || image.naturalHeight,
  };
}

async function loadImageElement(src) {
  const image = new Image();

  image.decoding = "sync";
  image.src = src;

  if (image.complete) {
    if (!image.naturalWidth && !image.naturalHeight) {
      throw new Error(`No se pudo decodificar la capa: ${src}`);
    }
    return image;
  }

  await image.decode();
  return image;
}

async function readAssetMetadata(src) {
  const normalizedSrc = src.toLowerCase();
  if (!normalizedSrc.includes(".svg") && !normalizedSrc.startsWith("data:image/svg+xml")) {
    return {};
  }

  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`No se pudo leer el SVG: ${src}`);
  }

  const svgText = await response.text();
  const svgDoc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svgRoot = svgDoc.documentElement;
  const viewBox = (svgRoot.getAttribute("viewBox") || "").trim();

  if (viewBox) {
    const [, , width, height] = viewBox.split(/[\s,]+/).map(Number);

    if (Number.isFinite(width) && Number.isFinite(height)) {
      return { width, height };
    }
  }

  const width = parseSvgLength(svgRoot.getAttribute("width"));
  const height = parseSvgLength(svgRoot.getAttribute("height"));

  return { width, height };
}

function parseSvgLength(value) {
  if (!value) {
    return null;
  }

  const match = String(value).trim().match(/^([0-9]*\.?[0-9]+)/);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function drawLayer(ctx, asset, layer) {
  const rotation = ((layer.rotation || 0) * Math.PI) / 180;
  const scaleX = layer.flipX ? -1 : 1;

  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate(rotation);
  ctx.scale(scaleX, 1);

  const fit = getContainRect(
    asset.width || layer.width,
    asset.height || layer.height,
    layer.width,
    layer.height
  );

  ctx.drawImage(
    asset.image,
    fit.offsetX,
    fit.offsetY,
    fit.drawWidth,
    fit.drawHeight
  );

  ctx.restore();
}

function getContainRect(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;

  return {
    drawWidth,
    drawHeight,
    offsetX: (targetWidth - drawWidth) / 2,
    offsetY: (targetHeight - drawHeight) / 2,
  };
}

async function preparePdfSaveTarget(filename) {
  if (typeof window.showSaveFilePicker !== "function") {
    return null;
  }

  return window.showSaveFilePicker({
    suggestedName: filename,
    types: [
      {
        description: "Documento PDF",
        accept: {
          "application/pdf": [".pdf"],
        },
      },
    ],
  });
}

async function savePdfBlob(saveTarget, blob, filename) {
  if (saveTarget) {
    const writable = await saveTarget.createWritable();
    await writable.write(blob);
    await writable.close();
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
