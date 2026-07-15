// Ulazna točka: pokreće kaplay, učitava font i sprite-ove, registrira scene.

import kaplay from "../lib/kaplay.mjs";
import { SCREEN, PHYSICS } from "./config.js";
import { loadAllSprites } from "./sprites/index.js";
import { registerGameScenes } from "./registry.js";
import { registerMenuScene } from "./scenes/menu.js";
import { registerSelectScene } from "./scenes/characterSelect.js";
import { registerPlaceholderScene } from "./scenes/placeholder.js";
import { registerMatchEndScene } from "./scenes/matchEnd.js";

const k = kaplay({
  width: SCREEN.width,
  height: SCREEN.height,
  letterbox: true,
  crisp: true,
  pixelDensity: 1,
  texFilter: "nearest",
  font: "pixel",
  background: "#241c2e",
  global: false,
});

k.loadFont("pixel", "assets/fonts/PressStart2P-Regular.ttf");
loadAllSprites(k);
k.setGravity(PHYSICS.gravity);

registerMenuScene(k);
registerSelectScene(k);
registerPlaceholderScene(k);
registerMatchEndScene(k);
registerGameScenes(k);

k.onLoad(() => k.go("menu"));
