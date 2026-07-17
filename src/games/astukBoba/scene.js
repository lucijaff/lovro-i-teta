// Astuk Boba — teta s VELIKIM jastukom lovi Lovru po sobi.
// Jastuk je spor ali dalekosežan, a pogodak LANSIRA Lovru preko sobe.
// Lovro pobjeđuje mašući guzom uz tetu (bliže = brže puni) ili bijegom.

import { PHYSICS, ASTUK_BOBA as AB } from "../../config.js";
import { session } from "../../state.js";
import { keyboardController } from "../../input.js";
import { STR } from "../../strings.js";
import { babaBubaTaunts, astukBobaTaunts } from "../../taunts.js";
import { say } from "../../ui/bubble.js";
import { banner, floatText, choice } from "../../ui/banner.js";
import { buildLevel, FIGHTER_SPAWNS } from "../jedanDvaTri/level.js";
import { spawnFighter } from "../jedanDvaTri/fighter.js";
import { createMatch } from "../jedanDvaTri/rules.js";
import { createHud } from "../babaIBuba/hud.js";
import { createTetaCpu, createLovroCpu } from "./ai.js";

export function registerScene(k) {
  k.scene("astukBoba", () => {
    const playerChar = session.playerCharacter;
    const bubbleUp = { offset: k.vec2(0, -28) };

    buildLevel(k);

    const teta = spawnFighter(k, { character: "teta", pos: FIGHTER_SPAWNS.teta, facing: -1 });
    const lovro = spawnFighter(k, { character: "lovro", pos: FIGHTER_SPAWNS.lovro, facing: 1 });
    lovro.speedMul = AB.lovroSpeed / PHYSICS.moveSpeed;

    // veliki jastuk u tetinim rukama: miruje na ramenu, zamah ide naprijed
    const pillow = teta.add([
      k.sprite("velikiJastuk"),
      k.pos(0, -18),
      k.anchor("left"),
      k.rotate(-70),
      k.z(1),
    ]);
    pillow.onUpdate(() => {
      const f = teta.facing;
      const swinging = teta.slapCooldown > AB.swingCooldown - 0.2;
      const t = swinging ? 5 : -70;
      pillow.pos = k.vec2(f * 4, -18);
      pillow.angle = f === 1 ? t : 180 - t;
    });

    const kb = keyboardController(k);
    const tetaCpu = createTetaCpu(k);
    const lovroCpu = createLovroCpu(k);
    const playerIsTeta = playerChar === "teta";
    teta.controller = playerIsTeta ? kb : tetaCpu.ctrl;
    lovro.controller = playerIsTeta ? lovroCpu.ctrl : kb;
    tetaCpu.assign(teta, lovro);
    lovroCpu.assign(lovro, teta);

    const match = createMatch(AB);
    const hud = createHud(k, AB.hitsToWin);

    let phase = "intro"; // intro | playing | roundEnd
    let timeLeft = AB.roundTime;
    let hits = 0;
    let meter = 0;
    let angryStage = 0;
    let leapCd = 0;

    function setFrozen(v) {
      teta.frozen = v;
      lovro.frozen = v;
    }

    function startRound() {
      phase = "intro";
      timeLeft = AB.roundTime;
      hits = 0;
      meter = 0;
      angryStage = 0;
      leapCd = 0;
      for (const f of [teta, lovro]) {
        f.vel = k.vec2(0, 0);
        f.invuln = 0;
        f.animLock = 0;
        f.angle = 0;
      }
      teta.pos = k.vec2(FIGHTER_SPAWNS.teta.x, FIGHTER_SPAWNS.teta.y);
      lovro.pos = k.vec2(FIGHTER_SPAWNS.lovro.x, FIGHTER_SPAWNS.lovro.y);
      teta.facing = -1;
      lovro.facing = 1;
      hud.setRound(match.round, match.maxRounds);
      hud.setTime(timeLeft);
      hud.setSwats(0);
      hud.setMeter(0);
      setFrozen(true);

      banner(k, STR.round(match.round, match.maxRounds), {
        sub: playerIsTeta ? STR.abIntroTeta : STR.bbIntroBuba,
      }).then(() => {
        phase = "playing";
        setFrozen(false);
      });

      if (match.round === 1) {
        const strip = k.add([
          k.rect(k.width(), 13),
          k.pos(0, k.height() - 13),
          k.color(26, 28, 44),
          k.opacity(0.85),
          k.z(149),
        ]);
        const hint = k.add([
          k.text(playerIsTeta ? STR.abSwingHint : STR.ovLeapHint, { size: 8 }),
          k.pos(k.width() / 2, k.height() - 7),
          k.anchor("center"),
          k.color(244, 244, 244),
          k.z(150),
        ]);
        k.wait(5, () => {
          strip.destroy();
          hint.destroy();
        });
      }
    }

    function trySwing() {
      if (teta.slapCooldown > 0) return;
      teta.slapCooldown = AB.swingCooldown;
      teta.playLocked("slap", 0.35);
      const sensor = k.add([
        k.rect(AB.swingReach, 28),
        k.opacity(0),
        k.pos(teta.pos.add(teta.facing * (8 + AB.swingReach / 2), -14)),
        k.anchor("center"),
        k.area(),
        k.lifespan(0.14),
        "swingSensor",
      ]);
      sensor.onCollide("fighter", (f) => {
        if (f !== lovro) return;
        onPillowHit();
        sensor.destroy();
      });
    }

    function onPillowHit() {
      if (phase !== "playing" || lovro.invuln > 0) return;
      hits++;
      hud.setSwats(hits);
      floatText(k, lovro.pos.add(0, -30), STR.abPuf, "#f8b820");
      lovro.invuln = AB.hitInvulnTime;
      lovro.playLocked("ouch", 0.5);
      // jastuk LANSIRA — pola zabave je let preko sobe
      lovro.vel = k.vec2(teta.facing * AB.launchVelX, AB.launchVelY);
      k.shake(3);
      if (hits >= AB.hitsToWin) {
        endRound("teta");
      } else if (Math.random() < 0.6) {
        say(k, teta, choice(babaBubaTaunts.babaSwat), bubbleUp);
      }
    }

    function endRound(winnerId) {
      phase = "roundEnd";
      setFrozen(true);
      match.recordRound(winnerId);

      let text;
      if (winnerId === "teta") {
        text = STR.abHitRound;
        teta.facing = Math.sign(teta.pos.x - lovro.pos.x) || 1;
        teta.playLocked("twerk", 2.2);
        lovro.playLocked("annoyed", 2.2);
      } else {
        text = meter >= AB.tauntTime ? STR.bbBubaMeterRound : STR.bbBubaTimeRound;
        lovro.facing = Math.sign(lovro.pos.x - teta.pos.x) || 1;
        lovro.playLocked("twerk", 2.2);
        teta.playLocked("annoyed", 2.2);
        say(k, lovro, choice(astukBobaTaunts.lovro), bubbleUp);
      }

      banner(k, text, { duration: 2.2 }).then(() => {
        if (match.advance() === "over") {
          k.go("matchEnd", {
            winner: match.winner(),
            scores: { ...match.scores },
            gameId: "astukBoba",
          });
        } else {
          startRound();
        }
      });
    }

    k.onUpdate(() => {
      const dt = k.dt();
      tetaCpu.update(dt);
      lovroCpu.update(dt);

      const wantSwing = teta.controller?.consumePress("slap");
      const wantLeap = lovro.controller?.consumePress("slap");
      if (phase !== "playing") return;
      if (wantSwing && !teta.frozen) trySwing();

      // BRZI IZMAK (X): strelice biraju smjer; bez njih — OD tete
      leapCd = Math.max(0, leapCd - dt);
      if (wantLeap && !lovro.frozen && leapCd <= 0) {
        const c = lovro.controller;
        let leapDir = 0;
        if (c.isDown("left")) leapDir -= 1;
        if (c.isDown("right")) leapDir += 1;
        if (leapDir === 0) leapDir = Math.sign(lovro.pos.x - teta.pos.x) || lovro.facing;
        lovro.facing = leapDir;
        leapCd = AB.leapCooldown;
        lovro.vel = k.vec2(leapDir * AB.leapSpeed, -AB.leapJump);
        lovro.invuln = Math.max(lovro.invuln, AB.leapInvuln);
        floatText(k, lovro.pos.add(-leapDir * 10, -20), "HOP!", "#40d8d0");
      }

      timeLeft -= dt;
      hud.setTime(timeLeft);

      // dok maše guzom, Lovro se automatski okrene guzom prema teti
      const twerking = lovro.invuln <= 0 && lovro.controller?.isDown("twerk");
      if (twerking) {
        lovro.facing = Math.sign(lovro.pos.x - teta.pos.x) || lovro.facing;
      }

      // provokacija: bliže teti = brže puni (do 2×)
      const tetaDist = lovro.pos.dist(teta.pos);
      if (twerking && tetaDist <= AB.tauntRange) {
        meter += dt * (2 - tetaDist / AB.tauntRange);
        hud.setMeter(meter / AB.tauntTime);
        const frac = meter / AB.tauntTime;
        if ((frac > 0.45 && angryStage === 0) || (frac > 0.8 && angryStage === 1)) {
          angryStage++;
          say(k, teta, choice(babaBubaTaunts.babaAngry), bubbleUp);
          teta.playLocked("annoyed", 0.7);
        }
        if (meter >= AB.tauntTime) {
          endRound("lovro");
          return;
        }
      }

      if (timeLeft <= 0) endRound("lovro");
    });

    // Lovro provocira i sam od sebe
    k.loop(7, () => {
      if (phase === "playing" && Math.random() < 0.6) {
        say(k, lovro, choice(astukBobaTaunts.lovro), bubbleUp);
      }
    });

    k.onKeyPress("escape", () => k.go("menu"));

    startRound();
  });
}
