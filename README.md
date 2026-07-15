# LOVRO I TETA — Lovrine igre

Kolekcija retro piksel-igara koje je izmislio Lovro (9), a u kojima se
Lovro i teta naganjaju, pljeskaju po guzi i živciraju — sad i na ekranu.

## Kako pokrenuti

U terminalu, iz ove mape:

```
python3 -m http.server 8123
```

pa otvori **http://localhost:8123** u pregledniku.
(Ili dvoklik na `start.command`.)

Igra se mora posluživati preko HTTP-a — otvaranje `index.html` izravno iz
Findera neće raditi jer preglednik blokira ES module s `file://`.

## Upravljanje

| Akcija | Tipke |
|---|---|
| Kretanje | strelice ili WASD |
| Skok | gore / W / razmaknica |
| Pljeska | X ili K |
| Uzmi / pusti predmet | C ili L |
| Mahanje guzom (provokacija) | dolje ili S |
| Natrag na izbornik | Esc |

## Igre

- **JEDAN DVA TRI** — oboje istovremeno love tuđu guzu: tko prvi skupi
  **3 pljeske** (bilo kada, ne moraju biti zaredom) osvaja rundu. Pljeska
  vrijedi samo otraga! Tko drži predmet (jastuk, medu, knjigu), njega
  pljeske ne vrijede — ali predmet se raspadne nakon 5 sekundi i usporava
  trčanje. Nakon primljene pljeske kratko si nedodirljiv (treperiš).
  Meč je najbolji od 3 runde; ako je na isteku vremena izjednačeno —
  **ZLATNA PLJESKA**: sljedeća pljeska pobjeđuje.
  - **Lovrina pravila:** kad je Lovro trkač, ponekad jednostavno izjavi
    "NISAM OSJETIO!" i pljeska se poništi. Da, to je namjerno. Takav je Lovro.
- **Baba i BUBA!!!** — uskoro (čekamo pravila od Lovre; da, piše se točno tako)
- **OVCA** — uskoro
- **BOBA** — uskoro

## Kako dodati nove Lovrine izjave

Otvori `src/taunts.js` u bilo kojem uređivaču teksta i dodaj retke —
upute su u samoj datoteci. Spremi i osvježi stranicu.

## Kako dodati novu igru

1. Napravi mapu `src/games/mojaIgra/` s `index.js` koji izvozi
   `{ id, title, ready: true, register(k) }` (pogledaj `jedanDvaTri` kao uzor).
2. Dodaj jedan redak u `src/registry.js`.

Dok igra nema pravila, dovoljan je unos `{ id, title, ready: false }` —
prikazat će se na izborniku s "USKORO!".

## Kako crtati / mijenjati likove

Sva grafika su tekstualne mreže u `src/sprites/` — svako slovo je jedan
piksel, boje su u `palette.js`. Lovro može doslovno crtati slovima. :)

## Tehnika

- [KAPLAY](https://kaplayjs.com) v3001.0.19 (nasljednik Kaboom.js), vendoriran u `lib/`
- Font: Press Start 2P (podržava č ć š ž đ), OFL licenca, u `assets/fonts/`
- Bez builda, bez ovisnosti — čisti ES moduli
- Podešavanje igre (brzine, tajmeri, AI): `src/config.js`

Napravljeno s ljubavlju za Lovru i tetu. 🍑✋
