import { registerScene } from "./scene.js";
import { loadBobaSprites } from "./level.js";

export default {
  id: "boba",
  title: "BOBA",
  ready: true,
  register(k) {
    loadBobaSprites(k);
    registerScene(k);
  },
};
