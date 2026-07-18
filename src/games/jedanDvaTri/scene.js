// JEDAN DVA TRI — glavna scena igre.
//
// Lovrina prava pravila: OBOJE istovremeno love tuđu guzu. Tko prvi skupi
// 3 pljeske (bilo kada, ne zaredom) osvaja rundu. Tko drži predmet, njega
// pljeske ne vrijede... a Lovro ponekad jednostavno IZMISLI da ga nisi
// pogodio. Takva su pravila. Lovrina.

import { JEDAN_DVA_TRI as JDT, LOVRO_RULES } from "../../config.js";
import { session } from "../../state.js";
import { CHARACTERS, otherCharacter } from "../../sprites/characters.js";
import { keyboardController } from "../../input.js";
import { STR } from "../../strings.js";
import { gameTaunts } from "../../taunts.js";
import { say } from "../../ui/bubble.js";
import { banner, floatText, choice } from "../../ui/banner.js";
import { installBebaEgg } from "../../ui/bebaEgg.js";
import { buildLevel, FIGHTER_SPAWNS, OBJECT_SPAWNS } from "./level.js";
import { spawnFighter } from "./fighter.js";
import { trySlap, shieldFlash } from "./slap.js";
import { createPickups } from "./pickups.js";
import { createMatch } from "./rules.js";
import { createCpu } from "./ai.js";
import { createHud } from "./hud.js";

export function registerScene(k) {
  k.scene("jedanDvaTri", () => {
    const playerChar = session.playerCharacter;
    const cpuChar = otherCharacter(playerChar);
    const bubbleUp = { offset: k.vec2(0, -28) };

    buildLevel(k);

    const fighters = {
      lovro: spawnFighter(k, { character: "lovro", pos: FIGHTER_SPAWNS.lovro, facing: 1 }),
      teta: spawnFighter(k, { character: "teta", pos: FIGHTER_SPAWNS.teta, facing: -1 }),
    };
    const kb = keyboardController(k);
    const cpu = createCpu(k);
    fighters[playerChar].controller = kb;
    fighters[cpuChar].controller = cpu.ctrl;
    cpu.assign(fighters[cpuChar], fighters[playerChar]);
    installBebaEgg(k, {
      lovro: fighters.lovro,
      teta: fighters.teta,
      enabled: playerChar === "lovro",
    });

    const match = createMatch(JDT);
    const hud = createHud(k, JDT.slapsToWin);
    const pickups = createPickups(k, OBJECT_SPAWNS);

    let phase = "intro"; // intro | playing | roundEnd
    let roundElapsed = 0;
    let timeLeft = JDT.roundTime;
    let golden = false; // izjednačeno na isteku vremena → sljedeća pljeska pobjeđuje
    let slaps = { lovro: 0, teta: 0 };
    let denialsLeft = LOVRO_RULES.maxDenialsPerRound;

    function setFrozen(v) {
      fighters.lovro.frozen = v;
      fighters.teta.frozen = v;
    }

    function startRound() {
      phase = "intro";
      slaps = { lovro: 0, teta: 0 };
      golden = false;
      hud.setSlaps(slaps);
      roundElapsed = 0;
      timeLeft = JDT.roundTime;
      denialsLeft = LOVRO_RULES.maxDenialsPerRound;

      pickups.dropAll();
      pickups.reset();

      for (const id of ["lovro", "teta"]) {
        fighters[id].pos = k.vec2(FIGHTER_SPAWNS[id].x, FIGHTER_SPAWNS[id].y);
        fighters[id].invuln = 0;
      }
      fighters.lovro.facing = 1;
      fighters.teta.facing = -1;

      hud.setRoundWins(match.scores);
      hud.setRound(match.round, match.maxRounds);
      hud.setTime(timeLeft);
      setFrozen(true);

      // strelica "TI" iznad igračevog lika, da se zna tko je tko
      const marker = k.add([
        k.text("TI", { size: 8 }),
        k.pos(0, 0),
        k.anchor("bot"),
        k.color(248, 216, 120),
        k.z(150),
      ]);
      marker.onUpdate(() => {
        marker.pos = fighters[playerChar].pos.add(0, -30 + Math.sin(k.time() * 6) * 2);
      });
      k.wait(3, () => marker.destroy());

      banner(k, STR.round(match.round, match.maxRounds), { sub: STR.firstTo }).then(() => {
        phase = "playing";
        setFrozen(false);
      });
    }

    function onSlapContact(slapper, target) {
      if (phase !== "playing") return;
      if (target.invuln > 0) return; // netom pljesnut — kratko nedodirljiv

      // imun: drži predmet
      if (target.heldObject) {
        floatText(k, target.pos.add(0, -32), STR.invalid, "#40d8d0");
        shieldFlash(k, target);
        if (Math.random() < 0.5) say(k, target, choice(gameTaunts.slapImmune), bubbleUp);
        return;
      }

      // LOVRINA PRAVILA: Lovro ponekad izjavi da ga nisi ni pogodio.
      if (target.character === "lovro" && denialsLeft > 0) {
        const chance =
          match.scores.lovro < match.scores.teta || slaps.lovro < slaps.teta
            ? LOVRO_RULES.denyChanceWhenLosing
            : LOVRO_RULES.denyChance;
        if (Math.random() < chance) {
          denialsLeft--;
          floatText(k, k.vec2(k.width() / 2, 60), STR.lovroRule, "#f8b820");
          say(k, target, choice(gameTaunts.lovroDeny), bubbleUp);
          target.playLocked("twerk", 1); // i još malo zatwerka, da zaboli
          k.wait(0.9, () => {
            if (slapper.exists()) say(k, slapper, choice(gameTaunts.tetaDenyReact), bubbleUp);
          });
          return;
        }
      }

      // vrijedi!
      const id = slapper.character;
      slaps[id]++;
      hud.setSlaps(slaps);
      floatText(k, target.pos.add(0, -32), STR.taps[Math.min(slaps[id], 3) - 1]);
      target.playLocked("ouch", 0.3);
      target.invuln = JDT.hitInvulnTime;
      target.pos.x += slapper.facing * 4;
      k.shake(2);

      if (golden || slaps[id] >= JDT.slapsToWin) {
        endRound(id);
      } else if (Math.random() < 0.35) {
        say(k, slapper, choice(gameTaunts.slapHit), bubbleUp);
      }
    }

    function endRound(winnerId) {
      phase = "roundEnd";
      setFrozen(true);
      match.recordRound(winnerId);
      hud.setRoundWins(match.scores);

      const winner = fighters[winnerId];
      const loser = fighters[otherCharacter(winnerId)];
      say(k, winner, choice(gameTaunts.roundWin), bubbleUp);
      say(k, loser, choice(gameTaunts.roundLose), bubbleUp);
      // pobjednik slavi twerkanjem prema gubitniku, naravno
      winner.facing = Math.sign(winner.pos.x - loser.pos.x) || 1;
      winner.playLocked("twerk", 2.2);
      loser.playLocked("annoyed", 2.2);

      banner(k, STR.roundWin(CHARACTERS[winnerId].title), { duration: 2.2 }).then(() => {
        if (match.advance() === "over") {
          k.go("matchEnd", {
            winner: match.winner(),
            scores: { ...match.scores },
            gameId: "jedanDvaTri",
          });
        } else {
          startRound();
        }
      });
    }

    k.onUpdate(() => {
      const dt = k.dt();
      cpu.update(dt, { pickups });
      pickups.update(dt);

      // pokupi pritiske uvijek (da ne "odstoje"), a djeluj samo u igri
      for (const f of Object.values(fighters)) {
        const wantSlap = f.controller?.consumePress("slap");
        const wantGrab = f.controller?.consumePress("grab");
        if (phase !== "playing" || f.frozen) continue;
        if (wantSlap) trySlap(k, f, { onSlapContact });
        if (wantGrab) pickups.tryGrab(f);
      }

      if (phase !== "playing") return;
      roundElapsed += dt;
      if (!golden) {
        timeLeft -= dt;
        hud.setTime(timeLeft);
        if (timeLeft <= 0) {
          // istek vremena: vodi li netko, pobjeđuje; inače zlatna pljeska
          if (slaps.lovro !== slaps.teta) {
            endRound(slaps.lovro > slaps.teta ? "lovro" : "teta");
          } else {
            golden = true;
            hud.setGolden();
            banner(k, STR.golden, { sub: STR.goldenSub, duration: 1.8 });
          }
        }
      }
    });

    // Lovro povremeno provocira i usred igre — naravno
    k.loop(8, () => {
      if (phase === "playing" && Math.random() < 0.6) {
        say(k, fighters.lovro, choice(gameTaunts.lovroRandom), bubbleUp);
      }
    });

    k.onKeyPress("escape", () => k.go("menu"));

    startRound();
  });
}
