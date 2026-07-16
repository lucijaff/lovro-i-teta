#!/bin/zsh
# Uključuje GitHub Pages za lucijaff/lovro-i-teta i ispisuje link.
GH=/tmp/claude/gh
REPO=repos/lucijaff/lovro-i-teta/pages

if $GH api -X POST "$REPO" -f "source[branch]=main" -f "source[path]=/"; then
  echo "Pages uključen."
else
  echo "POST nije prošao — provjera postojećeg stanja:"
  $GH api "$REPO" --jq '{status: .status, url: .html_url}'
fi

echo ""
echo "Igra će za ~1 minutu biti na: https://lucijaff.github.io/lovro-i-teta/"
