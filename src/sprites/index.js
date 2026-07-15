import { loadCharacterSprites } from "./characters.js";
import { loadObjectSprites } from "./objects.js";
import { loadTileSprites } from "./tiles.js";

export function loadAllSprites(k) {
  loadCharacterSprites(k);
  loadObjectSprites(k);
  loadTileSprites(k);
}
