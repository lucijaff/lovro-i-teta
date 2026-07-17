// Podizbornik: npr. BOBA → "VRSTA BOBE" → obična ili astuk.
// Prima { title, items: [{ label, gameId }] } i vodi na odabir lika.

import { STR } from "../strings.js";

export function registerSubmenuScene(k) {
  k.scene("submenu", ({ title, items }) => {
    const gold = k.rgb(248, 216, 120);
    const white = k.rgb(244, 244, 244);
    const dim = k.rgb(140, 130, 150);

    k.add([k.rect(k.width(), k.height()), k.pos(0, 0), k.color(36, 28, 46), k.z(-20)]);
    k.add([
      k.text(title, { size: 12, align: "center", width: k.width() }),
      k.pos(k.width() / 2, 40),
      k.anchor("center"),
      k.color(gold),
    ]);

    let selected = 0;
    const rows = items.map((item, i) =>
      k.add([
        k.text("", { size: 8 }),
        k.pos(k.width() / 2, 80 + i * 16),
        k.anchor("center"),
        k.color(white),
      ]),
    );
    function refresh() {
      rows.forEach((row, i) => {
        row.text = i === selected ? `> ${items[i].label} <` : items[i].label;
        row.color = i === selected ? gold : white;
      });
    }
    refresh();

    k.add([
      k.text(STR.menuHint, { size: 8 }),
      k.pos(k.width() / 2, 170),
      k.anchor("center"),
      k.color(dim),
    ]);

    const move = (d) => {
      selected = (selected + d + items.length) % items.length;
      refresh();
    };
    for (const key of ["up", "w"]) k.onKeyPress(key, () => move(-1));
    for (const key of ["down", "s"]) k.onKeyPress(key, () => move(1));
    for (const key of ["enter", "space"]) {
      k.onKeyPress(key, () => k.go("select", { gameId: items[selected].gameId }));
    }
    k.onKeyPress("escape", () => k.go("menu"));
  });
}
