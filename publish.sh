#!/bin/zsh
# Jednokratno objavljivanje na GitHub (privatni repo + GitHub Pages).
# Pokreni: zsh publish.sh
set -e
cd "$(dirname "$0")"
GH=/tmp/claude/gh

echo "==> 1/5 git repo"
if [ ! -f .git/config ]; then
  rm -rf .git
  git init -b main
fi
git add -A
if ! git rev-parse HEAD >/dev/null 2>&1; then
  git commit -m "Lovro i Teta: retro pixel igre — JEDAN DVA TRI v1

Kolekcija igara koje je izmislio Lovro (9): izbornik s provokacijama,
odabir lika, JEDAN DVA TRI (oboje love tuđu guzu, prvi do 3 pljeske,
Lovrina pravila, twerk provokacije), USKORO za Baba i BUBA!!!, OVCA, BOBA.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
else
  git commit -m "Ažuriranje" || true
fi

echo "==> 2/5 GitHub prijava"
if ! $GH auth status >/dev/null 2>&1; then
  $GH auth login --hostname github.com --web --git-protocol https
fi
LOGIN=$($GH api user --jq .login)
echo "    Prijavljena kao: $LOGIN"

echo "==> 3/5 stvaranje privatnog repozitorija i push"
if ! $GH repo view "$LOGIN/lovro-i-teta" >/dev/null 2>&1; then
  $GH repo create lovro-i-teta --private --source . --push
else
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$LOGIN/lovro-i-teta.git"
  git push -u origin main
fi

echo "==> 4/5 provjera plana (Pages na privatnom repou traži plaćeni plan)"
PLAN=$($GH api user --jq .plan.name)
echo "    Tvoj plan: $PLAN"

echo "==> 5/5 uključivanje GitHub Pages"
if $GH api -X POST "repos/$LOGIN/lovro-i-teta/pages" \
    -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1; then
  echo "    Pages uključen."
else
  echo "    POST nije prošao (možda je već uključen ili plan ne dopušta) — provjera:"
  $GH api "repos/$LOGIN/lovro-i-teta/pages" --jq '{status: .status, url: .html_url}' || {
    echo ""
    echo "    !! Pages se ne može uključiti na PRIVATNOM repou s planom '$PLAN'."
    echo "    !! Opcije: repo učiniti javnim, ili GitHub Pro, ili drugi hosting."
    exit 2
  }
fi

echo ""
echo "GOTOVO! Igra će za ~1 minutu biti na:"
echo "  https://$LOGIN.github.io/lovro-i-teta/"
