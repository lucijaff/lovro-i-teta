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
- **Baba i BUBA!!!** — teta ima muholovku, Lovro glumi bubu i leti
  (skok = zamah krilima, radi i u zraku). Teta pobjeđuje s 3 pljasa;
  Lovro pobjeđuje ako napuni PROVOKACIJU mašući guzom blizu tete
  (S/dolje), ili ako preživi do isteka vremena. Najbolji od 3 runde.
  Lovro ima i BRZI IZMAK (X): nagli let u stranu s trenom nedodirljivosti —
  dobro tempiran izmak pobjeđuje zamah muholovke.
  (U igri se nitko ne zove "baba" ni "buba" — to je samo naziv igre.)
- **OVCA** — Lovro glumi ovcu (bleji, brz je), teta ga pokušava uloviti (X),
  podići iznad glave i baciti dolje. Bacanje bilo gdje = 1 bod, na KREVET
  = 2 boda — ali pretežak je za dugo nošenje, isklizne nakon par sekundi.
  Kad te zgrabi, zgrabila te — nema otimanja. 4 boda za tetinu rundu;
  Lovro pobjeđuje provokacijom (maši guzom uz tetu) ili bijegom do isteka.
  Lovro ima BRZI IZMAK (X): ovčji skok u stranu s trenom nedodirljivosti.
- **BOBA** — hrvanje na VELIKOM krevetu (cijela arena je odskočni madrac!).
  Zgrabi protivnika (X) i baci ga: padne li na gola leđa — bod; padne li
  na jastuk ili deku — ne vrijedi. Bačeni u letu upravlja padom strelicama
  pa se bori doletjeti do jastuka. Jastuci mijenjaju mjesto svaku rundu.
  Prvi do 3 "na leđa"; neriješeno na isteku = ZLATNO BACANJE. I da:
  Lovrina pravila vrijede i ovdje ("NISAM PAO NA LEĐA!").
- **Astuk boba** — teta s VELIKIM jastukom lovi Lovru po sobi (kao Baba i
  BUBA, ali prizemno). Jastuk se sporo zamahuje, ali daleko dohvaća, a
  pogodak lansira Lovru preko sobe — 3 pogotka za tetinu rundu (runda 25s).
  Lovro ima BRZI IZMAK (X) i pobjeđuje provokacijom ili bijegom do isteka.

- **MC Run** — obrnute uloge: Lovro nosi Maksa (našu crnu mačku) visoko
  iznad glave i lovi tetu, koja bježi jer ne voli mačke. Dodir s Maksom =
  ulov (MIJAU!), 3 ulova za Lovrinu rundu; teta pobjeđuje ako preživi 25s
  — i sad ONA ima BRZI IZMAK (X) i više skakanje.

Na izborniku BOBA otvara podizbornik **VRSTA BOBE**: Obična boba ili
Astuk boba.

Psst: ako igraš kao Lovro i utipkaš jednu posebnu riječ... nešto se dogodi.
(U svakoj igri. Lovro će znati koju riječ.)

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
