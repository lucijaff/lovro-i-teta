// Velike najave preko sredine ekrana ("RUNDA 1", "TI PLJESKAŠ!"...)
// i mali leteći tekst (floatText) za "JEDAN!", "NE VRIJEDI!" itd.

import { UI } from "../config.js";

export function banner(k, text, { sub = null, duration = UI.bannerDuration, y = 70 } = {}) {
  const group = k.add([k.pos(0, 0), k.z(300), k.fixed()]);
  group.add([
    k.rect(k.width(), sub ? 44 : 30),
    k.pos(0, y - 15),
    k.color(26, 28, 44),
    k.opacity(0.75),
  ]);
  group.add([
    k.text(text, { size: 14, align: "center", width: k.width() }),
    k.pos(k.width() / 2, y),
    k.anchor("center"),
    k.color(248, 216, 120),
  ]);
  if (sub) {
    group.add([
      k.text(sub, { size: 8, align: "center", width: k.width() }),
      k.pos(k.width() / 2, y + 16),
      k.anchor("center"),
      k.color(244, 244, 244),
    ]);
  }
  return new Promise((resolve) => {
    k.wait(duration, () => {
      group.destroy();
      resolve();
    });
  });
}

export function floatText(k, pos, str, colorHex = "#f8d878") {
  const t = k.add([
    k.text(str, { size: 8 }),
    k.pos(pos),
    k.anchor("center"),
    k.color(k.Color.fromHex(colorHex)),
    k.opacity(1),
    k.z(250),
    k.lifespan(0.7, { fade: 0.4 }),
  ]);
  t.onUpdate(() => {
    t.pos.y -= 24 * k.dt();
  });
  return t;
}

export function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Veliki bljeskajući natpis preko sredine ekrana (BEBA!!!, ŠINGGGG!!!...)
const FLASH_COLORS = ["#f8b820", "#d82810", "#40d8d0", "#c84cb0", "#38b764"];

export function flashText(k, str, { y = 70, size = 24, duration = 1.4 } = {}) {
  const t = k.add([
    k.text(str, { size }),
    k.pos(k.width() / 2, y),
    k.anchor("center"),
    k.color(248, 184, 32),
    k.opacity(1),
    k.z(400),
    k.lifespan(duration, { fade: 0.5 }),
  ]);
  t.onUpdate(() => {
    t.color = k.Color.fromHex(FLASH_COLORS[Math.floor(k.time() * 10) % FLASH_COLORS.length]);
    t.pos.y = y + Math.sin(k.time() * 14) * 3;
  });
  return t;
}
