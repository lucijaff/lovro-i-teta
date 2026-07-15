// "USKORO!" — za igre kojima Lovro još nije otkrio (izmislio?) pravila.

import { STR } from "../strings.js";

export function registerPlaceholderScene(k) {
  k.scene("placeholder", ({ title }) => {
    const gold = k.rgb(248, 216, 120);
    const white = k.rgb(244, 244, 244);
    const dim = k.rgb(140, 130, 150);

    k.add([k.rect(k.width(), k.height()), k.pos(0, 0), k.color(36, 28, 46), k.z(-20)]);

    k.add([
      k.text(title, { size: 12, align: "center", width: k.width() }),
      k.pos(k.width() / 2, 34),
      k.anchor("center"),
      k.color(white),
    ]);

    // poskakujući ?-blok
    const block = k.add([
      k.sprite("qblock"),
      k.pos(k.width() / 2, 92),
      k.anchor("center"),
      k.scale(2),
    ]);
    const mark = k.add([
      k.text("?", { size: 16 }),
      k.pos(k.width() / 2, 92),
      k.anchor("center"),
      k.color(k.rgb(26, 28, 44)),
    ]);
    k.onUpdate(() => {
      const bounce = Math.abs(Math.sin(k.time() * 3)) * -8;
      block.pos.y = 92 + bounce;
      mark.pos.y = 92 + bounce;
    });

    const soon = k.add([
      k.text(STR.soon, { size: 14, align: "center", width: k.width() }),
      k.pos(k.width() / 2, 126),
      k.anchor("center"),
      k.color(gold),
      k.opacity(1),
    ]);
    soon.onUpdate(() => {
      soon.opacity = 0.6 + Math.sin(k.time() * 5) * 0.4;
    });

    k.add([
      k.text(STR.soonSub, { size: 8, align: "center", width: k.width() }),
      k.pos(k.width() / 2, 146),
      k.anchor("center"),
      k.color(dim),
    ]);
    k.add([
      k.text(STR.pressAny, { size: 8, align: "center", width: k.width() }),
      k.pos(k.width() / 2, 172),
      k.anchor("center"),
      k.color(dim),
    ]);

    k.onKeyPress(() => k.go("menu"));
  });
}
