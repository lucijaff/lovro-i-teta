// CPU hrvač za BOBU: prilazi, grabi, ponekad se povuče — a kad JE bačen,
// upravlja padom prema najbližem jastuku ili deki, kao i pravi igrač.

import { BOBA } from "../../config.js";
import { virtualController } from "../../input.js";

export function createBobaCpu(k) {
  const ctrl = virtualController();
  let me = null;
  let foe = null;
  let tickT = 0;
  let reactT = 0;
  let retreatT = 0;
  let lastX = 0;
  let stuckT = 0;

  function moveToward(x, deadzone = 4) {
    const dx = x - me.pos.x;
    ctrl.hold("left", dx < -deadzone);
    ctrl.hold("right", dx > deadzone);
  }

  return {
    ctrl,
    assign(self, opponent) {
      me = self;
      foe = opponent;
      ctrl.releaseAll();
      reactT = 0;
      retreatT = 0;
    },
    // ctx: { flung: borac koji trenutno leti (ili null), zones: sigurne zone }
    update(dt, ctx) {
      if (!me || me.frozen) {
        ctrl.releaseAll();
        return;
      }
      tickT -= dt;
      reactT -= dt;
      retreatT -= dt;

      // JA letim: upravljaj padom prema najbližoj sigurnoj zoni!
      if (ctx?.flung === me) {
        let best = null;
        let bestD = Infinity;
        for (const z of ctx.zones) {
          const cx = (z.x0 + z.x1) / 2;
          const d = Math.abs(cx - me.pos.x);
          if (d < bestD) {
            bestD = d;
            best = cx;
          }
        }
        if (best != null) moveToward(best, 3);
        return;
      }

      const wantsMove = ctrl.isDown("left") || ctrl.isDown("right");
      if (wantsMove && Math.abs(me.pos.x - lastX) < 8 * dt) stuckT += dt;
      else stuckT = 0;
      lastX = me.pos.x;
      if (stuckT > 0.35 && me.isGrounded()) {
        ctrl.press("jump");
        stuckT = 0;
      }

      if (tickT > 0) return;
      tickT = 0.22 + Math.random() * 0.12;

      // protivnik leti — odmakni se i gledaj predstavu
      if (ctx?.flung === foe) {
        moveToward(me.pos.x < 160 ? 60 : 260, 6);
        return;
      }

      if (retreatT > 0) {
        moveToward(me.pos.x - Math.sign(foe.pos.x - me.pos.x) * 80, 4);
        if (Math.random() < 0.1 && me.isGrounded()) ctrl.press("jump");
        return;
      }

      // prilazi i grabi
      moveToward(foe.pos.x);
      const dx = Math.abs(foe.pos.x - me.pos.x);
      const dy = Math.abs(foe.pos.y - me.pos.y);
      if (dx < BOBA.grabRange + 4 && dy < 24 && reactT <= 0) {
        ctrl.press("slap");
        reactT = BOBA.ai.grabReactionMin + Math.random() * (BOBA.ai.grabReactionMax - BOBA.ai.grabReactionMin);
        if (Math.random() < BOBA.ai.retreatChance) retreatT = 0.8;
      }
      if (dx < 50 && Math.random() < 0.06 && me.isGrounded()) {
        ctrl.press("jump"); // odskočni krevet se mora koristiti!
      }
    },
  };
}
