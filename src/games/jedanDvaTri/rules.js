// Pravila meča — čista logika, bez kaplaya.
//
// Lovrina prava pravila: oboje pljeskaju istovremeno, tko prvi skupi
// 3 pljeske osvaja rundu. Meč: najbolji od 3 runde (prvi do 2).

export function createMatch(cfg) {
  const m = {
    round: 1,
    winsNeeded: cfg.winsNeeded,
    maxRounds: cfg.maxRounds,
    scores: { lovro: 0, teta: 0 },

    recordRound(winnerId) {
      m.scores[winnerId]++;
    },

    // Nakon runde: "nextRound" | "over"
    advance() {
      if (m.scores.lovro >= m.winsNeeded || m.scores.teta >= m.winsNeeded) return "over";
      m.round++;
      return "nextRound";
    },

    winner() {
      return m.scores.lovro > m.scores.teta ? "lovro" : "teta";
    },
  };
  return m;
}
