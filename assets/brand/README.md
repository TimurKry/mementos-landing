# Markenzeichen

Die Vorlagen liegen eine Ebene höher, direkt in `assets/`:

| Datei | Was | Maße |
|---|---|---|
| `../mementoos-symbol.svg` | nur das Zeichen — drei Kreise | viewBox `32 34 176 166` |
| `../mementoos-logo.svg` | Zeichen und Wortmarke nebeneinander | 1154 × 250 |

Beide tragen `fill="currentColor"`. Das ist der Grund, warum es nur je eine
Datei gibt: das Zeichen erbt die Textfarbe seines Umfelds — auf dem Pergament
des Lendung dunkel, im Void des Arbeitsbereichs knochenfarben. Mit einem
festen `#000000`, wie die Dateien ursprünglich ankamen, wäre es im
Arbeitsbereich schwarz auf schwarz gewesen.

Das Symbol wurde zusätzlich auf sein Hüllrechteck beschnitten. Vorher stand es
in einem 240er-Quadrat mit 34px Rand oben und 40px unten — bei kleinen Größen
sitzt es damit sichtbar zu hoch.

Die frühere Rekonstruktion (`mementoos-mark.svg`) ist entfernt. Ihre Annahme,
der dritte Kreis sitze nach links versetzt, war falsch: er sitzt **mittig**
unter den beiden oberen.

## Wo das Zeichen benutzt wird

Nicht als Datei, sondern inline: so kostet es keine zusätzliche Anfrage, es
flackert beim Laden nicht, und es folgt der Farbe des Umfelds.

- Lendung: `src/components/icons.tsx` → `Logo()`
- Arbeitsbereich: `mvp/src/components/Logo.tsx` → `Logo()`
- Favicons: `src/app/icon.svg` und `mvp/src/app/icon.svg`
- Vorschaubild: eingebaut in `public/og.png`

Die Favicons sind die eine Ausnahme von `currentColor`: ein Favicon hat kein
Umfeld, von dem es eine Farbe erben könnte, deshalb tragen sie einen eigenen
Grund. Der Lendung Pergament mit dunkler Tinte, der Arbeitsbereich Void mit
knochenfarbenem Zeichen — wer beide Tabs offen hat, und das ist der Normalfall,
findet so den richtigen.

**Wird eine der Vorlagen geändert, müssen die Inline-Fassungen mitwandern.**
Die Geometrie steht an vier Stellen; die Kommentare dort verweisen zurück
hierher.

## Entschieden: die Datei gewinnt

Die Wortmarke in `mementoos-logo.svg` ist **nicht** die Schrift, in der die
Seite gesetzt ist. Die Seite benutzt Instrument Serif 400; die Wortmarke in der
Datei ist breiter, mit offeneren Ovalen und anderem Strichkontrast. Nachgeprüft
durch Gegenüberstellung mit der echten, aus dem Build geladenen Schrift — nicht
nach Augenmaß aus dem Gedächtnis.

Damit gab es zwei Fassungen des Namens: eine in Präsentationen und
Unterschriften, eine auf der Seite. Entscheidung des Eigentümers: **die Datei
gewinnt.** Der Name wird also gezeichnet, nicht gesetzt.

- `src/components/Wordmark.tsx` und `mvp/src/components/Wordmark.tsx` werden
  aus `../mementoos-logo.svg` **erzeugt**, nicht von Hand gepflegt. Zeichen und
  Umriss stehen in einem Block, `currentColor`, eine Fassung für beide Umkreise.
- Preis: rund 8 KB je Bündel. Dafür sieht die Marke überall gleich aus.
- Der Zusatz daneben («Arbeitsbereich», «Zugang», «Plattform») bleibt lebender
  Text — er sagt, wo man ist, und gehört nicht zur Marke.
- Der Abstand zwischen Zeichen und Wort kommt aus der Vorlage. Deshalb steht in
  den Verweisen **kein** eigenes `gap`; sonst stünde er zweimal.

Wird `mementoos-logo.svg` geändert, sind beide `Wordmark.tsx` neu zu erzeugen.
