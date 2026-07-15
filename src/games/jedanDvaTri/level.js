// Tetina soba — mapa razine za JEDAN DVA TRI.
// Svaki znak = jedna pločica 16×16:
//   F = pod   B = madrac (odskočan!)  g/h = uzglavlje  e = podnožje kreveta
//   = = polica (može se skočiti kroz nju odozdo)   q = crtež   w = prozor

const TILE = 16;

export const LEVEL_MAP = [
  "....................",
  "....................",
  "..q.......w....q....",
  "..==........==......",
  "....................",
  "................===.",
  ".====...............",
  ".............==.....",
  "g...................",
  "hBBBBe..............",
  "FFFFFFFFFFFFFFFFFFFF",
];

export const LEVEL_OFFSET_Y = 180 - LEVEL_MAP.length * TILE; // 4

// y-koordinate površina (vrh pločice)
const surfaceY = (row) => LEVEL_OFFSET_Y + row * TILE;

export const FIGHTER_SPAWNS = {
  lovro: { x: 56, y: surfaceY(9) }, // na krevetu (njegov teren)
  teta: { x: 264, y: surfaceY(10) }, // na podu desno
};

// Mjesta gdje se pojavljuju predmeti — namjerno nisko i lako dohvatljivo.
export const OBJECT_SPAWNS = [
  { x: 56, y: surfaceY(9) - 2 }, // krevet
  { x: 160, y: surfaceY(10) }, // pod, sredina
  { x: 292, y: surfaceY(10) }, // pod, desno
  { x: 216, y: surfaceY(7) }, // niska srednja polica
  { x: 40, y: surfaceY(6) }, // lijeva polica (skok s kreveta)
];

export function buildLevel(k) {
  // zid (pozadina) + lajsna
  k.add([k.rect(k.width(), k.height()), k.pos(0, 0), k.color(58, 46, 68), k.z(-20)]);
  k.add([
    k.rect(k.width(), 6),
    k.pos(0, surfaceY(10) - 6),
    k.color(42, 32, 50),
    k.z(-19),
  ]);

  const solid = (spriteName, extraTags = []) => () => [
    k.sprite(spriteName),
    k.area(),
    k.body({ isStatic: true }),
    "ground",
    ...extraTags,
  ];

  // platforme kroz koje se može skočiti odozdo (samo gornji rub je čvrst)
  const oneWay = (spriteName, colliderH, extraTags = []) => () => [
    k.sprite(spriteName),
    k.area({ shape: new k.Rect(k.vec2(0, 0), TILE, colliderH) }),
    k.body({ isStatic: true }),
    // {} je obavezan: kaplay 3001 puca na platformEffector() bez argumenta
    k.platformEffector({}),
    "ground",
    ...extraTags,
  ];

  const decor = (spriteName) => () => [k.sprite(spriteName), k.z(-10)];

  return k.addLevel(LEVEL_MAP, {
    tileWidth: TILE,
    tileHeight: TILE,
    pos: k.vec2(0, LEVEL_OFFSET_Y),
    tiles: {
      F: solid("floor"),
      B: oneWay("bedMid", 6, ["bed"]),
      "=": oneWay("shelf", 4),
      g: decor("bedHeadTop"),
      h: decor("bedHeadBot"),
      e: decor("bedFoot"),
      q: decor("poster"),
      w: decor("window"),
    },
  });
}
