// Glavni izbornik: Lovro i teta stoje jedno nasuprot drugome,
// Lovro provocira, teta se živcira. Kao doma.

import { UI } from "../config.js";
import { STR } from "../strings.js";
import { menuTaunts } from "../taunts.js";
import { GAMES } from "../registry.js";
import { say } from "../ui/bubble.js";

export function registerMenuScene(k) {
  k.scene("menu", () => {
    const gold = k.rgb(248, 216, 120);
    const white = k.rgb(244, 244, 244);
    const dim = k.rgb(140, 130, 150);
    const bubbleUp = { offset: k.vec2(0, -52) };

    // pozadina i pod
    k.add([k.rect(k.width(), k.height()), k.pos(0, 0), k.color(36, 28, 46), k.z(-20)]);
    for (let x = 0; x < 20; x++) {
      k.add([k.sprite("floor"), k.pos(x * 16, 164), k.z(-10)]);
    }

    // naslov
    k.add([
      k.text(STR.title, { size: 16, align: "center", width: k.width() }),
      k.pos(k.width() / 2, 18),
      k.anchor("center"),
      k.color(gold),
    ]);
    k.add([
      k.text(STR.subtitle, { size: 8, align: "center", width: k.width() }),
      k.pos(k.width() / 2, 34),
      k.anchor("center"),
      k.color(dim),
    ]);

    // likovi
    const lovro = k.add([
      k.sprite("lovro"),
      k.pos(56, 164),
      k.anchor("bot"),
      k.scale(2),
    ]);
    const teta = k.add([
      k.sprite("teta"),
      k.pos(264, 164),
      k.anchor("bot"),
      k.scale(2),
    ]);
    teta.flipX = true;
    lovro.play("idle");
    teta.play("idle");

    // Lovrine provokacije, redom iz taunts.js
    let tauntIdx = 0;
    function playTaunt() {
      const t = menuTaunts[tauntIdx % menuTaunts.length];
      tauntIdx++;
      say(k, lovro, t.lovro, bubbleUp);
      k.wait(1.4, () => {
        teta.play("annoyed");
        if (t.teta) say(k, teta, t.teta, bubbleUp);
        k.wait(2.4, () => teta.play("idle"));
      });
    }
    k.wait(0.8, playTaunt);
    k.loop(UI.menuTauntInterval, playTaunt);

    // popis igara
    k.add([
      k.text(STR.chooseGame, { size: 8 }),
      k.pos(k.width() / 2, 56),
      k.anchor("center"),
      k.color(dim),
    ]);
    let selected = 0;
    const items = GAMES.map((game, i) =>
      k.add([
        k.text("", { size: 8 }),
        k.pos(k.width() / 2, 72 + i * 14),
        k.anchor("center"),
        k.color(white),
        { game },
      ]),
    );
    function refresh() {
      items.forEach((item, i) => {
        const playable = item.game.ready || !!item.game.submenu;
        const name = playable ? item.game.title : `${item.game.title} *`;
        item.text = i === selected ? `> ${name} <` : name;
        item.color = i === selected ? gold : playable ? white : dim;
      });
    }
    refresh();

    if (GAMES.some((g) => !g.ready && !g.submenu)) {
      k.add([
        k.text("* = USKORO", { size: 8 }),
        k.pos(k.width() / 2, 72 + GAMES.length * 14 + 2),
        k.anchor("center"),
        k.color(dim),
      ]);
    }
    // traka s uputama preko poda, da tekst bude čitljiv
    k.add([
      k.rect(k.width(), 13),
      k.pos(0, k.height() - 13),
      k.color(26, 28, 44),
      k.opacity(0.85),
      k.z(20),
    ]);
    k.add([
      k.text(STR.menuHint, { size: 8 }),
      k.pos(k.width() / 2, k.height() - 7),
      k.anchor("center"),
      k.color(white),
      k.z(21),
    ]);

    const move = (d) => {
      selected = (selected + d + GAMES.length) % GAMES.length;
      refresh();
    };
    for (const key of ["up", "w"]) k.onKeyPress(key, () => move(-1));
    for (const key of ["down", "s"]) k.onKeyPress(key, () => move(1));
    for (const key of ["enter", "space"]) {
      k.onKeyPress(key, () => {
        const game = GAMES[selected];
        if (game.submenu) {
          k.go("submenu", {
            title: game.submenuTitle,
            items: game.submenu.map((s) => ({ label: s.label, gameId: s.game.id })),
          });
        } else if (game.ready) {
          k.go("select", { gameId: game.id });
        } else {
          k.go("placeholder", { title: game.title });
        }
      });
    }
  });
}
