// Piksel-oblačići za govor. Prati lika, čeka u redu ako lik već nešto govori.
//   say(k, lik, "TETA BROJ TRI!", { offset: k.vec2(0, -30) })

import { UI } from "../config.js";

const queues = new WeakMap();

function getQueue(target) {
  if (!queues.has(target)) queues.set(target, { active: false, items: [] });
  return queues.get(target);
}

function wrapText(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > maxChars) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur ? cur + " " + w : w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export function say(k, target, text, opts = {}) {
  const q = getQueue(target);
  q.items.push({ text, opts });
  pump(k, target, q);
}

function pump(k, target, q) {
  if (q.active || q.items.length === 0) return;
  if (!target.exists()) {
    q.items.length = 0;
    return;
  }
  const { text, opts } = q.items.shift();
  q.active = true;

  const size = UI.fontSize;
  const maxChars = Math.max(4, Math.floor((opts.maxWidth ?? UI.bubbleMaxWidth) / size));
  const lines = wrapText(text, maxChars);
  const w = Math.max(...lines.map((l) => l.length)) * size + 10;
  const h = lines.length * (size + 2) + 8;
  const offset = opts.offset ?? k.vec2(0, -30);
  const dark = k.rgb(26, 28, 44);

  const bubble = k.add([
    k.rect(w, h, { radius: 2 }),
    k.pos(target.pos.add(offset)),
    k.anchor("bot"),
    k.color(244, 244, 244),
    k.outline(1, dark),
    k.z(200),
    "bubble",
  ]);
  // repić oblačića
  bubble.add([
    k.polygon([k.vec2(-4, 0), k.vec2(4, 0), k.vec2(0, 5)]),
    k.pos(0, 0),
    k.color(244, 244, 244),
  ]);
  bubble.add([
    k.text(lines.join("\n"), { size, lineSpacing: 2, align: "center" }),
    k.anchor("center"),
    k.pos(0, -h / 2 - 2),
    k.color(26, 28, 44),
  ]);

  bubble.onUpdate(() => {
    if (!target.exists()) {
      bubble.destroy();
      return;
    }
    const p = target.pos.add(offset);
    bubble.pos = k.vec2(
      k.clamp(p.x, w / 2 + 2, k.width() - w / 2 - 2),
      Math.max(p.y, h + 8),
    );
  });

  const duration = opts.duration ?? UI.bubbleDuration + text.length * 0.03;
  k.wait(duration, () => {
    bubble.destroy();
    q.active = false;
    pump(k, target, q);
  });
}
