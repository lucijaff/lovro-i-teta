// Pretvara tekstualne mreže (ASCII pixel-art) u sprite-ove.
// Svaki znak = jedan piksel, boje dolaze iz palette.js.

import { PALETTE } from "./palette.js";

// frames: niz mreža (svaka mreža = niz stringova iste širine)
export function gridToCanvas(frames, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width * frames.length;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  frames.forEach((grid, fi) => {
    if (grid.length !== height) {
      throw new Error(`Sprite frame ${fi}: očekujem ${height} redova, dobio ${grid.length}`);
    }
    grid.forEach((row, y) => {
      if (row.length !== width) {
        throw new Error(`Sprite frame ${fi}, red ${y}: očekujem ${width} znakova, dobio ${row.length} ("${row}")`);
      }
      for (let x = 0; x < width; x++) {
        const ch = row[x];
        if (ch === ".") continue;
        const color = PALETTE[ch];
        if (color === undefined) {
          throw new Error(`Sprite frame ${fi}, red ${y}: nepoznata boja "${ch}" — dodaj je u palette.js`);
        }
        ctx.fillStyle = color;
        ctx.fillRect(fi * width + x, y, 1, 1);
      }
    });
  });
  return canvas;
}

export function loadPixelSprite(k, name, frames, { width, height, anims = {} } = {}) {
  const canvas = gridToCanvas(frames, width, height);
  return k.loadSprite(name, canvas.toDataURL(), { sliceX: frames.length, sliceY: 1, anims });
}

// Pomoćnik: prazan red / prazni redovi za slaganje dijelova tijela.
export function pad(rows, width = 16) {
  return Array(rows).fill(".".repeat(width));
}

// Slaže dijelove (glava + trup + noge) u jedan frame.
export function stack(...parts) {
  return parts.flat();
}

// Pomiče mrežu vodoravno (n > 0 = udesno). Za izvedene pozicije,
// npr. twerk = kukovi natrag, ramena naprijed.
export function shift(grid, n) {
  const w = grid[0].length;
  return grid.map((row) => {
    const shifted = n >= 0 ? ".".repeat(n) + row.slice(0, w - n) : row.slice(-n) + ".".repeat(-n);
    return shifted;
  });
}
