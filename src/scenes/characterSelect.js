// Odabir lika: igraš kao Lovro ili kao teta? Drugi je CPU.

import { STR } from "../strings.js";
import { CHARACTERS } from "../sprites/characters.js";
import { setPlayerCharacter } from "../state.js";

export function registerSelectScene(k) {
  k.scene("select", ({ gameId }) => {
    const gold = k.rgb(248, 216, 120);
    const white = k.rgb(244, 244, 244);
    const dim = k.rgb(140, 130, 150);
    const dark = k.rgb(46, 36, 58);

    k.add([k.rect(k.width(), k.height()), k.pos(0, 0), k.color(36, 28, 46), k.z(-20)]);
    k.add([
      k.text(STR.choosePlayer, { size: 12, align: "center", width: k.width() }),
      k.pos(k.width() / 2, 22),
      k.anchor("center"),
      k.color(gold),
    ]);

    const ids = ["lovro", "teta"];
    let selected = 0;

    const slots = ids.map((id, i) => {
      const x = 110 + i * 100;
      const card = k.add([
        k.rect(64, 92, { radius: 3 }),
        k.pos(x, 128),
        k.anchor("bot"),
        k.color(dark),
        k.outline(2, dim),
      ]);
      const sprite = k.add([
        k.sprite(id),
        k.pos(x, 120),
        k.anchor("bot"),
        k.scale(3),
      ]);
      sprite.play("idle");
      const label = k.add([
        k.text(CHARACTERS[id].title, { size: 8 }),
        k.pos(x, 138),
        k.anchor("center"),
        k.color(white),
      ]);
      return { card, sprite, label };
    });

    const youAre = k.add([
      k.text("", { size: 8 }),
      k.pos(k.width() / 2, 152),
      k.anchor("center"),
      k.color(white),
    ]);
    k.add([
      k.text(STR.controlsHint1, { size: 8 }),
      k.pos(k.width() / 2, 164),
      k.anchor("center"),
      k.color(dim),
    ]);
    k.add([
      k.text(STR.controlsHint2, { size: 8 }),
      k.pos(k.width() / 2, 174),
      k.anchor("center"),
      k.color(dim),
    ]);

    function refresh() {
      slots.forEach((s, i) => {
        const on = i === selected;
        s.card.outline.color = on ? gold : dim;
        s.label.color = on ? gold : white;
        s.sprite.play(on ? "run" : "idle");
      });
      youAre.text = `${STR.youAre} ${CHARACTERS[ids[selected]].title}`;
    }
    refresh();

    const move = (d) => {
      selected = (selected + d + ids.length) % ids.length;
      refresh();
    };
    for (const key of ["left", "a"]) k.onKeyPress(key, () => move(-1));
    for (const key of ["right", "d"]) k.onKeyPress(key, () => move(1));
    for (const key of ["enter", "space"]) {
      k.onKeyPress(key, () => {
        setPlayerCharacter(ids[selected]);
        k.go(gameId);
      });
    }
    k.onKeyPress("escape", () => k.go("menu"));
  });
}
