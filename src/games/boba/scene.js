// BOBA — hrvanje na VELIKOM krevetu. Zgrabi protivnika (X) i baci ga:
// padne li na gola leđa (madrac) — bod! Padne li na jastuk ili deku —
// ne vrijedi. Bačeni u letu upravlja padom strelicama, pa je svako
// bacanje mala borba za zonu slijetanja. A Lovro? Lovro ponekad
// jednostavno izjavi da nije pao na leđa. Naravno.

import { BOBA, LOVRO_RULES } from "../../config.js";
import { session } from "../../state.js";
import { CHARACTERS, otherCharacter } from "../../sprites/characters.js";
import { keyboardController } from "../../input.js";
import { STR } from "../../strings.js";
import { gameTaunts } from "../../taunts.js";
import { say } from "../../ui/bubble.js";
import { banner, floatText, choice } from "../../ui/banner.js";
import { spawnFighter } from "../jedanDvaTri/fighter.js";
import { createMatch } from "../jedanDvaTri/rules.js";
import { createHud } from "../jedanDvaTri/hud.js";
import { buildArena, placePillows, inSafeZone, SURFACE_Y } from "./level.js";
import { createBobaCpu } from "./ai.js";

const SPAWNS = { lovro: 80, teta: 240 };

export function registerScene(k) {
  k.scene("boba", () => {
    const playerChar = session.playerCharacter;
    const cpuChar = otherCharacter(playerChar);
    const bubbleUp = { offset: k.vec2(0, -28) };

    buildArena(k);

    const fighters = {
      lovro: spawnFighter(k, { character: "lovro", pos: { x: SPAWNS.lovro, y: SURFACE_Y }, facing: 1 }),
      teta: spawnFighter(k, { character: "teta", pos: { x: SPAWNS.teta, y: SURFACE_Y }, facing: -1 }),
    };
    const kb = keyboardController(k);
    const cpu = createBobaCpu(k);
    fighters[playerChar].controller = kb;
    fighters[cpuChar].controller = cpu.ctrl;
    cpu.assign(fighters[cpuChar], fighters[playerChar]);

    const match = createMatch(BOBA);
    const hud = createHud(k, BOBA.throwsToWin);

    let phase = "intro"; // intro | playing | roundEnd
    let timeLeft = BOBA.roundTime;
    let golden = false;
    let points = { lovro: 0, teta: 0 };
    let denialsLeft = LOVRO_RULES.maxDenialsPerRound;
    let flung = null; // borac koji trenutno leti
    let flungBy = null;
    let flungAirT = 0;
    let pillowSprites = [];
    let zones = [];

    function setFrozen(v) {
      fighters.lovro.frozen = v;
      fighters.teta.frozen = v;
    }

    function clearFlung() {
      if (flung) flung.speedMul = 1;
      flung = null;
      flungBy = null;
    }

    function startRound() {
      phase = "intro";
      timeLeft = BOBA.roundTime;
      golden = false;
      points = { lovro: 0, teta: 0 };
      denialsLeft = LOVRO_RULES.maxDenialsPerRound;
      clearFlung();

      const placed = placePillows(k, pillowSprites);
      pillowSprites = placed.sprites;
      zones = placed.zones;

      for (const id of ["lovro", "teta"]) {
        const f = fighters[id];
        f.pos = k.vec2(SPAWNS[id], SURFACE_Y);
        f.vel = k.vec2(0, 0);
        f.angle = 0;
        f.invuln = 0;
        f.animLock = 0;
        f.speedMul = 1;
      }
      fighters.lovro.facing = 1;
      fighters.teta.facing = -1;

      hud.setRoundWins(match.scores);
      hud.setRound(match.round, match.maxRounds);
      hud.setTime(timeLeft);
      hud.setSlaps(points);
      setFrozen(true);

      banner(k, STR.round(match.round, match.maxRounds), { sub: STR.bobaIntro }).then(() => {
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
          k.text(STR.bobaHint, { size: 8 }),
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

    function tryThrow(thrower) {
      if (thrower.slapCooldown > 0 || thrower === flung) return;
      thrower.slapCooldown = BOBA.grabCooldown;
      thrower.playLocked("slap", 0.35);
      // vidljiv zamah — pokazuje doseg hvatanja
      k.add([
        k.rect(BOBA.grabRange, 24, { radius: 2 }),
        k.pos(thrower.pos.add(thrower.facing * (6 + BOBA.grabRange / 2), -12)),
        k.anchor("center"),
        k.color(244, 244, 244),
        k.opacity(0.35),
        k.z(60),
        k.lifespan(0.18, { fade: 0.18 }),
      ]);

      const victim = fighters[otherCharacter(thrower.character)];
      const close =
        Math.abs(thrower.pos.x - victim.pos.x) <= BOBA.grabRange &&
        Math.abs(thrower.pos.y - victim.pos.y) <= 24;
      if (!close || victim === flung || victim.invuln > 0) return;

      // BACI GA! Bačeni u letu upravlja padom (smanjeno upravljanje).
      flung = victim;
      flungBy = thrower;
      flungAirT = 0;
      victim.speedMul = BOBA.flungSteerMul;
      victim.vel = k.vec2(thrower.facing * BOBA.flingVelX, BOBA.flingVelY);
      victim.playLocked("ouch", 0.3);
      k.shake(2);
    }

    function resolveLanding() {
      const victim = flung;
      const thrower = flungBy;
      clearFlung();
      victim.invuln = BOBA.hitInvulnTime;

      // jastuk ili deka: ne vrijedi!
      if (inSafeZone(zones, victim.pos.x)) {
        floatText(k, victim.pos.add(0, -30), STR.invalid, "#40d8d0");
        if (Math.random() < 0.5) say(k, victim, choice(gameTaunts.slapImmune), bubbleUp);
        return;
      }

      // LOVRINA PRAVILA: "nisam pao na leđa, valjda ja znam"
      if (victim.character === "lovro" && denialsLeft > 0) {
        const chance =
          match.scores.lovro < match.scores.teta || points.lovro < points.teta
            ? LOVRO_RULES.denyChanceWhenLosing
            : LOVRO_RULES.denyChance;
        if (Math.random() < chance) {
          denialsLeft--;
          floatText(k, k.vec2(k.width() / 2, 60), STR.lovroRule, "#f8b820");
          say(k, victim, choice(gameTaunts.lovroDeny), bubbleUp);
          victim.playLocked("twerk", 1);
          k.wait(0.9, () => {
            if (thrower.exists()) say(k, thrower, choice(gameTaunts.tetaDenyReact), bubbleUp);
          });
          return;
        }
      }

      // NA LEĐA! Bod za bacača, žrtva malo odleži.
      const id = thrower.character;
      points[id]++;
      hud.setSlaps(points);
      floatText(k, victim.pos.add(0, -30), STR.bobaNaLedja, "#d82810");
      victim.angle = -victim.facing * 90;
      victim.frozen = true;
      victim.playLocked("ouch", BOBA.lieDownTime);
      k.shake(3);
      k.wait(BOBA.lieDownTime, () => {
        victim.angle = 0;
        if (phase === "playing") victim.frozen = false;
      });

      if (golden || points[id] >= BOBA.throwsToWin) {
        endRound(id);
      } else if (Math.random() < 0.4) {
        say(k, thrower, choice(gameTaunts.slapHit), bubbleUp);
      }
    }

    function endRound(winnerId) {
      phase = "roundEnd";
      clearFlung();
      setFrozen(true);
      match.recordRound(winnerId);
      hud.setRoundWins(match.scores);

      const winner = fighters[winnerId];
      const loser = fighters[otherCharacter(winnerId)];
      say(k, winner, choice(gameTaunts.roundWin), bubbleUp);
      say(k, loser, choice(gameTaunts.roundLose), bubbleUp);
      winner.facing = Math.sign(winner.pos.x - loser.pos.x) || 1;
      winner.playLocked("twerk", 2.2);
      loser.angle = 0;
      loser.playLocked("annoyed", 2.2);

      banner(k, STR.roundWin(CHARACTERS[winnerId].title), { duration: 2.2 }).then(() => {
        if (match.advance() === "over") {
          k.go("matchEnd", {
            winner: match.winner(),
            scores: { ...match.scores },
            gameId: "boba",
          });
        } else {
          startRound();
        }
      });
    }

    k.onUpdate(() => {
      const dt = k.dt();
      cpu.update(dt, { flung, zones });

      for (const f of Object.values(fighters)) {
        const wantThrow = f.controller?.consumePress("slap");
        if (phase !== "playing" || f.frozen) continue;
        if (wantThrow) tryThrow(f);
      }

      if (phase !== "playing") return;

      // let i slijetanje bačenog
      if (flung) {
        flungAirT += dt;
        if ((flungAirT > 0.15 && flung.isGrounded()) || flungAirT > 2.5) resolveLanding();
      }

      if (!golden) {
        timeLeft -= dt;
        hud.setTime(timeLeft);
        if (timeLeft <= 0) {
          if (points.lovro !== points.teta) {
            endRound(points.lovro > points.teta ? "lovro" : "teta");
          } else {
            golden = true;
            hud.setGolden();
            banner(k, STR.bobaGolden, { sub: STR.bobaGoldenSub, duration: 1.8 });
          }
        }
      }
    });

    // Lovro provocira i dok se hrvaju, naravno
    k.loop(8, () => {
      if (phase === "playing" && Math.random() < 0.6) {
        say(k, fighters.lovro, choice(gameTaunts.lovroRandom), bubbleUp);
      }
    });

    k.onKeyPress("escape", () => k.go("menu"));

    startRound();
  });
}
