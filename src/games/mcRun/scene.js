// MC Run — Lovro nosi Maksa (crnu mačku) visoko iznad glave i lovi tetu.
// Ona bježi jer ne voli mačke. Dodir s Maksom = ulov, MIJAU!
// Uloge su napokon obrnute: LOVRO lovi, TETA ima brzi izmak.

import { PHYSICS, MC_RUN as MC } from "../../config.js";
import { session } from "../../state.js";
import { keyboardController } from "../../input.js";
import { STR } from "../../strings.js";
import { mcRunTaunts } from "../../taunts.js";
import { say } from "../../ui/bubble.js";
import { banner, floatText, flashText, choice } from "../../ui/banner.js";
import { installBebaEgg } from "../../ui/bebaEgg.js";
import { buildLevel, FIGHTER_SPAWNS } from "../jedanDvaTri/level.js";
import { spawnFighter } from "../jedanDvaTri/fighter.js";
import { createMatch } from "../jedanDvaTri/rules.js";
import { createHud } from "../babaIBuba/hud.js";
import { createLovroCpu, createTetaCpu } from "./ai.js";

export function registerScene(k) {
  k.scene("mcRun", () => {
    const playerChar = session.playerCharacter;
    const bubbleUp = { offset: k.vec2(0, -28) };
    const bubbleCat = { offset: k.vec2(0, -10) };

    buildLevel(k);

    const lovro = spawnFighter(k, { character: "lovro", pos: FIGHTER_SPAWNS.lovro, facing: 1 });
    const teta = spawnFighter(k, { character: "teta", pos: FIGHTER_SPAWNS.teta, facing: -1 });
    teta.jumpMul = MC.tetaJumpMul;

    // Maks: nošen u naručju, ispred Lovre (ne iznad glave).
    const maks = k.add([k.sprite("maks"), k.pos(0, 0), k.anchor("bot"), k.z(11), "maks"]);
    lovro.speedMul = MC.lovroSpeed / PHYSICS.moveSpeed;
    maks.onUpdate(() => {
      maks.pos = lovro.pos.add(lovro.facing * 6, -9);
      maks.flipX = lovro.facing < 0;
    });

    const kb = keyboardController(k);
    const lovroCpu = createLovroCpu(k);
    const tetaCpu = createTetaCpu(k);
    const playerIsLovro = playerChar === "lovro";
    lovro.controller = playerIsLovro ? kb : lovroCpu.ctrl;
    teta.controller = playerIsLovro ? tetaCpu.ctrl : kb;
    lovroCpu.assign(lovro, teta);
    tetaCpu.assign(teta, lovro);

    installBebaEgg(k, { lovro, teta, enabled: playerIsLovro });

    const match = createMatch(MC);
    const hud = createHud(k, MC.catchesToWin, {
      meterOwner: "TETA",
      pipsOwner: "LOVRO",
      meterLabel: STR.mcMeterLabel,
    });

    let phase = "intro"; // intro | playing | roundEnd
    let timeLeft = MC.roundTime;
    let catches = 0;
    let leapCd = 0;

    function setFrozen(v) {
      lovro.frozen = v;
      teta.frozen = v;
    }

    function startRound() {
      phase = "intro";
      timeLeft = MC.roundTime;
      catches = 0;
      leapCd = 0;
      for (const f of [lovro, teta]) {
        f.vel = k.vec2(0, 0);
        f.invuln = 0;
        f.animLock = 0;
        f.angle = 0;
      }
      lovro.pos = k.vec2(FIGHTER_SPAWNS.lovro.x, FIGHTER_SPAWNS.lovro.y);
      teta.pos = k.vec2(FIGHTER_SPAWNS.teta.x, FIGHTER_SPAWNS.teta.y);
      lovro.facing = 1;
      teta.facing = -1;
      hud.setRound(match.round, match.maxRounds);
      hud.setTime(timeLeft);
      hud.setSwats(0);
      hud.setMeter(0);
      setFrozen(true);

      banner(k, STR.round(match.round, match.maxRounds), {
        sub: playerIsLovro ? STR.mcIntroLovro : STR.mcIntroTeta,
      }).then(() => {
        phase = "playing";
        setFrozen(false);
      });

      if (!playerIsLovro && match.round === 1) {
        const strip = k.add([
          k.rect(k.width(), 13),
          k.pos(0, k.height() - 13),
          k.color(26, 28, 44),
          k.opacity(0.85),
          k.z(149),
        ]);
        const hint = k.add([
          k.text(STR.ovLeapHint, { size: 8 }),
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

    function onCatch() {
      catches++;
      hud.setSwats(catches);
      flashText(k, "ŠINGGGG!!!"); // zvuk dodira mačke, naravno
      floatText(k, teta.pos.add(0, -30), STR.mcCatch, "#f8b820");
      say(k, teta, choice(mcRunTaunts.tetaCaught), bubbleUp);
      teta.playLocked("ouch", 0.4);
      teta.invuln = MC.hitInvulnTime;
      // pobjegne u paničnom skoku od mačke
      teta.vel = k.vec2(Math.sign(teta.pos.x - lovro.pos.x || 1) * 180, -160);
      // a Lovro, naravno, slavi
      lovro.playLocked("twerk", 0.8);
      k.shake(3);
      if (catches >= MC.catchesToWin) endRound("lovro");
    }

    function endRound(winnerId) {
      phase = "roundEnd";
      setFrozen(true);
      match.recordRound(winnerId);

      let text;
      if (winnerId === "lovro") {
        text = STR.mcCatchRound;
        lovro.facing = Math.sign(lovro.pos.x - teta.pos.x) || 1;
        lovro.playLocked("twerk", 2.2);
        teta.playLocked("annoyed", 2.2);
        say(k, maks, choice(mcRunTaunts.maks), bubbleCat);
      } else {
        text = STR.mcEscapeRound;
        teta.facing = Math.sign(teta.pos.x - lovro.pos.x) || 1;
        teta.playLocked("twerk", 2.2); // i teta zna slaviti
        lovro.playLocked("annoyed", 2.2);
      }

      banner(k, text, { duration: 2.2 }).then(() => {
        if (match.advance() === "over") {
          k.go("matchEnd", {
            winner: match.winner(),
            scores: { ...match.scores },
            gameId: "mcRun",
          });
        } else {
          startRound();
        }
      });
    }

    k.onUpdate(() => {
      const dt = k.dt();
      lovroCpu.update(dt);
      tetaCpu.update(dt);

      lovro.controller?.consumePress("slap"); // Lovru dodir radi sve
      const wantLeap = teta.controller?.consumePress("slap");
      if (phase !== "playing") return;

      // tetin BRZI IZMAK (X): strelice biraju smjer; bez njih — OD mačke
      leapCd = Math.max(0, leapCd - dt);
      if (wantLeap && !teta.frozen && leapCd <= 0) {
        const c = teta.controller;
        let leapDir = 0;
        if (c.isDown("left")) leapDir -= 1;
        if (c.isDown("right")) leapDir += 1;
        if (leapDir === 0) leapDir = Math.sign(teta.pos.x - lovro.pos.x) || teta.facing;
        teta.facing = leapDir;
        leapCd = MC.leapCooldown;
        teta.vel = k.vec2(leapDir * MC.leapSpeed, -MC.leapJump);
        teta.invuln = Math.max(teta.invuln, MC.leapInvuln);
        floatText(k, teta.pos.add(-leapDir * 10, -20), "HOP!", "#40d8d0");
      }

      // ULOV: Maks dodirne tetu
      if (teta.invuln <= 0 && lovro.pos.dist(teta.pos) <= MC.touchRange) {
        onCatch();
        if (phase !== "playing") return;
      }

      timeLeft -= dt;
      hud.setTime(timeLeft);
      hud.setMeter(1 - timeLeft / MC.roundTime); // tetin "bijeg" se puni vremenom
      if (timeLeft <= 0) endRound("teta");
    });

    // Lovro i Maks se oglašavaju; teta paničari
    k.loop(6, () => {
      if (phase !== "playing") return;
      const r = Math.random();
      if (r < 0.35) say(k, lovro, choice(mcRunTaunts.lovro), bubbleUp);
      else if (r < 0.6) say(k, maks, choice(mcRunTaunts.maks), bubbleCat);
      else if (r < 0.8) say(k, teta, choice(mcRunTaunts.teta), bubbleUp);
    });

    k.onKeyPress("escape", () => k.go("menu"));

    startRound();
  });
}
